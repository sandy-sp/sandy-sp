document.addEventListener("DOMContentLoaded", () => {
  const tiles = document.querySelectorAll(".box-wrapper");
  const popup = document.getElementById("popup");
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  document.body.appendChild(overlay);

  tiles.forEach((tile) => {
    tile.addEventListener("click", () => {
      popup.classList.add("active");
      overlay.classList.add("active");
    });
  });

  overlay.addEventListener("click", () => {
    popup.classList.remove("active");
    overlay.classList.remove("active");
  });
});