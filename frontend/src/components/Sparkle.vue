<script setup>
defineProps({ twinkle: Boolean })
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    :class="twinkle && 'twinkle'"
    style="filter: drop-shadow(0 0 6px rgb(200 220 255 / 0.9))"
  >
    <path d="M12 0C12.9 8.2 15.8 11.1 24 12C15.8 12.9 12.9 15.8 12 24C11.1 15.8 8.2 12.9 0 12C8.2 11.1 11.1 8.2 12 0Z" fill="#F4F6FA" />
  </svg>
</template>
