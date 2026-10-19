// --- STATE MANAGEMENT ---
const EVIDENCE_TYPES = ["EMF Level 5", "Spirit Box", "Ghost Writing", "Ultraviolet", "Freezing Temperatures", "D.O.T.S. Projector", "Ghost Orb"];

let db = { ghosts: {}, maps: {}, items: {} };

let state = {
    name: "Investigator", level: 1, map: "", challenge: "Professional", gender: "Unknown",
    stage: 1,
    tasks: { roomFound: false, breakerOn: false, boneFound: false, itemsDropped: false, cameraSetup: false },
    anomalies: { mistEvent: false, singingEvent: false, turnedOnLight: false, breakerOff: false, breakerOn: false, chaseEvent: false },
    selectedEvidence: [], currentGhosts: []
};

// Global helper to toggle tasks from checkboxes
window.toggleTask = function(taskKey, isChecked) {
    state.tasks[taskKey] = isChecked;
    updateCoach();
    renderMasterChecklist();
};

window.toggleAnomaly = function(anomalyKey, isChecked) {
    state.anomalies[anomalyKey] = isChecked;
    filterGhosts(); // Re-filter ghosts based on the new expert rule
    updateCoach();
};

window.advanceStage = function() {
    state.stage++;
    updateCoach();
};

// --- DATA INITIALIZATION ---
async function loadData() {
    try {
        const [ghostRes, mapRes, itemRes] = await Promise.all([
            fetch('./data/ghosts.json'), fetch('./data/maps.json'), fetch('./data/items.json')
        ]);
        db.ghosts = (await ghostRes.json()).ghosts;
        db.maps = (await mapRes.json()).maps;
        db.items = (await itemRes.json()).equipment;
        state.currentGhosts = Object.values(db.ghosts);
        
        populateMapDropdown();
        renderEvidenceButtons();
    } catch (error) { console.error("Error loading JSON.", error); }
}

function populateMapDropdown() {
    const select = document.getElementById('map-select');
    select.innerHTML = ''; 
    const mapNames = Object.keys(db.maps);
    mapNames.sort().forEach(mapName => {
        select.innerHTML += `<option value="${mapName}">${mapName} (${db.maps[mapName].size})</option>`;
    });
}

function startInvestigation() {
    state.map = document.getElementById('map-select').value;
    document.getElementById('setup-modal').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    filterGhosts();
    generateLoadout();
    updateCoach();
    renderMasterChecklist();
}

// --- FILTERING ENGINE (YOUTUBE EXPERT RULES APPLIED) ---
function filterGhosts() {
    let pool = Object.values(db.ghosts);

    // 1. Evidence Filtering
    if (state.selectedEvidence.length > 0) {
        pool = pool.filter(ghost => {
            const hasStandard = state.selectedEvidence.every(selected => ghost.evidence.includes(selected));
            const isMimicMatch = ghost.name === "The Mimic" && state.selectedEvidence.every(selected => ghost.evidence.includes(selected) || ghost.fakeEvidence === selected);
            return hasStandard || isMimicMatch;
        });
    }

    // 2. YouTube Expert Rule Filtering
    pool = pool.filter(ghost => {
        // Banshee and Dayan can only be female
        if (state.gender === 'Male' && (ghost.name === 'Banshee' || ghost.name === 'Dayan')) return false;
        
        // Oni and Kormos are not able to do mist form events
        if (state.anomalies.mistEvent && (ghost.name === 'Oni' || ghost.name === 'Kormos')) return false;
        
        // Shades cannot do singing ghost events
        if (state.anomalies.singingEvent && ghost.name === 'Shade') return false;
        
        // Mares are not able to turn on TVs, computers, light switches, or lamps
        if (state.anomalies.turnedOnLight && ghost.name === 'Mare') return false;
        
        // Jinn cannot turn the breaker off
        if (state.anomalies.breakerOff && ghost.name === 'Jinn') return false;
        
        // Hantu cannot turn the breaker on
        if (state.anomalies.breakerOn && ghost.name === 'Hantu') return false;

        // Kormos cannot do chasing ghost events
        if (state.anomalies.chaseEvent && ghost.name === 'Kormos') return false;

        return true; 
    });

    state.currentGhosts = pool;
    document.getElementById('ghost-count').textContent = state.currentGhosts.length;
    
    // Update UI Cards
    const container = document.getElementById('ghost-list');
    container.innerHTML = '';
    state.currentGhosts.forEach(ghost => {
        container.innerHTML += `<div class="ghost-card"><h3>${ghost.name}</h3><p>Ev: ${ghost.evidence.join(', ')}</p></div>`;
    });
}

function updateGender() {
    state.gender = document.getElementById('gender-select').value;
    filterGhosts();
    updateCoach();
}

