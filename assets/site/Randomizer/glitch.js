const canvas = document.getElementById('glitchCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const lines = [
  'Click with',
  'caution:',
  'May induce',
  'job offers'
];

const fontSize = 73;
const lineHeight = fontSize * 1.5;
const startY = (canvas.height / 2) - (lines.length * lineHeight / 2);
const glitchChars = ['@', '#', '%', '&', '∆', '*', '¥', '?', '/', '§', 'µ', '`', '•', '≈', '™'];

let timeStart = performance.now();
let finalRender = false;

function getRandomChar() {
  return glitchChars[Math.floor(Math.random() * glitchChars.length)];
}

function drawGlitchText() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${fontSize}px 'Segoe UI', sans-serif`;
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';

  lines.forEach((line, lineIndex) => {
    const y = startY + lineIndex * lineHeight;
    const chars = line.split('');

    const totalWidth = ctx.measureText(line).width;
    let x = canvas.width / 2 - totalWidth / 2;

    chars.forEach(char => {
      const displayChar = finalRender ? char : (char === ' ' ? ' ' : getRandomChar());
      ctx.fillText(displayChar, x + ctx.measureText(char).width / 2, y);
      x += ctx.measureText(char).width;
    });
  });
}

function animate() {
  const now = performance.now();
  if (now - timeStart > 6000) {
    finalRender = true;
  }

  drawGlitchText();
  if (!finalRender) {
    requestAnimationFrame(animate);
  }
}

animate();
