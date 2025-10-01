function mostrarLoading() {
    document.getElementById("loading-overlay").style.display = "flex";
}

function esconderLoading() {
    document.getElementById("loading-overlay").style.display = "none";
}

async function login(event) {
    mostrarLoading();
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
    esconderLoading();
}

function togglePassword() {
    const passwordInput = document.getElementById('senha');
    const eyeIcon = document.getElementById('eyeIcon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.src = "../static/img/icons/view.png  ";
        eyeIcon.alt = 'Ocultar senha';
    } else {
        passwordInput.type = 'password';
        eyeIcon.src = '../static/img/icons/hide.png';
        eyeIcon.alt = 'Mostrar senha';
    }
}

document.getElementById("button-login").addEventListener("click", login);