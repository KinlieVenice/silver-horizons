import { reactive, onMounted, onUnmounted } from 'vue'

// Scroll scenes: every [data-scene] inside `rootRef` is a tall section with a sticky stage.
// While it scrolls past (starting as it comes into view), its progress 0→1 is written to CSS var --p (for CSS animation)
// and to the returned reactive object keyed by data-scene (for JS: counters, triggers).
// Progress only moves forward: scrolling back up keeps the furthest point reached, so a played scene
// stays revealed; once the scene is wholly below the screen (scrolled back up past it) it resets unseen.
// Reduced motion: everything pinned at 1 (end state), no listeners.
export function useScenes(rootRef) {
  const progress = reactive({})
  let els = []
  let raf = 0
  const reached = new WeakMap()

  // A scene's opening plays as it comes into view, not only once it pins: over the last LEAD of the screen
  // before its top reaches the top, progress runs 0 → INTRO (the first beat: a headline, a glow), then the
  // rest (INTRO → 1) while it's pinned. So one swipe starts it, instead of a swipe to bring it in and another
  // to set it going. Autoplay glides to the pin point and plays from there, as before.
  const LEAD = 0.8
  const INTRO = 0.12
  const update = () => {
    raf = 0
    const vh = window.innerHeight
    for (const el of els) {
      const r = el.getBoundingClientRect()
      const now = r.top > 0
        ? INTRO * Math.min(1, Math.max(0, (LEAD * vh - r.top) / (LEAD * vh)))
        : Math.min(1, INTRO + (1 - INTRO) * (-r.top / Math.max(1, r.height - vh)))
      const p = r.top >= vh ? now : Math.max(now, reached.get(el) ?? 0)
      reached.set(el, p)
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
