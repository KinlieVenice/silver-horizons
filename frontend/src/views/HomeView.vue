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
import { content } from '../lib/session.js'
import { phMap } from '../content/phMap.js'
import { branches, groups, hub } from '../content/branches.js'
import { useScenes, seg } from '../lib/useScenes.js'
import { useAutoplay } from '../lib/useAutoplay.js'
import { scrollLock, settle } from '../lib/smoothScroll.js'

const journey = content.journey // loaded after sign-in, before any page renders
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
const GROUP_WIN = { luzon: [0.03, 0.3], visayas: [0.3, 0.53], mindanao: [0.53, 0.76] }
const LINE = 0.1 // each line's draw time
const routes = branches.map((b) => {
  const mx = (b.x + hub.x) / 2
  const my = (b.y + hub.y) / 2
  const k = 0.18 * (b.x >= hub.x ? 1 : -1)
  const cx = mx - (hub.y - b.y) * k
  const cy = my + (hub.x - b.x) * k
  const mates = branches.filter((o) => o.group === b.group)
  const j = mates.indexOf(b)
  // words first: a group's name and chips settle before its lines launch
  const a = GROUP_WIN[b.group][0] + 0.09 + j * (mates.length > 4 ? 0.008 : 0.012)
  return { ...b, d: `M${b.x} ${b.y} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${hub.x} ${hub.y}`, a }
})
const beats = groups.map((g) => {
  const mine = routes.filter((r) => r.group === g.id)
  return { ...g, names: mine.map((r) => r.name), land: Math.max(...mine.map((r) => r.a)) + LINE - 0.01 }
})
// a branch's chip lights up as its line lands in Manila
const landAt = Object.fromEntries(routes.map((r) => [r.name, r.a + LINE]))
const lit = (name) => (progress.converge ?? 0) >= landAt[name]
const beat = computed(() => {
  const p = progress.converge ?? 0
  if (p >= 0.76) return 'done'
  // headline first (0 → 0.06), then Luzon's words from 0.03, then its lines
  return groups.find((g) => p >= GROUP_WIN[g.id][0] && p < GROUP_WIN[g.id][1])?.id ?? ''
})


// Journey: a sideways slider; the bar under it follows how far along it is
const strip = ref()
const stripP = ref(0)
const onStrip = () => {
  const el = strip.value
  stripP.value = el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth)
}
// frame positions (each day's left edge, aligned with the heading); the strip has no CSS snap so the
// drift can stop anywhere and a hold freezes it in place
const stops = () => {
  const el = strip.value
  const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0
  const base = el.getBoundingClientRect().left
  return [...el.querySelectorAll('.snap-start')].map((c) => c.getBoundingClientRect().left - base + el.scrollLeft - pad)
}
const slide = (dir) => {
  pauseDrift(3000)
  const el = strip.value
  const x = el.scrollLeft
  const st = stops()
  const to = dir > 0 ? (st.find((v) => v > x + 10) ?? el.scrollWidth) : (st.findLast((v) => v < x - 10) ?? 0)
  el.scrollTo({ left: to, behavior: 'smooth' })
}
// mouse drag (touch already swipes natively): when let go the strip glides to the
// nearest frame, nudged one frame on in the direction of a real flick; a drag never counts as a click
let drag = null
const dragStart = (e) => {
  if (e.pointerType !== 'mouse' || e.button !== 0) return
  drag = { x: e.clientX, left: strip.value.scrollLeft, moved: false }
}
const dragMove = (e) => {
  if (!drag) return
  const dx = e.clientX - drag.x
  if (Math.abs(dx) > 5 && !drag.moved) { drag.moved = true; strip.value.setPointerCapture(e.pointerId) }
  if (drag.moved) strip.value.scrollLeft = drag.left - dx
}
const dragEnd = () => {
  if (!drag) return
  const el = strip.value
  const { moved, left } = drag
  drag = null
  if (!moved) return
  const st = stops()
  const dir = Math.sign(el.scrollLeft - left)
  const near = st.reduce((a, b) => (Math.abs(b - el.scrollLeft) < Math.abs(a - el.scrollLeft) ? b : a))
  const flick = st.find((x) => (dir > 0 ? x > el.scrollLeft : false)) ?? st.findLast((x) => (dir < 0 ? x < el.scrollLeft : false))
  el.scrollTo({ left: Math.abs(el.scrollLeft - left) > 40 && flick !== undefined ? flick : near, behavior: 'smooth' })
  // swallow the click that follows a drag (e.g. on the "See the itinerary" frame)
  const eat = (ev) => { ev.preventDefault(); ev.stopPropagation() }
  el.addEventListener('click', eat, { capture: true, once: true })
  setTimeout(() => el.removeEventListener('click', eat, { capture: true }), 300)
}

