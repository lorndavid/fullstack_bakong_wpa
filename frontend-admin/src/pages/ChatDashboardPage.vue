<template>
  <div class="h-[calc(100vh-7rem)] flex gap-4">
    <!-- Stats Bar -->
    <div class="flex items-center gap-4 mb-4 absolute top-0 left-0 right-0">
      <div class="flex items-center gap-6 px-6 py-3 bg-white dark:bg-surface-800 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 w-full">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-green-500"></span>            <span class="text-sm font-medium text-surface-600 dark:text-surface-300">{{ chat.stats?.active || 0 }} {{ $t('chat.stats.active') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-amber-500"></span>            <span class="text-sm font-medium text-surface-600 dark:text-surface-300">{{ chat.stats?.waiting || 0 }} {{ $t('chat.stats.waiting') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-surface-400"></span>            <span class="text-sm font-medium text-surface-600 dark:text-surface-300">{{ chat.stats?.closed || 0 }} {{ $t('chat.stats.closed') }}</span>
        </div>
        <div class="flex items-center gap-2 ml-auto">
          <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <span class="text-sm text-surface-500">{{ chat.stats?.messagesToday || 0 }} {{ $t('chat.stats.messagesToday') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span :class="chat.connected ? 'text-green-500' : 'text-red-500'" class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full" :class="chat.connected ? 'bg-green-500' : 'bg-red-500'"></span>
            <span class="text-xs text-surface-500">{{ chat.connected ? $t('chat.stats.connected') : $t('chat.stats.disconnected') }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Conversation List -->
    <div class="w-80 flex-shrink-0 bg-white dark:bg-surface-800 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 flex flex-col overflow-hidden mt-16">
      <!-- Filters -->
      <div class="p-3 border-b border-surface-200 dark:border-surface-700 space-y-2">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            v-model="chat.searchQuery"
            type="text"
            :placeholder="$t('chat.filters.searchPlaceholder')"
            class="w-full pl-9 pr-3 py-2 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-lg text-sm text-surface-800 dark:text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
        </div>
        <div class="flex gap-1">
          <button
            v-for="status in statusFilters"
            :key="status.value"
            @click="chat.filterStatus = status.value; chat.loadConversations()"
            class="flex-1 py-1.5 text-xs font-medium rounded-lg transition-all"
            :class="chat.filterStatus === status.value
              ? 'bg-primary-500 text-white shadow-sm'
              : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700'"
          >
            {{ $t(status.label) }}
          </button>
        </div>
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="chat.loading" class="flex items-center justify-center py-12">
          <div class="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
        </div>

        <div v-else-if="chat.filteredConversations.length === 0" class="text-center py-12">
          <svg class="w-12 h-12 mx-auto text-surface-300 dark:text-surface-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
          </svg>
          <p class="text-sm text-surface-500">{{ $t('chat.empty.noConversations') }}</p>
        </div>

        <div v-else class="divide-y divide-surface-100 dark:divide-surface-700">
          <button
            v-for="conv in chat.filteredConversations"
            :key="conv._id"
            @click="chat.selectConversation(conv)"
            class="w-full px-4 py-3 text-left hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors"
            :class="{
              'bg-primary-50/50 dark:bg-primary-900/10': chat.selectedConversation?._id === conv._id,
              'border-l-2 border-primary-500': chat.selectedConversation?._id === conv._id
            }"
          >
            <div class="flex items-start gap-3">
              <!-- Avatar -->
              <div class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-surface-100 dark:bg-surface-700">
                <img v-if="conv.userAvatar" :src="conv.userAvatar" :alt="conv.userName" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <span class="text-sm font-bold text-primary-500">{{ conv.userName.charAt(0).toUpperCase() }}</span>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm font-semibold text-surface-800 dark:text-white truncate">{{ conv.userName }}</span>
                  <span class="text-[10px] text-surface-400 flex-shrink-0">{{ formatTime(conv.lastMessageAt || conv.createdAt) }}</span>
                </div>
                <p class="text-xs text-surface-500 truncate mt-0.5">{{ conv.lastMessage || $t('chat.empty.noMessagesYet') }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <!-- Status badge -->
                  <span
                    class="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    :class="{
                      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400': conv.status === 'active',
                      'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400': conv.status === 'waiting',
                      'bg-surface-100 dark:bg-surface-700 text-surface-400': conv.status === 'closed',
                    }"
                  >
                    {{ $t('chat.stats.' + conv.status) }}
                  </span>
                  <!-- Assigned to -->
                  <span v-if="conv.assignedTo" class="text-[10px] text-primary-500 truncate">
                    {{ conv.assignedTo.adminName }}
                  </span>
                </div>
              </div>
              <!-- Unread badge -->
              <span
                v-if="conv.unreadCount > 0"
                class="flex-shrink-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center mt-1"
              >
                {{ conv.unreadCount > 9 ? '9+' : conv.unreadCount }}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Chat Window -->
    <div class="flex-1 bg-white dark:bg-surface-800 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 flex flex-col overflow-hidden mt-16">
      <!-- No conversation selected -->
      <div v-if="!chat.selectedConversation" class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <div class="w-20 h-20 mx-auto mb-4 bg-surface-50 dark:bg-surface-700 rounded-full flex items-center justify-center">
            <svg class="w-10 h-10 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>              <h3 class="text-lg font-semibold text-surface-600 dark:text-surface-300">{{ $t('chat.empty.selectConversation') }}</h3>
          <p class="text-sm text-surface-400 mt-1">{{ $t('chat.empty.selectConversationDesc') }}</p>
        </div>
      </div>

      <!-- Active conversation -->
      <template v-else>
        <!-- Chat Header -->
        <div class="px-4 py-3 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-surface-100 dark:bg-surface-700">
              <img v-if="chat.selectedConversation.userAvatar" :src="chat.selectedConversation.userAvatar" :alt="chat.selectedConversation.userName" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center">
                <span class="text-sm font-bold text-primary-500">{{ chat.selectedConversation.userName.charAt(0).toUpperCase() }}</span>
              </div>
            </div>
            <div>
              <h3 class="text-sm font-bold text-surface-800 dark:text-white">{{ chat.selectedConversation.userName }}</h3>
              <p class="text-xs text-surface-400">{{ chat.selectedConversation.userEmail }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <!-- Assigned badge (shows who's assisting) -->
            <span v-if="chat.selectedConversation.assignedTo" class="px-2.5 py-1 text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-500 rounded-lg">
              {{ chat.selectedConversation.assignedTo.adminName }}
            </span>
            <!-- Close button -->
            <button
              v-if="chat.selectedConversation.status !== 'closed'"
              @click="closeWithConfirm"
              class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              {{ $t('chat.actions.close') }}
            </button>
            <span v-else class="px-2.5 py-1 text-xs font-medium text-surface-400 bg-surface-50 dark:bg-surface-700 rounded-lg">{{ $t('chat.actions.closed') }}</span>
          </div>
        </div>

        <!-- Messages -->
        <div
          ref="messagesContainer"
          class="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-50/50 dark:bg-surface-900/50"
        >
          <div v-if="chat.messagesLoading" class="flex items-center justify-center py-8">
            <div class="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
          </div>

          <div
            v-for="msg in chat.messages"
            :key="msg._id"
            class="flex"
            :class="msg.sender === 'admin' ? 'justify-end' : 'justify-start'"
          >
            <!-- System message -->
            <div v-if="msg.messageType === 'system'" class="w-full text-center">
              <span class="inline-block px-3 py-1.5 text-xs text-surface-400 bg-surface-100 dark:bg-surface-700/50 rounded-full">
                {{ msg.content }}
              </span>
            </div>

            <!-- Regular message -->
            <div
              v-else
              class="max-w-[70%]"
              :class="msg.sender === 'admin'
                ? 'bg-primary-500 text-white rounded-2xl rounded-tr-md'
                : 'bg-white dark:bg-surface-700 text-surface-800 dark:text-surface-100 rounded-2xl rounded-tl-md shadow-sm border border-surface-200 dark:border-surface-600'"
            >
              <div v-if="msg.sender !== 'admin'" class="px-3 pt-2 pb-0">
                <span class="text-[11px] font-semibold text-primary-500 dark:text-primary-400">{{ msg.senderName }}</span>
              </div>

              <div v-if="msg.messageType === 'file'" class="p-3">
                <a
                  :href="msg.fileUrl"
                  target="_blank"
                  class="flex items-center gap-2"
                  :class="msg.sender === 'admin' ? 'text-white/90 hover:text-white' : 'text-primary-500 hover:text-primary-600'"
                >
                  <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>                    <span class="text-sm font-medium truncate">{{ msg.fileName || $t('chat.downloadFile') }}</span>
                </a>
              </div>

              <div v-else class="px-3 py-2">
                <p class="text-sm whitespace-pre-wrap break-words">{{ msg.content }}</p>
              </div>

              <div class="px-3 pb-1.5 text-right">
                <span class="text-[10px]" :class="msg.sender === 'admin' ? 'text-white/60' : 'text-surface-400'">
                  {{ formatTime(msg.createdAt) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Typing indicator -->
          <div v-if="chat.isTyping" class="flex items-start gap-2">
            <div class="bg-white dark:bg-surface-700 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-surface-200 dark:border-surface-600">
              <div class="flex gap-1">
                <span class="w-2 h-2 bg-surface-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                <span class="w-2 h-2 bg-surface-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                <span class="w-2 h-2 bg-surface-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
              </div>
            </div>
          </div>

          <div ref="scrollAnchor"></div>
        </div>

        <!-- Input Area -->
        <div class="border-t border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-3 flex-shrink-0">
          <div class="flex items-end gap-2">
            <div class="flex-1 relative">
              <textarea
                ref="textInput"
                v-model="messageText"
                :placeholder="$t('chat.inputPlaceholder')"
                rows="1"
                :disabled="chat.selectedConversation.status === 'closed'"
                class="w-full px-3 py-2 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-xl text-sm text-surface-800 dark:text-surface-100 placeholder-surface-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all disabled:opacity-50"
                @input="autoResize"
                @keydown.enter.exact="handleSend"
              ></textarea>
            </div>
            <button
              @click="handleSend"
              :disabled="!messageText.trim() || chat.selectedConversation.status === 'closed'"
              class="p-2.5 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              :class="messageText.trim()
                ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm active:scale-95'
                : 'text-surface-400'"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
              </svg>
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Close confirmation modal -->
    <Transition name="modal">
      <div v-if="showCloseModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showCloseModal = false"></div>
        <div class="relative w-full max-w-sm bg-white dark:bg-surface-800 rounded-2xl shadow-2xl overflow-hidden animate-modal-pop">
          <div class="p-6 text-center">
            <div class="w-14 h-14 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-surface-800 dark:text-white mb-1.5">{{ $t('chat.closeModal.title') }}</h3>
            <p class="text-sm text-surface-500 dark:text-surface-400">{{ $t('chat.closeModal.description') }}</p>
          </div>
          <div class="flex gap-3 p-4 pt-0">
            <button @click="showCloseModal = false"
              class="flex-1 h-11 rounded-xl border border-surface-200 dark:border-surface-600 text-surface-700 dark:text-surface-200 font-semibold text-sm hover:bg-surface-50 dark:hover:bg-surface-700 active:scale-[0.98] transition-all">
              {{ $t('chat.closeModal.cancel') }}
            </button>
            <button @click="confirmClose"
              class="flex-1 h-11 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(239,68,68,0.3)]">
              {{ $t('chat.closeModal.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useChatStore } from '@/stores/chat'

const chat = useChatStore()
const messagesContainer = ref<HTMLElement | null>(null)
const scrollAnchor = ref<HTMLElement | null>(null)
const textInput = ref<HTMLTextAreaElement | null>(null)
const messageText = ref('')
const showCloseModal = ref(false)

const statusFilters = [
  { label: 'chat.filters.all', value: 'all' },
  { label: 'chat.filters.active', value: 'active' },
  { label: 'chat.filters.waiting', value: 'waiting' },
  { label: 'chat.filters.closed', value: 'closed' },
]

// ─── Auto-scroll ─────────────────────────────────────────────
function scrollToBottom(smooth = true) {
  nextTick(() => {
    if (scrollAnchor.value) {
      scrollAnchor.value.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
    }
  })
}

watch(() => chat.messages.length, () => scrollToBottom())
watch(() => chat.isTyping, () => scrollToBottom())
watch(() => chat.selectedConversation, () => {
  if (chat.selectedConversation) {
    nextTick(() => scrollToBottom(false))
  }
})

// ─── Auto-resize ──────────────────────────────────────────────
function autoResize() {
  const el = textInput.value
  if (el) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }
}

// ─── Send message ─────────────────────────────────────────────
function handleSend(e?: Event) {
  if (e) e.preventDefault()
  if (!messageText.value.trim()) return
  if (chat.selectedConversation?.status === 'closed') return

  chat.sendMessage(messageText.value.trim())
  messageText.value = ''
  if (textInput.value) {
    textInput.value.style.height = 'auto'
  }
}

// ─── Close conversation ──────────────────────────────────────
function closeWithConfirm() {
  showCloseModal.value = true
}

function confirmClose() {
  if (chat.selectedConversation) {
    chat.closeConversation(chat.selectedConversation._id)
  }
  showCloseModal.value = false
}

// ─── Format time ─────────────────────────────────────────────
function formatTime(dateStr?: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

// ─── Lifecycle ───────────────────────────────────────────────
onMounted(() => {
  chat.connect()
  chat.loadConversations()
  chat.loadStats()

  // Refresh conversations periodically
  interval = setInterval(() => {
    chat.loadConversations()
    chat.loadStats()
  }, 15000)
})

onUnmounted(() => {
  chat.disconnect()
  if (interval) clearInterval(interval)
})

let interval: ReturnType<typeof setInterval>
</script>

<style scoped>
.modal-enter-active { transition: opacity 0.25s ease; }
.modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from,
.modal-leave-to { opacity: 0; }

.animate-modal-pop {
  animation: modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes modalPop {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}
.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: #4b5563;
}
</style>
