// Time helpers. All schedule times are Manila time (UTC+8), regardless of device timezone.
const TZ = 'Asia/Manila'

export const manilaDate = (now = new Date()) => now.toLocaleDateString('en-CA', { timeZone: TZ })

export const stopTime = (date, time) => new Date(`${date}T${time}:00+08:00`)

// Tab to open: today's day during the trip, else first day.
export function defaultDayIndex(days, now = new Date()) {
  const i = days.findIndex((d) => d.date === manilaDate(now))
  return i < 0 ? 0 : i
}

// Index of next upcoming stop on `date`, or -1 if not today / all done.
export function nextStopIndex(date, stops, now = new Date()) {
  if (date !== manilaDate(now)) return -1
  return stops.findIndex((s) => stopTime(date, s.time) > now)
}

export function timeLeft(target, now = new Date()) {
  const ms = Math.max(0, new Date(target) - now)
  return {
    days: Math.floor(ms / 864e5),
    hours: Math.floor(ms / 36e5) % 24,
    minutes: Math.floor(ms / 6e4) % 60,
    seconds: Math.floor(ms / 1e3) % 60,
    done: ms === 0,
  }
}

export function formatTime(time) {
  const [h, m] = time.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}

export function formatDay(date) {
  return new Date(`${date}T12:00:00+08:00`).toLocaleDateString('en-US', { timeZone: TZ, month: 'short', day: 'numeric', weekday: 'short' })
}
