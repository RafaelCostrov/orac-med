
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
                message: "Atendimento Cadastrado!",
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

function formatarCNPJ(cnpj) {
    if (!cnpj) return "";
    let digitos = String(cnpj).replace(/\D/g, '');
    return digitos.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

function validaCNPJ(cnpj) {
    var b = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    var c = String(cnpj).replace(/[^\d]/g, '')

    if (c.length !== 14)
        return false

    if (/0{14}/.test(c))
        return false

    for (var i = 0, n = 0; i < 12; n += c[i] * b[++i]);
    if (c[12] != (((n %= 11) < 2) ? 0 : 11 - n))
        return false

    for (var i = 0, n = 0; i <= 12; n += c[i] * b[i++]);
    if (c[13] != (((n %= 11) < 2) ? 0 : 11 - n))
        return false

    return c
}

document.getElementById("cnpj_cliente").addEventListener("input", function () {
    this.value = formatarCNPJ(this.value);
});

document.getElementById("pesquisar_cnpj").addEventListener("click", async (event) => {
    mostrarLoading();
    event.preventDefault()
    try {
        let cnpj = document.getElementById("cnpj_cliente").value

        let c = validaCNPJ(cnpj)

        if (c !== false) {
            payload = {
                cnpj: c
            }
            const requisicao = await fetch(`/clientes/buscar-cnpj`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })

            resposta = await requisicao.json()
            if (requisicao.ok) {
                nome = resposta.nome;
                let inputNome = document.getElementById("nome_cliente")
                inputNome.value = nome
            }
            else {
                UIkit.notification({
                    message: "Erro ❌",
                    status: 'danger',
                    pos: 'top-center',
                    timeout: 5000
                })
            }
        }
        else {
            UIkit.notification({
                message: "CNPJ inválido ❌",
                status: 'danger',
                pos: 'top-center',
                timeout: 5000
            })
        }
    }
    catch (e) {
        console.log(e)
    } finally {
        esconderLoading();
    }
})

async function cadastrarCliente() {
    let cnpj = document.getElementById("cnpj_cliente").value
    let c = validaCNPJ(cnpj)

    if (c !== false) {
        let nome = document.getElementById("nome_cliente").value
        let tipo_cliente = document.getElementById("tipo_cliente").value
        let ids_exames = [];
        const checkboxes = document.getElementById("exames-select").querySelectorAll('input[type="checkbox"]:checked');
        checkboxes.forEach(exame => {
            ids_exames.push(parseInt(exame.value));
        });

        var examesInclusos = document.getElementById("exames-select");
        var examesInclusosSelecionados = Array.from(examesInclusos.selectedOptions).map(opt => opt.value);

        if (!nome || !tipo_cliente || !c) {
            UIkit.notification({
                message: "Preencha os campos obrigatórios!",
                status: 'danger',
                pos: 'top-center',
                timeout: 5000
            })
            return
        }

        try {
            payload = {
                nome_cliente: nome,
                cnpj_cliente: c,
                tipo_cliente: tipo_cliente,
                exames_incluidos: examesInclusosSelecionados.length > 0 ? examesInclusosSelecionados : null,
            }

            let requisicao = await fetch("/clientes/cadastrar-cliente", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })
            resposta = await requisicao.json()

            if (requisicao.ok) {
                filtrosAtuais = {}
                carregarEmpresasExames();
                UIkit.notification({
                    message: "Cliente Cadastrado!",
                    status: 'success',
                    pos: 'top-center',
                    timeout: 3000
                });
                UIkit.modal("#modal-cadastro-cliente").hide();
            }
            else {
                UIkit.notification({
                    message: resposta.erro,
                    status: 'danger',
                    pos: 'top-center',
                    timeout: 5000
                })
            }
        }
        catch (e) {
            console.log(e)
            console.log(resposta.erro ?? "Erro")
        }
    }
}

async function cadastrarExame() {
    let nome = document.getElementById("nome_exame").value
    let is_interno = parseInt(document.getElementById("is_interno").value)
    let valor = document.getElementById("valor_exame").value

    if (!nome || !valor) {
        UIkit.notification({
            message: "Prencha todos os campos!",
            status: 'danger',
            pos: 'top-center',
            timeout: 5000
        })
        return
    }

    try {
        payload = {
            nome_exame: nome,
            is_interno: is_interno,
            valor_exame: valor
        }

        let requisicao = await fetch("/exames/cadastrar-exame", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
        resposta = await requisicao.json()

        if (requisicao.ok) {
            filtrosAtuais = {}
            carregarEmpresasExames();
            UIkit.notification({
                message: "Exame Cadastrado!",
                status: 'success',
                pos: 'top-center',
                timeout: 3000
            });
            UIkit.modal("#modal-cadastro-exame").hide();
        }
        else {
            UIkit.notification({
                message: resposta.erro,
                status: 'danger',
                pos: 'top-center',
                timeout: 5000
            })
        }
    }
    catch (e) {
        console.log(e)
        console.log(resposta.erro ?? "Erro")
    }
}


document.getElementById("exportXls").addEventListener("click", async () => {
    mostrarLoading();
    let date = new Date();
    let hoje = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    let hojeFormatted = hoje.toISOString().split('T')[0];
    console.log(hojeFormatted)
    const payload = {
        "filtrosAtuais": {
            min_data: hojeFormatted,
            max_data: hojeFormatted
        }
    };

    console.log(payload)

    try {

        const resposta = await fetch("/atendimentos/exportar-atendimentos-xls", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });


        const blob = await resposta.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;


        const agora = new Date();
        const pad = (num) => num.toString().padStart(2, '0');
        const hora = pad(agora.getHours());
        const minuto = pad(agora.getMinutes());
        const segundo = pad(agora.getSeconds());
        const nome_excel = `Atendimentos_${hora}-${minuto}-${segundo}.xlsx`;

        a.download = nome_excel;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

    } catch (e) {
        console.log(e)
    } finally {
        esconderLoading();
    }
})

document.getElementById("remover").addEventListener("click", limparInputs)
document.getElementById("enviar").addEventListener("click", cadastrarAtendimento)
document.getElementById("button-cadastro-cliente").addEventListener("click", async (event) => {
    event.preventDefault()
    cadastrarCliente();
})
document.getElementById("button-cancelar-cliente").addEventListener("click", (event) => {
    event.preventDefault()
    UIkit.modal("#modal-cadastro-cliente").hide();
})
document.getElementById("button-cadastro-exame").addEventListener("click", async (event) => {
    event.preventDefault()
    cadastrarExame();
})
document.getElementById("button-cancelar-exame").addEventListener("click", (event) => {
    event.preventDefault()
    UIkit.modal("#modal-cadastro-exame").hide();
})