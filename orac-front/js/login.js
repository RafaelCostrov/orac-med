function togglePassword() {
  const passwordInput = document.getElementById('password');
  const eyeIcon = document.getElementById('eyeIcon');

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    eyeIcon.src = 'img/eye-black-open.png' ;
    eyeIcon.alt = 'Ocultar senha';
  } else {
    passwordInput.type = 'password';
    eyeIcon.src = 'img/eye-black.png'; // Ícone de "olho fechado"
    eyeIcon.alt = 'Mostrar senha';
  }
}



    