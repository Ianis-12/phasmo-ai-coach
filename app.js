// --- STATE MANAGEMENT & CONSTANTS ---
const EVIDENCE_TYPES = ["EMF Level 5", "Spirit Box", "Ghost Writing", "Ultraviolet", "Freezing Temperatures", "D.O.T.S. Projector", "Ghost Orb"];

const BEHAVIORAL_TESTS = [
    { ghost: "Wraith", title: "🧂 Testul cu Sare (Eliminare Wraith)", instruction: "Pune sare în pragul camerei și așteaptă un pas al fantomei. Dacă NU lasă urmă în sare, este Wraith. Dacă lasă urmă, Wraith este eliminat.", trigger: (g, s) => g.includes("Wraith") && s.testData?.saltPlaced },
    { ghost: "Gallu", title: "🧂 Testul cu Sare - Gallu Enraged", instruction: "Provocă Gallu în starea Enraged (interacțiuni agresive repetate). În Enraged, Gallu calcă prin sare FĂRĂ să lase urmă. În starea Normal lasă urmă.", trigger: (g, s) => g.includes("Gallu") && s.testData?.saltPlaced },
    { ghost: "Deildegast", title: "🪑 Testul celor 26 de Obiecte", instruction: "Numără obiectele aruncate de fantomă. După 26 de aruncări, Deildegast încetinește permanent la 0.4 m/s. Cronometrează viteza înainte și după.", trigger: (g, s) => g.includes("Deildegast") && s.testData?.huntCount >= 1 },
    { ghost: "Mare", title: "💡 Testul Întrerupătorului (Mare)", instruction: "Aprinde lumina în camera fantomei. Dacă o stinge în sub 1 secundă, este foarte probabil Mare. Mare urăște lumina și preferă camerele întunecate.", trigger: (g, s) => g.includes("Mare") && s.stage >= 3 },
    { ghost: "Jinn", title: "⚡ Testul Tabloului Electric (Jinn)", instruction: "Pornește breaker-ul și stai la 2-3m de fantomă. Dacă viteza crește brusc la ~2.5 m/s, este Jinn. Oprește breaker-ul — Jinn NU poate opri tabloul, deci dacă e oprit, nu e Jinn.", trigger: (g, s) => g.includes("Jinn") && s.tasks?.breakerOn },
    { ghost: "Hantu", title: "❄️ Testul Respirației Înghețate (Hantu)", instruction: "În timpul unui hunt, cu breaker-ul OPRIT, uită-te la fantomă. Hantu are abur/aburi vizibili la gură în camerele reci. De asemenea, Hantu NU poate porni breaker-ul.", trigger: (g, s) => g.includes("Hantu") && s.testData?.huntCount >= 1 },
    { ghost: "Raiju", title: "📱 Testul Electronicelor (Raiju)", instruction: "În timpul hunt-ului, aruncă electronice active (camera, EMF, Spirit Box) lângă fantomă. Dacă viteza crește la ~2.5 m/s, este Raiju. Testul funcționează chiar și cu breaker-ul oprit.", trigger: (g, s) => g.includes("Raiju") && s.testData?.huntCount >= 1 },
    { ghost: "Onryo", title: "🕯️ Testul Lumânărilor (Onryo)", instruction: "Pune 3 lumânări în camera fantomei. Dacă fantoma stinge 3 flăcări și pornește imediat hunt indiferent de sanity, este Onryo. Lumânarea aprinsă acționează ca un crucifix.", trigger: (g, s) => g.includes("Onryo") && s.testData?.candlesInRoom >= 3 },
    { ghost: "Kormos", title: "🏃 Testul Sprintului (Kormos)", instruction: "Kormos este orb și detectează doar sunetul. Sprint în apropierea camerei la sanity ~70% — dacă pornește hunt, este Kormos. Nu te poți ascunde eficient, dar mersul încet te face invizibil.", trigger: (g, s) => g.includes("Kormos") && s.testData?.playerSprinting },
    { ghost: "Revenant", title: "🏃 Testul Vitezei Revenant", instruction: "În hunt, ascunde-te după un colț. Revenant pornește la 1.0 m/s (foarte lent). Când te vede, sare la 3.0 m/s (cel mai rapid din joc). Dacă îl vezi lent apoi exploziv de rapid, este Revenant.", trigger: (g, s) => g.includes("Revenant") && s.testData?.huntCount >= 1 },
    { ghost: "Deogen", title: "👁️ Testul Wallhack (Deogen)", instruction: "Ascunde-te într-un dulap. Deogen știe mereu unde ești — nu poți scăpa prin ascundere. Dar când ajunge lângă tine, încetinește la 0.4 m/s. Ascultă respirația grea pe Spirit Box când e aproape.", trigger: (g, s) => g.includes("Deogen") && s.testData?.hidingSpotOccupied },
    { ghost: "Dayan", title: "🚶 Testul Mișcare-Static (Dayan)", instruction: "În hunt, aleargă. Dayan accelerează la ~2.2 m/s. Oprește-te brusc — Dayan încetinește la ~1.2 m/s. Doar Dayan reacționează la mișcarea ta, nu la distanță.", trigger: (g, s) => g.includes("Dayan") && s.testData?.huntCount >= 1 },
    { ghost: "Aswang", title: "⚡ Testul Accelerației (Aswang)", instruction: "Aswang atinge viteza maximă în ~8.6 secunde (ceilalți ~26s). Dacă te prinde într-un loc de ascundere, hunt-ul se termină imediat și următorul hunt nu mai are perioadă de grație.", trigger: (g, s) => g.includes("Aswang") && s.testData?.hidingSpotSurvived === false },
    { ghost: "Thaye", title: "📿 Testul Ouija (Thaye)", instruction: "Întreabă vârsta pe Ouija Board. Thaye îmbătrânește cu fiecare întrebare. Tinerel: 2.75 m/s, prag hunt 75%. Bătrân: 1.0 m/s, prag 15%. Nu poate îmbătrâni invers.", trigger: (g, s) => g.includes("Thaye") && s.testData?.ouijaAge > 0 },
    { ghost: "Moroi", title: "🔊 Testul Parabolic (Moroi)", instruction: "Ascultă la parabolic mic când vorbește prin Spirit Box. Moroi drenează sanity de 2x mai repede prin audio. Viteza crește pe măsură ce sanity scade (max 3.7 m/s la sanity 0).", trigger: (g, s) => g.includes("Moroi") && s.testData?.parabolicHeardWhisper },
    { ghost: "Phantom", title: "📸 Testul Fotografiei (Phantom)", instruction: "Fotografiază fantoma în timpul unui ghost event. Phantom NU apare în poze. De asemenea, proiecția DOTS nu apare pe cameră. Dacă lipsește din foto, este Phantom.", trigger: (g, s) => g.includes("Phantom") && s.stage >= 3 },
    { ghost: "Obake", title: "✋ Testul celor 6 Degete (Obake)", instruction: "Verifică urma UV cu atenție. Obake lasă amprente cu 6 degete (restul au 5). De asemenea, își schimbă modelul la fiecare 12 clipiri în hunt.", trigger: (g, s) => g.includes("Obake") && s.testData?.uvFingerCount > 0 },
    { ghost: "Oni", title: "👤 Testul Vizibilității (Oni)", instruction: "În hunt, observă cât de vizibilă e fantoma. Oni clipeste foarte rar (aproape solid vizibil). Oni NU face ghost events de tip 'air-ball' — doar manifestări complete.", trigger: (g, s) => g.includes("Oni") && s.testData?.huntCount >= 1 },
    { ghost: "Shade", title: "🌑 Testul Umbrei (Shade)", instruction: "În hunt sau la Summoning Circle, Shade apare doar ca formă transparentă, niciodată ca umbră solidă. De asemenea, Shade NU pornește hunt la sanity peste 35%.", trigger: (g, s) => g.includes("Shade") && s.testData?.huntCount >= 1 },
    { ghost: "The Mimic", title: "🎭 Testul Dovezii False (Mimic)", instruction: "Mimic arată mereu Ghost Orbs ca a 4-a dovadă falsă. Dacă ai 4 dovezi confirmate (inclusiv orbs) și nu e niciun alt ghost cu 4 dovezi, este Mimic. Poate copia abilitățile altor fantome.", trigger: (g, s) => g.includes("The Mimic") && s.selectedEvidence.length >= 3 },
    { ghost: "Goryo", title: "🎥 Testul Cameră-Dubă (Goryo)", instruction: "Pune D.O.T.S. în cameră și o cameră video orientată spre el. Pleacă în dubă. Goryo apare la DOTS DOAR pe cameră și DOAR când nimeni nu e în cameră. Nu își schimbă niciodată camera fantomă.", trigger: (g, s) => g.includes("Goryo") && s.tasks?.cameraSetup },
    { ghost: "Banshee", title: "🎤 Testul Țipătului (Banshee)", instruction: "Ascultă la parabolic mic. Banshee are 33% șansă să scoată un țipăt unic. Vânează un singur jucător-țintă (ceilalți sunt ignorați). Folosește doar model feminin.", trigger: (g, s) => g.includes("Banshee") && s.testData?.parabolicHeardScream },
    { ghost: "Myling", title: "🔇 Testul Pașilor (Myling)", instruction: "În hunt, pașii Myling sunt aproape inaudibili până la ~10m. Pe parabolic mic, în afara hunt-ului, Myling este foarte zgomotos. Contrastează audio hunt vs. audio non-hunt.", trigger: (g, s) => g.includes("Myling") && s.testData?.huntCount >= 1 },
    { ghost: "Demon", title: "😈 Testul Hunt-ului Timpuriu (Demon)", instruction: "Dacă hunt-ul pornește la sanity >70% (sau chiar 100%), este Demon. Cooldown-ul între hunt-uri este doar 20s (restul 25s). Tămâierea ține doar 60s (restul 90s). Crucifixul are rază +50%.", trigger: (g, s) => g.includes("Demon") && s.testData?.sanity > 70 },
    { ghost: "Yokai", title: "🗣️ Testul Vorbirii (Yokai)", instruction: "Vorbește tare lângă fantomă la sanity ~80%. Yokai poate porni hunt la 80% dacă aude voci. În hunt, Yokai este orb la peste 2.5m — poți scăpa stând nemișcat la distanță mică.", trigger: (g, s) => g.includes("Yokai") && s.testData?.sanity > 60 },
    { ghost: "Poltergeist", title: "🧸 Testul Aruncării Multiple (Poltergeist)", instruction: "Fă o stivă de 3-4 obiecte în cameră. Poltergeist le va arunca pe TOATE deodată (polty-bomb). În hunt, aruncă obiecte la fiecare 0.5s. Poate drena 100% sanity dintr-un singur multi-throw.", trigger: (g, s) => g.includes("Poltergeist") && s.testData?.objectsInRoom >= 3 },
    { ghost: "Yurei", title: "🚪 Testul Ușii (Yurei)", instruction: "Yurei închide uși complet fără hunt și drenează 15% sanity (restul 10%). Tămâierea îl blochează în cameră 90 secunde — dacă după tămâiere nu iese din cameră, este Yurei.", trigger: (g, s) => g.includes("Yurei") && s.testData?.doorSlammed },
    { ghost: "The Twins", title: "👯 Testul celor Două Camere (Twins)", instruction: "The Twins pot interacționa în două camere simultan. Dacă vezi EMF 5 în camera A și imediat interacțiune în camera B, este Twins. Decoy-ul merge la 1.5 m/s, principalul la 1.7 m/s.", trigger: (g, s) => g.includes("The Twins") && s.testData?.twoRoomsActive },
    { ghost: "Spirit", title: "🕯️ Testul Cooldown-ului (Spirit)", instruction: "Tămâiază fantoma. Cronometrează următorul hunt. Spirit are cooldown 180s (restul 90s). Dacă după 3 minute nu vine hunt-ul, este Spirit. Spirit nu are alte abilități ascunse — este 'default-ul'.", trigger: (g, s) => g.includes("Spirit") && s.testData?.smudgeUsedAt != null },
    { ghost: "Gallu", title: "🔥 Testul Stărilor (Gallu)", instruction: "Gallu alternează Normal / Enraged / Weakened. Enraged: prag hunt 60%, viteză 1.96 m/s, calcă prin sare fără urmă. Weakened: după tămâiere, slăbește temporar.", trigger: (g, s) => g.includes("Gallu") && s.testData?.ghostStateChanged },
    { ghost: "Obambo", title: "🌗 Testul Calm vs Agresiv (Obambo)", instruction: "Obambo are 2 stări. Calm: prag hunt 10%, viteză 1.45 m/s. Agresiv: prag 65%, viteză 1.96 m/s. Dacă observi o schimbare bruscă de comportament, este Obambo.", trigger: (g, s) => g.includes("Obambo") && s.testData?.ghostStateChanged }
];

