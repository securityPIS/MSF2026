let ctx

// Getar + bunyi singkat supaya petugas tahu hasil scan tanpa harus membaca layar
export function feedback(status) {
  const ok = status === 'ok'
  try {
    navigator.vibrate?.(ok ? 80 : [140, 80, 140])
  } catch { /* abaikan */ }
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const length = ok ? 0.15 : 0.35
    osc.type = ok ? 'sine' : 'square'
    osc.frequency.value = ok ? 1046 : status === 'duplicate' ? 660 : 220
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + length)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + length)
  } catch { /* abaikan */ }
}
