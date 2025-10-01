
function mostrarLoading() {
    document.getElementById("loading-overlay").style.display = "flex";
}

function esconderLoading() {
    document.getElementById("loading-overlay").style.display = "none";
}

function limparInputs(event) {
    if (event) event.preventDefault();
    document.getElementById("colaborador").value = "";
    document.getElementById("lista-exames").innerHTML = "";
    document.getElementById("exames-cliente").innerHTML = "";
    document.getElementById("valor-total").value = "";
    document.getElementById("exames").value = "";
    document.getElementById("tipo-exame").value = "";
    document.getElementById("empresa").value = "";

    document.querySelectorAll('select[multiple]').forEach(sel => {
        const widget = sel.nextElementSibling;
        if (!widget) return;
        widget.querySelectorAll('.multiselect-dropdown-list > div:not(.multiselect-dropdown-all-selector)')
            .forEach(op => {
                op.classList.remove('checked');
                const cb = op.querySelector('input[type="checkbox"]');
                if (cb) {
                    cb.checked = false;
                    cb.removeAttribute('checked');
                }
                if (op.optEl) {
                    op.optEl.selected = false;
                    op.optEl.removeAttribute && op.optEl.removeAttribute('selected');
                }
            });

        const allCb = widget.querySelector('.multiselect-dropdown-all-selector input[type="checkbox"]');
        if (allCb) {
            allCb.checked = false;
            allCb.removeAttribute('checked');
        }
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        if (typeof widget.refresh === 'function') widget.refresh();
    });
}

async function cadastrarAtendimento(event) {
    mostrarLoading()
    event.preventDefault();
    const select = document.getElementById("empresa");
    let id_cliente = select.value;
    var examesSelect = document.getElementById("exames");
    var examesSelecionados = Array.from(examesSelect.selectedOptions).map(opt => parseInt(opt.value));
    let colaborador_atendimento = document.getElementById("colaborador").value
    let usuario = document.getElementById("nome-usuario").value
    let tipo_atendimento = document.getElementById("tipo-exame").value

    if (examesSelecionados.length < 0 || !colaborador_atendimento || !tipo_atendimento || !id_cliente) {
        UIkit.notification({
            message: "Preencha todos os campos!",
            status: 'danger',
            pos: 'top-center',
            timeout: 5000
        })
        return
    }

    const payload = {
        tipo_atendimento: tipo_atendimento,
        usuario: usuario,
        colaborador_atendimento: colaborador_atendimento,
        id_cliente: id_cliente,
        ids_exames: examesSelecionados.length > 0 ? examesSelecionados : null,
    };

    try {
        const requisicao = await fetch("/atendimentos/cadastrar-atendimento", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        if (requisicao.ok) {
            UIkit.notification({
                message: "Atendimento Cadastrado",
                status: 'success',
                pos: 'top-center',
                timeout: 3000
            });
            limparInputs()
        }
    } catch (e) {
        console.log(e)
        UIkit.notification({
            message: "Algo deu errado!",
            status: 'danger',
            pos: 'top-center',
            timeout: 5000
        })
    } finally {
        esconderLoading()
    }
}

document.getElementById("remover").addEventListener("click", limparInputs)
document.getElementById("enviar").addEventListener("click", cadastrarAtendimento)