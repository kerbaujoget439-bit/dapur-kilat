// The heads-up display: the order board along the top, the shift timer you can
// feel, coins, hearts and served count, plus the title and shift-end screens and
// the red rush pulse when time or patience runs low.
import { INGREDIENTS, dishComponents } from './recipes.js';
import { VIEW, KITCHEN_TOP } from './kitchen-layout.js';
import { SHIFT_SECONDS } from './game-state.js';
import { drawIngredient } from './kitchen-renderer.js';

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${rest < 10 ? '0' : ''}${rest}`;
}

function drawTicket(ctx, order, x, y, w, h) {
  const fraction = Math.max(0, order.patience / order.patienceMax);
  ctx.save();
  ctx.fillStyle = '#fffaf0';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = fraction < 0.25 ? '#e23b2e' : '#c9b896';
  ctx.lineWidth = fraction < 0.25 ? 3 : 1.5;
  ctx.stroke();
  ctx.fillStyle = '#3a2c1c';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(order.dish.name, x + 10, y + 16);
  const parts = dishComponents(order.dish);
  parts.forEach((key, i) => {
    const [kind, prep] = key.split(':');
    drawIngredient(ctx, kind, prep, x + 24 + i * 34, y + 44, 11);
  });
  ctx.fillStyle = fraction < 0.25 ? '#e23b2e' : '#2f7a3e';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillText(`${Math.ceil(order.patience)} dtk`, x + 10, y + h - 12);
  ctx.fillStyle = '#d8cdb4';
  ctx.fillRect(x + 74, y + h - 16, w - 84, 8);
  ctx.fillStyle = fraction < 0.25 ? '#e23b2e' : fraction < 0.5 ? '#f2a93b' : '#58b368';
  ctx.fillRect(x + 74, y + h - 16, (w - 84) * fraction, 8);
  ctx.restore();
}

function drawHearts(ctx, hearts, x, y) {
  ctx.save();
  ctx.font = '20px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = i < hearts ? '#e23b2e' : '#8a8f98';
    ctx.fillText('♥', x + i * 24, y);
  }
  ctx.restore();
}

export function drawHud(ctx, state) {
  ctx.save();
  ctx.fillStyle = '#2b2118';
  ctx.fillRect(0, 0, VIEW.width, KITCHEN_TOP);
  ctx.fillStyle = '#ffd94a';
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('DAPUR KILAT', 16, 22);
  ctx.fillStyle = '#f3e2c7';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText('Papan Pesanan — masak, susun, antar!', 16, 44);
  const ticketW = 168;
  const ticketH = 76;
  const gap = 10;
  const startX = 296;
  for (let i = 0; i < 3; i += 1) {
    const order = state.orders[i];
    const x = startX + i * (ticketW + gap);
    if (order) {
      drawTicket(ctx, order, x, 12, ticketW, ticketH);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.roundRect(x, 12, ticketW, ticketH, 8);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = '13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('menunggu pesanan…', x + ticketW / 2, 50);
    }
  }
  const hudX = 948;
  ctx.textAlign = 'right';
  ctx.fillStyle = state.timeLeft <= 30 ? '#ff6b5e' : '#ffd94a';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillText(formatTime(state.timeLeft), hudX, 24);
  ctx.fillStyle = '#f3e2c7';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText(`KOIN ${state.coins}`, hudX, 50);
  if (state.streak >= 2) {
    ctx.fillStyle = '#ff9d3b';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText(`RENTETAN x${state.streak}`, hudX, 66);
  }
  ctx.fillStyle = '#f3e2c7';
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(`Tersaji ${state.served}`, hudX, 84);
  ctx.fillStyle = 'rgba(243,226,199,0.55)';
  ctx.font = '11px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('E pakai stasiun · P jeda · M bisu', 16, KITCHEN_TOP - 8);
  drawHearts(ctx, state.hearts, 16, 78);
  const barW = 200;
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(360, 94, barW, 6);
  ctx.fillStyle = '#58b368';
  ctx.fillRect(360, 94, barW * (state.timeLeft / SHIFT_SECONDS), 6);
  ctx.fillStyle = '#f3e2c7';
  ctx.font = '11px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('SHIFT', 320, 97);
  ctx.restore();
  if (state.rush && state.phase === 'play') {
    const pulse = 0.25 + 0.2 * Math.sin(state.time * 6);
    ctx.save();
    ctx.strokeStyle = `rgba(226,59,46,${pulse.toFixed(3)})`;
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, VIEW.width - 6, VIEW.height - 6);
    ctx.restore();
  }
}

function overlay(ctx, title, lines, accent) {
  ctx.save();
  ctx.fillStyle = 'rgba(20,14,8,0.72)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = accent || '#ffd94a';
  ctx.font = 'bold 44px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, VIEW.width / 2, 230);
  ctx.fillStyle = '#fff8e8';
  ctx.font = '19px system-ui, sans-serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, VIEW.width / 2, 300 + i * 34);
  });
  ctx.restore();
}

export function drawTitle(ctx, state) {
  overlay(ctx, 'DAPUR KILAT', [
    'Masak pesanan secepat kilat sebelum shift berakhir!',
    'WASD / panah untuk berjalan — E atau klik untuk memakai stasiun.',
    'Ambil bahan → cincang di talenan → masak di wajan → susun di piring → antar!',
    'Tekan ENTER atau klik untuk mulai memasak.',
  ], '#ffd94a');
}

export function drawPaused(ctx) {
  overlay(ctx, 'JEDA', [
    'Istirahat sebentar — wajan tidak akan gosong selagi jeda.',
    'Tekan P lagi untuk lanjut memasak.',
  ], '#f3e2c7');
}

export function drawGameOver(ctx, state) {
  if (state.won) {
    overlay(ctx, 'SHIFT SELESAI!', [
      `Kamu menyajikan ${state.served} pesanan dan mengumpulkan ${state.coins} koin.`,
      `${state.failed} pesanan gagal — dapur tetap berdiri berkat kamu.`,
      'Tekan R untuk memasak satu shift lagi.',
    ], '#58b368');
  } else {
    overlay(ctx, 'DAPUR KEWALAHAN!', [
      `Tiga pesanan gagal — shift berakhir dengan ${state.coins} koin.`,
      `Kamu sempat menyajikan ${state.served} pesanan. Coba lagi, koki!`,
      'Tekan R untuk memasak satu shift lagi.',
    ], '#ff6b5e');
  }
}
