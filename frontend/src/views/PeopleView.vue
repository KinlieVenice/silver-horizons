<!-- People: the banner (site atmosphere; lockup Meet the / PEOPLE in chrome / of Silver Horizons), then the
     lists (a side index on desktop, like the Itinerary's days; a sticky segmented control on phones): Who's attending (name | branch rows you can search), Hosts & Speakers,
     Performers, Committee (portrait cards: photo, or a chrome monogram until there is one).
     Everything is per event, for the events you're registered for: a tab shows chips for only the events that
     have entries in it (one event: just its name), and a tab with none at all is left out. The chosen event
     carries across tabs when it can. Switching tabs uses the Itinerary's day transition. -->
<script setup>
import { ref, computed } from 'vue'
import Ribbon from '../components/Ribbon.vue'
import Sparkle from '../components/Sparkle.vue'
import HorizonGlow from '../components/HorizonGlow.vue'
import { events } from '../content/people.js'

const glints = [
  { x: 6, y: 18, s: 18, d: 0 },
  { x: 48, y: 84, s: 14, d: 1 },
  { x: 95, y: 12, s: 20, d: 0.5 },
]

const intro = {
  attending: 'Everyone registered for the same events as you. Search by name or branch.',
  hosts: 'Your hosts, guides and the people taking the stage to speak.',
  performers: 'Who’s performing, and when in the programme to catch them.',
  committee: 'The team behind each event. Reach out to them with any question.',
}
// only tabs with someone in at least one of your events
const tabs = [
  { id: 'attending', label: 'Who’s attending', short: 'Attending', sub: 'Who’s going with you' },
  { id: 'hosts', label: 'Hosts & Speakers', short: 'Hosts', sub: 'Hosts, speakers, guides' },
  { id: 'performers', label: 'Performers', short: 'Performers', sub: 'On stage' },
  { id: 'committee', label: 'Committee', short: 'Committee', sub: 'The team behind it' },
].filter((t) => events.some((e) => e[t.id]?.length))
const tab = ref(tabs[0]?.id)
const dir = ref(1)
const top = ref()
const pick = (id) => {
  if (id === tab.value) return
  dir.value = tabs.findIndex((t) => t.id === id) > tabs.findIndex((t) => t.id === tab.value) ? 1 : -1
  tab.value = id
  const y = top.value?.getBoundingClientRect().top ?? 0
  if (y < 0) window.scrollTo({ top: window.scrollY + y - 140, behavior: 'smooth' })
}

// the events with entries in this tab; the chosen one carries over between tabs when it's there
const eventId = ref(events[0]?.id)
const tabEvents = computed(() => events.filter((e) => e[tab.value]?.length))
const ev = computed(() => tabEvents.value.find((e) => e.id === eventId.value) ?? tabEvents.value[0])
const list = computed(() => ev.value?.[tab.value] ?? [])
// card tabs as groups, by each card's `group` (Hosts, Speakers, Guides; Headliner, Line-up …), in order;
// cards without one share an unnamed group. `at` numbers the cards across groups for the cascade.
const groups = computed(() => {
  const out = []
  let at = 3
  for (const c of list.value) {
    const name = c.group ?? ''
    let g = out.find((x) => x.name === name)
    if (!g) out.push((g = { name, at: at++, cards: [] }))
    g.cards.push({ ...c, at: at++ })
  }
  return out
})
// Who's attending: searchable by name or branch
const q = ref('')
const shown = computed(() => {
  const s = q.value.trim().toLowerCase()
  return s ? list.value.filter((p) => `${p.name} ${p.branch}`.toLowerCase().includes(s)) : list.value
})
// first and last name's initials (Shirley De Jesus → SJ)
const initials = (name) => { const w = name.split(' '); return w[0][0] + (w.length > 1 ? w.at(-1)[0] : '') }
</script>

<template>
  <header class="night relative isolate flex min-h-[max(46svh,27rem)] flex-col md:min-h-[max(48svh,33rem)] items-center justify-center-safe overflow-hidden px-6 pt-16 pb-28 text-center md:pt-20 md:pb-36">
    <div class="star-dust intro-glow absolute inset-0 -z-10" aria-hidden="true" />
    <div class="hero-spot intro-glow absolute top-0 left-1/2 -z-10 h-[60svh] w-[90vw] -translate-x-1/2" aria-hidden="true" />
    <div class="hero-beam hero-beam--l intro-glow absolute -top-[10svh] left-1/2 -z-10 h-[70svh] w-[38vw]" aria-hidden="true" />
    <div class="hero-beam hero-beam--r intro-glow absolute -top-[10svh] left-1/2 -z-10 h-[70svh] w-[38vw]" aria-hidden="true" />
    <!-- one ribbon sweeps in from the right and ties a loop under the lockup -->
    <div class="absolute inset-x-[-30vw] bottom-4 -z-10 h-[min(8rem,14svh)] md:inset-x-[-6vw] lg:inset-x-0 lg:h-[min(10rem,18svh)]" aria-hidden="true">
      <Ribbon
        draw
        :delay="700"
        :duration="2600"
        class="absolute inset-0"
        viewBox="0 0 1200 300"
        d="M 1260 80 C 1040 40, 860 250, 700 210 C 600 185, 560 90, 640 70 C 720 50, 730 180, 560 230 C 380 280, 160 120, -60 200"
        :width="16"
        :twists="2.5"
      />
    </div>
    <HorizonGlow class="-z-10" intro />

    <p class="intro-after flex items-center justify-center gap-4 text-xs font-medium tracking-[0.36em] text-white/80 uppercase">
      <span class="h-px w-8 bg-linear-to-r from-transparent to-white/70 sm:w-14" aria-hidden="true" />
      People
      <span class="h-px w-8 bg-linear-to-l from-transparent to-white/70 sm:w-14" aria-hidden="true" />
    </p>
    <h1 class="intro-logo mt-6 font-display leading-none">
      <span class="block text-[clamp(1.5rem,3.4vw,2.5rem)] font-medium text-white/90">Meet the</span>
      <span class="relative mt-1 inline-block text-[clamp(3.4rem,10vw,7.5rem)]">
        <span class="chrome-shadow" aria-hidden="true">PEOPLE</span>
        <span class="chrome-text chrome-shine">PEOPLE</span>
        <Sparkle
          v-for="(g, i) in glints"
          :key="i"
          class="glimmer absolute"
          :style="`left:${g.x}%;top:${g.y}%;width:${g.s}px;height:${g.s}px;animation-delay:${1.6 + g.d}s`"
          aria-hidden="true"
        />
      </span>
      <span class="mt-3 block font-sans text-[clamp(0.8rem,1.6vw,1.15rem)] font-medium tracking-[0.32em] text-white/85 uppercase sm:tracking-[0.5em]">of Silver Horizons</span>
    </h1>
  </header>

  <section class="relative isolate min-h-[70svh] bg-navy-950 px-5 pt-12 pb-28 font-normal md:px-8 lg:pt-20">
    <div class="star-dust absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
    <!-- phones and tablets: the lists as a floating segmented control (white pill = current) that sticks just
         under the top (under the nav pill on tablets); desktop has the side index below, like the Itinerary -->
    <div class="sticky top-3 z-30 mx-auto mb-10 max-w-3xl md:top-[4.5rem] lg:hidden">
    <div class="flex gap-1.5 rounded-full border border-white/14 bg-[#0A1438]/85 p-1 shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_14px_34px_-14px_rgb(0_0_0/0.9)] backdrop-blur-lg" role="tablist" aria-label="People">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        role="tab"
        class="day-btn min-h-11 flex-1 rounded-full px-1.5 text-[12.5px] font-semibold md:text-sm"
        :class="t.id === tab && 'is-active'"
        :aria-selected="t.id === tab"
        @click="pick(t.id)"
      >
        <span class="md:hidden">{{ t.short }}</span><span class="max-md:hidden">{{ t.label }}</span>
      </button>
    </div>
  </div>

    <div class="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[17rem_1fr]">
      <!-- desktop: the lists as the Itinerary's day index (glass cards, chrome numerals, arrow; the chosen one
           glows, has the lit bar and says "Viewing") -->
      <nav class="hidden lg:block" aria-label="Lists">
        <ol class="sticky top-28 space-y-3">
          <li class="eyebrow mb-4 flex items-center gap-3" aria-hidden="true"><span class="h-px w-8 bg-linear-to-r from-transparent to-white/70" />Choose a list</li>
          <li v-for="(t, i) in tabs" :key="t.id">
            <button
              type="button"
              class="day-card group relative flex w-full items-center gap-4 rounded-2xl py-4 pr-4 pl-5 text-left"
              :class="t.id === tab && 'is-active'"
              :aria-pressed="t.id === tab"
              @click="pick(t.id)"
            >
              <span class="chrome-num text-[2.6rem] leading-none" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="min-w-0 flex-1">
                <span class="block text-[16px] leading-snug font-semibold text-[#D5DCEA] transition-colors group-hover:text-white" :class="t.id === tab && 'text-white!'">{{ t.label }}</span>
                <span class="mt-0.5 block text-[13px] text-[#AEB9CF]">{{ t.sub }}</span>
                <span v-if="t.id === tab" class="mt-2 inline-block rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-navy-950 uppercase">Viewing</span>
              </span>
              <svg v-if="t.id !== tab" viewBox="0 0 24 24" class="day-arrow size-4 shrink-0 text-white/60" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 12h13M12.5 6.5 18 12l-5.5 5.5" />
              </svg>
            </button>
          </li>
        </ol>
      </nav>

    <div ref="top" class="min-w-0" :style="{ '--dir': dir }">
    <Transition name="day" mode="out-in" :duration="{ enter: 1100, leave: 220 }">
      <div :key="tab">
        <p style="--i: 0" class="cascade max-w-xl text-[15px] leading-relaxed text-ink/80">{{ intro[tab] }}</p>

        <!-- the events with entries in this tab (only one: just its name). Sticky on a frosted strip just under
             the tab capsule (phones, tablets) or the nav (desktop), so the list scrolls beneath it -->
        <div v-if="tabEvents.length > 1" style="--i: 1" class="cascade event-strip sticky top-[4.5rem] z-20 -mx-5 mt-6 md:top-[8.25rem] md:-mx-3 lg:top-[4.5rem]">
        <div class="flex gap-2 overflow-x-auto px-5 py-2 [scrollbar-width:none] md:flex-wrap md:px-3 [&::-webkit-scrollbar]:hidden" role="group" aria-label="Event">
          <button
            v-for="e in tabEvents"
            :key="e.id"
            type="button"
            class="event-chip shrink-0 rounded-2xl px-4 py-2.5 text-left"
            :class="e.id === ev.id && 'is-active'"
            :aria-pressed="e.id === ev.id"
            @click="eventId = e.id"
          >
            <span class="block text-[10.5px] font-medium tracking-[0.18em] uppercase opacity-75">{{ e.when }} · {{ e[tab].length }}</span>
            <span class="block text-sm font-semibold whitespace-nowrap">{{ e.title }}</span>
          </button>
        </div>
        </div>

        <!-- Who's attending: a count, a search, then name | branch rows -->
        <template v-if="tab === 'attending'">
          <div style="--i: 2" class="cascade mt-8 flex flex-wrap items-end justify-between gap-4">
            <h2 class="font-display text-[clamp(1.6rem,3.2vw,2.4rem)] leading-tight">
              <span class="chrome-num">{{ shown.length }}</span>
              <span class="ml-2 text-white">{{ shown.length === 1 ? 'person' : 'people' }}</span>
              <span class="block font-sans text-sm font-medium tracking-[0.18em] text-[#AEB9CF] uppercase">{{ ev.title }}</span>
            </h2>
            <label class="relative w-full sm:w-72">
              <span class="sr-only">Search by name or branch</span>
              <svg viewBox="0 0 24 24" class="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/50" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
              <input v-model="q" type="search" placeholder="Search name or branch" class="glass-input min-h-11 w-full rounded-full py-2 pr-4 pl-10 text-[15px] text-white placeholder:text-white/45" />
            </label>
          </div>
          <ul v-if="shown.length" class="mt-6 grid gap-2 sm:grid-cols-2">
            <li v-for="(p, i) in shown" :key="p.name" :style="{ '--i': 3 + i }" class="cascade person-row flex items-center gap-3 rounded-xl px-3 py-2.5">
              <span class="monogram grid size-9 shrink-0 place-items-center rounded-full text-[13px]" aria-hidden="true"><span class="chrome-num">{{ initials(p.name) }}</span></span>
              <span class="min-w-0 flex-1 truncate text-[15px] font-medium text-white">{{ p.name }}</span>
              <span class="shrink-0 text-xs font-medium tracking-[0.08em] text-[#AEB9CF]">{{ p.branch }}</span>
            </li>
          </ul>
          <p v-else class="mt-10 text-center text-ink/70">No one matches “{{ q }}”.</p>
        </template>

        <!-- Hosts & Speakers, Performers, Committee: the event's name, then portrait cards -->
        <template v-else>
          <h2 style="--i: 2" class="cascade mt-8 font-sans text-sm font-medium tracking-[0.18em] text-[#AEB9CF] uppercase">{{ ev.title }} · {{ ev.when }}</h2>
          <section v-for="g in groups" :key="g.name" :class="g.name ? 'mt-10 first-of-type:mt-6' : 'mt-4'" :aria-label="g.name || undefined">
          <!-- group heading: chrome name, a hairline, the count -->
          <h3 v-if="g.name" :style="{ '--i': g.at }" class="cascade flex items-center gap-4">
            <span class="relative font-display text-[clamp(1.5rem,2.8vw,2rem)] leading-none font-semibold">
              <span class="chrome-shadow" aria-hidden="true">{{ g.name }}</span>
              <span class="chrome-text">{{ g.name }}</span>
            </span>
            <span class="h-px flex-1 bg-linear-to-r from-white/40 to-transparent" aria-hidden="true" />
            <span class="text-xs font-medium tracking-[0.18em] text-[#AEB9CF] uppercase">{{ g.cards.length }}</span>
          </h3>
          <ul class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3" :class="g.name && 'mt-5'">
            <!-- a headliner still under wraps: one wide spotlight card -->
            <li v-for="c in g.cards.filter((x) => x.secret)" :key="c.name + c.role" :style="{ '--i': c.at }" class="cascade spotlight-card col-span-full grid overflow-hidden rounded-3xl md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <div class="spotlight-stage relative grid min-h-56 place-items-center md:min-h-72" aria-hidden="true">
                <Sparkle twinkle class="relative z-[1] size-20 md:size-28" />
                <Sparkle twinkle class="absolute top-[22%] left-[24%] size-3 [animation-delay:0.8s]" />
                <Sparkle twinkle class="absolute right-[22%] bottom-[30%] size-2.5 [animation-delay:1.6s]" />
              </div>
              <div class="flex flex-col justify-center px-6 pb-8 md:py-10 md:pr-10 md:pl-2">
                <p class="text-xs font-medium tracking-[0.3em] text-[#AEB9CF] uppercase">The main act</p>
                <h3 class="relative mt-3 font-display text-[clamp(2.4rem,5.5vw,4rem)] leading-[0.95] font-semibold">
                  <span class="chrome-shadow" aria-hidden="true">{{ c.name }}</span>
                  <span class="chrome-text chrome-shine">{{ c.name }}</span>
                </h3>
                <p v-if="c.note" class="mt-4 text-[15px] text-ink/80">{{ c.note }}</p>
                <p class="mt-1 text-sm text-ink/60">Revealed closer to the night.</p>
              </div>
            </li>
            <li v-for="c in g.cards.filter((x) => !x.secret)" :key="c.name + c.role" :style="{ '--i': c.at }" class="cascade portrait-card group overflow-hidden rounded-2xl">
              <div class="relative aspect-[4/5] overflow-hidden">
                <img v-if="c.image" :src="c.image" :alt="c.name" class="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.03]" loading="lazy" />
                <!-- no photo yet: a chrome monogram on the night sky -->
                <div v-else class="portrait-night absolute inset-0 grid place-items-center" aria-hidden="true">
                  <span class="chrome-num text-[clamp(2.6rem,7vw,4.2rem)] leading-none">{{ initials(c.name) }}</span>
                </div>
                <span class="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-[#060E2C] to-transparent" aria-hidden="true" />
              </div>
              <div class="px-4 pt-1 pb-4">
                <p class="text-[10.5px] font-medium tracking-[0.18em] text-[#AEB9CF] uppercase">{{ c.role }}</p>
                <h3 class="mt-1 text-[17px] leading-snug font-semibold text-white">{{ c.name }}</h3>
                <p v-if="c.note" class="mt-0.5 text-[13px] text-ink/70">{{ c.note }}</p>
              </div>
            </li>
          </ul>
          </section>
        </template>
      </div>
    </Transition>
    </div>
    </div>
  </section>
</template>
