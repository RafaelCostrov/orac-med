async function carregarEmpresas() {
    const response = await fetch("http://10.10.10.47:5000/clientes/listar-clientes");
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
