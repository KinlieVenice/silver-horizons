import { reactive, onMounted, onUnmounted } from 'vue'

// Scroll scenes: every [data-scene] inside `rootRef` is a tall section with a sticky stage.
// While it scrolls past, its progress 0→1 is written to CSS var --p (for CSS animation)
// and to the returned reactive object keyed by data-scene (for JS: counters, triggers).
// Reduced motion: everything pinned at 1 (end state), no listeners.
export function useScenes(rootRef) {
  const progress = reactive({})
  let els = []
  let raf = 0

  const update = () => {
    raf = 0
    const vh = window.innerHeight
    for (const el of els) {
      const r = el.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh)))
      el.style.setProperty('--p', p.toFixed(4))
      progress[el.dataset.scene] = p
    }
  }
  const onScroll = () => { raf ||= requestAnimationFrame(update) }

  onMounted(() => {
    els = [...rootRef.value.querySelectorAll('[data-scene]')]
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((el) => (progress[el.dataset.scene] = 1))
      return
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
  })
  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    cancelAnimationFrame(raf)
  })

  return progress
}

// Segment of a 0→1 progress: 0 before `a`, 1 after `a + d`.
export const seg = (p, a, d) => Math.min(1, Math.max(0, (p - a) / d))
