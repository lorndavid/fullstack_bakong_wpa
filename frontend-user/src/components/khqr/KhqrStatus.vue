<template>
  <div class="bg-surface-50 dark:bg-surface-800/50 rounded-2xl px-5 py-4 text-center border border-surface-100 dark:border-surface-700/30">
    <p class="text-sm font-medium text-surface-500 dark:text-surface-400 flex items-center justify-center gap-2">
      <span class="relative flex w-2.5 h-2.5">
        <span class="animate-ping absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75" />
        <span class="relative inline-flex w-2.5 h-2.5 rounded-full bg-emerald-500" />
      </span>
      <span>Waiting for payment</span>
      <span class="inline-flex text-emerald-500 dark:text-emerald-400 font-bold">
        <span
          v-for="i in 3"
          :key="i"
          class="animate-bounce-dot"
          :style="{ animationDelay: `${(i - 1) * 0.2}s` }"
        >.</span>
      </span>
    </p>
    <p class="text-[11px] text-surface-400 dark:text-surface-500 mt-1.5">
      Please scan the QR code using your banking app
    </p>
  </div>
</template>

<style scoped>
@keyframes bounce-dot {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.3; }
  40% { transform: translateY(-3px); opacity: 1; }
}
.animate-bounce-dot {
  display: inline-block;
  animation: bounce-dot 1.4s ease-in-out infinite;
}
</style>