// --- THE AI BRAIN ---
function updateCoach() {
    const feed = document.getElementById('coach-feed');
    feed.innerHTML = `<div style="color:#888;"><em>> System: Processing environmental telemetry...</em></div>`;

    setTimeout(() => {
        let advice = "";
        const map = db.maps[state.map] || { breakerLocations: ["Unknown"] };
        const gCount = state.currentGhosts.length;

        // Missing Tasks Backlog
        let pendingTasksHTML = "";
        if (state.stage > 1) {
            if (!state.tasks.breakerOn) pendingTasksHTML += `<label><input type="checkbox" onchange="toggleTask('breakerOn', this.checked)"> Turn on Breaker (${map.breakerLocations.join(' or ')})</label>`;
            if (!state.tasks.boneFound) pendingTasksHTML += `<label><input type="checkbox" onchange="toggleTask('boneFound', this.checked)"> Find & Photograph Bone</label>`;
        }

        // --- STAGE 1: ENTRY & SWEEP ---
        if (state.stage === 1) {
            advice += `
                <div class="sys-main">
                    > <b>PRIMARY OBJECTIVE: Locate the ghost room.</b><br>
                    Tip: Sweep with the Thermometer or Parabolic Mic. Look for open doors, listen for sounds, or check for thrown objects.
                </div>
                <div class="sys-tip">
                    > <b>SECONDARY TASKS:</b><br>
                    - Don't forget to grab the car keys.<br>
                    - Keep an eye out for the Bone.<br>
                    - <b>Breaker Location:</b> ${map.breakerLocations.join(' OR ')}.
                </div>
                <div class="sys-action">
                    <b>> AWAITING CONFIRMATION:</b>
                    <label><input type="checkbox" onchange="toggleTask('roomFound', this.checked)" ${state.tasks.roomFound ? 'checked' : ''}> Room Found</label>
                    <label><input type="checkbox" onchange="toggleTask('breakerOn', this.checked)" ${state.tasks.breakerOn ? 'checked' : ''}> Breaker is ON</label>
                    <label><input type="checkbox" onchange="toggleTask('boneFound', this.checked)" ${state.tasks.boneFound ? 'checked' : ''}> Bone Found</label>
                    
                    <button class="stage-btn" onclick="advanceStage()" ${!state.tasks.roomFound ? 'disabled style="opacity:0.5;"' : ''}>Next Step: Secure Room</button>
                </div>`;
        } 
        
        // --- STAGE 2: SECURING PERIMETER ---
        else if (state.stage === 2 && state.selectedEvidence.length === 0) {
            advice += `
                <div class="sys-main">
                    > <b>STEP 2: ESTABLISH PERIMETER</b><br>
                    Drop your current items in the room. Let's get back to the van and grab a Video Camera, D.O.T.S, and a Ghost Writing Book.
                </div>
                <div class="sys-tip">
                    > <b>TACTICAL TIP:</b> Look around the room with the Video Camera. If you see a door move, record it, then immediately check for UV fingerprints. Remember: turning ON the room light stops Spirit Box responses.
                </div>
                <div class="sys-action">
                    <b>> AWAITING DEPLOYMENT:</b>
                    ${pendingTasksHTML}
                    <label><input type="checkbox" onchange="toggleTask('itemsDropped', this.checked)" ${state.tasks.itemsDropped ? 'checked' : ''}> First items dropped</label>
                    <label><input type="checkbox" onchange="toggleTask('cameraSetup', this.checked)" ${state.tasks.cameraSetup ? 'checked' : ''}> Camera & DOTS placed</label>
                    <br><div style="font-size: 12px; color: #aaa;">Input evidence on the left panel to begin Differential Diagnosis...</div>
                </div>`;
        } 
        
        // --- STAGE 3: DIFFERENTIAL DIAGNOSIS ---
        else {
            advice += `<div class="sys-main">> <b>STAGE 3: DIFFERENTIAL DIAGNOSIS</b></div>`;
            if (pendingTasksHTML) advice += `<div class="sys-action" style="margin-bottom:15px; border-color:var(--warning);"><b>> PENDING BACKLOG:</b>${pendingTasksHTML}</div>`;

            if (gCount === 0) {
                advice += `<div class="sys-main" style="color:var(--danger);">> <b>CRITICAL ERROR:</b> No entities match this data. Check for a Mimic or reset evidence.</div>`;
            } else if (gCount === 1) {
                const ghost = state.currentGhosts[0];
                advice += `
                    <div class="sys-main" style="color:var(--danger); border-left: 4px solid var(--danger); padding-left:10px;">
                        > <b>MATCH CONFIRMED: ${ghost.name.toUpperCase()}</b><br>
                        > <b>ABILITY:</b> ${ghost.uniqueAbilities ? ghost.uniqueAbilities[0] : "Unknown"}<br>
                        > <b>STRATEGY:</b> ${ghost.testingStrategies ? ghost.testingStrategies[0] : "Proceed with caution."}
                    </div>`;
            } else if (gCount <= 5) {
                let tests = "";
                state.currentGhosts.forEach(g => {
                    if (g.behavioralTells) {
                        const tellKey = Object.keys(g.behavioralTells)[0]; 
                        tests += `<li style="margin-bottom: 5px;"><b>If ${g.name}:</b> ${g.behavioralTells[tellKey]}</li>`;
                    }
                });
                advice += `<div class="sys-tip" style="color:var(--warning);">> <b>OBSERVE THE FOLLOWING:</b><ul style="padding-left:20px;">${tests}</ul></div>`;
            } else {
                advice += `<div class="sys-main">> <b>DATA PROCESSING:</b> ${gCount} entities remain. Continue systematic evidence gathering. Watch out for unique events below.</div>`;
            }
        }

        feed.innerHTML = advice;
        updateHuntProtocols(); 
    }, 800);
}

