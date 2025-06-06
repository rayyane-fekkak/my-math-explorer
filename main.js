// main.js: Core Three.js setup, global variables, and main loop.

// Global THREE.js variables
let scene, camera, renderer, controls;
let mainShapeGroup, demoGroup, dynamicPointsGroup_M, customEdgesGroup_M; // Scene graph groups
let axesHelper_M; // New Axes Helper

let currentShapeMesh = null;
let currentEdgesMesh = null;
let currentViewMode = 'full';  

// Click interaction for main shapes
let shapeClickRaycaster, clickMouse;
let lastClickTime_M = 0;
let lastClickTarget_M = null;
const DOUBLE_CLICK_THRESHOLD_M = 300; 

// Interaction modes
let isMiddlePointModeActive_M = false;
let isMeasureModeActive_M = false; 
let firstMeasurePoint_M = null; 
let isAxesHelperVisible_M = false; 

let nextDynamicPointLabelCounter_M = 0; 
let usedLabels_M = new Set(); 

// Undo/Redo
let historyStack_M = [];
let historyIndex_M = -1; // Points to the last executed command
const MAX_HISTORY_M = 50;


// FPS counter variables
let fpsLastTime, fpsFrames, minFps, maxFps;

// Party mode
let partyInterval = null;

let currentActiveDemoFunction = null; 
const ADVANCED_OPTIONS_LOCAL_STORAGE_KEY = 'customGeo3DAdvancedOptions'; 

let ANIME_REF;

let ambientLight_M, pointLight_M, dirLight_M;


function initializeApp() {
    if (!window.THREE || !window.THREE.OrbitControls || !window.anime) {
        const libStatus = document.getElementById('library-status');
        console.error("Initialization cancelled: Essential libraries missing.");
        if (libStatus && libStatus.className !== 'error') {
            libStatus.textContent = 'Error: Essential libraries not loaded.';
            libStatus.className = 'error';
        }
        return;
    }
    ANIME_REF = window.anime; 
    console.log("All libraries verified, initializing app core...");

    initializeUIElements(); 
    initMainApp();        
}

function getCSSVariable_M(varName) { 
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

function loadAdvancedOptionsFromLocalStorage_M() { 
    const storedOptions = localStorage.getItem(ADVANCED_OPTIONS_LOCAL_STORAGE_KEY);
    if (storedOptions) {
        try {
            const options = JSON.parse(storedOptions);
            for (const cssVar in options) {
                if (options.hasOwnProperty(cssVar)) {
                    document.documentElement.style.setProperty(cssVar, options[cssVar]);
                }
            }
        } catch (e) {
            console.error("Failed to parse stored advanced options:", e);
            localStorage.removeItem(ADVANCED_OPTIONS_LOCAL_STORAGE_KEY);
        }
    }
    if (typeof populateAdvancedOptions_UM === 'function') { 
         populateAdvancedOptions_UM();
    }
}

function saveAdvancedOptionsToLocalStorage_M(optionsToSave) { 
    localStorage.setItem(ADVANCED_OPTIONS_LOCAL_STORAGE_KEY, JSON.stringify(optionsToSave));
}

function updateSceneColors() {
    if(scene) scene.background = new THREE.Color(getCSSVariable_M('--bg-darkest'));

    if (ambientLight_M) ambientLight_M.color.set(getCSSVariable_M('--ambient-light-color'));
    if (pointLight_M) pointLight_M.color.set(getCSSVariable_M('--point-light-color'));
    if (dirLight_M) dirLight_M.color.set(getCSSVariable_M('--directional-light-color'));

    if (mainShapeGroup && mainShapeGroup.visible && currentShapeMesh && typeof resetHighlights_SM === 'function') {
        resetHighlights_SM(currentShapeMesh, currentEdgesMesh, currentViewMode);
    }
    if (dynamicPointsGroup_M) {
        const dynamicPointColor = getCSSVariable_M('--dynamic-point-color') || '#FF69B4';
        dynamicPointsGroup_M.children.forEach(point => {
            if (point.material && point.material.color) {
                point.material.color.set(dynamicPointColor);
            }
            if (point.userData.spriteLabel && typeof updateTextSpriteSize_AU === 'function') {
                 updateTextSpriteSize_AU(point.userData.spriteLabel);
            }
        });
    }
    if (customEdgesGroup_M) {
        const customEdgeColor = getCSSVariable_M('--custom-edge-color') || '#9932CC';
        customEdgesGroup_M.children.forEach(edge => {
            if (edge.material && edge.material.color) {
                edge.material.color.set(customEdgeColor);
            }
        });
    }
}

function updateAllLabelVisuals_M() {
    if (typeof cornerLabelsGroup_SM !== 'undefined' && cornerLabelsGroup_SM) {
        cornerLabelsGroup_SM.children.forEach(labelSprite => {
            if (labelSprite.userData.isCornerLabel && typeof updateTextSpriteSize_AU === 'function') {
                updateTextSpriteSize_AU(labelSprite);
            }
        });
    }
    if (dynamicPointsGroup_M) {
        dynamicPointsGroup_M.children.forEach(pointMesh => {
            if (pointMesh.userData.spriteLabel && typeof updateTextSpriteSize_AU === 'function') {
                updateTextSpriteSize_AU(pointMesh.userData.spriteLabel);
            }
        });
    }
}


function applyAdvancedOptions_M() { 
    const optionsToSave = {};
    const optionsMap = typeof getAdvancedOptionsMap_UM === 'function' ? getAdvancedOptionsMap_UM() : {};

    for (const key in optionsMap) {
        const item = optionsMap[key];
        
        if (item.type === 'color') {
            if (item.cssVar === '--main-shape-fill-color' || item.cssVar === '--main-shape-edge-color') {
                optionsToSave[item.cssVar] = getCSSVariable_M(item.cssVar);
                document.documentElement.style.setProperty(item.cssVar, optionsToSave[item.cssVar]); 
            } else { 
                const picker = document.getElementById(`adv-picker-${key}`); 
                if (picker) {
                    document.documentElement.style.setProperty(item.cssVar, picker.value);
                    optionsToSave[item.cssVar] = picker.value;
                }
            }
        } else if (item.type === 'number' && item.elId) {
            const inputEl = document.getElementById(item.elId);
            if (inputEl) {
                const valueWithUnit = inputEl.value + (item.cssVar.includes('font-size') ? 'px' : ''); 
                document.documentElement.style.setProperty(item.cssVar, valueWithUnit);
                optionsToSave[item.cssVar] = valueWithUnit;
            }
        }
    }
    
    saveAdvancedOptionsToLocalStorage_M(optionsToSave);
    updateSceneColors(); 
    updateAllLabelVisuals_M(); 

    if (currentActiveDemoFunction) {
        currentActiveDemoFunction(); 
    }
}

function resetAdvancedOptions_M() { 
    const optionsMap = typeof getAdvancedOptionsMap_UM === 'function' ? getAdvancedOptionsMap_UM() : {};
    
    for (const key in optionsMap) {
        const item = optionsMap[key];
        document.documentElement.style.removeProperty(item.cssVar); 
    }
    localStorage.removeItem(ADVANCED_OPTIONS_LOCAL_STORAGE_KEY);
    
    if (typeof populateAdvancedOptions_UM === 'function') { 
        populateAdvancedOptions_UM(); 
    }
    updateSceneColors(); 
    updateAllLabelVisuals_M(); 

    if (currentActiveDemoFunction) {
        currentActiveDemoFunction(); 
    }
}


function initMainApp() {
    loadAdvancedOptionsFromLocalStorage_M(); 

    fpsLastTime = performance.now();
    fpsFrames = 0;
    minFps = Infinity;
    maxFps = 0;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(getCSSVariable_M('--bg-darkest'));


    mainShapeGroup = new THREE.Group();
    demoGroup = new THREE.Group();
    dynamicPointsGroup_M = new THREE.Group();
    customEdgesGroup_M = new THREE.Group(); 
    mainShapeGroup.add(dynamicPointsGroup_M); 
    mainShapeGroup.add(customEdgesGroup_M);

    scene.add(mainShapeGroup);
    scene.add(demoGroup);

    axesHelper_M = new THREE.AxesHelper(2); // Size 2 for the axes helper
    axesHelper_M.visible = false;
    scene.add(axesHelper_M);


    const container = document.getElementById('container');
    camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 2.5, 8);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement); 
    controls.enableDamping = true; controls.dampingFactor = 0.05; controls.minDistance = 1; controls.maxDistance = 50; controls.target.set(0, 0, 0);

    initializeShapeManager(window.THREE, ANIME_REF, mainShapeGroup, currentViewMode, {
        registerLabel: registerLabel_M,
        unregisterLabel: unregisterLabel_M,
        isLabelUsed: isLabelUsed_M
    });
    initializeAxiomUtilities(window.THREE, ANIME_REF, demoGroup, camera, renderer, controls, container);

    ambientLight_M = new THREE.AmbientLight(getCSSVariable_M('--ambient-light-color'), 0.8); // Slightly reduced
    scene.add(ambientLight_M);
    pointLight_M = new THREE.PointLight(getCSSVariable_M('--point-light-color'), 1.2, 100); // Slightly increased
    pointLight_M.position.set(5, 8, 5); 
    pointLight_M.castShadow = true; 
    scene.add(pointLight_M);
    dirLight_M = new THREE.DirectionalLight(getCSSVariable_M('--directional-light-color'), 0.8); 
    dirLight_M.position.set(-5, 5, -5); 
    scene.add(dirLight_M);

    shapeClickRaycaster = new THREE.Raycaster();
    clickMouse = new THREE.Vector2();
    renderer.domElement.addEventListener('click', onShapeClick, false);
    window.addEventListener('keydown', onKeyDown_M); // For Undo/Redo shortcuts

    const shapeSelectorElement = document.getElementById('shape-selector');
    const shapesData = getShapesDataSM(); 
    Object.keys(shapesData).forEach(key => {
        const option = new Option(shapesData[key].name, key);
        shapeSelectorElement.appendChild(option);
    });

    setupEventListeners({ 
        switchShape: switchShape,
        setViewMode: setViewMode,
        togglePartyMode: togglePartyMode,
        runAxiom1: runAxiom1_main,
        runAxiom2: runAxiom2_main,
        runAxiom3: runAxiom3_main,
        runLinesCoplanarIntersecting: runLinesCoplanarIntersecting_main,
        runLinesCoplanarStrictlyParallel: runLinesCoplanarStrictlyParallel_main,
        runLinesCoplanarCoincident: runLinesCoplanarCoincident_main,
        runPlanesStrictlyParallel: runPlanesStrictlyParallel_main,
        runPlanesCoincident: runPlanesCoincident_main,
        runPlanesIntersecting: runPlanesIntersecting_main,
        runLinePlaneStrictlyParallel: runLinePlaneStrictlyParallel_main,
        runLinePlaneIncluded: runLinePlaneIncluded_main,
        runLinePlaneIntersecting: runLinePlaneIntersecting_main,
        // New Property Callbacks
        runPropTransitivityParallelLines: runPropTransitivityParallelLines_main,
        runPropLineParallelToPlaneViaLine: runPropLineParallelToPlaneViaLine_main,
        runPropPlaneIntersectingParallelLines: runPropPlaneIntersectingParallelLines_main,
        runPropRoofTheorem: runPropRoofTheorem_main,

        toggleMiddlePointMode: toggleMiddlePointMode_M, 
        toggleMeasureMode: toggleMeasureMode_M, 
        toggleAxesHelper: toggleAxesHelper_M, 
        cleanDynamicElements: cleanDynamicElements_M, 
        createCustomEdge: createCustomEdge_M, 
        undo: undo_M, 
        redo: redo_M, 
        applyAdvancedOptions: applyAdvancedOptions_M, 
        resetAdvancedOptions: resetAdvancedOptions_M, 
        updateSceneColors: updateSceneColors 
    });

    window.addEventListener('resize', onWindowResize, false);
    updateUndoRedoButtons_M();

    if (Object.keys(shapesData).length > 0) {
        switchShape(Object.keys(shapesData)[0]);
    }
    setViewMode('full');
    animate();
}

