#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# deploy.sh — Production Backend Deployment Script
# ═══════════════════════════════════════════════════════════════
#
# Architecture:
#   ┌─────────────┐     ┌──────────────┐     ┌─────────────┐
#   │ GitHub       │────▶│ Debian VM     │────▶│ PM2         │
#   │ Actions      │ SSH  │ deploy.sh     │     │ (zero-downtime)│
#   └─────────────┘     └──────────────┘     └─────────────┘
#
# Usage:
#   ./deploy.sh           — Normal deployment
#   ./deploy.sh --rollback — Rollback to previous release
#   ./deploy.sh --status   — Show current deployment status
#
# Features:
#   ✓ Zero-downtime PM2 reload
#   ✓ Automatic rollback on failure
#   ✓ Timestamped deployment logs
#   ✓ Health check after deployment
#   ✓ Release versioning (releases/v1, releases/v2, ...)
#   ✓ Keeps last 5 releases for quick rollback
#
# Directory structure created:
#   backend/
#   ├── releases/
#   │   ├── v1/          — Previous deployment
#   │   ├── v2/          — Current deployment (symlinked)
#   │   └── ...
#   ├── current -> releases/v2   — Symlink to active release
#   ├── deploy.log       — Deployment log
#   └── deploy.sh        — This script
# ═══════════════════════════════════════════════════════════════

set -euo pipefail
# set -e:  Exit on any error (no silent failures)
# set -u:  Treat unset vars as errors
# set -o pipefail:  Pipeline fails if ANY command fails
# These three lines are the "unofficial bash strict mode" — every
# professional script should use them.

# ─── Configuration ────────────────────────────────────────────
# ── Resolve script directory even through symlinks ──────
# readlink -f resolves the real path if $0 is a symlink
SCRIPT_DIR="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
RELEASES_DIR="$BACKEND_DIR/releases"
CURRENT_LINK="$BACKEND_DIR/current"
DEPLOY_LOG="$BACKEND_DIR/deploy.log"
MAX_RELEASES=5                      # Keep last 5 releases
# ── Health check: use PORT from .env, fallback to 5000 ───
# Try to read PORT from .env if available, otherwise use 5000
ENV_PORT=$(grep -oP '^PORT=\K[0-9]+' "$BACKEND_DIR/.env" 2>/dev/null || echo "5000")
HEALTH_CHECK_URL="http://127.0.0.1:${ENV_PORT}/api/health"
HEALTH_CHECK_RETRIES=10
HEALTH_CHECK_INTERVAL=3
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
TIMESTAMP_FILE=$(date '+%Y%m%d_%H%M%S')
COMMIT_HASH=$(cd "$PROJECT_DIR" && git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# ─── Colors for output ────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ─── Logging Functions ────────────────────────────────────────
log() {
    local level="$1"
    local message="$2"
    local color="$NC"

    case "$level" in
        INFO)  color="$BLUE" ;;
        OK)    color="$GREEN" ;;
        WARN)  color="$YELLOW" ;;
        ERROR) color="$RED" ;;
    esac

    echo -e "${color}[${level}]${NC} ${message}"
    echo "[${TIMESTAMP}] [${level}] ${message}" >> "$DEPLOY_LOG"
}

log_section() {
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "  $1"
    echo "═══════════════════════════════════════════════════════"
}

# ─── Prerequisite Checks ──────────────────────────────────────
check_prerequisites() {
    local missing=0

    command -v node    >/dev/null 2>&1 || { log ERROR "node is not installed"; missing=1; }
    command -v npm     >/dev/null 2>&1 || { log ERROR "npm is not installed"; missing=1; }
    command -v pm2     >/dev/null 2>&1 || { log ERROR "pm2 is not installed"; missing=1; }
    command -v git     >/dev/null 2>&1 || { log ERROR "git is not installed"; missing=1; }

    if [ ! -f "$BACKEND_DIR/package.json" ]; then
        log ERROR "package.json not found in $BACKEND_DIR"
        missing=1
    fi

    if [ $missing -ne 0 ]; then
        log ERROR "Missing prerequisites. Aborting."
        exit 1
    fi

    log OK "All prerequisites satisfied"
}

# ─── Setup Release Directory ──────────────────────────────────
setup_release() {
    mkdir -p "$RELEASES_DIR"

    # Find the next release number
    local last_release=$(ls -1 "$RELEASES_DIR" 2>/dev/null | \
                         grep -E '^v[0-9]+$' | \
                         sed 's/^v//' | \
                         sort -n | \
                         tail -1)
    local next_num=1
    if [ -n "$last_release" ]; then
        next_num=$((last_release + 1))
    fi

    RELEASE_NAME="v${next_num}"
    RELEASE_DIR="$RELEASES_DIR/$RELEASE_NAME"

    log INFO "Creating release: $RELEASE_NAME"
    mkdir -p "$RELEASE_DIR"
}

