let completedMinigames = new Set();
const totalMinigames = 5; // Assuming there are 6 minigames in total

function loadMinigameProgress() {
    const savedProgress = localStorage.getItem('completedMinigames');
    if (savedProgress) {
        completedMinigames = new Set(JSON.parse(savedProgress));
    }
    updateMinigameCounter();
}

function saveMinigameProgress() {
    localStorage.setItem('completedMinigames', JSON.stringify(Array.from(completedMinigames)));
}


 export function markMinigameAsCompleted(minigameId) {
    if (!completedMinigames.has(minigameId)) {
        completedMinigames.add(minigameId);
        saveMinigameProgress();
        updateMinigameCounter();
    }
}

function updateMinigameCounter() {
    const counterElement = document.getElementById('minigame-counter');
    if (counterElement) {
        counterElement.textContent = `Minijuegos Completados: ${completedMinigames.size}/${totalMinigames}`;
    }
}

// Load progress 
document.addEventListener('DOMContentLoaded', loadMinigameProgress);