async function carregarEmpresas() {
    const response = await fetch("http://127.0.0.1:5000/clientes/listar-clientes");
    const dados = await response.json();
    const clientes = dados.clientes;

    const select = document.getElementById("empresa");

    select.querySelectorAll("option:not([disabled])").forEach(opt => opt.remove());

    clientes.forEach(cliente => {
        const option = document.createElement("option");
        option.value = cliente.id_cliente;
        option.textContent = `${cliente.id_cliente} - ${cliente.nome_cliente}`;
        select.appendChild(option);
    });
}

carregarEmpresas();
