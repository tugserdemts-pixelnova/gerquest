// flat steppe backdrop for the pages without the 3D scene: mountains, hills, pines and a ger
const TREES = [[96, 236, 1.1], [138, 244, .8], [178, 232, 1.25], [1268, 230, 1.2], [1312, 240, .85], [1352, 226, 1.05]];

export default function Steppe() {
  return (
    <svg id="steppe" viewBox="0 0 1440 360" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <path d="M0 250 L130 172 L250 226 L380 150 L520 232 L640 178 L780 240 L910 140 L1050 230 L1170 168 L1310 226 L1440 176 V360 H0Z" fill="#d3e8f2" />
      <path d="M910 140 L940 166 L924 163 L910 172 L896 162 L880 166Z M1170 168 L1192 186 L1180 184 L1170 190 L1160 183 L1148 186Z" fill="#eef6fa" />
      <path d="M0 256 C240 206 480 236 720 230 C960 224 1200 196 1440 236 V360 H0Z" fill="#e3eeaa" />
      {TREES.map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <rect x="-3" y="-4" width="6" height="12" fill="#8a5a2b" />
          <path d="M0 -58 L20 -4 H-20Z" fill="#6cc56c" />
          <path d="M0 -58 L20 -4 H0Z" fill="#58ad5a" />
        </g>
      ))}
      <path d="M0 298 C300 256 600 306 900 286 C1120 272 1300 262 1440 282 V360 H0Z" fill="#f6f2b4" />
      <g transform="translate(905 196) scale(1.6)">
        <ellipse cx="32" cy="49" rx="30" ry="4" fill="#000" opacity=".1" />
        <path d="M9 33 C17 22 25 17.5 32 17.5 S47 22 55 33 Z" fill="#fff" />
        <rect x="12" y="33" width="40" height="15" fill="#fbf6ea" />
        <path d="M12 36.5H52M12 44.5H52" stroke="#1f4597" strokeWidth="1.2" />
        <rect x="27.5" y="35" width="9" height="13" rx="1" fill="#e2582a" />
        <ellipse cx="32" cy="18.5" rx="6" ry="2.4" fill="#e2582a" />
      </g>
    </svg>
  );
}
