<!-- Gala: the banner (Home/Itinerary atmosphere; lockup Silver Horizons / NIGHT in chrome; the ribbon ties its
     ring in the centre: Home ties right, Itinerary left), an invitation card (date, time, venue, directions),
     then the evening's program as a framed printed programme. -->
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Ribbon from '../components/Ribbon.vue'
import Sparkle from '../components/Sparkle.vue'
import HorizonGlow from '../components/HorizonGlow.vue'
import { KIND } from '../lib/kinds.js'
import { event } from '../content/event.js'
import { program } from '../content/program.js'
import { nextStopIndex, formatTime, manilaDate } from '../lib/schedule.js'

const now = ref(new Date())
let timer
onMounted(() => (timer = setInterval(() => (now.value = new Date()), 60_000)))
onUnmounted(() => clearInterval(timer))
const next = computed(() => nextStopIndex(program.date, program.stops, now.value))
const isToday = computed(() => program.date === manilaDate(now.value))
const status = (i) => {
  if (!isToday.value) return ''
  if (next.value === -1 || i < next.value) return 'past'
  return i === next.value ? 'next' : ''
}

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.mapQuery)}`
const startTime = formatTime(event.startsAt.slice(11, 16))
const d = new Date(event.startsAt)
const dayNum = d.toLocaleDateString('en-US', { timeZone: 'Asia/Manila', day: '2-digit' })
const monthYear = d.toLocaleDateString('en-US', { timeZone: 'Asia/Manila', month: 'long', year: 'numeric' })
const weekday = d.toLocaleDateString('en-US', { timeZone: 'Asia/Manila', weekday: 'long' })
// glints on the chrome NIGHT (% of the lettering box)
const glints = [
  { x: 6, y: 18, s: 18, d: 0 },
  { x: 47, y: 84, s: 14, d: 1.2 },
  { x: 93, y: 12, s: 22, d: 0.6 },
]
</script>

<template>
  <header class="night relative isolate flex min-h-[60svh] flex-col items-center justify-center-safe overflow-hidden px-6 pt-24 pb-32 text-center md:pt-28">
    <div class="star-dust intro-glow absolute inset-0 -z-10" aria-hidden="true" />
    <div class="hero-spot intro-glow absolute top-0 left-1/2 -z-10 h-[60svh] w-[90vw] -translate-x-1/2" aria-hidden="true" />
    <div class="hero-beam hero-beam--l intro-glow absolute -top-[10svh] left-1/2 -z-10 h-[70svh] w-[38vw]" aria-hidden="true" />
    <div class="hero-beam hero-beam--r intro-glow absolute -top-[10svh] left-1/2 -z-10 h-[70svh] w-[38vw]" aria-hidden="true" />
    <Ribbon
      draw
      :delay="700"
      :duration="2600"
      class="absolute inset-x-[-45vw] bottom-10 -z-10 h-[min(11rem,18svh)] md:inset-x-[-10vw] lg:inset-x-0 lg:h-[min(14rem,24svh)]"
      viewBox="0 0 1200 300"
      d="M -60 250 C 200 290, 420 130, 560 170 C 700 210, 640 300, 560 260 C 480 220, 620 120, 860 150 S 1150 210, 1260 120"
      :width="16"
      :twists="3"
    />
    <HorizonGlow class="-z-10" intro />

    <p class="intro-after flex items-center justify-center gap-4 text-xs font-medium tracking-[0.36em] text-white/80 uppercase">
      <span class="h-px w-8 bg-linear-to-r from-transparent to-white/70 sm:w-14" aria-hidden="true" />
      Anniversary &amp; Christmas Party
      <span class="h-px w-8 bg-linear-to-l from-transparent to-white/70 sm:w-14" aria-hidden="true" />
    </p>
    <h1 class="intro-logo mt-6 font-display leading-none">
      <span class="block text-[clamp(1.5rem,3.4vw,2.5rem)] font-medium text-white/90">Silver Horizons</span>
      <span class="relative mt-1 inline-block text-[clamp(3.6rem,11vw,8rem)]">
        <span class="chrome-shadow" aria-hidden="true">NIGHT</span>
        <span class="chrome-text chrome-shine">NIGHT</span>
        <Sparkle
          v-for="(g, i) in glints"
          :key="i"
          class="glimmer absolute"
          :style="`left:${g.x}%;top:${g.y}%;width:${g.s}px;height:${g.s}px;animation-delay:${1.6 + g.d}s`"
          aria-hidden="true"
        />
      </span>
      <span class="mt-3 block font-sans text-[clamp(0.85rem,1.6vw,1.15rem)] font-medium tracking-[0.5em] text-white/85 uppercase">{{ event.dateLabel }}</span>
    </h1>
  </header>

  <!-- below the banner: star dust, a soft glow behind the invitation and programme -->
  <div class="relative isolate overflow-hidden bg-navy-950">
    <div class="star-dust absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
    <div class="gala-glow absolute top-[40svh] left-1/2 -z-10 h-[120svh] w-[110vw] -translate-x-1/2" aria-hidden="true" />
  <!-- the invitation card -->
  <section class="relative px-5 pt-12 pb-20 font-normal md:px-8 md:pb-28 lg:pt-20" aria-label="Date and venue">
    <div class="invite-card mx-auto grid max-w-4xl overflow-hidden rounded-3xl md:grid-cols-[auto_1fr_1fr]">
      <div class="flex items-center gap-5 p-7 md:flex-col md:items-start md:justify-center md:gap-1 md:border-r md:border-white/10 md:px-10 md:py-9">
        <span class="chrome-num text-7xl leading-none md:text-8xl">{{ dayNum }}</span>
        <span>
          <span class="block text-xs font-medium tracking-[0.24em] text-[#AEB9CF] uppercase">{{ weekday }}</span>
          <span class="mt-0.5 block text-lg font-semibold text-white">{{ monthYear }}</span>
        </span>
      </div>
      <div class="border-t border-white/10 p-7 md:border-t-0 md:border-r md:px-9 md:py-9">
        <p class="text-xs font-medium tracking-[0.24em] text-[#AEB9CF] uppercase">Doors open</p>
        <p class="mt-2 text-2xl font-semibold text-white">{{ startTime }}</p>
        <p class="mt-1 text-[15px] text-[#C3CDE0]">Program follows below</p>
      </div>
      <div class="border-t border-white/10 p-7 md:border-t-0 md:px-9 md:py-9">
        <p class="text-xs font-medium tracking-[0.24em] text-[#AEB9CF] uppercase">Venue</p>
        <p class="mt-2 text-2xl font-semibold text-white">{{ event.venue }}</p>
        <p class="mt-1 text-[15px] text-[#C3CDE0]">{{ event.city }}</p>
        <a
          :href="mapsUrl"
          target="_blank"
          rel="noopener"
          class="mt-5 inline-flex min-h-11 items-center rounded-full bg-white px-6 text-xs font-medium tracking-[0.22em] text-navy-950 uppercase transition hover:-translate-y-0.5 hover:bg-ink active:translate-y-0"
        >Get directions</a>
      </div>
    </div>
  </section>

  <!-- the evening's program, set like a printed gala programme: a framed glass card, centred, sparkle dividers -->
  <section class="relative px-5 pb-28 font-normal md:px-8" aria-labelledby="program-h">
    <div class="programme relative mx-auto max-w-2xl rounded-[2rem] px-6 py-14 text-center md:px-14 md:py-20">
      <Sparkle v-for="c in ['top-4 left-4', 'top-4 right-4', 'bottom-4 left-4', 'bottom-4 right-4']" :key="c" :class="`absolute size-3 opacity-80 ${c}`" aria-hidden="true" />
      <p class="flex items-center justify-center gap-4 text-xs font-medium tracking-[0.36em] text-white/80 uppercase">
        <span class="h-px w-8 bg-linear-to-r from-transparent to-white/70" aria-hidden="true" />
        Program
        <span class="h-px w-8 bg-linear-to-l from-transparent to-white/70" aria-hidden="true" />
      </p>
      <h2 id="program-h" class="mt-4 text-[clamp(2.4rem,6vw,4rem)] leading-none">
        <span class="relative inline-block">
          <span class="chrome-shadow" aria-hidden="true">The Evening</span>
          <span class="chrome-text chrome-shine">The Evening</span>
        </span>
      </h2>

      <ol class="mt-12">
        <li
          v-for="(s, i) in program.stops"
          :key="s.time"
          class="prog-item"
          :class="status(i)"
          :aria-current="status(i) === 'next' ? 'step' : undefined"
        >
          <div v-if="i" class="flex items-center justify-center gap-4 py-7" aria-hidden="true">
            <span class="h-px w-16 bg-linear-to-r from-transparent to-white/40" />
            <Sparkle class="size-3" :twinkle="status(i) === 'next'" />
            <span class="h-px w-16 bg-linear-to-l from-transparent to-white/40" />
          </div>
          <p class="chrome-num text-[2.1rem] leading-none md:text-[2.5rem]">
            {{ formatTime(s.time).split(' ')[0] }}<span class="ml-1.5 align-top font-sans text-xs font-medium tracking-[0.2em] text-[#AEB9CF]">{{ formatTime(s.time).split(' ')[1] }}</span>
          </p>
          <p class="mt-3 text-xs font-medium tracking-[0.24em] text-[#AEB9CF] uppercase">
            {{ KIND[s.type] }}
            <span v-if="status(i) === 'next'" class="ml-2 rounded-full bg-white px-2 py-0.5 tracking-[0.12em] text-navy-950">Up next</span>
          </p>
          <h3 class="mt-2 font-display text-[1.7rem] leading-tight font-semibold text-white md:text-[2rem]">{{ s.title }}</h3>
          <p class="mt-1.5 text-[15px] text-[#C3CDE0]">{{ s.place }}</p>
        </li>
      </ol>
    </div>
  </section>
  </div>
</template>
