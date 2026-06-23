<template>
  <div class="space-y-4">
    <h2 class="text-xl font-bold text-surface-800 dark:text-white">{{ $t('users.title') }}</h2>

    <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('users.user') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('users.email') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('users.role') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('users.orders') }}</th>
              <th class="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('users.joined') }}</th>
              <th class="text-right px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-100 dark:divide-surface-700">
            <tr v-for="i in 10" :key="i" class="hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center">
                    <span class="text-sm font-bold text-primary-600 dark:text-primary-400">U</span>
                  </div>
                  <span class="text-sm font-medium text-surface-800 dark:text-white">{{ $t('users.user') }} {{ i }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-sm text-surface-600 dark:text-surface-300">user{{ i }}@example.com</td>
              <td class="px-4 py-3">
                <span class="px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="i === 1 ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-300'">
                  {{ i === 1 ? $t('users.admin') : $t('users.customer') }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-surface-600 dark:text-surface-300">{{ i * 3 }}</td>
              <td class="px-4 py-3 text-sm text-surface-500">Dec {{ i }}, 2023</td>
              <td class="px-4 py-3 text-right">
                <button class="p-1.5 text-surface-400 hover:text-red-500 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
