function setScrollScaleAnimation() {
    const elements = document.querySelectorAll(".scroll-hidden-scale");

    // Atribui o índice fixo a cada elemento uma única vez
    elements.forEach((el, i) => {
        el.dataset.index = i;
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const index = parseInt(entry.target.dataset.index);
                setTimeout(() => {
                    entry.target.classList.add("scroll-visible-scale");
                }, 150 * index);
            } else {
                entry.target.classList.remove("scroll-visible-scale");
            }
        });
    });

    elements.forEach((el) => observer.observe(el));
}

function setScrollXAnimation() {
    const elements = document.querySelectorAll(".scroll-hidden-x");

    // Atribui o índice fixo a cada elemento uma única vez
    elements.forEach((el, i) => {
        el.dataset.index = i;
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const index = parseInt(entry.target.dataset.index);
                setTimeout(() => {
                    entry.target.classList.add("scroll-visible-x");
                }, 150 * index);
            } else {
                entry.target.classList.remove("scroll-visible-x");
            }
        });
    });

    elements.forEach((el) => observer.observe(el));
}

function setScrollYAnimation() {
    const elements = document.querySelectorAll(".scroll-hidden-y");

    // Atribui o índice fixo a cada elemento uma única vez
    elements.forEach((el, i) => {
        el.dataset.index = i;
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const index = parseInt(entry.target.dataset.index);
                setTimeout(() => {
                    entry.target.classList.add("scroll-visible-y");
                }, 150 * index);
            } else {
                entry.target.classList.remove("scroll-visible-y");
            }
        });
    });

    elements.forEach((el) => observer.observe(el));
}

setScrollScaleAnimation();
setScrollXAnimation();
setScrollYAnimation();


emailjs.init('vDdvUZ4V15cup70y9');
const EMAIL_CONFIG = {
    serviceID: 'service_cdfztij',
    templateID: 'template_ouytcle'
};

async function sendEmail() {
    const nome = document.querySelector('#input-nome').value.trim();
    const email = document.querySelector('#input-email').value.trim();
    const assunto = document.querySelector('#input-assunto').value.trim();
    const mensagem = document.querySelector('#input-mensagem').value.trim();

    const label = document.querySelector('.suport-alert');
    label.style.color = "var(--text-secondary)";

    if (!nome || !email || !assunto || !mensagem) {
        label.style.color = "red";
        label.textContent = "Preencha todos os campos!";
        return;
    }

    if (!email.includes('@')) {
        label.style.color = "red";
        label.textContent = "Insira um e-mail válido!";
        return;
    }

    try {
        label.style.color = "var(--text-secondary)";
        label.textContent = "Enviando...";
        // Dados para o template
        const templateParams = {
            nome: nome,
            email: email,
            titulo: assunto,
            descricao: mensagem
        };

        // Envia o email
        await emailjs.send(EMAIL_CONFIG.serviceID, EMAIL_CONFIG.templateID, templateParams);

        label.textContent = "Mensagem enviada!";

        document.getElementById('input-nome').value = "";
        document.getElementById('input-email').value = "";
        document.getElementById('input-assunto').value = "";
        document.getElementById('textarea-mensagem').value = "";
    } catch (error) {
        console.error('Erro:', error);
        label.style.color = "red";
        label.textContent = "Erro ao enviar mensagem. Tente novamente.";
    }
}