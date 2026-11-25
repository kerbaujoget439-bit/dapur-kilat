// The kitchen floor plan: every station's rectangle, its label, and the spot the chef
// stands on to use it. The stations are spread out on purpose — pantry along the top
// wall, chopping on the left, wok on the right, plating and serving at the bottom —
// so every order is a route to plan, not a single button press.
export const VIEW = { width: 960, height: 640 };
export const KITCHEN_TOP = 108;
export const CHEF_SPEED = 235;
export const CHEF_RADIUS = 15;
export const INTERACT_RANGE = 86;

function station(id, label, kind, x, y, w, h, ax, ay, color) {
  return { id, label, kind, x, y, w, h, ax, ay, color };
}

export const STATIONS = [
  station('rice', 'Nasi', 'ingredient', 24, 124, 128, 52, 88, 202, '#f7f1dc'),
  station('noodles', 'Mie', 'ingredient', 180, 124, 128, 52, 244, 202, '#f2c14e'),
  station('egg', 'Telur', 'ingredient', 336, 124, 128, 52, 400, 202, '#fff6d8'),
  station('chicken', 'Ayam', 'ingredient', 492, 124, 128, 52, 556, 202, '#e8a58c'),
  station('chilli', 'Cabai', 'ingredient', 648, 124, 128, 52, 712, 202, '#e23b2e'),
  station('greens', 'Sayur', 'ingredient', 804, 124, 128, 52, 868, 202, '#58b368'),
  station('board', 'Talenan', 'board', 48, 296, 200, 92, 148, 414, '#caa06a'),
  station('wok', 'Wajan', 'wok', 712, 296, 200, 92, 812, 414, '#3a3f4a'),
  station('plating', 'Piring Saji', 'plating', 380, 500, 200, 64, 480, 476, '#e8e2d4'),
  station('serve', 'Antar', 'serve', 752, 500, 180, 64, 842, 476, '#c94f43'),
  station('bin', 'Buang', 'bin', 28, 500, 140, 64, 98, 476, '#8a8f98'),
];

export function stationById(id) {
  return STATIONS.find((s) => s.id === id) || null;
}

/** Purely visual floor dressing: a woven rug under the plating counter and a red
 * service mat in front of the serve window. The chef walks over both freely. */
export const FLOOR_DECOR = [
  { kind: 'rug', x: 380, y: 588, w: 200, h: 44, color: '#c94f43' },
  { kind: 'mat', x: 752, y: 588, w: 180, h: 44, color: '#a83a30' },
];

/** The station whose approach point is nearest to (x, y), within interaction range. */
export function nearestStation(x, y) {
  let best = null;
  let bestDistance = INTERACT_RANGE;
  for (const s of STATIONS) {
    const dx = s.ax - x;
    const dy = s.ay - y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < bestDistance) {
      bestDistance = d;
      best = s;
    }
  }
  return best;
}

/** True when the circle at (x, y, r) overlaps a station's counter. */
export function hitsCounter(x, y, r) {
  for (const s of STATIONS) {
    if (x + r > s.x && x - r < s.x + s.w && y + r > s.y && y - r < s.y + s.h) return true;
  }
  return false;
}

/** Keep the chef inside the kitchen floor. */
export function clampToFloor(x, y) {
  return {
    x: Math.min(VIEW.width - 24, Math.max(24, x)),
    y: Math.min(VIEW.height - 24, Math.max(KITCHEN_TOP + 8, y)),
  };
}
