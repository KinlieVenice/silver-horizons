<!-- Itinerary: banner, then a two-column agenda in Home's language.
     Left (desktop): a sticky day index with chrome numerals. Phones: the same days as a sticky row of buttons.
     Right: the chosen day; each stop a glass card on a glowing silver line with sparkle markers (a day can
     visit any number of places; a stop with a photograph fills the card's right side). A day with `parts`
     (the night) shows each part as a glass band over slim programme rows. No scroll fade-ins; hover answers
     the pointer; on the day itself past stops dim and the next one glows (days with exact times only). -->
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Ribbon from '../components/Ribbon.vue'
import Sparkle from '../components/Sparkle.vue'
import HorizonGlow from '../components/HorizonGlow.vue'
import TimelineStop from '../components/TimelineStop.vue'
import { itinerary } from '../content/itinerary.js'
import { defaultDayIndex, nextStopIndex, formatDay, manilaDate } from '../lib/schedule.js'

// ---- banner: the trip at a glance, built from the itinerary itself
const md = (d, opts) => new Date(`${d}T12:00:00+08:00`).toLocaleDateString('en-US', { timeZone: 'Asia/Manila', ...opts })
const first = itinerary[0].date
const last = itinerary.at(-1).date
const tripDates = `${md(first, { month: 'long', day: 'numeric' })} – ${md(last, { day: 'numeric' })}, ${first.slice(0, 4)}`
// glints on the chrome SILVER (% of the lettering box)
const glints = [
  { x: 4, y: 20, s: 18, d: 0 },
  { x: 33, y: 8, s: 22, d: 0.8 },
  { x: 58, y: 84, s: 14, d: 1.6 },
  { x: 95, y: 14, s: 20, d: 1.1 },
]

const active = ref(defaultDayIndex(itinerary))
const day = computed(() => itinerary[active.value])
// a day can span dates (endDate): "Dec 3–4" / "December 3 – 4"
const shortDate = (d) => formatDay(d.date).replace(/^\w+, /, '') + (d.endDate ? `–${Number(d.endDate.slice(8))}` : '')
const longDate = (d) =>
  d.endDate
    ? `${md(d.date, { month: 'long', day: 'numeric' })} – ${Number(d.endDate.slice(8))}`
    : md(d.date, { weekday: 'long', month: 'long', day: 'numeric' })
// every stop of a day in order (a day lists `stops`, or `parts` that each list theirs)
const stopsOf = (d) => (d.parts ? d.parts.flatMap((p) => p.stops) : d.stops)
// the parts with each stop's place in the whole day, so status() can mark them
const parts = computed(() => {
  let i = 0
  return (day.value.parts ?? []).map((p) => ({ ...p, stops: p.stops.map((s) => ({ s, i: i++ })) }))
})

const now = ref(new Date())
let timer
onMounted(() => (timer = setInterval(() => (now.value = new Date()), 60_000)))
onUnmounted(() => clearInterval(timer))

const next = computed(() => nextStopIndex(day.value.date, stopsOf(day.value), now.value))
// live marking only for a single day whose stops all have times
const isToday = computed(() => !day.value.endDate && day.value.date === manilaDate(now.value) && stopsOf(day.value).every((s) => s.time))
const status = (i) => {
  if (!isToday.value) return ''
  if (next.value === -1 || i < next.value) return 'past'
  return i === next.value ? 'next' : ''
}

// choosing a day brings the day's top into view when it is scrolled past
const top = ref()
// switching days: the old day slides out toward the side you're leaving, the new one cascades in from the other
const dir = ref(1)
const pick = (i) => {
  if (i === active.value) return
  dir.value = i > active.value ? 1 : -1
  active.value = i
  const y = top.value?.getBoundingClientRect().top ?? 0
  if (y < 0) window.scrollTo({ top: window.scrollY + y - 120, behavior: 'smooth' })
}
</script>

<template>
  <!-- banner: Home's atmosphere (beams, spotlight, star dust, horizon) with an invitation lockup:
       Your / SILVER (chrome, shine, glints) / JOURNEY; the ribbon mirrors Home's, rising on the left -->
  <header class="night relative isolate flex min-h-[max(46svh,27rem)] flex-col md:min-h-[max(48svh,33rem)] items-center justify-center-safe overflow-hidden px-6 pt-16 pb-28 text-center md:pt-20 md:pb-36">
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
      <span class="block text-[clamp(1.6rem,3.6vw,2.6rem)] font-medium text-white/90">Your</span>
      <span class="relative mt-1 inline-block text-[clamp(3.6rem,11vw,8rem)]">
        <span class="chrome-shadow" aria-hidden="true">SILVER</span>
        <span class="chrome-text chrome-shine">SILVER</span>
        <Sparkle
          v-for="(g, i) in glints"
          :key="i"
          class="glimmer absolute"
          :style="`left:${g.x}%;top:${g.y}%;width:${g.s}px;height:${g.s}px;animation-delay:${1.6 + g.d}s`"
          aria-hidden="true"
        />
      </span>
      <span class="mt-3 block font-sans text-[clamp(0.85rem,1.6vw,1.15rem)] font-medium tracking-[0.62em] text-white/85 uppercase">Journey</span>
    </h1>
    <p class="intro-after mt-7 text-sm font-medium tracking-[0.22em] text-white/80 uppercase md:text-[15px]">
      <span class="block sm:inline">{{ tripDates }}</span> <span class="hidden text-white/40 sm:inline" aria-hidden="true">·</span> Manila &amp; Parañaque
    </p>
  </header>

  <section class="relative isolate bg-navy-950 px-5 pt-12 pb-28 font-normal md:px-8 lg:pt-20" aria-label="Schedule">
    <div class="star-dust absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
    <!-- phones and tablets: days as a floating segmented control, sticking just under the top (under the nav
         pill from tablet up); the chosen day is a white pill, the others outlined glass -->
    <div class="sticky top-3 z-30 mx-auto mb-10 max-w-2xl md:top-[4.5rem] lg:hidden">
    <div class="flex gap-1.5 rounded-full border border-white/14 bg-[#0A1438]/85 p-1 shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_14px_34px_-14px_rgb(0_0_0/0.9)] backdrop-blur-lg" role="group" aria-label="Choose day">
      <button
        v-for="(d, i) in itinerary"
        :key="d.date"
        type="button"
        class="day-btn min-h-13 flex-1 rounded-full px-2 py-1.5 text-center"
        :class="i === active ? 'is-active' : ''"
        :aria-pressed="i === active"
        @click="pick(i)"
      >
        <span class="block text-[10.5px] font-medium tracking-[0.16em] uppercase opacity-75">Day {{ i + 1 }}</span>
        <span class="block text-[15px] leading-tight font-semibold">{{ shortDate(d) }}</span>
      </button>
    </div>
  </div>
    <div class="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[17rem_1fr]">
      <!-- desktop: the day index. Every day is a glass button with an arrow; the chosen one glows with a
           silver edge and a lit bar on its left, and says "Viewing" -->
      <nav class="hidden lg:block" aria-label="Days">
        <ol class="sticky top-28 space-y-3">
          <li class="eyebrow mb-4 flex items-center gap-3" aria-hidden="true"><span class="h-px w-8 bg-linear-to-r from-transparent to-white/70" />Choose a day</li>
          <li v-for="(d, i) in itinerary" :key="d.date">
            <button
              type="button"
              class="day-card group relative flex w-full items-center gap-4 rounded-2xl py-4 pr-4 pl-5 text-left"
              :class="i === active && 'is-active'"
              :aria-pressed="i === active"
              @click="pick(i)"
            >
              <span class="chrome-num text-[2.6rem] leading-none" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="min-w-0 flex-1">
                <span class="block text-xs font-medium tracking-[0.18em] text-[#AEB9CF] uppercase">{{ formatDay(d.date) }}</span>
                <span class="mt-1 block text-[16px] leading-snug font-semibold text-[#D5DCEA] transition-colors group-hover:text-white" :class="i === active && 'text-white!'">{{ d.title }}</span>
                <span v-if="i === active" class="mt-2 inline-block rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-navy-950 uppercase">Viewing</span>
              </span>
              <svg v-if="i !== active" viewBox="0 0 24 24" class="day-arrow size-4 shrink-0 text-white/60" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12h13M12.5 6.5 18 12l-5.5 5.5" />
              </svg>
            </button>
          </li>
        </ol>
      </nav>

      <!-- the chosen day -->
      <div ref="top" :style="{ '--dir': dir }">
        <Transition name="day" mode="out-in" :duration="{ enter: 1300, leave: 220 }">
          <article :key="day.date">
            <header>
              <p style="--i: 0" class="cascade flex items-center gap-3 text-xs font-medium tracking-[0.32em] text-white/80 uppercase">
                <span class="h-px w-10 bg-linear-to-r from-transparent to-white/70" aria-hidden="true" />
                {{ longDate(day) }}
              </p>
              <h2 style="--i: 1" class="cascade mt-4 text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.05]">
                <span class="relative inline-block">
                  <span class="chrome-shadow" aria-hidden="true">{{ day.title }}</span>
                  <span class="chrome-text">{{ day.title }}</span>
                </span>
              </h2>
              <ul style="--i: 2" class="cascade mt-6 flex flex-wrap gap-2 text-sm text-ink/90">
                <li v-for="p in day.pills" :key="p" class="glass-pill">{{ p }}</li>
              </ul>
            </header>

            <!-- the night: each part a glass band, then its programme as slim rows -->
            <div v-if="day.parts" class="mt-12 space-y-10">
              <section v-for="(p, pi) in parts" :key="p.title" :aria-label="p.title">
                <header :style="{ '--i': 3 + pi + (p.stops[0]?.i ?? 0) }" class="cascade part-band rounded-2xl px-5 py-4 md:px-6">
                  <div class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <h3 class="relative font-display text-[clamp(1.35rem,2.6vw,1.75rem)] leading-tight font-semibold">
                      <span class="chrome-shadow" aria-hidden="true">{{ p.title }}</span>
                      <span class="chrome-text">{{ p.title }}</span>
                    </h3>
                    <p class="text-xs font-medium tracking-[0.2em] text-white/75 uppercase">{{ p.range }}</p>
                  </div>
                  <p v-if="p.tag" class="glass-pill mt-3 inline-block text-xs font-medium tracking-[0.12em] text-ink uppercase">{{ p.tag }}</p>
                  <p v-if="p.note" class="mt-3 max-w-prose text-[15px] leading-relaxed text-ink/85">{{ p.note }}</p>
                  <!-- assigned per person: one photo for the person's own tour; the public view shows both, a chrome "or" on the seam -->
                  <ul v-if="p.options" class="relative mt-4 grid gap-2" :class="p.options.length > 1 && 'grid-cols-2'">
                    <li v-for="o in p.options" :key="o.title" class="photo-frame relative overflow-hidden rounded-xl" :class="p.options.length > 1 ? 'aspect-[4/5] sm:aspect-[16/9]' : 'aspect-[16/9] sm:aspect-[21/8]'">
                      <img :src="o.image" alt="" class="absolute inset-0 size-full object-cover" loading="lazy" />
                      <div class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/45 to-transparent p-3 pt-14 md:p-4 md:pt-16">
                        <h4 class="font-display text-lg leading-tight font-semibold text-white md:text-2xl">{{ o.title }}</h4>
                        <p class="mt-0.5 text-[10.5px] font-medium tracking-[0.18em] text-white/75 uppercase">{{ o.place }}</p>
                      </div>
                    </li>
                    <li v-if="p.options.length > 1" class="or-medal pointer-events-none absolute top-[30%] left-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full sm:top-1/2 sm:size-12" aria-hidden="true">
                      <span class="chrome-num font-display text-lg italic md:text-xl">or</span>
                    </li>
                  </ul>
                </header>
                <ol class="mt-4 space-y-2.5">
                  <TimelineStop v-if="!p.stops.length" :stop="{ title: 'Programme to follow' }" :style="{ '--i': 4 + pi }" class="cascade pending" compact last />
                  <TimelineStop
                    v-for="(r, j) in p.stops"
                    :key="r.s.time + r.s.title"
                    :stop="r.s"
                    :status="status(r.i)"
                    :last="j === p.stops.length - 1"
                    :style="{ '--i': 4 + pi + r.i }"
                    class="cascade"
                    compact
                  />
                </ol>
              </section>
            </div>
            <ol v-else class="mt-12 space-y-5">
              <TimelineStop
                v-for="(s, i) in day.stops"
                :key="s.title"
                :stop="s"
                :status="status(i)"
                :last="i === day.stops.length - 1"
                :style="{ '--i': 3 + i }"
                class="cascade"
              />
            </ol>
            <p v-if="day.closing" style="--i: 24" class="cascade mt-12 flex items-center gap-3 text-sm text-ink/75 md:ml-[9.5rem]">
              <span class="h-px w-10 bg-linear-to-r from-transparent to-white/60" aria-hidden="true" />
              {{ day.closing }}
            </p>
          </article>
        </Transition>
      </div>
    </div>
  </section>
</template>
