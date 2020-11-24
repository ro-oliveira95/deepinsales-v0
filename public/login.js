document.querySelector(".btn-register").addEventListener("click", popWindow);
document
  .querySelector(".faded-background")
  .addEventListener("click", closeWindow);

function popWindow(e) {
  e.preventDefault();
  document.querySelector(".faded-background").style.display = "flex";
  setTimeout(() => {
    document.querySelector(".window-content").style.display = "block";
  }, 600);
}

function closeWindow(e) {
  if (e.target.className == "faded-background") {
    document.querySelector(".faded-background").style.display = "none";
    document.querySelector(".window-content").style.display = "none";
  }
}
