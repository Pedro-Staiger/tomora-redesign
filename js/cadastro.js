const serverUrl = "https://tomora-server-remake.onrender.com";

function setPasswordVisibility(svg) {
    const inputPassword = document.getElementById("input-password");
    const currentType = inputPassword.getAttribute("type");

    if (currentType === "password") {
        inputPassword.setAttribute("type", "text");
        svg.innerHTML = `
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
            <circle cx="12" cy="12" r="3" />
        `;
    } else {
        inputPassword.setAttribute("type", "password");
        svg.innerHTML = `
            <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/>
            <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/>
            <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/>
            <path d="m2 2 20 20"/>
        `;
    }
}

function selectAccountType(button, type) {
    const tipoPaciente = document.querySelector("#tipo-medicado");
    const tipoCuidador = document.querySelector("#tipo-auxiliar");

    if (type === "medicado") {
        button.classList.add("active");
        tipoCuidador.classList.remove("active");
    } else if (type === "auxiliar") {
        button.classList.add("active");
        tipoPaciente.classList.remove("active");
    }
}

function getAccountType() {
    const tipoPaciente = document.querySelector("#tipo-medicado");
    const tipoCuidador = document.querySelector("#tipo-auxiliar");

    if (tipoPaciente.classList.contains("active")) {
        return "MEDICADO";
    } else if (tipoCuidador.classList.contains("active")) {
        return "AUXILIAR";
    }
}

function setEnterKeyListener() {
    const inputName = document.querySelector("#input-name");
    const inputEmail = document.querySelector("#input-email");
    const inputPassword = document.querySelector("#input-password");

    [inputName, inputEmail, inputPassword].forEach(input => {
        input.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                cadastro();
            }
        });
    });
}

setEnterKeyListener();

function cadastro() {
    const alertField = document.querySelector(".alert-field");
    const loader = document.querySelector(".loader");

    const name = document.querySelector("#input-name").value.trim();
    const email = document.querySelector("#input-email").value.trim();
    const password = document.querySelector("#input-password").value.trim();
    const role = getAccountType();

    if (!name || !email || !password || !role) {
        alertField.style.color = "var(--red)";
        alertField.textContent = "Preencha todos os campos";
        return;
    }

    if (!email.includes("@")) {
        alertField.style.color = "var(--red)";
        alertField.textContent = "Insira um email válido";
        return;
    }

    if (name.length > 30 || email.length > 50 || password.length > 20) {
        alertField.style.color = "var(--red)";
        alertField.textContent = "Limite de caracteres excedido";
        return;
    }

    alertField.style.color = "var(--purple)";
    alertField.textContent = "Carregando...";
    loader.classList.add("loading");

    fetch(serverUrl + "/api/user", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, name, password, role })
    })
        .then(response => {
            if (!response.ok) {
                alertField.style.color = "var(--red)";
                alertField.textContent = "Erro ao criar usuário, tente novamente mais tarde";
                loader.classList.remove("loading");
                throw new Error("Erro na requisição: " + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Resposta da API:", data);
            alertField.style.color = "var(--green)";
            alertField.textContent = "Usuário criado com sucesso";
            loader.classList.remove("loading");
            setInterval(() => {
                window.location = "../login/login.html";
            }, 2000)
        })
        .catch(error => {
            console.error("Detalhes do erro:", error);

            alertField.style.color = "var(--red)";
            alertField.textContent = "Erro ao criar usuário, tente novamente mais tarde";
            loader.classList.remove("loading");
        });
}