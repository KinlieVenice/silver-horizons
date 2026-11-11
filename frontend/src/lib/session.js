import { reactive } from 'vue'
import welcome from '../assets/photos/welcome.webp'
import museum from '../assets/photos/museum.webp'
import binondo from '../assets/photos/binondo.webp'
import night from '../assets/photos/night.webp'

// Sign-in state and the private content (itinerary, Home's film strip, People, tips, FAQ, contact), which only the backend
// serves, after a company Google sign-in. The backend keeps the OAuth tokens; the browser only holds its
// HttpOnly session cookie, sent along with every request here.
// VITE_API_URL: the backend's origin when it isn't the same as the site's (empty in dev: Vite proxies it).
const API = import.meta.env.VITE_API_URL ?? ''
// content.json names a photo ('museum', 'people/eva-dy'); the site bundles the file
const peoplePhotos = import.meta.glob('../assets/people/*.jpg', { eager: true, import: 'default' })
const photos = {
  welcome, museum, binondo, night,
  ...Object.fromEntries(Object.entries(peoplePhotos).map(([f, url]) => [`people/${f.split('/').pop().replace('.jpg', '')}`, url])),
}

// status: 'loading' | 'out' (show sign-in) | 'in' | 'error' (backend unreachable)
// error: why the last sign-in failed, from the backend's redirect (?auth_error=domain | cancelled)
const params = new URLSearchParams(location.search)
export const session = reactive({ status: 'loading', user: null, error: params.get('auth_error') })
if (session.error) {
  params.delete('auth_error')
  history.replaceState(history.state, '', location.pathname + (params.size ? `?${params}` : '') + location.hash)
}

// filled once signed in; views read it at setup (the app only renders its pages after it has loaded)
export const content = reactive({ itinerary: [], journey: [], credits: [], people: [], tips: [], faq: [], contact: {} })

// content.json names photos ('museum'); swap each `image` / `images` name for the bundled file, wherever it sits
const withPhotos = (v) => {
  if (Array.isArray(v)) return v.map(withPhotos)
  if (!v || typeof v !== 'object') return v
  const o = {}
  for (const [k, x] of Object.entries(v)) {
    o[k] = k === 'image' ? photos[x] : k === 'images' ? x.map((n) => photos[n]) : withPhotos(x)
  }
  return o
}

const api = (path, init) => fetch(API + path, { credentials: 'include', ...init })

export async function loadSession() {
  session.status = 'loading'
  try {
    const me = await api('/api/me')
    if (me.status === 401) return (session.status = 'out')
    if (!me.ok) throw new Error(`api/me ${me.status}`)
    const res = await api('/api/content')
    if (!res.ok) throw new Error(`api/content ${res.status}`)
    const data = await res.json()
    Object.assign(content, withPhotos(data))
    session.user = await me.json()
    session.status = 'in'
  } catch {
    session.status = 'error'
  }
}

// full-page navigation to the backend, which sends the visitor on to Google and back to `next`
export const signInUrl = (next = location.pathname) => `${API}/auth/login?next=${encodeURIComponent(next)}`

export async function signOut() {
  await api('/auth/logout', { method: 'POST' }).catch(() => {})
  location.assign(import.meta.env.BASE_URL)
}
