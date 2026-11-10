<!-- One stop on the timeline. Parent <ol class="spine"> draws the line.
     Colors come from theme vars in style.css (:root).
     Mobile: medallion left, card right (time inside card).
     Desktop: medallion centered; card and big time alternate sides via `flip`. -->
<script setup>
import { computed } from 'vue'
import Sparkle from './Sparkle.vue'
import { formatTime } from '../lib/schedule.js'
import { icons } from '../lib/icons.js'

const props = defineProps({ stop: { type: Object, required: true }, upNext: Boolean, flip: Boolean })
const time = computed(() => formatTime(props.stop.time).split(' ')) // ['9:00', 'AM']
const icon = computed(() => icons[props.stop.type])
</script>

<template>
  <li
    class="relative grid grid-cols-[2.5rem_1fr] items-start gap-x-4 md:grid-cols-[1fr_3.5rem_1fr] md:gap-x-10"
    :aria-current="upNext ? 'step' : undefined"
  >
    <!-- Big time, desktop only, opposite the card -->
    <div
      class="row-start-1 hidden pt-5 md:block"
      :class="flip ? 'md:col-start-3' : 'md:col-start-1 md:text-right'"
      aria-hidden="true"
    >
      <span class="time-text font-display text-6xl leading-none font-semibold">{{ time[0] }}</span>
      <span class="ml-2 text-sm font-medium tracking-[0.2em] text-(--accent-text)">{{ time[1] }}</span>
    </div>

    <!-- Medallion on the spine -->
    <div
      class="relative z-10 col-start-1 row-start-1 mt-4 grid size-10 place-items-center rounded-full border md:col-start-2 md:size-14"
      :class="upNext ? 'border-(--ink-strong) bg-(--ink-strong) text-(--section-bg)' : 'border-(--accent) bg-(--section-bg) text-(--ink-strong)'"
      style="box-shadow: 0 0 0 6px var(--section-bg), var(--med-glow)"
      aria-hidden="true"
    >
      <svg v-if="icon" viewBox="0 0 24 24" class="size-5 md:size-6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path :d="icon" />
      </svg>
      <Sparkle v-else class="size-4 md:size-5" />
    </div>

    <!-- Card -->
    <article
      class="relative col-start-2 row-start-1 overflow-hidden rounded-2xl border p-5 transition duration-300 hover:-translate-y-0.5 hover:border-(--accent) sm:p-6
             before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-(--accent) before:to-transparent"
      :class="[flip ? 'md:col-start-1' : 'md:col-start-3', upNext ? 'border-(--accent) ring-1 ring-(--accent)' : 'border-(--card-border)']"
      style="background: var(--card-bg); box-shadow: var(--card-shadow)"
    >
      <div class="flex items-center justify-between gap-3">
        <p class="md:hidden">
          <span class="time-text font-display text-3xl leading-none font-semibold">{{ time[0] }}</span>
          <span class="ml-1.5 text-xs font-medium tracking-[0.2em] text-(--accent-text)">{{ time[1] }}</span>
        </p>
        <span class="sr-only">{{ time.join(' ') }}</span>
        <span v-if="upNext" class="rounded-full bg-(--ink-strong) px-3 py-0.5 text-[11px] font-medium tracking-[0.15em] text-(--section-bg) uppercase md:ml-auto">Up next</span>
      </div>
      <h3 class="mt-3 text-xl leading-snug font-medium text-(--ink-strong) md:mt-0" :class="upNext && 'md:mt-3'">{{ stop.title }}</h3>
      <p class="mt-1.5 flex items-center gap-1.5 text-[15px] text-(--ink-soft)">
        <svg viewBox="0 0 24 24" class="size-4 shrink-0 text-(--accent-text)" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5a7 7 0 1 0-14 0C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.3" /></svg>
        {{ stop.place }}
      </p>
      <p v-if="stop.note" class="mt-3 border-t border-(--card-border) pt-3 text-base leading-relaxed text-(--ink-body)">{{ stop.note }}</p>
      <a
        v-if="stop.mapUrl"
        :href="stop.mapUrl"
        target="_blank"
        rel="noopener"
        class="mt-4 inline-block text-[15px] font-medium text-(--ink-strong) underline decoration-(--accent) underline-offset-4"
      >Open in Maps</a>
    </article>
  </li>
</template>
