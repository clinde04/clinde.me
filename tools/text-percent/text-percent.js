(function () {
  var textEl = document.getElementById("text");
  var queryEl = document.getElementById("query");
  var resultEl = document.getElementById("result");
  var detailEl = document.getElementById("detail");
  var previewEl = document.getElementById("preview");
  var freqEl = document.getElementById("freq");
  var freqBody = freqEl.querySelector("tbody");
  var freqEmpty = document.getElementById("freq-empty");

  // Apostrophes stay inside a word ("don't"); hyphens split it, to agree with phrasePattern.
  var WORD = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;
  var MAX_ROWS = 50;

  function tokenize(s) {
    return s.toLowerCase().match(WORD) || [];
  }

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Matches the phrase as whole words, whatever punctuation or spacing sits between them.
  function phrasePattern(phraseWords) {
    var body = phraseWords.map(escapeRegExp).join("[^\\p{L}\\p{N}]+");
    return new RegExp("(?<![\\p{L}\\p{N}])" + body + "(?![\\p{L}\\p{N}])", "giu");
  }

  function percent(n) {
    if (n === 0) return "0%";
    if (n < 0.1) return "<0.1%";
    return (Math.round(n * 10) / 10).toString() + "%";
  }

  function plural(n, word, many) {
    return n + " " + (n === 1 ? word : many || word + "s");
  }

  function renderFrequency(words) {
    freqBody.textContent = "";
    if (words.length === 0) {
      freqEl.hidden = true;
      freqEmpty.hidden = false;
      return;
    }
    var counts = new Map();
    words.forEach(function (w) {
      counts.set(w, (counts.get(w) || 0) + 1);
    });
    Array.from(counts.entries())
      .sort(function (a, b) {
        return b[1] - a[1] || a[0].localeCompare(b[0]);
      })
      .slice(0, MAX_ROWS)
      .forEach(function (entry) {
        var tr = document.createElement("tr");
        var th = document.createElement("th");
        th.scope = "row";
        th.textContent = entry[0];
        var count = document.createElement("td");
        count.className = "num";
        count.textContent = entry[1];
        var share = document.createElement("td");
        share.className = "num";
        share.textContent = percent((entry[1] / words.length) * 100);
        tr.appendChild(th);
        tr.appendChild(count);
        tr.appendChild(share);
        freqBody.appendChild(tr);
      });
    freqEl.hidden = false;
    freqEmpty.hidden = true;
  }

  function renderPreview(text, matches) {
    previewEl.textContent = "";
    if (matches.length === 0) {
      previewEl.hidden = true;
      return;
    }
    var last = 0;
    matches.forEach(function (m) {
      previewEl.appendChild(document.createTextNode(text.slice(last, m.index)));
      var mark = document.createElement("mark");
      mark.textContent = m[0];
      previewEl.appendChild(mark);
      last = m.index + m[0].length;
    });
    previewEl.appendChild(document.createTextNode(text.slice(last)));
    previewEl.hidden = false;
  }

  function update() {
    var text = textEl.value;
    var words = tokenize(text);
    var phraseWords = tokenize(queryEl.value);

    renderFrequency(words);

    if (words.length === 0) {
      resultEl.textContent = "0%";
      detailEl.textContent = "Enter some text to get started.";
      renderPreview(text, []);
      return;
    }
    if (phraseWords.length === 0) {
      resultEl.textContent = "0%";
      detailEl.textContent =
        plural(words.length, "word") + " in the text. Enter a word or phrase to look for.";
      renderPreview(text, []);
      return;
    }

    var matches = Array.from(text.matchAll(phrasePattern(phraseWords)));
    var matchedWords = matches.length * phraseWords.length;
    resultEl.textContent = percent((matchedWords / words.length) * 100);
    detailEl.textContent =
      plural(matches.length, "match", "matches") +
      ", covering " +
      matchedWords +
      " of " +
      plural(words.length, "word") +
      ".";
    renderPreview(text, matches);
  }

  var timer = null;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(update, 150);
  }

  textEl.addEventListener("input", schedule);
  queryEl.addEventListener("input", schedule);
  update();
})();
