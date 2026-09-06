const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");

const backgroundVideo = document.getElementById("backgroundVideo");

const soundButton = document.getElementById("soundButton");
const soundText = document.getElementById("soundText");

const progressFill = document.getElementById("progressFill");

const heartButton = document.getElementById("heartButton");
const heartMessage = document.getElementById("heartMessage");

const replayButton = document.getElementById("replayButton");

let isMuted = false;
let holdTimer = null;


/* START EXPERIENCE */

startButton.addEventListener("click", async () => {
  document.body.classList.remove("locked");

  backgroundVideo.muted = false;
  backgroundVideo.volume = 0.8;

  try {
    await backgroundVideo.play();
  } catch (error) {
    backgroundVideo.muted = true;
    isMuted = true;
    await backgroundVideo.play();
  }

  startScreen.classList.add("closed");
  soundButton.classList.remove("hidden");

  setTimeout(() => {
    animateHero();
  }, 450);
});


/* HERO ANIMATION */

function animateHero() {
  const heroLines = document.querySelectorAll(
    ".hero-title .line > span"
  );

  heroLines.forEach((line, index) => {
    setTimeout(() => {
      line.style.transition =
        "transform 1.15s cubic-bezier(.22,.7,.18,1)";

      line.style.transform = "translateY(0)";
    }, index * 140);
  });
}


/* SOUND CONTROL */

soundButton.addEventListener("click", () => {
  isMuted = !isMuted;
  backgroundVideo.muted = isMuted;

  soundButton.classList.toggle("muted", isMuted);

  soundText.textContent = isMuted
    ? "Sound off"
    : "Sound on";
});


/* SCROLL PROGRESS */

function updateProgress() {
  const scrollTop =
    window.scrollY ||
    document.documentElement.scrollTop;

  const scrollHeight =
    document.documentElement.scrollHeight -
    window.innerHeight;

  const progress =
    scrollHeight > 0
      ? (scrollTop / scrollHeight) * 100
      : 0;

  progressFill.style.width = `${progress}%`;
}

window.addEventListener(
  "scroll",
  updateProgress,
  { passive: true }
);


/* REVEAL OBSERVER */

const revealElements = document.querySelectorAll(
  `
    .reveal,
    .photo-reveal,
    .word-row,
    .horizontal-card,
    .split-image,
    .cinematic-line,
    .collage-image
  `
);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("visible");

      revealObserver.unobserve(entry.target);
    });
  },
  {
    threshold: 0.14,
    rootMargin: "0px 0px -7% 0px"
  }
);

revealElements.forEach((element) => {
  revealObserver.observe(element);
});


/* TEXT REVEAL */

const revealText = document.querySelector(".reveal-text");

if (revealText) {
  const originalText = revealText.textContent
    .replace(/\s+/g, " ")
    .trim();

  const words = originalText.split(" ");

  revealText.innerHTML = words
    .map((word) => {
      return `
        <span
          class="reveal-word"
          style="
            opacity: .16;
            transition:
              opacity .5s ease,
              transform .5s ease;
            display: inline-block;
            transform: translateY(8px);
          "
        >
          ${word}&nbsp;
        </span>
      `;
    })
    .join("");

  const textWords = revealText.querySelectorAll(
    ".reveal-word"
  );

  function revealWordsOnScroll() {
    const rect = revealText.getBoundingClientRect();

    const viewportHeight = window.innerHeight;

    const start = viewportHeight * 0.82;
    const end = viewportHeight * 0.18;

    const rawProgress =
      (start - rect.top) /
      (start - end);

    const progress = Math.max(
      0,
      Math.min(1, rawProgress)
    );

    const visibleWordCount = Math.floor(
      progress * textWords.length
    );

    textWords.forEach((word, index) => {
      if (index <= visibleWordCount) {
        word.style.opacity = "1";
        word.style.transform = "translateY(0)";
      } else {
        word.style.opacity = "0.16";
        word.style.transform = "translateY(8px)";
      }
    });
  }

  window.addEventListener(
    "scroll",
    revealWordsOnScroll,
    { passive: true }
  );

  revealWordsOnScroll();
}


/* FLOATING PARALLAX */

const floatingCards = document.querySelectorAll(
  ".float-card"
);

function updateFloatingCards() {
  floatingCards.forEach((card) => {
    const speed = Number(
      card.dataset.speed || 0
    );

    const rect = card
      .closest(".floating-section")
      .getBoundingClientRect();

    const movement =
      -rect.top *
      speed *
      1.2;

    card.style.marginTop = `${movement}px`;
  });
}

window.addEventListener(
  "scroll",
  updateFloatingCards,
  { passive: true }
);


/* IMAGE PARALLAX */

