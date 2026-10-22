(function () {
  var WEDDING_DATE = new Date("2026-11-22T10:00:00+05:30").getTime();
  var $ = function (id) { return document.getElementById(id); };
  var root = $("wed-root"), audio = $("bg-audio"), fab = $("audio-fab");

  /* Countdown */
  function tick() {
    var diff = Math.max(0, WEDDING_DATE - Date.now());
    var v = {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff / 3600000) % 24),
      m: Math.floor((diff / 60000) % 60),
      s: Math.floor((diff / 1000) % 60)
    };
    for (var k in v) $("cd-" + k).textContent = String(v[k]).padStart(2, "0");
  }
  tick(); setInterval(tick, 1000);

  /* Music */
  function setPlaying(on) {
    fab.classList.toggle("playing", on);
    fab.querySelector("i").className = "fa-solid " + (on ? "fa-pause" : "fa-music");
  }
  function play() { audio.volume = 0.6; audio.play().then(function () { setPlaying(true); }).catch(function () {}); }
  fab.addEventListener("click", function () {
    if (audio.paused) play(); else { audio.pause(); setPlaying(false); }
  });

  /* Open invitation */
  $("open-btn").addEventListener("click", function () {
    root.classList.replace("is-closed", "is-opened");
    $("intro-overlay").classList.add("intro-hidden");
    $("intro-overlay").setAttribute("aria-hidden", "true");
    if (audio.paused) play();
  });

  /* Petal rain */
  (function () {
    var canvas = document.createElement("canvas");
    canvas.id = "petal-rain-canvas";
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: "1000", opacity: "1" });
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var COLORS = [[226,168,51],[245,212,122],[196,40,64],[245,238,223],[184,131,26],[255,200,180]];
    var rand = function (a, b) { return Math.random() * (b - a) + a; };
    function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
    function make(spreadY) {
      var w = rand(5, 16), c = COLORS[Math.floor(Math.random() * COLORS.length)];
      return { x: rand(0, innerWidth), y: spreadY ? rand(-innerHeight, innerHeight) : rand(-40, -5), w: w, h: w * rand(0.38, 0.62),
        r: c[0], g: c[1], b: c[2], opacity: rand(0.12, 0.52), speed: rand(0.18, 0.55), drift: rand(-0.2, 0.2),
        angle: rand(0, Math.PI * 2), spin: rand(-0.012, 0.012), phase: rand(0, Math.PI * 2), wobble: rand(0.1, 0.4) };
    }
    resize(); addEventListener("resize", resize);
    var petals = []; for (var i = 0; i < 55; i++) petals.push(make(true));
    var t = 0;
    (function draw() {
      t++; ctx.clearRect(0, 0, canvas.width, canvas.height);
      petals.forEach(function (p, idx) {
        p.x += p.drift + Math.sin(t * 0.012 + p.phase) * p.wobble; p.y += p.speed; p.angle += p.spin;
        if (p.x < -30) p.x = canvas.width + 20;
        if (p.x > canvas.width + 30) p.x = -20;
        if (p.y > canvas.height + 30) { p = petals[idx] = make(false); }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle); ctx.globalAlpha = p.opacity;
        var g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.w * 0.6);
        g.addColorStop(0, "rgba(" + p.r + "," + p.g + "," + p.b + "," + p.opacity + ")");
        g.addColorStop(1, "rgba(" + p.r + "," + p.g + "," + p.b + ",0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = p.opacity * 0.35; ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.beginPath(); ctx.ellipse(-p.w * 0.11, -p.h * 0.14, p.w * 0.2, p.h * 0.15, -0.4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });
      requestAnimationFrame(draw);
    })();
  })();

  /* RSVP + confetti */
  function confetti() {
    var colors = ["#e2a833", "#f5d47a", "#b8831a", "#f5eedf", "#9e1e30", "#c42840"];
    var c = $("rsvp-confetti-root"); c.innerHTML = "";
    for (var i = 0; i < 90; i++) {
      var d = document.createElement("span"); d.className = "confetti-dot";
      var size = Math.random() * 10 + 6, a = Math.random() * 2 * Math.PI, dist = Math.random() * 220 + 80;
      d.style.cssText = "background:" + colors[Math.floor(Math.random() * colors.length)] + ";width:" + size + "px;height:" + size +
        "px;border-radius:" + (Math.random() > 0.4 ? "50%" : "2px") + ";--tx:" + Math.cos(a) * dist + "px;--ty:" + Math.sin(a) * dist +
        "px;animation: confetti-burst " + (Math.random() * 0.8 + 0.7) + "s ease-out " + Math.random() * 0.35 + "s forwards;";
      c.appendChild(d);
    }
  }
  function answer(yes) {
    var y = $("attend-yes-btn"), n = $("attend-no-btn");
    y.disabled = n.disabled = true;
    (yes ? y : n).classList.add("is-selected");
    (yes ? y : n).querySelector(".attend-opt-icon").textContent = yes ? "✓" : "✕";
    $(yes ? "attend-thanks" : "attend-regret").hidden = false;
    if (yes) confetti();
  }
  $("attend-yes-btn").addEventListener("click", function () { answer(true); });
  $("attend-no-btn").addEventListener("click", function () { answer(false); });

  /* GSAP animations */
  function waitGsap(cb) { if (window.gsap && window.ScrollTrigger) cb(); else setTimeout(function () { waitGsap(cb); }, 50); }
  waitGsap(function () {
    gsap.registerPlugin(ScrollTrigger);
    gsap.timeline()
      .from(".bismillah-ar span", { opacity: 0, y: 24, filter: "blur(12px)", duration: 1.3, stagger: 0.3, ease: "power3.out" })
      .from(".bismillah-en, .intro-mark, .intro-names, .intro-btn", { opacity: 0, y: 16, duration: 0.8, ease: "power2.out" });
    gsap.utils.toArray("[data-reveal]").forEach(function (el) {
      gsap.from(el, { opacity: 0, y: 50, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
    });
    /* Gallery: clip-path reveal, zoom-out image, alternating slide, then gentle float */
    var frames = gsap.utils.toArray("#gallery-grid .gal-frame");
    frames.forEach(function (fr, i) {
      var img = fr.querySelector("img");
      var tl = gsap.timeline({ scrollTrigger: { trigger: fr, start: "top 90%" }, delay: (i % 2) * 0.15 });
      tl.fromTo(fr, { opacity: 0, x: i % 2 ? 60 : -60, y: 40, clipPath: "inset(0 0 100% 0)" },
        { opacity: 1, x: 0, y: 0, clipPath: "inset(0 0 0% 0)", duration: 1.2, ease: "power3.out",
          onComplete: function () { fr.style.clipPath = "none"; fr.classList.add("is-in"); } })
        .fromTo(img, { scale: 1.35 }, { scale: 1, duration: 1.8, ease: "power2.out", clearProps: "transform" }, 0);
    });
    gsap.utils.toArray("[data-stagger]").forEach(function (group) {
      gsap.from(group.querySelectorAll("[data-stagger-item]"), { opacity: 0, y: 50, duration: 0.9, stagger: 0.2, ease: "power3.out", scrollTrigger: { trigger: group, start: "top 82%" } });
    });
  });
})();
