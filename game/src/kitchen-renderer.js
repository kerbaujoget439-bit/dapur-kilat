// Drawing the kitchen itself: the tiled floor, the counters with their labels, the
// food drawn so it looks worth serving, the chef, and the particles and floating
// score labels. Everything is canvas vector art made in code — no image files.
import { INGREDIENTS } from './recipes.js';
import { STATIONS, VIEW, FLOOR_DECOR, KITCHEN_TOP } from './kitchen-layout.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function label(ctx, text, x, y, size, color) {
  ctx.font = `bold ${size}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color || '#3a2c1c';
  ctx.fillText(text, x, y);
}

/** Draw one ingredient as a little plate of food: raw, chopped or cooked. */
export function drawIngredient(ctx, kind, prep, x, y, r) {
  const ing = INGREDIENTS[kind];
  ctx.save();
  ctx.translate(x, y);
  if (kind === 'rice') {
    ctx.fillStyle = prep === 'cooked' ? '#fff8e0' : '#efe8cf';
    ctx.beginPath();
    ctx.ellipse(0, 2, r, r * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fffdf2';
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath();
      ctx.arc(-r * 0.5 + i * r * 0.25, -r * 0.25 + (i % 2) * r * 0.2, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
    if (prep === 'cooked') {
      ctx.strokeStyle = '#e8a13c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.7, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }
  } else if (kind === 'noodles') {
    ctx.strokeStyle = prep === 'cooked' ? '#f7c948' : '#e0aa3e';
    ctx.lineWidth = r * 0.28;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.8, -r * 0.4 + i * r * 0.4);
      ctx.quadraticCurveTo(0, -r * 0.7 + i * r * 0.4, r * 0.8, -r * 0.4 + i * r * 0.4);
      ctx.stroke();
    }
    if (prep === 'cooked') {
      ctx.fillStyle = '#58b368';
      ctx.beginPath();
      ctx.arc(r * 0.5, -r * 0.5, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === 'egg') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.8, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f7b731';
    ctx.beginPath();
    ctx.arc(r * 0.1, 0, r * 0.42, 0, Math.PI * 2);
    ctx.fill();
    if (prep === 'chopped') {
      ctx.strokeStyle = '#d8c690';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-r * 0.5, -r * 0.3);
      ctx.lineTo(r * 0.5, r * 0.3);
      ctx.moveTo(r * 0.5, -r * 0.3);
      ctx.lineTo(-r * 0.5, r * 0.3);
      ctx.stroke();
    }
  } else if (kind === 'chicken') {
    ctx.fillStyle = prep === 'chopped' ? '#d98a68' : '#e8a58c';
    ctx.beginPath();
    ctx.ellipse(-r * 0.15, 0, r * 0.75, r * 0.6, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f3e2cf';
    ctx.lineWidth = r * 0.28;
    ctx.beginPath();
    ctx.moveTo(r * 0.45, -r * 0.25);
    ctx.lineTo(r * 0.95, -r * 0.7);
    ctx.stroke();
    ctx.fillStyle = '#f3e2cf';
    ctx.beginPath();
    ctx.arc(r * 0.98, -r * 0.78, r * 0.22, 0, Math.PI * 2);
    ctx.arc(r * 0.82, -r * 0.9, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
    if (prep === 'chopped') {
      ctx.fillStyle = '#b96a4e';
      ctx.fillRect(-r * 0.6, -r * 0.1, r * 0.25, r * 0.25);
      ctx.fillRect(r * 0.05, r * 0.15, r * 0.25, r * 0.25);
    }
  } else if (kind === 'chilli') {
    ctx.strokeStyle = prep === 'chopped' ? '#c22a1e' : '#e23b2e';
    ctx.lineWidth = r * 0.42;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, r * 0.3);
    ctx.quadraticCurveTo(0, -r * 0.9, r * 0.85, -r * 0.35);
    ctx.stroke();
    ctx.strokeStyle = '#2f7a3e';
    ctx.lineWidth = r * 0.2;
    ctx.beginPath();
    ctx.moveTo(r * 0.85, -r * 0.35);
    ctx.lineTo(r * 1.05, -r * 0.75);
    ctx.stroke();
    if (prep === 'chopped') {
      ctx.fillStyle = '#ff7a5c';
      ctx.beginPath();
      ctx.arc(-r * 0.3, r * 0.2, r * 0.28, 0, Math.PI * 2);
      ctx.arc(r * 0.35, -r * 0.1, r * 0.28, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (kind === 'greens') {
    ctx.fillStyle = prep === 'chopped' ? '#3f9e57' : '#58b368';
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.ellipse(-r * 0.5 + i * r * 0.5, (i % 2) * r * 0.25 - r * 0.1, r * 0.42, r * 0.55, (i - 1) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#2f7a3e';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.5 + i * r * 0.5, -r * 0.5);
      ctx.lineTo(-r * 0.5 + i * r * 0.5, r * 0.4);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawCounter(ctx, s, active) {
  ctx.save();
  ctx.fillStyle = '#8a5a30';
  roundRect(ctx, s.x + 3, s.y + 4, s.w, s.h, 10);
  ctx.fill();
  ctx.fillStyle = active ? '#e8b06a' : '#c98d54';
  roundRect(ctx, s.x, s.y, s.w, s.h, 10);
  ctx.fill();
  ctx.strokeStyle = active ? '#ffd94a' : '#7a4a22';
  ctx.lineWidth = active ? 3 : 1.5;
  ctx.stroke();
  ctx.restore();
}

function drawStationContents(ctx, state, s) {
  if (s.kind === 'ingredient') {
    drawIngredient(ctx, s.id, 'raw', s.x + s.w / 2, s.y + s.h / 2 - 6, 15);
    label(ctx, s.label, s.x + s.w / 2, s.y + s.h - 10, 12, '#fff8e8');
    return;
  }
  if (s.id === 'board') {
    ctx.fillStyle = '#e8c893';
    roundRect(ctx, s.x + 14, s.y + 12, s.w - 28, s.h - 30, 8);
    ctx.fill();
    ctx.strokeStyle = '#b98d54';
    ctx.lineWidth = 1;
    ctx.stroke();
    if (state.board) {
      drawIngredient(ctx, state.board.kind, state.board.prep, s.x + s.w / 2, s.y + s.h / 2 - 4, 20);
      if (state.board.prep === 'raw') {
        const w = 90;
        ctx.fillStyle = '#3a2c1c';
        ctx.fillRect(s.x + s.w / 2 - w / 2, s.y + s.h - 16, w, 7);
        ctx.fillStyle = '#ffd94a';
        ctx.fillRect(s.x + s.w / 2 - w / 2, s.y + s.h - 16, (w * (3 - state.board.chops)) / 3, 7);
      }
    } else {
      ctx.fillStyle = '#8a6a42';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('letakkan bahan di sini', s.x + s.w / 2, s.y + s.h / 2);
    }
    label(ctx, 'Talenan — tekan E 3x', s.x + s.w / 2, s.y + s.h + 14, 12, '#6b543a');
    return;
  }
  if (s.id === 'wok') {
    ctx.fillStyle = '#22252c';
    roundRect(ctx, s.x + 10, s.y + 10, s.w - 20, s.h - 26, 10);
    ctx.fill();
    if (state.wok) {
      const hot = !state.wok.cooked;
      ctx.fillStyle = hot ? '#ff5a3c' : '#3a3f4a';
      ctx.beginPath();
      ctx.ellipse(s.x + s.w / 2, s.y + 46, 52, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#14161a';
      ctx.beginPath();
      ctx.ellipse(s.x + s.w / 2, s.y + 40, 58, 20, 0, Math.PI, 0);
      ctx.fill();
      if (state.wok.burnt) {
        ctx.fillStyle = '#2b2b2b';
        ctx.beginPath();
        ctx.arc(s.x + s.w / 2, s.y + 36, 18, 0, Math.PI * 2);
        ctx.fill();
        label(ctx, 'GOSONG! kerok', s.x + s.w / 2, s.y + s.h - 12, 12, '#ff8c7a');
        return;
      }
      drawIngredient(ctx, state.wok.kind, state.wok.cooked ? 'cooked' : 'raw', s.x + s.w / 2, s.y + 38, 20);
      if (hot) {
        ctx.fillStyle = '#3a2c1c';
        ctx.fillRect(s.x + s.w / 2 - 45, s.y + s.h - 18, 90, 7);
        ctx.fillStyle = '#ff8c3b';
        ctx.fillRect(s.x + s.w / 2 - 45, s.y + s.h - 18, 90 * state.wok.progress, 7);
      } else {
        label(ctx, 'SIAP! ambil', s.x + s.w / 2, s.y + s.h - 12, 12, '#ffd94a');
      }
    } else {
      ctx.fillStyle = '#5a606c';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('wajan kosong', s.x + s.w / 2, s.y + s.h / 2);
    }
    label(ctx, 'Wajan — masak 4 detik', s.x + s.w / 2, s.y + s.h + 14, 12, '#6b543a');
    return;
  }
  if (s.id === 'plating') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(s.x + s.w / 2, s.y + s.h / 2 - 2, 56, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c9c2ae';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (state.plate) {
      const parts = state.plate.contents;
      parts.forEach((key, i) => {
        const [kind, prep] = key.split(':');
        const px = s.x + s.w / 2 + (i - (parts.length - 1) / 2) * 30;
        drawIngredient(ctx, kind, prep, px, s.y + s.h / 2 - 2, 11);
      });
    }
    label(ctx, 'Piring Saji — susun pesanan', s.x + s.w / 2, s.y + s.h + 14, 12, '#6b543a');
    return;
  }
  if (s.id === 'serve') {
    ctx.fillStyle = '#a83a30';
    roundRect(ctx, s.x + 8, s.y + 8, s.w - 16, s.h - 16, 8);
    ctx.fill();
    ctx.fillStyle = '#ffd94a';
    ctx.beginPath();
    ctx.arc(s.x + s.w / 2, s.y + 26, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a2c1c';
    ctx.fillRect(s.x + s.w / 2 - 2, s.y + 34, 4, 8);
    label(ctx, 'ANTAR PESANAN', s.x + s.w / 2, s.y + s.h - 12, 13, '#ffe9c9');
    return;
  }
  if (s.id === 'bin') {
    ctx.fillStyle = '#6a6f78';
    roundRect(ctx, s.x + 20, s.y + 10, s.w - 40, s.h - 20, 6);
    ctx.fill();
    ctx.strokeStyle = '#4a4e55';
    ctx.lineWidth = 2;
    ctx.stroke();
    label(ctx, 'Buang', s.x + s.w / 2, s.y + s.h + 14, 12, '#6b543a');
  }
}

function drawChef(ctx, state) {
  const chef = state.chef;
  ctx.save();
  ctx.translate(chef.x, chef.y);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 14, 16, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2e7d6b';
  ctx.beginPath();
  ctx.arc(0, 2, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f6e8c9';
  ctx.beginPath();
  ctx.arc(0, -8, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-5, -16, 6, 0, Math.PI * 2);
  ctx.arc(0, -19, 7, 0, Math.PI * 2);
  ctx.arc(5, -16, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a2c1c';
  ctx.beginPath();
  ctx.arc(-3.5, -9, 1.6, 0, Math.PI * 2);
  ctx.arc(3.5, -9, 1.6, 0, Math.PI * 2);
  ctx.fill();
  if (state.carried) {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(0, -34, 15, 0, Math.PI * 2);
    ctx.fill();
    if (state.carried.type === 'plate') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, -34, 13, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c9c2ae';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      state.carried.contents.forEach((key, i) => {
        const [kind, prep] = key.split(':');
        drawIngredient(ctx, kind, prep, (i - (state.carried.contents.length - 1) / 2) * 9, -34, 4);
      });
    } else {
      drawIngredient(ctx, state.carried.kind, state.carried.prep, 0, -34, 10);
    }
  }
  ctx.restore();
}

function drawFloor(ctx) {
  ctx.fillStyle = '#e9d8b8';
  ctx.fillRect(0, KITCHEN_TOP, VIEW.width, VIEW.height - KITCHEN_TOP);
  const tile = 48;
  for (let y = KITCHEN_TOP; y < VIEW.height; y += tile) {
    for (let x = 0; x < VIEW.width; x += tile) {
      const even = ((x / tile) + (y / tile)) % 2 === 0;
      ctx.fillStyle = even ? '#efdfc0' : '#e2cda6';
      ctx.fillRect(x, y, tile, tile);
    }
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= VIEW.width; x += tile) {
    ctx.beginPath();
    ctx.moveTo(x, KITCHEN_TOP);
    ctx.lineTo(x, VIEW.height);
    ctx.stroke();
  }
  for (let y = KITCHEN_TOP; y <= VIEW.height; y += tile) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(VIEW.width, y);
    ctx.stroke();
  }
  for (const decor of FLOOR_DECOR) {
    ctx.fillStyle = decor.color;
    ctx.globalAlpha = 0.85;
    roundRect(ctx, decor.x, decor.y, decor.w, decor.h, 8);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    roundRect(ctx, decor.x + 6, decor.y + 6, decor.w - 12, decor.h - 12, 5);
    ctx.stroke();
  }
}

/** Draw the whole kitchen scene for one frame. `activeStation` gets a gold outline. */
export function drawKitchen(ctx, state, activeStation) {
  drawFloor(ctx);
  for (const s of STATIONS) {
    drawCounter(ctx, s, activeStation && activeStation.id === s.id);
    drawStationContents(ctx, state, s);
  }
  drawChef(ctx, state);
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  for (const f of state.floats) {
    ctx.globalAlpha = Math.max(0, f.life / f.maxLife);
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = f.color;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 3;
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;
}
