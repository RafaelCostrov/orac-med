

let paginaAtual = 1;
let porPaginaInput = document.getElementById("ipp")
let loadingStart = null;

let tipoLista = document.getElementById("tipoLista")

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
let filtrosAtuais = {};
let orderByAtual = null;
let orderDirAtual = 'asc';



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
    mostrarLoading();
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
                let exames_lista = [];
                cliente.exames_incluidos?.forEach(e => exames_lista.push(e.id_exame))

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
                trBody.addEventListener("click", () => {
                    modalIdCliente.textContent = `${trBody.dataset.id} - ${trBody.dataset.nome}`
                    modalNomeCliente.value = trBody.dataset.nome;
                    modalCnpjCliente.value = trBody.dataset.cnpj;
                    modalTipoCliente.value = trBody.dataset.tipo;
                    carregarExamesSelectDetalhes(exames_lista);
                });
                tbody.appendChild(trBody)
            });
            paginaAtual = pagina;
            filtros ? totalPaginas = Math.ceil(dados.total_filtrado / porPagina) : totalPaginas = Math.ceil(dados.total / porPagina)
            document.getElementById("pinfo").textContent = `Página ${paginaAtual} de ${totalPaginas}`;
            document.getElementById("expCount").textContent = dados.total_filtrado ?? 0;
            document.getElementById("tipoListagem").textContent = "clientes";
        }
    } catch (e) {
        console.log(e)
    } finally {
        verificarCliqueHead();
        esconderLoading();
    }
}

async function carregarUsuariosLista({ pagina = 1, filtros = {}, porPagina = 20 } = {}) {
    mostrarLoading();
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
            document.getElementById("expCount").textContent = dados.total_filtrado ?? 0;
            document.getElementById("tipoListagem").textContent = "usuários";
        }
    } catch (e) {
        console.log(e)
    } finally {
        verificarCliqueHead();
        esconderLoading();
    } const thOrdenado = thead.querySelector(`th[data-sort="${orderByAtual}"]`);
    if (thOrdenado) {
        thOrdenado.classList.add(orderDirAtual);
    }
}

async function carregarExamesLista({ pagina = 1, filtros = {}, porPagina = 20 } = {}) {
    mostrarLoading();
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
            document.getElementById("expCount").textContent = dados.total_filtrado ?? 0;
            document.getElementById("tipoListagem").textContent = "exames";
        }
    } catch (e) {
        console.log(e)
    } finally {
        verificarCliqueHead();
        esconderLoading();
        const thOrdenado = thead.querySelector(`th[data-sort="${orderByAtual}"]`);
        if (thOrdenado) {
            thOrdenado.classList.add(orderDirAtual);
        }
    }
}

