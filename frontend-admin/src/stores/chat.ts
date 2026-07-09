import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { io, Socket } from 'socket.io-client'
import api from '@/services/api'
import { SOCKET_URL } from '@/utils/apiUrl'

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

interface ChatStats {
  total: number
  active: number
  waiting: number
  closed: number
  unread: number
  messagesToday: number
}

export const useChatStore = defineStore('adminChat', () => {
  // ─── State ────────────────────────────────────────────────────
  const socket = ref<Socket | null>(null)
  const conversations = ref<Conversation[]>([])
  const selectedConversation = ref<Conversation | null>(null)
  const messages = ref<Message[]>([])
  const connected = ref(false)
  const loading = ref(false)
  const messagesLoading = ref(false)
  const stats = ref<ChatStats | null>(null)
  const filterStatus = ref<string>('all')
  const searchQuery = ref('')
  const error = ref<string | null>(null)
  const typingUsers = ref<{ userId: string; userName: string }[]>([])

  // ─── Computed ─────────────────────────────────────────────────
  const isTyping = computed(() => typingUsers.value.length > 0)
  const typingText = computed(() => {
    if (typingUsers.value.length === 0) return ''
    if (typingUsers.value.length === 1) return `${typingUsers.value[0].userName} is typing...`
    return `${typingUsers.value.length} people are typing...`
  })

  const filteredConversations = computed(() => {
    let result = conversations.value
    if (filterStatus.value !== 'all') {
      result = result.filter((c) => c.status === filterStatus.value)
    }
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (c) =>
          c.userName.toLowerCase().includes(q) ||
          c.userEmail.toLowerCase().includes(q)
      )
    }
    return result
  })

  // ─── Socket Connection ────────────────────────────────────────
  function connect() {
    const token = localStorage.getItem('admin_token')
    if (!token) return

    if (socket.value?.connected) return

    socket.value = io(SOCKET_URL, {
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
      console.error('Admin chat socket error:', err.message)
      connected.value = false
    })

    // Listen for new messages
    socket.value.on('chat:message', (message: Message) => {
      if (selectedConversation.value && message.conversationId === selectedConversation.value._id) {
        messages.value.push(message)
        // Mark as read if we're viewing
        if (message.sender === 'user') {
          socket.value?.emit('chat:mark-read', message.conversationId)
        }
      }
      // Update conversation list
      refreshConversations()
    })

    // Listen for unread updates
    socket.value.on('admin:unread-update', (data: { conversationId: string; unreadCount: number }) => {
      const conv = conversations.value.find((c) => c._id === data.conversationId)
      if (conv) {
        conv.unreadCount = data.unreadCount
      }
    })

    // Listen for conversation updates
    socket.value.on('admin:conversation-updated', (updated: Conversation) => {
      const idx = conversations.value.findIndex((c) => c._id === updated._id)
      if (idx >= 0) {
        conversations.value[idx] = updated
      } else {
        conversations.value.unshift(updated)
      }
      if (selectedConversation.value?._id === updated._id) {
        selectedConversation.value = updated
      }
    })

    // Listen for new message notification
    socket.value.on('admin:new-message', () => {
      refreshConversations()
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

  // ─── Load conversations ───────────────────────────────────────
  async function loadConversations() {
    try {
      loading.value = true
      const params: any = {}
      if (filterStatus.value !== 'all') params.status = filterStatus.value
      if (searchQuery.value) params.search = searchQuery.value
      const data: any = await api.get('/chat/admin/conversations', { params })
      conversations.value = data.conversations || []
    } catch (err: any) {
      error.value = err.message || 'Failed to load conversations'
    } finally {
      loading.value = false
    }
  }

  // ─── Load messages ────────────────────────────────────────────
  async function loadMessages(conversationId: string) {
    try {
      messagesLoading.value = true
      const data: any = await api.get(`/chat/admin/conversations/${conversationId}/messages`)
      messages.value = data.messages || []
      // Mark as read via socket
      if (socket.value?.connected) {
        socket.value.emit('chat:mark-read', conversationId)
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load messages'
    } finally {
      messagesLoading.value = false
    }
  }

  // ─── Select conversation ──────────────────────────────────────
  async function selectConversation(conversation: Conversation) {
    if (selectedConversation.value) {
      leaveConversation(selectedConversation.value._id)
    }
    selectedConversation.value = conversation
    typingUsers.value = []
    joinConversation(conversation._id)
    await loadMessages(conversation._id)
    // Clear unread count locally
    conversation.unreadCount = 0
  }

  // ─── Send message ─────────────────────────────────────────────
  function sendMessage(content: string, messageType: 'text' | 'file' = 'text', fileUrl?: string, fileName?: string) {
    if (!selectedConversation.value || !socket.value?.connected) return
    if (!content && !fileUrl) return

    socket.value.emit('chat:send', {
      conversationId: selectedConversation.value._id,
      content,
      messageType,
      fileUrl,
      fileName,
    })
  }

  // ─── Assign staff ─────────────────────────────────────────────
  function assignStaff(conversationId: string, adminName?: string) {
    if (!socket.value?.connected) return
    const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}')
    socket.value.emit('admin:assign', {
      conversationId,
      adminId: adminUser.id || 'unknown',
      adminName: adminName || adminUser.name || 'Staff',
    })
  }

  // ─── Close conversation ───────────────────────────────────────
  function closeConversation(conversationId: string) {
    if (!socket.value?.connected) return
    socket.value.emit('admin:close', conversationId)
  }

  // ─── Load stats ───────────────────────────────────────────────
  async function loadStats() {
    try {
      const data: any = await api.get('/chat/admin/stats')
      stats.value = data.stats
    } catch {
      // silent
    }
  }

  // ─── Refresh conversations ────────────────────────────────────
  async function refreshConversations() {
    try {
      const params: any = {}
      if (filterStatus.value !== 'all') params.status = filterStatus.value
      const data: any = await api.get('/chat/admin/conversations', { params })
      conversations.value = data.conversations || []
    } catch {
      // silent
    }
  }

  return {
    socket,
    conversations,
    selectedConversation,
    messages,
    connected,
    loading,
    messagesLoading,
    stats,
    filterStatus,
    searchQuery,
    error,
    typingUsers,
    isTyping,
    typingText,
    filteredConversations,
    connect,
    disconnect,
    loadConversations,
    loadMessages,
    selectConversation,
    sendMessage,
    assignStaff,
    closeConversation,
    loadStats,
    refreshConversations,
  }
})
