import { useEffect, useRef, useState } from 'react'
import { formatDate } from '../lib/format'

/** Draw at the container's real width, so axis labels stay readable on phones. */
function useWidth(fallback) {
  const ref = useRef(null)
  const [width, setWidth] = useState(fallback)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width]
}

/**
 * A small dependency-free line chart. `points` is one entry per day
 * ({ date, ...values }); missing days break the line instead of being drawn
 * as if they were measured.
 */
export function LineChart({ points, series, min = 1, max = 5, height = 180, yTicks = [1, 2, 3, 4, 5], yLabel = (v) => v, label }) {
  const [ref, W] = useWidth(640)
  const H = height
  const pad = { l: 34, r: 28, t: 12, b: 26 }
  const iw = W - pad.l - pad.r
  const ih = H - pad.t - pad.b
  const n = points.length
  const x = (i) => pad.l + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw)
  const y = (v) => pad.t + ih - ((v - min) / (max - min)) * ih

  const paths = series.map((s) => {
    let d = ''
    let pen = false
    points.forEach((p, i) => {
      const v = p[s.key]
      if (v === null || v === undefined) {
        pen = false
        return
      }
      d += `${pen ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`
      pen = true
    })
    return { ...s, d }
  })

  const labelEvery = Math.max(1, Math.ceil(n / Math.max(3, Math.floor(W / 100))))
  // Always label the last day; drop a regular label that would crowd it.
  const showLabel = (i) => i === n - 1 || (i % labelEvery === 0 && n - 1 - i >= labelEvery * 0.6)

  return (
    <figure className="chart" ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="grid" />
            <text x={pad.l - 8} y={y(t) + 4} className="axis" textAnchor="end">
              {yLabel(t)}
            </text>
          </g>
        ))}
        {points.map((p, i) =>
          showLabel(i) ? (
            <text key={p.date} x={x(i)} y={H - 6} className="axis" textAnchor="middle">
              {formatDate(p.date)}
            </text>
          ) : null,
        )}
        {paths.map((s) => (
          <path key={s.key} d={s.d} className="line" style={{ stroke: s.color }} />
        ))}
        {n <= W / 14 &&
          paths.map((s) =>
          points.map((p, i) =>
            p[s.key] === null || p[s.key] === undefined ? null : (
              <circle key={`${s.key}${p.date}`} cx={x(i)} cy={y(p[s.key])} r={n > 40 ? 2 : 3.2} className="pt" style={{ fill: s.color }}>
                <title>{`${formatDate(p.date)}: ${s.label} ${p[s.key]}`}</title>
              </circle>
            ),
          ),
        )}
      </svg>
      {series.length > 1 && (
        <figcaption className="legend">
          {series.map((s) => (
            <span key={s.key}>
              <i style={{ background: s.color }} /> {s.label}
            </span>
          ))}
        </figcaption>
      )}
    </figure>
  )
}

/** One bar per questionnaire result, coloured by severity band. */
export function ScoreBars({ results, max, label }) {
  const [ref, W] = useWidth(420)
  const H = 170
  const pad = { l: 28, r: 10, t: 16, b: 24 }
  const iw = W - pad.l - pad.r
  const ih = H - pad.t - pad.b
  const bw = Math.min(46, iw / Math.max(results.length, 1) - 10)
  return (
    <figure className="chart" ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        {[0, Math.round(max / 3), Math.round((2 * max) / 3), max].map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={pad.t + ih - (t / max) * ih} y2={pad.t + ih - (t / max) * ih} className="grid" />
            <text x={pad.l - 6} y={pad.t + ih - (t / max) * ih + 4} className="axis" textAnchor="end">
              {t}
            </text>
          </g>
        ))}
        {results.map((r, i) => {
          const cx = pad.l + ((i + 0.5) / results.length) * iw
          const h = (r.score / max) * ih
          return (
            <g key={r.id ?? i}>
              <rect x={cx - bw / 2} y={pad.t + ih - h} width={bw} height={Math.max(h, 2)} rx="4" className={`bar sev-${r.severity.toLowerCase().replace(/\s+/g, '-')}`}>
                <title>{`${formatDate(r.takenAt)}: ${r.score} (${r.severity})`}</title>
              </rect>
              <text x={cx} y={pad.t + ih - h - 4} className="axis strong" textAnchor="middle">
                {r.score}
              </text>
              <text x={cx} y={H - 6} className="axis" textAnchor="middle">
                {formatDate(r.takenAt)}
              </text>
            </g>
          )
        })}
      </svg>
    </figure>
  )
}
