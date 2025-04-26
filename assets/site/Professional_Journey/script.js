document.addEventListener('DOMContentLoaded', () => {
  // Element references
  const popup = document.getElementById('popup');
  const overlay = document.getElementById('overlay');
  const closeBtn = popup.querySelector('.popup-close');

  // Create a single tooltip element
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

  // Attach events to each box wrapper
  document.querySelectorAll('.box-wrapper').forEach(box => {
    box.addEventListener('mouseenter', (e) => {
      tooltip.textContent = 'Click to know more';
      tooltip.style.top = `${e.clientY + 10}px`;
      tooltip.style.left = `${e.clientX + 10}px`;
      tooltip.style.display = 'block';
    });

    box.addEventListener('mousemove', (e) => {
      tooltip.style.top = `${e.clientY + 10}px`;
      tooltip.style.left = `${e.clientX + 10}px`;
    });

    box.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });

    box.addEventListener('click', () => {
      const content = box.querySelector('.box').dataset.content || '';
      popup.querySelector('.popup-content p').innerHTML = content;
      popup.style.display = 'block';
      overlay.style.display = 'block';
      tooltip.style.display = 'none';
    });
  });

  // Close popup on close button click
  closeBtn.addEventListener('click', () => {
    popup.style.display = 'none';
    overlay.style.display = 'none';
  });

  // Close popup on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      popup.style.display = 'none';
      overlay.style.display = 'none';
    }
  });
});
