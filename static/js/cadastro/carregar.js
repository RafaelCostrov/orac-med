let paginaAtual = 1;
let porPaginaInput = document.getElementById("ipp")


const $ = (s, ctx = document) => ctx.querySelector(s);
let tipoLista = document.getElementById("tipoLista")
let tipoCadastro = document.getElementById("cadTipo")



let totalPaginas = 1;
let filtrosAtuais = {};
let orderByAtual = null;
let orderDirAtual = 'asc';

function closeModal(id) { const m = $('#' + id); if (!m) return; m.setAttribute('aria-hidden', 'true'); }



porPaginaInput.addEventListener("change", () => {
    carregarClientesLista({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) })
})

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

function verificarCliqueHead() {
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
            recarregarTipoLista({ filtros: filtrosAtuais, pagina: 1 });
        });
    });
}

async function carregarClientesLista({ pagina = 1, filtros = {}, porPagina = 20 } = {}) {
    const payload = {
        pagina: pagina,
        por_pagina: porPagina,
        ...filtros
    };



    const thead = document.querySelector("#tblCad thead");
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
            thead.innerHTML = "";
            const tbody = document.querySelector("#tblCad tbody");
            tbody.innerHTML = "";
            const trHead = document.createElement("tr");
            trHead.innerHTML = `
                <th data-sort="id_cliente" class="ordenavel">Id</th>
                <th data-sort="nome_cliente" class="ordenavel">Cliente</th>
                <th data-sort="cnpj_cliente" class="ordenavel">CNPJ</th>
                <th data-sort="tipo_cliente" class="ordenavel">Tipo Cliente</th>
                <th >Exames Inclusos</th>
                `
            thead.appendChild(trHead)
            const thOrdenado = thead.querySelector(`th[data-sort="${orderByAtual}"]`);
            if (thOrdenado) {
                thOrdenado.classList.add(orderDirAtual);
            }
            dados.clientes.forEach(cliente => {
                const trBody = document.createElement("tr");
                trBody.setAttribute("uk-toggle", "target: #cliente-modal")

                trBody.dataset.id = cliente.id_cliente;
                trBody.dataset.nome = cliente.nome_cliente;
                trBody.dataset.cnpj = formatarCNPJ(cliente.cnpj_cliente) || cliente.cnpj_cliente;
                trBody.dataset.tipo = tiposCliente[cliente.tipo_cliente] || cliente.tipo_cliente;
                trBody.dataset.exames = cliente.exames_incluidos?.map(e => e.nome_exame).join(", ") || "-";

                trBody.innerHTML = `
                    <td title="${cliente.id_cliente}">${cliente.id_cliente}</td>
                    <td title="${cliente.nome_cliente}">${cliente.nome_cliente}</td>
                    <td title="${trBody.dataset.cnpj}">${trBody.dataset.cnpj}</td>
                    <td title="${trBody.dataset.tipo}">${trBody.dataset.tipo}</td>
                    <td title="${trBody.dataset.exames}">${trBody.dataset.exames}</td>
                `;
                const modalIdCliente = document.getElementById("modal-id-cliente-tr")
                const modalNomeCliente = document.getElementById("modal-nome-cliente-tr");
                const modalCnpjCliente = document.getElementById("modal-cnpj-cliente-tr");
                const modalTipoCliente = document.getElementById("modal-tipo-cliente-tr");
                const modalExamesCliente = document.getElementById("modal-exames-cliente-tr");
                trBody.addEventListener("click", () => {
                    modalIdCliente.textContent = `${trBody.dataset.id} - ${trBody.dataset.nome}`
                    modalNomeCliente.value = trBody.dataset.nome;
                    modalCnpjCliente.value = trBody.dataset.cnpj;
                    modalTipoCliente.value = trBody.dataset.tipo;
                    modalExamesCliente.value = trBody.dataset.exames;
                });

                tbody.appendChild(trBody)
            });
            paginaAtual = pagina;
            filtros ? totalPaginas = Math.ceil(dados.total_filtrado / porPagina) : totalPaginas = Math.ceil(dados.total / porPagina)
            document.getElementById("pinfo").textContent = `Página ${paginaAtual} de ${totalPaginas}`;
        }
    } catch (e) {
        console.log(e)
    } finally {
        verificarCliqueHead()
    }
}

