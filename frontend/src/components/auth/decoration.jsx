/**
 * components/auth/SakuraDecoration.jsx
 *
 * Decoração de galho + pétalas de cerejeira, feita em SVG puro.
 * Fica no lugar da ilustração das personagens do protótipo — não
 * recrio arte de personagens, mas mantém a mesma paleta/atmosfera.
 * `position` controla o canto onde o galho aparece.
 */

export default function Decoration({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 400"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M-10 40 C 60 20, 90 60, 140 50 S 220 10, 260 40"
        stroke="#c98aa3"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.55"
      />
      {[
        [30, 55], [58, 35], [92, 62], [125, 40], [150, 65],
        [180, 30], [205, 55], [235, 42],
      ].map(([cx, cy], i) => (
        <g key={i} transform={`translate(${cx} ${cy}) rotate(${(i * 37) % 360})`} opacity="0.85">
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse
              key={angle}
              cx="0"
              cy="-6"
              rx="4.2"
              ry="6.5"
              fill={i % 2 === 0 ? '#f5b8cf' : '#f2a0be'}
              transform={`rotate(${angle})`}
            />
          ))}
          <circle r="2" fill="#e6698f" />
        </g>
      ))}
    </svg>
  );
}
