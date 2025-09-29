async function carregarClientesSelect() {
    const request = await fetch("/clientes/listar-clientes");
    const resposta = await request.json();
    const clientes = resposta.clientes;

    const clientesUl = document.getElementById("empresas");
    clientesUl.innerHTML = "";

    clientes.forEach(cliente => {
        const option = document.createElement("option");
        option.value = cliente.id_cliente;
        option.textContent = `${cliente.id_cliente} - ${cliente.nome_cliente}`;
        clientesUl.appendChild(option);
    });

    if (typeof clientesUl.loadOptions === "function") {
        clientesUl.loadOptions();
    }
}

carregarClientesSelect();