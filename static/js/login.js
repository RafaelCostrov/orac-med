function togglePassword() {
  const passwordInput = document.getElementById('password');
  const eyeIcon = document.getElementById('eyeIcon');

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    eyeIcon.src = '../img/icons/view.png' ;
    eyeIcon.alt = 'Ocultar senha';
  } else {
    passwordInput.type = 'password';
    eyeIcon.src = '../img/icons/hide.png'; 
    eyeIcon.alt = 'Mostrar senha';
  }
}



    