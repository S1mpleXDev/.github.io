// Open Discord
function openDiscord() {
    window.open('https://discord.gg/Kr2pvPfEUR', '_blank');
}

// Load key from JSON
async function loadKey() {
    const keyBox = document.getElementById("keyBox");
    try {
        const response = await fetch("key.json");
        const data = await response.json();
        keyBox.textContent = data.key;
    } catch {
        keyBox.textContent = "Error loading key.";
    }
}

// Copy functionality
const copyBtn = document.getElementById("copyBtn");
const copiedMsg = document.getElementById("copiedMsg");

copyBtn.addEventListener("click", async () => {
    const keyText = document.getElementById("keyBox").innerText;
    try {
        await navigator.clipboard.writeText(keyText);
        copiedMsg.style.display = "block";
        copiedMsg.style.opacity = "1";
        setTimeout(() => {
            copiedMsg.style.opacity = "0";
            setTimeout(() => copiedMsg.style.display = "none", 300);
        }, 1500);
    } catch (err) {
        alert("Failed to copy the key.");
    }
});

// Initialize
loadKey();
