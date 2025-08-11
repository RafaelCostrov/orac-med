// conta.js

// Função para abrir e fechar o menu de perfil
const avatarBtn = document.getElementById('avatarBtn');
const profileMenu = document.getElementById('profileMenu');

if (avatarBtn && profileMenu) {
  avatarBtn.addEventListener('click', () => {
    const isOpen = profileMenu.classList.contains('open');

    if (isOpen) {
      profileMenu.classList.remove('open');
      profileMenu.setAttribute('aria-hidden', 'true');
    } else {
      profileMenu.classList.add('open');
      profileMenu.setAttribute('aria-hidden', 'false');
    }
  });

  // Fecha o menu se clicar fora dele
  window.addEventListener('click', (event) => {
    if (!avatarBtn.contains(event.target) && !profileMenu.contains(event.target)) {
      profileMenu.classList.remove('open');
      profileMenu.setAttribute('aria-hidden', 'true');
    }
  });
}

// Remove o item "Minha conta" se estiver na página conta.html
if (window.location.pathname.includes('conta.html')) {
  const btnMinhaConta = document.getElementById('btnMinhaConta');
  if (btnMinhaConta) {
    btnMinhaConta.remove();
  }
}



// ../js/conta.js
document.addEventListener('DOMContentLoaded', () => {
  // redirecionar "Sair" -> login.html
  const sair = document.getElementById('btnSair');
  if (sair) {
    sair.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'login.html';
    });
  }

  // (opcional) esconder "Minha conta" nesta página
  const minhaConta = document.getElementById('btnMinhaConta');
  if (minhaConta) minhaConta.style.display = 'none';
});

