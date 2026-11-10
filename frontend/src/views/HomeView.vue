<!-- Home as a scroll story (Resn-style): 3 scroll scenes, a sideways film-strip slider, then a one-screen finale that plays by itself; idle visitors get autoplay (useAutoplay).
     Each [data-scene] is a tall section with a sticky stage; useScenes() feeds --p (0→1).
     Element timing: class="seg" + style="--a:start;--d:duration" (fractions of the scene). -->
<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import logo from '../assets/brand/silver-horizons-logo.webp'
import Countdown from '../components/Countdown.vue'
import Ribbon from '../components/Ribbon.vue'
import Sparkle from '../components/Sparkle.vue'
import HorizonGlow from '../components/HorizonGlow.vue'
import { event } from '../content/event.js'
import { itinerary } from '../content/itinerary.js'
import { phMap } from '../content/phMap.js'
import { branches, groups, hub } from '../content/branches.js'
import { formatDay } from '../lib/schedule.js'
import { useScenes, seg } from '../lib/useScenes.js'
import { useAutoplay } from '../lib/useAutoplay.js'

const root = ref()
const progress = useScenes(root)
const autoplay = useAutoplay(root) // idle visitors: story plays on by itself
// Scene 1 opening (CSS only): horizon line opens, glow rises, logo resolves, details fade in
// "Begin the journey": glide into the first scene and straight into playing it
const begin = () => autoplay.next()

// Glimmers on the logo letters (% of the logo box), mostly on SILVER
const logoSparks = [
  { x: 17, y: 38, s: 18, d: 0 },
  { x: 33, y: 60, s: 12, d: 1.1 },
  { x: 48, y: 31, s: 22, d: 0.5 },
  { x: 63, y: 58, s: 14, d: 1.8 },
  { x: 83, y: 31, s: 26, d: 0.25 },
  { x: 74, y: 44, s: 12, d: 2.4 },
  { x: 33, y: 66, s: 12, d: 1.4 },
]

// Scene 2 (scroll): year ticks 2001 → 2026 while the "25" fills; ribbon loops through it
const year = computed(() => 2001 + Math.round(25 * seg(progress.years ?? 0, 0.02, 0.26)))
const loopTo = computed(() => seg(progress.years ?? 0, 0.04, 0.28))

// Scene 3 (scroll): map draws, then every FELCO branch sends a line of light to Manila.
// Curves bow perpendicular to the straight line; branches launch one after another.
// Three beats, one island group each (Luzon → Visayas → Mindanao): the group's lines streak into Manila
// together, a ring pulses out of Manila as they land, then the group holds before the next one starts.
// Each window is [start, end) of the scene's progress; the group's title shows for its whole window.
const GROUP_WIN = { luzon: [0.14, 0.4], visayas: [0.4, 0.64], mindanao: [0.64, 0.88] }
const LINE = 0.1 // each line's draw time
const routes = branches.map((b) => {
  const mx = (b.x + hub.x) / 2
  const my = (b.y + hub.y) / 2
  const k = 0.18 * (b.x >= hub.x ? 1 : -1)
  const cx = mx - (hub.y - b.y) * k
  const cy = my + (hub.x - b.x) * k
  const mates = branches.filter((o) => o.group === b.group)
  const j = mates.indexOf(b)
  const a = GROUP_WIN[b.group][0] + 0.02 + j * (mates.length > 4 ? 0.008 : 0.02)
  return { ...b, d: `M${b.x} ${b.y} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${hub.x} ${hub.y}`, a }
})
const beats = groups.map((g) => {
  const mine = routes.filter((r) => r.group === g.id)
  return { ...g, names: mine.map((r) => r.name), land: Math.max(...mine.map((r) => r.a)) + LINE - 0.01 }
})
const beat = computed(() => {
  const p = progress.converge ?? 0
  if (p >= 0.88) return 'done'
  return groups.find((g) => p >= GROUP_WIN[g.id][0] && p < GROUP_WIN[g.id][1])?.id ?? ''
})
const beatInfo = computed(() => beats.find((b) => b.id === beat.value))

const dayWords = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven']

// Journey: a plain sideways slider; the bar under it follows how far along it is
const strip = ref()
const stripP = ref(0)
const onStrip = () => {
  const el = strip.value
  stripP.value = el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth)
}
const slide = (dir) => strip.value.scrollBy({ left: dir * Math.min(strip.value.clientWidth * 0.8, 520), behavior: 'smooth' })

