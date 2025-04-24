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

const lineHeight = 50 * 1.5; // Initial line height
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
          revealTime: performance.now() + 3000 + Math.random() * 3000 // after 5-7s
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

  const fontSize = canvas.width / 15; // Dynamic font size based on canvas width
  ctx.font = `900 ${fontSize}px 'Raleway', 'Segoe UI', sans-serif`; // Custom font family and weight
  ctx.textAlign = 'center';

  const colors = ['#ffa8B6', '#edf756', '#8458B3', '#9df9ef']; // Dynamic colors for each line
  const startY = (canvas.height / 2) - (lines.length * lineHeight / 2);

  lines.forEach((line, lineIndex) => {
    const y = startY + lineIndex * lineHeight;
    const chars = line.split('');
    const totalWidth = ctx.measureText(line).width;
    let x = canvas.width / 2 - totalWidth / 2;

    ctx.fillStyle = colors[lineIndex % colors.length]; // Alternate colors per line
    ctx.shadowColor = colors[lineIndex % colors.length]; // Glow effect matches line color
    ctx.shadowBlur = 10; // Glow intensity

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
