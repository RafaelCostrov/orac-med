let paginaAtual = 1;
let porPaginaInput = document.getElementById('ipp')
porPaginaInput.addEventListener("change", () => {
    carregarAtendimentos({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) })
})

function mostrarLoading() {
    document.getElementById("loading-overlay").style.display = "flex";
    loadingStart = Date.now();
}

function esconderLoading() {
    const overlay = document.getElementById("loading-overlay");
    const elapsed = Date.now() - loadingStart;
    const minTime = 100;

    if (elapsed >= minTime) {
        overlay.style.display = "none";
    } else {
        setTimeout(() => {
            overlay.style.display = "none";
        }, minTime - elapsed);
    }
}

let totalPaginas = 1;

let orderByAtual = null;
let orderDirAtual = 'asc';

let date = new Date();
let primeiroDia = new Date(date.getFullYear(), date.getMonth(), 1);
let primeiroDiaFormatted = primeiroDia.toISOString().split('T')[0];
let ultimoDia = new Date(date.getFullYear(), date.getMonth() + 1, 0);
let ultimoDiaFormatted = ultimoDia.toISOString().split('T')[0];
let filtrosAtuais = {
    min_data: primeiroDiaFormatted,
    max_data: ultimoDiaFormatted,
    is_ativo: 1,
};
document.getElementById("data_min").value = primeiroDiaFormatted;
document.getElementById("data_max").value = ultimoDiaFormatted;

const tiposAtendimento = {
    admissional: "Admissional",
    demissional: "Demissional",
    periodico: "Periódico",
    mudanca_funcao: "Mudança de Função",
    retorno_trabalho: "Retorno ao Trabalho",
    outros: "Outros"
}

const tiposCliente = {
    cliente: "Cliente",
    credenciado: "Credenciado",
    servico_prestado: "Serviço Prestado",
    particular: "Particular"
}

function unformatBRL(valorFormatado) {
    if (!valorFormatado) return 0;

    return parseFloat(
        valorFormatado
            .replace("R$", "")
            .replace(/\./g, "")
            .replace(",", ".")
            .trim()
    ).toFixed(2) || 0;
}

async function carregarExamesSelectAtendimento(examesInclusos = []) {
    const request = await fetch("/exames/listar-exames");
    const resposta = await request.json();
    const exames = resposta.exames;

    const examesUl = document.getElementById("modal-exames-atendimento-tr");
    examesUl.innerHTML = "";

    exames.forEach(exame => {
        const option = document.createElement("option");
        option.value = exame.valor_exame;
        option.textContent = `${exame.id_exame} - ${exame.nome_exame}`;
        if (examesInclusos.includes(exame.id_exame)) {
            option.selected = true;
        }
        examesUl.appendChild(option);
    });

    if (typeof examesUl.loadOptions === "function") {
        examesUl.loadOptions();
    }
}

