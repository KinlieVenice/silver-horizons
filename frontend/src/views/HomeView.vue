<script setup>
import logo from '../assets/brand/silver-horizons-logo.webp'
import Countdown from '../components/Countdown.vue'
import Ribbon from '../components/Ribbon.vue'
import Sparkle from '../components/Sparkle.vue'
import HorizonGlow from '../components/HorizonGlow.vue'
import { event } from '../content/event.js'

const teasers = [
  { to: '/itinerary', n: '01', label: 'Itinerary', title: 'The Manila Experience', body: 'Day-by-day schedule from arrival to the big night.' },
  { to: '/gala', n: '02', label: 'The Main Event', title: 'Silver Horizons Night', body: `${event.dateLabel} · ${event.venue}` },
  { to: '/info', n: '03', label: 'Info', title: 'Know Before You Go', body: 'Venue, travel tips, FAQ and contacts.' },
]
</script>

<template>
  <!-- Hero -->
  <section class="night relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 pt-10 pb-44 text-center md:pt-24">
    <Sparkle twinkle class="absolute top-[14%] left-[10%] -z-10 size-3" />
    <Sparkle twinkle class="absolute top-[26%] right-[12%] -z-10 size-2 [animation-delay:1.2s]" />
    <Sparkle twinkle class="absolute top-[8%] right-[30%] -z-10 size-1.5 [animation-delay:2.1s]" />
    <Ribbon
      draw
      class="absolute inset-x-0 bottom-20 -z-10 h-56 w-full"
      viewBox="0 0 1200 300"
      d="M -60 250 C 200 290, 420 130, 560 170 C 700 210, 640 300, 560 260 C 480 220, 620 120, 860 150 S 1150 210, 1260 120"
      :width="8"
    />
    <HorizonGlow class="-z-10" />

    <h1 class="sr-only">Silver Horizons — FELCO 25th Anniversary</h1>
    <img
      :src="logo"
      alt="FELCO 25 Years and Climbing Higher. Silver Horizons: Celebrating the Journey, Embracing the Future."
      class="h-auto w-[min(96vw,820px)]"
      fetchpriority="high"
    />
    <p class="eyebrow mt-6 sm:mt-10">
      {{ event.dateLabel }}<span class="max-sm:hidden"> &nbsp;·&nbsp; </span><span class="block sm:inline">{{ event.venue }}</span>
    </p>
    <Countdown :target="event.startsAt" class="mt-6" />
  </section>

  <!-- Welcome -->
  <section class="relative bg-navy-950 px-6 py-24 text-center sm:py-36">
    <div v-reveal class="mx-auto max-w-2xl">
      <Sparkle class="mx-auto size-5" />
      <h2 class="silver-text mt-8 font-display text-[2rem] leading-tight md:-mx-20 md:text-5xl md:whitespace-nowrap">
        A journey worth celebrating.<br />A horizon worth looking toward.
      </h2>
      <div class="rule mx-auto my-10 w-40" />
      <p class="text-pretty">Throughout the year, we’ve celebrated the people, partnerships, challenges, and milestones that brought FELCO to 25.</p>
      <p class="mt-5 text-pretty">Let’s come together to honor how far we’ve come and welcome the possibilities ahead.</p>
      <p class="mt-10 font-display text-xl text-ink italic sm:text-2xl">25 years brought us here.<br />The new horizon awaits.</p>
    </div>
  </section>

  <!-- Statement -->
  <section class="night relative isolate overflow-hidden px-6 py-28 sm:py-40">
    <Ribbon
      draw
      class="absolute inset-0 -z-10 h-full w-full opacity-90"
      d="M -40 540 C 360 580, 700 540, 880 420 S 1100 140, 1150 60"
      :width="10"
    />
    <Sparkle twinkle class="absolute top-[10%] left-[95.8%] -z-10 size-7 -translate-x-1/2 -translate-y-1/2" />
    <div class="mx-auto grid max-w-5xl gap-14 md:grid-cols-2 md:items-end">
      <h2 v-reveal class="font-display text-6xl leading-[0.98] font-semibold sm:text-8xl">
        <span class="silver-text">This is<br />Our Silver</span><br />
        <span class="silver-text-dim">Moment</span>
      </h2>
      <div v-reveal class="text-lg md:pb-3 md:pl-10">
        <p>25 years behind us.<br />New horizons ahead.</p>
        <p class="mt-6 text-muted">Celebrate the journey.<br />Step into Silver Horizons.</p>
      </div>
    </div>
  </section>

  <!-- Teasers -->
  <section class="bg-navy-950 px-6 pt-8 pb-24 sm:pb-32">
    <div class="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
      <RouterLink v-for="t in teasers" :key="t.to" v-reveal :to="t.to" class="card group flex flex-col p-7">
        <p class="eyebrow">{{ t.n }} — {{ t.label }}</p>
        <h3 class="mt-6 font-display text-2xl">{{ t.title }}</h3>
        <p class="mt-2 text-[15px] text-muted">{{ t.body }}</p>
        <span class="mt-auto pt-8 text-sm tracking-[0.2em] text-ink/80 uppercase transition group-hover:translate-x-1" aria-hidden="true">View →</span>
      </RouterLink>
    </div>
  </section>
</template>
