// document.addEventListener('DOMContentLoaded', () => {
//   const input = document.getElementById('messageInput');
//   const countDisplay = document.getElementById('charWordCount');

//   function updateCounts() {
//     if (!countDisplay) return;  // Skip if charWordCount doesn't exist
//     const text = input.value;
//     const charCount = text.length;
//     const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
//     countDisplay.textContent = `${charCount} chars • ${wordCount} words`;
//   }

//   input.addEventListener('input', updateCounts);
// });
