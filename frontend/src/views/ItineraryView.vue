<!-- Itinerary: banner, then a two-column agenda in Home's language.
     Left (desktop): a sticky day index with chrome numerals. Phones: the same days as a sticky row of buttons.
     Right: the chosen day; each stop a glass card on a glowing silver line with sparkle markers (a day can
     visit any number of places; a stop with a photograph fills the card's right side). No scroll fade-ins;
     hover answers the pointer; on the trip day past stops dim and the next card glows. -->
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Ribbon from '../components/Ribbon.vue'
import Sparkle from '../components/Sparkle.vue'
import HorizonGlow from '../components/HorizonGlow.vue'
import TimelineStop from '../components/TimelineStop.vue'
import { content } from '../lib/session.js'
import { defaultDayIndex, nextStopIndex, formatDay, formatTime, manilaDate } from '../lib/schedule.js'

const itinerary = content.itinerary // loaded after sign-in, before any page renders

// ---- banner: the trip at a glance, built from the itinerary itself
const md = (d, opts) => new Date(`${d}T12:00:00+08:00`).toLocaleDateString('en-US', { timeZone: 'Asia/Manila', ...opts })
const first = itinerary[0].date
const last = itinerary.at(-1).date
const tripDates = `${md(first, { month: 'long', day: 'numeric' })} – ${md(last, { day: 'numeric' })}, ${first.slice(0, 4)}`
const tripStops = itinerary.reduce((n, d) => n + d.stops.length, 0)
// glints on the chrome MANILA (% of the lettering box)
const glints = [
  { x: 4, y: 20, s: 18, d: 0 },
  { x: 33, y: 8, s: 22, d: 0.8 },
  { x: 58, y: 84, s: 14, d: 1.6 },
  { x: 95, y: 14, s: 20, d: 1.1 },
]

const active = ref(defaultDayIndex(itinerary))
const day = computed(() => itinerary[active.value])
const longDate = (d) => new Date(`${d}T12:00:00+08:00`).toLocaleDateString('en-US', { timeZone: 'Asia/Manila', weekday: 'long', month: 'long', day: 'numeric' })
const span = (d) => `${formatTime(d.stops[0].time)} – ${formatTime(d.stops.at(-1).time)}`

const now = ref(new Date())
let timer
onMounted(() => (timer = setInterval(() => (now.value = new Date()), 60_000)))
onUnmounted(() => clearInterval(timer))

const next = computed(() => nextStopIndex(day.value.date, day.value.stops, now.value))
const isToday = computed(() => day.value.date === manilaDate(now.value))
const status = (i) => {
  if (!isToday.value) return ''
  if (next.value === -1 || i < next.value) return 'past'
  return i === next.value ? 'next' : ''
}

// choosing a day brings the day's top into view when it is scrolled past
const top = ref()
const pick = (i) => {
  active.value = i
  const y = top.value?.getBoundingClientRect().top ?? 0
  if (y < 0) window.scrollTo({ top: window.scrollY + y - 120, behavior: 'smooth' })
}
</script>

<template>
  <!-- banner: Home's atmosphere (beams, spotlight, star dust, horizon) with an invitation lockup:
       The / MANILA (chrome, shine, glints) / EXPERIENCE; the ribbon mirrors Home's, rising on the left -->
  <header class="night relative isolate flex min-h-[60svh] flex-col items-center justify-center-safe overflow-hidden px-6 pt-24 pb-32 text-center md:pt-28">
    <div class="star-dust intro-glow absolute inset-0 -z-10" aria-hidden="true" />
    <div class="hero-spot intro-glow absolute top-0 left-1/2 -z-10 h-[60svh] w-[90vw] -translate-x-1/2" aria-hidden="true" />
    <div class="hero-beam hero-beam--l intro-glow absolute -top-[10svh] left-1/2 -z-10 h-[70svh] w-[38vw]" aria-hidden="true" />
    <div class="hero-beam hero-beam--r intro-glow absolute -top-[10svh] left-1/2 -z-10 h-[70svh] w-[38vw]" aria-hidden="true" />
    <Ribbon
      draw
      :delay="700"
      :duration="2400"
      class="absolute inset-x-[-15vw] bottom-6 -z-10 h-[min(8rem,13svh)] md:inset-x-[-6vw] md:bottom-10 lg:hidden"
      viewBox="0 0 1200 300"
      d="M 1260 60 C 1000 10, 820 250, 600 230 S 220 90, -60 250"
      :width="14"
      :twists="2"
    />
    <Ribbon
      draw
      :delay="700"
      :duration="2800"
      class="absolute inset-0 -z-10 hidden lg:block"
      viewBox="0 0 1200 800"
      d="M 1320 730 C 980 770, 640 650, 380 655 C 240 658, 125 668, 118 718 C 110 772, 235 786, 258 726 C 280 668, 190 615, 120 560 C 30 488, 15 300, -120 110"
      :width="24"
      :twists="2.5"
    />
    <HorizonGlow class="-z-10" intro />

    <p class="intro-after flex items-center justify-center gap-4 text-xs font-medium tracking-[0.36em] text-white/80 uppercase">
      <span class="h-px w-8 bg-linear-to-r from-transparent to-white/70 sm:w-14" aria-hidden="true" />
      Itinerary
      <span class="h-px w-8 bg-linear-to-l from-transparent to-white/70 sm:w-14" aria-hidden="true" />
    </p>
    <h1 class="intro-logo mt-6 font-display leading-none">
      <span class="block text-[clamp(1.6rem,3.6vw,2.6rem)] font-medium text-white/90">The</span>
      <span class="relative mt-1 inline-block text-[clamp(3.6rem,11vw,8rem)]">
        <span class="chrome-shadow" aria-hidden="true">MANILA</span>
        <span class="chrome-text chrome-shine">MANILA</span>
        <Sparkle
          v-for="(g, i) in glints"
          :key="i"
          class="glimmer absolute"
          :style="`left:${g.x}%;top:${g.y}%;width:${g.s}px;height:${g.s}px;animation-delay:${1.6 + g.d}s`"
          aria-hidden="true"
        />
      </span>
      <span class="mt-3 block font-sans text-[clamp(0.85rem,1.6vw,1.15rem)] font-medium tracking-[0.62em] text-white/85 uppercase">Experience</span>
    </h1>
    <p class="intro-after mt-7 text-sm font-medium tracking-[0.22em] text-white/80 uppercase md:text-[15px]">
      <span class="block sm:inline">{{ tripDates }}</span> <span class="hidden text-white/40 sm:inline" aria-hidden="true">·</span> {{ itinerary.length }} days <span class="text-white/40" aria-hidden="true">·</span> {{ tripStops }} stops
    </p>
    <p class="intro-after mx-auto mt-4 max-w-md text-[15px] font-normal text-ink/75">From arrival to Silver Horizons Night. Draft schedule, final details to follow.</p>
  </header>

  <!-- phones and tablets: days as a sticky row -->
  <div class="sticky top-0 z-30 border-b border-white/10 bg-navy-950/90 backdrop-blur-lg md:pt-[4.5rem] lg:hidden">
    <div class="mx-auto flex max-w-2xl overflow-x-auto px-2" role="group" aria-label="Choose day">
      <button
        v-for="(d, i) in itinerary"
        :key="d.date"
        type="button"
        class="day-btn relative min-h-16 min-w-22 flex-1 px-2 py-3 text-center"
        :class="i === active ? 'text-white' : 'text-[#AEB9CF]'"
        :aria-pressed="i === active"
        @click="pick(i)"
      >
        <span class="block text-xs font-medium tracking-[0.14em] uppercase opacity-80">Day {{ i + 1 }}</span>
        <span class="mt-0.5 block text-base font-medium">{{ formatDay(d.date).replace(/^\w+, /, '') }}</span>
        <span v-if="i === active" class="absolute inset-x-5 bottom-0 h-0.5 rounded-full bg-white" />
      </button>
    </div>
  </div>

  <section class="relative isolate bg-navy-950 px-5 pt-12 pb-28 font-normal md:px-8 lg:pt-20" aria-label="Schedule">
    <div class="star-dust absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
    <div class="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[17rem_1fr]">
      <!-- desktop: the day index, chrome numerals; the chosen day on a glass panel -->
      <nav class="hidden lg:block" aria-label="Days">
        <ol class="sticky top-28 space-y-2">
          <li v-for="(d, i) in itinerary" :key="d.date">
            <button
              type="button"
              class="day-card group flex w-full items-start gap-4 rounded-xl px-4 py-4 text-left"
              :class="i === active && 'is-active'"
              :aria-pressed="i === active"
              @click="pick(i)"
            >
              <span class="chrome-num text-[2.6rem] leading-none" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="pt-1">
                <span class="block text-xs font-medium tracking-[0.18em] text-[#AEB9CF] uppercase">{{ formatDay(d.date) }}</span>
                <span class="mt-1 block text-[16px] leading-snug font-semibold text-[#D5DCEA] transition-colors group-hover:text-white" :class="i === active && 'text-white!'">{{ d.title }}</span>
                <span class="mt-0.5 block text-[13px] text-[#AEB9CF]">{{ d.stops.length }} stops</span>
              </span>
            </button>
          </li>
        </ol>
      </nav>

      <!-- the chosen day -->
      <div ref="top">
        <Transition name="day" mode="out-in">
          <article :key="day.date">
            <header>
              <p class="flex items-center gap-3 text-xs font-medium tracking-[0.32em] text-white/80 uppercase">
                <span class="h-px w-10 bg-linear-to-r from-transparent to-white/70" aria-hidden="true" />
                Day {{ active + 1 }} of {{ itinerary.length }}
              </p>
              <h2 class="mt-4 text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.05]">
                <span class="relative inline-block">
                  <span class="chrome-shadow" aria-hidden="true">{{ day.title }}</span>
                  <span class="chrome-text">{{ day.title }}</span>
                </span>
              </h2>
              <ul class="mt-6 flex flex-wrap gap-2 text-sm text-ink/90">
                <li class="glass-pill">{{ longDate(day.date) }}</li>
                <li class="glass-pill">{{ day.stops.length }} stops</li>
                <li class="glass-pill">{{ span(day) }}</li>
              </ul>
            </header>

            <ol class="mt-12 space-y-5">
              <TimelineStop
                v-for="(s, i) in day.stops"
                :key="s.time + s.title"
                :stop="s"
                :status="status(i)"
                :last="i === day.stops.length - 1"
              />
            </ol>
          </article>
        </Transition>
      </div>
    </div>
  </section>
</template>
