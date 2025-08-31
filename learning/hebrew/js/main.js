// Main script to handle tab switching

document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons and contents
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));
      // Activate the clicked tab and its content
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
});