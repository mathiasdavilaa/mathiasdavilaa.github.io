(function () {
  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) {}

  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  var theme = stored || (prefersDark ? "dark" : "light");
  root.setAttribute("data-theme", theme);

  function setLabel(btn, theme) {
    btn.querySelector(".label").textContent = theme === "dark" ? "night" : "day";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;
    setLabel(btn, theme);

    btn.addEventListener("click", function () {
      theme = theme === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", theme);
      setLabel(btn, theme);
      try { localStorage.setItem("theme", theme); } catch (e) {}
    });
  });
})();
