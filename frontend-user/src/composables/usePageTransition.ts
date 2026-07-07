import { ref } from 'vue'
import { useRouter } from 'vue-router'

export type TransitionName = 'slide-left' | 'slide-right' | 'fade' | 'slide-up' | 'scale'

export function usePageTransition() {
  const router = useRouter()
  const transitionName = ref<TransitionName>('slide-left')

  // Map route names to transition directions
  const forwardRoutes = ['home', 'categories', 'search', 'cart', 'profile']
  const detailRoutes = ['product-detail', 'order-detail', 'coupon-detail', 'payment']

  router.beforeEach((to, from) => {
    if (!from || !from.name) {
      transitionName.value = 'fade'
      return
    }

    const toName = typeof to.name === 'string' ? to.name : ''
    const fromName = typeof from.name === 'string' ? from.name : ''

    // Detail pages slide in from right
    if (detailRoutes.includes(toName)) {
      transitionName.value = 'slide-left'
    } else if (detailRoutes.includes(fromName)) {
      transitionName.value = 'slide-right'
    } else if (forwardRoutes.includes(toName)) {
      transitionName.value = 'slide-left'
    } else {
      transitionName.value = 'fade'
    }
  })

  // Get the transition CSS classes based on the computed name
  function getTransitionClasses(name: TransitionName) {
    const classes: Record<TransitionName, { enter: string; leave: string }> = {
      'slide-left': {
        enter: 'page-slide-left-enter',
        leave: 'page-slide-left-leave',
      },
      'slide-right': {
        enter: 'page-slide-right-enter',
        leave: 'page-slide-right-leave',
      },
      fade: {
        enter: 'page-fade-enter',
        leave: 'page-fade-leave',
      },
      'slide-up': {
        enter: 'page-slide-up-enter',
        leave: 'page-slide-up-leave',
      },
      scale: {
        enter: 'page-scale-enter',
        leave: 'page-scale-leave',
      },
    }
    return classes[name]
  }

  return {
    transitionName,
    getTransitionClasses,
  }
}
