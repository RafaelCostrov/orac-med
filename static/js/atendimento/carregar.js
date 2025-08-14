let examesIncluidosCliente = [];

let atualizarValorTotal;
let container;
let valoresExames = {};
let nomesExame = {};
let inputValorTotal;

async function carregarExames() {
    const request = await fetch("/exames/listar-exames");
    const resposta = await request.json();
    const exames = resposta.exames;

    container = document.getElementById("exames");
    inputValorTotal = document.getElementById("valor-total");

    exames.forEach(exame => {
        valoresExames[exame.id_exame] = exame.valor_exame ?? 0;
        nomesExame[exame.id_exame] = exame.nome_exame ?? "";
    });

    atualizarValorTotal = function () {
        let soma = 0;
        const lista = document.getElementById("lista-exames");
        lista.innerHTML = "";

        const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
        checkboxes.forEach(cb => {
            const id = parseInt(cb.value);

            const exame = document.createElement("li");
            if (examesIncluidosCliente.includes(id)) {
                exame.textContent = `${id} - ${nomesExame[id]}`;
            } else {
                exame.textContent = `${id} - ${nomesExame[id]}`;
                soma += valoresExames[id] || 0;
            }
            lista.appendChild(exame);
        });

        let dropdownSelected = document.getElementById("dropdown-selected");
        dropdownSelected.textContent = lista.childElementCount > 0
            ? `${lista.childElementCount} exame(s) selecionado(s)`
            : "Selecione os exames";

        inputValorTotal.value = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        }).format(soma);
    };

    exames.forEach(exame => {
        const label = document.createElement("label");
        label.setAttribute("for", `exame-${exame.id_exame}`);

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = exame.id_exame;
        checkbox.id = `exame-${exame.id_exame}`;

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(`${exame.id_exame} - ${exame.nome_exame}`));
        container.appendChild(label);
        checkbox.addEventListener("change", atualizarValorTotal);
    });

    inputValorTotal.value = "R$ 0,00";
}

async function carregarEmpresas() {
    const response = await fetch("/clientes/listar-clientes");
    const dados = await response.json();
    const clientes = dados.clientes;

    const select = document.getElementById("empresa");
    const examesClienteUl = document.getElementById("exames-cliente");

    select.querySelectorAll("option:not([disabled])").forEach(opt => opt.remove());
    examesClienteUl.innerHTML = "";

    clientes.forEach(cliente => {
        const option = document.createElement("option");
        option.value = cliente.id_cliente;
        option.textContent = `${cliente.id_cliente} - ${cliente.nome_cliente}`;
        select.appendChild(option);
    });

    select.addEventListener("change", () => {
        const clienteSelecionado = clientes.find(c => c.id_cliente == select.value);
        if (clienteSelecionado) {
            mostrarExamesCliente(clienteSelecionado);
            examesIncluidosCliente = clienteSelecionado.exames_incluidos.map(e => e.id_exame);
        } else {
            examesClienteUl.innerHTML = "";
            examesIncluidosCliente = [];
        }
        if (typeof atualizarValorTotal === "function") {
            atualizarValorTotal();
        }
    });
}

function mostrarExamesCliente(cliente) {
    const examesClienteUl = document.getElementById("exames-cliente");
    examesClienteUl.innerHTML = "";

    cliente.exames_incluidos.forEach(exame => {
        const li = document.createElement("li");
        li.textContent = `${exame.id_exame} - ${exame.nome_exame}`;
        examesClienteUl.appendChild(li);
    });
}

carregarExames();
carregarEmpresas();