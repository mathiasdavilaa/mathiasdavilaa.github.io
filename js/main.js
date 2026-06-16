function atualizarContador() {
    const agora = new Date();
    const dataAlvo = new Date('2026-06-19T00:00:00');
    const diferenca = dataAlvo - agora;

    if (diferenca <= 0) {
        document.getElementById('contadorHoras').innerText = "00:00:00";
        return;
    }

    const totalSegundos = Math.floor(diferenca / 1000);
    const totalMinutos = Math.floor(totalSegundos / 60);

    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    const segundos = totalSegundos % 60;

    const horasFormatadas = String(horas).padStart(2, '0');
    const minutosFormatados = String(minutos).padStart(2, '0');
    const segundosFormatados = String(segundos).padStart(2, '0');

    document.getElementById('contadorHoras').innerText = `${horasFormatadas}:${minutosFormatados}:${segundosFormatados}`;
}
atualizarContador();
setInterval(atualizarContador, 1000);
