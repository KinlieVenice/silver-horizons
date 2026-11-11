import { onMounted, onUnmounted } from 'vue'
import { lenis } from './smoothScroll.js'

// Hybrid scroll story: scenes always follow the scroll position. If the visitor stops scrolling,
// the page glides on by itself: a short hop to the next [data-scene], straight into playing it at an
// even pace, then on to the next, until the visitor touches anything again.
// Scene pace: data-play="ms" = time to play the whole scene. A section marked data-stop="ms" (a plain
// section, e.g. a slider) is a resting point: the glide brings its top into view, then waits that long
// after the visitor's last touch before moving on. Off for reduced motion.
// Returns next(): glide on right now (e.g. a "Begin" button).
export function useAutoplay(rootRef, { idle = 700, firstIdle = 4500, hop = 1100 } = {}) {
  let last = performance.now()
  let raf = 0
  let expectY = null
  let timer = 0
  let enabled = false

  const stop = () => { cancelAnimationFrame(raf); raf = 0; expectY = null }
  const touched = () => { last = performance.now(); stop() }

  const glide = (to, ms, linear, then) => {
    const from = window.scrollY
    const t0 = performance.now()
    const step = (now) => {
      // the page jumped far from where we put it (a scrollbar drag): visitor took over. Taps, swipes,
      // wheels and keys are caught by their own listeners; the wide margin is for iOS Safari, whose
      // scrollY drifts from what we set while its address bar collapses (a tight check stopped the glide)
      if (expectY !== null && Math.abs(window.scrollY - expectY) > 120) return touched()
      const t = Math.min(1, (now - t0) / Math.max(1, ms))
      const e = linear ? t : t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
      expectY = Math.round(from + (to - from) * e)
      window.scrollTo(0, expectY)
      if (t < 1) raf = requestAnimationFrame(step)
      else { stop(); last = performance.now(); then?.() }
    }
    raf = requestAnimationFrame(step)
  }

  // Next move from the current position; `force` skips the idle wait.
  const advance = (force) => {
    // let a visitor's wheel glide finish; a forced step (chained by autoplay's own glide) goes on regardless
    if (raf || document.hidden || !rootRef.value || (!force && lenis?.isScrolling)) return
    const scenes = [...rootRef.value.querySelectorAll('[data-scene], [data-stop]')]
    if (!scenes.length) return
    const y = window.scrollY
    const vh = window.innerHeight
    const resting = scenes.find((el) => el.dataset.stop && Math.abs(y - el.offsetTop) <= 40) // loose: iOS drift
    const wait = y < scenes[0].offsetTop - 2 ? firstIdle : resting ? Number(resting.dataset.stop || 8000) : idle
    if (!force && performance.now() - last < wait) return
    for (const el of scenes) {
      const start = el.offsetTop
      if (el.dataset.stop) {
        if (y < start - 40) return glide(start, hop, false) // arrive, then rest (the idle wait above)
        continue
      }
      const end = start + el.offsetHeight - vh
      // hop to the scene, then play it straight away (no idle pause in between)
      if (y < start - 2) return glide(start, hop, false, () => advance(true))
      // play it; when it ends, go straight on to the next (no idle pause between scenes)
      if (y < end - 2) return glide(end, ((end - y) / (end - start)) * Number(el.dataset.play || 5000), true, () => advance(true))
    }
    // past the last scene: story finished, stay put
  }

  const next = () => {
    if (!enabled) { // reduced motion: just jump to the first scene
      const first = rootRef.value?.querySelector('[data-scene]')
      if (first) window.scrollTo(0, first.offsetTop)
      return
    }
    stop()
    advance(true)
  }

  const inputs = ['wheel', 'touchstart', 'pointerdown', 'keydown']
  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    enabled = true
    inputs.forEach((e) => window.addEventListener(e, touched, { passive: true }))
    timer = setInterval(() => advance(false), 200)
  })
  onUnmounted(() => {
    inputs.forEach((e) => window.removeEventListener(e, touched))
    clearInterval(timer)
    stop()
  })

  return { next }
}
