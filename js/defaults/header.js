window.addEventListener("scroll", function () {
  const header = document.querySelector(".headerStyle");
  const limit = document.getElementById("headerLimit");

  if (header) {
    if (limit) {
      const bcr = limit.getBoundingClientRect();

      if (bcr.top < 0) {
        header.classList.add("fixado-no-topo");
        header.classList.add("rolou");
      } else {
        header.classList.remove("fixado-no-topo");
        header.classList.remove("rolou");
      }
    } else {
      header.classList.add("fixado-no-topo");
      if (window.scrollY > 50) {
        header.classList.add("rolou");
      } else {
        header.classList.remove("rolou");
      }
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector(".headerStyle");
  const limit = document.getElementById("headerLimit");
  const botaoMenu = document.getElementById("buttonMenu");
  const divInterna = document.querySelector(".headerStyle > div");

  if (header && !limit) {
    header.classList.add("fixado-no-topo");
  }

  if (botaoMenu && divInterna) {
    botaoMenu.addEventListener("click", function () {
      divInterna.classList.toggle("expandido");
    });
  }
});
