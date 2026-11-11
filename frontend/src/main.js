import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'
import { lenis } from './lib/smoothScroll.js'

// The site is a story that starts at its opening: a reload always starts at the top. Browsers restore the
// old position at different moments (Firefox after load, the back/forward cache on pageshow), so reset at each.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
const toTop = () => window.scrollTo(0, 0)
toTop()
window.addEventListener('load', () => requestAnimationFrame(toTop))
window.addEventListener('pageshow', (e) => e.persisted && toTop())

// iOS Safari drops a scroll made while the page is still bouncing or gliding from a swipe (tapping a button
// at the very end of Home): the next page then stays at its bottom. So after a page change, keep putting the
// page where it belongs for up to a second until it sticks; any touch, wheel or key hands control back.
const pin = (top) => {
  const t0 = performance.now()
  let raf = 0
  const quit = () => { cancelAnimationFrame(raf); inputs.forEach((e) => window.removeEventListener(e, quit)) }
  const inputs = ['touchstart', 'wheel', 'keydown']
  inputs.forEach((e) => window.addEventListener(e, quit, { passive: true }))
  const step = () => {
    if (Math.abs(window.scrollY - top) > 1) window.scrollTo(0, top)
    if (performance.now() - t0 < 1000) raf = requestAnimationFrame(step)
    else quit()
  }
  raf = requestAnimationFrame(step)
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('./views/HomeView.vue') },
    { path: '/itinerary', component: () => import('./views/ItineraryView.vue') },
    { path: '/info', component: () => import('./views/InfoView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  // back/forward between pages restores where you were; the first navigation of a load (a refresh, where
  // Vue Router would replay the position it saved before unload) always starts at the top
  scrollBehavior: (to, from, saved) => {
    const pos = (from.matched.length && saved) || { top: 0 }
    lenis?.scrollTo(pos.top ?? 0, { immediate: true, force: true }) // drop any glide from the last page
    if (from.matched.length) pin(pos.top ?? 0)
    return pos
  },
})

createApp(App)
  .use(router)
  .mount('#app')
