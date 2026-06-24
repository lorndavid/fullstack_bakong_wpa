<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-bold text-surface-800 dark:text-white">{{ $t('roles.title') }}</h2>
          <p class="text-xs text-surface-400">Manage admin users and their permissions</p>
        </div>
      </div>
      <button @click="openCreateModal"
        class="px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all flex items-center gap-2 shadow-sm">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
        {{ $t('roles.createAdmin') }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white dark:bg-surface-800 rounded-2xl p-12 shadow-card text-center">
      <div class="w-10 h-10 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
      <p class="text-sm text-surface-500 mt-4">{{ $t('common.loading') }}</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white dark:bg-surface-800 rounded-2xl p-8 shadow-card text-center">
      <p class="text-red-500 text-sm">{{ error }}</p>
      <button @click="fetchAdmins" class="mt-3 px-4 py-2 bg-primary-500 text-white text-sm rounded-lg">{{ $t('common.retry') }}</button>
    </div>

    <!-- Empty -->
    <div v-else-if="admins.length === 0" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-12 text-center">
      <div class="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-surface-700 dark:text-surface-200 mb-1">{{ $t('roles.noRoles') }}</h3>
      <p class="text-sm text-surface-500 mb-4">{{ $t('roles.noRolesDesc') }}</p>
      <button @click="openCreateModal" class="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg">{{ $t('roles.createAdmin') }}</button>
    </div>

    <!-- Admin Cards -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div v-for="admin in admins" :key="admin._id"
        class="bg-white dark:bg-surface-800 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden group border border-surface-100 dark:border-surface-700">
        <!-- Card Header -->
        <div class="p-5 border-b border-surface-100 dark:border-surface-700">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-purple-100 dark:ring-purple-900/50">
              <img v-if="admin.avatar && !avatarErrors[admin._id]" :src="admin.avatar" :alt="admin.name" class="w-full h-full object-cover" @error="avatarErrors[admin._id] = true" />
              <div v-else class="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <span class="text-base font-bold text-white">{{ admin.name?.charAt(0).toUpperCase() }}</span>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <h3 class="text-base font-semibold text-surface-800 dark:text-white truncate">{{ admin.name }}</h3>
                <span class="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-[10px] font-semibold rounded-full uppercase">Admin</span>
              </div>
              <p class="text-sm text-surface-500 truncate">{{ admin.email }}</p>
            </div>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="editPermissions(admin)" class="p-2 text-surface-400 hover:text-primary-500 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors" title="Edit Permissions">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <button @click="confirmDelete(admin)" class="p-2 text-surface-400 hover:text-red-500 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors" title="Delete">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Permissions -->
        <div class="p-5 space-y-2">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('roles.permissions') }}</span>
            <span class="text-xs font-medium" :class="hasFullPermissions(admin) ? 'text-accent-500' : 'text-surface-400'">
              {{ hasFullPermissions(admin) ? $t('roles.fullAccess') : $t('roles.limitedAccess') }}
            </span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <template v-if="hasFullPermissions(admin)">
              <span v-for="perm in permissionDefs" :key="perm.resource"
                class="px-2.5 py-1 bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-400 text-[11px] font-medium rounded-full border border-accent-200 dark:border-accent-900/30">
                {{ perm.label }}
              </span>
            </template>
            <template v-else>
              <span v-for="perm in admin.permissions" :key="perm.resource"
                class="px-2.5 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-[11px] font-medium rounded-full border border-primary-200 dark:border-primary-900/30">
                {{ getPermissionLabel(perm.resource) }}
              </span>
              <span v-if="!admin.permissions || admin.permissions.length === 0" class="text-xs text-surface-400 italic">No specific permissions assigned</span>
            </template>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-5 py-3 bg-surface-50 dark:bg-surface-700/30 border-t border-surface-100 dark:border-surface-700 flex items-center justify-between">
          <span class="text-xs text-surface-400">{{ $t('roles.created') }}: {{ formatDate(admin.createdAt) }}</span>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full" :class="admin.isVerified ? 'bg-accent-500' : 'bg-yellow-500'"></span>
            <span class="text-xs text-surface-500">{{ admin.provider === 'google' ? 'Google' : 'Email' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Admin Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="showCreateModal = false"></div>
      <div class="relative bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-surface-800 dark:text-white">{{ $t('roles.createAdmin') }}</h3>
          </div>
          <button @click="showCreateModal = false" class="p-1.5 text-surface-400 hover:text-surface-600 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <form @submit.prevent="createAdminUser" class="p-6 space-y-5">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('roles.adminName') }}</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              <input v-model="createForm.name" required class="w-full pl-10 pr-4 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500" />
            </div>
          </div>
          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('roles.adminEmail') }}</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              <input v-model="createForm.email" type="email" required class="w-full pl-10 pr-4 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500" />
            </div>
          </div>
          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">{{ $t('roles.adminPassword') }}</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              <input v-model="createForm.password" type="password" required minlength="6" class="w-full pl-10 pr-4 py-2.5 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500" />
            </div>
          </div>

          <!-- Permissions -->
          <div class="border-t border-surface-200 dark:border-surface-700 pt-4">
            <div class="flex items-center justify-between mb-3">
              <label class="text-sm font-medium text-surface-700 dark:text-surface-200">{{ $t('roles.permissions') }}</label>
              <button type="button" @click="toggleAllPermissions" class="text-xs text-primary-500 hover:text-primary-600 font-medium">
                {{ allPermissionsSelected ? $t('roles.deselectAll') : $t('roles.selectAll') }}
              </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label v-for="perm in permissionDefs" :key="perm.resource"
                class="flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all"
                :class="selectedPermissions.includes(perm.resource)
                  ? 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'">
                <input type="checkbox" :checked="selectedPermissions.includes(perm.resource)"
                  @change="togglePermission(perm.resource)"
                  class="w-4 h-4 text-primary-500 rounded focus:ring-primary-500" />
                <div class="flex-1 min-w-0">
                  <span class="text-sm font-medium text-surface-700 dark:text-surface-200 block truncate">{{ perm.label }}</span>
                  <span class="text-xs text-surface-400 truncate">{{ perm.description }}</span>
                </div>
              </label>
            </div>
          </div>

          <div v-if="createError" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg">{{ createError }}</div>

          <div class="flex gap-3 pt-2">
            <button type="button" @click="showCreateModal = false" class="flex-1 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 rounded-xl text-sm font-medium hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
              {{ $t('common.cancel') }}
            </button>
            <button type="submit" :disabled="creating" class="flex-1 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-sm font-medium hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 transition-all shadow-sm">
              {{ creating ? $t('common.saving') : $t('roles.createAdmin') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Permissions Modal -->
    <div v-if="editingAdmin" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="editingAdmin = null"></div>
      <div class="relative bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">
        <div class="px-6 py-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full overflow-hidden bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
              <span class="text-sm font-bold text-purple-600 dark:text-purple-400">{{ editingAdmin.name?.charAt(0).toUpperCase() }}</span>
            </div>
            <div>
              <h3 class="text-lg font-bold text-surface-800 dark:text-white">{{ $t('roles.editAdmin') }}</h3>
              <p class="text-xs text-surface-400">{{ editingAdmin.name }} · {{ editingAdmin.email }}</p>
            </div>
          </div>
          <button @click="editingAdmin = null" class="p-1.5 text-surface-400 hover:text-surface-600 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <form @submit.prevent="savePermissions" class="p-6 space-y-4">
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-200">{{ $t('roles.permissions') }}</label>
            <div class="flex items-center gap-2">
              <span class="text-xs text-surface-400">{{ $t('roles.access') }}:</span>
              <button type="button" @click="editAllPermissions = !editAllPermissions"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                :class="editAllPermissions ? 'bg-primary-500' : 'bg-surface-300 dark:bg-surface-600'">
                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" :class="editAllPermissions ? 'translate-x-6' : 'translate-x-1'"></span>
              </button>
              <span class="text-xs font-medium" :class="editAllPermissions ? 'text-accent-500' : 'text-surface-400'">{{ editAllPermissions ? $t('roles.fullAccess') : $t('roles.limitedAccess') }}</span>
            </div>
          </div>

          <div v-if="!editAllPermissions" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label v-for="perm in permissionDefs" :key="perm.resource"
              class="flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all"
              :class="editPermsList.includes(perm.resource)
                ? 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20'
                : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'">
              <input type="checkbox" :checked="editPermsList.includes(perm.resource)"
                @change="toggleEditPermission(perm.resource)"
                class="w-4 h-4 text-primary-500 rounded focus:ring-primary-500" />
              <div class="flex-1 min-w-0">
                <span class="text-sm font-medium text-surface-700 dark:text-surface-200 block truncate">{{ perm.label }}</span>
                <span class="text-xs text-surface-400 truncate">{{ perm.description }}</span>
              </div>
            </label>
          </div>
          <div v-else class="p-4 bg-accent-50 dark:bg-accent-900/20 rounded-xl text-center">
            <svg class="w-8 h-8 mx-auto text-accent-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            <p class="text-sm text-accent-700 dark:text-accent-400 font-medium">{{ $t('roles.fullAccess') }}</p>
            <p class="text-xs text-accent-500 mt-1">{{ $t('roles.selectAll') }}</p>
          </div>

          <div v-if="permError" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg">{{ permError }}</div>

          <div class="flex gap-3 pt-2">
            <button type="button" @click="editingAdmin = null" class="flex-1 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 rounded-xl text-sm font-medium hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
              {{ $t('common.cancel') }}
            </button>
            <button type="submit" :disabled="savingPerms" class="flex-1 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-sm font-medium hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 transition-all shadow-sm">
              {{ savingPerms ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div v-if="deletingAdmin" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="deletingAdmin = null"></div>
      <div class="relative bg-white dark:bg-surface-800 rounded-2xl shadow-xl w-full max-w-sm p-6 animate-scale-in text-center">
        <div class="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
        </div>
        <h3 class="text-lg font-bold text-surface-800 dark:text-white mb-2">{{ $t('roles.deleteTitle') }}</h3>
        <p class="text-sm text-surface-500 mb-6" v-html="$t('roles.deleteDesc', { name: deletingAdmin.name })"></p>
        <div class="flex gap-3">
          <button @click="deletingAdmin = null" class="flex-1 py-2.5 border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 rounded-lg text-sm font-medium hover:bg-surface-50">{{ $t('common.cancel') }}</button>
          <button @click="deleteAdmin" :disabled="deleting" class="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50">{{ deleting ? $t('common.deleting') : $t('common.delete') }}</button>
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <div v-if="successMsg" class="fixed bottom-6 right-6 z-50 bg-accent-500 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-up flex items-center gap-2">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
      {{ successMsg }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

interface AdminUser {
  _id: string
  name: string
  email: string
  avatar?: string
  role: string
  provider: string
  isVerified: boolean
  permissions?: { resource: string; actions: string[] }[]
  createdAt: string
}

interface PermissionDef {
  resource: string
  label: string
  description: string
}

const admins = ref<AdminUser[]>([])
const permissionDefs = ref<PermissionDef[]>([])
const loading = ref(true)
const error = ref('')
const avatarErrors = ref<Record<string, boolean>>({})

// Create Admin
const showCreateModal = ref(false)
const createForm = ref({ name: '', email: '', password: '' })
const selectedPermissions = ref<string[]>([])
const creating = ref(false)
const createError = ref('')

// Edit Permissions
const editingAdmin = ref<AdminUser | null>(null)
const editPermsList = ref<string[]>([])
const editAllPermissions = ref(false)
const savingPerms = ref(false)
const permError = ref('')

// Delete
const deletingAdmin = ref<AdminUser | null>(null)
const deleting = ref(false)

// Success toast
const successMsg = ref('')

const allPermissionsSelected = ref(false)

onMounted(async () => {
  await Promise.all([fetchAdmins(), fetchPermissions()])
})

async function fetchAdmins() {
  loading.value = true
  error.value = ''
  try {
    const data: any = await api.get('/users?limit=100')
    admins.value = (data.users || []).filter((u: AdminUser) => u.role === 'admin')
  } catch (err: any) {
    error.value = err?.message || 'Failed to load admins'
  } finally {
    loading.value = false
  }
}

async function fetchPermissions() {
  try {
    const data: any = await api.get('/users/permissions/list')
    permissionDefs.value = data.permissions || []
    allPermissionsSelected.value = false
  } catch (err) {
    console.error('Failed to fetch permissions:', err)
  }
}

function openCreateModal() {
  createForm.value = { name: '', email: '', password: '' }
  selectedPermissions.value = []
  createError.value = ''
  allPermissionsSelected.value = false
  showCreateModal.value = true
}

function togglePermission(resource: string) {
  if (selectedPermissions.value.includes(resource)) {
    selectedPermissions.value = selectedPermissions.value.filter(r => r !== resource)
  } else {
    selectedPermissions.value.push(resource)
  }
  allPermissionsSelected.value = selectedPermissions.value.length === permissionDefs.value.length
}

function toggleAllPermissions() {
  if (allPermissionsSelected.value) {
    selectedPermissions.value = []
    allPermissionsSelected.value = false
  } else {
    selectedPermissions.value = permissionDefs.value.map(p => p.resource)
    allPermissionsSelected.value = true
  }
}

async function createAdminUser() {
  if (!createForm.value.name || !createForm.value.email || !createForm.value.password) {
    createError.value = 'All fields are required'
    return
  }
  creating.value = true
  createError.value = ''
  try {
    await api.post('/users/create-admin', {
      ...createForm.value,
      permissions: selectedPermissions.value.map(r => ({ resource: r, actions: ['read', 'write'] })),
    })
    showCreateModal.value = false
    successMsg.value = 'Admin created successfully'
    setTimeout(() => { successMsg.value = '' }, 3000)
    await fetchAdmins()
  } catch (err: any) {
    createError.value = err.message || 'Failed to create admin'
  } finally {
    creating.value = false
  }
}

function editPermissions(admin: AdminUser) {
  editingAdmin.value = admin
  if (admin.permissions && admin.permissions.length > 0) {
    editPermsList.value = admin.permissions.map(p => p.resource)
    editAllPermissions.value = false
  } else {
    const allPerms = permissionDefs.value.map(p => p.resource)
    editPermsList.value = [...allPerms]
    editAllPermissions.value = true
  }
  permError.value = ''
}

function toggleEditPermission(resource: string) {
  if (editPermsList.value.includes(resource)) {
    editPermsList.value = editPermsList.value.filter(r => r !== resource)
  } else {
    editPermsList.value.push(resource)
  }
}

async function savePermissions() {
  if (!editingAdmin.value) return
  savingPerms.value = true
  permError.value = ''
  try {
    const perms = editAllPermissions.value
      ? permissionDefs.value.map(p => ({ resource: p.resource, actions: ['read', 'write'] }))
      : editPermsList.value.map((r: string) => ({ resource: r, actions: ['read', 'write'] }))

    await api.put(`/users/${editingAdmin.value._id}`, { permissions: perms })
    editingAdmin.value = null
    successMsg.value = 'Permissions updated successfully'
    setTimeout(() => { successMsg.value = '' }, 3000)
    await fetchAdmins()
  } catch (err: any) {
    permError.value = err.message || 'Failed to save permissions'
  } finally {
    savingPerms.value = false
  }
}

function confirmDelete(admin: AdminUser) {
  deletingAdmin.value = admin
}

async function deleteAdmin() {
  if (!deletingAdmin.value) return
  deleting.value = true
  try {
    await api.delete(`/users/${deletingAdmin.value._id}`)
    deletingAdmin.value = null
    await fetchAdmins()
  } catch {
    // Handle error
  } finally {
    deleting.value = false
  }
}

function hasFullPermissions(admin: AdminUser): boolean {
  if (!admin.permissions || admin.permissions.length === 0) return true
  return admin.permissions.length >= permissionDefs.value.length
}

function getPermissionLabel(resource: string): string {
  const perm = permissionDefs.value.find(p => p.resource === resource)
  return perm?.label || resource
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>
