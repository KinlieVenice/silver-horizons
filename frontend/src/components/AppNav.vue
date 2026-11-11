<!-- Navigation floats over the page instead of sitting in a bar.
     Desktop: wordmark left · glass pill center.
     Phone: glass pill at the bottom; tucks away while scrolling down, returns on scroll up and at the footer.
     Home: fades in with the opening.
     Back to top: a glass button fixed bottom-right (on phones above the pill), shown once the first screen is scrolled past.
     translateZ(0) on the phone pill and the button: own compositing layer, so iOS Safari can't hand their
     taps to an iframe underneath (Info's Google Map). -->
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import NavPill from './NavPill.vue'
import wordmark from '../assets/brand/silver-horizons-wordmark.webp'
import { lenis } from '../lib/smoothScroll.js'

const links = [
  { to: '/', label: 'Home' },
  { to: '/itinerary', label: 'Itinerary' },
  { to: '/people', label: 'People' },
  { to: '/info', label: 'Info' },
]

// fade in with the opening only when the visit starts on Home
const intro = window.location.pathname === import.meta.env.BASE_URL

// phone pill: hide while scrolling down past the first screen, show on any scroll up
const tucked = ref(false)
let lastY = 0
// on Home's opening the big logo is on screen: the nav wordmark waits until it has scrolled away
const route = useRoute()
const pastHero = ref(false)
const showTop = ref(false)
const showMark = computed(() => route.path !== '/' || pastHero.value)
const onScroll = () => {
  const y = window.scrollY
  pastHero.value = y > window.innerHeight * 0.6
  showTop.value = y > window.innerHeight
  // the last stretch of the page (the footer) keeps the pill out: there is nowhere further down to go
  const atEnd = y + window.innerHeight > document.documentElement.scrollHeight - 400
  if (atEnd) tucked.value = false
  if (Math.abs(y - lastY) < 6) return
  tucked.value = y > lastY && y > 240 && !atEnd
  lastY = y
}
// glide to the top in a fixed 600ms (a browser smooth scroll over a long page can outlast Home's
// autoplay idle wait, which would then pull the page back down mid-way)
const toTop = () => {
  if (lenis) return lenis.scrollTo(0, { duration: 1.1 })
  const from = window.scrollY
  const t0 = performance.now()
  const step = (now) => {
    const t = Math.min(1, (now - t0) / 600)
    window.scrollTo(0, from * (1 - t) ** 3)
    if (t < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <!-- Desktop -->
  <header class="pointer-events-none fixed inset-x-0 top-4 z-40 hidden md:block" :class="intro && 'intro-after'">
    <nav class="mx-auto flex max-w-6xl items-center justify-between px-6" aria-label="Main">
      <RouterLink to="/" class="pointer-events-auto block transition-opacity duration-500" :class="!showMark && 'pointer-events-none opacity-0'" aria-label="Silver Horizons home">
        <img :src="wordmark" alt="" class="h-11 w-auto drop-shadow-[0_2px_12px_rgb(0_0_0/0.6)]" />
      </RouterLink>
      <div class="pointer-events-auto absolute left-1/2 -translate-x-1/2"><NavPill :links="links" /></div>
    </nav>
  </header>

  <!-- Phone -->
  <nav
    class="pointer-events-none fixed inset-x-0 z-40 flex justify-center [transform:translateZ(0)] transition-[translate,opacity] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] md:hidden"
    :class="tucked && 'translate-y-[150%] opacity-0'"
    style="bottom: calc(0.75rem + env(safe-area-inset-bottom))"
    aria-label="Main"
  >
    <div class="pointer-events-auto" :class="intro && 'intro-after'"><NavPill :links="links" compact /></div>
  </nav>

  <!-- Back to top -->
  <button
    type="button"
    class="fixed right-3 z-40 grid size-11 [transform:translateZ(0)] place-items-center rounded-full border border-white/12 bg-navy-950/55 text-white/85 shadow-[0_10px_40px_-12px_rgb(0_0_0/0.8),inset_0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-xl transition-[translate,opacity,color,border-color] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] hover:border-white/40 hover:text-white active:scale-95 max-md:bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:right-6 md:bottom-6 md:size-12"
    :class="!showTop && 'pointer-events-none translate-y-4 opacity-0'"
    :tabindex="showTop ? 0 : -1"
    aria-label="Back to top"
    @click="toTop"
  >
    <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 19V6M6.5 11.5 12 6l5.5 5.5" />
    </svg>
  </button>
</template>
