async function carregarExames() {
    const request = await fetch("http://127.0.0.1:5000/exames/listar-exames");
    const resposta = await request.json();
    const exames = resposta.exames;

    const container = document.getElementById("exames");
    const inputValorTotal = document.getElementById("valor-total");


    const valoresExames = {};
    const nomesExame = {};
    exames.forEach(exame => {
        valoresExames[exame.id_exame] = exame.valor_exame ?? 0;
        nomesExame[exame.id_exame] = exame.nome_exame ?? "";
    });

    function atualizarValorTotal() {
        let soma = 0;
        const lista = document.getElementById("lista-exames");
        lista.innerHTML = "";

        const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
        checkboxes.forEach(cb => {
            const id = cb.value;
            soma += valoresExames[id] || 0;

            const exame = document.createElement("li");
            exame.textContent = `${id} - ${nomesExame[id]}`;
            lista.appendChild(exame);
        });

        inputValorTotal.value = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        }).format(soma);
    }

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

carregarExames();