function renderMasterChecklist() {
    const container = document.getElementById('master-checklist');
    const tasks = [
        { id: 'roomFound', label: 'Room Found' }, { id: 'breakerOn', label: 'Breaker ON' },
        { id: 'boneFound', label: 'Bone Found' }, { id: 'cameraSetup', label: 'Camera/DOTS Placed' }
    ];
    let html = "";
    tasks.forEach(t => {
        const isChecked = state.tasks[t.id] ? 'checked' : '';
        const color = state.tasks[t.id] ? '#81c784' : '#ccc';
        html += `<label style="color:${color};"><input type="checkbox" onchange="toggleTask('${t.id}', this.checked)" ${isChecked}> ${t.label}</label>`;
    });
    container.innerHTML = html;
}

function updateHuntProtocols() {
    const container = document.getElementById('hunt-protocols');
    const gNames = state.currentGhosts.map(g => g.name);
    let html = `<b style="color:var(--danger);">General Survival:</b> Break line of sight twice. Stay quiet. Turn off electronics in hand.<br><br><b style="color:var(--warning);">Entity Specifics:</b><ul style="color:#ddd;">`;

    if (gNames.includes("Deogen")) html += `<li><b>DEOGEN:</b> Do NOT hide. It has wallhacks. Loop it around a table.</li>`;
    if (gNames.includes("Revenant")) html += `<li><b>REVENANT:</b> If it senses your electronics/voice, it moves at 3.0m/s. Break line of sight immediately.</li>`;
    if (gNames.includes("Banshee")) html += `<li><b>BANSHEE:</b> Only targets one player. If you are not the target, you can safely take photos during a hunt.</li>`;
    if (gNames.includes("Demon") && state.sanity > 70) html += `<li><b>DEMON ALERT:</b> Can hunt at ANY sanity. Cooldown is only 20s.</li>`;
    if (gNames.includes("Aswang")) html += `<li><b>ASWANG:</b> Reaches max speed incredibly fast (8.6s). Do not hide in the same spot twice.</li>`;
    
    if (html.endsWith(`<ul style="color:#ddd;">`)) html += `<li>No extreme outlier threats detected based on current ghost pool. Corner peak if necessary.</li>`;
    html += `</ul>`;
    container.innerHTML = html;
}

// --- SMART LOADOUT GENERATOR ---
function generateLoadout() {
    const container = document.getElementById('loadout-tips');
    const map = db.maps[state.map];
    let html = `<p style="color: #aaa; margin-bottom: 10px;">Optimized for <b>${map.size}</b> operations.</p><ul>`;

    if (map.size === "Large" || map.size === "Medium") {
        html += `
            <li><b>Parabolic Microphone</b> - Essential for finding the room from a distance.</li>
            <li><b>Tier 3 Flashlights</b> - Required for navigating massive corridors.</li>
            <li><b>Thermometer</b> - Secondary verification for sweeping blocks.</li>
            <li><b>Sanity Pills</b> - Extreme travel distances will drain sanity rapidly.</li>`;
    } else {
        html += `
            <li><b>EMF Reader</b> - Drop near doorways for passive tracking.</li>
            <li><b>Thermometer</b> - Fastest way to pinpoint the exact room.</li>
            <li><b>Video Camera & Tripod</b> - Set up immediately to catch D.O.T.S or Orbs safely from the van.</li>
            <li><b>Crucifix</b> - Deploy immediately upon finding the room.</li>`;
    }
    html += `</ul>`;
    container.innerHTML = html;
}

function renderEvidenceButtons() {
    const container = document.getElementById('evidence-buttons');
    EVIDENCE_TYPES.forEach(ev => {
        const btn = document.createElement('button');
        btn.textContent = ev;
        btn.classList.add('evidence-btn');
        btn.addEventListener('click', () => {
            if (state.selectedEvidence.includes(ev)) {
                state.selectedEvidence = state.selectedEvidence.filter(e => e !== ev);
                btn.classList.remove('active');
            } else {
                if (state.selectedEvidence.length < 3) {
                    state.selectedEvidence.push(ev);
                    btn.classList.add('active');
                } else { return; }
            }
            filterGhosts();
            updateCoach(); 
        });
        container.appendChild(btn);
    });
}

document.getElementById('reset-btn').addEventListener('click', () => {
    state.selectedEvidence = [];
    document.querySelectorAll('.evidence-btn').forEach(btn => btn.classList.remove('active'));
    
    // Optional: Reset anomalies too
    for (let key in state.anomalies) state.anomalies[key] = false;
    document.querySelectorAll('#anomaly-grid input[type="checkbox"]').forEach(chk => chk.checked = false);

    filterGhosts();
    updateCoach();
});

// Boot up the system
loadData();