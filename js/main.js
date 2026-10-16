const VIDEOS = {
  "4Cpg04eUIYE": "BEST OF BEST MIXXX",
  "H7m-WpdIF8U": "MUSE v2 (VOID STAR HARDER)",
  oc2q4gsDzuw: "ZERO POINT MIXXX",
  G7N0TrJIxV4: "VOID STAR MIXXX",
  pJySgOU38C4: "NEW WAVE MIXXX",
  OFRBTGKdijE: "HE!L0PA 2",
};

function closePlayers() {
  document.querySelectorAll(".stage").forEach((stage) => {
    stage.hidden = true;
    stage.replaceChildren();
  });
  document.querySelectorAll("[data-video][aria-pressed='true']").forEach((row) => {
    row.setAttribute("aria-pressed", "false");
  });
}

function play(id) {
  if (!Object.prototype.hasOwnProperty.call(VIDEOS, id)) return;

  const row = document.querySelector(`[data-video="${CSS.escape(id)}"]`);
  if (!row) return;

  const stage = row.parentElement.querySelector(".stage");
  const wasOpen = row.getAttribute("aria-pressed") === "true";
  closePlayers();
  if (wasOpen || !stage) return;

  const frameWrap = document.createElement("div");
  frameWrap.className = "frame";

  const frame = document.createElement("iframe");
  frame.src = `https://www.youtube-nocookie.com/embed/${id}?rel=0&autoplay=1`;
  frame.title = VIDEOS[id];
  frame.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  frame.allowFullscreen = true;
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  frameWrap.append(frame);

  const close = document.createElement("button");
  close.type = "button";
  close.className = "close";
  close.textContent = "Close";
  close.addEventListener("click", () => {
    closePlayers();
    row.focus();
  });

  stage.append(frameWrap, close);
  stage.hidden = false;
  row.setAttribute("aria-pressed", "true");
  stage.scrollIntoView({ block: "nearest" });
}

document.querySelectorAll("[data-video]").forEach((row) => {
  row.setAttribute("aria-pressed", "false");
  row.addEventListener("click", (event) => {
    event.preventDefault();
    play(row.getAttribute("data-video"));
  });
});

document.querySelectorAll("[data-play]").forEach((control) => {
  control.addEventListener("click", (event) => {
    const id = control.getAttribute("data-play");
    if (!Object.prototype.hasOwnProperty.call(VIDEOS, id)) return;
    event.preventDefault();
    play(id);
  });
});

const canvas = document.getElementById("stars");
const context = canvas?.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (canvas && context) {
  let stars = [];
  let frame = 0;
  let running = false;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
    const area = window.innerWidth * window.innerHeight;
    const count = Math.max(36, Math.min(Math.round(area / 16000), 140));
    stars = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
      radius: Math.random() * 1.15 + 0.25,
    }));
  }

  function draw(time) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (const star of stars) {
      const drift = reduceMotion.matches ? 0 : time * 0.000008 * (0.25 + star.z);
      const y = (star.y + drift) % 1;
      const indigo = star.z > 0.84;
      context.fillStyle = indigo ? "rgba(150, 132, 230, 0.9)" : "rgba(246, 243, 236, 0.85)";
      context.globalAlpha = 0.3 + star.z * 0.7;
      context.beginPath();
      context.arc(
        star.x * canvas.width,
        y * canvas.height,
        star.radius * Math.min(window.devicePixelRatio || 1, 2),
        0,
        Math.PI * 2,
      );
      context.fill();
    }
    context.globalAlpha = 1;
    if (running) frame = requestAnimationFrame(draw);
  }

  function start() {
    if (running || reduceMotion.matches) return;
    running = true;
    frame = requestAnimationFrame(draw);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(frame);
  }

  resize();
  if (reduceMotion.matches) draw(0);
  else start();

  window.addEventListener("resize", () => {
    resize();
    if (!running) draw(0);
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });
}
