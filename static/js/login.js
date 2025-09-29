function togglePassword() {
  const passwordInput = document.getElementById('senha');
  const eyeIcon = document.getElementById('eyeIcon');

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    eyeIcon.src = "../static/img/icons/view.png  ";
    eyeIcon.alt = 'Ocultar senha';
  } else {
    passwordInput.type = 'password';
    eyeIcon.src = '../static/img/icons/hide.png';
    eyeIcon.alt = 'Mostrar senha';
  }
}



