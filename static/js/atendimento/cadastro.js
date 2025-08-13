
function limparInputs(event) {
    if (event) event.preventDefault();
    document.getElementById("colaborador").value = "";
    const checkboxes = document.getElementById("exames").querySelectorAll('input[type="checkbox"]')
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    document.getElementById("lista-exames").innerHTML = "";
    document.getElementById("exames-cliente").innerHTML = "";
    document.getElementById("valor-total").value = "";
    let tipo_atendimento = document.getElementById("tipo-exame")
    tipo_atendimento.value = ""
    let cliente = document.getElementById("empresa")
    cliente.value = ""
    let dropdownSelected = document.getElementById("dropdown-selected");
    dropdownSelected.textContent = "Selecione os exames";
}


async function cadastrarAtendimento(event) {
    event.preventDefault();
    const select = document.getElementById("empresa");
    let id_cliente = select.value;

    const container = document.getElementById("exames");
    const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
    let ids_exames = [];
    checkboxes.forEach(exame => {
        ids_exames.push(parseInt(exame.value));
    });
    let colaborador_atendimento = document.getElementById("colaborador").value
    let usuario = "Rafael Costrov" //TODO Usuários
    let tipo_atendimento = document.getElementById("tipo-exame").value

    const payload = {
        tipo_atendimento: tipo_atendimento,
        usuario: usuario,
        colaborador_atendimento: colaborador_atendimento,
        id_cliente: id_cliente,
        ids_exames: ids_exames
    };

    try {
        // const requisicao = await fetch("http://192.168.15.7:5000/atendimentos/cadastrar-atendimento", {
        const requisicao = await fetch("http://10.10.10.47:5000/atendimentos/cadastrar-atendimento", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        let resposta = await requisicao.json
        if (requisicao.ok) {
            alert(resposta.mensagem)
            console.log(resposta.json)
            limparInputs()

        }

    } catch (e) {
        console.log(e)
    }
}


document.getElementById("remover").addEventListener("click", limparInputs)
document.getElementById("enviar").addEventListener("click", cadastrarAtendimento)