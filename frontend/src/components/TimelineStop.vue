<!-- One stop on the silver line (Itinerary days, Gala program): chrome time on the left (desktop), a sparkle
     on a glowing line, a glass card with a small-caps kind, title, place, note and an optional photo filling
     the card's right side. status: '' | 'past' (dimmed) | 'next' (card glows, sparkle twinkles). -->
<script setup>
import { computed } from 'vue'
import Sparkle from './Sparkle.vue'
import { formatTime } from '../lib/schedule.js'
import { KIND } from '../lib/kinds.js'

const props = defineProps({
  stop: { type: Object, required: true },
  status: { type: String, default: '' },
  last: Boolean,
})
const time = computed(() => formatTime(props.stop.time).split(' ')) // ['9:00', 'AM']
</script>

<template>
  <li
    class="stop grid grid-cols-[1.5rem_1fr] gap-x-4 md:grid-cols-[5.5rem_1.5rem_1fr] md:gap-x-5"
    :class="[status, last && 'last']"
    :aria-current="status === 'next' ? 'step' : undefined"
  >
    <p class="hidden pt-5 text-right leading-none md:block">
      <span class="chrome-num block text-[1.9rem]">{{ time[0] }}</span>
      <span class="mt-1.5 block text-[11px] font-medium tracking-[0.22em] text-[#AEB9CF]">{{ time[1] }}</span>
    </p>

    <div class="relative flex justify-center" aria-hidden="true">
      <span class="stop-line" />
      <Sparkle class="stop-spark relative z-[1] mt-6 size-4" :twinkle="status === 'next'" />
    </div>

    <article class="stop-card grid overflow-hidden rounded-2xl md:grid-cols-[1fr_auto]">
      <div class="p-5 md:p-6">
        <p class="flex flex-wrap items-center gap-2 text-xs font-medium tracking-[0.18em] text-[#AEB9CF] uppercase">
          <span class="text-white md:hidden">{{ formatTime(stop.time) }}</span>
          <span class="md:hidden" aria-hidden="true">·</span>
          {{ KIND[stop.type] }}
          <span v-if="status === 'next'" class="rounded-full bg-white px-2 py-0.5 tracking-[0.12em] text-navy-950">Up next</span>
        </p>
        <h3 class="mt-2 text-xl leading-snug font-semibold tracking-[-0.01em] text-white md:text-[1.35rem]">{{ stop.title }}</h3>
        <p class="mt-1 text-[15px] text-[#C3CDE0]">{{ stop.place }}</p>
        <p v-if="stop.note" class="mt-3 max-w-prose text-base leading-relaxed text-ink">{{ stop.note }}</p>
        <a
          v-if="stop.mapUrl"
          :href="stop.mapUrl"
          target="_blank"
          rel="noopener"
          class="link-draw mt-4 inline-block text-sm font-medium"
        >Open in Maps</a>
      </div>
      <div v-if="stop.image" class="photo-frame relative aspect-[16/9] md:aspect-auto md:w-72">
        <img :src="stop.image" :alt="stop.title" class="absolute inset-0 size-full object-cover" loading="lazy" />
        <span class="absolute inset-0 bg-linear-to-r from-[#0B1534] via-transparent to-transparent max-md:hidden" aria-hidden="true" />
      </div>
    </article>
  </li>
</template>
