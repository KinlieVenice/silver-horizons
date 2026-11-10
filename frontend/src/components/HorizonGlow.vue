<!-- Blue horizon light band + scan-line floor, from the lookbook cover bottoms.
     `intro`: line opens from the center and the glow fades up (Home opening). -->
<script setup>
defineProps({ intro: Boolean })
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 bottom-0 h-72 overflow-hidden">
    <div
      class="absolute inset-0"
      :class="intro && 'intro-glow'"
      style="background: radial-gradient(55% 75% at 50% 100%, rgb(61 107 196 / 0.55), rgb(61 107 196 / 0.12) 55%, transparent 78%)"
    />
    <div
      class="absolute bottom-20 left-1/2 h-px w-[92%] -translate-x-1/2"
      :class="intro && 'intro-horizon'"
      style="background: linear-gradient(90deg, transparent, rgb(180 205 255 / 0.55) 28%, #fff 50%, rgb(180 205 255 / 0.55) 72%, transparent); box-shadow: 0 0 28px 6px rgb(140 175 255 / 0.4)"
    />
    <div
      class="absolute inset-x-0 bottom-0 h-20"
      :class="intro && 'intro-glow'"
      style="background: repeating-linear-gradient(180deg, rgb(170 195 255 / 0.14) 0 1px, transparent 1px 7px); -webkit-mask-image: linear-gradient(180deg, #000, transparent); mask-image: linear-gradient(180deg, #000, transparent)"
    />
  </div>
</template>