let db = { ghosts: {}, maps: {}, items: {} };

let state = {
    name: "Investigator", level: 1, map: "", challenge: "Professional", gender: "Unknown",
    stage: 1,
    tasks: { roomFound: false, breakerOn: false, boneFound: false, itemsDropped: false, cameraSetup: false },
    anomalies: { mistEvent: false, singingEvent: false, turnedOnLight: false, breakerOff: false, breakerOn: false, chaseEvent: false },
    selectedEvidence: [], currentGhosts: [], testResults: {},
    testData: {
        sanity: 100, smudgeUsedAt: null, lastHuntStartedAt: null, huntCount: 0,
        saltPlaced: false, saltStepped: false, saltFootprintVisible: false,
        uvFingerCount: 0, candlesInRoom: 0, candlesExtinguished: 0, objectsInRoom: 0,
        objectsThrownAtOnce: 0, electronicsNearGhost: 0, playerSprinting: false,
        hidingSpotOccupied: false, hidingSpotSurvived: null, ouijaAge: 0,
        modelChangesDuringHunt: 0, parabolicHeardBreathing: false, parabolicHeardScream: false,
        parabolicHeardWhisper: false, spiritBoxResponded: false, ghostTeleported: false,
        ghostVisibleDuringHunt: false, ghostBlinks: 0, doorSlammed: false,
        twoRoomsActive: false, ghostStateChanged: false, photoOfGhostPossible: true,
        dotsVisibleOnCameraOnly: false, dotsVisibleNakedEye: false, ghostChangedRoom: false
    }
};

