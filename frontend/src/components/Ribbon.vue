<!-- Silver ribbon curve. Stretches to its box; strokes stay constant px width. -->
<script setup>
import { useId } from 'vue'

defineProps({
  d: { type: String, required: true },
  viewBox: { type: String, default: '0 0 1200 600' },
  width: { type: Number, default: 9 },
  draw: Boolean,
})
const id = useId()
</script>

<template>
  <svg
    :viewBox="viewBox"
    preserveAspectRatio="none"
    fill="none"
    aria-hidden="true"
    class="pointer-events-none"
    :class="draw && 'draw'"
    style="filter: drop-shadow(0 0 14px rgb(160 190 255 / 0.35))"
  >
    <defs>
      <linearGradient :id="id" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#5E6A84" stop-opacity="0" />
        <stop offset="0.12" stop-color="#8C98AF" />
        <stop offset="0.4" stop-color="#F4F6FA" />
        <stop offset="0.6" stop-color="#AEB8CB" />
        <stop offset="0.85" stop-color="#FFFFFF" />
        <stop offset="1" stop-color="#C9D1DE" />
      </linearGradient>
    </defs>
    <path
      v-for="(layer, i) in [
        { stroke: `url(#${id})`, w: width },
        { stroke: 'rgb(255 255 255 / 0.85)', w: 1.25 },
      ]"
      :key="i"
      :d="d"
      :stroke="layer.stroke"
      :stroke-width="layer.w"
      stroke-linecap="round"
      vector-effect="non-scaling-stroke"
    />
  </svg>
</template>