async function carregarAtendimentos({ pagina = 1, filtros = {}, porPagina = 20 } = {}) {
    mostrarLoading();
    const payload = {
        pagina: pagina,
        por_pagina: porPagina,
        ...filtros
    };

    try {
        const resposta = await fetch("/atendimentos/filtrar-atendimentos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const dados = await resposta.json();
        console.log(dados)
        if (resposta.ok) {
            const tbody = document.querySelector("#tbl tbody");
            tbody.innerHTML = '';
            dados.atendimentos.forEach(atendimento => {
                const tr = document.createElement("tr");
                tr.setAttribute("uk-toggle", "target: #atendimento-modal");
                tr.dataset.id = atendimento.id_atendimento;
                tr.dataset.data = atendimento.data_atendimento;
                tr.dataset.cliente = atendimento.cliente_atendimento.id_cliente + " - " + atendimento.cliente_atendimento.nome_cliente;
                tr.dataset.usuario = atendimento.usuario || '-';
                tr.dataset.colaborador = atendimento.colaborador_atendimento;
                tr.dataset.is_ativo = atendimento.is_ativo == true ? "Ativa" : "Cancelada";
                tr.dataset.tipo_cliente = tiposCliente[atendimento.cliente_atendimento.tipo_cliente] || atendimento.cliente_atendimento.tipo_cliente;
                tr.dataset.tipo_atendimento = tiposAtendimento[atendimento.tipo_atendimento] || atendimento.tipo_atendimento;
                tr.dataset.exames = atendimento.exames_atendimento?.map(e => e.nome_exame).join(", ") || "-";
                tr.dataset.valor = new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                }).format(atendimento.valor ?? 0);
                let exames_lista = [];
                atendimento.exames_atendimento?.forEach(e => {
                    exames_lista.push(e.id_exame);
                })

                tr.innerHTML = `
                    <td title="${tr.dataset.id}">${tr.dataset.id}</td>
                    <td title="${tr.dataset.data}">${tr.dataset.data}</td>
                    <td title="${tr.dataset.cliente}">${tr.dataset.cliente}</td>
                    <td title="${tr.dataset.colaborador}">${tr.dataset.colaborador}</td>
                    <td title="${tr.dataset.tipo_cliente}">${tr.dataset.tipo_cliente}</td>
                    <td title="${tr.dataset.tipo_atendimento}">${tr.dataset.tipo_atendimento}</td>
                    <td title="${tr.dataset.exames}">${tr.dataset.exames}</td>
                    <td title="${tr.dataset.valor}" class="num">${tr.dataset.valor}</td>
                `;
                const modalIdAtendimento = document.getElementById("modal-id-atendimento-tr");
                const modalDataAtendimento = document.getElementById("modal-data-atendimento-tr");
                const modalEmpresaAtendimento = document.getElementById("modal-empresa-atendimento-tr");
                const modalUsuarioAtendimento = document.getElementById("modal-usuario-atendimento-tr");
                const modalColaboradorAtendimento = document.getElementById("modal-colaborador-atendimento-tr");
                const modalStatusAtendimento = document.getElementById("modal-status-tr");
                const modalTipoClienteAtendimento = document.getElementById("modal-tipo-cliente-tr");
                const modalTipoAtendimento = document.getElementById("modal-tipo-atendimento-tr");
                const modalValorAtendimento = document.getElementById("modal-valor-atendimento-tr");

                tbody.appendChild(tr)
                tr.addEventListener("click", () => {
                    carregarExamesSelectAtendimento(exames_lista);
                    modalIdAtendimento.textContent = `Atendimento #${tr.dataset.id}`;
                    modalDataAtendimento.value = tr.dataset.data;
                    modalEmpresaAtendimento.value = tr.dataset.cliente;
                    modalUsuarioAtendimento.value = tr.dataset.usuario;
                    modalColaboradorAtendimento.value = tr.dataset.colaborador;
                    modalStatusAtendimento.value = tr.dataset.is_ativo;
                    modalTipoClienteAtendimento.value = tr.dataset.tipo_cliente;
                    modalTipoAtendimento.value = tr.dataset.tipo_atendimento;
                    modalValorAtendimento.value = atendimento.valor.toFixed(2);
                });

                paginaAtual = pagina;
                filtros ? totalPaginas = Math.ceil(dados.total_filtrado / porPagina) : totalPaginas = Math.ceil(dados.total / porPagina)
                document.getElementById("pinfo").textContent = `Página ${paginaAtual} de ${totalPaginas}`;
                document.getElementById("expCount").textContent = dados.total_filtrado ?? 0;
                document.getElementById("valorTotal").textContent = dados.valor_total ? "(R$ " + dados.valor_total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ")" : 0;
            })
        }
    } catch (e) {
        console.log(e)
    } finally {
        esconderLoading();
    }
}

