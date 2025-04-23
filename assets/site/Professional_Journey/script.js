// Handle click-to-popup functionality
document.querySelectorAll('.box-wrapper').forEach((box) => {
  box.addEventListener('click', () => {
    const popup = document.getElementById('popup');
    popup.style.display = 'block';
    const content = box.querySelector('.box').dataset.content || 'Details about the selected tile';
    popup.querySelector('.popup-content p').textContent = content;
  });
});

// Close popup functionality
document.querySelector('.close-popup').addEventListener('click', () => {
  document.getElementById('popup').style.display = 'none';
});

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