// --- Label Management ---
function isLabelUsed_M(label) {
    return usedLabels_M.has(label.toUpperCase());
}

function registerLabel_M(label) {
    usedLabels_M.add(label.toUpperCase());
}

function unregisterLabel_M(label) {
    usedLabels_M.delete(label.toUpperCase());
}

function getNextAvailableLabel_M() {
    for (let i = 0; i < 26; i++) {
        const char = String.fromCharCode('A'.charCodeAt(0) + i);
        if (!isLabelUsed_M(char)) {
            return char;
        }
    }
    for (let i = 0; i < 26; i++) {
        const prefix = String.fromCharCode('A'.charCodeAt(0) + i);
        for (let j = 0; j < 10; j++) {
            const label = prefix + j;
            if (!isLabelUsed_M(label)) {
                return label;
            }
        }
    }
    let counter = nextDynamicPointLabelCounter_M;
    let fallbackLabel;
    do {
        fallbackLabel = `P${counter++}`;
    } while (isLabelUsed_M(fallbackLabel));
    nextDynamicPointLabelCounter_M = counter;
    return fallbackLabel;
}


// --- Interaction Logic ---

function getClosestEdgeAndPoint(targetMesh, intersectPoint, face) {
    if (!face || !targetMesh || !targetMesh.geometry) return null;

    const geometry = targetMesh.geometry;
    const vertices = geometry.attributes.position;

    const vA = new THREE.Vector3().fromBufferAttribute(vertices, face.a);
    const vB = new THREE.Vector3().fromBufferAttribute(vertices, face.b);
    const vC = new THREE.Vector3().fromBufferAttribute(vertices, face.c);

    vA.applyMatrix4(targetMesh.matrixWorld);
    vB.applyMatrix4(targetMesh.matrixWorld);
    vC.applyMatrix4(targetMesh.matrixWorld);

    const edges = [
        { p1: vA, p2: vB, originalIndices: [face.a, face.b] },
        { p1: vB, p2: vC, originalIndices: [face.b, face.c] },
        { p1: vC, p2: vA, originalIndices: [face.c, face.a] }
    ];

    let closestEdge = null;
    let minDistanceSq = Infinity;
    let pointOnEdge = new THREE.Vector3();

    const line = new THREE.Line3();
    const tempPoint = new THREE.Vector3();

    edges.forEach(edge => {
        line.set(edge.p1, edge.p2);
        line.closestPointToPoint(intersectPoint, true, tempPoint); 
        const distSq = intersectPoint.distanceToSquared(tempPoint);
        if (distSq < minDistanceSq) {
            minDistanceSq = distSq;
            closestEdge = edge;
            pointOnEdge.copy(tempPoint);
        }
    });
    return { edge: closestEdge, point: pointOnEdge };
}


function addDynamicPoint(position, recordHistory = true) {
    if (!dynamicPointsGroup_M || !createAxiomPoint_AU) return null;
    
    const label = getNextAvailableLabel_M();
    const pointColor = getCSSVariable_M('--dynamic-point-color') || '#FF69B4';
    const dynamicPoint = createAxiomPoint_AU(position, pointColor, label, 0.05, 1.5, false, null, null, 0.005, true); 
    
    if (dynamicPoint) {
        dynamicPointsGroup_M.add(dynamicPoint);
        animateAxiomObject_AU(dynamicPoint, 0, 300);
        registerLabel_M(label); // Register after successful creation

        if (recordHistory) {
            const command = new AddDynamicPointCommand(dynamicPoint);
            executeCommand_M(command);
        }
        return dynamicPoint;
    }
    return null;
}

