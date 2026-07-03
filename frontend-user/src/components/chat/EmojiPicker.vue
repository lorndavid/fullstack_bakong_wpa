<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="p-2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
      title="$t('chat.emoji')"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    </button>

    <Transition name="emoji">
      <div
        v-if="isOpen"
        class="absolute bottom-12 left-0 bg-white dark:bg-surface-800 rounded-xl shadow-2xl border border-surface-200 dark:border-surface-700 p-3 z-50 w-[300px]"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">{{ $t('chat.emoji') }}</span>
          <button @click="isOpen = false" class="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="grid grid-cols-8 gap-1">
          <button
            v-for="emoji in emojis"
            :key="emoji"
            @click="selectEmoji(emoji)"
            class="w-8 h-8 flex items-center justify-center text-lg hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
          >
            {{ emoji }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  select: [emoji: string]
}>()

const isOpen = ref(false)

const emojis = [
  '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆',
  '😉', '😊', '😋', '😎', '😍', '🥰', '😘', '😗',
  '🤗', '🤔', '🤭', '🤫', '😐', '😑', '😶', '😏',
  '😒', '🙄', '😬', '😮', '😯', '😲', '😳', '🥺',
  '😢', '😭', '😤', '😡', '🤬', '😈', '👿', '💀',
  '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌',
  '💪', '🤝', '🙏', '✌️', '🤟', '🤘', '👋', '🖐️',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
  '✨', '🔥', '💯', '🎉', '🎊', '🎈', '🎁', '💝',
  '💖', '💗', '💓', '💞', '💕', '❣️', '💌', '💋',
]

function selectEmoji(emoji: string) {
  emit('select', emoji)
  isOpen.value = false
}
</script>

<style scoped>
.emoji-enter-active,
.emoji-leave-active {
  transition: all 0.15s ease;
}
.emoji-enter-from,
.emoji-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.95);
}
</style>
