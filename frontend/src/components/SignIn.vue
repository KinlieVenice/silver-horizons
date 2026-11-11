<!-- The gate: the whole site is for FELCO people, so visitors land here until they sign in with their
     company Google account. Same night atmosphere as the Home opening: beams, star dust, the logo, horizon. -->
<script setup>
import { computed } from 'vue'
import logo from '../assets/brand/silver-horizons-logo.webp'
import HorizonGlow from './HorizonGlow.vue'
import Sparkle from './Sparkle.vue'
import { event } from '../content/event.js'
import { session, signInUrl, loadSession } from '../lib/session.js'

const message = computed(() => ({
  domain: 'That account isn’t a FELCO account. Please sign in with your @fireflyelectric.com Google account.',
  cancelled: 'Sign-in was cancelled. Please try again.',
}[session.error]))
</script>

<template>
  <main class="night relative isolate flex min-h-svh flex-col items-center justify-center-safe overflow-hidden px-6 pt-16 pb-40 text-center">
    <div class="star-dust intro-glow absolute inset-0 -z-10" aria-hidden="true" />
    <div class="hero-spot intro-glow absolute top-0 left-1/2 -z-10 h-[80svh] w-[90vw] -translate-x-1/2" aria-hidden="true" />
    <div class="hero-beam hero-beam--l intro-glow absolute -top-[10svh] left-1/2 -z-10 h-[85svh] w-[38vw]" aria-hidden="true" />
    <div class="hero-beam hero-beam--r intro-glow absolute -top-[10svh] left-1/2 -z-10 h-[85svh] w-[38vw]" aria-hidden="true" />
    <Sparkle twinkle class="absolute top-[16%] left-[12%] -z-10 size-3" />
    <Sparkle twinkle class="absolute top-[28%] right-[14%] -z-10 size-2 [animation-delay:1.2s]" />
    <HorizonGlow class="-z-10" intro />

    <img :src="logo" alt="Silver Horizons" class="intro-logo h-auto w-[min(78vw,26rem)]" />
    <p class="intro-after mt-6 flex items-center justify-center gap-4 text-xs font-medium tracking-[0.32em] text-white/85 uppercase">
      <span class="h-px w-8 bg-linear-to-r from-transparent to-white/70 sm:w-14" aria-hidden="true" />
      {{ event.dateLabel }}
      <span class="h-px w-8 bg-linear-to-l from-transparent to-white/70 sm:w-14" aria-hidden="true" />
    </p>

    <div class="intro-after mt-12 flex flex-col items-center">
      <template v-if="session.status === 'loading'">
        <p class="text-sm text-ink/70" role="status">Checking your sign-in…</p>
      </template>

      <template v-else-if="session.status === 'error'">
        <p class="max-w-sm text-[15px] text-ink" role="alert">We couldn’t reach the Silver Horizons server. Check your connection and try again.</p>
        <button type="button" class="mt-6 inline-flex min-h-12 items-center rounded-full border border-white/60 px-7 text-sm font-medium tracking-[0.2em] text-white uppercase transition hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0" @click="loadSession">Try again</button>
      </template>

      <template v-else>
        <p class="max-w-sm text-[15px] text-ink">This site is for FELCO employees. Sign in with your company Google account to continue.</p>
        <p v-if="message" class="mt-4 max-w-sm rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white" role="alert">{{ message }}</p>
        <a
          :href="signInUrl()"
          class="mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-white pr-7 pl-2 text-sm font-medium text-navy-950 shadow-[0_10px_40px_-12px_rgb(0_0_0/0.8)] transition hover:-translate-y-0.5 hover:bg-ink active:translate-y-0"
        >
          <!-- Google "G" (Google sign-in branding) -->
          <span class="grid size-9 place-items-center rounded-full bg-white">
            <svg viewBox="0 0 48 48" class="size-5" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
          </span>
          Sign in with Google
        </a>
        <p class="mt-4 text-xs text-muted">Use your @fireflyelectric.com account</p>
      </template>
    </div>
  </main>
</template>