function removeDynamicPoint(pointMesh, recordHistory = true) {
    if (!dynamicPointsGroup_M || !pointMesh) return;

    if (pointMesh.userData.spriteLabel && pointMesh.userData.spriteLabel.userData.labelText) {
        unregisterLabel_M(pointMesh.userData.spriteLabel.userData.labelText);
    }
    if (pointMesh.geometry) pointMesh.geometry.dispose();
    if (pointMesh.material) {
        if(Array.isArray(pointMesh.material)) pointMesh.material.forEach(m => m.dispose()); else pointMesh.material.dispose();
        if(pointMesh.material.map) pointMesh.material.map.dispose();
    }
    if (pointMesh.userData.spriteLabel) { 
        if(pointMesh.userData.spriteLabel.material.map) pointMesh.userData.spriteLabel.material.map.dispose();
        pointMesh.userData.spriteLabel.material.dispose();
    }
    dynamicPointsGroup_M.remove(pointMesh);
    // Note: History for removal would be part of an AddDynamicPointCommand's undo.
}


function cleanDynamicElements_M() {
    if (dynamicPointsGroup_M) {
        dynamicPointsGroup_M.children.slice().forEach(child => removeDynamicPoint(child, false)); // Don't record history for clean all
    }
    if (customEdgesGroup_M) {
         customEdgesGroup_M.children.slice().forEach(child => removeCustomEdge(child, false)); // Don't record history for clean all
    }
    nextDynamicPointLabelCounter_M = 0; 
    if(typeof updateDemoExplanation === 'function') updateDemoExplanation("Points dynamiques et arêtes personnalisées effacés.");

    // Clear history related to these elements
    historyStack_M = [];
    historyIndex_M = -1;
    updateUndoRedoButtons_M();
}

function toggleMiddlePointMode_M() {
    isMiddlePointModeActive_M = !isMiddlePointModeActive_M;
    if (isMiddlePointModeActive_M && isMeasureModeActive_M) {
        isMeasureModeActive_M = false; 
        firstMeasurePoint_M = null;
        if(typeof setMeasureModeButtonState === 'function') setMeasureModeButtonState(false);
    }
    if (typeof setMiddlePointModeButtonState === 'function') {
        setMiddlePointModeButtonState(isMiddlePointModeActive_M);
    }
    if (typeof updateDemoExplanation === 'function') {
        updateDemoExplanation(isMiddlePointModeActive_M ? "Mode Point Milieu activé. Cliquez sur une arête." : "Mode Point Milieu désactivé.");
    }
}

function toggleMeasureMode_M() {
    isMeasureModeActive_M = !isMeasureModeActive_M;
    firstMeasurePoint_M = null; 
    if (isMeasureModeActive_M && isMiddlePointModeActive_M) {
        isMiddlePointModeActive_M = false; 
         if(typeof setMiddlePointModeButtonState === 'function') setMiddlePointModeButtonState(false);
    }
    if (typeof setMeasureModeButtonState === 'function') {
        setMeasureModeButtonState(isMeasureModeActive_M);
    }
    if (typeof updateDemoExplanation === 'function') {
        updateDemoExplanation(isMeasureModeActive_M ? "Mode Mesure activé. Cliquez sur un premier point." : "Mode Mesure désactivé.");
    }
}

function toggleAxesHelper_M() {
    isAxesHelperVisible_M = !isAxesHelperVisible_M;
    if (axesHelper_M) {
        axesHelper_M.visible = isAxesHelperVisible_M;
    }
    if (typeof setToggleAxesHelperButtonState === 'function') {
        setToggleAxesHelperButtonState(isAxesHelperVisible_M);
    }
     if (typeof updateDemoExplanation === 'function') {
        updateDemoExplanation(isAxesHelperVisible_M ? "Affichage des axes globaux activé." : "Affichage des axes globaux désactivé.");
    }
}


function handleSingleClick_M(intersect) {
    const { object, point, face } = intersect;

    if (isMiddlePointModeActive_M && (object === currentShapeMesh)) {
        const edgeInfo = getClosestEdgeAndPoint(currentShapeMesh, point, face);
        if (edgeInfo && edgeInfo.edge) {
            const midpoint = new THREE.Vector3().addVectors(edgeInfo.edge.p1, edgeInfo.edge.p2).multiplyScalar(0.5);
            const localMidpoint = mainShapeGroup.worldToLocal(midpoint.clone());
            addDynamicPoint(localMidpoint); // Will use executeCommand internally
        }
    } else if (isMeasureModeActive_M) {
        let clickedPointPosition = null;
        let clickedPointLabel = "un point";

        if (object.userData.isCornerLabel) { 
            clickedPointPosition = object.userData.vertexPosition.clone(); 
            clickedPointLabel = `le sommet "${object.userData.labelText}"`;
        } else if (object.userData.isDynamicPoint) { 
            clickedPointPosition = object.position.clone(); 
            clickedPointLabel = `le point "${object.userData.labelName}"`;
        } else if (object.userData.spriteLabel && object.userData.spriteLabel.userData.isDynamicPointLabel) { 
             clickedPointPosition = object.userData.spriteLabel.userData.ownerPointMesh.position.clone();
             clickedPointLabel = `le point "${object.userData.spriteLabel.userData.labelText}"`;
        } else if (object === currentShapeMesh || object === currentEdgesMesh) { 
            clickedPointPosition = mainShapeGroup.worldToLocal(point.clone());
            clickedPointLabel = "un point sur la forme";
        }

        if (clickedPointPosition) {
            if (!firstMeasurePoint_M) {
                firstMeasurePoint_M = { position: clickedPointPosition, label: clickedPointLabel };
                if(typeof updateDemoExplanation === 'function') updateDemoExplanation(`Premier point (${firstMeasurePoint_M.label}) sélectionné. Cliquez sur un deuxième point.`);
            } else {
                const dist = firstMeasurePoint_M.position.distanceTo(clickedPointPosition);
                if(typeof updateDemoExplanation === 'function') updateDemoExplanation(`Distance entre ${firstMeasurePoint_M.label} et ${clickedPointLabel}: ${dist.toFixed(3)} unités.`);
                firstMeasurePoint_M = null; 
            }
        }
    }
}

function performLabelRename_M(labelSprite, newLabel, oldLabel) {
    if (!labelSprite || !newLabel) return false;

    if (oldLabel) unregisterLabel_M(oldLabel);
    registerLabel_M(newLabel);

    labelSprite.userData.labelText = newLabel;
    if (labelSprite.userData.ownerPointMesh) { // For dynamic point labels attached to point meshes
        labelSprite.userData.ownerPointMesh.name = newLabel; // Also update the point mesh's name if it's a dynamic point
        labelSprite.userData.ownerPointMesh.userData.labelName = newLabel;
    }
     if (typeof updateTextSpriteSize_AU === 'function') updateTextSpriteSize_AU(labelSprite);
    return true;
}


