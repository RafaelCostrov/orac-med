async function carregarExames() {
    const request = await fetch("/exames/listar-exames");
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

// carregarExames();

async function carregarExamesSelectDetalhes() {
    const request = await fetch("/exames/listar-exames");
    const resposta = await request.json();
    const exames = resposta.exames;

    const examesUl = document.getElementById("exames");
    examesUl.innerHTML = "";

    exames.forEach(exame => {
        const option = document.createElement("option");
        option.value = exame.id_exame;
        option.textContent = `${exame.id_exame} - ${exame.nome_exame}`;
        examesUl.appendChild(option);
    });

    if (typeof examesUl.loadOptions === "function") {
        examesUl.loadOptions();
    }
}

carregarExamesSelectDetalhes();