// 🕹️ CONTROLE DOS POP-UPS (MODAIS) DA PÁGINA SOBRE

function openGameModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.showModal();
    }
}

function closeGameModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.close();
    }
}

// 🏎️ CONTROLE DE EXPANSÃO DAS DESCRIÇÕES DOS CARROS (COLUNA)
function toggleCarDescription(cardElement) {
    // Localiza a div .carRowDescription que está logo abaixo do card clicado
    const descriptionDiv = cardElement.nextElementSibling;

    if (descriptionDiv && descriptionDiv.classList.contains('carRowDescription')) {
        descriptionDiv.classList.toggle('expanded');
    }
}

// Executa após o HTML carregar completamente para configurar o clique na cortina escura do modal
document.addEventListener("DOMContentLoaded", function () {
    const modais = document.querySelectorAll('.gameModal');

    modais.forEach(modal => {
        modal.addEventListener('click', function (e) {
            // Se o usuário clicar exatamente na cortina (fundo fosco) fecha o modal automaticamente
            if (e.target === modal) {
                modal.close();
            }
        });
    });
});
