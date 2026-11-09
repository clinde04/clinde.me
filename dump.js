// Hex viewer for the hero of the hex design. Each row is a 16-byte, null-padded
// text field, the way fixed-width strings look in a real binary record.
// site.js calls hexDump.start() the first time the hex design is shown.
window.hexDump = (function () {
  var FIELDS = [
    "Collin Linde",
    "IT technician",
    "AMTEC Corp.",
    "PKI and 802.1X",
    "Wisconsin, USA",
  ];
  var WIDTH = 16;
  var HEX = "0123456789abcdef";
  var started = false;

  function hex(n, len) {
    var s = n.toString(16);
    while (s.length < len) s = "0" + s;
    return s;
  }

  function start() {
    var dump = document.getElementById("dump");
    var status = document.getElementById("dump-status");
    var fallback = document.getElementById("dump-fallback");
    if (started || !dump || !status || !fallback) return;
    started = true;

    var cells = []; // { code, byteEl, charEl }

    FIELDS.forEach(function (text, r) {
      var row = document.createElement("div");
      row.className = "dump-row";

      var offset = document.createElement("span");
      offset.className = "dump-offset";
      offset.textContent = hex(r * WIDTH, 4);

      var bytes = document.createElement("span");
      bytes.className = "dump-bytes";
      var ascii = document.createElement("span");
      ascii.className = "dump-ascii";

      for (var c = 0; c < WIDTH; c++) {
        var code = c < text.length ? text.charCodeAt(c) : 0;
        var b = document.createElement("b");
        var ch = document.createElement("i");
        b.dataset.i = ch.dataset.i = cells.length;
        if (code === 0) {
          b.className = ch.className = "is-null";
        }
        bytes.appendChild(b);
        ascii.appendChild(ch);
        cells.push({ code: code, byteEl: b, charEl: ch });
      }

      row.appendChild(offset);
      row.appendChild(bytes);
      row.appendChild(ascii);
      dump.appendChild(row);
    });

    function show(cell) {
      cell.byteEl.textContent = hex(cell.code, 2);
      cell.charEl.textContent = cell.code === 0 ? "." : String.fromCharCode(cell.code);
    }

    function scramble(cell) {
      cell.byteEl.textContent = HEX[(Math.random() * 16) | 0] + HEX[(Math.random() * 16) | 0];
      cell.charEl.textContent = ".";
    }

    // Swap the plain heading for the viewer. The heading stays for screen readers.
    fallback.className = "sr-only";
    dump.hidden = false;
    status.hidden = false;

    var IDLE = cells.length + " bytes. Point at one to decode it.";
    status.textContent = IDLE;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cells.forEach(show);
    } else {
      // One load sequence: bytes settle left to right, top to bottom.
      var PER_CELL = 11;
      var begin = null;
      var done = false;
      cells.forEach(scramble);
      var tick = function (now) {
        if (done) return;
        if (begin === null) begin = now;
        var settled = Math.floor((now - begin - 150) / PER_CELL);
        for (var i = 0; i < cells.length; i++) {
          if (i <= settled) show(cells[i]);
          else scramble(cells[i]);
        }
        if (settled < cells.length) requestAnimationFrame(tick);
        else done = true;
      };
      requestAnimationFrame(tick);
      // Browsers pause animation frames in background tabs; never leave the text scrambled.
      setTimeout(function () {
        if (done) return;
        done = true;
        cells.forEach(show);
      }, 150 + cells.length * PER_CELL + 400);
    }

    // Hovering a byte highlights its character, and the reverse.
    var active = null;

    function select(index) {
      if (active !== null) {
        cells[active].byteEl.classList.remove("is-on");
        cells[active].charEl.classList.remove("is-on");
      }
      active = index;
      if (index === null) {
        status.textContent = IDLE;
        return;
      }
      var cell = cells[index];
      cell.byteEl.classList.add("is-on");
      cell.charEl.classList.add("is-on");
      var meaning =
        cell.code === 0
          ? "null padding"
          : cell.code === 32
            ? "space"
            : '"' + String.fromCharCode(cell.code) + '"';
      status.textContent =
        "offset 0x" + hex(index, 4) + "  byte 0x" + hex(cell.code, 2) + "  " + meaning;
    }

    dump.addEventListener("pointerover", function (e) {
      var el = e.target.closest ? e.target.closest("[data-i]") : null;
      if (el) select(Number(el.dataset.i));
    });
    dump.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "mouse") select(null);
    });
  }

  return { start: start };
})();
