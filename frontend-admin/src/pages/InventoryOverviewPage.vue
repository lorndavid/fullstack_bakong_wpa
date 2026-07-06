<template>
  <div class="space-y-6">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="inline-block w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-3 text-sm text-surface-500">{{ $t('common.loading') }}</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white dark:bg-surface-800 rounded-2xl shadow-card p-12 text-center">
      <p class="text-red-500 text-sm mb-3">{{ error }}</p>
      <button @click="fetchOverview" class="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg">{{ $t('common.retry') }}</button>
    </div>

    <template v-else>
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-surface-800 dark:text-white">{{ $t('inventory.overview') }}</h2>
            <p class="text-xs text-surface-400">{{ $t('inventory.overviewDesc') }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-surface-400">{{ lastUpdated }}</span>
          <button @click="fetchOverview" class="p-2 text-surface-300 hover:text-primary-500 transition-colors rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- ─── KPI CARDS ────────────────────────────────────────────── -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <!-- Total Inventory Value -->
        <div class="bg-white dark:bg-surface-800 rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all border-l-4 border-emerald-500">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-medium text-surface-400 uppercase tracking-wider">{{ $t('inventory.totalValue') }}</span>
            <div class="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <p class="text-lg font-bold text-surface-800 dark:text-white">${{ formatNumber(kpis.totalInventoryValue) }}</p>
          <div class="flex items-center gap-1 mt-1">
            <svg class="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            <span class="text-[10px] text-emerald-500 font-medium">{{ kpis.sellThroughRate }} sell-through</span>
          </div>
        </div>

        <!-- Total Products -->
        <div class="bg-white dark:bg-surface-800 rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all border-l-4 border-blue-500">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-medium text-surface-400 uppercase tracking-wider">{{ $t('inventory.totalProducts') }}</span>
            <div class="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
          </div>
          <p class="text-lg font-bold text-surface-800 dark:text-white">{{ formatNumber(kpis.totalProducts) }}</p>
          <p class="text-[10px] text-surface-400 mt-1">Avg price: ${{ formatNumber(kpis.avgPrice) }}</p>
        </div>

        <!-- Available Stock -->
        <div class="bg-white dark:bg-surface-800 rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all border-l-4 border-sky-500">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-medium text-surface-400 uppercase tracking-wider">{{ $t('inventory.availableStock') }}</span>
            <div class="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
          </div>
          <p class="text-lg font-bold text-surface-800 dark:text-white">{{ formatNumber(kpis.availableStock) }}</p>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-[10px] text-surface-400">{{ kpis.lowStock + kpis.outOfStock }} at risk</span>
          </div>
        </div>

        <!-- Reserved Stock -->
        <div class="bg-white dark:bg-surface-800 rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all border-l-4 border-purple-500">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-medium text-surface-400 uppercase tracking-wider">{{ $t('inventory.reservedStock') }}</span>
            <div class="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
          </div>
          <p class="text-lg font-bold text-surface-800 dark:text-white">{{ formatNumber(kpis.reservedStock) }}</p>
          <p class="text-[10px] text-surface-400 mt-1">{{ formatNumber(kpis.incomingStock) }} incoming</p>
        </div>

        <!-- Inventory Turnover -->
        <div class="bg-white dark:bg-surface-800 rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all border-l-4 border-amber-500">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-medium text-surface-400 uppercase tracking-wider">{{ $t('inventory.turnover') }}</span>
            <div class="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </div>
          </div>
          <p class="text-lg font-bold text-surface-800 dark:text-white">{{ kpis.inventoryTurnover }}<span class="text-sm font-normal text-surface-400">x</span></p>
          <p class="text-[10px] text-surface-400 mt-1">{{ $t('inventory.annualized') }}</p>
        </div>

        <!-- Potential Revenue -->
        <div class="bg-white dark:bg-surface-800 rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all border-l-4 border-rose-500">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[11px] font-medium text-surface-400 uppercase tracking-wider">{{ $t('inventory.potentialRevenue') }}</span>
            <div class="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <svg class="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
            </div>
          </div>
          <p class="text-lg font-bold text-surface-800 dark:text-white">${{ formatNumber(kpis.potentialRevenue) }}</p>
          <p class="text-[10px] text-surface-400 mt-1">{{ kpis.inventoryAccuracy }} accuracy</p>
        </div>
      </div>

      <!-- Secondary KPI Row -->
      <div class="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-2">
        <div class="bg-white dark:bg-surface-800 rounded-xl p-3 shadow-card text-center">
          <div class="flex items-center justify-center w-6 h-6 rounded-lg bg-red-100 dark:bg-red-900/30 mx-auto mb-1.5">
            <span class="text-[10px] font-bold text-red-600 dark:text-red-400">{{ kpis.outOfStock }}</span>
          </div>
          <p class="text-[11px] font-semibold text-red-500">{{ $t('inventory.outOfStock') }}</p>
        </div>
        <div class="bg-white dark:bg-surface-800 rounded-xl p-3 shadow-card text-center">
          <div class="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/30 mx-auto mb-1.5">
            <span class="text-[10px] font-bold text-amber-600 dark:text-amber-400">{{ kpis.lowStock }}</span>
          </div>
          <p class="text-[11px] font-semibold text-amber-600 dark:text-amber-400">{{ $t('inventory.lowStock') }}</p>
        </div>
        <div class="bg-white dark:bg-surface-800 rounded-xl p-3 shadow-card text-center">
          <div class="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 mx-auto mb-1.5">
            <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{{ kpis.fastMoving }}</span>
          </div>
          <p class="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{{ $t('inventory.fastMoving') }}</p>
        </div>
        <div class="bg-white dark:bg-surface-800 rounded-xl p-3 shadow-card text-center">
          <div class="flex items-center justify-center w-6 h-6 rounded-lg bg-surface-100 dark:bg-surface-700 mx-auto mb-1.5">
            <span class="text-[10px] font-bold text-surface-500">{{ kpis.deadStock }}</span>
          </div>
          <p class="text-[11px] font-semibold text-surface-500">{{ $t('inventory.deadStock') }}</p>
        </div>
        <div class="bg-white dark:bg-surface-800 rounded-xl p-3 shadow-card text-center">
          <div class="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/30 mx-auto mb-1.5">
            <span class="text-[10px] font-bold text-blue-600 dark:text-blue-400">{{ formatNumber(kpis.avgDailySales) }}</span>
          </div>
          <p class="text-[11px] font-semibold text-blue-600 dark:text-blue-400">{{ $t('inventory.avgDailySales') }}</p>
        </div>
        <div class="bg-white dark:bg-surface-800 rounded-xl p-3 shadow-card text-center">
          <div class="flex items-center justify-center w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/30 mx-auto mb-1.5">
            <span class="text-[10px] font-bold text-purple-600 dark:text-purple-400">{{ kpis.inventoryAccuracy }}</span>
          </div>
          <p class="text-[11px] font-semibold text-purple-600 dark:text-purple-400">{{ $t('inventory.accuracy') }}</p>
        </div>
        <div class="bg-white dark:bg-surface-800 rounded-xl p-3 shadow-card text-center">
          <div class="flex items-center justify-center w-6 h-6 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 mx-auto mb-1.5">
            <span class="text-[10px] font-bold text-cyan-600 dark:text-cyan-400">{{ formatNumber(kpis.totalInventoryCost) }}</span>
          </div>
          <p class="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">{{ $t('inventory.inventoryCost') }}</p>
        </div>
        <div class="bg-white dark:bg-surface-800 rounded-xl p-3 shadow-card text-center">
          <div class="flex items-center justify-center w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-900/30 mx-auto mb-1.5">
            <span class="text-[10px] font-bold text-orange-600 dark:text-orange-400">{{ kpis.sellThroughRate }}</span>
          </div>
          <p class="text-[11px] font-semibold text-orange-600 dark:text-orange-400">{{ $t('inventory.sellThroughRate') }}</p>
        </div>
        <div class="bg-white dark:bg-surface-800 rounded-xl p-3 shadow-card text-center">
          <div class="flex items-center justify-center w-6 h-6 rounded-lg bg-teal-100 dark:bg-teal-900/30 mx-auto mb-1.5">
            <span class="text-[10px] font-bold text-teal-600 dark:text-teal-400">{{ formatNumber(kpis.incomingStock) }}</span>
          </div>
          <p class="text-[11px] font-semibold text-teal-600 dark:text-teal-400">{{ $t('inventory.incomingStock') }}</p>
        </div>
      </div>

      <!-- ─── CHARTS SECTION ─────────────────────────────────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <!-- Line Chart: Inventory Value Trend -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card lg:col-span-2 xl:col-span-1">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-surface-800 dark:text-white">{{ $t('inventory.valueTrend') }}</h3>
            <span class="text-[10px] text-surface-400">{{ $t('inventory.last30Days') }}</span>
          </div>
          <div class="h-48">
            <canvas ref="lineChartRef"></canvas>
          </div>
        </div>

        <!-- Bar Chart: Products Sold Per Day -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-surface-800 dark:text-white">{{ $t('inventory.productsSoldPerDay') }}</h3>
            <span class="text-[10px] text-surface-400">{{ $t('inventory.last30Days') }}</span>
          </div>
          <div class="h-48">
            <canvas ref="barChartRef"></canvas>
          </div>
        </div>

        <!-- Pie Chart: Inventory by Category -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-surface-800 dark:text-white">{{ $t('inventory.byCategory') }}</h3>
            <span class="text-[10px] text-surface-400">{{ kpis.totalProducts }} {{ $t('inventory.products') }}</span>
          </div>
          <div class="h-48 flex items-center justify-center">
            <canvas ref="pieChartRef"></canvas>
          </div>
        </div>

        <!-- Area Chart: Stock Consumption (Heat Map) -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-surface-800 dark:text-white">{{ $t('inventory.stockConsumption') }}</h3>
            <span class="text-[10px] text-surface-400">{{ $t('inventory.byHour') }}</span>
          </div>
          <div class="h-48">
            <canvas ref="areaChartRef"></canvas>
          </div>
        </div>

        <!-- Area Chart: Forecast -->
        <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card lg:col-span-2 xl:col-span-1">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-surface-800 dark:text-white">{{ $t('inventory.forecast') }}</h3>
            <span class="text-[10px] text-surface-400">{{ $t('inventory.next30Days') }}</span>
          </div>
          <div class="h-48">
            <canvas ref="forecastChartRef"></canvas>
          </div>
        </div>
      </div>

      <!-- ─── SMART INSIGHTS ─────────────────────────────────────────── -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-card">
        <div class="flex items-center gap-2.5 mb-4">
          <div class="w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
            <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </div>
          <h3 class="text-sm font-semibold text-surface-800 dark:text-white">{{ $t('inventory.smartInsights') }}</h3>
          <span class="text-[10px] text-surface-400 bg-surface-100 dark:bg-surface-700 px-2 py-0.5 rounded-full">{{ insights.length }} {{ $t('inventory.insights') }}</span>
        </div>

        <div v-if="insights.length === 0" class="text-center py-8 text-surface-400 text-sm">
          {{ $t('inventory.noInsights') }}
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="(insight, index) in insights"
            :key="index"
            class="group relative overflow-hidden rounded-xl p-4 transition-all duration-200 hover:shadow-md cursor-default"
            :class="insightBgClass(insight.type)"
          >
            <!-- Glow effect on hover -->
            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              :class="insightGlowClass(insight.type)">
            </div>
            <div class="relative z-10">
              <div class="flex items-start gap-3">
                <span class="text-xl flex-shrink-0">{{ insight.icon }}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold" :class="insightTextClass(insight.type)">{{ insight.title }}</p>
                  <p class="text-xs mt-1" :class="insightDescClass(insight.type)">{{ insight.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── CATEGORY BREAKDOWN TABLE ──────────────────────────────── -->
      <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-card overflow-hidden">
        <div class="px-5 py-4 border-b border-surface-200 dark:border-surface-700">
          <h3 class="text-sm font-semibold text-surface-800 dark:text-white">{{ $t('inventory.categoryBreakdown') }}</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-surface-50 dark:bg-surface-800/50 border-b border-surface-200 dark:border-surface-700">
                <th class="table-header">{{ $t('categories.name') }}</th>
                <th class="table-header">{{ $t('products.product') }}</th>
                <th class="table-header">{{ $t('products.stock') }}</th>
                <th class="table-header">{{ $t('inventory.totalValue') }}</th>
                <th class="table-header">{{ $t('inventory.share') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-100 dark:divide-surface-700">
              <tr v-for="cat in categoryDistribution" :key="cat.categoryId" class="hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
                <td class="table-cell">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">{{ cat.icon }}</span>
                    <span class="text-sm font-medium text-surface-800 dark:text-white">{{ cat.name }}</span>
                  </div>
                </td>
                <td class="table-cell text-surface-600 dark:text-surface-300">{{ cat.count }}</td>
                <td class="table-cell text-surface-600 dark:text-surface-300">{{ formatNumber(cat.stock) }}</td>
                <td class="table-cell font-medium text-surface-800 dark:text-white">${{ formatNumber(cat.value) }}</td>
                <td class="table-cell">
                  <div class="flex items-center gap-2">
                    <div class="w-24 h-1.5 bg-surface-200 dark:bg-surface-600 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-500" :style="{ width: categoryPercent(cat.value) + '%', background: categoryColor(cat.categoryId) }"></div>
                    </div>
                    <span class="text-xs text-surface-400">{{ categoryPercent(cat.value) }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'

const { t } = useI18n()

// ─── State ────────────────────────────────────────────────────
const loading = ref(true)
const error = ref<string | null>(null)
const lastUpdated = ref('')

interface KPIs {
  totalInventoryValue: number
  totalProducts: number
  availableStock: number
  reservedStock: number
  incomingStock: number
  lowStock: number
  outOfStock: number
  deadStock: number
  fastMoving: number
  inventoryTurnover: number
  sellThroughRate: string
  potentialRevenue: number
  inventoryAccuracy: string
  avgDailySales: number
  totalInventoryCost: number
  avgPrice: number
}

interface Insight {
  type: 'warning' | 'danger' | 'success' | 'info'
  icon: string
  title: string
  description: string
  priority: number
}

interface ChartData {
  date: string
  value?: number
  revenue?: number
  count?: number
  predictedStock?: number
  predictedValue?: number
}

interface CategoryData {
  categoryId: string
  name: string
  icon: string
  count: number
  value: number
  stock: number
}

interface StockConsumption {
  hour: string
  value: number
}

const kpis = ref<KPIs>({
  totalInventoryValue: 0,
  totalProducts: 0,
  availableStock: 0,
  reservedStock: 0,
  incomingStock: 0,
  lowStock: 0,
  outOfStock: 0,
  deadStock: 0,
  fastMoving: 0,
  inventoryTurnover: 0,
  sellThroughRate: '0%',
  potentialRevenue: 0,
  inventoryAccuracy: '98.5%',
  avgDailySales: 0,
  totalInventoryCost: 0,
  avgPrice: 0,
})

const insights = ref<Insight[]>([])
const inventoryValueTrend = ref<ChartData[]>([])
const productsSoldPerDay = ref<ChartData[]>([])
const categoryDistribution = ref<CategoryData[]>([])
const stockConsumption = ref<StockConsumption[]>([])
const forecastData = ref<ChartData[]>([])

// ─── Chart refs ────────────────────────────────────────────────
const lineChartRef = ref<HTMLCanvasElement | null>(null)
const barChartRef = ref<HTMLCanvasElement | null>(null)
const pieChartRef = ref<HTMLCanvasElement | null>(null)
const areaChartRef = ref<HTMLCanvasElement | null>(null)
const forecastChartRef = ref<HTMLCanvasElement | null>(null)

let lineChart: any = null
let barChart: any = null
let pieChart: any = null
let areaChart: any = null
let forecastChart: any = null

// ─── Helper colors ─────────────────────────────────────────────
const categoryColors = [
  '#0055A4', '#00C853', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1',
  '#84CC16', '#D946EF',
]

function categoryColor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i)
    hash |= 0
  }
  return categoryColors[Math.abs(hash) % categoryColors.length]
}

function categoryPercent(value: number): string {
  if (kpis.value.totalInventoryValue === 0) return '0'
  return ((value / kpis.value.totalInventoryValue) * 100).toFixed(1)
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toLocaleString()
}

// ─── Insight styling ──────────────────────────────────────────
function insightBgClass(type: string): string {
  const map: Record<string, string> = {
    danger: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30',
    success: 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30',
    info: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30',
  }
  return map[type] || 'bg-surface-50 dark:bg-surface-700/50 border border-surface-200 dark:border-surface-600'
}

function insightGlowClass(type: string): string {
  const map: Record<string, string> = {
    danger: 'bg-gradient-to-br from-red-500/5 to-transparent',
    warning: 'bg-gradient-to-br from-amber-500/5 to-transparent',
    success: 'bg-gradient-to-br from-emerald-500/5 to-transparent',
    info: 'bg-gradient-to-br from-blue-500/5 to-transparent',
  }
  return map[type] || ''
}

function insightTextClass(type: string): string {
  const map: Record<string, string> = {
    danger: 'text-red-700 dark:text-red-300',
    warning: 'text-amber-700 dark:text-amber-300',
    success: 'text-emerald-700 dark:text-emerald-300',
    info: 'text-blue-700 dark:text-blue-300',
  }
  return map[type] || 'text-surface-700 dark:text-surface-300'
}

function insightDescClass(type: string): string {
  const map: Record<string, string> = {
    danger: 'text-red-600/70 dark:text-red-400/70',
    warning: 'text-amber-600/70 dark:text-amber-400/70',
    success: 'text-emerald-600/70 dark:text-emerald-400/70',
    info: 'text-blue-600/70 dark:text-blue-400/70',
  }
  return map[type] || 'text-surface-500 dark:text-surface-400'
}

// ─── Data fetching ─────────────────────────────────────────────
async function fetchOverview() {
  loading.value = true
  error.value = null
  try {
    const data: any = await api.get('/inventory/overview')
    const ov = data.overview
    kpis.value = ov.kpis
    insights.value = ov.insights || []
    inventoryValueTrend.value = ov.charts?.inventoryValueTrend || []
    productsSoldPerDay.value = ov.charts?.productsSoldPerDay || []
    categoryDistribution.value = ov.charts?.categoryDistribution || []
    stockConsumption.value = ov.charts?.stockConsumption || []
    forecastData.value = ov.charts?.forecast || []
    lastUpdated.value = new Date().toLocaleTimeString()

    await nextTick()
    renderCharts()
  } catch (err: any) {
    error.value = err.message || 'Failed to load inventory overview'
  } finally {
    loading.value = false
  }
}

// ─── Chart rendering ───────────────────────────────────────────
let chartInstances: any[] = []

function destroyCharts() {
  chartInstances.forEach(c => {
    if (c && typeof c.destroy === 'function') c.destroy()
  })
  chartInstances = []
}

async function renderCharts() {
  // Dynamically import Chart.js
  const { Chart, registerables } = await import('chart.js')
  Chart.register(...registerables)

  destroyCharts()

  const isDark = document.documentElement.classList.contains('dark')
  const textColor = isDark ? '#A9B4C8' : '#5C6B89'
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'

  // Line Chart - Inventory Value Trend
  if (lineChartRef.value && inventoryValueTrend.value.length > 0) {
    const ctx = lineChartRef.value.getContext('2d')
    if (ctx) {
      chartInstances.push(new Chart(ctx, {
        type: 'line',
        data: {
          labels: inventoryValueTrend.value.map(d => d.date.slice(5)),
          datasets: [{
            label: 'Inventory Value',
            data: inventoryValueTrend.value.map(d => d.value),
            borderColor: '#0055A4',
            backgroundColor: 'rgba(0, 85, 164, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 4,
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              display: true,
              grid: { display: false },
              ticks: { color: textColor, font: { size: 9 }, maxTicksLimit: 10 },
            },
            y: {
              display: true,
              grid: { color: gridColor },
              ticks: { color: textColor, font: { size: 9 }, callback: (v: any) => '$' + (v / 1000).toFixed(0) + 'K' },
            }
          },
          interaction: { intersect: false, mode: 'index' },
        }
      }))
    }
  }

  // Bar Chart - Products Sold Per Day
  if (barChartRef.value && productsSoldPerDay.value.length > 0) {
    const ctx = barChartRef.value.getContext('2d')
    if (ctx) {
      chartInstances.push(new Chart(ctx, {
        type: 'bar',
        data: {
          labels: productsSoldPerDay.value.map(d => d.date.slice(5)),
          datasets: [{
            label: 'Products Sold',
            data: productsSoldPerDay.value.map(d => d.count),
            backgroundColor: 'rgba(0, 85, 164, 0.6)',
            borderColor: '#0055A4',
            borderWidth: 1,
            borderRadius: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { display: true, grid: { display: false }, ticks: { color: textColor, font: { size: 9 }, maxTicksLimit: 10 } },
            y: { display: true, beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor, font: { size: 9 } } },
          }
        }
      }))
    }
  }

  // Pie Chart - Inventory by Category
  if (pieChartRef.value && categoryDistribution.value.length > 0) {
    const ctx = pieChartRef.value.getContext('2d')
    if (ctx) {
      const colors = categoryDistribution.value.map(c => categoryColor(c.categoryId))
      chartInstances.push(new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: categoryDistribution.value.map(c => c.name),
          datasets: [{
            data: categoryDistribution.value.map(c => c.value),
            backgroundColor: colors,
            borderColor: isDark ? '#1C2438' : '#FFFFFF',
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { color: textColor, font: { size: 9 }, boxWidth: 10, padding: 8 },
            }
          },
          cutout: '55%',
        }
      }))
    }
  }

  // Area Chart - Stock Consumption by Hour
  if (areaChartRef.value && stockConsumption.value.length > 0) {
    const ctx = areaChartRef.value.getContext('2d')
    if (ctx) {
      chartInstances.push(new Chart(ctx, {
        type: 'line',
        data: {
          labels: stockConsumption.value.map(d => d.hour),
          datasets: [{
            label: 'Orders',
            data: stockConsumption.value.map(d => d.value),
            borderColor: '#00C853',
            backgroundColor: 'rgba(0, 200, 83, 0.15)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { display: true, grid: { display: false }, ticks: { color: textColor, font: { size: 8 }, maxTicksLimit: 12 } },
            y: { display: true, beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor, font: { size: 8 } } },
          }
        }
      }))
    }
  }

  // Forecast Chart
  if (forecastChartRef.value && forecastData.value.length > 0) {
    const ctx = forecastChartRef.value.getContext('2d')
    if (ctx) {
      chartInstances.push(new Chart(ctx, {
        type: 'line',
        data: {
          labels: forecastData.value.map(d => d.date.slice(5)),
          datasets: [{
            label: 'Predicted Stock',
            data: forecastData.value.map(d => d.predictedStock),
            borderColor: '#8B5CF6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 1,
            pointHoverRadius: 3,
            borderWidth: 2,
            borderDash: [5, 5],
          }, {
            label: 'Predicted Value',
            data: forecastData.value.map(d => d.predictedValue),
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 1,
            pointHoverRadius: 3,
            borderWidth: 1,
            yAxisID: 'y1',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: { color: textColor, font: { size: 9 }, boxWidth: 10, padding: 8 },
            }
          },
          scales: {
            x: { display: true, grid: { display: false }, ticks: { color: textColor, font: { size: 9 }, maxTicksLimit: 10 } },
            y: { display: true, position: 'left', grid: { color: gridColor }, ticks: { color: textColor, font: { size: 9 } } },
            y1: { display: true, position: 'right', grid: { display: false }, ticks: { color: textColor, font: { size: 9 }, callback: (v: any) => '$' + (v / 1000).toFixed(0) + 'K' } },
          }
        }
      }))
    }
  }
}

// ─── Lifecycle ─────────────────────────────────────────────────
onMounted(() => {
  fetchOverview()
})

// Re-render charts on theme change
const observer = new MutationObserver(() => {
  renderCharts()
})

onMounted(() => {
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})
</script>

<style scoped>
canvas {
  max-width: 100%;
  max-height: 100%;
}
</style>
