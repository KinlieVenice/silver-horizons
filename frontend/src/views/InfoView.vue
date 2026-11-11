<!-- Info: the banner (site atmosphere; lockup Everything to / KNOW in chrome / before you go; two ribbons braid
     across the horizon), then venue + map in one glass card, travel tips as glass cards with chrome
     numerals, the FAQ as a glass accordion, and the contact in the invitation-card style. No scroll fade-ins. -->
<script setup>
import Ribbon from '../components/Ribbon.vue'
import Sparkle from '../components/Sparkle.vue'
import HorizonGlow from '../components/HorizonGlow.vue'
import SectionHead from '../components/SectionHead.vue'
import { event } from '../content/event.js'
import { content } from '../lib/session.js'

const { tips, faq, contact } = content // loaded after sign-in, before any page renders

const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(event.mapQuery)}&output=embed`
const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.mapQuery)}`
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

  <div class="relative isolate bg-navy-950 font-normal">
    <div class="star-dust absolute inset-0 -z-10 opacity-60" aria-hidden="true" />

    <!-- Venue: details and map in one glass card -->
    <section class="px-5 pt-12 pb-20 md:px-8 md:pb-28 lg:pt-20" aria-labelledby="venue-h">
      <div class="mx-auto max-w-5xl">
        <SectionHead id="venue-h" eyebrow="Venue" :title="event.venue" />
        <div class="invite-card mt-10 grid overflow-hidden rounded-3xl md:grid-cols-[1fr_1.5fr]">
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
    </section>

    <!-- Travel tips -->
    <section class="px-5 pb-20 md:px-8 md:pb-28" aria-labelledby="tips-h">
      <div class="mx-auto max-w-5xl">
        <SectionHead id="tips-h" eyebrow="Travel tips" title="Welcome to Manila" />
        <div class="mt-10 grid gap-5 sm:grid-cols-2">
          <article v-for="(t, i) in tips" :key="t.title" class="stop-card flex gap-5 rounded-2xl p-6 md:p-7">
            <span class="chrome-num text-[2.4rem] leading-none" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
            <div>
              <h3 class="text-xl font-semibold text-white">{{ t.title }}</h3>
              <p class="mt-2 text-base leading-relaxed text-ink">{{ t.body }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="px-5 pb-20 md:px-8 md:pb-28" aria-labelledby="faq-h">
      <div class="mx-auto max-w-3xl">
        <SectionHead id="faq-h" eyebrow="FAQ" title="Questions" />
        <div class="mt-10 space-y-3">
          <details v-for="f in faq" :key="f.q" class="faq-item group rounded-2xl">
            <summary class="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 px-6 py-4 text-lg font-semibold text-white [&::-webkit-details-marker]:hidden">
              {{ f.q }}
              <span aria-hidden="true" class="grid size-8 shrink-0 place-items-center rounded-full border border-white/20 text-lg leading-none text-white/80 transition group-open:rotate-45 group-open:border-white/50">+</span>
            </summary>
            <p class="px-6 pb-6 text-base leading-relaxed text-ink">{{ f.a }}</p>
          </details>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section class="px-5 pb-28 md:px-8" aria-labelledby="contact-h">
      <div class="invite-card mx-auto max-w-3xl rounded-3xl p-8 text-center md:p-12">
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
      </div>
    </section>
  </div>
</template>
