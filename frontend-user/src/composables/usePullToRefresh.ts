import { ref, onMounted, onUnmounted, type Ref } from 'vue'

interface PullToRefreshOptions {
  element?: Ref<HTMLElement | null>
  onRefresh: () => Promise<void>
  pullThreshold?: number
}

export function usePullToRefresh(options: PullToRefreshOptions) {
  const { onRefresh, pullThreshold = 80 } = options

  const isPulling = ref(false)
  const isRefreshing = ref(false)
  const pullDistance = ref(0)

  let startY = 0
  let currentY = 0
  let isDragging = false
  let container: HTMLElement | Window | null = null

  function getElement(): HTMLElement | Window {
    return options.element?.value || window
  }

  function getScrollTop(): number {
    if (container instanceof Window) {
      return window.scrollY || window.pageYOffset
    }
    return (container as HTMLElement)?.scrollTop || 0
  }

  function handleTouchStart(e: TouchEvent) {
    if (isRefreshing.value) return
    // Only enable pull-to-refresh at the top of the page
    if (getScrollTop() > 0) return

    startY = e.touches[0].clientY
    isDragging = true
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isDragging || isRefreshing.value) return

    currentY = e.touches[0].clientY
    const diff = currentY - startY

    if (diff > 0 && getScrollTop() <= 0) {
      // Apply resistance
      const distance = Math.min(diff * 0.4, 120)
      pullDistance.value = distance
      isPulling.value = true
    }
  }

  async function handleTouchEnd() {
    if (!isDragging) return
    isDragging = false
    isPulling.value = false

    if (pullDistance.value >= pullThreshold) {
      isRefreshing.value = true
      pullDistance.value = 60 // Show spinner position
      try {
        await onRefresh()
      } finally {
        isRefreshing.value = false
        pullDistance.value = 0
      }
    } else {
      pullDistance.value = 0
    }
  }

  onMounted(() => {
    container = getElement()
    if (container) {
      container.addEventListener('touchstart', handleTouchStart as any, { passive: true })
      container.addEventListener('touchmove', handleTouchMove as any, { passive: true })
      container.addEventListener('touchend', handleTouchEnd as any, { passive: true })
    }
  })

  onUnmounted(() => {
    if (container) {
      container.removeEventListener('touchstart', handleTouchStart as any)
      container.removeEventListener('touchmove', handleTouchMove as any)
      container.removeEventListener('touchend', handleTouchEnd as any)
    }
  })

  return {
    isPulling: isPulling,
    isRefreshing: isRefreshing,
    pullDistance: pullDistance,
  }
}
