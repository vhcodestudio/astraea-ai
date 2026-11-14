// Decorative constellation: stars twinkle and the connecting lines are traced in with CSS
// (stroke-dashoffset), so it runs without JavaScript and respects reduced motion.
const STARS: [number, number, number][] = [
  [40, 210, 2.6], [110, 150, 1.8], [170, 175, 3.2], [235, 95, 2.2], [300, 130, 1.6], [350, 60, 2.8],
  [395, 160, 2], [455, 120, 3], [500, 200, 1.7], [270, 240, 2.4], [205, 280, 1.5], [420, 260, 2.1],
];
const LINKS: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [4, 6], [6, 7], [7, 8], [2, 9], [9, 10], [9, 11], [11, 8]];

export function Constellation() {
  return (
    <svg className="astraea-constellation" viewBox="0 0 540 320" aria-hidden="true">
      {LINKS.map(([a, b], i) => (
        <line key={i} x1={STARS[a][0]} y1={STARS[a][1]} x2={STARS[b][0]} y2={STARS[b][1]} style={{ animationDelay: `${0.3 + i * 0.12}s` }} />
      ))}
      {STARS.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} style={{ animationDelay: `${(i * 0.37) % 3}s` }} />
      ))}
    </svg>
  );
}