// Finale: one screen that holds the page while it reveals. As it comes up, the page settles on it and
// scrolling pauses until the whole reveal has played (finaleP 0 → 1, driving the same --p timings the
// scenes use); then scrolling is free again. Plays once.
const finaleEl = ref()
const finaleP = ref(0)
const REVEAL = 3400
let finaleIO
const block = (e) => e.preventDefault()
const blockKeys = (e) => ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(e.key) && e.preventDefault()
const hold = (on) => {
  const f = on ? 'addEventListener' : 'removeEventListener'
  window[f]('wheel', block, { passive: false })
  window[f]('touchmove', block, { passive: false })
  window[f]('keydown', blockKeys)
}
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return (finaleP.value = 1)
  finaleIO = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return
    finaleIO.disconnect()
    hold(true)
    window.scrollTo({ top: finaleEl.value.offsetTop, behavior: 'smooth' })
    const t0 = performance.now()
    const step = (now) => {
      const t = Math.min(1, (now - t0) / REVEAL)
      finaleP.value = 1 - (1 - t) ** 2 // ease out
      if (t < 1) requestAnimationFrame(step)
      else hold(false)
    }
    requestAnimationFrame(step)
  }, { threshold: 0.4 })
  finaleIO.observe(finaleEl.value)
})
onUnmounted(() => { finaleIO?.disconnect(); hold(false) })
// Finale: glints on the chrome SILVER MOMENT (% of the lettering box), a ribbon that draws along the
// returning horizon as the scene ends, and a few stars in the sky
const chromeGlints = [
  { x: 3, y: 18, s: 18, d: 0 },
  { x: 24, y: 8, s: 24, d: 0.9 },
  { x: 41, y: 82, s: 14, d: 1.7 },
  { x: 58, y: 10, s: 20, d: 0.4 },
  { x: 79, y: 80, s: 14, d: 2.3 },
  { x: 97, y: 12, s: 22, d: 1.3 },
]
const finaleRibbon = computed(() => seg(finaleP.value, 0.55, 0.35))
const stars = [
  { x: 12, y: 16, s: 10, d: 0 }, { x: 22, y: 34, s: 6, d: 1.4 }, { x: 81, y: 14, s: 12, d: 0.7 },
  { x: 90, y: 38, s: 7, d: 2.1 }, { x: 68, y: 9, s: 6, d: 1.1 }, { x: 34, y: 10, s: 8, d: 2.6 },
]

const burst = ref(false)
watch(finaleP, (p) => { if (p > 0.8) burst.value = true })
const sparks = Array.from({ length: 14 }, (_, i) => {
  const ang = (i / 14) * Math.PI * 2
  const r = 140 + (i % 3) * 60
  return { x: `${Math.round(Math.cos(ang) * r)}px`, y: `${Math.round(Math.sin(ang) * r)}px`, s: 10 + (i % 4) * 5, delay: `${(i % 5) * 60}ms` }
})
</script>

