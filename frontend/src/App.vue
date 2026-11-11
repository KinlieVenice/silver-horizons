<script setup>
import AppNav from './components/AppNav.vue'
import logo from './assets/brand/silver-horizons-logo.webp'
import SignIn from './components/SignIn.vue'
import { computed } from 'vue'
import { session, content, loadSession, signOut } from './lib/session.js'

// the whole site is behind a FELCO Google sign-in: the pages only render once the backend says who you are
loadSession()
const credits = computed(() => content.credits)
</script>

<template>
  <SignIn v-if="session.status !== 'in'" />
  <template v-else>
  <a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-navy-950">Skip to content</a>
  <AppNav />
  <main id="main">
    <RouterView />
  </main>
  <footer class="relative border-t border-white/5 bg-navy-950 px-6 pt-16 pb-[calc(6rem+env(safe-area-inset-bottom))] text-center md:pb-16">
    <img :src="logo" alt="Silver Horizons" class="mx-auto h-auto w-56 opacity-90" loading="lazy" />
    <p class="mx-auto mt-8 max-w-md text-sm text-muted">{{ content.contact.line }}</p>
    <p class="mt-6 text-xs text-muted">
      Signed in as {{ session.user.email }} ·
      <button type="button" class="link-draw font-medium text-ink" @click="signOut">Sign out</button>
    </p>
    <p class="mt-6 text-xs tracking-[0.2em] text-muted/70 uppercase">© 2026 Firefly Electric and Lighting Corporation</p>
    <p v-if="credits.length" class="mx-auto mt-4 max-w-2xl text-[11px] leading-relaxed text-muted/60">
      Photos via Wikimedia Commons: {{ credits.join(' · ') }}
    </p>
  </footer>
  </template>
</template>
