import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./views/HomeView.vue') },
    { path: '/itinerary', component: () => import('./views/ItineraryView.vue') },
    { path: '/gala', component: () => import('./views/GalaView.vue') },
    { path: '/info', component: () => import('./views/InfoView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: (to, from, saved) => saved || { top: 0 },
})

// v-reveal: fade/rise once when element scrolls into view (CSS handles reduced motion)
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target) }
  }),
  { threshold: 0.15 },
)

createApp(App)
  .use(router)
  .directive('reveal', { mounted: (el) => { el.classList.add('reveal'); io.observe(el) } })
  .mount('#app')