function habilitarInputsAtendimento(event) {
    event.preventDefault();
    let buttonEditar = document.getElementById("button-editar-atendimento");
    let buttonCancelar = document.getElementById("button-excluir-atendimento");

    let colaborador_atendimento = document.getElementById("modal-colaborador-atendimento-tr");
    let empresa_atendimento = document.getElementById("modal-empresa-atendimento-tr");
    let tipo_atendimento = document.getElementById("modal-tipo-atendimento-tr");
    let exames_atendimento = document.querySelector("#atendimento-multiselect-exames > .multiselect-dropdown");
    let status_atendimento = document.getElementById("modal-status-tr");
    let valor_manual = document.getElementById("modal-valor-manual-tr");

    valor_manual.disabled = false;
    colaborador_atendimento.disabled = false;
    tipo_atendimento.disabled = false;
    exames_atendimento.classList.remove("desabilitado");
    status_atendimento.disabled = false;
    // empresa_atendimento.disabled = false;

    buttonEditar.removeEventListener("click", habilitarInputsAtendimento)
    buttonEditar.addEventListener("click", salvarAlteracaoAtendimento);
    buttonEditar.textContent = "Salvar";

    buttonCancelar.removeAttribute("disabled")
    buttonCancelar.addEventListener("click", cancelarEdicaoAtendimento);
}

function cancelarEdicaoAtendimento() {
    let id_exame = parseInt(document.getElementById("modal-id-atendimento-tr").textContent.replace("Atendimento #", ""));
    let tr = document.querySelector(`tr[data-id='${id_exame}']`);

    let buttonEditar = document.getElementById("button-editar-atendimento");
    let buttonCancelar = document.getElementById("button-excluir-atendimento");

    let empresa_atendimento = document.getElementById("modal-empresa-atendimento-tr");
    let data_atendimento = document.getElementById("modal-data-atendimento-tr");
    let colaborador_atendimento = document.getElementById("modal-colaborador-atendimento-tr");
    let tipo_atendimento = document.getElementById("modal-tipo-atendimento-tr");
    let valor_atendimento = document.getElementById("modal-valor-atendimento-tr");
    let exames_atendimento = document.querySelector("#atendimento-multiselect-exames > .multiselect-dropdown");
    let status_atendimento = document.getElementById("modal-status-tr");
    let is_valor_manual = document.getElementById("modal-valor-manual-tr")


    data_atendimento.value = tr.dataset.data;
    colaborador_atendimento.value = tr.dataset.colaborador;
    tipo_atendimento.value = tr.dataset.tipo_atendimento;
    valor_atendimento.value = unformatBRL(tr.dataset.valor);
    status_atendimento.value = tr.dataset.is_ativo;
    // exames_atendimento.value = tr.dataset.exames; #TODO: Ajustar seleção de exames
    // empresa_atendimento.value = tr.dataset.cliente; #TODO: Ajustar edição de cliente

    data_atendimento.disabled = true;
    colaborador_atendimento.disabled = true;
    // tipo_cliente.disabled = true;
    tipo_atendimento.disabled = true;
    valor_atendimento.disabled = true;
    exames_atendimento.classList.add("desabilitado");
    status_atendimento.disabled = true;
    is_valor_manual.disabled = true;
    is_valor_manual.checked = false;

    buttonEditar.removeEventListener("click", salvarAlteracaoAtendimento)
    buttonEditar.addEventListener("click", habilitarInputsAtendimento);
    buttonEditar.textContent = "Editar";

    buttonCancelar.removeEventListener("click", cancelarEdicaoAtendimento);
    buttonCancelar.setAttribute("disabled", "");
}

