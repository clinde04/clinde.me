(function () {
  var root = document.documentElement;

  function save(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Storage can be blocked; the choice then lasts for this page only.
    }
  }

  // ----- Design toggle: classic look or hex viewer -----

  var FONTS =
    "https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600&family=Martian+Mono:wdth,wght@75..112.5,400..600&display=swap";
  var fontsLoaded = false;

  // The hex design's fonts are only fetched when that design is in use.
  function loadFonts() {
    if (fontsLoaded) return;
    fontsLoaded = true;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS;
    document.head.appendChild(link);
  }

  var designButton = document.getElementById("design-toggle");

  function applyDesign(design) {
    var hex = design === "hex";
    root.classList.toggle("d-hex", hex);
    root.classList.toggle("d-classic", !hex);
    if (designButton) {
      designButton.textContent = hex ? "Classic view" : "Hex view";
      designButton.setAttribute(
        "aria-label",
        hex ? "Switch to classic view" : "Switch to hex view"
      );
    }
    if (hex) {
      loadFonts();
      if (window.hexDump) window.hexDump.start();
    }
  }

  if (designButton) {
    designButton.hidden = false;
    designButton.addEventListener("click", function () {
      var next = root.classList.contains("d-hex") ? "classic" : "hex";
      applyDesign(next);
      save("design", next);
    });
  }
  applyDesign(root.classList.contains("d-hex") ? "hex" : "classic");

  // ----- Theme toggle: dark or light -----

  var themeButton = document.getElementById("theme-toggle");

  function applyTheme(theme) {
    var light = theme === "light";
    root.classList.toggle("t-light", light);
    root.classList.toggle("t-dark", !light);
    if (themeButton) {
      themeButton.setAttribute(
        "aria-label",
        light ? "Switch to dark theme" : "Switch to light theme"
      );
    }
  }

  if (themeButton) {
    themeButton.hidden = false;
    themeButton.addEventListener("click", function () {
      var next = root.classList.contains("t-light") ? "dark" : "light";
      applyTheme(next);
      save("theme", next);
    });
  }
  applyTheme(root.classList.contains("t-light") ? "light" : "dark");

  // ----- Purple orb that follows the mouse (classic design; hidden by CSS in hex) -----

  var orb = document.getElementById("orb");
  if (orb) {
    document.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      orb.style.transform = "translate(" + e.clientX + "px, " + e.clientY + "px)";
      orb.classList.add("is-on");
    });
    document.documentElement.addEventListener("pointerleave", function () {
      orb.classList.remove("is-on");
    });
  }

  // ----- The scroll hint in the classic hero disappears once the page is scrolled -----

  var caret = document.getElementById("caret");
  if (caret) {
    var onScroll = function () {
      caret.classList.toggle("is-hidden", window.scrollY > 1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();