function handleDoubleClick_M(intersect) {
    const { object, point, face } = intersect;

    const labelSprite = intersect.object;
    if (labelSprite && (labelSprite.userData.isCornerLabel || labelSprite.userData.isDynamicPointLabel)) {
        const currentLabel = labelSprite.userData.labelText;
        if (typeof promptForNewLabel_UM === 'function') {
            const newLabel = promptForNewLabel_UM(currentLabel, (lbl) => lbl === currentLabel || !isLabelUsed_M(lbl));
            if (newLabel && newLabel !== currentLabel) {
                const command = new RenameLabelCommand(labelSprite, currentLabel, newLabel);
                executeCommand_M(command);
                 if (typeof updateDemoExplanation === 'function') {
                     updateDemoExplanation(`Étiquette "${currentLabel}" changée en "${newLabel}".`);
                }
            }
        }
        if (event && event.stopPropagation) event.stopPropagation(); 
    } else if (object === currentShapeMesh && mainShapeGroup.visible) {
         const edgeInfo = getClosestEdgeAndPoint(currentShapeMesh, point, face);
        if (edgeInfo && edgeInfo.point) {
             const localPointOnEdge = mainShapeGroup.worldToLocal(edgeInfo.point.clone());
             addDynamicPoint(localPointOnEdge); // Will use executeCommand
        }
    } else if (object === currentEdgesMesh && mainShapeGroup.visible) { 
        const localPointOnEdge = mainShapeGroup.worldToLocal(point.clone());
        addDynamicPoint(localPointOnEdge); // Will use executeCommand
    }
}


function onShapeClick(event) {
    if ((demoGroup && demoGroup.visible === true)) {
        return; 
    }
    if (!mainShapeGroup || mainShapeGroup.visible === false) return;


    const rect = renderer.domElement.getBoundingClientRect();
    clickMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    clickMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    shapeClickRaycaster.setFromCamera(clickMouse, camera);
    
    let intersectsLabels = [];
    const allInteractiveObjects = [];
    if (typeof cornerLabelsGroup_SM !== 'undefined' && cornerLabelsGroup_SM && cornerLabelsGroup_SM.visible) {
        allInteractiveObjects.push(...cornerLabelsGroup_SM.children);
    }
    if (dynamicPointsGroup_M && dynamicPointsGroup_M.visible) {
        dynamicPointsGroup_M.children.forEach(p => { 
            allInteractiveObjects.push(p); 
            if(p.userData.spriteLabel) allInteractiveObjects.push(p.userData.spriteLabel); 
        });
    }
    if (allInteractiveObjects.length > 0) {
        intersectsLabels = shapeClickRaycaster.intersectObjects(allInteractiveObjects, true);
    }


    let intersectsShape;
    if (currentViewMode === 'edges' && currentEdgesMesh && currentEdgesMesh.visible) {
        intersectsShape = shapeClickRaycaster.intersectObject(currentEdgesMesh, false);
    } else if ((currentViewMode === 'full') && currentShapeMesh && currentShapeMesh.visible) {
        intersectsShape = shapeClickRaycaster.intersectObject(currentShapeMesh, false);
    } else {
        intersectsShape = [];
    }
    
    const firstIntersect = intersectsLabels.length > 0 ? intersectsLabels[0] : (intersectsShape.length > 0 ? intersectsShape[0] : null);

    if (firstIntersect) {
        const currentTime = performance.now();
        if (controls) controls.enabled = false;


        if (currentTime - lastClickTime_M < DOUBLE_CLICK_THRESHOLD_M && lastClickTarget_M === firstIntersect.object) {
            handleDoubleClick_M(firstIntersect);
            lastClickTime_M = 0; 
            lastClickTarget_M = null;
             if (event && event.stopPropagation) event.stopPropagation();
        } else {
            lastClickTime_M = currentTime;
            lastClickTarget_M = firstIntersect.object;
            handleSingleClick_M(firstIntersect);
        }
        setTimeout(() => { if(controls) controls.enabled = true; }, DOUBLE_CLICK_THRESHOLD_M);

    } else {
         if (controls) controls.enabled = true; 
         firstMeasurePoint_M = null; 
         if(isMeasureModeActive_M && typeof updateDemoExplanation === 'function') updateDemoExplanation("Mode Mesure: Cliquez sur un premier point.");
    }
}

function getPointPositionByLabel_M(label) {
    if (typeof cornerLabelsGroup_SM !== 'undefined' && cornerLabelsGroup_SM) {
        for (const sprite of cornerLabelsGroup_SM.children) {
            if (sprite.userData.labelText === label && sprite.userData.vertexPosition) {
                return sprite.userData.vertexPosition.clone(); 
            }
        }
    }
    if (dynamicPointsGroup_M) {
        for (const pointMesh of dynamicPointsGroup_M.children) {
            if (pointMesh.userData.spriteLabel && pointMesh.userData.spriteLabel.userData.labelText === label) {
                return pointMesh.position.clone(); 
            }
        }
    }
    return null;
}

function createCustomEdge_M(recordHistory = true) {
    if (!getCreateEdgeInputValues_UM || !createLineMesh_AU || !customEdgesGroup_M) return null;
    const { label1, label2 } = getCreateEdgeInputValues_UM();

    if (!label1 || !label2) {
        if(typeof updateDemoExplanation === 'function') updateDemoExplanation("Veuillez entrer deux étiquettes de points.");
        return null;
    }
    if (label1 === label2) {
        if(typeof updateDemoExplanation === 'function') updateDemoExplanation("Les deux étiquettes doivent être différentes.");
        return null;
    }

    const pos1 = getPointPositionByLabel_M(label1);
    const pos2 = getPointPositionByLabel_M(label2);

    if (pos1 && pos2) {
        const edgeColor = getCSSVariable_M('--custom-edge-color') || '#9932CC';
        const customEdge = createLineMesh_AU(pos1, pos2, edgeColor, 0.02, "CustomEdge");
        if (customEdge) {
            customEdgesGroup_M.add(customEdge);
            if(typeof updateDemoExplanation === 'function') updateDemoExplanation(`Arête créée entre ${label1} et ${label2}.`);
            if (typeof clearCreateEdgeInputs_UM === 'function') clearCreateEdgeInputs_UM();
            
            if (recordHistory) {
                 const command = new AddCustomEdgeCommand(customEdge);
                 executeCommand_M(command);
            }
            return customEdge;

        } else {
             if(typeof updateDemoExplanation === 'function') updateDemoExplanation("Erreur lors de la création de l'arête.");
        }
    } else {
        let errorMsg = "Impossible de créer l'arête. Points non trouvés: ";
        if (!pos1) errorMsg += label1 + " ";
        if (!pos2) errorMsg += label2;
        if(typeof updateDemoExplanation === 'function') updateDemoExplanation(errorMsg.trim() + ".");
    }
    return null;
}

function removeCustomEdge(edgeMesh, recordHistory = true) {
    if (!customEdgesGroup_M || !edgeMesh) return;
    if (edgeMesh.geometry) edgeMesh.geometry.dispose();
    if (edgeMesh.material) edgeMesh.material.dispose();
    customEdgesGroup_M.remove(edgeMesh);
     // Note: History for removal would be part of an AddCustomEdgeCommand's undo.
}


function hideMainShape() {
    if(mainShapeGroup) mainShapeGroup.visible = false;
    if(typeof cornerLabelsGroup_SM !== 'undefined' && cornerLabelsGroup_SM) cornerLabelsGroup_SM.visible = false;
    currentActiveDemoFunction = null; 
    cleanDynamicElements_M();
}

