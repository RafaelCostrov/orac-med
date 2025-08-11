// ../js/conta.js
document.addEventListener('DOMContentLoaded', () => {
  // ===== Helpers =====
  const $  = (s, ctx=document) => ctx.querySelector(s);
  const $$ = (s, ctx=document) => [...ctx.querySelectorAll(s)];

  // ===== Header: menu do avatar =====
  const avatarBtn   = $('#avatarBtn');
  const profileMenu = $('#profileMenu');

  if (avatarBtn && profileMenu) {
    avatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = profileMenu.classList.contains('open');
      profileMenu.classList.toggle('open', !isOpen);
      profileMenu.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
    });
    window.addEventListener('click', (ev) => {
      if (!profileMenu.contains(ev.target) && !avatarBtn.contains(ev.target)) {
        profileMenu.classList.remove('open');
        profileMenu.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // Esconder "Minha conta" nesta página
  const btnMinhaConta = $('#btnMinhaConta');
  if (btnMinhaConta) btnMinhaConta.style.display = 'none';

  // "Sair" -> login.html
  const btnSair = $('#btnSair');
  if (btnSair) {
    btnSair.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'login.html';
    });
  }

  // ===== Preview do avatar =====
  const avatarInput   = $('#avatar-upload');
  const avatarPreview = $('#avatar-preview');
  if (avatarInput && avatarPreview) {
    avatarInput.addEventListener('change', () => {
      const f = avatarInput.files && avatarInput.files[0];
      if (!f) return;
      const url = URL.createObjectURL(f);
      avatarPreview.src = url;
      avatarPreview.onload = () => URL.revokeObjectURL(url);
    });
  }

  // ===== Modal Alterar Senha =====
  const openPwdBtn = $('#openChangePwd');       // botão no "Segurança"
  const modal      = $('#modalSenha');          // container do modal
  const backdrop   = $('.modal__backdrop', modal);
  const dialog     = $('.modal__dialog', modal);
  const closeX     = $('[data-close]', modal);  // botão X no header
  const btnVoltar  = $('#btnCancelarSenha');    // botão "Voltar" no footer

  const formSenha   = $('#formSenha');
  const pwdAtual    = $('#pwdAtual');
  const pwdNova     = $('#pwdNova');
  const pwdConfirma = $('#pwdConfirma');
  const pwdBar      = $('#pwdBar');

  function lockScroll(lock) {
    document.documentElement.style.overflow = lock ? 'hidden' : '';
    document.body.style.overflow = lock ? 'hidden' : '';
  }

  function openModal() {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'false');
    lockScroll(true);
    setTimeout(() => pwdAtual && pwdAtual.focus(), 0);
    document.addEventListener('keydown', onEsc);
  }

  function closeModal() {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    lockScroll(false);
    document.removeEventListener('keydown', onEsc);
    resetPwdForm();
  }

  function onEsc(e) {
    if (e.key === 'Escape') closeModal();
  }

  // Fecha clicando no backdrop (fora do diálogo)
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      // só fecha se clicou exatamente no backdrop (não dentro do dialog)
      if (e.target === backdrop) closeModal();
    });
  }

  if (openPwdBtn) openPwdBtn.addEventListener('click', openModal);
  if (closeX)     closeX.addEventListener('click', closeModal);
  if (btnVoltar)  btnVoltar.addEventListener('click', closeModal);

  // ===== Força da senha =====
  function strengthScore(pwd) {
    if (!pwd) return 0;
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[a-z]/.test(pwd)) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/\d/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return Math.min(s, 5);
  }

  function paintMeter(score) {
    if (!pwdBar) return;
    const width  = [0, 20, 40, 60, 80, 100][score] + '%';
    const color  = ['#d9534f','#d9534f','#f0ad4e','#ffc107','#4caf50','#2e7d32'][score];
    pwdBar.style.width = width;
    pwdBar.style.background = color;
  }

  if (pwdNova) {
    pwdNova.addEventListener('input', () => {
      paintMeter(strengthScore(pwdNova.value));
    });
  }

  function validatePassword(newPwd, currentPwd, confirmPwd) {
    const errs = [];
    if (!newPwd || newPwd.length < 8)  errs.push('Mínimo de 8 caracteres.');
    if (!/[a-z]/.test(newPwd))         errs.push('Pelo menos 1 letra minúscula.');
    if (!/[A-Z]/.test(newPwd))         errs.push('Pelo menos 1 letra maiúscula.');
    if (!/\d/.test(newPwd))            errs.push('Pelo menos 1 número.');
    if (!/[^A-Za-z0-9]/.test(newPwd))  errs.push('Pelo menos 1 caractere especial.');
    if (currentPwd && newPwd === currentPwd) errs.push('A nova senha deve ser diferente da atual.');
    if (newPwd !== confirmPwd)         errs.push('A confirmação não confere.');
    return errs;
  }

  function resetPwdForm() {
    if (formSenha) formSenha.reset();
    paintMeter(0);
    // remove mensagens antigas se existirem
    const box = $('#pwdErrorsBox');
    if (box) box.remove();
  }

  function showErrors(errs) {
    // cria/atualiza um box simples dentro do form
    let box = $('#pwdErrorsBox');
    if (!box && formSenha) {
      box = document.createElement('div');
      box.id = 'pwdErrorsBox';
      box.style.marginTop = '10px';
      box.style.border = '1px solid #f5c2c7';
      box.style.background = '#fde2e4';
      box.style.color = '#842029';
      box.style.borderRadius = '8px';
      box.style.padding = '10px 12px';
      box.style.fontWeight = '600';
      formSenha.appendChild(box);
    }
    if (box) {
      box.innerHTML = `<ul style="padding-left:18px;margin:0;">${errs.map(e=>`<li>${e}</li>`).join('')}</ul>`;
    } else {
      alert(errs.join('\n')); // fallback
    }
  }

  // Submit do form de senha (botão "Alterar Senha" tem form="formSenha")
  if (formSenha) {
    formSenha.addEventListener('submit', (e) => {
      e.preventDefault();
      const current = (pwdAtual && pwdAtual.value)    || '';
      const novo    = (pwdNova && pwdNova.value)      || '';
      const conf    = (pwdConfirma && pwdConfirma.value) || '';

      const errs = validatePassword(novo, current, conf);
      if (errs.length) {
        showErrors(errs);
        return;
      }

      // Simula salvar
      const submitBtn = $('button[form="formSenha"][type="submit"]', modal);
      if (submitBtn) {
        submitBtn.disabled = true;
        const old = submitBtn.textContent;
        submitBtn.textContent = 'Salvando...';
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = old;
          alert('Senha alterada com sucesso!');
          closeModal();
        }, 800);
      } else {
        alert('Senha alterada com sucesso!');
        closeModal();
      }
    });
  }

  // Submit do formulário principal (Salvar alterações)
  const formConta = $('#form-conta');
  if (formConta) {
    formConta.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Perfil salvo com sucesso!');
    });
  }
});
