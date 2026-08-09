const serverUrl = "https://tomora-server-remake.onrender.com";

// Guarda o prefixo de rota atual: "/api/auth" (própria conta, MEDICADO)
// ou "/api/auth/patients/:id" (conta de um paciente, AUXILIAR).
// Preenchido em getData() e reutilizado por createReminder/deleteReminder.
let currentBasePath = null;

async function getData() {
    const token = localStorage.getItem("accessToken");

    if (!token) {
        window.location.href = "../login/login.html";
        return;
    }

    currentBasePath = await getUserData(token);

    if (!currentBasePath) return; // AUXILIAR sem nenhum paciente vinculado, por exemplo

    await getReminders(token, currentBasePath);
    await getUserHistorics(token, currentBasePath);
}

// Retorna o "basePath" a ser usado nas próximas requisições, de acordo com o role.
async function getUserData(token) {
    try {
        const response = await fetch(serverUrl + "/api/auth/me", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Falha ao buscar dados do usuário");

        const { user } = await response.json();
        setUserName(user.name);

        if (user.role === "MEDICADO") {
            return "/api/auth"; // usa as rotas da própria conta
        }

        // AUXILIAR: busca os pacientes vinculados e usa o primeiro deles.
        // Se seu app permitir escolher entre vários pacientes, é aqui que
        // entraria um seletor em vez de pegar sempre patients[0].
        const patientsResponse = await fetch(serverUrl + "/api/auth/patients", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!patientsResponse.ok) throw new Error("Falha ao buscar pacientes vinculados");

        const { data: patients } = await patientsResponse.json();

        if (!patients || patients.length === 0) {
            console.warn("Nenhum paciente vinculado a esta conta AUXILIAR.");
            return null;
        }

        return `/api/auth/patients/${patients[0].id}`;
    } catch (error) {
        console.error("Erro:", error);
        return null;
    }
}

function setUserName(name) {
    const userNameElement = document.querySelector("#txt-user-message");
    const nameWithFirstLetterCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
    userNameElement.textContent = `Olá, ${nameWithFirstLetterCapitalized}!👋`;
}

async function getReminders(token, basePath) {
    try {
        const response = await fetch(serverUrl + basePath + "/reminder", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Falha ao buscar lembretes");

        const { data } = await response.json();
        buildReminders(data);
    } catch (error) {
        console.error("Erro:", error);
    }
}

function buildReminders(reminders) {
    const txtRemindersCount = document.querySelector("#txt-total-lembretes");
    txtRemindersCount.textContent = reminders.length;

    const remindersContainer = document.querySelector(".lembretes");

    for (let reminder of reminders) {
        const reminderCard = document.createElement("div");
        reminderCard.classList.add("lembrete-card");

        const cardBall = document.createElement("div");
        cardBall.classList.add("card-ball");

        const cardInfo = document.createElement("div");
        cardInfo.classList.add("card-info");

        const cardTitle = document.createElement("h3");
        cardTitle.textContent = reminder.name;

        const cardDesc = document.createElement("p");
        cardDesc.textContent = `${reminder.dosage}. ${reminder.desc}`;

        cardInfo.appendChild(cardTitle);
        cardInfo.appendChild(cardDesc);

        const cardTimeContainer = document.createElement("p");
        const cardTime = document.createElement("b");
        cardTime.textContent = reminder.time; // era reminder.hour — o backend usa "time"
        cardTimeContainer.appendChild(cardTime);

        const btnDelete = document.createElement("button");
        btnDelete.classList.add("btn-delete");

        const btnDeleteIcon = createTrashIcon();
        btnDelete.appendChild(btnDeleteIcon);

        btnDelete.onclick = () => deleteReminder(reminder.id);

        reminderCard.appendChild(cardBall);
        reminderCard.appendChild(cardInfo);
        reminderCard.appendChild(cardTimeContainer);
        reminderCard.appendChild(btnDelete);

        remindersContainer.appendChild(reminderCard);
    }

    const btnAddReminder = document.createElement("button");
    btnAddReminder.classList.add("btn-add-lembrete");

    btnAddReminder.onclick = () => openModal();

    btnAddReminder.textContent = "Adicionar Lembrete";
    remindersContainer.appendChild(btnAddReminder);
}

function createTrashIcon() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
    `;

    return wrapper.firstElementChild;
}

function deleteReminder(reminderId) {
    const confirmDelete = confirm("Tem certeza que deseja deletar este lembrete?");
    if (!confirmDelete) {
        return;
    }

    const token = localStorage.getItem("accessToken");

    fetch(serverUrl + currentBasePath + "/reminder/" + reminderId, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro na requisição: " + response.status);
            }
            // DELETE retorna 204 No Content — não tem corpo, então não dá .json() aqui
            window.location.reload();
        })
        .catch(error => {
            console.error("Erro:", error);
            alert("Erro ao deletar lembrete. Verifique se ele realmente existe.");
        });
}

async function getUserHistorics(token, basePath) {
    try {
        const response = await fetch(serverUrl + basePath + "/history", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Falha ao buscar histórico");

        const { data } = await response.json();
        buildHistoric(data);
    } catch (error) {
        console.error("Erro:", error);
    }
}

function buildHistoric(historic) {
    let takenCount = 0;
    let missedCount = 0;

    const historicContainer = document.querySelector(".historicos");

    for (let record of historic) {
        const recordCard = document.createElement("div");
        recordCard.classList.add("historico-card");

        const recordStatus = document.createElement("div");
        recordStatus.classList.add("historico-status");

        const recordStatusText = document.createElement("p");
        recordStatusText.classList.add("status-text");

        if (record.taken === true) {
            const checkIcon = createCheckIcon();
            recordStatus.appendChild(checkIcon);
            recordStatus.classList.add("taken");

            recordStatusText.textContent = "Tomado";
            recordStatusText.classList.add("taken");

            takenCount++;
        } else {
            const xIcon = createXIcon();
            recordStatus.appendChild(xIcon);
            recordStatus.classList.add("missed");

            recordStatusText.textContent = "Perdido";
            recordStatusText.classList.add("missed");

            missedCount++;
        }

        const recordInfo = document.createElement("div");
        recordInfo.classList.add("card-info");

        const recordTitle = document.createElement("h3");
        // A tabela History só guarda reminderId, não o nome do remédio.
        // Pra mostrar o nome de verdade, a API precisaria devolver isso
        // junto (join com Reminder) — por ora, mostra o id.
        recordTitle.textContent = record.reminderId
            ? `Lembrete #${record.reminderId}`
            : "Lembrete";

        recordInfo.appendChild(recordTitle);

        recordCard.appendChild(recordStatus);
        recordCard.appendChild(recordInfo);
        recordCard.appendChild(recordStatusText);
        historicContainer.appendChild(recordCard);
    }

    document.querySelector("#txt-doses-tomadas").textContent = takenCount;
    document.querySelector("#txt-doses-perdidas").textContent = missedCount;

    const taxaAdesao = historic.length > 0 ? (takenCount / historic.length) * 100 : 0;
    document.querySelector("#txt-taxa-adesao").textContent = taxaAdesao.toFixed(1) + "%";
}

