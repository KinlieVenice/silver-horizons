<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import TimelineStop from '../components/TimelineStop.vue'
import { itinerary } from '../content/itinerary.js'
import { defaultDayIndex, nextStopIndex, formatDay, formatTime } from '../lib/schedule.js'

const active = ref(defaultDayIndex(itinerary))
const day = computed(() => itinerary[active.value])
const span = computed(() => {
  const s = day.value.stops
  return `${s.length} stops · ${formatTime(s[0].time)} – ${formatTime(s.at(-1).time)}`
})

const now = ref(new Date())
let timer
onMounted(() => (timer = setInterval(() => (now.value = new Date()), 60_000)))
onUnmounted(() => clearInterval(timer))
const next = computed(() => nextStopIndex(day.value.date, day.value.stops, now.value))
</script>

<template>
  <PageHeader eyebrow="Itinerary" title="The Manila Experience">
    <p class="font-normal text-ink/85">From arrival to Silver Horizons Night. Draft schedule, final details to follow.</p>
  </PageHeader>

  <div class="sticky top-0 z-30 bg-navy-950/90 backdrop-blur-lg md:top-16">
    <div class="mx-auto flex max-w-2xl overflow-x-auto px-2" role="group" aria-label="Choose day">
      <button
        v-for="(d, i) in itinerary"
        :key="d.date"
        type="button"
        class="relative min-h-16 min-w-22 flex-1 px-2 py-3.5 text-center transition"
        :class="i === active ? 'text-(--ink-strong)' : 'text-(--ink-soft) hover:text-(--ink-strong)'"
        :aria-pressed="i === active"
        @click="active = i"
      >
        <span class="block text-xs font-medium tracking-[0.18em] uppercase" :class="i === active && 'text-(--accent-text)'">Day {{ i + 1 }}</span>
        <span class="mt-0.5 block text-base font-medium">{{ formatDay(d.date).replace(/^\w+, /, '') }}</span>
        <span v-if="i === active" class="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-white shadow-[0_0_10px_rgb(180_205_255/0.8)]" />
      </button>
    </div>
    <div class="h-px bg-linear-to-r from-transparent via-(--card-border) to-transparent" />
  </div>

  <section class="relative isolate overflow-hidden bg-navy-950 px-5 pt-14 pb-28 sm:pt-20">
    <div aria-hidden="true" class="capiz absolute inset-x-0 top-0 -z-10 h-[36rem]" />
    <!-- Baybayin: "Maynila" -->
    <p aria-hidden="true" class="baybayin pointer-events-none absolute max-md:hidden -top-4 -right-6 -z-10 text-[8rem] leading-none text-[#B8C8F0] opacity-[0.07] select-none md:text-[13rem]">ᜋᜌ᜔ᜈᜒᜎ</p>

    <Transition name="day" mode="out-in">
      <div :key="day.date" class="mx-auto max-w-5xl">
        <!-- Destination intro: text + stamp -->
        <header class="grid items-center gap-10 md:grid-cols-[1.4fr_1fr] md:gap-16">
          <div class="text-center md:text-left">
            <div class="flex items-end justify-center gap-4 md:justify-start">
              <span aria-hidden="true" class="numeral font-display text-[5rem] leading-[0.8] font-semibold md:text-[7.5rem]">{{ String(active + 1).padStart(2, '0') }}</span>
              <p class="pb-1 text-left text-sm leading-snug font-medium tracking-[0.18em] text-(--accent-text) uppercase">Day {{ active + 1 }}<br />{{ formatDay(day.date) }}</p>
            </div>
            <h2 class="mt-6 font-display text-4xl leading-[1.1] font-semibold text-balance silver-text sm:text-5xl">{{ day.title }}</h2>
            <p class="mx-auto mt-4 max-w-md text-lg text-(--ink-body) md:mx-0">{{ day.blurb }}</p>
            <p class="mt-4 text-[15px] font-medium text-(--ink-soft)">{{ span }}</p>
          </div>

          <figure class="mx-auto w-56 -rotate-2 md:w-72">
            <div class="stamp">
              <img v-if="day.image" :src="day.image" :alt="day.title" class="aspect-[4/5] w-full object-cover" loading="lazy" />
              <!-- ponytail: honest placeholder until Manila team supplies destination photos -->
              <div v-else class="grid aspect-[4/5] place-items-center bg-navy-800 p-5 text-center text-sm text-white/75">
                [Photo: {{ day.title }}]
              </div>
            </div>
            <figcaption class="mt-3 text-center text-xs font-medium tracking-[0.22em] text-(--accent-text) uppercase">{{ day.area }}</figcaption>
          </figure>
        </header>

        <div aria-hidden="true" class="banig mx-auto my-14 max-w-lg md:my-20" />

        <ol class="spine space-y-8 md:space-y-10">
          <TimelineStop
            v-for="(s, i) in day.stops"
            :key="s.time + s.title"
            :stop="s"
            :up-next="i === next"
            :flip="i % 2 === 1"
          />
        </ol>
      </div>
    </Transition>
  </section>

</template>
