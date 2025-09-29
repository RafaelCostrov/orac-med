let paginaAtual = 1;
let porPaginaInput = document.getElementById('ipp')
porPaginaInput.addEventListener("change", () => {
    carregarAtendimentos({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) })
})

let totalPaginas = 1;
let filtrosAtuais = {};
let orderByAtual = null;
let orderDirAtual = 'asc';

let date = new Date();
let primeiroDia = new Date(date.getFullYear(), date.getMonth(), 1);
let primeiroDiaFormatted = primeiroDia.toISOString().split('T')[0];
let ultimoDia = new Date(date.getFullYear(), date.getMonth() + 1, 0);
let ultimoDiaFormatted = ultimoDia.toISOString().split('T')[0];
let filtroInicial = {
    min_data: primeiroDiaFormatted,
    max_data: ultimoDiaFormatted,
}
document.getElementById("data_min").value = primeiroDiaFormatted;
document.getElementById("data_max").value = ultimoDiaFormatted;

const $ = (s, ctx = document) => ctx.querySelector(s);
function closeModal(id) {
    const m = $('#' + id); if (!m) return;
    m.setAttribute('aria-hidden', 'true');
}

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

async function carregarAtendimentos({ pagina = 1, filtros = {}, porPagina = 20 } = {}) {
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

        console.log(payload)
        if (resposta.ok) {
            const tbody = document.querySelector("#tbl tbody");
            tbody.innerHTML = '';
            dados.atendimentos.forEach(atendimento => {
                const tr = document.createElement("tr");
                const valorFormatado = new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                }).format(atendimento.valor ?? 0);
                const tipoAtendimentoFormatado = tiposAtendimento[atendimento.tipo_atendimento] || atendimento.tipo_atendimento;
                const tipoClienteFormatado = tiposCliente[atendimento.cliente_atendimento.tipo_cliente] || atendimento.cliente_atendimento.tipo_cliente;
                const nomesExames = atendimento.exames_atendimento?.map(e => e.nome_exame).join(", ") || "-";
                tr.innerHTML = `
                    <td title="${atendimento.data_atendimento}">${atendimento.data_atendimento}</td>
                    <td title="${atendimento.cliente_atendimento.nome_cliente}">${atendimento.cliente_atendimento.nome_cliente}</td>
                    <td title="${atendimento.colaborador_atendimento}">${atendimento.colaborador_atendimento}</td>
                    <td title="${tipoClienteFormatado}">${tipoClienteFormatado}</td>
                    <td title="${tipoAtendimentoFormatado}">${tipoAtendimentoFormatado}</td>
                    <td title="${nomesExames}">${nomesExames}</td>
                    <td title="${valorFormatado}" class="num">${valorFormatado}</td>
                `;
                tbody.appendChild(tr)
            });

            paginaAtual = pagina;
            filtros ? totalPaginas = Math.ceil(dados.total_filtrado / porPagina) : totalPaginas = Math.ceil(dados.total / porPagina)
            document.getElementById("pinfo").textContent = `Página ${paginaAtual} de ${totalPaginas}`;
            document.getElementById("expCount").textContent = dados.total_filtrado ?? 0;
        }
    } catch (e) {
        console.log(e)
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
    UIkit.modal("#filtro-modal").hide();
})

carregarAtendimentos({ filtros: filtroInicial, pagina: 1, porPagina: parseInt(porPaginaInput.value) });

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
    }
})

document.getElementById("exportTxt").addEventListener("click", async () => {

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
    }
})