# ─── Copy Source Files (excluding node_modules, etc.) ─────────
copy_source() {
    log INFO "Copying source files to release directory..."

    # Using rsync if available (faster, supports --exclude)
    if command -v rsync >/dev/null 2>&1; then
        rsync -a --delete \
            --exclude='node_modules' \
            --exclude='.git' \
            --exclude='releases' \
            --exclude='current' \
            --exclude='*.log' \
            "$BACKEND_DIR/" "$RELEASE_DIR/"
    else
        # Fallback: cp with find
        mkdir -p "$RELEASE_DIR/src"
        mkdir -p "$RELEASE_DIR/dist"
        cp "$BACKEND_DIR/package.json" "$RELEASE_DIR/"
        cp "$BACKEND_DIR/package-lock.json" "$RELEASE_DIR/" 2>/dev/null || true
        cp -r "$BACKEND_DIR/src" "$RELEASE_DIR/" 2>/dev/null || true
        cp -r "$BACKEND_DIR/dist" "$RELEASE_DIR/" 2>/dev/null || true
        cp "$BACKEND_DIR/tsconfig.json" "$RELEASE_DIR/" 2>/dev/null || true
        cp "$BACKEND_DIR/.env" "$RELEASE_DIR/" 2>/dev/null || true
    fi

    log OK "Source copied to $RELEASE_DIR"
}

# ─── Install Dependencies ─────────────────────────────────────
install_dependencies() {
    log INFO "Installing dependencies (including devDependencies for build)..."
    cd "$RELEASE_DIR"
    # ── Try npm ci first (deterministic, uses lockfile) ──
    # We install ALL deps (including dev) because TypeScript is a
    # devDependency and needed for the build step.
    if npm ci 2>&1; then
      log OK "Dependencies installed via npm ci"
    else
      log WARN "npm ci failed, falling back to npm install..."
      if npm install 2>&1; then
        log OK "Dependencies installed via npm install"
      else
        log ERROR "Dependency installation failed entirely"
        return 1
      fi
    fi
    # ── Clean up: install build deps but remove devDeps from production runtime ──
    # Uncomment to keep release lean:
    # npm prune --omit=dev 2>&1 || true
    log OK "Dependencies installed"
}

# ─── Build ────────────────────────────────────────────────────
build_project() {
    log INFO "Building TypeScript..."
    cd "$RELEASE_DIR"
    npm run build 2>&1 || {
        log ERROR "Build failed"
        return 1
    }
    log OK "Build completed"
}

# ─── Switch Symlink (Atomic) ─────────────────────────────────
switch_symlink() {
    log INFO "Switching symlink to new release..."

    # Atomic symlink swap using temporary symlink
    # This prevents a brief window where the symlink doesn't exist
    local temp_link="${CURRENT_LINK}.tmp"
    ln -sfn "$RELEASE_DIR" "$temp_link"
    mv -Tf "$temp_link" "$CURRENT_LINK"
    # mv -Tf is atomic on Linux — the symlink is either old or new,
    # never missing or partial.

    log OK "Symlink switched: current -> $RELEASE_NAME"
}

# ─── PM2 Reload (Zero Downtime) ──────────────────────────────
pm2_reload() {
    log INFO "Reloading PM2 process..."

    ECOSYSTEM_FILE="$BACKEND_DIR/ecosystem.config.js"

    if pm2 describe myshop-backend >/dev/null 2>&1; then
        # ⚠️ CRITICAL: Use process NAME, NOT the ecosystem file!
        #
        # Using `pm2 gracefulReload "$ECOSYSTEM_FILE"` compares the
        # config's script path with PM2's stored value. Since the
        # ecosystem uses a symlink (./current/dist/server.js), PM2
        # stores the SYMLINK path — which doesn't change between
        # releases. PM2 sees "no change" and SKIPS the restart.
        #
        # Using `pm2 gracefulReload myshop-backend` tells PM2 to
        # directly restart the named process, regardless of config
        # comparison. The --update-env forces re-reading .env.
        pm2 gracefulReload myshop-backend --update-env 2>&1 || {
            log WARN "gracefulReload failed, trying hard restart..."
            pm2 restart myshop-backend --update-env 2>&1
        }
    else
        log WARN "PM2 process not found. Starting new instance..."
        pm2 start "$ECOSYSTEM_FILE" --update-env 2>&1
    fi

    pm2 save
    log OK "PM2 reloaded"
}

