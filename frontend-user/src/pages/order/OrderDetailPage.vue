<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
    <router-link to="/orders" class="inline-flex items-center text-sm text-primary-500 hover:text-primary-600 mb-4">
      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      Back to Orders
    </router-link>

    <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 sm:p-6 shadow-card space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-surface-800 dark:text-white">Order #ABC12345</h1>
          <p class="text-sm text-surface-500">Placed on {{ new Date().toLocaleDateString() }}</p>
        </div>
        <span class="px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-semibold">Confirmed</span>
      </div>

      <!-- Status Timeline -->
      <div class="space-y-3">
        <div v-for="(step, idx) in timeline" :key="idx" class="flex items-start gap-3">
          <div class="flex flex-col items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center"
              :class="step.done ? 'bg-accent-500' : 'bg-surface-200 dark:bg-surface-700'">
              <svg v-if="step.done" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
              <div v-else class="w-2 h-2 bg-surface-400 rounded-full"></div>
            </div>
            <div v-if="idx < timeline.length - 1" class="w-0.5 h-8 bg-surface-200 dark:bg-surface-700"></div>
          </div>
          <div class="pt-1.5">
            <p class="text-sm font-medium" :class="step.done ? 'text-surface-800 dark:text-white' : 'text-surface-400'">{{ step.label }}</p>
            <p v-if="step.done" class="text-xs text-surface-500 mt-0.5">{{ step.time }}</p>
          </div>
        </div>
      </div>

      <!-- Order Items -->
      <div>
        <h3 class="font-semibold text-surface-800 dark:text-white mb-3">Order Items</h3>
        <div v-for="i in 2" :key="i" class="flex items-center gap-3 py-2 border-b border-surface-100 dark:border-surface-700 last:border-0">
          <div class="w-14 h-14 bg-surface-100 dark:bg-surface-700 rounded-lg flex-shrink-0"></div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-surface-800 dark:text-white truncate">Product {{ i }}</p>
            <p class="text-xs text-surface-500">Qty: {{ i }}</p>
          </div>
          <p class="text-sm font-semibold">${{ (19.99 * i).toFixed(2) }}</p>
        </div>
      </div>

      <!-- Address & Payment -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h3 class="font-semibold text-surface-800 dark:text-white mb-2">Shipping Address</h3>
          <p class="text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
            John Doe<br/>
            +855 12 345 678<br/>
            123 Street, Phnom Penh, 12000
          </p>
        </div>
        <div>
          <h3 class="font-semibold text-surface-800 dark:text-white mb-2">Payment</h3>
          <p class="text-sm text-surface-600 dark:text-surface-300">KHQR Payment</p>
          <p class="text-sm text-surface-600 dark:text-surface-300">Status: Paid</p>
        </div>
      </div>

      <!-- Summary -->
      <div class="border-t border-surface-200 dark:border-surface-700 pt-4 space-y-2 text-sm">
        <div class="flex justify-between"><span class="text-surface-500">Subtotal</span><span>$39.98</span></div>
        <div class="flex justify-between"><span class="text-surface-500">Shipping</span><span class="text-accent-500">FREE</span></div>
        <hr class="border-surface-200 dark:border-surface-700" />
        <div class="flex justify-between font-bold text-base"><span>Total</span><span class="text-primary-500">$39.98</span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const timeline = [
  { label: 'Order Placed', done: true, time: '10:30 AM, Jan 15, 2024' },
  { label: 'Order Confirmed', done: true, time: '10:35 AM, Jan 15, 2024' },
  { label: 'Out for Delivery', done: false },
  { label: 'Delivered', done: false },
]
</script>
