<!-- Info: the banner (site atmosphere; lockup Everything to / KNOW in chrome / before you go; two ribbons braid
     across the horizon), then tabs, like People: a side index on desktop, a sticky segmented control on phones.
     Venue (photo, address, directions, map) · What to wear (the Canva lookbook) · Travel (tips) · FAQ (searchable
     accordion). Each tab has its own link (/info#faq) and the contact card sits under every tab. Switching tabs
     uses the Itinerary's day transition (slide out, cascade in). -->
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Ribbon from '../components/Ribbon.vue'
import Sparkle from '../components/Sparkle.vue'
import HorizonGlow from '../components/HorizonGlow.vue'
import SectionHead from '../components/SectionHead.vue'
import { event } from '../content/event.js'
import venuePhoto from '../assets/photos/east-ocean-palace.webp'
import { content } from '../lib/session.js'

const { tips, faq, contact } = content // loaded after sign-in, before any page renders

const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(event.mapQuery)}&output=embed`
const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.mapQuery)}`
// tabs; each has its own link (#venue, #wear, #travel, #faq)
const tabs = [
  { id: 'venue', label: 'Venue', short: 'Venue', sub: event.venue },
  { id: 'wear', label: 'What to wear', short: 'Wear', sub: 'The lookbook' },
  { id: 'travel', label: 'Travel tips', short: 'Travel', sub: 'Getting around Manila' },
  { id: 'faq', label: 'FAQ', short: 'FAQ', sub: 'Questions, answered' },
]
const fromHash = () => tabs.find((t) => `#${t.id}` === location.hash)?.id ?? 'venue'
const tab = ref(fromHash())
const dir = ref(1)
const top = ref()
const pick = (id) => {
  if (id === tab.value) return
  dir.value = tabs.findIndex((t) => t.id === id) > tabs.findIndex((t) => t.id === tab.value) ? 1 : -1
  tab.value = id
  history.replaceState(history.state, '', `#${id}`)
  const y = top.value?.getBoundingClientRect().top ?? 0
  if (y < 0) window.scrollTo({ top: window.scrollY + y - 140, behavior: 'smooth' })
}
const onHash = () => (tab.value = fromHash())
onMounted(() => window.addEventListener('hashchange', onHash))
onUnmounted(() => window.removeEventListener('hashchange', onHash))

// FAQ: search the questions and answers
const q = ref('')
const faqShown = computed(() => {
  const s = q.value.trim().toLowerCase()
  return s ? faq.filter((f) => `${f.q} ${f.a}`.toLowerCase().includes(s)) : faq
})

// glints on the chrome KNOW (% of the lettering box)
const glints = [
  { x: 5, y: 16, s: 18, d: 0 },
  { x: 62, y: 86, s: 14, d: 1.1 },
  { x: 94, y: 14, s: 20, d: 0.6 },
]
</script>