tipoLista.addEventListener("change", () => {
    switch (tipoLista.value) {
        case "clientes":
            switchFiltroFields("clientes");
            filtrosAtuais = {}
            carregarClientesLista({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
            break;
        case "usuarios":
            switchFiltroFields("usuarios");
            filtrosAtuais = {}
            carregarUsuariosLista({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
            break;
        case "exames":
            switchFiltroFields("exames");
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
            document.getElementById("nome_cliente_filtro").value = "";
            document.getElementById("cnpj_cliente_filtro").value = "";
            document.getElementById("tipo_cliente_filtro").value = "";
            document.getElementById("exames-cliente").value = "";
            carregarClientesLista({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
            break;
        case "usuarios":
            document.getElementById("nome_usuario_filtro").value = "";
            document.getElementById("email_usuario_filtro").value = "";
            document.getElementById("role_filtro").value = "";
            carregarUsuariosLista({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
            break;
        case "exames":
            document.getElementById("nome_exame_filtro").value = "";
            document.getElementById("is_interno_filtro").value = "";
            document.getElementById("min_valor_filtro").value = "";
            document.getElementById("max_valor_filtro").value = "";
            carregarExamesLista({ pagina: 1, filtros: filtrosAtuais, porPagina: parseInt(porPaginaInput.value) });
            break;
    }
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
})

document.getElementById("cnpj_cliente").addEventListener("input", function () {
    this.value = formatarCNPJ(this.value);
});

function getFiltros() {
    let resultado = {}
    switch (tipoLista.value) {
        case "clientes":
            var tipoClSelect = document.getElementById("tipo_cliente_filtro");
            var tipoClienteSelecionados = Array.from(tipoClSelect.selectedOptions).map(opt => opt.value);
            var examesSelect = document.getElementById("exames-cliente");
            var examesSelecionados = Array.from(examesSelect.selectedOptions).map(opt => parseInt(opt.value));
            resultado = {
                nome_cliente: document.getElementById("nome_cliente_filtro").value || null,
                cnpj_cliente: document.getElementById("cnpj_cliente_filtro").value || null,
                tipo_cliente: tipoClienteSelecionados.length > 0 ? tipoClienteSelecionados : null,
                exames_incluidos: examesSelecionados.length > 0 ? examesSelecionados : null,
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
        exames_incluidos: filtrosBrutos.exames_incluidos,
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


    UIkit.modal("#filtro-modal-cadastro").hide();
})

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
                    message: "Erro",
                    status: 'danger',
                    pos: 'top-center',
                    timeout: 5000
                })
            }
        }
        else {
            UIkit.notification({
                message: "CNPJ inválido",
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
                recarregarTipoLista({})
                UIkit.notification({
                    message: "Cliente Cadastrado!",
                    status: 'success',
                    pos: 'top-center',
                    timeout: 3000
                });
                UIkit.modal("#modal-cadastro").hide();
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
    try {
        mostrarLoading();
        let nome = document.getElementById("nome_usuario").value
        let email = document.getElementById("email_usuario").value
        let senha = document.getElementById("senha").value
        let role = document.getElementById("role").value
        let foto = document.getElementById("foto").files[0];

        if (!nome || !email || !senha || !role) {
            UIkit.notification({
                message: "Preencha todos os campos!",
                status: 'danger',
                pos: 'top-center',
                timeout: 5000
            })
            return
        }

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
                message: "Usuário Cadastrado!",
                status: 'success',
                pos: 'top-center',
                timeout: 3000
            });
            UIkit.modal("#modal-cadastro").hide();
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
    finally {
        esconderLoading();
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
            recarregarTipoLista({})
            UIkit.notification({
                message: "Exame Cadastrado!",
                status: 'success',
                pos: 'top-center',
                timeout: 3000
            });
            UIkit.modal("#modal-cadastro").hide();
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

document.getElementById("button-cadastro").addEventListener("click", async (event) => {
    event.preventDefault()
    switch (tipoLista.value) {
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

async function carregarExamesSelectDetalhes(examesInclusos = []) {
    const request = await fetch("/exames/listar-exames");
    const resposta = await request.json();
    const exames = resposta.exames;

    const examesUl = document.getElementById("modal-exames-cliente-tr");
    examesUl.innerHTML = "";

    exames.forEach(exame => {
        const option = document.createElement("option");
        option.value = exame.id_exame;
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

async function carregarExamesSelectCadastro() {
    const request = await fetch("/exames/listar-exames");
    const resposta = await request.json();
    const exames = resposta.exames;

    const examesUl = document.getElementById("exames-select");
    const examesUlFiltro = document.getElementById("exames-cliente");
    examesUl.innerHTML = "";



    exames.forEach(exame => {
        const option = document.createElement("option");
        option.value = exame.id_exame;
        option.textContent = `${exame.id_exame} - ${exame.nome_exame}`;
        const optionCadastro = document.createElement("option");
        optionCadastro.value = exame.id_exame;
        optionCadastro.textContent = `${exame.id_exame} - ${exame.nome_exame}`;
        examesUlFiltro.appendChild(option);
        examesUl.appendChild(optionCadastro);
    });

    if (typeof examesUl.loadOptions === "function") {
        examesUl.loadOptions();
    }
    if (typeof examesUlFiltro.loadOptions === "function") {
        examesUlFiltro.loadOptions();
    }

}

//Cliente Att
async function salvarAlteracaoCliente() {
    try {
        mostrarLoading();
        let id_cliente = parseInt(document.getElementById("modal-id-cliente-tr").textContent.split(" - ")[0]);
        let nome_cliente = document.getElementById("modal-nome-cliente-tr").value;
        let cnpj_cliente = document.getElementById("modal-cnpj-cliente-tr").value;
        let tipo_cliente = document.getElementById("modal-tipo-cliente-tr").value;
        let exames_cliente = document.getElementById("modal-exames-cliente-tr");

        let lista_exames = Array.from(exames_cliente.selectedOptions).map(option => parseInt(option.value)
        )


        if (!nome_cliente || !cnpj_cliente || !tipo_cliente) {
            UIkit.notification({
                message: "Preencha todos os campos obrigatórios!",
                status: 'danger',
                pos: 'top-center',
                timeout: 5000
            });
            return;
        }
        let c = validaCNPJ(cnpj_cliente);

        if (c == false) {
            UIkit.notification({
                message: "CNPJ inválido!",
                status: 'danger',
                pos: 'top-center',
                timeout: 5000
            });
            return;
        }

        const tipoMap = {
            "Cliente": "cliente",
            "Credenciado": "credenciado",
            "Serviço Prestado": "servico_prestado",
            "Particular": "particular"
        };
        let tipo_cliente_valido = tipoMap[tipo_cliente];

        let payload = {
            id_cliente: id_cliente,
            nome_cliente: nome_cliente,
            cnpj_cliente: c ? c : "",
            tipo_cliente: tipo_cliente_valido,
            exames_incluidos: lista_exames ? lista_exames : null
        }

        const requisicao = await fetch("/clientes/atualizar-cliente", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })

        const resposta = await requisicao.json();
        if (requisicao.ok) {
            filtrosAtuais = {};
            recarregarTipoLista({});
            UIkit.notification({
                message: resposta.mensagem || "Cliente atualizado!",
                status: 'success',
                pos: 'top-center',
                timeout: 3000
            });
            cancelarEdicaoCliente();
            UIkit.modal("#cliente-modal").hide();
        }
        else {
            UIkit.notification({
                message: resposta.erro || "Erro ao atualizar cliente!",
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

async function excluirCliente() {
    let id_cliente = parseInt(document.getElementById("modal-id-cliente-tr").textContent.split(" - ")[0]);
    let nome_cliente = document.getElementById("modal-id-cliente-tr").textContent.split(" - ")[1];
    let div = document.getElementsByClassName("exclusao-texto")[0];
    div.innerHTML = "";

    let texto = document.createElement("p");
    texto.textContent = `Você tem certeza que deseja excluir? Esta ação não pode ser desfeita.`;
    div.appendChild(texto);

    let cliente = document.createElement("p");
    cliente.innerHTML = `Cliente:<br> ID: ${id_cliente} - Nome: ${nome_cliente}`;
    div.appendChild(cliente);

    let buttonCancelar = document.getElementById("cancelar-exclusao");
    let buttonExcluir = document.getElementById("confirmar-exclusao");

    buttonCancelar.setAttribute("uk-toggle", "target: #cliente-modal")
    buttonExcluir.onclick = async () => {
        try {
            mostrarLoading();

            payload = {
                id_cliente: id_cliente
            }

            const requisicao = await fetch(`/clientes/remover-cliente`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),

            });

            const resposta = await requisicao.json();
            if (requisicao.ok) {
                filtrosAtuais = {}
                recarregarTipoLista({})
                UIkit.notification({
                    message: resposta.mensagem || "Cliente excluído!",
                    status: 'success',
                    pos: 'top-center',
                    timeout: 3000
                });
                UIkit.modal("#confirmacao-modal").hide();
            }
            else {
                UIkit.notification({
                    message: resposta.erro || "Erro ao excluir cliente!",
                    status: 'danger',
                    pos: 'top-center',
                    timeout: 5000
                })
            }
        } catch (e) {
            console.log(e)
        } finally {
            esconderLoading();
        }
    };
}

function cancelarEdicaoCliente() {
    let id_cliente = parseInt(document.getElementById("modal-id-cliente-tr").textContent.split(" - ")[0]);
    let tr = document.querySelector(`tr[data-id='${id_cliente}']`);

    let nome_cliente = document.getElementById("modal-nome-cliente-tr");
    let cnpj_cliente = document.getElementById("modal-cnpj-cliente-tr");
    let tipo_cliente = document.getElementById("modal-tipo-cliente-tr");
    let exames_cliente = document.querySelector("#cliente-multiselect-exames > .multiselect-dropdown");

    nome_cliente.value = tr.dataset.nome;
    cnpj_cliente.value = tr.dataset.cnpj;
    tipo_cliente.value = tr.dataset.tipo;
    exames_cliente.value = tr.dataset.exames;


    nome_cliente.disabled = true;
    cnpj_cliente.disabled = true;
    tipo_cliente.disabled = true;
    exames_cliente.classList.add("desabilitado");

    let buttonEditar = document.getElementById("button-editar-cliente");
    let buttonCancelar = document.getElementById("button-excluir-cliente");

    buttonEditar.removeEventListener("click", salvarAlteracaoCliente);
    buttonEditar.addEventListener("click", habilitarInputsCliente);
    buttonEditar.textContent = "Editar";

    buttonCancelar.setAttribute("uk-toggle", "target: #confirmacao-modal")
    buttonCancelar.removeEventListener("click", cancelarEdicaoCliente);
    buttonCancelar.addEventListener("click", excluirCliente)
    buttonCancelar.textContent = "Excluir";
}

function habilitarInputsCliente(event) {
    event.preventDefault();
    let buttonEditar = document.getElementById("button-editar-cliente");
    let buttonCancelar = document.getElementById("button-excluir-cliente");

    let nome_cliente = document.getElementById("modal-nome-cliente-tr");
    let cnpj_cliente = document.getElementById("modal-cnpj-cliente-tr");
    let tipo_cliente = document.getElementById("modal-tipo-cliente-tr");
    let exames_cliente = document.querySelector("#cliente-multiselect-exames > .multiselect-dropdown");

    nome_cliente.disabled = false;
    cnpj_cliente.disabled = false;
    tipo_cliente.disabled = false;
    exames_cliente.classList.remove("desabilitado");


    buttonEditar.removeEventListener("click", habilitarInputsCliente)
    buttonEditar.addEventListener("click", salvarAlteracaoCliente);
    buttonEditar.textContent = "Salvar";

    buttonCancelar.removeAttribute("uk-toggle");
    buttonCancelar.addEventListener("click", cancelarEdicaoCliente);
    buttonCancelar.textContent = "Cancelar";
}

//Exame Att
async function salvarAlteracaoExame() {
    try {
        mostrarLoading();
        let id_exame = parseInt(document.getElementById("modal-id-exame-tr").textContent.split(" - ")[0]);
        let nome_exame = document.getElementById("modal-nome-exame-tr").value;
        let is_interno_exame = document.getElementById("modal-is_interno-exame-tr").value;
        let valor = document.getElementById("modal-valor-exame-tr").value;


        if (!nome_exame || !is_interno_exame || !valor) {
            UIkit.notification({
                message: "Preencha todos os campos obrigatórios!",
                status: 'danger',
                pos: 'top-center',
                timeout: 5000
            });
            return;
        }

        const tipoMap = {
            "Sim": "1",
            "Não": "0",
        };
        let is_interno_valido = parseInt(tipoMap[is_interno_exame]);

        let payload = {
            id_exame: id_exame,
            nome_exame: nome_exame,
            valor_exame: parseFloat(valor),
            is_interno: is_interno_valido,
        }

        const requisicao = await fetch("/exames/atualizar-exame", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })

        const resposta = await requisicao.json();
        if (requisicao.ok) {
            filtrosAtuais = {};
            recarregarTipoLista({});
            UIkit.notification({
                message: resposta.mensagem || "Exame atualizado!",
                status: 'success',
                pos: 'top-center',
                timeout: 3000
            });
            cancelarEdicaoExame();
            UIkit.modal("#exame-modal").hide();
        }
        else {
            UIkit.notification({
                message: resposta.erro || "Erro ao atualizar exame",
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

async function excluirExame() {
    let id_exame = parseInt(document.getElementById("modal-id-exame-tr").textContent.split(" - ")[0]);
    let nome_exame = document.getElementById("modal-id-exame-tr").textContent.split(" - ")[1];
    let div = document.getElementsByClassName("exclusao-texto")[0];
    div.innerHTML = "";

    let texto = document.createElement("p");
    texto.textContent = `Você tem certeza que deseja excluir? Esta ação não pode ser desfeita.`;
    div.appendChild(texto);

    let exame = document.createElement("p");
    exame.innerHTML = `Exame:<br> ID: ${id_exame} - Nome: ${nome_exame}`;
    div.appendChild(exame);

    let buttonCancelar = document.getElementById("cancelar-exclusao");
    let buttonExcluir = document.getElementById("confirmar-exclusao");

    buttonCancelar.setAttribute("uk-toggle", "target: #exame-modal")
    buttonExcluir.onclick = async () => {
        try {
            mostrarLoading();

            payload = {
                id_exame: id_exame
            }

            const requisicao = await fetch(`/exames/remover-exame`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),

            });

            const resposta = await requisicao.json();
            if (requisicao.ok) {
                filtrosAtuais = {}
                recarregarTipoLista({})
                UIkit.notification({
                    message: resposta.mensagem || "Exame excluído",
                    status: 'success',
                    pos: 'top-center',
                    timeout: 3000
                });
                UIkit.modal("#confirmacao-modal").hide();
            }
            else {
                UIkit.notification({
                    message: resposta.erro || "Erro ao excluir exame",
                    status: 'danger',
                    pos: 'top-center',
                    timeout: 5000
                })
            }
        } catch (e) {
            console.log(e)
        } finally {
            esconderLoading();
        }
    };
}

function cancelarEdicaoExame() {
    let id_exame = parseInt(document.getElementById("modal-id-exame-tr").textContent.split(" - ")[0]);
    let tr = document.querySelector(`tr[data-id='${id_exame}']`);

    let nome_exame = document.getElementById("modal-nome-exame-tr");
    let is_interno_exame = document.getElementById("modal-is_interno-exame-tr");
    let valor_exame = document.getElementById("modal-valor-exame-tr");

    nome_exame.value = tr.dataset.nome;
    is_interno_exame.value = tr.dataset.is_interno;
    valor_exame.value = unformatBRL(tr.dataset.valor);


    nome_exame.disabled = true;
    is_interno_exame.disabled = true;
    valor_exame.disabled = true;

    let buttonEditar = document.getElementById("button-editar-exame");
    let buttonCancelar = document.getElementById("button-excluir-exame");

    buttonEditar.removeEventListener("click", salvarAlteracaoExame);
    buttonEditar.addEventListener("click", habilitarInputsExame);
    buttonEditar.textContent = "Editar";

    buttonCancelar.setAttribute("uk-toggle", "target: #confirmacao-modal")
    buttonCancelar.removeEventListener("click", cancelarEdicaoExame);
    buttonCancelar.addEventListener("click", excluirExame)
    buttonCancelar.textContent = "Excluir";
}

function habilitarInputsExame(event) {
    event.preventDefault();
    let buttonEditar = document.getElementById("button-editar-exame");
    let buttonCancelar = document.getElementById("button-excluir-exame");

    let nome_exame = document.getElementById("modal-nome-exame-tr");
    let is_interno_exame = document.getElementById("modal-is_interno-exame-tr");
    let valor_exame = document.getElementById("modal-valor-exame-tr");

    nome_exame.disabled = false;
    is_interno_exame.disabled = false;
    valor_exame.disabled = false;


    buttonEditar.addEventListener("click", salvarAlteracaoExame);
    buttonEditar.textContent = "Salvar";

    buttonCancelar.removeAttribute("uk-toggle");
    buttonCancelar.addEventListener("click", cancelarEdicaoExame);
    buttonCancelar.textContent = "Cancelar";
}

//Usuario Att
async function salvarAlteracaoUsuario() {
    try {
        mostrarLoading();
        let id_usuario = parseInt(document.getElementById("modal-id-usuario-tr").textContent.split(" - ")[0]);
        let nome_usuario = document.getElementById("modal-nome-usuario-tr").value;
        let email_usuario = document.getElementById("modal-email-usuario-tr").value;
        let tipo_usuario = document.getElementById("modal-tipo-usuario-tr").value;
        let foto = document.getElementById("modal-foto-usuario-tr").files[0];

        if (!nome_usuario || !email_usuario || !tipo_usuario) {
            UIkit.notification({
                message: "Preencha todos os campos obrigatórios!",
                status: 'danger',
                pos: 'top-center',
                timeout: 5000
            });
            return;
        }

        const tipoMap = {
            "usuario": "Usuario",
            "gestor": "Gestor",
            "administrador": "Administrador",
        };
        let tipo_usuario_valido = tipoMap[tipo_usuario.toLowerCase()];

        let formData = new FormData();
        formData.append("id_usuario", id_usuario);
        formData.append("nome_usuario", nome_usuario);
        formData.append("email_usuario", email_usuario);
        formData.append("role", tipo_usuario_valido);
        if (foto) {
            formData.append("foto", foto)
        }

        let requisicao = await fetch("/usuarios/atualizar-usuario", {
            method: "PUT",
            body: formData
        })

        let resposta = await requisicao.json();
        if (requisicao.ok) {
            filtrosAtuais = {};
            recarregarTipoLista({});
            UIkit.notification({
                message: resposta.mensagem || "Usuário atualizado!",
                status: 'success',
                pos: 'top-center',
                timeout: 3000
            });
            cancelarEdicaoUsuario();
            UIkit.modal("#usuario-modal").hide();
        }
        else {
            UIkit.notification({
                message: resposta.erro || "Erro ao atualizar usuario",
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

async function confirmarExclusaoUsuario(id_usuario) {
    try {
        mostrarLoading();

        payload = {
            id_usuario: id_usuario
        }

        const requisicao = await fetch(`/usuarios/remover-usuario`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),

        });

        const resposta = await requisicao.json();
        if (requisicao.ok) {
            filtrosAtuais = {}
            recarregarTipoLista({})
            UIkit.notification({
                message: resposta.mensagem || "Usuário excluído",
                status: 'success',
                pos: 'top-center',
                timeout: 3000
            });
            UIkit.modal("#confirmacao-modal").hide();
        }
        else {
            UIkit.notification({
                message: resposta.erro || "Erro ao excluir usuário",
                status: 'danger',
                pos: 'top-center',
                timeout: 5000
            })
        }
    } catch (e) {
        console.log(e)
    } finally {
        esconderLoading();
    }
}

async function excluirUsuario() {
    let id_usuario = parseInt(document.getElementById("modal-id-usuario-tr").textContent.split(" - ")[0]);
    let nome_usuario = document.getElementById("modal-id-usuario-tr").textContent.split(" - ")[1];
    let div = document.getElementsByClassName("exclusao-texto")[0];
    div.innerHTML = "";

    let texto = document.createElement("p");
    texto.textContent = `Você tem certeza que deseja excluir? Esta ação não pode ser desfeita.`;
    div.appendChild(texto);

    let usuario = document.createElement("p");
    usuario.innerHTML = `Usuário:<br> ID: ${id_usuario} - Nome: ${nome_usuario}`;
    div.appendChild(usuario);

    let buttonCancelar = document.getElementById("cancelar-exclusao");
    let buttonExcluir = document.getElementById("confirmar-exclusao");

    buttonCancelar.setAttribute("uk-toggle", "target: #usuario-modal");

    buttonExcluir.onclick = async () => {
        try {
            mostrarLoading();

            payload = {
                id_usuario: id_usuario
            }

            const requisicao = await fetch(`/usuarios/remover-usuario`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload),

            });
            const resposta = await requisicao.json();
            if (requisicao.ok) {
                filtrosAtuais = {}
                recarregarTipoLista({})
                UIkit.notification({
                    message: resposta.mensagem || "Usuário excluído",
                    status: 'success',
                    pos: 'top-center',
                    timeout: 3000
                });
                UIkit.modal("#confirmacao-modal").hide();
            }
            else {
                UIkit.notification({
                    message: resposta.erro || "Erro ao excluir usuário",
                    status: 'danger',
                    pos: 'top-center',
                    timeout: 5000
                })
            }
        } catch (e) {
            console.log(e)
        } finally {
            esconderLoading();
        }
    };
}

function cancelarEdicaoUsuario() {
    let id_usuario = parseInt(document.getElementById("modal-id-usuario-tr").textContent.split(" - ")[0]);
    let tr = document.querySelector(`tr[data-id='${id_usuario}']`);

    let nome_usuario = document.getElementById("modal-nome-usuario-tr");
    let email_usuario = document.getElementById("modal-email-usuario-tr");
    let tipo_usuario = document.getElementById("modal-tipo-usuario-tr");
    // let senha_usuario = document.getElementById("modal-senha-usuario-tr");
    let foto = document.getElementById("modal-foto-usuario-tr");

    nome_usuario.value = tr.dataset.nome;
    email_usuario.value = tr.dataset.email;
    tipo_usuario.value = tr.dataset.tipo;


    nome_usuario.disabled = true;
    email_usuario.disabled = true;
    tipo_usuario.disabled = true;
    // senha_usuario.disabled = true;
    foto.disabled = true;

    let buttonEditar = document.getElementById("button-editar-usuario");
    let buttonCancelar = document.getElementById("button-excluir-usuario");

    buttonEditar.removeEventListener("click", salvarAlteracaoUsuario);
    buttonEditar.addEventListener("click", habilitarInputsUsuario);
    buttonEditar.textContent = "Editar";

    buttonCancelar.setAttribute("uk-toggle", "target: #confirmacao-modal")
    buttonCancelar.removeEventListener("click", cancelarEdicaoUsuario);
    buttonCancelar.addEventListener("click", excluirUsuario)
    buttonCancelar.textContent = "Excluir";
}

function habilitarInputsUsuario(event) {
    event.preventDefault();
    let buttonEditar = document.getElementById("button-editar-usuario");
    let buttonCancelar = document.getElementById("button-excluir-usuario");

    let nome_usuario = document.getElementById("modal-nome-usuario-tr");
    let tipo_usuario = document.getElementById("modal-tipo-usuario-tr");
    let email_usuario = document.getElementById("modal-email-usuario-tr");
    let foto = document.getElementById("modal-foto-usuario-tr");
    nome_usuario.disabled = false;
    tipo_usuario.disabled = false;
    email_usuario.disabled = false;
    foto.disabled = false;



    buttonEditar.addEventListener("click", salvarAlteracaoUsuario);
    buttonEditar.textContent = "Salvar";

    buttonCancelar.removeAttribute("uk-toggle");
    buttonCancelar.addEventListener("click", cancelarEdicaoUsuario);
    buttonCancelar.textContent = "Cancelar";
}

function exportarTxtTipoLista({ filtros = filtrosAtuais }) {
    payload = {
        filtros: filtros
    }

    switch (tipoLista.value) {
        case "clientes":
            exportarTxtCliente(payload);
            break;
        case "usuarios":
            exportarTxtUsuario(payload);
            break;
        case "exames":
            exportarTxtExame(payload);
            break;
    }
}

function exportarXlsTipoLista({ filtros = filtrosAtuais }) {
    payload = {
        filtros: filtros
    }

    switch (tipoLista.value) {
        case "clientes":
            exportarXlsCliente(payload);
            break;
        case "usuarios":
            exportarXlsUsuario(payload);
            break;
        case "exames":
            exportarXlsExame(payload);
            break;
    }
}

async function exportarXlsCliente({ filtros = filtrosAtuais }) {
    const payload = {
        ...filtros
    };
    try {
        mostrarLoading();
        const resposta = await fetch("/clientes/exportar-clientes-xls", {
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
        const nome_excel = `Clientes_${hora}-${minuto}-${segundo}.xlsx`;

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
}

async function exportarTxtCliente({ filtros = {} }) {
    const payload = {
        ...filtros
    };

    try {
        mostrarLoading();
        const resposta = await fetch("/clientes/exportar-clientes-txt", {
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
        const nome_txt = `Clientes_${hora}-${minuto}-${segundo}.txt`;

        a.download = nome_txt;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

    } catch (e) {
        console.log(e)
    } finally {
        esconderLoading();
    }
}

async function exportarXlsExame({ filtros = filtrosAtuais }) {
    const payload = {
        ...filtros
    };

    try {
        mostrarLoading();
        const resposta = await fetch("/exames/exportar-exames-xls", {
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
        const nome_excel = `Exames_${hora}-${minuto}-${segundo}.xlsx`;

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
}

async function exportarTxtExame({ filtros = {} }) {
    const payload = {
        ...filtros
    };

    try {
        mostrarLoading();
        const resposta = await fetch("/exames/exportar-exames-txt", {
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
        const nome_txt = `Exames_${hora}-${minuto}-${segundo}.txt`;

        a.download = nome_txt;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

    } catch (e) {
        console.log(e)
    } finally {
        esconderLoading();
    }

}

async function exportarXlsUsuario({ filtros = filtrosAtuais }) {
    const payload = {
        ...filtros
    };


    try {
        mostrarLoading();
        const resposta = await fetch("/usuarios/exportar-usuarios-xls", {
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
        const nome_excel = `Usuarios_${hora}-${minuto}-${segundo}.xlsx`;

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
}

async function exportarTxtUsuario({ filtros = filtrosAtuais }) {
    const payload = {
        ...filtros
    };


    try {
        mostrarLoading();
        const resposta = await fetch("/usuarios/exportar-usuarios-txt", {
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
        const nome_txt = `Usuarios_${hora}-${minuto}-${segundo}.txt`;

        a.download = nome_txt;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

    } catch (e) {
        console.log(e)
    } finally {
        esconderLoading();
    }
}

function switchFiltroFields(tipoLista) {
    document.querySelectorAll('.input-label').forEach(el => {
        el.classList.toggle('hidden', el.getAttribute('data-for') !== tipoLista);
    });
}

document.getElementById("exportXls").addEventListener("click", () => exportarXlsTipoLista({ filtros: filtrosAtuais }))
document.getElementById("exportTxt").addEventListener("click", () => exportarTxtTipoLista({ filtros: filtrosAtuais }))
document.getElementById("button-editar-cliente").addEventListener("click", (params) => habilitarInputsCliente(params));
document.getElementById("button-excluir-cliente").addEventListener("click", (params) => excluirCliente(params));
document.getElementById("button-editar-exame").addEventListener("click", (params) => habilitarInputsExame(params));
document.getElementById("button-excluir-exame").addEventListener("click", (params) => excluirExame(params));
document.getElementById("button-editar-usuario").addEventListener("click", (params) => habilitarInputsUsuario(params));
document.getElementById("button-excluir-usuario").addEventListener("click", (params) => excluirUsuario(params));

UIkit.util.on('#cliente-modal', 'show', () => {
    document.querySelector("#cliente-multiselect-exames > .multiselect-dropdown")
        .classList.add("desabilitado");
});

switchFiltroFields("clientes");
carregarClientesLista();
carregarExamesSelectCadastro();