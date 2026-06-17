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

function toggleCarDescription(cardElement) {
    const descriptionDiv = cardElement.nextElementSibling;

    if (descriptionDiv && descriptionDiv.classList.contains('carRowDescription')) {
        descriptionDiv.classList.toggle('expanded');
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const modais = document.querySelectorAll('.gameModal');

    modais.forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                modal.close();
            }
        });
    });
});
