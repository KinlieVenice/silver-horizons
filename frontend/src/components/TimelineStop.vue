<!-- One stop on the silver line (Itinerary): chrome time on the left (desktop; "TBA" when the stop has no
     time yet), a sparkle on a glowing line, a glass card with a small-caps kind, title, place, note and an
     optional photo filling the card's right side.
     compact: a slim row (kind + title), for the night's programme.
     status: '' | 'past' (dimmed) | 'next' (card glows, sparkle twinkles). -->
<script setup>
import { computed } from 'vue'
import Sparkle from './Sparkle.vue'
import { formatTime } from '../lib/schedule.js'
import { KIND } from '../lib/kinds.js'

const props = defineProps({
  stop: { type: Object, required: true },
  status: { type: String, default: '' },
  last: Boolean,
  compact: Boolean,
})
const time = computed(() => (props.stop.time ? formatTime(props.stop.time).split(' ') : ['TBA', ''])) // ['9:00', 'AM']
const shortTime = computed(() => (props.stop.time ? formatTime(props.stop.time) : 'Time TBA'))
</script>

<template>
  <li
    class="stop grid grid-cols-[1.5rem_1fr] gap-x-4 md:grid-cols-[5.5rem_1.5rem_1fr] md:gap-x-5"
    :class="[status, last && 'last', compact && 'compact']"
    :aria-current="status === 'next' ? 'step' : undefined"
  >
    <p class="hidden text-right leading-none md:block" :class="compact ? 'pt-3.5' : 'pt-5'">
      <span class="chrome-num block" :class="compact ? 'text-[1.45rem]' : 'text-[1.9rem]'">{{ time[0] }}</span>
      <span v-if="time[1]" class="mt-1 block text-[10.5px] font-medium tracking-[0.22em] text-[#AEB9CF]">{{ time[1] }}</span>
    </p>

    <div class="relative flex justify-center" aria-hidden="true">
      <span class="stop-line" />
      <Sparkle class="stop-spark relative z-[1]" :class="compact ? 'mt-4 size-3' : 'mt-6 size-4'" :twinkle="status === 'next'" />
    </div>

    <!-- slim programme row -->
    <article v-if="compact" class="stop-card flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-xl px-4 py-3 md:px-5">
      <p class="flex w-full items-center gap-2 text-[11px] font-medium tracking-[0.18em] text-[#AEB9CF] uppercase sm:w-28 sm:shrink-0">
        <span class="text-white md:hidden">{{ shortTime }}</span>
        <span v-if="KIND[stop.type]" class="md:hidden" aria-hidden="true">·</span>
        {{ KIND[stop.type] }}
      </p>
      <h3 class="text-[17px] leading-snug font-semibold text-white">{{ stop.title }}</h3>
      <span v-if="status === 'next'" class="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium tracking-[0.12em] text-navy-950 uppercase">Up next</span>
    </article>

    <article v-else class="stop-card grid overflow-hidden rounded-2xl" :class="stop.image && 'md:grid-cols-[1fr_auto]'">
      <div class="p-5 md:p-6">
        <p class="flex flex-wrap items-center gap-2 text-xs font-medium tracking-[0.18em] text-[#AEB9CF] uppercase">
          <span class="text-white md:hidden">{{ shortTime }}</span>
          <span class="md:hidden" aria-hidden="true">·</span>
          {{ KIND[stop.type] }}
          <span v-if="status === 'next'" class="rounded-full bg-white px-2 py-0.5 tracking-[0.12em] text-navy-950">Up next</span>
        </p>
        <h3 class="mt-2 text-xl leading-snug font-semibold tracking-[-0.01em] text-white md:text-[1.35rem]">{{ stop.title }}</h3>
        <p v-if="stop.place" class="mt-1 text-[15px] text-[#C3CDE0]">{{ stop.place }}</p>
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
