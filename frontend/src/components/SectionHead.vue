<!-- Section heading in the site's style: a small-caps label after a silver hairline, then the title in chrome
     lettering (shared --chrome silver, soft shadow copy behind). -->
<script setup>
defineProps({ eyebrow: { type: String, required: true }, title: { type: String, required: true }, id: String })
</script>

<template>
  <div>
    <p class="flex items-center gap-3 text-xs font-medium tracking-[0.32em] text-white/80 uppercase">
      <span class="h-px w-10 bg-linear-to-r from-transparent to-white/70" aria-hidden="true" />
      {{ eyebrow }}
    </p>
    <h2 :id="id" class="mt-4 text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.05]">
      <span class="relative inline-block">
        <span class="chrome-shadow" aria-hidden="true">{{ title }}</span>
        <span class="chrome-text">{{ title }}</span>
      </span>
    </h2>
  </div>
</template>