async function carregarUsuariosLista({ pagina = 1, filtros = {}, porPagina = 20 } = {}) {
    const payload = {
        pagina: pagina,
        por_pagina: porPagina,
        ...filtros
    };

    const thead = document.querySelector("#tblCad thead");
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
            const thOrdenado = thead.querySelector(`th[data-sort="${orderByAtual}"]`);
            if (thOrdenado) {
                thOrdenado.classList.add(orderDirAtual);
            }
            dados.usuarios.forEach(usuario => {
                const trBody = document.createElement("tr");
                trBody.setAttribute("uk-toggle", "target: #usuario-modal")

                trBody.dataset.id = usuario.id_usuario;
                trBody.dataset.nome = usuario.nome_usuario;
                trBody.dataset.email = usuario.email_usuario;
                trBody.dataset.tipo = tiposUsuario[usuario.role] || usuario.role;

                trBody.innerHTML = `
                    <td title="${usuario.id_usuario}">${usuario.id_usuario}</td>
                    <td title="${usuario.nome_usuario}">${usuario.nome_usuario}</td>
                    <td title="${usuario.email_usuario}">${usuario.email_usuario}</td>
                    <td title="${trBody.dataset.tipo}">${trBody.dataset.tipo}</td>
                `;
                const modalIdUsuario = document.getElementById("modal-id-usuario-tr");
                const modalNomeUsuario = document.getElementById("modal-nome-usuario-tr");
                const modalEmailUsuario = document.getElementById("modal-email-usuario-tr");
                const modalTipoUsuario = document.getElementById("modal-tipo-usuario-tr");
                trBody.addEventListener("click", () => {
                    modalIdUsuario.textContent = `${trBody.dataset.id} - ${trBody.dataset.nome}`;
                    modalNomeUsuario.value = trBody.dataset.nome;
                    modalEmailUsuario.value = trBody.dataset.email;
                    modalTipoUsuario.value = trBody.dataset.tipo;
                });
                tbody.appendChild(trBody)
            });
            paginaAtual = pagina;
            filtros ? totalPaginas = Math.ceil(dados.total_filtrado / porPagina) : totalPaginas = Math.ceil(dados.total / porPagina)
            document.getElementById("pinfo").textContent = `Página ${paginaAtual} de ${totalPaginas}`;
        }
    } catch (e) {
        console.log(e)
    } finally {
        verificarCliqueHead()
    } const thOrdenado = thead.querySelector(`th[data-sort="${orderByAtual}"]`);
    if (thOrdenado) {
        thOrdenado.classList.add(orderDirAtual);
    }
}

async function carregarExamesLista({ pagina = 1, filtros = {}, porPagina = 20 } = {}) {
    const payload = {
        pagina: pagina,
        por_pagina: porPagina,
        ...filtros
    };

    const thead = document.querySelector("#tblCad thead");
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
            const thOrdenado = thead.querySelector(`th[data-sort="${orderByAtual}"]`);
            if (thOrdenado) {
                thOrdenado.classList.add(orderDirAtual);
            }
            dados.exames.forEach(exame => {
                const trBody = document.createElement("tr");
                trBody.setAttribute("uk-toggle", "target: #exame-modal")

                trBody.dataset.id = exame.id_exame;
                trBody.dataset.nome = exame.nome_exame;
                trBody.dataset.valor = new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                }).format(exame.valor_exame ?? 0);
                trBody.dataset.is_interno = exame.is_interno == true ? "Sim" : "Não";

                trBody.innerHTML = `
                    <td title="${exame.id_exame}">${exame.id_exame}</td>
                    <td title="${exame.nome_exame}">${exame.nome_exame}</td>
                    <td title="${trBody.dataset.is_interno}">${trBody.dataset.is_interno}</td>
                    <td title="${trBody.dataset.valor}">${trBody.dataset.valor}</td>
                `;
                const modalIdExame = document.getElementById("modal-id-exame-tr");
                const modalNomeExame = document.getElementById("modal-nome-exame-tr");
                const modalIsInternoExame = document.getElementById("modal-is_interno-exame-tr");
                const modalValorExame = document.getElementById("modal-valor-exame-tr");
                trBody.addEventListener("click", () => {
                    modalIdExame.textContent = `${trBody.dataset.id} - ${trBody.dataset.nome}`;
                    modalNomeExame.value = trBody.dataset.nome;
                    modalIsInternoExame.value = trBody.dataset.is_interno;
                    modalValorExame.value = exame.valor_exame.toFixed(2);
                });
                tbody.appendChild(trBody)
            });
            paginaAtual = pagina;
            filtros ? totalPaginas = Math.ceil(dados.total_filtrado / porPagina) : totalPaginas = Math.ceil(dados.total / porPagina)
            document.getElementById("pinfo").textContent = `Página ${paginaAtual} de ${totalPaginas}`;
        }
    } catch (e) {
        console.log(e)
    } finally {
        verificarCliqueHead()
        const thOrdenado = thead.querySelector(`th[data-sort="${orderByAtual}"]`);
        if (thOrdenado) {
            thOrdenado.classList.add(orderDirAtual);
        }
    }
}

