import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

// Smooth (momentum) scrolling for wheels and trackpads. Touch keeps the phone's own native scrolling
// (syncTouch off). Off for reduced motion. The page's scroll scenes, autoplay and finale still read and
// write window.scrollY; Lenis follows those writes when it isn't gliding itself.
// scrollLock.on: Lenis ignores input (the finale's hold blocks native scrolling separately).
export const scrollLock = { on: false }

export const lenis = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ? null
  // lerp: how fast it catches up (0.09 felt sluggish through the long map scene); wheelMultiplier: a bit
  // more distance per wheel step so the tall scroll scenes don't drag
  : new Lenis({ autoRaf: true, lerp: 0.16, wheelMultiplier: 1.25, virtualScroll: () => !scrollLock.on })

// stop any glide in progress right where it is (before the page moves itself)
export const settle = () => lenis?.scrollTo(window.scrollY, { immediate: true, force: true })
