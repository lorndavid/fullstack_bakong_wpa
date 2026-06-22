<template>
  <div class="space-y-4">
    <h2 class="text-xl font-bold text-surface-800 dark:text-white">Transactions</h2>

    <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Transaction</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Order</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Amount</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Method</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100 dark:divide-surface-700">
            <tr v-for="i in 10" :key="i" class="hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
              <td class="px-4 py-3 font-mono text-sm text-surface-800 dark:text-white">TXN{{ 10000 + i }}</td>
              <td class="px-4 py-3 font-mono text-sm text-primary-500">#ABC{{ 1000 + i }}</td>
              <td class="px-4 py-3 text-sm font-medium text-surface-800 dark:text-white">${{ (19.99 + i * 10).toFixed(2) }}</td>
              <td class="px-4 py-3 text-sm text-surface-600 dark:text-surface-300">{{ i % 2 === 0 ? 'KHQR' : 'COD' }}</td>
              <td class="px-4 py-3">
                <span class="px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="i % 3 === 0 
                    ? 'bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400' 
                    : i % 3 === 1 
                      ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'">
                  {{ i % 3 === 0 ? 'PAID' : i % 3 === 1 ? 'Pending' : 'Expired' }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-surface-500">Jan {{ 15 + i }}, 2024</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
