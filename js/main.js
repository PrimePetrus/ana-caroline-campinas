(function () {
  var WA = document.body.getAttribute("data-wa");
  var EMPTY = document.body.getAttribute("data-empty") || "Queria agendar.";
  var INTRO = "Olá, eu vim do website de vocês.";

  function waUrl(text) {
    return "https://wa.me/" + WA + "?text=" + encodeURIComponent(text);
  }

  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  var sections = ["inicio", "servicos", "agenda", "avaliacoes", "contato"].map(function (id) {
    return [id, document.getElementById(id)];
  });

  function setCurrent() {
    var y = window.scrollY + 120;
    var current = "inicio";
    sections.forEach(function (item) {
      if (item[1] && item[1].offsetTop <= y) current = item[0];
    });
    document.querySelectorAll("[data-nav]").forEach(function (link) {
      if (link.getAttribute("data-nav") === current) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  setCurrent();
  window.addEventListener("scroll", setCurrent, { passive: true });

  var form = document.getElementById("quote-form");
  var waLinks = document.querySelectorAll("[data-wa]");

  function filled(value) {
    return String(value || "").trim();
  }

  function messageFromForm() {
    var lines = [INTRO];
    if (!form) {
      lines.push(EMPTY);
      return lines.join("\n");
    }
    var nome = filled(form.elements.nome && form.elements.nome.value);
    var servico = filled(form.elements.servico && form.elements.servico.value);
    var data = filled(form.elements.data && form.elements.data.value);
    var horario = filled(form.elements.horario && form.elements.horario.value);
    if (nome) lines.push("Nome: " + nome);
    if (servico) lines.push("Serviço: " + servico);
    if (data) lines.push("Data: " + data);
    if (horario) lines.push("Horário: " + horario);
    if (!nome && !servico && !data && !horario) lines.push(EMPTY);
    return lines.join("\n");
  }

  function syncWaLinks() {
    var href = waUrl(messageFromForm());
    waLinks.forEach(function (link) {
      link.setAttribute("href", href);
    });
  }

  syncWaLinks();
  if (form) {
    form.addEventListener("input", syncWaLinks);
    form.addEventListener("change", syncWaLinks);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      syncWaLinks();
      window.open(waUrl(messageFromForm()), "_blank", "noopener,noreferrer");
    });
  }

  var carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".carousel-slide"));
    var captions = [
      "Foto no Google, com a marca Ana Caroline.",
      "Outra foto do Google, no atendimento.",
      "Foto do Instagram, antes e depois."
    ];
    var caption = carousel.querySelector(".carousel-caption");
    var dots = carousel.querySelector(".carousel-dots");
    var index = 0;
    var busy = false;
    var timer = 0;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var ease = "transform 0.7s cubic-bezier(0.22, 0.61, 0.36, 1)";

    slides.forEach(function (slide, i) {
      slide.style.transform = i === 0 ? "translateX(0)" : "translateX(100%)";
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Foto " + (i + 1));
      if (i === 0) dot.setAttribute("aria-current", "true");
      dot.addEventListener("click", function () {
        if (i === index) return;
        show(i, i > index ? "next" : "prev");
      });
      dots.appendChild(dot);
    });

    function paint(i) {
      caption.textContent = captions[i] || "";
      Array.prototype.forEach.call(dots.children, function (dot, n) {
        if (n === i) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    }

    function show(to, direction) {
      if (busy || to === index) return;
      var fromEl = slides[index];
      var toEl = slides[to];
      var out = direction === "next" ? "-100%" : "100%";
      var start = direction === "next" ? "100%" : "-100%";
      busy = true;
      toEl.style.transition = "none";
      toEl.style.transform = "translateX(" + start + ")";
      toEl.offsetHeight;
      fromEl.style.transition = reduce ? "none" : ease;
      toEl.style.transition = reduce ? "none" : ease;
      fromEl.style.transform = "translateX(" + out + ")";
      toEl.style.transform = "translateX(0)";
      index = to;
      paint(index);
      window.setTimeout(function () {
        busy = false;
      }, reduce ? 0 : 720);
      restart();
    }

    function step(direction) {
      var to = direction === "next" ? index + 1 : index - 1;
      if (to >= slides.length) to = 0;
      if (to < 0) to = slides.length - 1;
      show(to, direction);
    }

    function restart() {
      window.clearInterval(timer);
      if (reduce) return;
      timer = window.setInterval(function () {
        step("next");
      }, 4800);
    }

    carousel.querySelector("[data-carousel-prev]").addEventListener("click", function () {
      step("prev");
    });
    carousel.querySelector("[data-carousel-next]").addEventListener("click", function () {
      step("next");
    });

    var touchX = 0;
    carousel.addEventListener("touchstart", function (event) {
      touchX = event.changedTouches[0].clientX;
    }, { passive: true });
    carousel.addEventListener("touchend", function (event) {
      var dx = event.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) < 48) return;
      step(dx < 0 ? "next" : "prev");
    }, { passive: true });

    carousel.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });
    carousel.addEventListener("mouseleave", restart);
    restart();
  }
})();