function switchShape(shapeKey) {
    currentActiveDemoFunction = null;
    if (typeof clearDemoGroup_AU === 'function') clearDemoGroup_AU(); 
    if (typeof updateDemoExplanation === 'function') updateDemoExplanation("Prêt pour l'exploration.");
    if (typeof clearCornerLabels_SM === 'function') clearCornerLabels_SM(); 
    cleanDynamicElements_M(); 
    usedLabels_M.clear(); 


    const tasks = [];
    const durationOut = 500;

    if (mainShapeGroup.children.length > 0 && mainShapeGroup.visible) { 
        tasks.push(ANIME_REF({
            targets: mainShapeGroup.scale,
            x: 0.001, y: 0.001, z: 0.001,
            duration: durationOut, easing: 'easeInExpo'
        }).finished);
        tasks.push(ANIME_REF({
            targets: mainShapeGroup.rotation,
            x: mainShapeGroup.rotation.x + Math.PI * 0.5,
            y: mainShapeGroup.rotation.y + Math.PI,
            duration: durationOut, easing: 'easeInSine'
        }).finished);

        if (currentShapeMesh && currentShapeMesh.material) {
            tasks.push(ANIME_REF({ targets: currentShapeMesh.material, opacity: 0, duration: durationOut * 0.7, easing: 'easeInQuad' }).finished);
        }
        if (currentEdgesMesh && currentEdgesMesh.material) {
            tasks.push(ANIME_REF({ targets: currentEdgesMesh.material, opacity: 0, duration: durationOut * 0.7, easing: 'easeInQuad' }).finished);
        }
    }
    
    Promise.all(tasks).then(() => {
        if (currentShapeMesh && typeof disposeShapeResources_SM === 'function') disposeShapeResources_SM(currentShapeMesh); currentShapeMesh = null;
        if (currentEdgesMesh && typeof disposeShapeResources_SM === 'function') disposeShapeResources_SM(currentEdgesMesh); currentEdgesMesh = null;

        const childrenToKeep = [cornerLabelsGroup_SM, dynamicPointsGroup_M, customEdgesGroup_M].filter(Boolean);
        mainShapeGroup.children.slice().forEach(child => {
            if (!childrenToKeep.includes(child)) {
                mainShapeGroup.remove(child);
            }
        });
        
        if (typeof cornerLabelsGroup_SM !== 'undefined' && !mainShapeGroup.children.includes(cornerLabelsGroup_SM)) {
             mainShapeGroup.add(cornerLabelsGroup_SM);
        }
        if (typeof dynamicPointsGroup_M !== 'undefined' && !mainShapeGroup.children.includes(dynamicPointsGroup_M)) {
            mainShapeGroup.add(dynamicPointsGroup_M);
        }
         if (typeof customEdgesGroup_M !== 'undefined' && !mainShapeGroup.children.includes(customEdgesGroup_M)) {
            mainShapeGroup.add(customEdgesGroup_M);
        }
        loadNewShape(shapeKey); 
    }).catch(error => {
        console.warn("Error during shape switch animation (out):", error);
        if(currentShapeMesh && typeof disposeShapeResources_SM === 'function') disposeShapeResources_SM(currentShapeMesh); currentShapeMesh = null;
        if(currentEdgesMesh && typeof disposeShapeResources_SM === 'function') disposeShapeResources_SM(currentEdgesMesh); currentEdgesMesh = null;
       
        const childrenToKeep = [cornerLabelsGroup_SM, dynamicPointsGroup_M, customEdgesGroup_M].filter(Boolean);
        mainShapeGroup.children.slice().forEach(child => {
            if (!childrenToKeep.includes(child)) {
                mainShapeGroup.remove(child);
            }
        });
        if (typeof cornerLabelsGroup_SM !== 'undefined' && !mainShapeGroup.children.includes(cornerLabelsGroup_SM)) {
            mainShapeGroup.add(cornerLabelsGroup_SM);
        }
         if (typeof dynamicPointsGroup_M !== 'undefined' && !mainShapeGroup.children.includes(dynamicPointsGroup_M)) {
            mainShapeGroup.add(dynamicPointsGroup_M);
        }
         if (typeof customEdgesGroup_M !== 'undefined' && !mainShapeGroup.children.includes(customEdgesGroup_M)) {
            mainShapeGroup.add(customEdgesGroup_M);
        }
        loadNewShape(shapeKey);
    });
}

function loadNewShape(shapeKey) {
    const shapesData = getShapesDataSM(); 
    const shapeInfo = shapesData[shapeKey];
    if (!shapeInfo) { console.error("Shape info not found:", shapeKey); return; }

    currentShapeMaterial_SM = createShapeMaterial_SM(shapeInfo, currentViewMode);
    currentEdgesMaterial_SM = createEdgesMaterial_SM(shapeInfo);

    currentShapeMesh = shapeInfo.create();

    if (currentShapeMesh) {
        currentShapeMesh.userData.shapeKey = shapeKey;
        currentShapeMesh.castShadow = true;
        currentShapeMesh.receiveShadow = true;
    }
    currentEdgesMesh = createEdgesRepresentation_SM(currentShapeMesh ? currentShapeMesh.geometry : null);

    const initialRotationY = -Math.PI * 0.75;
    const initialRotationX = Math.PI * 0.25;

    mainShapeGroup.scale.set(0.01, 0.01, 0.01);
    mainShapeGroup.rotation.set(initialRotationX, initialRotationY, 0);
    mainShapeGroup.visible = true; 

    if (currentShapeMesh && currentShapeMesh.material) currentShapeMesh.material.opacity = 0;
    if (currentEdgesMesh && currentEdgesMesh.material) currentEdgesMesh.material.opacity = 0;
    
    setViewMode(currentViewMode, true); 

    ANIME_REF({ targets: mainShapeGroup.scale, x: 1, y: 1, z: 1, duration: 1200, easing: 'easeOutElastic(1.1, .65)'});
    ANIME_REF({ targets: mainShapeGroup.rotation, y: 0, x: 0, z: 0, duration: 1500, easing: 'easeOutExpo'});

    if (currentShapeMesh && currentShapeMesh.visible && currentShapeMesh.material) {
        ANIME_REF({ targets: currentShapeMesh.material, opacity: 1, duration: 700, easing: 'easeOutQuad', delay: 200 });
    }
    if (currentEdgesMesh && currentEdgesMesh.visible && currentEdgesMesh.material) {
        ANIME_REF({ targets: currentEdgesMesh.material, opacity: 1, duration: 700, easing: 'easeOutQuad', delay: 200 });
    }

    if (typeof cornerLabelsGroup_SM !== 'undefined' && cornerLabelsGroup_SM && cornerLabelsGroup_SM.visible) {
        if (!mainShapeGroup.children.includes(cornerLabelsGroup_SM)) mainShapeGroup.add(cornerLabelsGroup_SM);
        cornerLabelsGroup_SM.children.forEach((labelSprite,idx) => {
            if(labelSprite.material) ANIME_REF({ targets: labelSprite.material, opacity: 0.85, duration: 700, easing: 'easeOutQuad', delay: 300 + idx * 20});
        });
    } else if (typeof cornerLabelsGroup_SM !== 'undefined' && cornerLabelsGroup_SM) {
        cornerLabelsGroup_SM.visible = (currentViewMode === 'full' || currentViewMode === 'edges');
    }

    if (typeof updateShapeInfo === 'function') updateShapeInfo(shapeInfo.name, shapeInfo.faces, shapeInfo.edges);
}

