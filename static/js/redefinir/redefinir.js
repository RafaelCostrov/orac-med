var buttonRedefinir = document.getElementById("redefinir");

function mostrarLoading() {
    document.getElementById("loading-overlay").style.display = "flex";
}

function esconderLoading() {
    document.getElementById("loading-overlay").style.display = "none";
}

async function redefinir() {
    mostrarLoading()
    var inputEmail = document.getElementById("emailInput").value;
    var payload = {
        "email_usuario": inputEmail
    }
    try {
        var request = await fetch("/usuarios/resetar-senha", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        var resposta = await request.json()

        if (request.ok) {
            UIkit.notification({
                message: resposta.mensagem,
                status: 'success',
                pos: 'top-center',
                timeout: 3000
            });
            esconderLoading()
        }
        else {
            UIkit.notification({
                message: resposta.erro,
                status: 'danger',
                pos: 'top-center',
                timeout: 5000
            });
            esconderLoading()
        }
    }
    catch (e) {
        console.log(e)
    }
}

buttonRedefinir.addEventListener("click", redefinir)