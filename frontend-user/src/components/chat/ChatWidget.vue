<template>
  <div>
    <!-- Floating Chat Button -->
    <button
      v-if="!chat.isOpen"
      @click="chat.toggleOpen()"
      class="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 flex items-center justify-center group"
      :class="{ 'animate-bounce-in': !chat.isOpen }"
    >
      <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>

      <!-- Unread badge -->
      <span
        v-if="chat.unreadCount > 0"
        class="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md animate-scale-in"
      >
        {{ chat.unreadCount > 9 ? '9+' : chat.unreadCount }}
      </span>

      <!-- Pulse ring -->
      <span class="absolute inset-0 rounded-full animate-ping opacity-20 bg-primary-500"></span>
    </button>

    <!-- Chat Window -->
    <Transition name="chat-slide">
      <div
        v-if="chat.isOpen"
        class="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 flex flex-col overflow-hidden animate-slide-up"
        :class="{ 'h-[60px]': chat.isMinimized }"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white cursor-pointer flex-shrink-0"
          @click="chat.toggleMinimize()"
        >
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-bold">{{ $t('chat.liveChat') }}</h3>
              <p class="text-[11px] text-white/80">
                {{ chat.conversation?.status === 'closed' ? $t('chat.status.closed') : chat.connected ? $t('chat.status.online') : $t('chat.status.connecting') }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button
              @click.stop="chat.toggleMinimize()"
              class="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg v-if="!chat.isMinimized" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 14H4"/>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </button>
            <button
              @click.stop="chat.toggleOpen()"
              class="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Body (hidden when minimized) -->
        <template v-if="!chat.isMinimized">
          <!-- Status Banner -->
          <div
            v-if="chat.conversation?.status === 'waiting'"
            class="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-900/30 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400"
          >
            <svg class="w-4 h-4 flex-shrink-0 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>{{ $t('chat.waitingBanner') }}</span>
          </div>

          <div
            v-if="chat.conversation?.status === 'closed'"
            class="px-4 py-2 bg-surface-50 dark:bg-surface-700/50 border-b border-surface-200 dark:border-surface-700 flex items-center gap-2 text-xs text-surface-500"
          >
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>{{ $t('chat.closedBanner') }}</span>
          </div>

          <!-- Messages -->
          <div
            ref="messagesContainer"
            class="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-50/50 dark:bg-surface-900/50"
          >
            <!-- Loading -->
            <div v-if="chat.loading" class="flex items-center justify-center py-8">
              <div class="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
            </div>

            <!-- Empty state -->
            <div v-else-if="chat.messages.length === 0" class="text-center py-8">
              <div class="w-16 h-16 mx-auto mb-3 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </div>
              <p class="text-sm font-medium text-surface-600 dark:text-surface-300">{{ $t('chat.welcome') }}</p>
              <p class="text-xs text-surface-400 mt-1">{{ $t('chat.welcomeSubtitle') }}</p>
            </div>

            <!-- Messages -->
            <div
              v-for="msg in chat.messages"
              :key="msg._id"
              class="flex"
              :class="msg.sender === 'user' ? 'justify-end' : 'justify-start'"
            >
              <!-- System message -->
              <div
                v-if="msg.messageType === 'system'"
                class="w-full text-center"
              >
                <span class="inline-block px-3 py-1.5 text-xs text-surface-400 bg-surface-100 dark:bg-surface-700/50 rounded-full">
                  {{ msg.content }}
                </span>
              </div>

              <!-- Regular message -->
              <div
                v-else
                class="max-w-[80%]"
                :class="msg.sender === 'user'
                  ? 'bg-primary-500 text-white rounded-2xl rounded-tr-md'
                  : 'bg-white dark:bg-surface-700 text-surface-800 dark:text-surface-100 rounded-2xl rounded-tl-md shadow-sm border border-surface-200 dark:border-surface-600'"
              >
                <!-- Sender name (for non-user messages) -->
                <div v-if="msg.sender !== 'user'" class="px-3 pt-2 pb-0">
                  <span class="text-[11px] font-semibold text-primary-500 dark:text-primary-400">{{ msg.senderName }}</span>
                </div>

                <!-- File message -->
                <div v-if="msg.messageType === 'file'" class="p-3">
                  <a
                    :href="msg.fileUrl"
                    target="_blank"
                    class="flex items-center gap-2"
                    :class="msg.sender === 'user' ? 'text-white/90 hover:text-white' : 'text-primary-500 hover:text-primary-600'"
                  >
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <span class="text-sm font-medium truncate">{{ msg.fileName || $t('chat.downloadFile') }}</span>
                  </a>
                </div>

                <!-- Text message -->
                <div v-else class="px-3 py-2">
                  <p class="text-sm whitespace-pre-wrap break-words">{{ msg.content }}</p>
                </div>

                <!-- Timestamp -->
                <div class="px-3 pb-1.5 text-right">
                  <span
                    class="text-[10px]"
                    :class="msg.sender === 'user' ? 'text-white/60' : 'text-surface-400'"
                  >
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
            <!-- File preview -->
            <div v-if="filePreview" class="mb-2 flex items-center gap-2 px-3 py-2 bg-surface-50 dark:bg-surface-700/50 rounded-lg">
              <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span class="text-sm text-surface-600 dark:text-surface-300 flex-1 truncate">{{ filePreview.name }}</span>
              <button @click="filePreview = null" class="text-surface-400 hover:text-red-500 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="flex items-end gap-2">
              <!-- File upload button -->
              <label class="p-2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors cursor-pointer">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                </svg>
                <input type="file" accept="image/*,.pdf,.doc,.docx,.txt,.zip" class="hidden" @change="handleFileSelect" />
              </label>

              <!-- Emoji picker -->
              <EmojiPicker @select="insertEmoji" />

              <!-- Text input -->
              <div class="flex-1 relative">
                <textarea
                  ref="textInput"
                  v-model="messageText"
                  :placeholder="$t('chat.inputPlaceholder')"
                  rows="1"
                  class="w-full px-3 py-2 bg-surface-50 dark:bg-surface-700 border border-surface-200 dark:border-surface-600 rounded-xl text-sm text-surface-800 dark:text-surface-100 placeholder-surface-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  @input="autoResize"
                  @keydown.enter.exact="handleSend"
                ></textarea>
              </div>

              <!-- Send button -->
              <button
                @click="handleSend"
                :disabled="(!messageText.trim() && !filePreview) || chat.conversation?.status === 'closed'"
                class="p-2.5 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                :class="messageText.trim() || filePreview
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
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import EmojiPicker from './EmojiPicker.vue'

const chat = useChatStore()
const messagesContainer = ref<HTMLElement | null>(null)
const scrollAnchor = ref<HTMLElement | null>(null)
const textInput = ref<HTMLTextAreaElement | null>(null)
const messageText = ref('')
const filePreview = ref<{ file: File; name: string } | null>(null)

// ─── Auto-scroll to bottom ─────────────────────────────────────
function scrollToBottom(smooth = true) {
  nextTick(() => {
    if (scrollAnchor.value) {
      scrollAnchor.value.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
    }
  })
}

watch(() => chat.messages.length, () => scrollToBottom())
watch(() => chat.isTyping, () => scrollToBottom())

// ─── Auto-resize textarea ──────────────────────────────────────
function autoResize() {
  const el = textInput.value
  if (el) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }
}

