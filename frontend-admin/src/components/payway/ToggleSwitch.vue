<template>
  <label class="relative inline-flex items-center cursor-pointer flex-shrink-0 group" :title="modelValue ? 'Enabled' : 'Disabled'">
    <input
      type="checkbox"
      :checked="modelValue"
      @change="onChange"
      class="sr-only peer"
    />
    <div
      class="w-12 h-6 bg-white/30 backdrop-blur-sm rounded-full transition-colors duration-200
             peer-checked:bg-white/90
             after:content-[''] after:absolute after:top-[2px] after:start-[2px]
             after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-200 after:shadow-md
             peer-checked:after:translate-x-6 peer-checked:after:bg-emerald-500
             group-hover:ring-2 group-hover:ring-white/30 ring-offset-0">
    </div>
  </label>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

function onChange(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).checked)
}
</script>