// auto drift: while on screen the strip rolls slowly sideways like film through a gate. Holding it (mouse
// or finger) stops it at once; after a release, swipe, wheel or arrow it waits, then drifts on from there.
// At the end it pauses, glides back to day one, and rolls again.
const SPEED = 45 // px per second
let held = false
let resumeAt = 0
let acc = null // drift position (float; scrollLeft rounds)
let lastT = 0
let driftRaf = 0
let stripVisible = false
let stripIO
let rewind = null // { from, t0 }: gliding back to day one
const pauseDrift = (ms = 2500) => {
  acc = null
  rewind = null
  resumeAt = performance.now() + ms
}
const drift = (now) => {
  driftRaf = requestAnimationFrame(drift)
  const dt = Math.min(0.05, (now - (lastT || now)) / 1000)
  lastT = now
  const el = strip.value
  if (!el || !stripVisible || held || drag || document.hidden || now < resumeAt) return
  if (acc !== null && Math.abs(el.scrollLeft - Math.round(acc)) > 2) return pauseDrift() // moved by the visitor
  if (acc === null) acc = el.scrollLeft
  if (rewind) { // our own ease (a smooth scrollTo here was sometimes dropped by the browser)
    const t = Math.min(1, (now - rewind.t0) / 1200)
    acc = rewind.from * (1 - (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2))
    el.scrollLeft = Math.round(acc)
    if (t >= 1) { rewind = null; resumeAt = now + 800 }
    return
  }
  const max = el.scrollWidth - el.clientWidth
  if (acc >= max - 1) { // the end: rest a moment, then glide back
    resumeAt = now + 1500
    rewind = { from: acc, t0: now + 1500 }
    return
  }
  acc = Math.min(max, acc + SPEED * dt)
  el.scrollLeft = Math.round(acc)
}
const stripDown = (e) => { held = true; pauseDrift(); dragStart(e) }
const stripUp = (e) => { dragEnd(e); held = false; pauseDrift() }
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  stripIO = new IntersectionObserver(([e]) => (stripVisible = e.isIntersecting), { threshold: 0.5 })
  stripIO.observe(strip.value)
  driftRaf = requestAnimationFrame(drift)
})
onUnmounted(() => { stripIO?.disconnect(); cancelAnimationFrame(driftRaf) })

