document.addEventListener('DOMContentLoaded', () => {
  const popup   = document.getElementById('popup');
  const overlay = document.getElementById('overlay');
  const closeBtn= popup.querySelector('.popup-close');

  // Create a single hover tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'hover-tooltip';
  Object.assign(tooltip.style, {
    position: 'absolute',
    padding: '5px 10px',
    background: '#000',
    color: '#fff',
    fontSize: '0.8em',
    borderRadius: '5px',
    display: 'none',
    zIndex: '1000',
    pointerEvents: 'none'
  });
  document.body.appendChild(tooltip);

  function openPopup(content) {
    popup.querySelector('.popup-content p').innerHTML = content;
    overlay.style.display = 'block';
    popup.style.display   = 'block';
  }

  function closePopup() {
    popup.style.display   = 'none';
    overlay.style.display = 'none';
  }

  // Box hover and click handlers
  document.querySelectorAll('.box-wrapper').forEach(box => {
    box.addEventListener('mouseenter', e => {
      tooltip.textContent = 'Click to know more';
      tooltip.style.top     = `${e.clientY + 10}px`;
      tooltip.style.left    = `${e.clientX + 10}px`;
      tooltip.style.display = 'block';
    });
    box.addEventListener('mousemove', e => {
      tooltip.style.top  = `${e.clientY + 10}px`;
      tooltip.style.left = `${e.clientX + 10}px`;
    });
    box.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });
    box.addEventListener('click', () => {
      const content = box.querySelector('.box').dataset.content || '';
      openPopup(content);
    });
  });

  // Closing triggers
  closeBtn.addEventListener('click', closePopup);
  overlay.addEventListener('click', closePopup);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePopup();
  });
});