function setViewMode(mode, forceNoAnimation = false) {
    currentActiveDemoFunction = null; 
    currentViewMode = mode;
    if (demoGroup) demoGroup.visible = false;
    if (mainShapeGroup) mainShapeGroup.visible = true;
    cleanDynamicElements_M(); 

    if (typeof setActiveViewModeButton === 'function') setActiveViewModeButton(mode);
    if (typeof setCreateEdgePanelVisibility_UM === 'function') {
        setCreateEdgePanelVisibility_UM(mode === 'edges');
    }


    if (!currentShapeMesh) return; 

    currentShapeMaterial_SM = createShapeMaterial_SM(getShapesDataSM()[currentShapeMesh.userData.shapeKey], mode);
    currentEdgesMaterial_SM = createEdgesMaterial_SM(getShapesDataSM()[currentShapeMesh.userData.shapeKey]);
    
    if(currentShapeMesh) currentShapeMesh.material = currentShapeMaterial_SM;
    if(currentEdgesMesh) currentEdgesMesh.material = currentEdgesMaterial_SM;

    const childrenToKeep = [cornerLabelsGroup_SM, dynamicPointsGroup_M, customEdgesGroup_M].filter(Boolean);
    mainShapeGroup.children.slice().forEach(child => {
        if (!childrenToKeep.includes(child) && child !== currentShapeMesh && child !== currentEdgesMesh) { 
            mainShapeGroup.remove(child);
        }
    });


    if (mode === 'edges') { // X-ray mode
        if (currentEdgesMesh) {
            if(!mainShapeGroup.children.includes(currentEdgesMesh)) mainShapeGroup.add(currentEdgesMesh);
            currentShapeMesh.visible = false;
            currentEdgesMesh.visible = true;
        } else { 
            if(!mainShapeGroup.children.includes(currentShapeMesh)) mainShapeGroup.add(currentShapeMesh);
            currentShapeMesh.visible = true; 
             if(currentEdgesMesh) currentEdgesMesh.visible = false; 
        }
        if(typeof cornerLabelsGroup_SM !== 'undefined' && cornerLabelsGroup_SM) cornerLabelsGroup_SM.visible = true; // Visible in X-ray
        if(dynamicPointsGroup_M) dynamicPointsGroup_M.visible = true; // Visible in X-ray

    } else { // mode === 'full'
        if(!mainShapeGroup.children.includes(currentShapeMesh)) mainShapeGroup.add(currentShapeMesh);
        currentShapeMesh.visible = true;
        if(currentEdgesMesh) currentEdgesMesh.visible = false;
        if(typeof cornerLabelsGroup_SM !== 'undefined' && cornerLabelsGroup_SM) cornerLabelsGroup_SM.visible = true; // Visible in Full
        if(dynamicPointsGroup_M) dynamicPointsGroup_M.visible = true; // Visible in Full
    }

    resetHighlights_SM(currentShapeMesh, currentEdgesMesh, currentViewMode);


    if (!forceNoAnimation) {
        mainShapeGroup.scale.set(0.01,0.01,0.01);
        if (currentShapeMesh && currentShapeMesh.material) currentShapeMesh.material.opacity = 0;
        if (currentEdgesMesh && currentEdgesMesh.material) currentEdgesMesh.material.opacity = 0;
        if(typeof cornerLabelsGroup_SM !== 'undefined' && cornerLabelsGroup_SM) {
            cornerLabelsGroup_SM.children.forEach(l=> {if(l.material) l.material.opacity = 0;});
        }
        if(dynamicPointsGroup_M){
             dynamicPointsGroup_M.children.forEach(p => { if(p.material) p.material.opacity = 0; if(p.userData.spriteLabel && p.userData.spriteLabel.material) p.userData.spriteLabel.material.opacity = 0; });
        }


        ANIME_REF({ targets: mainShapeGroup.scale, x:1, y:1, z:1, duration: 500, easing: 'easeOutExpo'});

        if (currentShapeMesh && currentShapeMesh.visible && currentShapeMesh.material) {
            ANIME_REF({ targets: currentShapeMesh.material, opacity:1, duration: 400, delay: 100, easing: 'easeOutQuad'});
        }
        if (currentEdgesMesh && currentEdgesMesh.visible && currentEdgesMesh.material) {
            ANIME_REF({ targets: currentEdgesMesh.material, opacity:1, duration: 400, delay: 100, easing: 'easeOutQuad'});
        }
        if(typeof cornerLabelsGroup_SM !== 'undefined' && cornerLabelsGroup_SM && cornerLabelsGroup_SM.visible) {
             cornerLabelsGroup_SM.children.forEach(labelSprite => {
                if(labelSprite.material) ANIME_REF({ targets: labelSprite.material, opacity: 0.85, duration: 400, delay:150, easing: 'easeOutQuad' });
            });
        }
        if(dynamicPointsGroup_M && dynamicPointsGroup_M.visible){
            dynamicPointsGroup_M.children.forEach(p => {
                 if(p.material) ANIME_REF({ targets: p.material, opacity:1, duration: 400, delay: 100, easing: 'easeOutQuad'});
                 if(p.userData.spriteLabel && p.userData.spriteLabel.material) ANIME_REF({ targets: p.userData.spriteLabel.material, opacity: 0.85, duration: 400, delay:150, easing: 'easeOutQuad' });
            });
        }

    } else {
        mainShapeGroup.scale.set(1,1,1);
        if (currentShapeMesh && currentShapeMesh.material) currentShapeMesh.material.opacity = 1;
        if (currentEdgesMesh && currentEdgesMesh.material) currentEdgesMesh.material.opacity = 1;
        if(typeof cornerLabelsGroup_SM !== 'undefined' && cornerLabelsGroup_SM && cornerLabelsGroup_SM.visible) {
             cornerLabelsGroup_SM.children.forEach(label => {if(label.material)label.material.opacity = 0.85;});
        }
         if(dynamicPointsGroup_M && dynamicPointsGroup_M.visible){
            dynamicPointsGroup_M.children.forEach(p => {
                 if(p.material) p.material.opacity = 1;
                 if(p.userData.spriteLabel && p.userData.spriteLabel.material) p.userData.spriteLabel.material.opacity = 0.85;
            });
        }
    }
}

// --- Axiom and Demo Invocation ---
function runAxiom1_main() {
    resetAll_main(); hideMainShape(); if(demoGroup) demoGroup.visible = true;
    currentActiveDemoFunction = runAxiom1_main;
    if (typeof updateDemoExplanation === 'function') updateDemoExplanation(`<strong>Axiome 1 :</strong> Par deux points distincts A et B de l'espace passe une seule droite. (Déplacez A et B).`);
    if (typeof runAxiom1_AC === 'function') runAxiom1_AC(); 
}

function runAxiom2_main() {
    resetAll_main(); hideMainShape(); if(demoGroup) demoGroup.visible = true;
    currentActiveDemoFunction = runAxiom2_main;
    if (typeof updateDemoExplanation === 'function') updateDemoExplanation(`<strong>Axiome 2 :</strong> Trois points non alignés A, B, C définissent un plan unique. (Déplacez A, B, C).`);
    if (typeof runAxiom2_AC === 'function') runAxiom2_AC(); 
}

function runAxiom3_main() {
    resetAll_main(); hideMainShape(); if(demoGroup) demoGroup.visible = true;
    currentActiveDemoFunction = runAxiom3_main;
    if (typeof updateDemoExplanation === 'function') updateDemoExplanation(`<strong>Axiome 3 :</strong> Si A et B sont 2 pts d'un plan (P), la droite (AB) est ds (P). (Déplacez A et B sur le plan horizontal).`);
    if (typeof runAxiom3_AC === 'function') runAxiom3_AC(); 
}

function runLinesCoplanarIntersecting_main() {
    resetAll_main(); hideMainShape(); if (demoGroup) demoGroup.visible = true;
    currentActiveDemoFunction = runLinesCoplanarIntersecting_main;
    if (typeof updateDemoExplanation === 'function') updateDemoExplanation("<strong>D et Δ Sécantes (coplanaires):</strong> Deux droites sont sécantes si elles sont dans le même plan et ont un unique point commun, leur point d'intersection (I).");
    if (typeof runLinesCoplanarIntersecting_RP === 'function') runLinesCoplanarIntersecting_RP(); 
}

function runLinesCoplanarStrictlyParallel_main() {
    resetAll_main(); hideMainShape(); if (demoGroup) demoGroup.visible = true;
    currentActiveDemoFunction = runLinesCoplanarStrictlyParallel_main;
    if (typeof updateDemoExplanation === 'function') updateDemoExplanation("<strong>D et Δ Strictement Parallèles:</strong> Deux droites sont strictement parallèles si elles sont dans le même plan, n'ont aucun point commun et ont la même direction.");
    if (typeof runLinesCoplanarStrictlyParallel_RP === 'function') runLinesCoplanarStrictlyParallel_RP(); 
}

