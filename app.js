const EVIDENCE_TYPES = ["EMF Level 5", "Spirit Box", "Ghost Writing", "Ultraviolet", "Freezing Temperatures", "D.O.T.S. Projector", "Ghost Orb"];

let allGhosts = {};
let mapData = {};
let currentGhosts = [];
let selectedEvidence = [];

let gameContext = {
    name: "",
    level: 1,
    map: "",
    challenge: "",
    gender: "Unknown",
    sanity: 100,
    roomFound: false,
    boneFound: false
};

// 1. Load Data
async function loadData() {
    try {
        const [ghostRes, mapRes] = await Promise.all([
            fetch('./data/ghosts.json'),
            fetch('./data/maps.json')
        ]);
        const ghostData = await ghostRes.json();
        const maps = await mapRes.json();
        
        allGhosts = ghostData.ghosts;
        mapData = maps.maps;
        
        renderEvidenceButtons();
    } catch (error) {
        console.error("Error loading JSON.", error);
    }
}

// 2. Transition from Lobby to Truck
function startInvestigation() {
    gameContext.name = document.getElementById('player-name').value || "Investigator";
    gameContext.level = parseInt(document.getElementById('player-level').value);
    gameContext.map = document.getElementById('map-select').value;
    gameContext.challenge = document.getElementById('challenge-select').value;

    // Update UI
    document.getElementById('setup-modal').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    
    // Update Header Info
    document.getElementById('header-info').innerHTML = 
        `<span>👤 ${gameContext.name} | Lvl ${gameContext.level}</span> &nbsp;|&nbsp; 
         <span style="color:var(--accent);">📍 ${gameContext.map}</span> &nbsp;|&nbsp; 
         <span style="color:var(--warning);">🔥 ${gameContext.challenge}</span>`;

    // Generate initial advice
    updateCoach();
    generateLoadout();
}

// 3. Filtering Logic
function filterGhosts() {
    let pool = Object.values(allGhosts);

    if (gameContext.gender === 'Male') {
        pool = pool.filter(ghost => ghost.name !== 'Banshee' && ghost.name !== 'Dayan');
    }

    if (selectedEvidence.length > 0) {
        pool = pool.filter(ghost => 
            selectedEvidence.every(selected => ghost.evidence.includes(selected))
        );
    }

    currentGhosts = pool;
    document.getElementById('ghost-count').textContent = currentGhosts.length;
    
    // Update Ghost Cards
    const container = document.getElementById('ghost-list');
    container.innerHTML = '';
    currentGhosts.forEach(ghost => {
        const card = document.createElement('div');
        card.classList.add('ghost-card');
        card.innerHTML = `<h3>${ghost.name}</h3><p>Ev: ${ghost.evidence.join(', ')}</p>`;
        container.appendChild(card);
    });
}

// 4. Update Gender from Right Panel
function updateGender() {
    gameContext.gender = document.getElementById('gender-select').value;
    filterGhosts();
    updateCoach();
}

// 5. The Coach Brain
function updateCoach() {
    const feed = document.getElementById('coach-feed');
    feed.innerHTML = ''; 

    let advice = "";

    // --- LOBBY/TRUCK ADVICE ---
    if (!gameContext.roomFound) {
        advice += `<div class="coach-msg tip"><strong>🚐 FIND THE ROOM:</strong> Sweep the map. Use the Parabolic Mic or Thermometer. Do not waste sanity.</div>`;
        
        const currentMapData = mapData[gameContext.map];
        if (currentMapData) {
            advice += `<div class="coach-msg warning"><strong>🗺️ Map Intel:</strong> Breaker is located at: <b>${currentMapData.breakerLocations.join(' OR ')}</b>. Turn it on!</div>`;
        }
    } else {
        // --- IN ROOM ADVICE ---
        advice += `<div class="coach-msg tip"><strong>🛠️ ROOM FOUND:</strong> Place your Crucifix immediately. Start dropping your evidence tools.</div>`;
        
        if (!gameContext.boneFound) {
            advice += `<div class="coach-msg warning"><strong>🦴 BONE MISSING:</strong> Remember to look for the bone before you leave!</div>`;
        }

        // Behavioral Tests based on remaining ghosts
        const remainingNames = currentGhosts.map(g => g.name);
        
        if (remainingNames.includes("Wraith")) {
            advice += `<div class="coach-msg warning"><strong>🧪 WRAITH TEST:</strong> Place salt at the door. If it steps in it, rule out Wraith.</div>`;
        }
        if (remainingNames.includes("Demon") && gameContext.sanity > 70) {
            advice += `<div class="coach-msg danger"><strong>⚠️ DEMON WARNING:</strong> Demon can hunt at ANY sanity.</div>`;
        }
        if (remainingNames.includes("Deogen")) {
            advice += `<div class="coach-msg warning"><strong>🏃 DEOGEN TEST:</strong> Do not hide. Loop a table.</div>`;
        }
    }

    // If we have an impossible evidence combination
    if (currentGhosts.length === 0) {
        advice = `<div class="coach-msg danger"><strong>IMPOSSIBLE EVIDENCE:</strong> Check for Mimic (Fake Orbs) or reset your evidence.</div>`;
    }

    feed.innerHTML = advice;
}

// 6. Generate Loadout Box on the Right
function generateLoadout() {
    const container = document.getElementById('loadout-tips');
    const currentMapData = mapData[gameContext.map];
    let html = "";

    if (currentMapData.size === "Large") {
        html = `
            <p><b>Map Size:</b> Large</p>
            <ul>
                <li><b>Parabolic Microphone / Sound Sensors</b> (Find the room fast)</li>
                <li><b>Flashlight</b> (Essential)</li>
                <li><b>Thermometer</b> (Check adjacent rooms)</li>
                <li><b>Crucifix</b> (Defense)</li>
            </ul>`;
    } else {
        html = `
            <p><b>Map Size:</b> Small</p>
            <ul>
                <li><b>EMF Reader</b> (Drop near room)</li>
                <li><b>Thermometer</b> (Quick sweep)</li>
                <li><b>Ghost Writing / D.O.T.S.</b> (Easy evidence)</li>
                <li><b>Flashlight</b></li>
            </ul>`;
    }
    container.innerHTML = html;
}

// 7. UI Helpers
function renderEvidenceButtons() {
    const container = document.getElementById('evidence-buttons');
    EVIDENCE_TYPES.forEach(evidence => {
        const btn = document.createElement('button');
        btn.textContent = evidence;
        btn.classList.add('evidence-btn');
        btn.addEventListener('click', () => {
            if (selectedEvidence.includes(evidence)) {
                selectedEvidence = selectedEvidence.filter(e => e !== evidence);
                btn.classList.remove('active');
            } else {
                selectedEvidence.push(evidence);
                btn.classList.add('active');
            }
            filterGhosts();
            updateCoach(); 
        });
        container.appendChild(btn);
    });
}

// 8. Event Listeners (Checkboxes, Sliders, Reset)
document.getElementById('chk-room').addEventListener('change', (e) => {
    gameContext.roomFound = e.target.checked;
    updateCoach();
});

document.getElementById('chk-bone').addEventListener('change', (e) => {
    gameContext.boneFound = e.target.checked;
    updateCoach();
});

document.getElementById('reset-btn').addEventListener('click', () => {
    selectedEvidence = [];
    document.querySelectorAll('.evidence-btn').forEach(btn => btn.classList.remove('active'));
    filterGhosts();
    updateCoach();
});

// Initialize
loadData();