<!-- Desktop: slim top bar. Mobile: fixed bottom tab bar. Same 4 links. -->
<script setup>
const links = [
  { to: '/', label: 'Home', icon: 'M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z' },
  { to: '/itinerary', label: 'Itinerary', icon: 'M6 4.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM18 15.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM6 8.5v3a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3' },
  { to: '/gala', label: 'Gala', icon: 'M12 3c.6 5.4 2.6 7.4 8 8-5.4.6-7.4 2.6-8 8-.6-5.4-2.6-7.4-8-8 5.4-.6 7.4-2.6 8-8z' },
  { to: '/info', label: 'Info', icon: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5.5M12 7.6v.1' },
]
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-40 hidden border-b border-white/5 bg-navy-950/95 backdrop-blur-md md:block">
    <nav class="mx-auto flex h-16 max-w-6xl items-center justify-between px-8" aria-label="Main">
      <RouterLink to="/" class="flex items-baseline gap-2.5" aria-label="Silver Horizons home">
        <span class="silver-text font-display text-xl font-semibold tracking-wide">SILVER</span>
        <span class="text-[11px] tracking-[0.35em] text-ink/80">HORIZONS</span>
      </RouterLink>
      <ul class="flex gap-10">
        <li v-for="l in links" :key="l.to">
          <RouterLink
            :to="l.to"
            class="eyebrow relative py-2 transition hover:text-ink"
            exact-active-class="text-ink! after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-linear-to-r after:from-transparent after:via-white after:to-transparent"
          >{{ l.label }}</RouterLink>
        </li>
      </ul>
    </nav>
  </header>

  <nav
    class="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-navy-950/95 backdrop-blur-lg md:hidden"
    style="padding-bottom: env(safe-area-inset-bottom)"
    aria-label="Main"
  >
    <ul class="grid grid-cols-4">
      <li v-for="l in links" :key="l.to">
        <RouterLink
          :to="l.to"
          class="relative flex min-h-16 flex-col items-center justify-center gap-1 text-muted transition"
          exact-active-class="text-ink! before:absolute before:top-0 before:left-1/2 before:h-px before:w-10 before:-translate-x-1/2 before:bg-linear-to-r before:from-transparent before:via-white before:to-transparent"
        >
          <svg viewBox="0 0 24 24" class="size-5.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path :d="l.icon" />
          </svg>
          <span class="text-[10.5px] tracking-[0.18em] uppercase">{{ l.label }}</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>
