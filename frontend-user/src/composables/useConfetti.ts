import confetti from 'canvas-confetti'

export function useConfetti() {
  /**
   * Fire a burst of confetti from the center-top of the screen.
   * Colors are drawn from a vibrant palette.
   */
  function fireConfetti(options?: { duration?: number; particleCount?: number }) {
    const duration = options?.duration ?? 1500
    const animationEnd = Date.now() + duration
    const defaults = {
      startVelocity: 35,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
      particleCount: options?.particleCount ?? 80,
      colors: [
        '#6366F1', // Indigo
        '#8B5CF6', // Violet
        '#EC4899', // Pink
        '#F59E0B', // Amber
        '#10B981', // Emerald
        '#3B82F6', // Blue
        '#EF4444', // Red
        '#14B8A6', // Teal
      ],
    }

    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      
      // Fire from both left and right sides
      confetti({
        ...defaults,
        particleCount: Math.floor(particleCount / 2),
        origin: { x: 0.15, y: 0.3 },
        angle: 60,
        spread: 55,
      })
      confetti({
        ...defaults,
        particleCount: Math.floor(particleCount / 2),
        origin: { x: 0.85, y: 0.3 },
        angle: 120,
        spread: 55,
      })
    }, 250)
  }

  /**
   * Fire a big celebratory burst from the center
   */
  function fireCelebration() {
    const defaults = {
      spread: 360,
      ticks: 100,
      zIndex: 9999,
      colors: [
        '#6366F1',
        '#8B5CF6',
        '#EC4899',
        '#F59E0B',
        '#10B981',
        '#3B82F6',
        '#EF4444',
        '#14B8A6',
        '#F97316',
        '#A855F7',
      ],
    }

    // Big center burst
    confetti({
      ...defaults,
      particleCount: 120,
      origin: { x: 0.5, y: 0.4 },
      startVelocity: 45,
      spread: 70,
    })

    // Secondary burst slightly delayed
    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: 60,
        origin: { x: 0.5, y: 0.4 },
        startVelocity: 30,
        spread: 120,
      })
    }, 150)

    // Side bursts
    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: 40,
        origin: { x: 0.2, y: 0.5 },
        angle: 60,
        spread: 50,
      })
      confetti({
        ...defaults,
        particleCount: 40,
        origin: { x: 0.8, y: 0.5 },
        angle: 120,
        spread: 50,
      })
    }, 300)
  }

  return { fireConfetti, fireCelebration }
}