// Finale: one screen that holds the page while it reveals. Coming down, once 40% of it is in view the page
// glides onto it and scrolling pauses while the whole reveal plays (finaleP 0 → 1, driving the same --p
// timings the scenes use). Scrolling back up leaves it revealed; once it has left the screen, it resets
// so coming down again plays it again.
const finaleEl = ref()
const finaleP = ref(0)
const REVEAL = 3400
let played = false
let revealing = false
const block = (e) => e.preventDefault()
const blockKeys = (e) => ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(e.key) && e.preventDefault()
const hold = (on) => {
  scrollLock.on = on
  if (on) settle()
  const f = on ? 'addEventListener' : 'removeEventListener'
  window[f]('wheel', block, { passive: false })
  window[f]('touchmove', block, { passive: false })
  window[f]('keydown', blockKeys)
}
const reveal = () => {
  played = revealing = true
  hold(true)
  const done = () => { if (revealing) { revealing = false; hold(false) } }
  setTimeout(done, REVEAL + 300) // never hold longer than the reveal, even if frames stall
  // glide onto the finale frame by frame (iOS Safari drops a smooth scrollTo while a finger is down),
  // then keep it parked there until the reveal ends, so a half-visible finale can never stay locked
  const top = finaleEl.value.offsetTop
  const from = window.scrollY
  const t0 = performance.now()
  const step = (now) => {
    const g = Math.min(1, (now - t0) / 600)
    const y = g < 1 ? from + (top - from) * (1 - (1 - g) ** 3) : top
    if (revealing && Math.abs(window.scrollY - y) > 1) window.scrollTo(0, y)
    const t = Math.min(1, (now - t0) / REVEAL)
    finaleP.value = 1 - (1 - t) ** 2 // ease out
    if (t < 1) requestAnimationFrame(step)
    else done()
  }
  requestAnimationFrame(step)
}
const START = 0.6 // the finale's top at 60% of the screen height = 40% of it in view
let ticking = 0
const onFinaleScroll = () => {
  ticking ||= requestAnimationFrame(() => {
    ticking = 0
    if (revealing || !finaleEl.value) return
    const top = finaleEl.value.getBoundingClientRect().top
    const vh = window.innerHeight
    if (!played) {
      if (top < vh * START && top > -vh * 0.5) reveal()
      return
    }
    // played: it stays revealed while you scroll back up; once it is wholly out of view (you went back up
    // past it) it resets unseen, so coming down again plays it fresh
    if (top >= vh) { finaleP.value = 0; played = false }
  })
}
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return (finaleP.value = 1)
  window.addEventListener('scroll', onFinaleScroll, { passive: true })
  onFinaleScroll()
})
onUnmounted(() => { window.removeEventListener('scroll', onFinaleScroll); hold(false) })
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
watch(finaleP, (p) => { if (p > 0.8) burst.value = true; else if (p < 0.5) burst.value = false }) // replays after a reset
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
    <section data-scene="years" data-play="3800" class="relative h-[170svh] bg-navy-950">
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
    <section data-scene="converge" data-play="8500" class="relative h-[200svh] bg-navy-950">
      <!-- a night chart: star dust behind; text and map centred together so no dead gap opens between them.
           Phones: the map takes whatever height the text leaves (up to 46svh), so it never runs off small screens -->
      <div class="sticky top-0 isolate grid h-svh grid-rows-[auto_minmax(0,1fr)] overflow-hidden px-6 py-[8svh] md:grid-rows-1 md:py-[10svh] md:grid-cols-[minmax(0,34rem)_auto] md:items-center md:justify-center md:gap-16 md:px-[6vw]">
        <div class="star-dust absolute inset-0 -z-10 opacity-70" aria-hidden="true" />
        <div class="relative z-10 text-center md:text-left">
          <p class="seg fade-up eyebrow max-md:hidden" style="--a:0;--d:0.05">Silver Horizons · Manila</p>
          <h2 class="seg fade-up silver-text mt-3 font-display text-[2rem] leading-[1.05] font-semibold sm:text-4xl md:text-6xl" style="--a:0;--d:0.06">From <span class="chrome-num inline-block align-[-0.04em] text-[1.3em] leading-none">{{ branches.length }}</span> branches,<br />one destination.</h2>
          <!-- the beat in hand: which island group is landing, then (after the last) the welcome line -->
          <!-- every beat and the closing line share one grid cell (only the current one shows), so the box is
               always as tall as the tallest and the map below never shifts between groups -->
          <div class="mt-6 grid md:mt-8" aria-live="off">
            <div v-for="(b, i) in beats" :key="b.id" class="beat-item [grid-area:1/1]" :class="beat === b.id && 'is-on'" :aria-hidden="beat !== b.id">
              <p class="text-[11px] font-medium tracking-[0.3em] text-muted uppercase md:text-xs"><span class="max-md:hidden">{{ i + 1 }} / {{ beats.length }} · </span>{{ b.names.length }} branches</p>
              <p class="silver-text mt-1 font-display text-4xl leading-none font-semibold sm:text-5xl md:text-7xl">{{ b.name }}</p>
              <!-- each branch a glass chip that lights up as its line lands -->
              <ul class="mx-auto mt-3 flex max-w-md flex-wrap justify-center gap-1 sm:gap-1.5 md:mx-0 md:mt-4 md:justify-start">
                <li v-for="n in b.names" :key="n" class="branch-chip" :class="lit(n) && 'is-lit'">{{ n }}</li>
              </ul>
            </div>
            <!-- the end: all three island groups, lit one after another as Manila flares -->
            <ul class="beat-item mx-auto w-fit self-center [grid-area:1/1] md:mx-0 md:self-start" :class="beat === 'done' && 'is-on'" :aria-hidden="beat !== 'done'">
              <li v-for="(b, k) in beats" :key="b.id" class="isle flex items-baseline justify-between gap-6 border-b border-white/10 py-1.5 last:border-0 md:gap-10 md:py-2" :style="{ '--k': k }">
                <span class="relative font-display text-[2.1rem] leading-none font-semibold md:text-6xl">
                  <span class="chrome-shadow" aria-hidden="true">{{ b.name }}</span>
                  <span class="chrome-text">{{ b.name }}</span>
                </span>
                <span class="text-[11px] font-medium tracking-[0.24em] whitespace-nowrap text-muted uppercase md:text-xs"><span class="chrome-num text-lg md:text-2xl">{{ b.names.length }}</span> branches</span>
              </li>
            </ul>
          </div>
        </div>

        <svg :viewBox="`0 0 ${phMap.width} ${phMap.height}`" class="mx-auto mt-4 h-full max-h-[46svh] w-auto overflow-visible md:mt-0 md:h-[84svh] md:max-h-none" aria-hidden="true">
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" /></filter>
            <radialGradient id="sea-glow"><stop offset="0" stop-color="#3D63C9" stop-opacity="0.42" /><stop offset="1" stop-color="#3D63C9" stop-opacity="0" /></radialGradient>
            <radialGradient id="grid-fade"><stop offset="0.25" stop-color="#fff" /><stop offset="1" stop-color="#000" /></radialGradient>
            <mask id="grid-mask"><rect x="-140" y="-60" :width="phMap.width + 280" :height="phMap.height + 120" fill="url(#grid-fade)" /></mask>
            <pattern id="chart-grid" width="76" height="76" patternUnits="userSpaceOnUse"><path d="M76 0H0V76" fill="none" stroke="#9DB6F0" stroke-opacity="0.11" stroke-width="0.6" /></pattern>
          </defs>
          <!-- night chart: a pool of blue light over the sea and a faint latitude/longitude grid, fading at the edges -->
          <g class="seg" style="--a:0;--d:0.08;opacity:var(--t)">
            <ellipse :cx="phMap.width / 2" :cy="phMap.height / 2" :rx="phMap.width * 0.8" :ry="phMap.height * 0.62" fill="url(#sea-glow)" />
            <rect x="-140" y="-60" :width="phMap.width + 280" :height="phMap.height + 120" fill="url(#chart-grid)" mask="url(#grid-mask)" />
          </g>
          <!-- Philippines: coastline draws itself, then fills with a faint silver -->
          <path class="seg" style="--a:0.03;--d:0.1;opacity:var(--t)" :d="phMap.d" fill="#B8C8F0" fill-opacity="0.13" fill-rule="evenodd" />
          <!-- coastline revealed north → south by a sweeping line of light (no stroke-dash: Chrome restarts
               the dash at every island, which scatters fragments) -->
          <g class="seg" style="--a:0;--d:0.09">
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
              <g :style="'opacity:clamp(0, calc(var(--t) * 20), 1)'"><circle class="halo" :cx="r.x" :cy="r.y" r="11" fill="#9DB6F0" filter="url(#glow)" /></g>
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
          <!-- finale: once every group has landed, Manila flares and a wide ring sweeps out over the islands -->
          <circle class="seg manila-flare" style="--a:0.76;--d:0.14" :cx="hub.x" :cy="hub.y" r="16" fill="none" stroke="#FFFFFF" stroke-width="2" />
          <circle class="seg" style="--a:0.74;--d:0.06" :cx="hub.x" :cy="hub.y" r="54" fill="#9DB6F0" filter="url(#glow)" :style="'opacity:calc(var(--t) * 0.55)'" />
          <g class="seg" style="--a:0.02;--d:0.06">
            <circle :cx="hub.x" :cy="hub.y" r="24" fill="#7F9CE0" filter="url(#glow)" :style="'opacity:calc(var(--t) * 0.7)'" />
            <circle :cx="hub.x" :cy="hub.y" r="6" fill="#FFFFFF" :style="'opacity:var(--t)'" />
            <text :x="hub.x - 14" :y="hub.y + 30" text-anchor="end" class="fill-white font-display text-[24px] font-semibold" paint-order="stroke" stroke="#040B24" stroke-width="6" stroke-linejoin="round" :style="'opacity:var(--t)'">{{ hub.name }}</text>
          </g>
        </svg>
      </div>
    </section>

    <!-- 4 · The journey: a sideways slider (swipe / drag / trackpad / arrows) that drifts by itself until held;
         autoplay rests here (data-stop) before going on to the finale. A 35mm film strip: sprocket rails, edge printing, frames snap into place. -->
    <section data-stop="8000" class="relative bg-navy-950 py-20 md:py-28" aria-labelledby="journey-h">
      <div class="mb-6 flex items-end justify-between gap-6 px-6 md:mb-10 md:px-[8vw]">
        <div>
          <p class="eyebrow">The Journey</p>
          <h2 id="journey-h" class="silver-text mt-2 font-display text-4xl font-semibold md:text-6xl">Three days, one celebration</h2>
        </div>
        <div class="hidden gap-2 md:flex">
          <button
            v-for="dir in [-1, 1]"
            :key="dir"
            type="button"
            class="grid size-11 place-items-center rounded-full border border-white/25 text-white/85 transition hover:border-white hover:bg-white/10 active:translate-y-px disabled:pointer-events-none disabled:opacity-30"
            :disabled="dir < 0 ? stripP < 0.01 : stripP > 0.99"
            :aria-label="dir < 0 ? 'Previous' : 'Next'"
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
        class="journey-strip scroll-pl-6 overflow-x-auto overscroll-x-contain [scrollbar-width:none] select-none md:scroll-pl-[8vw] md:cursor-grab md:active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
        @scroll.passive="onStrip"
        @pointerdown="stripDown"
        @pointermove="dragMove"
        @pointerup="stripUp"
        @pointercancel="stripUp"
        @wheel.passive="() => pauseDrift()"
        data-lenis-prevent-horizontal
        @dragstart.prevent
      >
        <div class="flex w-max items-start [--frame-h:min(52vw,21rem)]">
          <div class="w-6 shrink-0 md:w-[8vw]" aria-hidden="true" />

          <article v-for="(d, i) in journey" :key="d.title" class="w-[80vw] max-w-[30rem] shrink-0 snap-start md:w-[32rem]">
            <div class="film-cell">
              <!-- one photo fills the frame; two split it down the middle; none = a night frame with a chrome title -->
              <div class="film-window" :class="!d.images && 'film-night'">
                <div v-if="d.images" class="absolute inset-0 grid grid-flow-col gap-px">
                  <img v-for="img in d.images" :key="img" :src="img" alt="" class="size-full object-cover" loading="lazy" draggable="false" />
                </div>
                <div v-else class="absolute inset-0 grid place-items-center px-6 pb-4 text-center">
                  <h3 class="relative font-display text-[clamp(2.2rem,9vw,3.6rem)] leading-none font-semibold">
                    <span class="chrome-shadow" aria-hidden="true">{{ d.title }}</span>
                    <span class="chrome-text">{{ d.title }}</span>
                  </h3>
                </div>
                <!-- still-frame overlay: number + date up top, title along the bottom -->
                <div class="absolute inset-x-0 top-0 flex items-start justify-between bg-linear-to-b from-black/60 to-transparent p-4 pb-10">
                  <span class="numeral font-display text-5xl leading-[0.8] font-semibold" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
                  <span class="text-right text-[10.5px] font-medium tracking-[0.22em] text-white/80 uppercase">{{ d.when }}</span>
                </div>
                <div class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
                  <h3 v-if="d.images" class="font-display text-2xl leading-tight font-semibold text-white md:text-[1.7rem]">{{ d.title }}</h3>
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
              <span class="film-print" aria-hidden="true">SILVER HORIZONS &nbsp;▸ {{ String(journey.length + 1).padStart(2, '0') }}A</span>
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