function createCheckIcon() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    `;

    return wrapper.firstElementChild;
}

function createXIcon() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
    `;

    return wrapper.firstElementChild;
}

const modalOverlay = document.getElementById("modal-overlay");
const formLembrete = document.getElementById("form-lembrete");

function openModal() {
    modalOverlay.classList.add("active");
}

function closeModal() {
    modalOverlay.classList.remove("active");
    formLembrete.reset();
}

// Fecha clicando fora do card
modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
});

// Fecha com ESC
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
        closeModal();
    }
});

function createReminder() {
    const alertField = document.querySelector("#alert-field");
    alertField.style.color = "var(--text-primary)";
    alertField.textContent = "";

    const loader = document.querySelector(".loader");
    const token = localStorage.getItem("accessToken");

    const name = document.getElementById("input-nome").value;
    const dosage = document.getElementById("input-dosagem").value;
    const time = document.getElementById("input-horario").value;
    const desc = document.getElementById("input-descricao").value;

    if (!name || !dosage || !time) {
        alertField.style.color = "var(--red)";
        alertField.textContent = "Por favor, preencha os campos obrigatórios";
        return;
    }

    if (name.length > 30 || dosage.length > 15 || time.length > 5 || desc.length > 30) {
        alertField.style.color = "var(--red)";
        alertField.textContent = "Quantidade de caracteres excedida";
        return;
    }

    alertField.textContent = "Carregando...";
    loader.classList.add("loading");

    // userId não é enviado — a API pega isso do token (req.targetUserId)
    const novoLembrete = { name, dosage, desc, time };

    fetch(serverUrl + currentBasePath + "/reminder", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(novoLembrete)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro ao criar lembrete");
            }
            return response.json();
        })
        .then(() => {
            loader.classList.remove("loading");
            alertField.style.color = "var(--green)";
            alertField.textContent = "Lembrete criado com sucesso!";

            setTimeout(() => {
                window.location.reload();
            }, 3500);
        })
        .catch(error => {
            console.error("Erro:", error);

            loader.classList.remove("loading");
            alertField.style.color = "var(--red)";
            alertField.textContent = "Erro ao criar lembrete";
        });
}

getData();