function runLinesCoplanarCoincident_main() {
    resetAll_main(); hideMainShape(); if (demoGroup) demoGroup.visible = true;
    currentActiveDemoFunction = runLinesCoplanarCoincident_main;
    if (typeof updateDemoExplanation === 'function') updateDemoExplanation("<strong>D et Δ Confondues:</strong> Deux droites sont confondues si elles sont dans le même plan et tous leurs points sont communs (elles sont identiques).");
    if (typeof runLinesCoplanarCoincident_RP === 'function') runLinesCoplanarCoincident_RP(); 
}

function runPlanesStrictlyParallel_main() {
    resetAll_main(); hideMainShape(); if (demoGroup) demoGroup.visible = true;
    currentActiveDemoFunction = runPlanesStrictlyParallel_main;
    if (typeof updateDemoExplanation === 'function') updateDemoExplanation("<strong>𝒫 et 𝒬 Strictement Parallèles:</strong> Deux plans sont strictement parallèles s'ils n'ont aucun point commun.");
    if (typeof runPlanesStrictlyParallel_RP === 'function') runPlanesStrictlyParallel_RP();
}

function runPlanesCoincident_main() {
    resetAll_main(); hideMainShape(); if (demoGroup) demoGroup.visible = true;
    currentActiveDemoFunction = runPlanesCoincident_main;
    if (typeof updateDemoExplanation === 'function') updateDemoExplanation("<strong>𝒫 et 𝒬 Confondus:</strong> Deux plans sont confondus si tous leurs points sont communs (ils sont identiques).");
    if (typeof runPlanesCoincident_RP === 'function') runPlanesCoincident_RP();
}

function runPlanesIntersecting_main() {
    resetAll_main(); hideMainShape(); if (demoGroup) demoGroup.visible = true;
    currentActiveDemoFunction = runPlanesIntersecting_main;
    if (typeof updateDemoExplanation === 'function') updateDemoExplanation("<strong>𝒫 et 𝒬 Sécants:</strong> Deux plans sont sécants si leur intersection est une droite.");
    if (typeof runPlanesIntersecting_RP === 'function') runPlanesIntersecting_RP();
}

function runLinePlaneStrictlyParallel_main() {
    resetAll_main(); hideMainShape(); if (demoGroup) demoGroup.visible = true;
    currentActiveDemoFunction = runLinePlaneStrictlyParallel_main;
    if (typeof updateDemoExplanation === 'function') updateDemoExplanation("<strong>Droite 𝓓 strictement parallèle au Plan 𝒫:</strong> La droite et le plan n'ont aucun point commun. (Déplacez les points A et B de 𝓓).");
    if (typeof runLinePlaneStrictlyParallel_RP === 'function') runLinePlaneStrictlyParallel_RP();
}

function runLinePlaneIncluded_main() {
    resetAll_main(); hideMainShape(); if (demoGroup) demoGroup.visible = true;
    currentActiveDemoFunction = runLinePlaneIncluded_main;
    if (typeof updateDemoExplanation === 'function') updateDemoExplanation("<strong>Droite 𝓓 incluse dans le Plan 𝒫:</strong> Tous les points de la droite appartiennent au plan. (Déplacez les points A et B de 𝓓).");
    if (typeof runLinePlaneIncluded_RP === 'function') runLinePlaneIncluded_RP();
}

function runLinePlaneIntersecting_main() {
    resetAll_main(); hideMainShape(); if (demoGroup) demoGroup.visible = true;
    currentActiveDemoFunction = runLinePlaneIntersecting_main;
    if (typeof updateDemoExplanation === 'function') updateDemoExplanation("<strong>Droite 𝓓 et Plan 𝒫 sécants:</strong> La droite et le plan ont un unique point commun A. (Déplacez les points de 𝓓).");
    if (typeof runLinePlaneIntersecting_RP === 'function') runLinePlaneIntersecting_RP();
}

// New Property Demo Main Functions
function runPropTransitivityParallelLines_main() {
    resetAll_main(); hideMainShape(); if (demoGroup) demoGroup.visible = true;
    currentActiveDemoFunction = runPropTransitivityParallelLines_main;
    if (typeof updateDemoExplanation === 'function') updateDemoExplanation("<strong>Propriété: Transitivité du Parallélisme (Droites)</strong><br>Si (d₁) // (d') et (d₂) // (d'), alors (d₁) // (d₂).");
    if (typeof runTransitivityParallelLines_RP === 'function') runTransitivityParallelLines_RP();
}
function runPropLineParallelToPlaneViaLine_main() {
    resetAll_main(); hideMainShape(); if (demoGroup) demoGroup.visible = true;
    currentActiveDemoFunction = runPropLineParallelToPlaneViaLine_main;
    if (typeof updateDemoExplanation === 'function') updateDemoExplanation("<strong>Propriété: Droite // Plan (via droite incluse)</strong><br> (d) // (𝒫) ⇔ (d) // (d') avec (d') ⊂ (𝒫).");
    if (typeof runLineParallelToPlaneViaIncludedLine_RP === 'function') runLineParallelToPlaneViaIncludedLine_RP();
}
function runPropPlaneIntersectingParallelLines_main() {
    resetAll_main(); hideMainShape(); if (demoGroup) demoGroup.visible = true;
    currentActiveDemoFunction = runPropPlaneIntersectingParallelLines_main;
    if (typeof updateDemoExplanation === 'function') updateDemoExplanation("<strong>Propriété: Plan Sécant à Droites Parallèles</strong><br>Si (d) // (d') et (𝒫) coupe (d), alors (𝒫) coupe (d').");
    if (typeof runPlaneIntersectingParallelLines_RP === 'function') runPlaneIntersectingParallelLines_RP();
}
function runPropRoofTheorem_main() {
    resetAll_main(); hideMainShape(); if (demoGroup) demoGroup.visible = true;
    currentActiveDemoFunction = runPropRoofTheorem_main;
    if (typeof updateDemoExplanation === 'function') updateDemoExplanation("<strong>Théorème du Toit:</strong><br>Si (d₁) // (d₂), (d₁)⊂𝒫₁, (d₂)⊂𝒫₂, et 𝒫₁∩𝒫₂ = Δ, alors Δ // (d₁) // (d₂).");
    if (typeof runRoofTheorem_RP === 'function') runRoofTheorem_RP();
}


// --- Reset and Party Mode ---
function resetAll_main() {
    if (typeof clearDemoGroup_AU === 'function') clearDemoGroup_AU(); 
    if(demoGroup) demoGroup.visible = false;
    if (typeof clearCornerLabels_SM === 'function') clearCornerLabels_SM(); 
    cleanDynamicElements_M(); 
    usedLabels_M.clear(); 

    if (currentShapeMesh && currentShapeMesh.userData.shapeKey) {
        if(mainShapeGroup) mainShapeGroup.visible = true;
        setViewMode(currentViewMode, true); 
    } else {
        if(mainShapeGroup) mainShapeGroup.visible = false;
    }
    if (typeof updateDemoExplanation === 'function') updateDemoExplanation("Prêt pour l'exploration.");
    if(controls) controls.target.set(0, 0, 0);
    if(ANIME_REF && camera) ANIME_REF({ targets: camera.position, x: 0, y: 2.5, z: 8, duration: 500, easing: 'easeOutQuad' });
    
    isMiddlePointModeActive_M = false;
    if (typeof setMiddlePointModeButtonState === 'function') setMiddlePointModeButtonState(false);
    isMeasureModeActive_M = false;
    firstMeasurePoint_M = null;
    if (typeof setMeasureModeButtonState === 'function') setMeasureModeButtonState(false);

     if (typeof setCreateEdgePanelVisibility_UM === 'function') {
        setCreateEdgePanelVisibility_UM(currentViewMode === 'edges');
    }
}

