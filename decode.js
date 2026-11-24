// Text decode effect for the hex design. Each block of text starts as random hex
// digits and settles into the real text from left to right, the same way the hex
// viewer in the hero loads. Blocks decode once, as they scroll into view.
// site.js calls textDecode.start() when the hex design is shown and
// textDecode.stop() when it is left.
window.textDecode = (function () {
  var TARGETS =
    "h1, h2, h3, p, li, dt, dd, .nav-home, .nav-links a, .field > span";
  // Text that is decoded elsewhere, read only by screen readers, or rewritten by a script.
  var SKIP =
    "script, style, textarea, svg, .sr-only, .dump, .dump-status, [aria-live], .freq, .preview, .result, .result-detail";
  var HEX = "0123456789abcdef";
  var WINDOW = 6; // characters shown scrambled ahead of the settled text

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var pending = null; // elements that have not decoded yet
  var running = []; // finish() functions of animations in progress
  var observer = null;

  function collect() {
    var all = Array.prototype.slice.call(document.querySelectorAll(TARGETS));
    var set = new Set(all);
    pending = all.filter(function (el) {
      if (el.closest(SKIP)) return false;
      // Animate the outermost block only; nested targets decode as part of it.
      for (var p = el.parentElement; p; p = p.parentElement) {
        if (set.has(p)) return false;
      }
      return true;
    });
  }

  function noise(text) {
    var out = "";
    for (var i = 0; i < text.length; i++) {
      out += /\s/.test(text[i]) ? text[i] : HEX[(Math.random() * 16) | 0];
    }
    return out;
  }

  function animate(el, delay) {
    var parts = [];
    var total = 0;
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (node.parentElement && node.parentElement.closest(SKIP)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    if (!nodes.length) return;

    // Each text node becomes: settled text, scrambled window, and the rest of the
    // text kept invisible so the line breaks do not move while it decodes.
    nodes.forEach(function (node) {
      var wrap = document.createElement("span");
      var done = document.createTextNode("");
      var mid = document.createElement("span");
      var rest = document.createElement("span");
      mid.className = "decode-noise";
      rest.className = "decode-rest";
      rest.textContent = node.nodeValue;
      wrap.appendChild(done);
      wrap.appendChild(mid);
      wrap.appendChild(rest);
      node.parentNode.replaceChild(wrap, node);
      parts.push({ node: node, text: node.nodeValue, at: total, wrap: wrap, done: done, mid: mid, rest: rest });
      total += node.nodeValue.length;
    });

    var duration = Math.min(1100, Math.max(350, total * 5));
    var begin = null;
    var finished = false;
    var timer;

    function finish() {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      parts.forEach(function (p) {
        if (p.wrap.parentNode) p.wrap.parentNode.replaceChild(p.node, p.wrap);
      });
      var i = running.indexOf(finish);
      if (i !== -1) running.splice(i, 1);
    }

    function draw(head) {
      var settled = head - WINDOW;
      parts.forEach(function (p) {
        var s = Math.min(p.text.length, Math.max(0, settled - p.at));
        var h = Math.min(p.text.length, Math.max(0, head - p.at));
        p.done.nodeValue = p.text.slice(0, s);
        p.mid.textContent = noise(p.text.slice(s, h));
        p.rest.textContent = p.text.slice(h);
      });
    }

    function tick(now) {
      if (finished) return;
      if (begin === null) begin = now + delay;
      var head = Math.floor(((now - begin) / duration) * (total + WINDOW));
      if (head - WINDOW >= total) return finish();
      draw(Math.max(0, head));
      requestAnimationFrame(tick);
    }

    draw(0);
    running.push(finish);
    requestAnimationFrame(tick);
    // Browsers pause animation frames in background tabs; never leave text scrambled.
    timer = setTimeout(finish, delay + duration + 600);
  }

  function start() {
    if (reduced || !("IntersectionObserver" in window)) return;
    if (pending === null) collect();
    if (observer || !pending.length) return;

    observer = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        observer.unobserve(el);
        var i = pending.indexOf(el);
        if (i !== -1) pending.splice(i, 1);
        // Blocks that appear together decode in a quick cascade, top to bottom.
        animate(el, Math.min(n++ * 50, 400));
      });
    });
    pending.forEach(function (el) {
      observer.observe(el);
    });
  }

  function stop() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    running.slice().forEach(function (finish) {
      finish();
    });
  }

  return { start: start, stop: stop };
})();
