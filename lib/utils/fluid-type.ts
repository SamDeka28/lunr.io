/** CSS clamp helpers so studio-set sizes scale down cleanly on small screens */

export function fluidTitle(px: number, scale = 1): string {
  const target = Math.max(18, Math.round(px * scale));
  const min = Math.max(22, Math.round(target * 0.58));
  const preferred = Math.round(target * 0.42);
  const vw = Math.max(3.2, Math.min(7.5, target * 0.085));
  return `clamp(${Math.min(min, target)}px, ${vw}vw + ${preferred}px, ${target}px)`;
}

export function fluidBody(px: number, scale = 1): string {
  const target = Math.max(12, Math.round(px * scale));
  const min = Math.max(13, Math.round(target * 0.82));
  const preferred = Math.round(target * 0.55);
  return `clamp(${Math.min(min, target)}px, 2.1vw + ${preferred}px, ${target}px)`;
}

export function fluidButton(px: number): string {
  const target = Math.max(12, Math.round(px));
  const min = Math.max(12, Math.round(target * 0.875));
  return `clamp(${Math.min(min, target)}px, 1.6vw + ${Math.round(target * 0.62)}px, ${target}px)`;
}

export function fluidSpace(px: number, minRatio = 0.72): string {
  const target = Math.max(0, Math.round(px));
  if (target === 0) return "0px";
  const min = Math.max(8, Math.round(target * minRatio));
  return `clamp(${Math.min(min, target)}px, ${Math.max(0.5, target * 0.04)}vw + ${Math.round(target * 0.55)}px, ${target}px)`;
}

export function fluidAvatar(px: number, minPx = 56): string {
  const target = Math.max(minPx, Math.round(px));
  const min = Math.max(minPx, Math.round(target * 0.72));
  return `clamp(${min}px, ${Math.max(12, target * 0.22)}vw, ${target}px)`;
}