const parallaxImages = document.querySelectorAll(
  `
    .statement-photo img,
    .full-photo-wrap img,
    .home-section img,
    .cinematic-image img
  `
);

function updateImageParallax() {
  parallaxImages.forEach((image) => {
    const parent = image.parentElement;

    const rect = parent.getBoundingClientRect();

    if (
      rect.bottom < 0 ||
      rect.top > window.innerHeight
    ) {
      return;
    }

    const centerOffset =
      rect.top +
      rect.height / 2 -
      window.innerHeight / 2;

    const movement = centerOffset * -0.045;

    image.style.transform =
      `scale(1.08) translateY(${movement}px)`;
  });
}

window.addEventListener(
  "scroll",
  updateImageParallax,
  { passive: true }
);


/* DESKTOP HORIZONTAL MOVEMENT */

const horizontalTrack =
  document.querySelector(".horizontal-track");

function updateHorizontalGallery() {
  if (!horizontalTrack) return;

  if (window.innerWidth <= 850) {
    horizontalTrack.style.transform = "none";
    return;
  }

  const section =
    document.querySelector(".horizontal-section");

  const rect = section.getBoundingClientRect();

  const sectionProgress =
    (window.innerHeight - rect.top) /
    (rect.height + window.innerHeight);

  const progress = Math.max(
    0,
    Math.min(1, sectionProgress)
  );

  const maximumMovement =
    Math.max(
      0,
      horizontalTrack.scrollWidth -
      window.innerWidth +
      100
    );

  horizontalTrack.style.transform =
    `translateX(${-progress * maximumMovement}px)`;
}

window.addEventListener(
  "scroll",
  updateHorizontalGallery,
  { passive: true }
);


/* HEART INTERACTION */

function startHeartHold() {
  heartButton.classList.add("holding");

  holdTimer = setTimeout(() => {
    heartMessage.classList.add("active");

    if (
      navigator.vibrate &&
      window.innerWidth <= 850
    ) {
      navigator.vibrate([40, 30, 60]);
    }
  }, 650);
}

function stopHeartHold() {
  clearTimeout(holdTimer);

  heartButton.classList.remove("holding");
}

heartButton.addEventListener(
  "mousedown",
  startHeartHold
);

heartButton.addEventListener(
  "mouseup",
  stopHeartHold
);

heartButton.addEventListener(
  "mouseleave",
  stopHeartHold
);

heartButton.addEventListener(
  "touchstart",
  (event) => {
    event.preventDefault();
    startHeartHold();
  },
  { passive: false }
);

heartButton.addEventListener(
  "touchend",
  stopHeartHold
);


/* CUSTOM CURSOR */

const cursor = document.querySelector(".cursor");
const cursorRing = document.querySelector(".cursor-ring");

let mouseX = 0;
let mouseY = 0;

let ringX = 0;
let ringY = 0;

window.addEventListener("mousemove", (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;

  cursor.style.left = `${mouseX}px`;
  cursor.style.top = `${mouseY}px`;
});

function animateCursorRing() {
  ringX += (mouseX - ringX) * 0.14;
  ringY += (mouseY - ringY) * 0.14;

  cursorRing.style.left = `${ringX}px`;
  cursorRing.style.top = `${ringY}px`;

  requestAnimationFrame(animateCursorRing);
}

animateCursorRing();

const hoverTargets = document.querySelectorAll(
  "button, .word-row, .horizontal-card"
);

hoverTargets.forEach((target) => {
  target.addEventListener("mouseenter", () => {
    cursorRing.classList.add("hovering");
  });

  target.addEventListener("mouseleave", () => {
    cursorRing.classList.remove("hovering");
  });
});


/* REPLAY */

replayButton.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  backgroundVideo.currentTime = 0;

  if (!isMuted) {
    backgroundVideo.play();
  }
});


/* MOBILE TILT EFFECT */

const tiltCards = document.querySelectorAll(
  ".float-card"
);

if (
  window.DeviceOrientationEvent &&
  window.innerWidth <= 850
) {
  window.addEventListener(
    "deviceorientation",
    (event) => {
      const gamma = event.gamma || 0;
      const beta = event.beta || 0;

      const x = Math.max(
        -8,
        Math.min(8, gamma / 5)
      );

      const y = Math.max(
        -8,
        Math.min(8, beta / 10)
      );

      tiltCards.forEach((card, index) => {
        const direction =
          index % 2 === 0 ? 1 : -1;

        card.style.marginLeft =
          `${x * direction}px`;

        card.style.transform +=
          ` translateY(${y * 0.25}px)`;
      });
    },
    { passive: true }
  );
}


/* INITIAL CALLS */

updateProgress();
updateFloatingCards();
updateImageParallax();
updateHorizontalGallery();