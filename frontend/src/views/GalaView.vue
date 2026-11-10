<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import TimelineStop from '../components/TimelineStop.vue'
import { event } from '../content/event.js'
import { program } from '../content/program.js'
import { nextStopIndex, formatTime } from '../lib/schedule.js'

const now = ref(new Date())
let timer
onMounted(() => (timer = setInterval(() => (now.value = new Date()), 60_000)))
onUnmounted(() => clearInterval(timer))
const next = computed(() => nextStopIndex(program.date, program.stops, now.value))

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.mapQuery)}`
const startTime = formatTime(event.startsAt.slice(11, 16))
</script>

<template>
  <PageHeader eyebrow="Anniversary & Christmas Party" title="Silver Horizons Night" />

  <section class="bg-navy-950 px-6 py-20 text-center sm:py-28">
    <div v-reveal class="mx-auto max-w-3xl">
      <p class="eyebrow">Save the date</p>
      <p class="silver-text mt-5 font-display text-4xl sm:text-6xl">{{ event.dateLabel }}</p>
      <div class="rule mx-auto my-8 w-40" />
      <p class="font-display text-2xl">{{ event.venue }}</p>
      <p class="mt-1 text-muted">{{ event.city }} · {{ startTime }} onwards</p>
      <a
        :href="mapsUrl"
        target="_blank"
        rel="noopener"
        class="mt-10 inline-flex min-h-12 items-center rounded-full border border-white/40 px-8 text-sm tracking-[0.25em] uppercase transition hover:border-white hover:bg-white hover:text-navy-950"
      >Get directions</a>
    </div>
  </section>

  <section class="night px-5 py-20 sm:py-28">
    <div class="mx-auto max-w-5xl">
      <div class="text-center">
        <p class="eyebrow">Program</p>
        <h2 class="silver-text mt-3 font-display text-3xl font-semibold sm:text-5xl">The Evening</h2>
      </div>
      <div class="rule mx-auto my-12 w-40 md:my-16" />
      <ol class="spine space-y-8 md:space-y-10">
        <TimelineStop v-for="(s, i) in program.stops" :key="s.time" :stop="s" :up-next="i === next" :flip="i % 2 === 1" />
      </ol>
    </div>
  </section>
</template>