async function salvarAlteracaoAtendimento() {
    try {
        mostrarLoading();
        let id_atendimento = parseInt(document.getElementById("modal-id-atendimento-tr").textContent.replace("Atendimento #", ""));
        let data_atendimento = document.getElementById("modal-data-atendimento-tr").value;
        let colaborador_atendimento = document.getElementById("modal-colaborador-atendimento-tr").value;
        // let id_cliente = parseInt(document.getElementById("modal-empresa-atendimento-tr").value.split(" - ")[0]);
        let exames_atendimento_select = document.getElementById("modal-exames-atendimento-tr");
        let tipo_atendimento = document.getElementById("modal-tipo-atendimento-tr").value;
        let valor_atendimento = document.getElementById("modal-valor-atendimento-tr").value;
        let status_atendimento = document.getElementById("modal-status-tr").value;
        let usuario = document.getElementById("modal-usuario-atendimento-tr").value;
        let is_valor_manual = document.getElementById("modal-valor-manual-tr").checked;

        if (!colaborador_atendimento) {
            UIkit.notification({
                message: "Preencha o campo Colaborador!",
                status: 'danger',
                pos: 'top-center',
                timeout: 5000
            });
            return;
        }

        if (valor_atendimento < 0) {
            UIkit.notification({
                message: "Valor deve ser maior ou igual a zero!",
                status: 'danger',
                pos: 'top-center',
                timeout: 5000
            });
            return;
        }

        let lista_exames = Array.from(exames_atendimento_select.selectedOptions).map(option => parseInt(option.textContent.split(" - ")[0]));

        const ativoMap = {
            "Ativa": "1",
            "Cancelada": "0",
        };
        let is_ativo = parseInt(ativoMap[status_atendimento]);

        let payload = {
            id_atendimento: id_atendimento,
            data_atendimento: data_atendimento,
            tipo_atendimento: tipo_atendimento,
            usuario: usuario,
            valor: is_valor_manual ? parseFloat(valor_atendimento).toFixed(2) : null,
            colaborador_atendimento: colaborador_atendimento,
            is_ativo: is_ativo,
            ids_exames: lista_exames,
            // id_cliente: id_cliente #TODO: Ajustar edição de cliente
        };

        const requisicao = await fetch("/atendimentos/atualizar-atendimento", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })

        const resposta = await requisicao.json();
        if (requisicao.ok) {
            carregarAtendimentos({ filtros: filtrosAtuais, pagina: 1, porPagina: parseInt(porPaginaInput.value) });
            UIkit.notification({
                message: resposta.mensagem || "Atendimento atualizado!",
                status: 'success',
                pos: 'top-center',
                timeout: 3000
            });
            cancelarEdicaoAtendimento();
            UIkit.modal("#atendimento-modal").hide();
        }
        else {
            UIkit.notification({
                message: resposta.erro || "Erro ao atualizar atendimento!",
                status: 'danger',
                pos: 'top-center',
                timeout: 5000
            });
            console.log(resposta.erro);
        }
    }
    catch (erro) {
        console.log(erro);
    }
    finally {
        esconderLoading();
    }
}

document.getElementById("prev").addEventListener("click", () => {
    if (paginaAtual > 1) {
        carregarAtendimentos({ filtros: filtrosAtuais, pagina: paginaAtual - 1, porPagina: parseInt(porPaginaInput.value) });
    }
});

document.getElementById("next").addEventListener("click", () => {
    if (paginaAtual < totalPaginas) {
        carregarAtendimentos({ filtros: filtrosAtuais, pagina: paginaAtual + 1, porPagina: parseInt(porPaginaInput.value) });
    }
});

function getFiltros() {
    var tipoClSelect = document.getElementById("tipoCl");
    var tipoClienteSelecionados = Array.from(tipoClSelect.selectedOptions).map(opt => opt.value);

    var empresasSelect = document.getElementById("empresas");
    var empresasSelecionadas = Array.from(empresasSelect.selectedOptions)
        .map(opt => parseInt(opt.value))
        .filter(Number.isInteger);;

    var tipoAtSelect = document.getElementById("tipoAt");
    var tipoAtendimentoSelecionados = Array.from(tipoAtSelect.selectedOptions).map(opt => opt.value);

    var examesSelect = document.getElementById("exames");
    const examesSelecionados = Array.from(examesSelect.selectedOptions)
        .map(opt => parseInt(opt.value))
        .filter(Number.isInteger);

    return {
        data_min: document.getElementById("data_min").value || null,
        data_max: document.getElementById("data_max").value || null,
        empresa: empresasSelecionadas.length > 0 ? empresasSelecionadas : null,
        usuario: document.getElementById("usuario").value || null,
        colaborador: document.getElementById("colaborador").value || null,
        tipoCliente: tipoClienteSelecionados.length > 0 ? tipoClienteSelecionados : null,
        tipoAtendimento: tipoAtendimentoSelecionados.length > 0 ? tipoAtendimentoSelecionados : null,
        exames: examesSelecionados.length > 0 ? examesSelecionados : null,
        status: document.getElementById("status").value || null,
        valor_min: document.getElementById("valor_min").value || null,
        valor_max: document.getElementById("valor_max").value || null
    };
}