// Global helper to toggle tasks from checkboxes
window.toggleTask = function(taskKey, isChecked) {
    state.tasks[taskKey] = isChecked;
    updateCoach();
    renderMasterChecklist();
};

window.toggleAnomaly = function(anomalyKey, isChecked) {
    state.anomalies[anomalyKey] = isChecked;
    filterGhosts(); 
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

    if (state.selectedEvidence.length > 0) {
        pool = pool.filter(ghost => {
            const hasStandard = state.selectedEvidence.every(selected => ghost.evidence.includes(selected));
            const isMimicMatch = ghost.name === "The Mimic" && state.selectedEvidence.every(selected => ghost.evidence.includes(selected) || ghost.fakeEvidence === selected);
            return hasStandard || isMimicMatch;
        });
    }

    pool = pool.filter(ghost => {
        if (state.gender === 'Male' && (ghost.name === 'Banshee' || ghost.name === 'Dayan')) return false;
        if (state.anomalies.mistEvent && (ghost.name === 'Oni' || ghost.name === 'Kormos')) return false;
        if (state.anomalies.singingEvent && ghost.name === 'Shade') return false;
        if (state.anomalies.turnedOnLight && ghost.name === 'Mare') return false;
        if (state.anomalies.breakerOff && ghost.name === 'Jinn') return false;
        if (state.anomalies.breakerOn && ghost.name === 'Hantu') return false;
        if (state.anomalies.chaseEvent && ghost.name === 'Kormos') return false;
        
        // Exclude ghosts marked as failed by behavioral tests
        if (state.testResults[ghost.name] === false) return false;

        return true; 
    });

    state.currentGhosts = pool;
    document.getElementById('ghost-count').textContent = state.currentGhosts.length;
    
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

        let pendingTasksHTML = "";
        if (state.stage > 1) {
            if (!state.tasks.breakerOn) pendingTasksHTML += `<label><input type="checkbox" onchange="toggleTask('breakerOn', this.checked)"> Turn on Breaker (${map.breakerLocations.join(' or ')})</label>`;
            if (!state.tasks.boneFound) pendingTasksHTML += `<label><input type="checkbox" onchange="toggleTask('boneFound', this.checked)"> Find & Photograph Bone</label>`;
        }

        if (state.stage === 1) {
            advice += `
                <div class="sys-main">
                    > <b>PRIMARY OBJECTIVE: Locate the ghost room.</b><br>
                    Tip: Sweep cu Thermometrul sau Parabolic Mic. Look for open doors, listen for sounds, or check for thrown objects.
                </div>
                <div class="sys-tip">
                    > <b>SECONDARY TASKS:</b><br>
                    - Grab the car keys.<br>
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
        else if (state.stage === 2 && state.selectedEvidence.length === 0) {
            advice += `
                <div class="sys-main">
                    > <b>STEP 2: ESTABLISH PERIMETER</b><br>
                    Drop your current items in the room. Let's get back to the van and grab a Video Camera, D.O.T.S, and a Ghost Writing Book.
                </div>
                <div class="sys-tip">
                    > <b>TACTICAL TIP:</b> Look around the room with the Video Camera. If you see a door move, record it, then immediately check for UV fingerprints.
                </div>
                <div class="sys-action">
                    <b>> AWAITING DEPLOYMENT:</b>
                    ${pendingTasksHTML}
                    <label><input type="checkbox" onchange="toggleTask('itemsDropped', this.checked)" ${state.tasks.itemsDropped ? 'checked' : ''}> First items dropped</label>
                    <label><input type="checkbox" onchange="toggleTask('cameraSetup', this.checked)" ${state.tasks.cameraSetup ? 'checked' : ''}> Camera & DOTS placed</label>
                    <br><div style="font-size: 12px; color: #aaa;">Input evidence on the left panel to begin Differential Diagnosis...</div>
                </div>`;
        } 
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
        renderBehavioralTests(); // Trigger the behavioral tests render block
    }, 800);
}

// --- BEHAVIORAL TESTS UI HELPERS ---
function getActiveBehavioralTests() {
    const ghostNames = state.currentGhosts.map(g => g.name);
    return BEHAVIORAL_TESTS.filter(test => {
        try {
            return test.trigger(ghostNames, state);
        } catch (e) {
            return false;
        }
    });
}

function renderBehavioralTests() {
    const container = document.getElementById('behavioral-tests');
    if (!container) return;

    const activeTests = getActiveBehavioralTests();

    if (activeTests.length === 0) {
        container.innerHTML = `<div style="color:#888;"><em>> No behavioral tests triggered yet. Assign test data in the console or via advanced UI controls.</em></div>`;
        return;
    }

    container.innerHTML = activeTests.map(test => `
        <div class="test-card" style="
            border-left: 3px solid var(--warning);
            background: rgba(255, 193, 7, 0.05);
            padding: 10px 12px;
            margin-bottom: 10px;
            border-radius: 4px;">
            <div style="font-weight: bold; color: var(--warning); margin-bottom: 4px;">
                ${test.title}
            </div>
            <div style="font-size: 13px; color: #ddd; line-height: 1.4;">
                ${test.instruction}
            </div>
            <div style="margin-top: 8px;">
                <button class="evidence-btn" onclick="markTestResult('${test.ghost}', true)">
                    ✓ Confirms ${test.ghost}
                </button>
                <button class="evidence-btn" onclick="markTestResult('${test.ghost}', false)">
                    ✗ Rules out ${test.ghost}
                </button>
            </div>
        </div>
    `).join('');
}

window.markTestResult = function(ghostName, confirmed) {
    if (!state.testResults) state.testResults = {};
    state.testResults[ghostName] = confirmed;

    if (!confirmed) {
        state.currentGhosts = state.currentGhosts.filter(g => g.name !== ghostName);
        document.getElementById('ghost-count').textContent = state.currentGhosts.length;
    }

    filterGhosts();
    updateCoach();
};

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
    if (gNames.includes("Demon") && state.testData?.sanity > 70) html += `<li><b>DEMON ALERT:</b> Can hunt at ANY sanity. Cooldown is only 20s.</li>`;
    if (gNames.includes("Aswang")) html += `<li><b>ASWANG:</b> Reaches max speed incredibly fast (8.6s). Do not hide in the same spot twice.</li>`;
    
    if (html.endsWith(`<ul style="color:#ddd;">`)) html += `<li>No extreme outlier threats detected based on current ghost pool. Corner peak if necessary.</li>`;
    html += `</ul>`;
    container.innerHTML = html;
}

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
    
    for (let key in state.anomalies) state.anomalies[key] = false;
    document.querySelectorAll('#anomaly-grid input[type="checkbox"]').forEach(chk => chk.checked = false);
    state.testResults = {};

    filterGhosts();
    updateCoach();
});

loadData();