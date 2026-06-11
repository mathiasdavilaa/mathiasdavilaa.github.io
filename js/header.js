window.addEventListener("scroll", function () {
  const header = document.querySelector(".headerStyle");
  const limit = document.getElementById("headerLimit");

  if (header) {
    // Se o elemento limit existir (página com hero banner)
    if (limit) {
      const bcr = limit.getBoundingClientRect();
      if (bcr.top < 0) {
        header.classList.add("rolou");
      } else {
        header.classList.remove("rolou");
      }
    } else {
      // Se não houver hero banner na página, ativa após 50px de scroll
      if (window.scrollY > 50) {
        header.classList.add("rolou");
      } else {
        header.classList.remove("rolou");
      }
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const botaoMenu = document.getElementById("buttonMenu");
  const divInterna = document.querySelector(".headerStyle > div");

  if (botaoMenu && divInterna) {
    botaoMenu.addEventListener("click", function () {
      // Liga/Desliga a classe expandido na div interna
      divInterna.classList.toggle("expandido");
    });
  }
});
