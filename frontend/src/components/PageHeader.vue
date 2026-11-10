<!-- Shared header for inner pages: eyebrow, display title, ribbon, horizon glow -->
<script setup>
import Ribbon from './Ribbon.vue'
import Sparkle from './Sparkle.vue'
import HorizonGlow from './HorizonGlow.vue'

defineProps({ eyebrow: String, title: String })
</script>

<template>
  <header class="night relative isolate overflow-hidden px-6 pt-16 pb-48 text-center md:pt-36 md:pb-44">
    <!-- ribbon + sparkle share one box so the star stays on the ribbon tip (1150,12 of 1200x200) -->
    <div class="absolute inset-x-0 bottom-24 -z-10 h-24 md:h-32">
      <Ribbon
        draw
        class="absolute inset-0 size-full"
        viewBox="0 0 1200 200"
        d="M -40 170 C 320 190, 640 150, 860 90 S 1120 20, 1150 12"
        :width="6"
      />
      <Sparkle twinkle class="absolute top-[6%] left-[95.8%] size-5 -translate-1/2" />
    </div>
    <HorizonGlow class="-z-10" />
    <p v-reveal class="eyebrow">{{ eyebrow }}</p>
    <h1 v-reveal class="silver-text mt-4 font-display text-5xl leading-[1.05] font-medium sm:text-7xl">{{ title }}</h1>
    <div v-if="$slots.default" v-reveal class="mx-auto mt-6 max-w-xl text-muted"><slot /></div>
  </header>
</template>
