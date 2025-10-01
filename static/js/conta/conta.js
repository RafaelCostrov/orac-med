let id_usuario = document.getElementById("id_usuario");
let nome = document.getElementById("nome");
let email = document.getElementById("email");
let buttonEditar = document.getElementById("editar");
let buttonCancelar = document.getElementById("cancelar");
let foto = document.getElementById("foto");
let avatar = document.getElementById("avatar-preview");


const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

// Esconder "Minha conta" nesta página

const btnMinhaConta = $('#btnMinhaConta');
if (btnMinhaConta) btnMinhaConta.style.display = 'none';

function validarSenha(senha) {
    return regexSenha.test(senha);
}

function mostrarLoading() {
    document.getElementById("loading-overlay").style.display = "flex";
}

function esconderLoading() {
    document.getElementById("loading-overlay").style.display = "none";
}

async function colocarInputs() {
    nome.value = nome.dataset.username;
    email.value = email.dataset.email;
    id_usuario.value = id_usuario.dataset.id;
}

function habilitarInputs(event) {
    event.preventDefault();
    nome.disabled = false;
    email.disabled = false;
    buttonCancelar.disabled = false;
    buttonCancelar.classList.remove("disabled");
    buttonEditar.setAttribute("id", "salvar");
    buttonEditar.addEventListener("click", salvarAlteracao);
    buttonEditar.textContent = "Salvar";
}

function cancelarEdicao(event) {
    event.preventDefault();
    event.stopPropagation();

    nome.disabled = true;
    email.disabled = true;
    buttonCancelar.disabled = true;
    buttonCancelar.classList.add("disabled");
    buttonEditar.setAttribute("id", "editar");
    buttonEditar.textContent = "Editar";
    buttonEditar.removeEventListener("click", salvarAlteracao);
    buttonEditar.addEventListener("click", habilitarInputs);
    avatar.src = avatar.dataset.foto || "/static/img/user1.png";
    colocarInputs();
};

async function salvarAlteracao(params) {
    try {
        mostrarLoading();
        if (!nome || !email) {
            UIkit.notification({
                message: "Nome e email são obrigatórios ❌",
                status: 'danger',
                pos: 'top-center',
                timeout: 5000
            })
            return
        }

        let senhaInput = document.getElementById("pwdNova");
        let senha = senhaInput && senhaInput.value ? senhaInput.value : null;

        payload = {
            id_usuario: parseInt(id_usuario.value),
            nome_usuario: nome.value ? nome.value : nome.dataset.username,
            email_usuario: email.value ? email.value : email.dataset.email,
            senha: senha ? senha : null,
            foto: foto.files[0] ? foto.files[0] : null,
        }

        const formData = new FormData();
        id_usuario ? formData.append("id_usuario", id_usuario.value) : null;
        nome ? formData.append("nome_usuario", nome.value) : null;
        email ? formData.append("email_usuario", email.value) : null;
        senha ? formData.append("senha", senha) : null;
        foto.files[0] ? formData.append("foto", foto.files[0]) : null;

        const requisicao = await fetch("/usuarios/atualizar-conta", {
            method: "PUT",
            body: formData
        });
        const resposta = await requisicao.json();
        if (requisicao.ok) {
            nome.dataset.username = nome.value;
            email.dataset.email = email.value;
            id_usuario.dataset.username = id_usuario.value;
            if (foto.files[0]) {
                avatar.dataset.foto = `https://lh3.googleusercontent.com/d/${resposta.foto_url}`;
            }
            UIkit.notification({
                message: resposta.mensagem || "Erro ao atualizar usuário ❌",
                status: 'success',
                pos: 'top-center',
                timeout: 3000
            });
            colocarInputs(params);
        }
        else {
            UIkit.notification({
                message: resposta.erro || "Erro ao atualizar usuário ❌",
                status: 'danger',
                pos: 'top-center',
                timeout: 3000
            });
            console.log(resposta);
        }
    }
    catch (erro) {
        console.error("Erro na requisição:", erro);
    } finally {
        esconderLoading();
        cancelarEdicao(params);
    }
}

avatar.addEventListener("click", (params) => {
    habilitarInputs(params);
    foto.click();
});

foto.addEventListener("change", () => {
    const file = foto.files[0];
    const reader = new FileReader();
    reader.onload = e => {
        avatar.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

buttonCancelar.addEventListener("click", cancelarEdicao);
buttonEditar.addEventListener("click", habilitarInputs);
document.getElementById("salvarSenha").addEventListener("click", (params) => {
    let senhaNova = document.getElementById("pwdNova")?.value || null;
    let senhaConfirma = document.getElementById("pwdConfirma")?.value || null;
    senhaNova == senhaConfirma ? senha = senhaNova : UIkit.notification({
        message: "Senhas não conferem ❌",
        status: 'danger',
        pos: 'top-center',
        timeout: 5000
    });

    validarSenha(senha) ? salvarAlteracao(params) : UIkit.notification({
        message: "Senha inválida, cumpra os requisitos ❌",
        status: 'danger',
        pos: 'top-center',
        timeout: 5000
    });
})

colocarInputs();