tipoLista.addEventListener("change", () => {
    switch (tipoLista.value) {
        case "clientes":
            filtrosAtuais = {}
            carregarClientesLista({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
            break;
        case "usuarios":
            filtrosAtuais = {}
            carregarUsuariosLista({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
            break;
        case "exames":
            filtrosAtuais = {}
            carregarExamesLista({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
            break;
    }
})

function recarregarTipoLista({ pagina = 1, filtros = filtrosAtuais, porPagina = parseInt(porPaginaInput.value) }) {
    payload = {
        pagina: pagina,
        filtros: filtros,
        porPagina: porPagina
    }

    switch (tipoLista.value) {
        case "clientes":
            carregarClientesLista(payload);
            break;
        case "usuarios":
            carregarUsuariosLista(payload);
            break;
        case "exames":
            carregarExamesLista(payload);
            break;
    }
}

document.getElementById("prev").addEventListener("click", () => {
    if (paginaAtual > 1) {
        switch (tipoLista.value) {
            case "clientes":
                carregarClientesLista({ pagina: paginaAtual - 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
                break;
            case "usuarios":
                carregarUsuariosLista({ pagina: paginaAtual - 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
                break;
            case "exames":
                carregarExamesLista({ pagina: paginaAtual - 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
                break;
        }
    }
});

document.getElementById("next").addEventListener("click", () => {
    if (paginaAtual < totalPaginas) {
        switch (tipoLista.value) {
            case "clientes":
                carregarClientesLista({ pagina: paginaAtual + 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
                break;
            case "usuarios":
                carregarUsuariosLista({ pagina: paginaAtual + 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
                break;
            case "exames":
                carregarExamesLista({ pagina: paginaAtual + 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
                break;
        }
    }
});

document.getElementById("filtrosLimparCad").addEventListener("click", () => {
    filtrosAtuais = {}
    switch (tipoLista.value) {
        case "clientes":
            carregarClientesLista({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
            break;
        case "usuarios":
            carregarUsuariosLista({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
            break;
        case "exames":
            carregarExamesLista({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
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
            carregarClientesLista({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
            break;
        case "usuarios":
            carregarUsuariosLista({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
            break;
        case "exames":
            carregarExamesLista({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
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
    }
})

async function cadastrarCliente() {
    let cnpj = document.getElementById("cnpj_cliente").value
    let c = validaCNPJ(cnpj)

    if (c !== false) {
        let nome = document.getElementById("nome_cliente").value
        let tipo_cliente = document.getElementById("tipo_cliente").value
        let ids_exames = [];
        // const checkboxes = document.getElementById("exames-select").querySelectorAll('input[type="checkbox"]:checked');
        // checkboxes.forEach(exame => {
        //     ids_exames.push(parseInt(exame.value));
        // });
        let exames_inclusos = document.getElementById("exames-select").value
        ids_exames.push(parseInt(exames_inclusos))

        if (!nome || !tipo_cliente || !c) {
            UIkit.notification({
                message: "Preencha os campos obrigatórios ❌",
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
                exames_incluidos: ids_exames
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
                recarregarTipoLista({})
                UIkit.notification({
                    message: "Cliente Cadastrado ✅",
                    status: 'success',
                    pos: 'top-center',
                    timeout: 3000
                });
                closeModal("modalCadastro")

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

async function cadastrarUsuario() {
    let nome = document.getElementById("nome_usuario").value
    let email = document.getElementById("email_usuario").value
    let senha = document.getElementById("senha").value
    let role = document.getElementById("role").value
    let foto = document.getElementById("foto").files[0];

    if (!nome || !email || !senha || !role) {
        UIkit.notification({
            message: "Preencha todos os campos! ❌",
            status: 'danger',
            pos: 'top-center',
            timeout: 5000
        })
        return
    }

    try {
        const formData = new FormData();
        formData.append("nome_usuario", nome);
        formData.append("email_usuario", email);
        formData.append("senha", senha);
        formData.append("role", role);
        if (foto) {
            formData.append("foto", foto);
        }

        let requisicao = await fetch("/usuarios/cadastrar-usuario", {
            method: "POST",
            body: formData
        })
        resposta = await requisicao.json()

        if (requisicao.ok) {
            filtrosAtuais = {}
            recarregarTipoLista({})
            UIkit.notification({
                message: "Cliente Cadastrado ✅",
                status: 'success',
                pos: 'top-center',
                timeout: 3000
            });
            closeModal("modalCadastro")
        }
        else {
            UIkit.notification({
                message: resposta.erro + " ❌",
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

async function cadastrarExame() {
    let nome = document.getElementById("nome_exame").value
    let is_interno = parseInt(document.getElementById("is_interno").value)
    let valor = document.getElementById("valor_exame").value

    if (!nome || !is_interno || !valor) {
        UIkit.notification({
            message: "Prencha todos os campos ❌",
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
            recarregarTipoLista({})
            UIkit.notification({
                message: "Cliente Cadastrado ✅",
                status: 'success',
                pos: 'top-center',
                timeout: 3000
            });
            closeModal("modalCadastro")
        }
        else {
            UIkit.notification({
                message: resposta.erro + " ❌",
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

document.getElementById("button-cadastro").addEventListener("click", async (event) => {
    event.preventDefault()
    switch (tipoCadastro.value) {
        case "clientes":
            cadastrarCliente();
            break;
        case "usuarios":
            cadastrarUsuario();
            break;
        case "exames":
            cadastrarExame();
            break;
    }
})




carregarClientesLista()