<template>
  <div ref="root">
    <!-- 1 · Opening -->
    <section class="night relative isolate flex min-h-svh flex-col items-center justify-center-safe overflow-hidden px-4 pt-10 pb-44 text-center md:pt-24">
      <!-- atmosphere: star dust over the sky, a spotlight on the logo, two soft beams from above -->
      <div class="star-dust intro-glow absolute inset-0 -z-10" aria-hidden="true" />
      <div class="hero-spot intro-glow absolute top-0 left-1/2 -z-10 h-[85svh] w-[90vw] -translate-x-1/2" aria-hidden="true" />
      <div class="hero-beam hero-beam--l intro-glow absolute -top-[10svh] left-1/2 -z-10 h-[90svh] w-[38vw]" aria-hidden="true" />
      <div class="hero-beam hero-beam--r intro-glow absolute -top-[10svh] left-1/2 -z-10 h-[90svh] w-[38vw]" aria-hidden="true" />
      <Sparkle twinkle class="absolute top-[14%] left-[10%] -z-10 size-3" />
      <Sparkle twinkle class="absolute top-[26%] right-[12%] -z-10 size-2 [animation-delay:1.2s]" />
      <Sparkle twinkle class="absolute top-[8%] right-[30%] -z-10 size-1.5 [animation-delay:2.1s]" />
      <Ribbon
        draw
        :delay="900"
        :duration="2600"
        class="absolute inset-x-[-45vw] bottom-24 -z-10 h-[min(14rem,22svh)] md:bottom-8 md:inset-x-[-10vw] lg:hidden"
        viewBox="0 0 1200 300"
        d="M -60 250 C 200 290, 420 130, 560 170 C 700 210, 640 300, 560 260 C 480 220, 620 120, 860 150 S 1150 210, 1260 120"
        :width="14"
        :twists="3"
      />
      <!-- large screens: a bigger ribbon that runs along the bottom, ties its loop at the lower right, then
           sweeps up the right side and out the top-right corner (the lookbook swoosh), clear of the logo -->
      <Ribbon
        draw
        :delay="900"
        :duration="3000"
        class="absolute inset-0 -z-10 hidden lg:block"
        viewBox="0 0 1200 800"
        d="M -120 730 C 220 770, 560 650, 820 655 C 960 658, 1075 668, 1082 718 C 1090 772, 965 786, 942 726 C 920 668, 1010 615, 1080 560 C 1170 488, 1185 300, 1320 110"
        :width="26"
        :twists="2.5"
      />
      <HorizonGlow class="-z-10" intro />

      <h1 class="sr-only">Silver Horizons — FELCO 25th Anniversary</h1>
      <div class="intro-logo relative w-[min(96vw,820px,90svh)]">
        <img
          :src="logo"
          alt="FELCO 25 Years and Climbing Higher. Silver Horizons: Celebrating the Journey, Embracing the Future."
          class="block h-auto w-full"
          fetchpriority="high"
        />
        <div class="logo-shine" :style="`--logo: url(${logo})`" aria-hidden="true" />
        <Sparkle
          v-for="(s, i) in logoSparks"
          :key="i"
          class="glimmer absolute"
          :style="`left:${s.x}%;top:${s.y}%;width:${s.s}px;height:${s.s}px;animation-delay:${1.8 + s.d}s`"
        />
      </div>
      <p class="intro-after mt-6 flex items-center justify-center gap-4 text-xs font-medium tracking-[0.32em] text-white/85 uppercase sm:mt-10 sm:text-[13px]">
        <span class="h-px w-8 bg-linear-to-r from-transparent to-white/70 sm:w-14" aria-hidden="true" />
        <span>{{ event.dateLabel }}<span class="max-sm:hidden"> &nbsp;·&nbsp; </span><span class="block sm:inline">{{ event.venue }}</span></span>
        <span class="h-px w-8 bg-linear-to-l from-transparent to-white/70 sm:w-14" aria-hidden="true" />
      </p>

      <Countdown :target="event.startsAt" class="intro-after mt-6" />

      <!-- Begin: invites the first scroll; click glides to the story -->
      <button type="button" class="begin intro-after group mt-6 flex min-h-11 items-center gap-2.5 px-3 sm:mt-8" @click="begin">
        <span class="relative text-[10.5px] font-medium tracking-[0.32em] text-ink/75 uppercase transition-colors group-hover:text-white">
          Begin the journey
          <span class="absolute inset-x-0 -bottom-1.5 h-px origin-left scale-x-0 bg-linear-to-r from-transparent via-white to-transparent transition-transform duration-500 group-hover:scale-x-100" aria-hidden="true" />
        </span>
        <svg viewBox="0 0 24 24" class="begin-arrow size-3.5 text-ink/75 transition-colors group-hover:text-white" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 5v13M6.5 12.5 12 18l5.5-5.5" />
        </svg>
      </button>
    </section>

    <!-- 2 · Twenty-five years -->
    <section data-scene="years" data-play="3800" class="relative h-[200svh] bg-navy-950">
      <div class="sticky top-0 grid h-svh place-items-center overflow-hidden px-6">
        <p class="sr-only">25 years, 2001 to 2026. 25 years behind us. New horizons ahead.</p>
        <!-- glow brightens as the years fill -->
        <div class="seg absolute inset-0" style="--a:0;--d:0.35;opacity:var(--t);background:radial-gradient(60% 50% at 50% 60%, rgb(61 107 196 / 0.35), transparent 70%)" aria-hidden="true" />

        <div class="relative grid place-items-center" aria-hidden="true">
          <p class="mb-2 text-sm font-medium tracking-[0.4em] text-muted tabular-nums md:text-base">{{ year }}</p>
          <div class="relative grid font-display leading-[0.8] font-semibold">
            <!-- ribbon sweeps BEHIND the 25: low left → under the numerals → up to a sparkle at top right
                 (the "Silver Moment" swoosh from the lookbook) -->
            <div class="absolute -right-[18%] -bottom-[28%] -left-[18%] top-[22%] md:-right-[38%] md:-bottom-[14%] md:-left-[38%]">
              <Ribbon
                class="absolute inset-0"
                d="M -20 430 C 280 560, 640 580, 860 440 S 1120 110, 1170 40"
                :width="13"
                :twists="2"
                :to="loopTo"
              />
              <Sparkle class="absolute top-[6.7%] left-[97.5%] size-6 -translate-1/2" :style="`opacity:${loopTo > 0.97 ? 1 : 0};transition:opacity .4s`" />
            </div>
            <span class="numeral relative [grid-area:1/1] text-[min(54vmin,30rem)]">25</span>
            <span class="silver-text seg rise relative [grid-area:1/1] text-[min(54vmin,30rem)]" style="--a:0.02;--d:0.26">25</span>
          </div>

          <!-- the words sit right under the 25 and its arc, one composition. Line 1 resolves with the fill,
               then lifts away; line 2 resolves in its place (whole-line reveals stay centered) -->
          <div class="relative mt-[clamp(3rem,9svh,5.5rem)] w-[92vw] text-center">
            <p class="seg font-display text-3xl font-medium md:text-5xl" style="--a:0.4;--d:0.1;opacity:calc(1 - var(--t));transform:translateY(calc(var(--t) * -28px));filter:blur(calc(var(--t) * 6px))">
              <span class="seg reveal-line silver-text" style="--a:0.02;--d:0.14">25 years behind us.</span>
            </p>
            <div class="absolute inset-x-0 top-0">
              <p class="font-display text-[1.85rem] font-semibold whitespace-nowrap sm:text-4xl md:text-6xl">
                <span class="seg reveal-line silver-text" style="--a:0.48;--d:0.16">New horizons ahead.</span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- 3 · From every branch, one destination -->
    <section data-scene="converge" data-play="6500" class="relative h-[260svh] bg-navy-950">
      <div class="sticky top-0 grid h-svh overflow-hidden px-6 py-[10svh] md:grid-cols-2 md:items-center md:gap-10 md:px-[8vw]">
        <div class="relative z-10 text-center md:text-left">
          <p class="seg fade-up eyebrow" style="--a:0;--d:0.15">Silver Horizons · Manila</p>
          <h2 class="seg fade-up silver-text mt-3 font-display text-4xl leading-[1.05] font-semibold md:text-6xl" style="--a:0.05;--d:0.2">From {{ branches.length }} branches,<br />one destination.</h2>
          <!-- the beat in hand: which island group is landing, then (after the last) the welcome line -->
          <div class="mt-5 min-h-[7.5rem] md:mt-8 md:min-h-[11rem]" aria-live="off">
            <Transition name="beat" mode="out-in">
              <div v-if="beatInfo" :key="beatInfo.id">
                <p class="text-xs font-medium tracking-[0.3em] text-muted uppercase">{{ beats.indexOf(beatInfo) + 1 }} / {{ beats.length }} · {{ beatInfo.names.length }} branches</p>
                <p class="silver-text mt-1 font-display text-5xl leading-none font-semibold md:text-7xl">{{ beatInfo.name }}</p>
                <p class="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink/80 md:mx-0">{{ beatInfo.names.join(' · ') }}</p>
              </div>
              <p v-else-if="beat === 'done'" key="done" class="mx-auto max-w-md text-[15px] text-ink/85 md:mx-0 md:text-lg">
                Throughout the year, we’ve celebrated the people, partnerships, challenges, and milestones that brought FELCO to 25. Now we come together in Manila.
              </p>
            </Transition>
          </div>
        </div>

        <svg :viewBox="`0 0 ${phMap.width} ${phMap.height}`" class="mx-auto h-[46svh] w-auto overflow-visible md:h-[78svh]" aria-hidden="true">
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" /></filter>
          </defs>
          <!-- Philippines: coastline draws itself, then fills with a faint silver -->
          <path class="seg" style="--a:0.12;--d:0.2;opacity:var(--t)" :d="phMap.d" fill="#B8C8F0" fill-opacity="0.13" fill-rule="evenodd" />
          <!-- coastline revealed north → south by a sweeping line of light (no stroke-dash: Chrome restarts
               the dash at every island, which scatters fragments) -->
          <g class="seg" style="--a:0;--d:0.22">
            <path :d="phMap.d" fill="none" stroke="#C9D6F5" stroke-width="1.2" stroke-linejoin="round" style="clip-path: inset(0 0 calc((1 - var(--t)) * 100%) 0)" />
            <rect
              x="-20" :width="phMap.width + 40" height="2" fill="#FFFFFF" filter="url(#glow)"
              :style="`transform: translateY(calc(var(--t) * ${phMap.height}px)); opacity: calc(min(var(--t) * 20, 1) * (1 - var(--t)))`"
            />
          </g>

          <g v-for="r in routes" :key="r.name" class="seg" :style="`--a:${r.a};--d:${LINE}`">
            <path :d="r.d" pathLength="1" fill="none" stroke="#9DB6F0" stroke-opacity="0.75" stroke-width="6" class="draw-line" filter="url(#glow)" />
            <path :d="r.d" pathLength="1" fill="none" stroke="#FFFFFF" stroke-width="1.3" class="draw-line" />
            <!-- comet: a bright head running ahead of the line, gone as it lands -->
            <path :d="r.d" pathLength="1" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" class="comet" filter="url(#glow)" />
            <g class="branch-dot" :class="beat === r.group && 'is-on'">
              <circle class="halo" :cx="r.x" :cy="r.y" r="11" fill="#9DB6F0" filter="url(#glow)" />
              <circle :cx="r.x" :cy="r.y" r="3.5" fill="#FFFFFF" :style="'opacity:var(--t)'" />
            </g>
            <text
              :x="r.side === 'left' ? r.x - 7 : r.x + 7"
              :y="r.y + 3.5"
              :text-anchor="r.side === 'left' ? 'end' : 'start'"
              class="fill-[#C3CDE0] font-sans text-[10px] font-medium tracking-[0.06em] max-md:hidden"
              paint-order="stroke" stroke="#040B24" stroke-width="4" stroke-linejoin="round"
              :style="'opacity:var(--t)'"
            >{{ r.name }}</text>
          </g>
          <!-- a ring pulses out of Manila as each group lands -->
          <circle
            v-for="b in beats"
            :key="`ring-${b.id}`"
            class="seg manila-ring"
            :style="`--a:${b.land};--d:0.07`"
            :cx="hub.x" :cy="hub.y" r="10" fill="none" stroke="#FFFFFF" stroke-width="1.5"
          />
          <g class="seg" style="--a:0.16;--d:0.1">
            <circle :cx="hub.x" :cy="hub.y" r="24" fill="#7F9CE0" filter="url(#glow)" :style="'opacity:calc(var(--t) * 0.7)'" />
            <circle :cx="hub.x" :cy="hub.y" r="6" fill="#FFFFFF" :style="'opacity:var(--t)'" />
            <text :x="hub.x - 14" :y="hub.y + 30" text-anchor="end" class="fill-white font-display text-[24px] font-semibold" paint-order="stroke" stroke="#040B24" stroke-width="6" stroke-linejoin="round" :style="'opacity:var(--t)'">{{ hub.name }}</text>
          </g>
        </svg>
      </div>
    </section>

    <!-- 4 · The journey: an ordinary sideways slider (swipe / trackpad / arrows), not tied to the page scroll;
         autoplay rests here (data-stop) before going on to the finale. A 35mm film strip: sprocket rails, edge printing, frames snap into place. -->
    <section data-stop="8000" class="relative bg-navy-950 py-20 md:py-28" aria-labelledby="journey-h">
      <div class="mb-6 flex items-end justify-between gap-6 px-6 md:mb-10 md:px-[8vw]">
        <div>
          <p class="eyebrow">The Journey</p>
          <h2 id="journey-h" class="silver-text mt-2 font-display text-4xl font-semibold md:text-6xl">{{ dayWords[itinerary.length] ?? itinerary.length }} days in Manila</h2>
        </div>
        <div class="hidden gap-2 md:flex">
          <button
            v-for="dir in [-1, 1]"
            :key="dir"
            type="button"
            class="grid size-11 place-items-center rounded-full border border-white/25 text-white/85 transition hover:border-white hover:bg-white/10 active:translate-y-px disabled:pointer-events-none disabled:opacity-30"
            :disabled="dir < 0 ? stripP < 0.01 : stripP > 0.99"
            :aria-label="dir < 0 ? 'Previous day' : 'Next day'"
            @click="slide(dir)"
          >
            <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path :d="dir < 0 ? 'M19 12H6M11.5 6.5 6 12l5.5 5.5' : 'M5 12h13M12.5 6.5 18 12l-5.5 5.5'" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref="strip"
        class="snap-x snap-mandatory scroll-pl-6 overflow-x-auto overscroll-x-contain [scrollbar-width:none] md:scroll-pl-[8vw] [&::-webkit-scrollbar]:hidden"
        @scroll.passive="onStrip"
      >
        <div class="flex w-max items-start [--frame-h:min(52vw,21rem)]">
          <div class="w-6 shrink-0 md:w-[8vw]" aria-hidden="true" />

          <article v-for="(d, i) in itinerary" :key="d.date" class="w-[80vw] max-w-[30rem] shrink-0 snap-start md:w-[32rem]">
            <div class="film-cell">
              <div class="film-window">
                <img v-if="d.image" :src="d.image" :alt="d.title" class="absolute inset-0 size-full object-cover" loading="lazy" draggable="false" />
                <span v-else class="absolute inset-0 grid place-items-center pb-10 text-xs text-white/45">[Photo: {{ d.title }}]</span>
                <!-- still-frame overlay: number + date up top, title along the bottom -->
                <div class="absolute inset-x-0 top-0 flex items-start justify-between bg-linear-to-b from-black/60 to-transparent p-4 pb-10">
                  <span class="numeral font-display text-5xl leading-[0.8] font-semibold" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
                  <span class="text-right text-[10.5px] font-medium tracking-[0.22em] text-white/80 uppercase">Day {{ i + 1 }}<br />{{ formatDay(d.date) }}</span>
                </div>
                <div class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
                  <h3 class="font-display text-2xl leading-tight font-semibold text-white md:text-[1.7rem]">{{ d.title }}</h3>
                  <p class="mt-1 text-[10.5px] font-medium tracking-[0.22em] text-white/70 uppercase">{{ d.area }}</p>
                </div>
              </div>
              <span class="film-print" aria-hidden="true">SILVER HORIZONS &nbsp;▸ {{ String(i + 1).padStart(2, '0') }}A</span>
            </div>
            <p class="px-4 pt-4 text-[15px] leading-relaxed text-ink/85">{{ d.blurb }}</p>
          </article>

          <div class="w-[60vw] max-w-[20rem] shrink-0 snap-start md:w-[22rem]">
            <div class="film-cell">
              <RouterLink to="/itinerary" class="film-window group grid place-items-center text-center">
                <span>
                  <span class="eyebrow block">Full schedule</span>
                  <span class="silver-text mt-3 block font-display text-3xl font-semibold">See the itinerary</span>
                  <span class="mt-3 block text-2xl transition group-hover:translate-x-1" aria-hidden="true">→</span>
                </span>
              </RouterLink>
              <span class="film-print" aria-hidden="true">SILVER HORIZONS &nbsp;▸ 05A</span>
            </div>
          </div>

          <div class="w-6 shrink-0 md:w-[8vw]" aria-hidden="true" />
        </div>
      </div>

      <!-- how far along the strip you are -->
      <div class="mx-6 mt-8 h-px bg-white/10 md:mx-[8vw]" aria-hidden="true">
        <div class="h-px origin-left bg-white shadow-[0_0_10px_rgb(180_205_255/0.9)] transition-transform duration-150" :style="`transform: scaleX(${stripP})`" />
      </div>
    </section>

    <!-- 5 · Finale: a glow rises from the bottom edge and floods the screen in brand blue; the headline's
         first line is sharp from the start, the second resolves out of a blur as the light takes over;
         then the date, venue, countdown and actions settle on the blue -->
    <section ref="finaleEl" data-stop="1" class="relative h-svh bg-navy-950" :style="`--p:${finaleP}`">
      <!-- relative: the stage must be the containing block, or its overflow-hidden won't clip the flood disc -->
      <div class="relative flex h-svh flex-col items-center justify-center-safe overflow-hidden px-6 pt-16 pb-24 text-center md:pb-10">
        <!-- the flood: a huge soft disc centred behind the words, growing until it covers the screen -->
        <div
          class="seg finale-flood pointer-events-none absolute"
          style="--a:0.04;--d:0.5"
          aria-hidden="true"
        />

        <!-- the bookend: stars come out, the horizon returns at the foot and a ribbon draws along it -->
        <div class="seg pointer-events-none absolute inset-0" style="--a:0.5;--d:0.2;opacity:var(--t)" aria-hidden="true">
          <Sparkle
            v-for="(st, i) in stars"
            :key="i"
            twinkle
            class="absolute"
            :style="`left:${st.x}%;top:${st.y}%;width:${st.s}px;height:${st.s}px;animation-delay:${st.d}s`"
          />
          <HorizonGlow />
        </div>
        <Ribbon
          class="pointer-events-none absolute inset-x-[-40vw] bottom-16 h-[22svh] md:inset-x-[-6vw] md:h-[30svh]"
          viewBox="0 0 1200 300"
          d="M -60 250 C 240 300, 470 170, 640 205 S 960 280, 1260 120"
          :width="16"
          :twists="2.5"
          :to="finaleRibbon"
        />

        <div class="relative">
          <h2 class="font-display text-[clamp(2.6rem,8.2vw,7.25rem)] leading-[0.95] font-semibold">
            <span class="seg fade-up block text-[0.55em] font-medium tracking-[0.02em] text-white/90" style="--a:0;--d:0.12">This is our</span>
            <span class="seg finale-resolve mt-2 block md:mt-4" style="--a:0.18;--d:0.36">
              <!-- chrome lettering: a blurred dark copy behind for depth, the chrome gradient copy on top -->
              <span class="relative inline-block">
                <span class="chrome-shadow" aria-hidden="true">SILVER MOMENT</span>
                <span class="chrome-text chrome-shine">SILVER MOMENT</span>
                <Sparkle
                  v-for="(g, i) in chromeGlints"
                  :key="i"
                  class="glimmer absolute"
                  :style="`left:${g.x}%;top:${g.y}%;width:${g.s}px;height:${g.s}px;animation-delay:${1 + g.d}s`"
                  aria-hidden="true"
                />
              </span>
            </span>
          </h2>
          <p class="seg fade-up mt-8 text-sm font-medium tracking-[0.3em] text-white/90 uppercase md:text-base" style="--a:0.58;--d:0.1">
            <span class="block sm:inline">{{ event.dateLabel }}</span><span class="max-sm:hidden"> · </span><span class="block sm:inline">{{ event.venue }}, {{ event.city }}</span>
          </p>
          <Countdown :target="event.startsAt" class="finale-count seg fade-up mt-6" style="--a:0.64;--d:0.1" />
          <div class="seg fade-up mt-8 flex flex-wrap justify-center gap-2 sm:mt-9 sm:gap-3" style="--a:0.7;--d:0.1">
            <!-- Gala hidden for now: was <RouterLink to="/gala">The Night</RouterLink> -->
            <RouterLink to="/itinerary" class="inline-flex min-h-10 items-center rounded-full bg-white px-4 text-[11px] font-medium tracking-[0.16em] sm:min-h-12 sm:px-7 sm:text-sm sm:tracking-[0.2em] text-navy-950 uppercase transition hover:-translate-y-0.5 hover:bg-ink active:translate-y-0">See the itinerary</RouterLink>
            <RouterLink to="/info" class="inline-flex min-h-10 items-center rounded-full border border-white/60 px-4 text-[11px] font-medium tracking-[0.16em] sm:min-h-12 sm:px-7 sm:text-sm sm:tracking-[0.2em] text-white uppercase transition hover:-translate-y-0.5 hover:border-white hover:bg-white/10 active:translate-y-0">Know before you go</RouterLink>
          </div>
        </div>

        <div v-if="burst" class="burst pointer-events-none absolute top-[38%] left-1/2" aria-hidden="true">
          <Sparkle
            v-for="(s, i) in sparks"
            :key="i"
            class="absolute"
            :style="`--x:${s.x};--y:${s.y};width:${s.s}px;height:${s.s}px;animation-delay:${s.delay}`"
          />
        </div>
      </div>
    </section>
    <!-- the flood's blue settles back into the navy footer instead of ending on a hard edge -->
    <div aria-hidden="true" class="h-32 bg-linear-to-b from-[#132657] to-navy-950 md:h-44" />
  </div>
</template>
