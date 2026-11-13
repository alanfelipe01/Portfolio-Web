(() => {
    const config = {
        storageKey: "alan-portfolio:glitch-autostart",
        decisionMin: 1800,
        decisionMax: 3500,
        walkMin: 96,
        walkMax: 240,
        walkClearance: 32,
        walkChance: .75,
        maxRestDecisions: 1,
        walkSpeed: 60,
        walkAcceleration: 120,
        walkStepLength: 18,
        obstacleMargin: 6,
        attentionRadius: 150,
        attentionDuration: 2500,
        attentionCooldown: 3500,
        sleepAfter: 60000,
        startupSleepDuration: 3000,
        wakeDuration: 700,
        stretchDuration: 1200,
        spontaneousStretchChance: .15,
        microGlitchMin: 150,
        microGlitchMax: 300,
        mediumGlitchMin: 400,
        mediumGlitchMax: 700,
        strongGlitchDuration: 800,
        strongGlitchCooldown: 20000,
        multiClickWindow: 2000,
        reducedReactionDuration: 600,
        clickReactionCooldown: 600,
        spontaneousGlitchInterval: 6000,
        spontaneousMediumChance: .35,
        retreatMin: 48,
        retreatMax: 96
    };
    const desktop = document.querySelector(".desktop");
    const taskbar = document.querySelector(".taskbar");
    const shortcut = document.getElementById("glitch-shortcut");
    const mascot = document.getElementById("glitch-mascot");
    const interactButton = document.getElementById("glitch-interact");
    const status = document.getElementById("glitch-status");
    const autoStartControl = document.getElementById("glitch-autostart");
    const storageMessage = document.getElementById("glitch-storage-message");
    const assetMessage = document.getElementById("glitch-asset-message");
    const pauseButton = document.getElementById("glitch-pause");
    const hideButton = document.getElementById("glitch-hide");
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const poses = {
        base: document.getElementById("glitch-sprite"),
        right: document.getElementById("glitch-walk-right"),
        rightNext: document.getElementById("glitch-walk-right-next"),
        left: document.getElementById("glitch-walk-left"),
        leftNext: document.getElementById("glitch-walk-left-next"),
        watch: document.getElementById("glitch-watch"),
        watchLeft: document.getElementById("glitch-watch-left"),
        sleep: document.getElementById("glitch-sleep"),
        wake: document.getElementById("glitch-wake"),
        stretch: document.getElementById("glitch-stretch")
    };
    const poseReady = {};

    let autoStart = true;
    let storageAvailable = true;
    try {
        autoStart = localStorage.getItem(config.storageKey) !== "false";
    } catch {
        storageAvailable = false;
    }

    // Só o início automático é persistido. Pausa e visibilidade são da visita.
    let visible = autoStart;
    let paused = false;
    let spriteFailed = false;
    let pageFocused = document.hasFocus();
    let hasSpace = false;
    let position = null;
    let geometry = null;
    let geometryDirty = true;
    let activity = "idle";
    let walkTarget = null;
    let walkDirection = "right";
    let walkFrameIndex = 0;
    let walkLastTime = null;
    let walkVelocity = 0;
    let walkTravelled = 0;
    let watchDirection = "watch";
    let decisionTimer = null;
    let decisionPending = false;
    let consecutiveRests = 0;
    let attentionTimer = null;
    let glitchTimer = null;
    let spontaneousGlitchTimer = null;
    let spontaneousEffectTimer = null;
    let sleepTimer = null;
    let startupWakeTimer = null;
    let routineTimer = null;
    let walkFrame = null;
    let layoutFrame = null;
    let lastAttentionAt = -Infinity;
    let lastClickReactionAt = -Infinity;
    let lastStrongGlitchAt = -Infinity;
    let clickTimes = [];
    let entrancePending = autoStart;
    let startupWakePending = false;
    let lastInteractionAt = performance.now();
    let sleepRequested = false;
    let pendingWindowAttention = null;

    function canInteract() {
        return visible && poseReady.base && hasSpace && pageFocused && !document.hidden && !paused;
    }

    function canAct() {
        return canInteract() && !motionPreference.matches && activity !== "sleeping";
    }

    function updateControls() {
        autoStartControl.checked = autoStart;
        status.textContent = !visible ? "Oculto" : spriteFailed ? "Indisponível" : paused ? "Pausado" :
            activity === "sleeping" ? "Dormindo" : "Ativo";
        pauseButton.textContent = paused ? "Continuar" : "Pausar";
        pauseButton.disabled = !visible || spriteFailed;
        hideButton.disabled = !visible;
        assetMessage.hidden = !spriteFailed;
        shortcut.setAttribute("aria-label", visible ? "Abrir opções do Glitch" : "Mostrar Glitch");
        const interactionLabel = activity === "sleeping" ? "Acordar Glitch" : "Interagir com Glitch";
        interactButton.setAttribute("aria-label", interactionLabel);
        interactButton.setAttribute("title", interactionLabel);
        storageMessage.textContent = storageAvailable
            ? "Sua preferência fica salva neste navegador."
            : "Não foi possível salvar. Sua escolha vale somente nesta visita.";
    }

    function renderPose() {
        let selected = ["base"];
        let combinedStep = false;
        if (activity === "observing" && poseReady[watchDirection]) selected = [watchDirection];
        if (activity === "sleeping" && poseReady.sleep) selected = ["sleep"];
        if (activity === "waking" && poseReady.wake) selected = ["wake"];
        if (activity === "stretching" && poseReady.stretch) selected = ["stretch"];
        if (activity === "walking") {
            const steady = walkDirection + "Next";
            if (poseReady[steady]) {
                selected = [steady];
                if (walkFrameIndex === 1 && poseReady[walkDirection]) {
                    selected.push(walkDirection);
                    combinedStep = true;
                }
            }
        }
        Object.entries(poses).forEach(([name, image]) => {
            image.hidden = !selected.includes(name);
        });
        mascot.dataset.state = activity;
        mascot.dataset.walkFrame = combinedStep ? "1" : "0";
    }

    function cancelDecision() {
        if (decisionTimer !== null) clearTimeout(decisionTimer);
        decisionTimer = null;
        decisionPending = false;
    }

    function stopActivities() {
        const keepSleeping = visible && activity === "sleeping";
        cancelDecision();
        if (attentionTimer !== null) clearTimeout(attentionTimer);
        if (glitchTimer !== null) clearTimeout(glitchTimer);
        if (spontaneousGlitchTimer !== null) clearTimeout(spontaneousGlitchTimer);
        if (spontaneousEffectTimer !== null) clearTimeout(spontaneousEffectTimer);
        if (sleepTimer !== null) clearTimeout(sleepTimer);
        if (startupWakeTimer !== null) clearTimeout(startupWakeTimer);
        if (routineTimer !== null) clearTimeout(routineTimer);
        if (walkFrame !== null) cancelAnimationFrame(walkFrame);
        attentionTimer = null;
        glitchTimer = null;
        spontaneousGlitchTimer = null;
        spontaneousEffectTimer = null;
        sleepTimer = null;
        startupWakeTimer = null;
        routineTimer = null;
        sleepRequested = false;
        pendingWindowAttention = null;
        clickTimes = [];
        mascot.dataset.glitch = "";
        walkFrame = null;
        walkTarget = null;
        walkLastTime = null;
        walkVelocity = 0;
        walkTravelled = 0;
        walkFrameIndex = 0;
        activity = keepSleeping ? "sleeping" : "idle";
        renderPose();
        updateControls();
    }

    function enterSleep() {
        if (!canInteract() || activity === "sleeping") return false;
        stopActivities();
        activity = "sleeping";
        sleepRequested = false;
        renderPose();
        updateControls();
        mascot.classList.toggle("is-active", canInteract() && !motionPreference.matches);
        return true;
    }

    function tryEnterSleep() {
        if (!canInteract() || activity === "sleeping") return false;
        if (!sleepRequested && performance.now() - lastInteractionAt < config.sleepAfter) return false;
        return enterSleep();
    }

    function scheduleSleepCheck() {
        if (!canInteract() || activity === "sleeping" || sleepTimer !== null) return;
        const remaining = config.sleepAfter - (performance.now() - lastInteractionAt);
        if (remaining <= 0) {
            if (activity === "idle" || activity === "sitting") enterSleep();
            else sleepRequested = true;
            return;
        }
        sleepTimer = setTimeout(() => {
            sleepTimer = null;
            scheduleSleepCheck();
        }, remaining);
    }

    function notePageInteraction() {
        if (!visible || paused || !pageFocused || document.hidden || activity === "sleeping") return;
        lastInteractionAt = performance.now();
        sleepRequested = false;
        scheduleSleepCheck();
    }

    function finishRoutine() {
        routineTimer = null;
        activity = "idle";
        renderPose();
        updateControls();
        if (tryEnterSleep()) return;
        scheduleSpontaneousGlitch();
        if (decisionPending) {
            decisionPending = false;
            takeDecision();
        } else {
            scheduleDecision();
        }
        scheduleSleepCheck();
    }

    function startStretch() {
        if (!canAct() || !poseReady.stretch) return false;
        activity = "stretching";
        renderPose();
        routineTimer = setTimeout(finishRoutine, config.stretchDuration);
        return true;
    }

    function wakeGlitch() {
        if (!canInteract() || activity !== "sleeping") return;
        if (startupWakeTimer !== null) clearTimeout(startupWakeTimer);
        startupWakeTimer = null;
        startupWakePending = false;
        clickTimes = [];
        lastInteractionAt = performance.now();
        sleepRequested = false;
        if (motionPreference.matches || !poseReady.wake) {
            activity = "idle";
            renderPose();
            updateControls();
            syncActivity();
            return;
        }
        activity = "waking";
        renderPose();
        updateControls();
        routineTimer = setTimeout(() => {
            routineTimer = null;
            if (!startStretch()) finishRoutine();
        }, config.wakeDuration);
        scheduleSleepCheck();
    }

    function startGlitch(kind, source, retreatDirection = null) {
        const fromVisitor = source === "click" || source === "triple";
        const now = performance.now();
        if (!canInteract() || ["sleeping", "waking", "stretching"].includes(activity) ||
            (!fromVisitor && motionPreference.matches)) return false;
        if (kind === "strong" && now - lastStrongGlitchAt < config.strongGlitchCooldown) return false;

        // Só a falha forte dos três cliques pode substituir uma microfalha em curso.
        if (activity === "glitching") {
            const replaceMicro = kind === "strong" && source === "triple" &&
                (mascot.dataset.glitch === "micro" || mascot.dataset.glitch === "reduced");
            if (!replaceMicro) return false;
            if (glitchTimer !== null) clearTimeout(glitchTimer);
            glitchTimer = null;
        }

        if (spontaneousEffectTimer !== null) {
            clearTimeout(spontaneousEffectTimer);
            spontaneousEffectTimer = null;
            mascot.dataset.glitch = "";
        }

        // Uma interação interrompe o passeio ou a observação sem retomá-los depois.
        if (attentionTimer !== null) clearTimeout(attentionTimer);
        if (walkFrame !== null) cancelAnimationFrame(walkFrame);
        attentionTimer = null;
        walkFrame = null;
        walkTarget = null;
        walkLastTime = null;
        walkVelocity = 0;
        walkTravelled = 0;
        walkFrameIndex = 0;
        activity = "glitching";
        const reduced = motionPreference.matches;
        let duration = config.strongGlitchDuration;
        if (reduced) duration = config.reducedReactionDuration;
        else if (kind === "micro") {
            duration = Math.round(config.microGlitchMin + Math.random() * (config.microGlitchMax - config.microGlitchMin));
        } else if (kind === "medium") {
            duration = Math.round(config.mediumGlitchMin + Math.random() * (config.mediumGlitchMax - config.mediumGlitchMin));
        }
        mascot.dataset.glitch = reduced ? "reduced" : kind;
        mascot.style.setProperty("--glitch-duration", duration + "ms");
        if (kind === "strong") lastStrongGlitchAt = now;
        renderPose();
        glitchTimer = setTimeout(() => {
            glitchTimer = null;
            mascot.dataset.glitch = "";
            activity = "idle";
            renderPose();
            if (tryEnterSleep()) return;
            if (!canAct()) return;
            if (source === "triple" && startWalk({
                minDistance: config.retreatMin,
                maxDistance: config.retreatMax
            }, retreatDirection)) return;
            if (decisionPending) {
                decisionPending = false;
                takeDecision();
            } else {
                scheduleDecision();
            }
        }, duration);
        return true;
    }

    function takeDecision() {
        if (!canAct() || activity === "walking") return;
        if (["observing", "glitching", "waking", "stretching"].includes(activity)) {
            decisionPending = true;
            return;
        }
        decisionPending = false;
        if (tryEnterSleep()) return;
        const choice = Math.random();
        const shouldWalk = choice < config.walkChance || consecutiveRests >= config.maxRestDecisions;
        if (shouldWalk && startWalk()) {
            consecutiveRests = 0;
            return;
        }
        if (!shouldWalk && Math.random() < config.spontaneousStretchChance && startStretch()) return;
        consecutiveRests++;
        activity = choice < .9 ? "sitting" : "idle";
        renderPose();
        scheduleDecision();
    }

    function startSpontaneousGlitch() {
        if (!canAct() || activity === "glitching" || spontaneousEffectTimer !== null) return false;
        const medium = Math.random() < config.spontaneousMediumChance;
        const min = medium ? config.mediumGlitchMin : config.microGlitchMin;
        const max = medium ? config.mediumGlitchMax : config.microGlitchMax;
        const duration = Math.round(min + Math.random() * (max - min));
        mascot.style.setProperty("--glitch-duration", duration + "ms");
        mascot.dataset.glitch = medium ? "medium" : "micro";
        spontaneousEffectTimer = setTimeout(() => {
            spontaneousEffectTimer = null;
            mascot.dataset.glitch = "";
        }, duration);
        return true;
    }

    function scheduleSpontaneousGlitch(delay = config.spontaneousGlitchInterval) {
        if (!canAct() || spontaneousGlitchTimer !== null) return;
        spontaneousGlitchTimer = setTimeout(() => {
            spontaneousGlitchTimer = null;
            if (!canAct()) return;
            // Uma reação direta em curso termina antes da próxima falha espontânea.
            scheduleSpontaneousGlitch(startSpontaneousGlitch()
                ? config.spontaneousGlitchInterval : 100);
        }, delay);
    }

    function scheduleDecision() {
        if (!canAct() || decisionTimer !== null || decisionPending ||
            !["idle", "sitting"].includes(activity)) return;
        const delay = config.decisionMin + Math.random() * (config.decisionMax - config.decisionMin);
        decisionTimer = setTimeout(() => {
            decisionTimer = null;
            takeDecision();
        }, delay);
    }

    function syncActivity() {
        if (activity === "sleeping") {
            mascot.classList.toggle("is-active", canInteract() && !motionPreference.matches);
            if (!canInteract()) stopActivities();
            else if (startupWakePending && startupWakeTimer === null) {
                startupWakeTimer = setTimeout(() => {
                    startupWakeTimer = null;
                    wakeGlitch();
                }, config.startupSleepDuration);
            }
            return;
        }
        const active = canAct();
        mascot.classList.toggle("is-active", active);
        if (!active) {
            stopActivities();
        } else {
            scheduleSpontaneousGlitch();
            if (activity === "idle" || activity === "sitting") scheduleDecision();
        }
        scheduleSleepCheck();
    }

    function collectGeometry() {
        const desktopRect = desktop.getBoundingClientRect();
        const taskbarRect = taskbar.getBoundingClientRect();
        const mascotRect = mascot.getBoundingClientRect();
        const ground = taskbarRect.top - desktopRect.top;
        const obstacles = [...desktop.querySelectorAll(".desktop-icon, .window.open")]
            .map(element => element.getBoundingClientRect())
            .filter(rect => rect.width > 0 && rect.height > 0);
        const startMenu = document.getElementById("start-menu");
        if (!startMenu.hidden) obstacles.push(startMenu.getBoundingClientRect());
        return {
            size: { width: mascotRect.width, height: mascotRect.height },
            bounds: {
                left: 6,
                top: Math.max(6, ground - mascotRect.height),
                right: desktopRect.width - 6,
                bottom: ground
            },
            obstacles: obstacles.map(rect => ({
                left: rect.left - desktopRect.left,
                top: rect.top - desktopRect.top,
                right: rect.right - desktopRect.left,
                bottom: rect.bottom - desktopRect.top
            }))
        };
    }

    function setPosition(next) {
        position = next;
        mascot.style.left = Math.round(next.x) + "px";
        mascot.style.top = Math.round(next.y) + "px";
    }

    function updateLayout() {
        if (!visible || !poseReady.base || document.hidden || !pageFocused) return;
        const openedWindow = pendingWindowAttention;
        pendingWindowAttention = null;
        geometry = collectGeometry();
        geometryDirty = false;
        const { size, bounds, obstacles } = geometry;
        const currentIsFree = position && GlitchGeometry.positionIsFree(
            position, size, bounds, obstacles, config.obstacleMargin
        );

        if (!currentIsFree) {
            const previousPosition = position;
            stopActivities();
            position = previousPosition
                ? GlitchGeometry.findNearestFreePosition(previousPosition, size, bounds, obstacles, 24, config.obstacleMargin)
                : GlitchGeometry.findFreePosition(size, bounds, obstacles, 24, config.obstacleMargin);
        } else if (activity === "walking" && !GlitchGeometry.pathIsFree(
            position, walkTarget, size, bounds, obstacles, config.obstacleMargin
        )) {
            stopActivities();
        }

        hasSpace = Boolean(position);
        mascot.style.visibility = hasSpace ? "visible" : "hidden";
        if (position) setPosition(position);
        if (entrancePending && canInteract()) {
            entrancePending = false;
            startupWakePending = true;
            enterSleep();
        }
        if (openedWindow && openedWindow.classList.contains("open") && canAct()) {
            const windowRect = openedWindow.getBoundingClientRect();
            const catRect = mascot.getBoundingClientRect();
            const direction = windowRect.left + windowRect.width / 2 < catRect.left + catRect.width / 2
                ? "watchLeft" : "watch";
            startObservation(direction, true);
        }
        syncActivity();
    }

    function scheduleLayout() {
        geometryDirty = true;
        if (!visible || !poseReady.base || document.hidden || !pageFocused || layoutFrame !== null) return;
        layoutFrame = requestAnimationFrame(() => {
            layoutFrame = null;
            updateLayout();
        });
    }

    function cancelLayout() {
        if (layoutFrame !== null) cancelAnimationFrame(layoutFrame);
        layoutFrame = null;
    }

    function refresh() {
        updateControls();
        mascot.hidden = !visible || !poseReady.base;
        if (mascot.hidden) {
            cancelLayout();
            hasSpace = false;
            mascot.style.visibility = "hidden";
        } else {
            scheduleLayout();
        }
        syncActivity();
    }

    function finishWalk() {
        walkFrame = null;
        walkTarget = null;
        walkLastTime = null;
        walkVelocity = 0;
        walkTravelled = 0;
        walkFrameIndex = 0;
        activity = Math.random() < .5 ? "idle" : "sitting";
        renderPose();
        if (tryEnterSleep()) return;
        scheduleDecision();
    }

    function animateWalk(time) {
        walkFrame = null;
        if (geometryDirty) updateLayout();
        if (!canAct() || activity !== "walking") return;
        if (walkLastTime === null) walkLastTime = time;
        const elapsed = Math.min((time - walkLastTime) / 1000, .05);
        walkLastTime = time;

        const distance = walkTarget.x - position.x;
        const remaining = Math.abs(distance);
        const brakingSpeed = Math.sqrt(2 * config.walkAcceleration * remaining);
        const targetSpeed = Math.min(config.walkSpeed, brakingSpeed);
        const previousVelocity = walkVelocity;
        const change = config.walkAcceleration * elapsed;
        walkVelocity = walkVelocity < targetSpeed
            ? Math.min(targetSpeed, walkVelocity + change)
            : Math.max(targetSpeed, walkVelocity - change);
        const advance = Math.min(remaining, (previousVelocity + walkVelocity) * elapsed / 2);
        const reached = elapsed > 0 && remaining - advance < .01;
        const next = { x: reached ? walkTarget.x : position.x + Math.sign(distance) * advance, y: position.y };
        if (!GlitchGeometry.pathIsFree(position, next, geometry.size, geometry.bounds, geometry.obstacles, config.obstacleMargin)) {
            finishWalk();
            return;
        }
        walkTravelled += Math.abs(next.x - position.x);
        setPosition(next);
        const frame = Math.floor(walkTravelled / config.walkStepLength) % 2;
        if (frame !== walkFrameIndex) {
            walkFrameIndex = frame;
            renderPose();
        }
        if (reached) {
            finishWalk();
        } else {
            walkFrame = requestAnimationFrame(animateWalk);
        }
    }

    function startWalk(distanceOptions = {}, preferredDirection = null) {
        if (geometryDirty) updateLayout();
        if (!canAct() || !geometry || !position) return false;
        let firstRandom = true;
        const chooseRandom = () => {
            if (firstRandom && preferredDirection !== null) {
                firstRandom = false;
                return preferredDirection < 0 ? 0 : .99;
            }
            firstRandom = false;
            return Math.random();
        };
        const target = GlitchGeometry.chooseDestination(position, geometry.size, geometry.bounds, geometry.obstacles, {
            minDistance: config.walkMin,
            maxDistance: config.walkMax,
            minimumClearance: config.walkClearance,
            margin: config.obstacleMargin,
            ...distanceOptions
        }, chooseRandom);
        if (!target) return false;
        if (preferredDirection !== null && Math.sign(target.x - position.x) !== preferredDirection) return false;
        const direction = target.x < position.x ? "left" : "right";
        // A pose principal é a que contém a cabeça de perfil para essa direção.
        if (!poseReady[direction + "Next"]) return false;
        cancelDecision();
        walkTarget = target;
        walkDirection = direction;
        walkFrameIndex = 0;
        walkLastTime = null;
        walkVelocity = 0;
        walkTravelled = 0;
        activity = "walking";
        renderPose();
        walkFrame = requestAnimationFrame(animateWalk);
        return true;
    }

    function startObservation(direction, interruptWalk = false) {
        if (!canAct() || !["idle", "sitting", "walking", "observing"].includes(activity) ||
            (activity === "walking" && !interruptWalk)) return false;
        if (attentionTimer !== null) clearTimeout(attentionTimer);
        if (activity === "walking") {
            if (walkFrame !== null) cancelAnimationFrame(walkFrame);
            walkFrame = null;
            walkTarget = null;
            walkLastTime = null;
            walkVelocity = 0;
            walkTravelled = 0;
            walkFrameIndex = 0;
        }
        if (poseReady[direction]) watchDirection = direction;
        activity = "observing";
        renderPose();
        attentionTimer = setTimeout(() => {
            attentionTimer = null;
            activity = "idle";
            renderPose();
            if (tryEnterSleep()) return;
            if (decisionPending) {
                decisionPending = false;
                takeDecision();
            } else {
                scheduleDecision();
            }
        }, config.attentionDuration);
        return true;
    }

    function observePointer(event) {
        if (event.pointerType !== "mouse" || !canAct()) return;
        if (!["idle", "sitting", "observing"].includes(activity)) return;
        const now = performance.now();
        const rect = mascot.getBoundingClientRect();
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        if (Math.hypot(dx, dy) > config.attentionRadius) return;
        if (dx < -20 && poseReady.watchLeft) watchDirection = "watchLeft";
        else if (dx > 20 && poseReady.watch) watchDirection = "watch";
        if (activity === "observing") {
            renderPose();
            return;
        }
        if (now - lastAttentionAt < config.attentionCooldown) return;
        lastAttentionAt = now;
        startObservation(watchDirection);
    }

    shortcut.addEventListener("click", () => {
        if (!visible) {
            visible = true;
            paused = false;
            lastInteractionAt = performance.now();
            sleepRequested = false;
            refresh();
        } else {
            openWindow("glitch-options");
        }
    });

    interactButton.addEventListener("click", event => {
        const now = performance.now();
        if (!canInteract()) return;
        if (activity === "sleeping") {
            wakeGlitch();
            return;
        }
        if (activity === "waking" || activity === "stretching") return;
        clickTimes = clickTimes.filter(time => now - time <= config.multiClickWindow);
        clickTimes.push(now);
        if (clickTimes.length >= 3) {
            clickTimes = [];
            const rect = mascot.getBoundingClientRect();
            const mouseX = Number.isFinite(event.clientX) && event.detail !== 0 ? event.clientX : null;
            const direction = mouseX === null ? null : mouseX < rect.left + rect.width / 2 ? 1 : -1;
            startGlitch("strong", "triple", direction);
            return;
        }
        if (now - lastClickReactionAt < config.clickReactionCooldown) return;
        if (startGlitch("micro", "click")) lastClickReactionAt = now;
    });

    document.addEventListener("alan-portfolio:theme-change", () => {
        startGlitch("medium", "theme");
    });

    autoStartControl.addEventListener("change", () => {
        autoStart = autoStartControl.checked;
        try {
            localStorage.setItem(config.storageKey, String(autoStart));
            storageAvailable = true;
        } catch {
            storageAvailable = false;
        }
        updateControls();
    });

    pauseButton.addEventListener("click", () => {
        if (!visible) return;
        paused = !paused;
        if (paused) entrancePending = false;
        else {
            lastInteractionAt = performance.now();
            sleepRequested = false;
        }
        refresh();
    });

    hideButton.addEventListener("click", () => {
        visible = false;
        paused = false;
        entrancePending = false;
        startupWakePending = false;
        lastInteractionAt = performance.now();
        sleepRequested = false;
        refresh();
    });

    Object.entries(poses).forEach(([name, image]) => {
        poseReady[name] = image.complete && image.naturalWidth > 0;
        image.addEventListener("load", () => {
            poseReady[name] = true;
            if (name === "base") spriteFailed = false;
            renderPose();
            if (name === "base") refresh();
        });
        image.addEventListener("error", () => {
            poseReady[name] = false;
            if (name === "base") {
                spriteFailed = true;
                refresh();
            } else if (activity === "walking" && name === walkDirection + "Next") {
                stopActivities();
                syncActivity();
            } else {
                renderPose();
            }
        });
    });
    if (poses.base.complete && !poseReady.base) spriteFailed = true;

    document.addEventListener("pointermove", event => {
        notePageInteraction();
        observePointer(event);
    }, { passive: true });
    document.addEventListener("pointerdown", notePageInteraction, { passive: true });
    document.addEventListener("keydown", notePageInteraction);
    document.addEventListener("wheel", notePageInteraction, { passive: true });
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) cancelLayout();
        else if (activity !== "sleeping") lastInteractionAt = performance.now();
        sleepRequested = false;
        refresh();
    });
    window.addEventListener("blur", () => {
        pageFocused = false;
        cancelLayout();
        sleepRequested = false;
        refresh();
    });
    window.addEventListener("focus", () => {
        pageFocused = true;
        if (activity !== "sleeping") lastInteractionAt = performance.now();
        sleepRequested = false;
        refresh();
    });
    window.addEventListener("resize", scheduleLayout);
    motionPreference.addEventListener("change", () => {
        if (activity !== "sleeping") lastInteractionAt = performance.now();
        sleepRequested = false;
        refresh();
    });

    const windowStates = new WeakMap();
    const layoutObserver = new MutationObserver(records => {
        for (const record of records || []) {
            if (record.attributeName !== "class" || !windowStates.has(record.target)) continue;
            const isOpen = record.target.classList.contains("open");
            const wasOpen = windowStates.get(record.target);
            windowStates.set(record.target, isOpen);
            if (isOpen && !wasOpen && canAct() && ["idle", "sitting", "walking", "observing"].includes(activity)) {
                pendingWindowAttention = record.target;
            }
        }
        scheduleLayout();
    });
    document.querySelectorAll(".window").forEach(element => {
        windowStates.set(element, element.classList.contains("open"));
        layoutObserver.observe(element, { attributes: true, attributeFilter: ["class", "style"] });
    });
    layoutObserver.observe(document.getElementById("start-menu"), {
        attributes: true,
        attributeFilter: ["hidden"]
    });
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(scheduleLayout);
        resizeObserver.observe(desktop);
        resizeObserver.observe(taskbar);
    }

    renderPose();
    refresh();
})();
