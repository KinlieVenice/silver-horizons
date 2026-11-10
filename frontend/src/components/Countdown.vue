<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { timeLeft } from '../lib/schedule.js'

const props = defineProps({ target: { type: String, required: true } })
const now = ref(new Date())
let timer
onMounted(() => (timer = setInterval(() => (now.value = new Date()), 1000)))
onUnmounted(() => clearInterval(timer))

const left = computed(() => timeLeft(props.target, now.value))
const units = computed(() => [
  ['Days', left.value.days],
  ['Hours', left.value.hours],
  ['Minutes', left.value.minutes],
  ['Seconds', left.value.seconds],
])
</script>

<template>
  <p v-if="left.done" class="silver-text font-display text-2xl sm:text-3xl">Thank you for celebrating with us</p>
  <div v-else class="flex items-start justify-center" :aria-label="`${left.days} days, ${left.hours} hours to go`" role="timer">
    <template v-for="([label, value], i) in units" :key="label">
      <span v-if="i" aria-hidden="true" class="silver-text-dim px-0.5 font-display text-[1.75rem] leading-none sm:px-3 sm:text-5xl">:</span>
      <div class="w-[3.75rem] text-center sm:w-24" aria-hidden="true">
        <div class="silver-text font-display text-[2.1rem] leading-none tabular-nums sm:text-6xl">{{ String(value).padStart(2, '0') }}</div>
        <div class="eyebrow mt-3 text-[9.5px]! tracking-[0.16em]! sm:text-[10px]! sm:tracking-[0.22em]!">{{ label }}</div>
      </div>
    </template>
  </div>
</template>
