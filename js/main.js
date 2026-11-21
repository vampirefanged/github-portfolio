// main.js — artwork lightbox and copy-email button for the portfolio site.
(function () {
  "use strict";

  // ----- Lightbox -----
  var imgs = [].slice.call(document.querySelectorAll("img.art"));
  var lb = document.getElementById("lb");
  var big = document.getElementById("lbImg");
  var cap = document.getElementById("lbCap");
  var cnt = document.getElementById("lbCount");
  var i = 0;
  var last = null;

  function caption(el) {
    var f = el.closest("figure");
    var fc = f && f.querySelector("figcaption");
    return fc ? fc.textContent : "";
  }
  function show(n) {
    i = (n + imgs.length) % imgs.length;
    var el = imgs[i];
    big.src = el.currentSrc || el.src;
    big.alt = el.alt;
    cap.textContent = caption(el);
    cnt.textContent = i + 1 + " / " + imgs.length;
  }
  function open(n) {
    last = document.activeElement;
    show(n);
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("lbClose").focus();
  }
  function close() {
    lb.hidden = true;
    document.body.style.overflow = "";
    if (last) last.focus();
  }

  imgs.forEach(function (el, n) {
    el.tabIndex = 0;
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", "View larger: " + el.alt);
    el.addEventListener("click", function () { open(n); });
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(n); }
    });
  });
  document.getElementById("lbClose").addEventListener("click", close);
  big.addEventListener("click", close);
  document.getElementById("lbPrev").addEventListener("click", function () { show(i - 1); });
  document.getElementById("lbNext").addEventListener("click", function () { show(i + 1); });
  lb.addEventListener("click", function (e) {
    if (e.target === lb || e.target.classList.contains("lb-stage")) close();
  });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(i - 1);
    else if (e.key === "ArrowRight") show(i + 1);
  });

  // ----- Copy email -----
  var btn = document.getElementById("copyBtn");
  btn.addEventListener("click", function () {
    var text = document.getElementById("email").textContent;
    function done(msg) {
      btn.textContent = msg;
      setTimeout(function () { btn.textContent = "Copy email"; }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done("Copied"); }, function () { done("Select & copy"); });
    } else {
      done("Select & copy");
    }
  });
})();
