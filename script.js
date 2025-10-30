// Open Discord
function openDiscord() {
    window.open('https://discord.gg/Kr2pvPfEUR', '_blank');
}

// Load JSON code dynamically
async function loadCode() {
    try {
        const response = await fetch('code.json');
        const data = await response.json();
        const codeContent = document.getElementById('codeContent');
        codeContent.textContent = data.code; // expects { "code": "your code here" }
    } catch (error) {
        document.getElementById('codeContent').textContent = "// Failed to load code";
        console.error(error);
    }
}

// Copy code functionality
document.getElementById('copyBtn').addEventListener('click', () => {
    const code = document.getElementById('codeContent').innerText;
    navigator.clipboard.writeText(code).then(() => {
        const msg = document.getElementById('copiedMsg');
        msg.style.display = 'inline';
        setTimeout(() => {
            msg.style.opacity = 1;
            setTimeout(() => {
                msg.style.opacity = 0;
                setTimeout(() => msg.style.display = 'none', 500);
            }, 1200);
        }, 50);
    }).catch(err => alert("Failed to copy: " + err));
});

// Initialize
loadCode();