// ─── Send message ──────────────────────────────────────────────
async function handleSend(e?: Event) {
  if (e) e.preventDefault()
  if (!messageText.value.trim() && !filePreview.value) return
  if (chat.conversation?.status === 'closed') return

  // Send file first if present
  if (filePreview.value) {
    const result = await chat.uploadFile(filePreview.value.file)
    if (result) {
      chat.sendMessage('', 'file', result.fileUrl, result.fileName)
    }
    filePreview.value = null
  }

  // Send text
  if (messageText.value.trim()) {
    chat.sendMessage(messageText.value.trim())
    messageText.value = ''
    if (textInput.value) {
      textInput.value.style.height = 'auto'
    }
  }
}

// ─── File select ───────────────────────────────────────────────
function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    filePreview.value = { file, name: file.name }
  }
  input.value = ''
}

// ─── Emoji insert ──────────────────────────────────────────────
function insertEmoji(emoji: string) {
  messageText.value += emoji
  autoResize()
  textInput.value?.focus()
  // Send typing indicator
  chat.sendTyping(true)
}

// ─── Typing indicator ──────────────────────────────────────────
let typingTimeout: ReturnType<typeof setTimeout> | null = null

function handleTypingStart() {
  chat.sendTyping(true)
  if (typingTimeout) clearTimeout(typingTimeout)
  typingTimeout = setTimeout(() => {
    chat.sendTyping(false)
  }, 2000)
}

watch(messageText, () => {
  if (messageText.value) {
    handleTypingStart()
  }
})

// ─── Lifecycle ─────────────────────────────────────────────────
onMounted(() => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    chat.connect()
  }

  // Listen for auth store changes
  window.addEventListener('storage', handleStorageChange)
})

onUnmounted(() => {
  chat.disconnect()
  chat.toggleOpen()
  window.removeEventListener('storage', handleStorageChange)
  if (typingTimeout) clearTimeout(typingTimeout)
})

function handleStorageChange(e: StorageEvent) {
  if (e.key === 'accessToken') {
    if (e.newValue) {
      chat.connect()
    } else {
      chat.disconnect()
    }
  }
}

// ─── Format time ───────────────────────────────────────────────
function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.chat-slide-enter-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.chat-slide-leave-active {
  transition: all 0.2s ease-in;
}
.chat-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.chat-slide-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

@keyframes bounce-in {
  0% { transform: scale(0); }
  50% { transform: scale(1.15); }
  70% { transform: scale(0.95); }
  100% { transform: scale(1); }
}
.animate-bounce-in {
  animation: bounce-in 0.4s ease-out;
}

@keyframes scale-in {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}
.animate-scale-in {
  animation: scale-in 0.3s ease-out;
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
