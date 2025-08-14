let paginaAtual = 1;
let porPaginaInput = document.getElementById('ipp')
porPaginaInput.addEventListener("change", () => {
    carregarAtendimentos({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) })
})
let totalPaginas = 1;
let filtrosAtuais = {};
let orderByAtual = null;
let orderDirAtual = 'asc';


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
            document.getElementById("count").textContent = dados.total_filtrado ?? 0;
            document.getElementById("expCount").textContent = dados.total_filtrado ?? 0;
            const valorTotalFormatado = new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL"
            }).format(dados.valor_total ?? 0);
            document.getElementById("total").textContent = valorTotalFormatado;
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
    return {
        data_min: document.getElementById("data_min").value || null,
        data_max: document.getElementById("data_max").value || null,
        empresa: document.getElementById("emp").value || null,
        usuario: document.getElementById("usuario").value || null,
        colaborador: document.getElementById("colaborador").value || null,
        tipoCliente: document.getElementById("tipoCl").value || null,
        tipoAtendimento: document.getElementById("tipoAt").value || null,
        exames: document.getElementById("exames-select").value || null,
        status: document.getElementById("status").value || null,
        valor_min: document.getElementById("valor_min").value || null,
        valor_max: document.getElementById("valor_max").value || null
    };
}

document.getElementById("filtrosLimpar").addEventListener("click", () => {
    filtrosAtuais = {}
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
        ids_clientes: filtrosBrutos.empresa
            ? filtrosBrutos.empresa.split(",").map(v => parseInt(v.trim())).filter(Number.isInteger)
            : [],
        ids_exames: filtrosBrutos.exames
            ? filtrosBrutos.exames.split(",").map(v => parseInt(v.trim())).filter(Number.isInteger)
            : []
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
    closeModal('modalFiltros');
})

carregarAtendimentos();

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
    console.log(filtrosAtuais)
    const payload = {
        filtrosAtuais
    };

    try {

        const resposta = await fetch("http://10.10.10.47:5000/atendimentos/exportar-atendimentos-xls", {
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
        const nome_excel = `atendimentos_${hora}-${minuto}-${segundo}.xlsx`;

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

        const resposta = await fetch("http://10.10.10.47:5000/atendimentos/exportar-atendimentos-txt", {
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