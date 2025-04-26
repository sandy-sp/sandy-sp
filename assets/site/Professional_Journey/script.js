document.addEventListener('DOMContentLoaded', () => {
  // References to popup and overlay
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
    zIndex: '1000'
  });
  document.body.appendChild(tooltip);

  // Box interaction handlers
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
      // Show popup with content
      const content = box.querySelector('.box').dataset.content || '';
      popup.querySelector('.popup-content p').innerHTML = content;
      popup.style.display   = 'block';
      overlay.style.display = 'block';
      tooltip.style.display = 'none';
    });
  });

  // Close popup on close button
  closeBtn.addEventListener('click', () => {
    popup.style.display   = 'none';
    overlay.style.display = 'none';
  });

  // Close when clicking overlay
  overlay.addEventListener('click', () => {
    popup.style.display   = 'none';
    overlay.style.display = 'none';
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      popup.style.display   = 'none';
      overlay.style.display = 'none';
    }
  });
});
