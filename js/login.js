const serverUrl = "https://tomora.onrender.com";

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

function setEnterKeyListener() {
    const inputEmail = document.querySelector("#input-email");
    const inputPassword = document.querySelector("#input-password");

    [inputEmail, inputPassword].forEach(input => {
        input.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                login();
            }
        });
    });
}

setEnterKeyListener();

function login() {
    const alertField = document.querySelector(".alert-field");
    const loader = document.querySelector(".loader");

    const email = document.querySelector("#input-email").value.trim();
    const password = document.querySelector("#input-password").value.trim();

    if (!email || !password) {
        alertField.style.color = "var(--red)";
        alertField.textContent = "Preencha todos os campos";
        return;
    }

    if (!email.includes("@")) {
        alertField.style.color = "var(--red)";
        alertField.textContent = "Insira um email válido";
        return;
    }

    alertField.style.color = "var(--purple)";
    alertField.textContent = "Carregando...";
    loader.classList.add("loading");

    fetch(serverUrl + "/usersLogin", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    }).then(response => {
        if (!response.ok) {
            alertField.style.color = "var(--red)";
            alertField.textContent = "Erro ao realizar login, tente novamente mais tarde";
            loader.classList.remove("loading");
            throw new Error('Erro na requisição: ' + response.status);
        }
        return response.json();
    })
        .then(data => {
            console.log('Dados recebidos:', data);
            alertField.style.color = "var(--green)";
            alertField.textContent = "Login efetuado com sucesso!";
            loader.classList.remove("loading");
            localStorage.setItem("userId", data.id);
            setInterval(() => {
                window.location = "../dashboard/dashboard.html";
            }, 2000)
        })
        .catch(error => {
            console.error("Detalhes do erro:", error);

            alertField.style.color = "var(--red)";
            alertField.textContent = "Erro ao realizar login, dados incorretos ou inexistentes";
            loader.classList.remove("loading");
        });
}