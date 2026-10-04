/**
 * An abstract, ILLUSTRATIVE map: lagoon, shoreline and a marker for the
 * Plateau district. Deliberately not a real map embed — the office doesn't
 * exist, a third-party map would set tracking cookies, and a pin on a real
 * street would imply a real address.
 */
export function DistrictMap() {
  return (
    <figure className="flex flex-col gap-3">
      <svg
        viewBox="0 0 480 320"
        role="img"
        aria-label="Illustrative map of Abidjan's lagoon with a marker on the Plateau district"
        className="bg-plaster h-auto w-full rounded-[var(--radius-md)]"
      >
        {/* Lagoon: soft bands, echoing the logo's horizon lines. */}
        <path
          d="M0 205 C 70 190 110 220 170 210 S 260 168 310 186 S 420 228 480 200 L480 320 L0 320Z"
          fill="var(--color-lagoon-soft)"
        />
        <path
          d="M0 245 C 90 232 150 262 230 248 S 380 236 480 256"
          fill="none"
          stroke="var(--color-lagoon)"
          strokeOpacity={0.35}
          strokeWidth={1.5}
        />
        <path
          d="M0 280 C 120 270 200 292 300 282 S 420 276 480 286"
          fill="none"
          stroke="var(--color-lagoon)"
          strokeOpacity={0.25}
          strokeWidth={1.5}
        />
        {/* Peninsula */}
        <path
          d="M196 214 C 206 182 236 168 262 176 C 276 182 278 198 268 210 C 252 228 214 232 196 214Z"
          fill="var(--color-paper)"
          stroke="var(--color-line)"
        />
        {/* Street grid hint */}
        <g stroke="var(--color-line)" strokeWidth={1}>
          {[40, 80, 120, 160].map((y) => (
            <line key={y} x1={20} x2={460} y1={y} y2={y + 8} />
          ))}
          {[60, 140, 220, 300, 380].map((x) => (
            <line key={x} x1={x} x2={x + 14} y1={20} y2={190} />
          ))}
        </g>
        {/* Marker */}
        <circle cx={234} cy={196} r={22} fill="var(--color-sun)" opacity={0.25} />
        <circle
          cx={234}
          cy={196}
          r={9}
          fill="var(--color-sun)"
          stroke="var(--color-ink)"
          strokeWidth={2}
        />
        <text x={262} y={160} fontSize={15} fontWeight={600} fill="var(--color-ink)">
          Plateau
        </text>
        <text x={262} y={178} fontSize={12} fill="var(--color-muted)">
          Abidjan
        </text>
        <text x={24} y={300} fontSize={12} fill="var(--color-lagoon)">
          Ébrié lagoon
        </text>
      </svg>
      <figcaption className="type-small text-muted">
        Illustrative map, not to scale. Kora Energy is fictional and has no real office.
      </figcaption>
    </figure>
  );
}
