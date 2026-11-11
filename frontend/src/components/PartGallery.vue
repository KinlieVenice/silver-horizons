<!-- An activity's photos: one, or a swipeable slider (arrows on desktop, dots). Each photo opens a fact card: the
     photo large, its title and place, and its facts if it has any (a glass "Facts" badge says so). The card is a
     native <dialog> (focus, Esc, screen readers for free); arrows step through the photos, ✕ / Esc / a tap
     outside closes it. images: [{ image?, title, place?, facts?: [] }]; no image = a night-sky placeholder with the
     title in chrome (until a photo comes). Fixed sizes throughout: every thumbnail the same frame, the card's image
     area always 16:9 and its text area one height, so nothing jumps; photos fill their frame (object-cover). -->
<script setup>
import { ref } from 'vue'
import Sparkle from './Sparkle.vue'
import { lenis } from '../lib/smoothScroll.js'

const props = defineProps({ images: { type: Array, required: true } })

// slider
const track = ref()
const at = ref(0)
const onScroll = () => {
  const el = track.value
  at.value = Math.round(el.scrollLeft / Math.max(1, el.clientWidth))
}
const go = (i) => track.value.scrollTo({ left: i * track.value.clientWidth, behavior: 'smooth' })

// fact card
const dlg = ref()
const shown = ref(0)
const open = (i) => {
  shown.value = i
  dlg.value.showModal()
  lenis?.stop() // the page stays put behind the card
}
const step = (d) => (shown.value = (shown.value + d + props.images.length) % props.images.length)
const onClose = () => lenis?.start()
</script>

<template>
  <div class="relative mt-4">
    <ul
      ref="track"
      class="flex snap-x snap-mandatory gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      data-lenis-prevent-horizontal
      @scroll.passive="onScroll"
    >
      <li v-for="(p, i) in images" :key="p.title + i" class="w-full shrink-0 snap-start">
        <button
          type="button"
          class="photo-frame group relative block aspect-[4/3] w-full overflow-hidden rounded-xl text-left sm:aspect-[21/8]"
          :aria-label="`${p.title}: ${p.facts?.length ? 'open facts' : 'view photo'}`"
          @click="open(i)"
        >
          <img v-if="p.image" :src="p.image" alt="" width="1200" height="800" class="absolute inset-0 size-full object-cover" loading="lazy" draggable="false" />
          <span v-else class="film-night absolute inset-0 grid place-items-center pb-10" aria-hidden="true">
            <Sparkle twinkle class="size-8 opacity-80" />
          </span>
          <span v-if="p.facts?.length" class="glass-pill absolute top-3 right-3 flex items-center gap-1.5 bg-navy-950/55! text-[11px] font-medium tracking-[0.14em] text-white uppercase backdrop-blur-md transition group-hover:bg-white! group-hover:text-navy-950">
            <svg viewBox="0 0 24 24" class="size-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.5v.5" /></svg>
            Facts
          </span>
          <span class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/40 to-transparent p-3 pt-10 md:p-4 md:pt-16">
            <span class="block font-display text-[17px] leading-tight font-semibold text-white md:text-2xl">{{ p.title }}</span>
            <span v-if="p.place" class="mt-0.5 block text-[10.5px] font-medium tracking-[0.18em] text-white/75 uppercase">{{ p.place }}</span>
          </span>
        </button>
      </li>
    </ul>

    <!-- more than one photo: arrows (desktop) and dots -->
    <template v-if="images.length > 1">
      <button
        v-for="d in [-1, 1]"
        :key="d"
        type="button"
        class="absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-navy-950/60 text-white backdrop-blur-md transition hover:bg-white hover:text-navy-950 disabled:opacity-0 max-md:hidden"
        :class="d < 0 ? 'left-3' : 'right-3'"
        :disabled="d < 0 ? at === 0 : at === images.length - 1"
        :aria-label="d < 0 ? 'Previous photo' : 'Next photo'"
        @click="go(at + d)"
      >
        <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="d < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'" /></svg>
      </button>
      <div class="mt-2.5 flex justify-center gap-1.5">
        <button
          v-for="(p, i) in images"
          :key="i"
          type="button"
          class="h-1.5 rounded-full transition-all"
          :class="i === at ? 'w-5 bg-white' : 'w-1.5 bg-white/35 hover:bg-white/60'"
          :aria-label="`Photo ${i + 1}: ${p.title}`"
          @click="go(i)"
        />
      </div>
    </template>

    <!-- the fact card -->
    <dialog ref="dlg" class="fact-card m-auto w-[min(92vw,44rem)] overflow-hidden rounded-3xl p-0 text-left" :aria-label="images[shown].title" @click.self="dlg.close()" @close="onClose">
      <figure>
        <!-- one fixed shape for every slide (photo or placeholder), so the card never changes size as you step -->
        <div class="relative aspect-[16/9] overflow-hidden bg-navy-950">
          <img v-if="images[shown].image" :src="images[shown].image" :alt="images[shown].title" width="1200" height="800" class="absolute inset-0 size-full object-cover" />
          <div v-else class="film-night absolute inset-0 grid place-items-center" aria-hidden="true">
            <span class="relative px-8 text-center font-display text-[clamp(2rem,6vw,3.2rem)] leading-tight font-semibold">
              <span class="chrome-shadow">{{ images[shown].title }}</span>
              <span class="chrome-text">{{ images[shown].title }}</span>
            </span>
          </div>
          <button type="button" class="absolute top-3 right-3 grid size-10 place-items-center rounded-full border border-white/25 bg-navy-950/60 text-white backdrop-blur-md transition hover:bg-white hover:text-navy-950" aria-label="Close" @click="dlg.close()">
            <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
          <template v-if="images.length > 1">
            <button
              v-for="d in [-1, 1]"
              :key="d"
              type="button"
              class="absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-navy-950/60 text-white backdrop-blur-md transition hover:bg-white hover:text-navy-950"
              :class="d < 0 ? 'left-3' : 'right-3'"
              :aria-label="d < 0 ? 'Previous photo' : 'Next photo'"
              @click="step(d)"
            >
              <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="d < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'" /></svg>
            </button>
          </template>
        </div>
        <figcaption class="h-[min(38svh,22rem)] overflow-y-auto px-6 pt-5 pb-7 md:px-8">
          <p v-if="images.length > 1" class="text-[11px] font-medium tracking-[0.2em] text-[#AEB9CF] uppercase">{{ shown + 1 }} / {{ images.length }}</p>
          <h3 class="relative mt-1 font-display text-[clamp(1.6rem,4vw,2.2rem)] leading-tight font-semibold">
            <span class="chrome-shadow" aria-hidden="true">{{ images[shown].title }}</span>
            <span class="chrome-text">{{ images[shown].title }}</span>
          </h3>
          <p v-if="images[shown].place" class="mt-1 text-[11px] font-medium tracking-[0.18em] text-[#AEB9CF] uppercase">{{ images[shown].place }}</p>
          <ul v-if="images[shown].facts?.length" class="mt-5 space-y-3">
            <li v-for="f in images[shown].facts" :key="f" class="flex gap-3 text-[15px] leading-relaxed text-ink">
              <Sparkle class="mt-1.5 size-3 shrink-0" />
              <span>{{ f }}</span>
            </li>
          </ul>
        </figcaption>
      </figure>
    </dialog>
  </div>
</template>