function togglePartyMode() {
    const isActive = !!partyInterval;
    if (typeof setPartyModeButtonState === 'function') setPartyModeButtonState(!isActive);

    if (isActive) {
        clearInterval(partyInterval);
        partyInterval = null;
        document.body.style.backgroundColor = getCSSVariable_M('--bg-darkest'); 
        if (currentShapeMesh && currentShapeMesh.userData.shapeKey) {
            setViewMode(currentViewMode, true); 
        } else {
            if (typeof resetHighlights_SM === 'function') resetHighlights_SM(currentShapeMesh, currentEdgesMesh, currentViewMode);
        }
    } else {
        partyInterval = setInterval(() => {
            const partyHue = Math.random();
            const partyColor = new THREE.Color().setHSL(partyHue, 1.0, 0.6);
            const partyBodyColor = new THREE.Color().setHSL(partyHue, 0.7, 0.1);
            document.body.style.backgroundColor = partyBodyColor.getStyle();

            const shapeMaterial = getCurrentShapeMaterialSM();
            const edgesMaterial = getCurrentEdgesMaterialSM();

            if (currentShapeMesh && currentShapeMesh.visible && currentShapeMesh.geometry.attributes.color) {
                const colors = currentShapeMesh.geometry.attributes.color;
                for (let i = 0; i < colors.count; i++) colors.setXYZ(i, partyColor.r, partyColor.g, partyColor.b);
                colors.needsUpdate = true;
                if (shapeMaterial) shapeMaterial.color.copy(partyColor);
                ANIME_REF({ targets: mainShapeGroup.rotation, x: `+=${Math.random()*0.8-0.4}`, y: `+=${Math.random()*1.2-0.6}`, duration: 550, easing: 'easeInOutQuad' });
            }
            if (currentEdgesMesh && currentEdgesMesh.visible && currentEdgesMesh.geometry.attributes.color) {
                const edgePartyColor = new THREE.Color().setHSL(partyHue, 1.0, 0.8);
                const colors = currentEdgesMesh.geometry.attributes.color;
                for (let i = 0; i < colors.count; i++) colors.setXYZ(i, edgePartyColor.r, edgePartyColor.g, edgePartyColor.b);
                colors.needsUpdate = true;
                if (edgesMaterial) edgesMaterial.color.copy(edgePartyColor);
                 ANIME_REF({ targets: mainShapeGroup.rotation, x: `+=${Math.random()*0.8-0.4}`, y: `+=${Math.random()*1.2-0.6}`, duration: 550, easing: 'easeInOutQuad' });
            }
            if (Math.random() < 0.03) {
                const shapesData = getShapesDataSM();
                const keys = Object.keys(shapesData);
                if (keys.length > 0) {
                    const randomKey = keys[Math.floor(Math.random() * keys.length)];
                    const shapeSelectorElement = document.getElementById('shape-selector');
                    if (shapeSelectorElement && shapeSelectorElement.value !== randomKey) {
                        shapeSelectorElement.value = randomKey; switchShape(randomKey);
                    }
                }
            }
        }, 550);
    }
}

// --- Core Loop and Resize ---
function onWindowResize() {
    const container = document.getElementById('container');
    if (camera && renderer && container) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }
}

function animate() {
    requestAnimationFrame(animate);
    if (controls && controls.enabled) controls.update();

    const time = performance.now();
    fpsFrames++;
    if (time >= fpsLastTime + 1000) {
        const cFps = (fpsFrames * 1000) / (time - fpsLastTime);
        minFps = Math.min(minFps, cFps);
        if (maxFps === 0 || (cFps > maxFps && fpsFrames > 10)) maxFps = cFps;

        if (typeof updateFPSDisplay === 'function') updateFPSDisplay(cFps, minFps, maxFps, cFps/60);

        fpsLastTime = time;
        fpsFrames = 0;
    }
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// --- Undo/Redo Functionality ---
class AddDynamicPointCommand {
    constructor(pointMesh) {
        this.pointMesh = pointMesh;
        this.type = 'AddDynamicPointCommand';
    }
    execute() { 
        dynamicPointsGroup_M.add(this.pointMesh); 
        if (!this.pointMesh.parent) dynamicPointsGroup_M.add(this.pointMesh);
        registerLabel_M(this.pointMesh.userData.labelName);
        this.pointMesh.visible = true;
    }
    undo() {
        unregisterLabel_M(this.pointMesh.userData.labelName);
        dynamicPointsGroup_M.remove(this.pointMesh);
        this.pointMesh.visible = false;
    }
}

class AddCustomEdgeCommand {
    constructor(edgeMesh) {
        this.edgeMesh = edgeMesh;
        this.type = 'AddCustomEdgeCommand';
    }
    execute() {
        customEdgesGroup_M.add(this.edgeMesh);
        if (!this.edgeMesh.parent) customEdgesGroup_M.add(this.edgeMesh);
        this.edgeMesh.visible = true;
    }
    undo() {
        customEdgesGroup_M.remove(this.edgeMesh);
        this.edgeMesh.visible = false;
    }
}

class RenameLabelCommand {
    constructor(labelSprite, oldLabel, newLabel) {
        this.labelSprite = labelSprite;
        this.oldLabel = oldLabel;
        this.newLabel = newLabel;
        this.type = 'RenameLabelCommand';
    }

    execute() {
        const success = performLabelRename_M(this.labelSprite, this.newLabel, this.oldLabel);
        if (!success) { // Should not happen if prompt validation is correct
            console.warn("RenameLabelCommand: execute failed, label might be in use.");
            // Attempt to revert registration state to be safe
            unregisterLabel_M(this.newLabel);
            registerLabel_M(this.oldLabel);
        }
    }

    undo() {
        const success = performLabelRename_M(this.labelSprite, this.oldLabel, this.newLabel);
         if (!success) {
            console.warn("RenameLabelCommand: undo failed, label might be in use.");
            // Attempt to revert registration state
            unregisterLabel_M(this.oldLabel);
            registerLabel_M(this.newLabel);
        }
    }
}


function executeCommand_M(command) {
    command.execute();
    historyStack_M = historyStack_M.slice(0, historyIndex_M + 1); // Clear redo history
    historyStack_M.push(command);
    if (historyStack_M.length > MAX_HISTORY_M) {
        historyStack_M.shift(); // Limit history size
    }
    historyIndex_M = historyStack_M.length - 1;
    updateUndoRedoButtons_M();
}

function undo_M() {
    if (historyIndex_M >= 0) {
        const command = historyStack_M[historyIndex_M];
        command.undo();
        historyIndex_M--;
        updateUndoRedoButtons_M();
        if (typeof updateDemoExplanation === 'function') updateDemoExplanation("Dernière action annulée.");
    }
}

function redo_M() {
    if (historyIndex_M < historyStack_M.length - 1) {
        historyIndex_M++;
        const command = historyStack_M[historyIndex_M];
        command.execute(); // Re-execute
        updateUndoRedoButtons_M();
        if (typeof updateDemoExplanation === 'function') updateDemoExplanation("Dernière action rétablie.");
    }
}

function updateUndoRedoButtons_M() {
    const canUndo = historyIndex_M >= 0;
    const canRedo = historyIndex_M < historyStack_M.length - 1;
    if (typeof setUndoRedoButtonStates_UM === 'function') {
        setUndoRedoButtonStates_UM(canUndo, canRedo);
    }
}

function onKeyDown_M(event) {
    if (event.ctrlKey || event.metaKey) { // Meta for Mac
        if (event.key === 'z' || event.key === 'Z') {
            event.preventDefault();
            if (event.shiftKey) {
                redo_M();
            } else {
                undo_M();
            }
        } else if (event.key === 'y' || event.key === 'Y') {
            event.preventDefault();
            redo_M();
        }
    }
}