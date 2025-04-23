// Handle click-to-popup functionality
document.querySelectorAll('.box-wrapper').forEach((box) => {
  box.addEventListener('click', () => {
    const popup = document.getElementById('popup');
    popup.style.display = 'block';
    const content = box.querySelector('.box').dataset.content || 'Details about the selected tile';
    popup.querySelector('.popup-content p').textContent = content;
  });
});

// Close popup when clicking outside of it
document.addEventListener('click', (event) => {
  const popup = document.getElementById('popup');
  if (popup.style.display === 'block' && !popup.contains(event.target) && !event.target.closest('.box-wrapper')) {
    popup.style.display = 'none';
  }
});

// Add a close button inside the popup
const closeButton = document.createElement('button');
closeButton.textContent = '×';
closeButton.style.position = 'absolute';
closeButton.style.top = '10px';
closeButton.style.right = '10px';
closeButton.style.background = 'transparent';
closeButton.style.border = 'none';
closeButton.style.fontSize = '20px';
closeButton.style.cursor = 'pointer';
closeButton.addEventListener('click', () => {
  document.getElementById('popup').style.display = 'none';
});
document.getElementById('popup').appendChild(closeButton);

// Add hover effects dynamically
document.querySelectorAll('.box-wrapper').forEach((box) => {
  box.addEventListener('mouseenter', () => {
    box.querySelector('.box').style.transform = 'scale(1.1)';
    box.querySelector('.shadow').style.filter = 'blur(30px)';
  });
  box.addEventListener('mouseleave', () => {
    box.querySelector('.box').style.transform = 'scale(1)';
    box.querySelector('.shadow').style.filter = 'blur(20px)';
  });
});