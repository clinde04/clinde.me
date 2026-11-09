(function () {
  // Purple orb that follows the mouse. Touch and pen input never show it.
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

  // The scroll hint in the hero disappears once the page has been scrolled.
  var caret = document.getElementById("caret");
  if (caret) {
    var onScroll = function () {
      caret.classList.toggle("is-hidden", window.scrollY > 1);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();
