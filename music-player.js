const audio = document.getElementById("background-music");
const button = document.getElementById("music-toggle");
const icon = button.querySelector("img");
const playIcon = "assets/play-solid-full.svg";
const pauseIcon = "assets/pause-solid-full.svg";
let hasStarted = !audio.paused;

function updateButton() {
  const playing = !audio.paused && !audio.ended;
  const label = playing ? "Pause background music" : "Play background music";
  button.setAttribute("aria-label", label);
  button.setAttribute("aria-pressed", String(playing));
  button.title = label;
  icon.src = playing ? pauseIcon : playIcon;
}

button.addEventListener("click", async () => {
  if (audio.paused) {
    try {
      await audio.play();
    } catch {
      updateButton();
      return;
    }
  } else {
    audio.pause();
  }
  updateButton();
});

document.addEventListener("click", (event) => {
  if (!event.isTrusted || button.contains(event.target) || hasStarted || !audio.paused) return;

  audio.play().then(() => {
    hasStarted = true;
    updateButton();
  }).catch(updateButton);
});

audio.addEventListener("play", () => {
  hasStarted = true;
  updateButton();
});
audio.addEventListener("pause", updateButton);
audio.addEventListener("ended", updateButton);
updateButton();
