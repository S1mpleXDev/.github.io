document.addEventListener("DOMContentLoaded", async () => {
  const keyBox = document.getElementById("keyBox");
  const copyBtn = document.getElementById("copyBtn");
  const copiedMsg = document.getElementById("copiedMsg");

  // Load key from JSON
  try {
    const res = await fetch("key.json");
    const data = await res.json();
    keyBox.textContent = data.key || "Key not found";
  } catch {
    keyBox.textContent = "Error loading key.";
  }

  // Copy to clipboard
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(keyBox.textContent);
      copiedMsg.classList.add("show");
      setTimeout(() => copiedMsg.classList.remove("show"), 1500);
    } catch {
      alert("Copy failed. Please copy manually.");
    }
  });
});