import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { io, Socket } from 'socket.io-client'
import api from '@/services/api'

interface Message {
  _id: string
  conversationId: string
  sender: 'user' | 'admin' | 'system'
  senderId: string
  senderName: string
  content: string
  messageType: 'text' | 'file' | 'system'
  fileUrl?: string
  fileName?: string
  read: boolean
  createdAt: string
}

interface Conversation {
  _id: string
  userId: string
  userName: string
  userEmail: string
  userAvatar?: string
  assignedTo?: { adminId: string; adminName: string }
  status: 'active' | 'waiting' | 'closed'
  lastMessage?: string
  lastMessageAt?: string
  unreadCount: number
  createdAt: string
  updatedAt: string
}

export const useChatStore = defineStore('chat', () => {
  // ─── State ────────────────────────────────────────────────────
  const socket = ref<Socket | null>(null)
  const conversation = ref<Conversation | null>(null)
  const messages = ref<Message[]>([])
  const isOpen = ref(false)
  const isMinimized = ref(false)
  const connected = ref(false)
  const loading = ref(false)
  const sending = ref(false)
  const typingUsers = ref<{ userId: string; userName: string }[]>([])
  const error = ref<string | null>(null)
  const unreadCount = ref(0)

  // ─── Computed ─────────────────────────────────────────────────
  const isTyping = computed(() => typingUsers.value.length > 0)
  const typingText = computed(() => {
    if (typingUsers.value.length === 0) return ''
    if (typingUsers.value.length === 1) return `${typingUsers.value[0].userName} is typing...`
    return `${typingUsers.value.length} people are typing...`
  })

  // ─── Socket Connection ────────────────────────────────────────
  function connect() {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    if (socket.value?.connected) return

    socket.value = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socket.value.on('connect', () => {
      connected.value = true
    })

    socket.value.on('disconnect', () => {
      connected.value = false
    })

    socket.value.on('connect_error', (err) => {
      console.error('Chat socket error:', err.message)
      connected.value = false
    })

    // Listen for new messages
    socket.value.on('chat:message', (message: Message) => {
      messages.value.push(message)
      // Only increment unread count if chat window is not open
      if (message.sender !== 'user' && message.sender !== 'system' && (!isOpen.value || isMinimized.value)) {
        unreadCount.value++
      }
    })

    // Listen for read receipts
    socket.value.on('chat:read', () => {
      // Mark messages as read
      messages.value.forEach((m) => {
        if (m.sender === 'user') m.read = true
      })
      unreadCount.value = 0
    })

    // Listen for typing
    socket.value.on('chat:typing', (data: { userId: string; userName: string; isTyping: boolean }) => {
      if (data.isTyping) {
        if (!typingUsers.value.find((u) => u.userId === data.userId)) {
          typingUsers.value.push({ userId: data.userId, userName: data.userName })
        }
      } else {
        typingUsers.value = typingUsers.value.filter((u) => u.userId !== data.userId)
      }
    })

    // Listen for assignment
    socket.value.on('chat:assigned', () => {
      loadConversation()
    })

    // Listen for conversation closed
    socket.value.on('chat:closed', () => {
      if (conversation.value) {
        conversation.value.status = 'closed'
      }
    })
  }

  function disconnect() {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
    }
    connected.value = false
  }

  // ─── Join conversation room ───────────────────────────────────
  function joinConversation(conversationId: string) {
    if (socket.value?.connected) {
      socket.value.emit('chat:join', conversationId)
    }
  }

  function leaveConversation(conversationId: string) {
    if (socket.value?.connected) {
      socket.value.emit('chat:leave', conversationId)
    }
  }

  // ─── Load conversation ────────────────────────────────────────
  async function loadConversation() {
    try {
      loading.value = true
      error.value = null
      const data: any = await api.get('/chat/conversation')
      conversation.value = data.conversation
      unreadCount.value = data.conversation.unreadCount || 0

      // Load messages
      const msgData: any = await api.get(`/chat/conversations/${data.conversation._id}/messages`)
      messages.value = msgData.messages || []
      unreadCount.value = 0

      // Join socket room
      joinConversation(data.conversation._id)
    } catch (err: any) {
      error.value = err.message || 'Failed to load conversation'
    } finally {
      loading.value = false
    }
  }

  // ─── Send message ─────────────────────────────────────────────
  function sendMessage(content: string, messageType: 'text' | 'file' = 'text', fileUrl?: string, fileName?: string) {
    if (!conversation.value || !socket.value?.connected) return
    if (!content && !fileUrl) return

    socket.value.emit('chat:send', {
      conversationId: conversation.value._id,
      content,
      messageType,
      fileUrl,
      fileName,
    })
  }

  // ─── Upload file ──────────────────────────────────────────────
  async function uploadFile(file: File): Promise<{ fileUrl: string; fileName: string } | null> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const data: any = await api.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return { fileUrl: data.fileUrl, fileName: data.fileName }
    } catch {
      return null
    }
  }

  // ─── Send typing indicator ────────────────────────────────────
  function sendTyping(isTyping: boolean) {
    if (!conversation.value || !socket.value?.connected) return
    socket.value.emit('chat:typing', {
      conversationId: conversation.value._id,
      isTyping,
    })
  }

  // ─── Toggle chat window ───────────────────────────────────────
  function toggleOpen() {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      isMinimized.value = false
      unreadCount.value = 0
      if (!conversation.value) {
        loadConversation()
      } else {
        joinConversation(conversation.value._id)
      }
    } else {
      if (conversation.value) {
        leaveConversation(conversation.value._id)
      }
    }
  }

  function toggleMinimize() {
    isMinimized.value = !isMinimized.value
    if (!isMinimized.value && conversation.value) {
      joinConversation(conversation.value._id)
      unreadCount.value = 0
    }
  }

  return {
    socket,
    conversation,
    messages,
    isOpen,
    isMinimized,
    connected,
    loading,
    sending,
    typingUsers,
    error,
    unreadCount,
    isTyping,
    typingText,
    connect,
    disconnect,
    loadConversation,
    sendMessage,
    uploadFile,
    sendTyping,
    toggleOpen,
    toggleMinimize,
  }
})
