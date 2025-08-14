let paginaAtual = 1;
let porPaginaInput = document.getElementById("ipp")

porPaginaInput.addEventListener("change", () => {
    carregarClientes({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) })
})

const $ = (s, ctx = document) => ctx.querySelector(s);
let tipoLista = document.getElementById("tipoLista")
let tipoCadastro = document.getElementById("cadTipo")

tipoLista.addEventListener("change", () => {
    switch (tipoLista.value) {
        case "clientes":
            filtrosAtuais = {}
            carregarClientes({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
            break;
        case "usuarios":
            filtrosAtuais = {}
            carregarUsuarios({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
            break;
        case "exames":
            filtrosAtuais = {}
            carregarExames({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
            break;
    }
})

let totalPaginas = 1;
let filtrosAtuais = {};
let orderByAtual = null;
let orderDirAtual = 'asc';

function closeModal(id) { const m = $('#' + id); if (!m) return; m.setAttribute('aria-hidden', 'true'); }


function formatarCNPJ(cnpj) {
    if (!cnpj) return "";
    let digitos = String(cnpj).replace(/\D/g, '');
    return digitos.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

function pontuarCNPJ(cnpj) {
    return cnpj
        .replace(/\D/g, "")
        .slice(0, 14)
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
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


const tiposCliente = {
    cliente: "Cliente",
    credenciado: "Credenciado",
    servico_prestado: "Serviço Prestado",
    particular: "Particular"
}

const tiposUsuario = {
    usuario: "Usuario",
    gestor: "Gestor",
    administrador: "Administrador"
}



async function carregarClientes({ pagina = 1, filtros = {}, porPagina = 20 } = {}) {
    const payload = {
        pagina: pagina,
        por_pagina: porPagina,
        ...filtros
    };



    try {
        const resposta = await fetch("/clientes/filtrar-clientes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            const thead = document.querySelector("#tblCad thead");
            thead.innerHTML = "";
            const tbody = document.querySelector("#tblCad tbody");
            tbody.innerHTML = "";
            const trHead = document.createElement("tr");
            trHead.innerHTML = `
                <th data-sort="id_cliente" class="ordenavel">Id</th>
                <th data-sort="nome_cliente" class="ordenavel">Cliente</th>
                <th data-sort="cnpj_cliente" class="ordenavel">CNPJ</th>
                <th data-sort="tipo_cliente" class="ordenavel">Tipo Cliente</th>
                <th data-sort="exames_incluidos">Exames Inclusos</th>
                `
            thead.appendChild(trHead)
            dados.clientes.forEach(cliente => {
                const trBody = document.createElement("tr");
                const cnpjFormatado = formatarCNPJ(cliente.cnpj_cliente) || cliente.cnpj_cliente
                const tipoClienteFormatado = tiposCliente[cliente.tipo_cliente] || cliente.tipo_cliente;
                const nomesExames = cliente.exames_incluidos?.map(e => e.nome_exame).join(", ") || "-";
                trBody.innerHTML = `
                    <td title="${cliente.id_cliente}">${cliente.id_cliente}</td>
                    <td title="${cliente.nome_cliente}">${cliente.nome_cliente}</td>
                    <td title="${cnpjFormatado}">${cnpjFormatado}</td>
                    <td title="${tipoClienteFormatado}">${tipoClienteFormatado}</td>
                    <td title="${nomesExames}">${nomesExames}</td>
                `;
                tbody.appendChild(trBody)
            });
            paginaAtual = pagina;
            filtros ? totalPaginas = Math.ceil(dados.total_filtrado / porPagina) : totalPaginas = Math.ceil(dados.total / porPagina)
            document.getElementById("pinfo").textContent = `Página ${paginaAtual} de ${totalPaginas}`;
        }
    } catch (e) {
        console.log(e)
    }
}

async function carregarUsuarios({ pagina = 1, filtros = {}, porPagina = 20 } = {}) {
    const payload = {
        pagina: pagina,
        por_pagina: porPagina,
        ...filtros
    };

    try {
        const resposta = await fetch("/usuarios/filtrar-usuarios", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            const thead = document.querySelector("#tblCad thead");
            thead.innerHTML = "";
            const tbody = document.querySelector("#tblCad tbody");
            tbody.innerHTML = "";
            const trHead = document.createElement("tr");
            trHead.innerHTML = `
                <th data-sort="id_usuario" class="ordenavel">Id</th>
                <th data-sort="nome_usuario" class="ordenavel">Usuario</th>
                <th data-sort="email_usuario" class="ordenavel">E-mail</th>
                <th data-sort="role" class="ordenavel">Nível</th>
                `
            thead.appendChild(trHead)
            dados.usuarios.forEach(usuario => {
                const trBody = document.createElement("tr");
                const tipoUsuarioFormatado = tiposUsuario[usuario.role] || usuario.role;
                trBody.innerHTML = `
                    <td title="${usuario.id_usuario}">${usuario.id_usuario}</td>
                    <td title="${usuario.nome_usuario}">${usuario.nome_usuario}</td>
                    <td title="${usuario.email_usuario}">${usuario.email_usuario}</td>
                    <td title="${tipoUsuarioFormatado}">${tipoUsuarioFormatado}</td>
                `;
                tbody.appendChild(trBody)
            });
            paginaAtual = pagina;
            filtros ? totalPaginas = Math.ceil(dados.total_filtrado / porPagina) : totalPaginas = Math.ceil(dados.total / porPagina)
            document.getElementById("pinfo").textContent = `Página ${paginaAtual} de ${totalPaginas}`;
        }
    } catch (e) {
        console.log(e)
    }
}

async function carregarExames({ pagina = 1, filtros = {}, porPagina = 20 } = {}) {
    const payload = {
        pagina: pagina,
        por_pagina: porPagina,
        ...filtros
    };

    try {
        const resposta = await fetch("/exames/filtrar-exames", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            const thead = document.querySelector("#tblCad thead");
            thead.innerHTML = "";
            const tbody = document.querySelector("#tblCad tbody");
            tbody.innerHTML = "";
            const trHead = document.createElement("tr");
            trHead.innerHTML = `
                <th data-sort="id_exame" class="ordenavel">Id</th>
                <th data-sort="nome_exame" class="ordenavel">Exame</th>
                <th data-sort="is_interno" class="ordenavel">Interno</th>
                <th data-sort="valor_exame" class="ordenavel">Valor</th>
                `
            thead.appendChild(trHead)
            dados.exames.forEach(exame => {
                const trBody = document.createElement("tr");
                const valorFormatado = new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                }).format(exame.valor_exame ?? 0);
                const interno = exame.is_interno == true ? "Sim" : "Não"
                trBody.innerHTML = `
                    <td title="${exame.id_exame}">${exame.id_exame}</td>
                    <td title="${exame.nome_exame}">${exame.nome_exame}</td>
                    <td title="${interno}">${interno}</td>
                    <td title="${valorFormatado}">${valorFormatado}</td>
                `;
                tbody.appendChild(trBody)
            });
            paginaAtual = pagina;
            filtros ? totalPaginas = Math.ceil(dados.total_filtrado / porPagina) : totalPaginas = Math.ceil(dados.total / porPagina)
            document.getElementById("pinfo").textContent = `Página ${paginaAtual} de ${totalPaginas}`;
        }
    } catch (e) {
        console.log(e)
    }
}

document.getElementById("prev").addEventListener("click", () => {
    if (paginaAtual > 1) {
        switch (tipoLista.value) {
            case "clientes":
                carregarClientes({ pagina: paginaAtual - 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
                break;
            case "usuarios":
                carregarUsuarios({ pagina: paginaAtual - 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
                break;
            case "exames":
                carregarExames({ pagina: paginaAtual - 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
                break;
        }
    }
});

document.getElementById("next").addEventListener("click", () => {
    if (paginaAtual < totalPaginas) {
        switch (tipoLista.value) {
            case "clientes":
                carregarClientes({ pagina: paginaAtual + 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
                break;
            case "usuarios":
                carregarUsuarios({ pagina: paginaAtual + 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
                break;
            case "exames":
                carregarExames({ pagina: paginaAtual + 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
                break;
        }
    }
});

document.getElementById("filtrosLimparCad").addEventListener("click", () => {
    filtrosAtuais = {}
    switch (tipoLista.value) {
        case "clientes":
            carregarClientes({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
            break;
        case "usuarios":
            carregarUsuarios({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
            break;
        case "exames":
            carregarExames({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
            break;
    }
})

document.getElementById("cnpj_cliente").addEventListener("input", function () {
    this.value = formatarCNPJ(this.value);
});

function getFiltros() {
    let resultado = {}
    switch (tipoLista.value) {
        case "clientes":
            resultado = {
                nome_cliente: document.getElementById("nome_cliente_filtro").value || null,
                cnpj_cliente: document.getElementById("cnpj_cliente_filtro").value || null,
                tipo_cliente: document.getElementById("tipo_cliente_filtro").value || null,
            }
            break;
        case "usuarios":

            console.log(document.getElementById("nome_usuario_filtro").value)
            resultado = {
                nome_usuario: document.getElementById("nome_usuario_filtro").value || null,
                email_usuario: document.getElementById("email_usuario_filtro").value || null,
                role: document.getElementById("role_filtro").value || null,
            }
            break;
        case "exames":
            resultado = {
                nome_exame: document.getElementById("nome_exame_filtro").value || null,
                is_interno: document.getElementById("is_interno_filtro").value || null,
                min_valor: document.getElementById("min_valor_filtro").value || null,
                max_valor: document.getElementById("max_valor_filtro").value || null
            }
            break;
    }
    return resultado
}

document.getElementById("filtrosAplicarCad").addEventListener("click", () => {
    const filtrosBrutos = getFiltros();

    filtrosAtuais = {
        nome_cliente: filtrosBrutos.nome_cliente,
        cnpj_cliente: filtrosBrutos.cnpj_cliente,
        tipo_cliente: filtrosBrutos.tipo_cliente,
        nome_usuario: filtrosBrutos.nome_usuario,
        email_usuario: filtrosBrutos.email_usuario,
        role: filtrosBrutos.role,
        nome_exame: filtrosBrutos.nome_exame,
        is_interno: filtrosBrutos.is_interno,
        min_valor: filtrosBrutos.min_valor,
        max_valor: filtrosBrutos.max_valor
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

    switch (tipoLista.value) {
        case "clientes":
            carregarClientes({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
            break;
        case "usuarios":
            carregarUsuarios({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
            break;
        case "exames":
            carregarExames({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
            break;
    }

    closeModal("modalFiltrosCad")
})

document.getElementById("pesquisar_cnpj").addEventListener("click", async (event) => {
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
                inputNome = document.getElementById("nome_cliente")
                inputNome.value = nome
            }
            else {
                alert("Erro")
            }
        }
        else {
            alert("CNPJ inválido!")
        }
    }
    catch (e) {
        console.log(e)
    }
})


async function cadastrarCliente(event) {
    event.preventDefault();
}

carregarClientes()