<template>
  <header class="night relative isolate flex min-h-[max(46svh,27rem)] flex-col md:min-h-[max(48svh,33rem)] items-center justify-center-safe overflow-hidden px-6 pt-16 pb-28 text-center md:pt-20 md:pb-36">
    <div class="star-dust intro-glow absolute inset-0 -z-10" aria-hidden="true" />
    <div class="hero-spot intro-glow absolute top-0 left-1/2 -z-10 h-[60svh] w-[90vw] -translate-x-1/2" aria-hidden="true" />
    <div class="hero-beam hero-beam--l intro-glow absolute -top-[10svh] left-1/2 -z-10 h-[70svh] w-[38vw]" aria-hidden="true" />
    <div class="hero-beam hero-beam--r intro-glow absolute -top-[10svh] left-1/2 -z-10 h-[70svh] w-[38vw]" aria-hidden="true" />
    <!-- two ribbons enter from opposite sides and braid across the horizon (a double helix), crossing three
         times; the back one is slimmer and dimmer for depth -->
    <div class="absolute inset-x-[-30vw] bottom-4 -z-10 h-[min(8rem,14svh)] md:inset-x-[-6vw] lg:inset-x-0 lg:h-[min(10rem,18svh)]" aria-hidden="true">
      <Ribbon
        draw
        :delay="900"
        :duration="2600"
        class="absolute inset-0 opacity-60"
        viewBox="0 0 1200 300"
        d="M 1260 230 C 1100 80, 930 80, 900 150 C 870 220, 760 260, 600 150 C 440 40, 330 80, 300 150 C 270 220, 100 230, -60 70"
        :width="10"
        :twists="3"
      />
      <Ribbon
        draw
        :delay="600"
        :duration="2600"
        class="absolute inset-0"
        viewBox="0 0 1200 300"
        d="M -60 230 C 100 80, 270 80, 300 150 C 330 220, 440 260, 600 150 C 760 40, 870 80, 900 150 C 930 220, 1100 230, 1260 70"
        :width="16"
        :twists="3"
      />
    </div>
    <HorizonGlow class="-z-10" intro />

    <p class="intro-after flex items-center justify-center gap-4 text-xs font-medium tracking-[0.36em] text-white/80 uppercase">
      <span class="h-px w-8 bg-linear-to-r from-transparent to-white/70 sm:w-14" aria-hidden="true" />
      Info
      <span class="h-px w-8 bg-linear-to-l from-transparent to-white/70 sm:w-14" aria-hidden="true" />
    </p>
    <h1 class="intro-logo mt-6 font-display leading-none">
      <span class="block text-[clamp(1.5rem,3.4vw,2.5rem)] font-medium text-white/90">Everything to</span>
      <span class="relative mt-1 inline-block text-[clamp(3.6rem,11vw,8rem)]">
        <span class="chrome-shadow" aria-hidden="true">KNOW</span>
        <span class="chrome-text chrome-shine">KNOW</span>
        <Sparkle
          v-for="(g, i) in glints"
          :key="i"
          class="glimmer absolute"
          :style="`left:${g.x}%;top:${g.y}%;width:${g.s}px;height:${g.s}px;animation-delay:${1.6 + g.d}s`"
          aria-hidden="true"
        />
      </span>
      <span class="mt-3 block font-sans text-[clamp(0.85rem,1.6vw,1.15rem)] font-medium tracking-[0.5em] text-white/85 uppercase">Before you go</span>
    </h1>
  </header>

  <section class="relative isolate min-h-[70svh] bg-navy-950 px-5 pt-12 pb-28 font-normal md:px-8 lg:pt-20">
    <div class="star-dust absolute inset-0 -z-10 opacity-60" aria-hidden="true" />

    <!-- phones and tablets: the tabs as a floating segmented control that sticks just under the top -->
    <div class="sticky top-3 z-30 mx-auto mb-10 max-w-3xl md:top-[4.5rem] lg:hidden">
      <div class="flex gap-1.5 rounded-full border border-white/14 bg-[#0A1438]/85 p-1 shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_14px_34px_-14px_rgb(0_0_0/0.9)] backdrop-blur-lg" role="tablist" aria-label="Info">
        <button
          v-for="t in tabs"
          :key="t.id"
          type="button"
          role="tab"
          class="day-btn min-h-11 flex-1 rounded-full px-1.5 text-[13px] font-semibold md:text-sm"
          :class="t.id === tab && 'is-active'"
          :aria-selected="t.id === tab"
          @click="pick(t.id)"
        >
          <span class="md:hidden">{{ t.short }}</span><span class="max-md:hidden">{{ t.label }}</span>
        </button>
      </div>
    </div>

    <div class="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[17rem_1fr]">
      <!-- desktop: the Itinerary's day index (glass cards, chrome numerals, arrow; the chosen one says Viewing) -->
      <nav class="hidden lg:block" aria-label="Info sections">
        <ol class="sticky top-28 space-y-3">
          <li class="eyebrow mb-4 flex items-center gap-3" aria-hidden="true"><span class="h-px w-8 bg-linear-to-r from-transparent to-white/70" />Before you go</li>
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
          <!-- Venue: photo, details and map in one glass card -->
          <div v-if="tab === 'venue'" key="venue">
            <SectionHead id="venue-h" style="--i: 0" class="cascade" eyebrow="Venue" :title="event.venue" />
            <div style="--i: 1" class="cascade invite-card mt-10 grid overflow-hidden rounded-3xl md:grid-cols-[1fr_1.5fr]">
              <!-- the venue at night, across the top of the card, so it's easy to spot on arrival -->
              <div class="relative aspect-[16/10] border-b border-white/10 sm:aspect-[2/1] md:col-span-2">
                <img :src="venuePhoto" alt="East Ocean Palace at night, its lit sign over the entrance" class="absolute inset-0 size-full object-cover object-[center_72%]" loading="lazy" />
                <span class="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-[#0B1534]/80 to-transparent" aria-hidden="true" />
              </div>
              <div class="flex flex-col justify-center p-7 md:p-10">
                <p class="text-xs font-medium tracking-[0.24em] text-[#AEB9CF] uppercase">Where</p>
                <p class="mt-2 text-2xl font-semibold text-white">{{ event.venue }}</p>
                <p class="mt-1 text-[15px] text-[#C3CDE0]">{{ event.city }}</p>
                <p class="mt-6 text-base text-ink">[Full address and parking details to follow.]</p>
                <a
                  :href="mapsUrl"
                  target="_blank"
                  rel="noopener"
                  class="mt-7 inline-flex min-h-11 w-fit items-center rounded-full bg-white px-6 text-xs font-medium tracking-[0.22em] text-navy-950 uppercase transition hover:-translate-y-0.5 hover:bg-ink active:translate-y-0"
                >Get directions</a>
              </div>
              <div class="relative min-h-72 border-t border-white/10 md:border-t-0 md:border-l">
                <!-- ponytail: invert filter = cheap dark map; swap for styled Maps JS API if branding needs it -->
                <iframe
                  :src="mapEmbed"
                  title="Map to East Ocean Palace"
                  class="absolute inset-0 size-full [filter:invert(92%)_hue-rotate(185deg)_saturate(0.6)]"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>

          <!-- What to wear: the official Canva lookbook, with a link to open it full screen -->
          <div v-else-if="tab === 'wear'" key="wear">
            <SectionHead id="lookbook-h" style="--i: 0" class="cascade" eyebrow="Lookbook" title="What to wear" />
            <div style="--i: 1" class="cascade invite-card mt-10 grid items-center gap-8 overflow-hidden rounded-3xl p-5 md:grid-cols-[1fr_minmax(0,22rem)] md:gap-10 md:p-10">
              <div class="px-2 md:px-0">
                <p class="text-xs font-medium tracking-[0.24em] text-[#AEB9CF] uppercase">Silver Horizons Night</p>
                <p class="mt-3 text-2xl leading-snug font-semibold text-white">The official lookbook for the night.</p>
                <p class="mt-3 text-base leading-relaxed text-ink">Flip through it for outfit ideas, and dress to shine: there’s a Best Dressed award on the programme.</p>
                <a
                  :href="event.lookbook"
                  target="_blank"
                  rel="noopener"
                  class="mt-7 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-white px-6 text-xs font-medium tracking-[0.22em] text-navy-950 uppercase transition hover:-translate-y-0.5 hover:bg-ink active:translate-y-0"
                >Open full screen
                  <svg viewBox="0 0 24 24" class="size-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-8 8M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
                </a>
              </div>
              <!-- exactly the page's shape (794 × 1123): with no spare room Canva lays its controls over the bottom of
                   the page on a soft gradient (and fades them out), so there's no black band anywhere -->
              <div class="mx-auto w-full max-w-[22rem]">
                <div class="photo-frame relative aspect-[794/1123] overflow-hidden rounded-2xl bg-navy-900">
                  <iframe
                    :src="`${event.lookbook}?embed`"
                    title="Silver Horizons lookbook"
                    class="absolute inset-0 size-full border-0"
                    loading="lazy"
                    allow="fullscreen"
                    allowfullscreen
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Travel tips -->
          <div v-else-if="tab === 'travel'" key="travel">
            <SectionHead id="tips-h" style="--i: 0" class="cascade" eyebrow="Travel tips" title="Welcome to Manila" />
            <div class="mt-10 grid gap-5 sm:grid-cols-2">
              <article v-for="(t, i) in tips" :key="t.title" :style="{ '--i': 1 + i }" class="cascade stop-card flex gap-5 rounded-2xl p-6 md:p-7">
                <span class="chrome-num text-[2.4rem] leading-none" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
                <div>
                  <h3 class="text-xl font-semibold text-white">{{ t.title }}</h3>
                  <p class="mt-2 text-base leading-relaxed text-ink">{{ t.body }}</p>
                </div>
              </article>
            </div>
          </div>

          <!-- FAQ: search, then the questions as a glass accordion -->
          <div v-else key="faq">
            <SectionHead id="faq-h" style="--i: 0" class="cascade" eyebrow="FAQ" title="Questions" />
            <label style="--i: 1" class="cascade relative mt-8 block max-w-md">
              <span class="sr-only">Search the questions</span>
              <svg viewBox="0 0 24 24" class="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/50" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
              <input v-model="q" type="search" placeholder="Search questions, e.g. dress code" class="glass-input min-h-11 w-full rounded-full py-2 pr-4 pl-10 text-[15px] text-white placeholder:text-white/45" />
            </label>
            <div class="mt-6 space-y-3">
              <details v-for="(f, i) in faqShown" :key="f.q" :style="{ '--i': 2 + i }" class="cascade faq-item group rounded-2xl">
                <summary class="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 px-6 py-4 text-lg font-semibold text-white [&::-webkit-details-marker]:hidden">
                  {{ f.q }}
                  <span aria-hidden="true" class="grid size-8 shrink-0 place-items-center rounded-full border border-white/20 text-lg leading-none text-white/80 transition group-open:rotate-45 group-open:border-white/50">+</span>
                </summary>
                <p class="px-6 pb-6 text-base leading-relaxed text-ink">{{ f.a }}</p>
              </details>
              <p v-if="!faqShown.length" class="py-6 text-center text-ink/70">No questions match “{{ q }}”. Ask the team below.</p>
            </div>
          </div>
        </Transition>

        <!-- Contact: under every tab -->
        <section class="invite-card mt-16 rounded-3xl p-8 text-center md:p-12" aria-labelledby="contact-h">
          <p class="flex items-center justify-center gap-4 text-xs font-medium tracking-[0.32em] text-white/80 uppercase">
            <span class="h-px w-8 bg-linear-to-r from-transparent to-white/70" aria-hidden="true" />
            Contact
            <span class="h-px w-8 bg-linear-to-l from-transparent to-white/70" aria-hidden="true" />
          </p>
          <h2 id="contact-h" class="mt-4 text-[clamp(1.8rem,3.6vw,2.8rem)] leading-tight">
            <span class="relative inline-block">
              <span class="chrome-shadow" aria-hidden="true">{{ contact.group }}</span>
              <span class="chrome-text">{{ contact.group }}</span>
            </span>
          </h2>
          <p class="mx-auto mt-5 max-w-md text-base text-ink">{{ contact.line }}</p>
          <p class="mt-6 text-lg font-semibold text-white">{{ contact.email }}</p>
        </section>
      </div>
    </div>
  </section>
</template>
