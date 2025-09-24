async function carregarClientes() {
    const request = await fetch("/clientes/listar-clientes");
    const resposta = await request.json();
    const clientes = resposta.clientes;
    const select = document.getElementById("emp");
    clientes.forEach(cliente => {
        const option = document.createElement("option");
        option.value = cliente.id_cliente;
        option.textContent = `${cliente.id_cliente} - ${cliente.nome_cliente}`;
        select.appendChild(option);
    })
}

carregarClientes();