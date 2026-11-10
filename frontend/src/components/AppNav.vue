<!-- Navigation floats over the page instead of sitting in a bar.
     Desktop: wordmark left · glass pill center.
     Phone: glass pill at the bottom; tucks away while scrolling down, returns on scroll up and at the footer.
     Home: fades in with the opening. -->
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import NavPill from './NavPill.vue'
import wordmark from '../assets/brand/silver-horizons-wordmark.webp'

const links = [
  { to: '/', label: 'Home' },
  { to: '/itinerary', label: 'Itinerary' },
  // { to: '/gala', label: 'Gala' },  // hidden for now
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
const showMark = computed(() => route.path !== '/' || pastHero.value)
const onScroll = () => {
  const y = window.scrollY
  pastHero.value = y > window.innerHeight * 0.6
  // the last stretch of the page (the footer) keeps the pill out: there is nowhere further down to go
  const atEnd = y + window.innerHeight > document.documentElement.scrollHeight - 400
  if (atEnd) tucked.value = false
  if (Math.abs(y - lastY) < 6) return
  tucked.value = y > lastY && y > 240 && !atEnd
  lastY = y
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
    class="pointer-events-none fixed inset-x-0 z-40 flex justify-center transition-[translate,opacity] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] md:hidden"
    :class="tucked && 'translate-y-[150%] opacity-0'"
    style="bottom: calc(0.75rem + env(safe-area-inset-bottom))"
    aria-label="Main"
  >
    <div class="pointer-events-auto" :class="intro && 'intro-after'"><NavPill :links="links" compact /></div>
  </nav>
</template>
