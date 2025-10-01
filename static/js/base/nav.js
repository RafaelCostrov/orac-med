async function logout(event) {
    event.preventDefault();
    try {
        const requisicao = await fetch("/usuarios/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (requisicao.ok) {
            window.location.href = "/";
        } else {
            console.error("Erro ao fazer logout");
        }
    } catch (error) {
        console.error("Erro:", error);
    }
}

const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

(function () {
    const btn = $('#avatarBtn'), menu = $('#profileMenu');
    if (!btn || !menu) return;
    const open = () => { menu.classList.add('open'); menu.setAttribute('aria-hidden', 'false'); btn.setAttribute('aria-expanded', 'true'); };
    const close = () => { menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true'); btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', e => { e.stopPropagation(); menu.classList.contains('open') ? close() : open(); });
    document.addEventListener('click', e => { if (!menu.contains(e.target) && e.target !== btn) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    const goConta = $('#btnMinhaConta'); if (goConta) goConta.addEventListener('click', e => { e.preventDefault(); location.href = 'conta'; });
})();

document.getElementById("logout-button").addEventListener("click", logout)