# ─── PM2 Verification (confirm new code is running) ───────────
pm2_verify() {
    log INFO "Verifying PM2 is running the new release..."

    # Check that the process exists
    if ! pm2 describe myshop-backend >/dev/null 2>&1; then
        log ERROR "PM2 process 'myshop-backend' not found after reload!"
        return 1
    fi

    # Get the actual script path PM2 is using
    # PM2 show output format: │ script path │ /path/to/file │
    # We extract the 3rd field using │ as delimiter, then trim whitespace
    local pm2_script_path
    pm2_script_path=$(pm2 show myshop-backend 2>/dev/null | \
      grep 'script path' | head -1 | \
      awk -F'│' '{print $3}' | xargs)

    if [ -z "$pm2_script_path" ]; then
        log WARN "Could not determine PM2 script path — skipping verification"
        return 0
    fi

    log INFO "PM2 script path: $pm2_script_path"
    log INFO "Expected release: $RELEASE_DIR/dist/server.js"

    # Verify the path points to our new release
    if echo "$pm2_script_path" | grep -q "$RELEASE_NAME"; then
        log OK "✅ PM2 is running from release $RELEASE_NAME"
        return 0
    fi

    # Path doesn't mention the release name — do a deeper check:
    # resolve symlinks and compare physical paths
    local resolved_script
    resolved_script=$(readlink -f "$pm2_script_path" 2>/dev/null || echo "")
    local expected_script="$RELEASE_DIR/dist/server.js"
    local resolved_expected
    resolved_expected=$(readlink -f "$expected_script" 2>/dev/null || echo "$expected_script")

    if [ "$resolved_script" = "$resolved_expected" ]; then
        log OK "✅ PM2 is running from the correct release (verified by physical path)"
        return 0
    fi

    log WARN "⚠️ PM2 may not be running the new release!"
    log WARN "   Running:  $pm2_script_path"
    log WARN "   Expected: $expected_script"
    log WARN "   Attempting forced restart..."

    # Force restart by deleting and re-starting the process
    pm2 delete myshop-backend 2>/dev/null || true
    pm2 start "$ECOSYSTEM_FILE" --update-env 2>&1 || {
        log ERROR "Forced restart failed!"
        return 1
    }
    pm2 save

    log OK "Forced restart completed"
    return 0
}

# ─── Health Check ─────────────────────────────────────────────
health_check() {
    log INFO "Running health check ($HEALTH_CHECK_RETRIES retries)..."

    for i in $(seq 1 $HEALTH_CHECK_RETRIES); do
        local http_code
        http_code=$(curl -s -o /dev/null -w "%{http_code}" \
            "$HEALTH_CHECK_URL" 2>/dev/null || echo "000")

        if [ "$http_code" = "200" ]; then
            log OK "Health check passed (attempt $i/$HEALTH_CHECK_RETRIES)"
            return 0
        fi

        log INFO "Health check attempt $i/$HEALTH_CHECK_RETRIES returned $http_code"
        sleep $HEALTH_CHECK_INTERVAL
    done

    log ERROR "Health check failed after $HEALTH_CHECK_RETRIES attempts"
    return 1
}

# ─── Cleanup Old Releases ─────────────────────────────────────
cleanup_old_releases() {
    log INFO "Cleaning up old releases..."

    # Use find + sort to safely iterate; || true prevents set -e failure when no releases exist
    ls -1t "$RELEASES_DIR"/v* 2>/dev/null | tail -n +$((MAX_RELEASES + 1)) | while read -r old_release; do
        if [ -n "$old_release" ] && [ -d "$old_release" ]; then
            log INFO "Removing old release: $(basename "$old_release")"
            rm -rf "$old_release"
        fi
    done || true

    log OK "Cleanup completed (keeping last $MAX_RELEASES releases)"
}

