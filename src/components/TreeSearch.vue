<template>
  <div class="vft-search-wrap">
    <svg class="vft-search-icon" viewBox="0 0 16 16" fill="none" width="12" height="12">
      <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" stroke-width="1.3"/>
      <path d="M10 10l3.5 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    </svg>
    <input
      :value="modelValue"
      class="vft-search-input"
      type="text"
      placeholder="Filter..."
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value); $emit('search')"
    />
    <button
      v-if="modelValue"
      class="vft-search-clear"
      @click="$emit('update:modelValue', '')"
      title="Clear"
    >&times;</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: string }>();
defineEmits<{ 'update:modelValue': [value: string]; search: [] }>();
</script>
