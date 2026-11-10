<!-- Silver ribbon: one smooth twisting band along path `d` (in `viewBox` units, stretched to the element box).
     Width follows |cos(twist)| so it turns edge-on; both ends taper to a point. Outline is a single
     Catmull-Rom-smoothed shape (no slices, no hard edges); shading is a gradient that follows the twist.
     Visible range [from, to] (0..1) is controllable for scroll scenes; `draw` animates 0→1 itself.
     A glint travels along it once fully drawn. -->
<script setup>
import { ref, computed, onMounted, onUnmounted, useId } from 'vue'

const props = defineProps({
  d: { type: String, required: true },
  viewBox: { type: String, default: '0 0 1200 600' },
  width: { type: Number, default: 16 }, // max band width, px
  twists: { type: Number, default: 2.5 }, // half-turns along the length
  from: { type: Number, default: 0 },
  to: { type: Number, default: 1 },
  draw: Boolean, // self-animate `to` 0→1
  delay: { type: Number, default: 300 }, // ms before self-draw
  duration: { type: Number, default: 2400 },
})

const N = 240
const id = useId()
const el = ref()
const box = ref({ w: 0, h: 0 })
const drawn = ref(props.draw ? 0 : 1)
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Centerline samples in px: [{x, y, nx, ny}]
const samples = computed(() => {
  const { w, h } = box.value
  if (!w || !h) return []
  const [, , vw, vh] = props.viewBox.split(/[\s,]+/).map(Number)
  // every number pair in d is an absolute x y coordinate (M/C/S/Q/L only)
  const scaled = props.d.replace(/(-?\d*\.?\d+)[\s,]+(-?\d*\.?\d+)/g, (_, x, y) => `${(x * w) / vw} ${(y * h) / vh}`)
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', scaled)
  const len = path.getTotalLength()
  const pts = Array.from({ length: N }, (_, i) => path.getPointAtLength((i / (N - 1)) * len))
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)]
    const b = pts[Math.min(N - 1, i + 1)]
    const tl = Math.hypot(b.x - a.x, b.y - a.y) || 1
    return { x: p.x, y: p.y, nx: -(b.y - a.y) / tl, ny: (b.x - a.x) / tl }
  })
})

const range = computed(() => [
  Math.floor(Math.min(props.from, 1) * (N - 1)),
  Math.ceil(Math.min(props.to, drawn.value) * (N - 1)),
])

// Catmull-Rom → cubic Bézier through points
const smooth = (pts, close) => {
  if (pts.length < 2) return ''
  const f = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`
  let d = `M${f(pts[0])}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${f(c1)} ${f(c2)} ${f(p2)}`
  }
  return close ? d + 'Z' : d
}

// narrow boxes (phones/tablets): fewer twists and a slimmer band so it doesn't bunch up
const fit = computed(() => Math.min(1, Math.max(0.45, box.value.w / 1200)))
const twist = (i) => Math.PI * props.twists * fit.value * (i / (N - 1))
const bandWidth = computed(() => props.width * Math.max(0.65, fit.value))

const shape = computed(() => {
  const s = samples.value
  const [lo, hi] = range.value
  if (!s.length || hi - lo < 2) return null
  const left = []
  const right = []
  for (let i = lo; i <= hi; i++) {
    const u = (i - lo) / (hi - lo)
    const taper = Math.sin(Math.PI * Math.min(1, u / 0.12, (1 - u) / 0.12) / 2) // pointed tips
    const hw = (bandWidth.value / 2) * Math.max(0.12, Math.abs(Math.cos(twist(i)))) * taper
    left.push([s[i].x + s[i].nx * hw, s[i].y + s[i].ny * hw])
    right.push([s[i].x - s[i].nx * hw, s[i].y - s[i].ny * hw])
  }
  return { outline: smooth([...left, ...right.reverse()], true), edge: smooth(left, false) }
})

// Shading gradient across the visible span: lit face → white, shadow → steel, back side → blue-silver
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t))
const STEEL = [118, 130, 154]
const WHITE = [255, 255, 255]
const BACK = [136, 158, 206]
const gradient = computed(() => {
  const s = samples.value
  const [lo, hi] = range.value
  if (!s.length || hi - lo < 2) return null
  let x1 = Infinity
  let x2 = -Infinity
  for (let i = lo; i <= hi; i++) { x1 = Math.min(x1, s[i].x); x2 = Math.max(x2, s[i].x) }
  const span = x2 - x1 || 1
  const stops = []
  for (let k = 0; k <= 24; k++) {
    const i = Math.round(lo + ((hi - lo) * k) / 24)
    const th = twist(i)
    const light = 0.5 + 0.5 * Math.sin(th * 1.3 + 0.9)
    const rgb = Math.cos(th) >= 0 ? mix(STEEL, WHITE, light) : mix(BACK, WHITE, light * 0.7)
    stops.push({ o: (s[i].x - x1) / span, c: `rgb(${rgb})` })
  }
  stops.sort((a, b) => a.o - b.o)
  return { x1, x2, stops }
})

const centerline = computed(() => smooth(samples.value.map((p) => [p.x, p.y]), false))
const full = computed(() => props.from <= 0 && props.to >= 1 && drawn.value >= 1)

let ro
let raf = 0
let timer = 0
onMounted(() => {
  ro = new ResizeObserver(([e]) => (box.value = { w: e.contentRect.width, h: e.contentRect.height }))
  ro.observe(el.value)
  if (props.draw && !reduced) {
    timer = setTimeout(() => {
      const t0 = performance.now()
      const step = (now) => {
        const t = Math.min(1, (now - t0) / props.duration)
        drawn.value = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2 // easeInOutCubic
        if (t < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }, props.delay)
  } else drawn.value = 1
})
onUnmounted(() => {
  ro?.disconnect()
  cancelAnimationFrame(raf)
  clearTimeout(timer)
})
</script>

<template>
  <div ref="el" class="pointer-events-none" aria-hidden="true">
    <svg
      v-if="box.w && shape"
      :viewBox="`0 0 ${box.w} ${box.h}`"
      class="block size-full overflow-visible"
      style="filter: drop-shadow(0 0 16px rgb(150 185 255 / 0.4))"
    >
      <defs>
        <linearGradient :id="id" gradientUnits="userSpaceOnUse" :x1="gradient.x1" :x2="gradient.x2" y1="0" y2="0">
          <stop v-for="(s, i) in gradient.stops" :key="i" :offset="s.o" :stop-color="s.c" />
        </linearGradient>
      </defs>
      <path :d="shape.outline" :fill="`url(#${id})`" />
      <path :d="shape.edge" fill="none" stroke="#fff" stroke-opacity="0.85" stroke-width="1" stroke-linecap="round" />
      <path
        v-if="full"
        :d="centerline"
        pathLength="1"
        fill="none"
        stroke="#fff"
        :stroke-width="bandWidth * 0.6"
        stroke-linecap="round"
        class="ribbon-glint"
      />
    </svg>
  </div>
</template>
