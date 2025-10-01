// ../js/conta.js 
document.addEventListener('DOMContentLoaded', () => {
    // ===== Helpers =====
    const $ = (s, ctx = document) => ctx.querySelector(s);
    const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

    // ===== Modal Alterar Senha =====
    const openPwdBtn = $('#openChangePwd');
    const modal = $('#modalSenha');
    const backdrop = $('.modal__backdrop', modal);
    const closeX = $('[data-close]', modal);
    const btnVoltar = $('#btnCancelarSenha');

    const formSenha = $('#formSenha');
    const pwdAtual = $('#pwdAtual');
    const pwdNova = $('#pwdNova');
    const pwdConfirma = $('#pwdConfirma');
    const pwdBar = $('#pwdBar');
    const meterWrap = $('.pwd-meter');

    // estados visuais
    const requisitosList = $$('.requisitos li', modal);
    const pwdNovaField = pwdNova ? pwdNova.closest('.pwd-field') : null;
    const pwdConfirmaField = pwdConfirma ? pwdConfirma.closest('.pwd-field') : null;

    // paths dos ícones info
    const INFO_DEFAULT = '../static/img/icons/info.png';
    const INFO_GREEN = '../static/img/icons/info-green.png';

    function lockScroll(lock) {
        document.documentElement.style.overflow = lock ? 'hidden' : '';
        document.body.style.overflow = lock ? 'hidden' : '';
    }

    function onEsc(e) { if (e.key === 'Escape') closeModal(); }

    function openModal() {
        if (!modal) return;
        modal.setAttribute('aria-hidden', 'false');
        lockScroll(true);
        paintMeter(0);
        if (meterWrap) meterWrap.style.opacity = 0;
        updateRequirements();
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

    if (backdrop) {
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) closeModal();
        });
    }
    if (openPwdBtn) openPwdBtn.addEventListener('click', openModal);
    if (closeX) closeX.addEventListener('click', closeModal);
    if (btnVoltar) btnVoltar.addEventListener('click', closeModal);

    // ===== Toggle "olho" =====
    (function wireToggles() {
        const toggles = $$('.toggle-pass', modal);
        toggles.forEach(btn => {
            const targetSel = btn.getAttribute('data-target');
            const input = targetSel ? $(targetSel) : btn.previousElementSibling;
            if (!input) return;

            btn.addEventListener('click', () => {
                const pressed = btn.getAttribute('aria-pressed') === 'true';
                const nowPressed = !pressed;
                btn.setAttribute('aria-pressed', String(nowPressed));
                input.type = nowPressed ? 'text' : 'password';
                btn.setAttribute('aria-label', nowPressed ? 'Ocultar senha' : 'Mostrar senha');
            });
        });
    })();

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
        const width = [0, 20, 40, 60, 80, 100][score] + '%';
        const color = ['#d9534f', '#d9534f', '#f0ad4e', '#ffc107', '#4caf50', '#2e7d32'][score];
        pwdBar.style.width = width;
        pwdBar.style.background = color;
    }

    // ===== Requisitos em tempo real =====
    function updateRequirements() {
        const novoVal = (pwdNova && pwdNova.value) ? pwdNova.value : '';
        paintMeter(strengthScore(novoVal));
        if (meterWrap) meterWrap.style.opacity = novoVal ? 1 : 0;

        if (!requisitosList.length) return;

        const currentVal = (pwdAtual && pwdAtual.value) ? pwdAtual.value : '';
        const checks = [
            novoVal.length >= 8,
            /[a-z]/.test(novoVal),
            /[A-Z]/.test(novoVal),
            /\d/.test(novoVal),
            /[^A-Za-z0-9]/.test(novoVal),
            currentVal && novoVal && (novoVal !== currentVal)
        ];

        requisitosList.forEach((li, i) => {
            const ok = !!checks[i];
            const text = $('span', li) || li;
            const img = $('.info-ic', li); // <img class="info-ic" ...>

            li.classList.toggle('ok', ok);
            text.style.color = ok ? 'var(--green-700)' : 'var(--grey-700)';

            // troca o ícone para a versão verde/normal (PNG)
            if (img && img.tagName === 'IMG') {
                const desired = ok ? INFO_GREEN : INFO_DEFAULT;
                if (img.getAttribute('src') !== desired) img.setAttribute('src', desired);
            }
        });

        // cadeados verdes em NOVA e CONFIRME quando TODAS as regras ok
        const allOk = checks.every(Boolean);
        if (pwdNovaField) pwdNovaField.classList.toggle('ok-all', allOk);
        if (pwdConfirmaField) pwdConfirmaField.classList.toggle('ok-all', allOk);

        const box = $('#pwdErrorsBox');
        if (box) box.remove();
    }

    if (pwdNova) pwdNova.addEventListener('input', updateRequirements);
    if (pwdAtual) pwdAtual.addEventListener('input', updateRequirements);
    if (pwdConfirma) pwdConfirma.addEventListener('input', () => {
        const box = $('#pwdErrorsBox');
        if (box) box.remove();
    });

    // ===== Validação final =====
    function validatePassword(newPwd, currentPwd, confirmPwd) {
        const errs = [];
        if (!newPwd || newPwd.length < 8) errs.push('Mínimo de 8 caracteres.');
        if (!/[a-z]/.test(newPwd)) errs.push('Pelo menos 1 letra minúscula.');
        if (!/[A-Z]/.test(newPwd)) errs.push('Pelo menos 1 letra maiúscula.');
        if (!/\d/.test(newPwd)) errs.push('Pelo menos 1 número.');
        if (!/[^A-Za-z0-9]/.test(newPwd)) errs.push('Pelo menos 1 caractere especial.');
        if (currentPwd && newPwd === currentPwd) errs.push('A nova senha deve ser diferente da atual.');
        if (newPwd !== confirmPwd) errs.push('A confirmação não confere.');
        return errs;
    }

    function resetPwdForm() {
        if (formSenha) formSenha.reset();
        paintMeter(0);
        if (meterWrap) meterWrap.style.opacity = 0;

        const box = $('#pwdErrorsBox');
        if (box) box.remove();

        requisitosList.forEach(li => {
            li.classList.remove('ok');
            const span = $('span', li) || li;
            span.style.color = 'var(--grey-700)';
            const img = $('.info-ic', li);
            if (img && img.tagName === 'IMG') img.setAttribute('src', INFO_DEFAULT);
        });

        [pwdNovaField, pwdConfirmaField].forEach(f => f && f.classList.remove('ok-all'));

        $$('.toggle-pass[aria-pressed="true"]', modal).forEach(btn => {
            btn.setAttribute('aria-pressed', 'false');
        });
        [pwdAtual, pwdNova, pwdConfirma].forEach(inp => { if (inp) inp.type = 'password'; });
    }

    function showErrors(errs) {
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
            box.innerHTML = `<ul style="padding-left:18px;margin:0;">${errs.map(e => `<li>${e}</li>`).join('')}</ul>`;
            box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            alert(errs.join('\n'));
        }
    }

    // Submit do form de senha
    if (formSenha) {
        formSenha.addEventListener('submit', (e) => {
            e.preventDefault();
            const current = (pwdAtual && pwdAtual.value) || '';
            const novo = (pwdNova && pwdNova.value) || '';
            const conf = (pwdConfirma && pwdConfirma.value) || '';

            const errs = validatePassword(novo, current, conf);
            if (errs.length) {
                showErrors(errs);
                return;
            }

            const submitBtn = $('button[form="formSenha"][type="submit"]', modal);
            if (submitBtn) {
                setTimeout(() => {
                    closeModal();
                }, 800);
            } else {
                closeModal();
            }
        });
    }

    // Submit do formulário principal
    const formConta = $('#form-conta');
    if (formConta) {
        formConta.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Perfil salvo com sucesso!');
        });
    }
});
