<!-- Floating glass pill of text links. The active page is marked by a thin glowing silver line
     (the horizon motif) that slides under the word. `compact`: tighter spacing for phones. -->
<script setup>
import { ref, reactive, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({ links: { type: Array, required: true }, compact: Boolean })
const route = useRoute()
const pill = ref()
const els = []
const line = reactive({ x: 0, w: 0, on: false })

const measure = () => {
  const i = props.links.findIndex((l) => l.to === route.path)
  const el = els[i]?.parentElement // the <li>; its offsetParent is the pill
  line.on = !!el
  if (el) { line.w = el.offsetWidth * 0.55; line.x = el.offsetLeft + (el.offsetWidth - line.w) / 2 }
}
let ro
onMounted(() => {
  ro = new ResizeObserver(measure)
  ro.observe(pill.value)
  document.fonts?.ready.then(measure)
})
onUnmounted(() => ro?.disconnect())
watch(() => route.path, () => nextTick(measure))
</script>

<template>
  <ul
    ref="pill"
    class="relative flex items-center rounded-full border border-white/12 bg-navy-950/55 px-1.5 shadow-[0_10px_40px_-12px_rgb(0_0_0/0.8),inset_0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-xl"
  >
    <li
      aria-hidden="true"
      class="pointer-events-none absolute bottom-2 h-px bg-linear-to-r from-transparent via-white to-transparent shadow-[0_0_8px_1px_rgb(160_190_255/0.8)] transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)]"
      :style="{ left: `${line.x}px`, width: `${line.w}px`, opacity: line.on ? 1 : 0 }"
    />
    <li v-for="(l, i) in links" :key="l.to">
      <RouterLink
        :ref="(c) => (els[i] = c?.$el)"
        :to="l.to"
        class="flex items-center font-medium text-muted uppercase transition-colors hover:text-white"
        :class="compact ? 'h-12 px-3 text-[10.5px] tracking-[0.14em]' : 'h-11 px-5 text-[11.5px] tracking-[0.24em]'"
        exact-active-class="text-white!"
      >{{ l.label }}</RouterLink>
    </li>
  </ul>
</template>
