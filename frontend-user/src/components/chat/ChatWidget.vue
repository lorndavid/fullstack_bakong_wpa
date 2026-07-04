<template>
  <div>
    <!-- Floating Chat Button -->
    <button
      v-if="!chat.isOpen"
      @click="chat.toggleOpen()"
      class="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 text-white rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 flex items-center justify-center group hover:scale-110"
    >
      <!-- Icon: chat bubble when closed -->
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

      <!-- Pulse ring animation -->
      <span class="absolute inset-0 rounded-full animate-ping opacity-20 bg-primary-500"></span>
    </button>

    <!-- Chat Window -->
    <Transition name="chat-slide">
      <div
        v-if="chat.isOpen"
        class="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-2rem)] h-[640px] max-h-[calc(100vh-6rem)] bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-surface-200/70 dark:border-surface-700/70 flex flex-col overflow-hidden"
        :class="{ 'h-[64px]': chat.isMinimized }"
      >
        <!-- ── Header ─────────────────────────────────────────── -->
        <div
          class="relative flex items-center justify-between px-4 py-3.5 bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 text-white cursor-pointer flex-shrink-0 overflow-hidden"
          @click="chat.toggleMinimize()"
        >
          <!-- Decorative circles -->
          <div class="absolute -top-6 -right-6 w-20 h-20 bg-white/5 rounded-full"></div>
          <div class="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full"></div>

          <div class="flex items-center gap-3 relative z-10">
            <div class="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-bold tracking-tight">{{ $t('chat.liveChat') }}</h3>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span
                  class="w-1.5 h-1.5 rounded-full animate-pulse"
                  :class="chat.conversation?.status === 'closed' ? 'bg-white/40' : chat.connected ? 'bg-green-300' : 'bg-yellow-300'"
                ></span>
                <p class="text-[11px] text-white/80">
                  {{ chat.conversation?.status === 'closed' ? $t('chat.status.closed') : chat.connected ? $t('chat.status.online') : $t('chat.status.connecting') }}
                </p>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-0.5 relative z-10">
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

        <!-- ── Body ───────────────────────────────────────────── -->
        <template v-if="!chat.isMinimized">
          <!-- Status banner -->
          <div
            v-if="chat.conversation?.status === 'closed'"
            class="px-4 py-2.5 bg-surface-50 dark:bg-surface-700/50 border-b border-surface-200 dark:border-surface-700 flex items-center gap-2.5 text-xs text-surface-500"
          >
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>{{ $t('chat.closedBanner') }}</span>
          </div>

          <!-- Messages Area -->
          <div
            ref="messagesContainer"
            class="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-surface-50/80 to-white dark:from-surface-900/50 dark:to-surface-800/50"
          >
            <!-- Loading spinner -->
            <div v-if="chat.loading" class="flex items-center justify-center py-12">
              <div class="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
            </div>

            <!-- ── Empty state with quick reply chips ──────────── -->
            <div v-else-if="chat.messages.length === 0" class="text-center py-4">
              <!-- Avatar -->
              <div class="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 rounded-full flex items-center justify-center shadow-inner">
                <svg class="w-10 h-10 text-primary-500 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </div>
              <h3 class="text-lg font-bold text-surface-800 dark:text-white mb-1">{{ $t('chat.welcome') }}</h3>
              <p class="text-sm text-surface-500 dark:text-surface-400 mb-6 max-w-xs mx-auto">{{ $t('chat.welcomeSubtitle') }}</p>

              <!-- Quick reply chips -->
              <div class="flex flex-wrap justify-center gap-2 px-2">
                <button
                  v-for="(reply, idx) in chat.suggestedReplies"
                  :key="idx"
                  @click="sendQuickReply(reply)"
                  class="px-4 py-2.5 text-sm font-medium rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-700 dark:text-surface-200 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-600 dark:hover:text-primary-400 active:scale-95 transition-all duration-150 shadow-sm hover:shadow"
                >
                  {{ reply }}
                </button>
              </div>
            </div>

            <!-- ── Messages ─────────────────────────────────---- -->
            <template v-else>
              <div
                v-for="(msg, idx) in chat.messages"
                :key="msg._id"
                class="flex animate-message-in"
                :class="msg.sender === 'user' ? 'justify-end' : 'justify-start'"
                :style="{ animationDelay: idx > chat.messages.length - 5 ? (idx - chat.messages.length + 5) * 50 + 'ms' : '0ms' }"
              >
                <!-- System message (centered) -->
                <div v-if="msg.messageType === 'system'" class="w-full text-center">
                  <span class="inline-block px-3 py-1.5 text-[11px] text-surface-400 bg-surface-100 dark:bg-surface-700/50 rounded-full">
                    {{ msg.content }}
                  </span>
                </div>

                <!-- Regular chat bubble -->
                <div
                  v-else
                  class="max-w-[80%] relative"
                  :class="msg.sender === 'user' ? 'mr-0' : 'ml-0'"
                >
                  <!-- Sender avatar (non-user messages) -->
                  <div
                    v-if="msg.sender !== 'user'"
                    class="flex items-center gap-2 mb-1 px-1"
                  >
                    <div class="w-5 h-5 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-[9px] text-white font-bold">
                      {{ msg.senderName.charAt(0) }}
                    </div>
                    <span class="text-[11px] font-semibold text-primary-500 dark:text-primary-400">{{ msg.senderName }}</span>
                  </div>

                  <!-- Bubble -->
                  <div
                    class="relative"
                    :class="msg.sender === 'user'
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl rounded-tr-sm'
                      : 'bg-white dark:bg-surface-700 text-surface-800 dark:text-surface-100 rounded-2xl rounded-tl-sm shadow-sm border border-surface-200 dark:border-surface-600'"
                  >
                    <!-- File message -->
                    <div v-if="msg.messageType === 'file'" class="p-3">
                      <a
                        :href="msg.fileUrl"
                        target="_blank"
                        class="flex items-center gap-2.5 group"
                        :class="msg.sender === 'user' ? 'text-white/90 hover:text-white' : 'text-primary-500 hover:text-primary-600'"
                      >
                        <div class="w-9 h-9 rounded-lg bg-white/10 dark:bg-surface-600 flex items-center justify-center flex-shrink-0">
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium truncate">{{ msg.fileName || $t('chat.downloadFile') }}</p>
                          <p class="text-[11px] opacity-60 mt-0.5">Click to download</p>
                        </div>
                        <svg class="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                      </a>
                    </div>

                    <!-- Text message -->
                    <div v-else class="px-3.5 py-2.5">
                      <p class="text-sm whitespace-pre-wrap break-words leading-relaxed">{{ msg.content }}</p>
                    </div>

                    <!-- Timestamp -->
                    <div class="px-3.5 pb-2 flex items-center justify-end gap-1">
                      <span
                        class="text-[10px]"
                        :class="msg.sender === 'user' ? 'text-white/60' : 'text-surface-400'"
                      >
                        {{ formatTime(msg.createdAt) }}
                      </span>
                      <!-- Read receipt for user messages -->
                      <svg
                        v-if="msg.sender === 'user'"
                        class="w-3.5 h-3.5"
                        :class="msg.read ? 'text-blue-300' : 'text-white/40'"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- ── Typing indicator ───────────────────────────── -->
            <div v-if="chat.isTyping" class="flex items-start gap-2 animate-message-in">
              <div class="w-5 h-5 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-[9px] text-white font-bold flex-shrink-0 mt-1">
                A
              </div>
              <div class="bg-white dark:bg-surface-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-surface-200 dark:border-surface-600">
                <div class="flex gap-1">
                  <span class="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                  <span class="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                  <span class="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                </div>
              </div>
            </div>

            <div ref="scrollAnchor"></div>
          </div>

          <!-- ── Input Area ───────────────────────────────────── -->
          <div class="border-t border-surface-200/70 dark:border-surface-700/70 bg-white dark:bg-surface-800 px-3 py-3 flex-shrink-0">
            <!-- File preview -->
            <div v-if="filePreview" class="mb-2 flex items-center gap-3 px-3 py-2.5 bg-surface-50 dark:bg-surface-700/50 rounded-xl border border-surface-200 dark:border-surface-600">
              <div class="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <span class="text-sm text-surface-600 dark:text-surface-300 flex-1 truncate font-medium">{{ filePreview.name }}</span>
              <button @click="filePreview = null" class="p-1 text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="flex items-end gap-2">
              <!-- File upload button -->
              <label class="flex-shrink-0 p-2 text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all cursor-pointer">
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
                  class="w-full px-3.5 py-2.5 bg-surface-50 dark:bg-surface-700/50 border border-surface-200 dark:border-surface-600 rounded-xl text-sm text-surface-800 dark:text-surface-100 placeholder-surface-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                  @input="autoResize"
                  @keydown.enter.exact="handleSend"
                ></textarea>
              </div>

              <!-- Send button -->
              <button
                @click="handleSend"
                :disabled="(!messageText.trim() && !filePreview) || chat.conversation?.status === 'closed'"
                class="flex-shrink-0 p-2.5 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                :class="messageText.trim() || filePreview
                  ? 'bg-gradient-to-br from-primary-500 to-accent-500 text-white hover:shadow-md hover:shadow-primary-500/25'
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

