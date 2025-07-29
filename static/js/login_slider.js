document.addEventListener('DOMContentLoaded', function() {
  const authModal = document.getElementById('authModal');
  const closeAuthModal = document.getElementById('closeAuthModal');
  const signInPanel = document.getElementById('signInPanel');
  const signUpPanel = document.getElementById('signUpPanel');
  const showSignUp = document.getElementById('showSignUp');
  const showSignIn = document.getElementById('showSignIn');
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toastTitle');
  const toastMessage = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');

  function showToast(type, title, message) {
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    toastIcon.innerHTML =
      type === 'success'
        ? '<i class="ri-checkbox-circle-line text-green-500"></i>'
        : '<i class="ri-error-warning-line text-red-500"></i>';
    toast.classList.remove('translate-x-full');
    setTimeout(() => toast.classList.add('translate-x-full'), 3000);
  }

  function togglePanels() {
    signInPanel.classList.toggle('translate-x-0');
    signInPanel.classList.toggle('-translate-x-full');
    signUpPanel.classList.toggle('translate-x-full');
    signUpPanel.classList.toggle('translate-x-0');
  }

  closeAuthModal.addEventListener('click', () => {
    authModal.classList.add('hidden');
  });
  showSignUp.addEventListener('click', togglePanels);
  showSignIn.addEventListener('click', togglePanels);

  signInForm.addEventListener('submit', e => {
    e.preventDefault();
    showToast('success', 'Welcome back!', 'Signed in successfully');
  });

  signUpForm.addEventListener('submit', e => {
    e.preventDefault();
    showToast('success', 'Welcome!', 'Account created successfully');
  });
});
