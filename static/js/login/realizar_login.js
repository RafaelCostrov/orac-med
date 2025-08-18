async function login(event) {
    event.preventDefault();
    let usuario = document.getElementById("email_usuario").value;
    let senha = document.getElementById("senha").value;

    let payload = {
        "email_usuario": usuario,
        "senha": senha
    }

    const resposta = await fetch("/usuarios/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })

    let json = await resposta.json(); {
        if (resposta.ok) {
            console.log(json)
            window.location.href = "/atendimento";
        } else {
            console.log(json)
            UIkit.notification({
                message: json.erro,
                status: 'danger',
                pos: 'top-center',
                timeout: 5000
            })
        }
    }
}

document.getElementById("button-login").addEventListener("click", login);