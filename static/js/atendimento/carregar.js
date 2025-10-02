let examesIncluidosCliente = [];

let atualizarValorTotal;
let container;
let valoresExames = {};
let nomesExame = {};
let inputValorTotal;


async function carregarEmpresasExames() {
    const request = await fetch("/exames/listar-exames");
    const resposta = await request.json();
    const exames = resposta.exames;

    const selectExames = document.getElementById("exames");
    const selectExamesCadastro = document.getElementById("exames-select");
    const inputValorTotal = document.getElementById("valor-total");

    const valoresExames = {};
    const nomesExames = {};
    exames.forEach(exame => {
        valoresExames[exame.id_exame] = exame.valor_exame ?? 0;
        nomesExames[exame.id_exame] = exame.nome_exame ?? "";
    });

    selectExames.innerHTML = "";
    exames.forEach(exame => {
        const option = document.createElement("option");
        option.value = exame.id_exame;
        option.textContent = `${exame.id_exame} - ${exame.nome_exame}`;
        const optionCadastro = document.createElement("option");
        optionCadastro.value = exame.id_exame;
        optionCadastro.textContent = `${exame.id_exame} - ${exame.nome_exame}`;
        selectExames.appendChild(option);
        selectExamesCadastro.appendChild(optionCadastro);
    });

    function atualizarValorTotal() {
        let soma = 0;
        const lista = document.getElementById("lista-exames");
        lista.innerHTML = "";
        const selecionados = Array.from(selectExames.selectedOptions);
        selecionados.forEach(opt => {
            const exame = document.createElement("li")
            const id = parseInt(opt.value);
            if (examesIncluidosCliente.includes(id)) {
                exame.textContent = `${id} - ${nomesExames[id]}`;
            } else {
                exame.textContent = `${id} - ${nomesExames[id]}`;
                soma += valoresExames[id] || 0;
            }
            lista.appendChild(exame);
        });

        inputValorTotal.value = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        }).format(soma);
    }

    selectExames.addEventListener("change", atualizarValorTotal);

    inputValorTotal.value = "R$ 0,00";

    if (typeof selectExames.loadOptions === "function") {
        selectExames.loadOptions();
    }

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

carregarEmpresasExames();
