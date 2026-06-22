<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-surface-800 dark:text-white">Orders</h2>
      <div class="flex gap-2">
        <select class="px-3 py-2 border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-800 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50">
          <option>All Status</option>
          <option>Pending</option>
          <option>Confirmed</option>
          <option>Shipping</option>
          <option>Delivered</option>
          <option>Cancelled</option>
        </select>
      </div>
    </div>

    <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Order ID</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Customer</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Items</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Total</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Payment</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Date</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100 dark:divide-surface-700">
            <tr v-for="i in 10" :key="i" class="hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
              <td class="px-4 py-3 font-mono text-sm text-primary-500">#ABC{{ 1000 + i }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-surface-100 dark:bg-surface-700 rounded-full flex items-center justify-center">
                    <span class="text-xs font-bold text-surface-500">U</span>
                  </div>
                  <span class="text-sm text-surface-800 dark:text-white">User {{ i }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-surface-600 dark:text-surface-300">{{ i + 1 }} items</td>
              <td class="px-4 py-3 text-sm font-medium text-surface-800 dark:text-white">${{ (19.99 + i * 10).toFixed(2) }}</td>
              <td class="px-4 py-3 text-sm text-surface-600 dark:text-surface-300">{{ i % 2 === 0 ? 'KHQR' : 'COD' }}</td>
              <td class="px-4 py-3">
                <select class="px-2 py-1 rounded-lg text-xs font-medium border focus:outline-none"
                  :class="statusClass(i)">
                  <option>pending</option>
                  <option>confirmed</option>
                  <option>shipping</option>
                  <option>delivered</option>
                  <option>cancelled</option>
                </select>
              </td>
              <td class="px-4 py-3 text-sm text-surface-500">Jan {{ 15 + i }}, 2024</td>
              <td class="px-4 py-3 text-right">
                <button class="p-1.5 text-surface-400 hover:text-primary-500 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
function statusClass(i: number) {
  const statuses = ['bg-yellow-100 text-yellow-700 border-yellow-300', 'bg-blue-100 text-blue-700 border-blue-300', 'bg-purple-100 text-purple-700 border-purple-300', 'bg-green-100 text-green-700 border-green-300', 'bg-red-100 text-red-700 border-red-300']
  return statuses[i % statuses.length]
}
</script>
