async function carregarExames() {
    const request = await fetch("http://10.10.10.47:5000/exames/listar-exames");
    const resposta = await request.json();
    const exames = resposta.exames;
    const select = document.getElementById("exames-select");
    exames.forEach(exame => {
        const option = document.createElement("option");
        option.value = exame.id_exame;
        option.textContent = `${exame.id_exame} - ${exame.nome_exame}`;
        select.appendChild(option);
    })
}

carregarExames();