document.getElementById("filtrosLimpar").addEventListener("click", () => {
    filtrosAtuais = {}
    document.getElementById("data_min").value = "";
    document.getElementById("data_max").value = "";
    document.getElementById("empresas").value = "";
    document.getElementById("usuario").value = "";
    document.getElementById("colaborador").value = "";
    document.getElementById("tipoCl").value = "";
    document.getElementById("tipoAt").value = "";
    document.getElementById("exames").value = "";
    document.getElementById("status").value = "";
    document.getElementById("valor_min").value = "";
    document.getElementById("valor_max").value = "";
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
    carregarAtendimentos({ pagina: paginaAtual, filtrosAtuais: {}, porPagina: parseInt(porPaginaInput.value) })
})

document.getElementById("filtrosAplicar").addEventListener("click", () => {
    const filtrosBrutos = getFiltros();

    filtrosAtuais = {
        id_atendimento: filtrosBrutos.id_atendimento,
        min_data: filtrosBrutos.data_min,
        max_data: filtrosBrutos.data_max,
        tipo_atendimento: filtrosBrutos.tipoAtendimento,
        usuario: filtrosBrutos.usuario,
        min_valor: filtrosBrutos.valor_min,
        max_valor: filtrosBrutos.valor_max,
        colaborador_atendimento: filtrosBrutos.colaborador,
        tipo_cliente: filtrosBrutos.tipoCliente,
        is_ativo: filtrosBrutos.status,
        ids_clientes: filtrosBrutos.empresa,
        ids_exames: filtrosBrutos.exames
    };

    Object.keys(filtrosAtuais).forEach(key => {
        if (!filtrosAtuais[key]) delete filtrosAtuais[key];
    });

    document.querySelectorAll("#modalFiltros input, #modalFiltros select").forEach(el => {
        if (el.tagName === "SELECT") {
            el.selectedIndex = 0;
        } else {
            el.value = "";
        }
    });
    carregarAtendimentos({ filtros: filtrosAtuais, pagina: 1, porPagina: parseInt(porPaginaInput.value) });
    UIkit.modal("#filtro-modal-atendimentos").hide();
})

document.querySelectorAll("th[data-sort]").forEach(th => {
    th.addEventListener("click", () => {
        const campo = th.getAttribute("data-sort");

        if (orderByAtual === campo) {
            orderDirAtual = orderDirAtual === 'asc' ? 'desc' : 'asc';
        } else {
            orderByAtual = campo;
            orderDirAtual = 'asc';
        }

        filtrosAtuais.order_by = orderByAtual;
        filtrosAtuais.order_dir = orderDirAtual;

        document.querySelectorAll("th[data-sort]").forEach(e => {
            e.classList.remove('asc', 'desc');
        });
        th.classList.add(orderDirAtual);

        carregarAtendimentos({ filtros: filtrosAtuais, pagina: 1 });
    });
});

document.getElementById("exportXls").addEventListener("click", async () => {
    mostrarLoading();
    const payload = {
        filtrosAtuais
    };
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

document.getElementById("exportTxt").addEventListener("click", async () => {
    mostrarLoading();
    const payload = {
        filtrosAtuais
    };

    try {

        const resposta = await fetch("/atendimentos/exportar-atendimentos-txt", {
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
        const nome_excel = `atendimentos_${hora}-${minuto}-${segundo}.txt`;

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

UIkit.util.on('#atendimento-modal', 'show', () => {
    document.querySelector("#atendimento-multiselect-exames > .multiselect-dropdown")
        .classList.add("desabilitado");
});


carregarAtendimentos({ filtros: filtrosAtuais, pagina: 1, porPagina: parseInt(porPaginaInput.value) });

document.getElementById("button-editar-atendimento").addEventListener("click", habilitarInputsAtendimento);
document.getElementById("modal-valor-manual-tr").addEventListener("change", () => {
    let valor_atendimento = document.getElementById("modal-valor-atendimento-tr");
    if (document.getElementById("modal-valor-manual-tr").checked) {
        valor_atendimento.removeAttribute("disabled");
    } else {
        valor_atendimento.setAttribute("disabled", "");
    }
})