// ─── Quick reply click ─────────────────────────────────────────
function sendQuickReply(reply: string) {
  if (chat.conversation?.status === 'closed') return
  // If no conversation yet, open and then send
  chat.sendMessage(reply)
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
/* ── Window slide animation ──────────────────────────────────── */
.chat-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.chat-slide-leave-active {
  transition: all 0.2s ease-in;
}
.chat-slide-enter-from {
  opacity: 0;
  transform: translateY(24px) scale(0.93);
}
.chat-slide-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}

/* ── Message entry animation ─────────────────────────────────── */
@keyframes message-in {
  0% {
    opacity: 0;
    transform: translateY(12px) scale(0.97);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.animate-message-in {
  animation: message-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* ── Bounce-in for floating button ────────────────────────────── */
@keyframes bounce-in {
  0% { transform: scale(0); }
  50% { transform: scale(1.15); }
  70% { transform: scale(0.95); }
  100% { transform: scale(1); }
}
.animate-bounce-in {
  animation: bounce-in 0.4s ease-out;
}

/* ── Scale-in for badges ──────────────────────────────────────── */
@keyframes scale-in {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}
.animate-scale-in {
  animation: scale-in 0.3s ease-out;
}

/* ── Custom scrollbar ─────────────────────────────────────────── */
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
