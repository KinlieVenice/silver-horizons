import { test } from 'node:test'
import assert from 'node:assert/strict'
import { defaultDayIndex, nextStopIndex, timeLeft, formatTime } from './schedule.js'

const days = [{ date: '2026-12-03' }, { date: '2026-12-04' }]
const stops = [{ time: '09:00' }, { time: '13:00' }]

test('defaultDayIndex uses Manila date, not UTC', () => {
  // 2026-12-03 17:00 UTC = 2026-12-04 01:00 Manila
  assert.equal(defaultDayIndex(days, new Date('2026-12-03T17:00:00Z')), 1)
  assert.equal(defaultDayIndex(days, new Date('2026-11-10T00:00:00Z')), 0)
})

test('nextStopIndex', () => {
  const at = (iso) => new Date(iso)
  assert.equal(nextStopIndex('2026-12-03', stops, at('2026-12-03T08:00:00+08:00')), 0)
  assert.equal(nextStopIndex('2026-12-03', stops, at('2026-12-03T10:00:00+08:00')), 1)
  assert.equal(nextStopIndex('2026-12-03', stops, at('2026-12-03T14:00:00+08:00')), -1)
  assert.equal(nextStopIndex('2026-12-03', stops, at('2026-12-04T08:00:00+08:00')), -1)
})

test('timeLeft', () => {
  const t = timeLeft('2026-12-05T17:00:00+08:00', new Date('2026-12-04T15:58:30+08:00'))
  assert.deepEqual(t, { days: 1, hours: 1, minutes: 1, seconds: 30, done: false })
  assert.equal(timeLeft('2026-12-05T17:00:00+08:00', new Date('2027-01-01')).done, true)
})

test('formatTime', () => {
  assert.equal(formatTime('00:05'), '12:05 AM')
  assert.equal(formatTime('12:00'), '12:00 PM')
  assert.equal(formatTime('18:30'), '6:30 PM')
})