# ─── Rollback ─────────────────────────────────────────────────
rollback() {
    log_section "ROLLBACK"

    # Find previous release
    local current_release
    if [ -L "$CURRENT_LINK" ]; then
        current_release=$(readlink "$CURRENT_LINK")
        current_release=$(basename "$current_release")
    fi

    # Get the previous release (sorted by version number)
    local previous_release
    previous_release=$(ls -1 "$RELEASES_DIR"/v* 2>/dev/null | \
                       grep -v "$current_release" | \
                       sort -V | \
                       tail -1)

    if [ -z "$previous_release" ]; then
        log ERROR "No previous release found for rollback"
        exit 1
    fi

    local prev_name=$(basename "$previous_release")
    log INFO "Rolling back from $current_release to $prev_name"

    # Switch symlink
    local temp_link="${CURRENT_LINK}.tmp"
    ln -sfn "$previous_release" "$temp_link"
    mv -Tf "$temp_link" "$CURRENT_LINK"

    # Reload PM2
    if pm2 describe myshop-backend >/dev/null 2>&1; then
        pm2 gracefulReload myshop-backend --update-env 2>&1 || \
        pm2 restart myshop-backend --update-env 2>&1
    else
        pm2 start "$CURRENT_LINK/dist/server.js" \
            --name "myshop-backend" --update-env 2>&1
    fi

    pm2 save

    # Health check after rollback
    health_check && log OK "Rollback completed successfully" || {
        log ERROR "Rollback health check failed — manual intervention required!"
        exit 1
    }
}

# ─── Show Deployment Status ──────────────────────────────────
show_status() {
    log_section "DEPLOYMENT STATUS"

    echo "Project:      Bakong E-commerce Backend"
    echo "Server:       $(hostname)"
    echo "User:         $(whoami)"
    echo ""

    if [ -L "$CURRENT_LINK" ]; then
        local current=$(readlink "$CURRENT_LINK")
        echo "Current Release: $(basename "$current")"
        echo "Release Path:    $current"
        echo "Node Version:    $(node --version)"
        echo "PM2 Status:"
        pm2 describe myshop-backend 2>/dev/null || echo "  Not running"
    else
        echo "No active deployment found"
    fi

    echo ""
    echo "Available Releases:"
    ls -1 "$RELEASES_DIR"/v* 2>/dev/null | while read -r release; do
        local mark=" "
        if [ -L "$CURRENT_LINK" ] && [ "$(readlink "$CURRENT_LINK")" = "$release" ]; then
            mark="→"
        fi
        echo "  $mark $(basename "$release")"
    done
    echo ""
    echo "Log:           $DEPLOY_LOG"
}

# ═══════════════════════════════════════════════════════════════
# MAIN EXECUTION
# ═══════════════════════════════════════════════════════════════

# ─── Handle flags ─────────────────────────────────────────────
case "${1:-}" in
    --rollback|-r)
        rollback
        exit 0
        ;;
    --status|-s)
        show_status
        exit 0
        ;;
    --help|-h)
        echo "Usage: ./deploy.sh [OPTION]"
        echo ""
        echo "Options:"
        echo "  --rollback, -r    Rollback to previous release"
        echo "  --status, -s      Show deployment status"
        echo "  --help, -h        Show this help"
        echo ""
        echo "Without options, performs a full deployment."
        exit 0
        ;;
esac

# ─── Full Deployment ──────────────────────────────────────────
log_section "BACKEND DEPLOYMENT"
log INFO "Deployment started at $TIMESTAMP"
log INFO "Commit: $COMMIT_HASH"

# 1. Check that everything we need is installed
check_prerequisites

# 2. Create release directory
setup_release

# 3. Copy source files (without node_modules)
copy_source

# 4. Install production dependencies
install_dependencies

# 5. Build TypeScript
build_project || {
    log ERROR "Build failed — aborting deployment"
    log INFO "Removing incomplete release $RELEASE_NAME"
    rm -rf "$RELEASE_DIR"
    exit 1
}

# 6. Copy .env file (symlink-safe approach: copy to release dir)
if [ -f "$BACKEND_DIR/.env" ]; then
    cp "$BACKEND_DIR/.env" "$RELEASE_DIR/"
    log INFO "Copied .env to release"
fi

# 7. Switch symlink atomically
switch_symlink

# 8. Reload PM2 (zero-downtime)
pm2_reload

# 8a. Verify PM2 is running the new release
pm2_verify || {
    log ERROR "PM2 verification failed — rolling back"
    rollback
    exit 1
}

# 9. Health check
health_check || {
    log ERROR "Deployment health check failed — rolling back"
    rollback
    exit 1
}

# 10. Cleanup old releases
cleanup_old_releases

# ─── Done ─────────────────────────────────────────────────────
log_section "DEPLOYMENT COMPLETE"
log OK "Release:    $RELEASE_NAME"
log OK "Commit:     $COMMIT_HASH"
# Safe duration calculation — wrap in subshell to avoid set -e failures
DURATION_SECS=$(expr $(date +%s) - $(date -d "$TIMESTAMP" +%s) 2>/dev/null || echo "?")
log OK "Duration:   ${DURATION_SECS} seconds"
log OK "Status:     ✅ SUCCESS"
