<script setup>
import PageHeader from '../components/PageHeader.vue'
import { event } from '../content/event.js'
import { tips, faq, contact } from '../content/info.js'

const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(event.mapQuery)}&output=embed`
</script>

<template>
  <PageHeader eyebrow="Info" title="Know Before You Go" />

  <!-- Venue -->
  <section class="bg-navy-950 px-5 py-20 sm:py-28">
    <div class="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1fr_1.4fr] md:items-center">
      <div v-reveal>
        <p class="eyebrow">Venue</p>
        <h2 class="silver-text mt-3 font-display text-3xl sm:text-4xl">{{ event.venue }}</h2>
        <p class="mt-3 text-muted">{{ event.city }}</p>
        <p class="mt-6 text-[15px]">[Full address and parking details to follow.]</p>
      </div>
      <div v-reveal class="overflow-hidden rounded-2xl border border-white/10">
        <!-- ponytail: invert filter = cheap dark map; swap for styled Maps JS API if branding needs it -->
        <iframe
          :src="mapEmbed"
          title="Map to East Ocean Palace"
          class="aspect-[4/3] w-full [filter:invert(92%)_hue-rotate(185deg)_saturate(0.6)]"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  </section>

  <!-- Tips -->
  <section class="night px-5 py-20 sm:py-28">
    <div class="mx-auto max-w-5xl">
      <p class="eyebrow">Travel tips</p>
      <h2 class="silver-text mt-3 font-display text-3xl sm:text-4xl">Welcome to Manila</h2>
      <div class="mt-10 grid gap-5 sm:grid-cols-2">
        <article v-for="t in tips" :key="t.title" v-reveal class="card p-6">
          <h3 class="font-display text-xl">{{ t.title }}</h3>
          <p class="mt-2 text-[15px] text-ink/85">{{ t.body }}</p>
        </article>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="bg-navy-950 px-5 py-20 sm:py-28">
    <div class="mx-auto max-w-3xl">
      <p class="eyebrow">FAQ</p>
      <h2 class="silver-text mt-3 font-display text-3xl sm:text-4xl">Questions</h2>
      <div class="mt-10 divide-y divide-white/10 border-y border-white/10">
        <details v-for="f in faq" :key="f.q" class="group">
          <summary class="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-4 font-display text-lg [&::-webkit-details-marker]:hidden">
            {{ f.q }}
            <span aria-hidden="true" class="shrink-0 text-2xl text-ink/70 transition group-open:rotate-45">+</span>
          </summary>
          <p class="pb-6 text-ink/85">{{ f.a }}</p>
        </details>
      </div>
    </div>
  </section>

  <!-- Contact -->
  <section class="night px-5 py-20 text-center sm:py-28">
    <div v-reveal class="mx-auto max-w-xl">
      <p class="eyebrow">Contact</p>
      <h2 class="silver-text mt-3 font-display text-3xl sm:text-4xl">{{ contact.group }}</h2>
      <p class="mt-5 text-muted">{{ contact.line }}</p>
      <p class="mt-6 text-lg">{{ contact.email }}</p>
    </div>
  </section>
</template>
