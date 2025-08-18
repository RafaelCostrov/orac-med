async function logout(event) {
    event.preventDefault();
    try {
        const requisicao = await fetch("/usuarios/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (requisicao.ok) {
            window.location.href = "/";
        } else {
            console.error("Erro ao fazer logout");
        }
    } catch (error) {
        console.error("Erro:", error);
    }
}

document.getElementById("logout-button").addEventListener("click", logout)