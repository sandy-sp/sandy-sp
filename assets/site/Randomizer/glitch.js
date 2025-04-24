const canvas = document.getElementById('glitchCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}

resizeCanvas(); // Initial resize
window.addEventListener('resize', resizeCanvas);

const lines = [
  'Click With',
  'CAUTION !',
  'May Induce',
  'Job Offers'
];

const fontSize = 50;
const lineHeight = fontSize * 1.5;
const glitchChars = ['#', '&', '%', '*', '¥', '∆', 'ø', '?', '/', '§', '+', '=', '!', '$', '^', '(', ')', '-', '_', '[', ']', '{', '}', ';', ':', ',', '.', '<', '>', '|', '~', '`', '°', '•', '√', '∞', 'π', 'Ω', '≈', '≠'];

let charStates = [];

// Flatten the characters and assign randomized reveal delays
(function initCharStates() {
  lines.forEach((line, lineIndex) => {
    line.split('').forEach((char, charIndex) => {
      if (char !== ' ') {
        charStates.push({
          char,
          lineIndex,
          charIndex,
          revealed: false,
          revealTime: performance.now() + 2000 + Math.random() * 2000 // after 5-7s
        });
      }
    });
  });
})();

function getRandomChar() {
  return glitchChars[Math.floor(Math.random() * glitchChars.length)];
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `bold ${fontSize}px 'Segoe UI', sans-serif`;
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';

  const startY = (canvas.height / 2) - (lines.length * lineHeight / 2);

  lines.forEach((line, lineIndex) => {
    const y = startY + lineIndex * lineHeight;
    const chars = line.split('');
    const totalWidth = ctx.measureText(line).width;
    let x = canvas.width / 2 - totalWidth / 2;

    chars.forEach((char, charIndex) => {
      const state = charStates.find(
        s => s.lineIndex === lineIndex && s.charIndex === charIndex
      );

      const displayChar = char === ' ' ? ' ' :
        state && state.revealed ? state.char : getRandomChar();

      ctx.fillText(displayChar, x + ctx.measureText(char).width / 2, y);
      x += ctx.measureText(char).width;
    });
  });
}

function animate(currentTime) {
  charStates.forEach(state => {
    if (!state.revealed && currentTime >= state.revealTime) {
      state.revealed = true;
    }
  });

  draw();

  if (charStates.some(s => !s.revealed)) {
    requestAnimationFrame(animate);
  } else {
    draw(); // Final static draw
  }
}

requestAnimationFrame(animate);
