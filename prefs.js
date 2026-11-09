// Loaded in <head> so the saved design and theme apply before the page paints.
// Defaults are the classic design and the dark theme.
(function () {
  var design = null;
  var theme = null;
  try {
    design = localStorage.getItem("design");
    theme = localStorage.getItem("theme");
  } catch (e) {
    // Storage can be blocked; the defaults still apply.
  }
  document.documentElement.className =
    (design === "hex" ? "d-hex" : "d-classic") + " " + (theme === "light" ? "t-light" : "t-dark");
})();
