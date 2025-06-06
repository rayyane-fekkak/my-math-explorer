
// UI Elements (to be initialized in main.js and passed or made accessible)
let shapeSelector, shapeNameDisplay, facesCountDisplay, edgesCountDisplay;
let demoExplanation;
let btnViewFull, btnViewEdges; // Removed btnViewWireframe
let btnPartyMode;
let hiddenMenuToggle, hiddenMenuPanel;
let mainUiPanelToggle, uiPanel; // For mobile UI
let btnAxiom1, btnAxiom2, btnAxiom3;
let btnLinesCoplanarIntersecting, btnLinesCoplanarStrictlyParallel, btnLinesCoplanarCoincident;
let btnPlanesStrictlyParallel, btnPlanesCoincident, btnPlanesIntersecting;
let btnLinePlaneStrictlyParallel, btnLinePlaneIncluded, btnLinePlaneIntersecting; 

// New Property Buttons
let btnPropTransitivityParallelLines, btnPropLineParallelToPlaneViaLine, 
    btnPropPlaneIntersectingParallelLines, btnPropRoofTheorem;


// Interaction Tools
let btnMiddlePointMode;
let btnMeasureMode; 
let btnToggleAxesHelper; 
let btnCleanDynamicPoints; 
let dynamicPointsInfoDisplay;
let btnUndo, btnRedo; // New

// Create Edge Panel
let createEdgePanel, edgePoint1Input, edgePoint2Input, btnCreateEdge;


// Color customization elements
let mainFillColorPicker, mainEdgeColorPicker; 
let colorCustomizationPanel; 
let visualOptionsPanel; 
let labelFontSizeInput; 
let applyAdvancedOptionsButton, resetAdvancedOptionsButton;

let fpsCurrentDisplay, fpsMinDisplay, fpsMaxDisplay, fpsGraphBar;
let mainContainer_UM; // To detect clicks outside the panel


// References to functions from other modules (will be set by main.js)
let switchShapeCallback, setViewModeCallback, togglePartyModeCallback;
let runAxiom1Callback, runAxiom2Callback, runAxiom3Callback;
let runLinesCoplanarIntersectingCallback, runLinesCoplanarStrictlyParallelCallback, 
    runLinesCoplanarCoincidentCallback;
let runPlanesStrictlyParallelCallback, runPlanesCoincidentCallback, runPlanesIntersectingCallback;
let runLinePlaneStrictlyParallelCallback, runLinePlaneIncludedCallback, runLinePlaneIntersectingCallback; 

// New Property Callbacks
let runPropTransitivityParallelLinesCallback, runPropLineParallelToPlaneViaLineCallback,
    runPropPlaneIntersectingParallelLinesCallback, runPropRoofTheoremCallback;


let toggleMiddlePointModeCallback; 
let toggleMeasureModeCallback_M; 
let toggleAxesHelperCallback_M; 
let cleanDynamicElementsCallback; 
let createCustomEdgeCallback; 
let undoCallback, redoCallback; // New

let applyAdvancedOptionsCallback_M, resetAdvancedOptionsCallback_M;
let updateSceneColorsCallback; 

const advancedOptionsMap_UM = { 
  'main-shape-fill': { label: 'Remplissage Forme (Défaut)', cssVar: '--main-shape-fill-color', default: '#4682B4', type: 'color' },
  'main-shape-edge': { label: 'Arêtes Forme (Défaut)', cssVar: '--main-shape-edge-color', default: '#FFFFFF', type: 'color' },
  
  'line': { label: 'Lignes (Démos)', cssVar: '--line-color', default: '#FFFACD', type: 'color' },
  'plane': { label: 'Plans (Démos)', cssVar: '--plane-color', default: 'rgba(135, 206, 250, 0.5)', type: 'color' },
  'accent-primary': { label: 'Accent (Démos)', cssVar: '--accent-primary', default: '#00A9FF', type: 'color' },
  'custom-edge': { label: 'Arêtes Perso.', cssVar: '--custom-edge-color', default: '#9932CC', type: 'color' },
  'demo-point-a': { label: 'Point A (Démos)', cssVar: '--point-color-a', default: '#FF6347', type: 'color' },
  'demo-point-b': { label: 'Point B (Démos)', cssVar: '--point-color-b', default: '#4682B4', type: 'color' },
  'demo-point-c': { label: 'Point C (Démos)', cssVar: '--point-color-c', default: '#32CD32', type: 'color' },
  'demo-point-d': { label: 'Point D (Démos)', cssVar: '--point-color-d', default: '#FFD700', type: 'color' },

  'scene-bg': { label: 'Fond Scène', cssVar: '--bg-darkest', default: '#0D1B2A', type: 'color' },
  'ambient-light': { label: 'Lumière Ambiante', cssVar: '--ambient-light-color', default: '#606070', type: 'color' },
  'point-light': { label: 'Lumière Ponctuelle', cssVar: '--point-light-color', default: '#FFF0E0', type: 'color' },
  'directional-light': { label: 'Lumière Directionnelle', cssVar: '--directional-light-color', default: '#DDEEFF', type: 'color' },
  'dynamic-point': { label: 'Points Dynamiques', cssVar: '--dynamic-point-color', default: '#FF69B4', type: 'color' },


  'label-font-size': { label: 'Taille Étiquettes (px)', cssVar: '--label-font-size', default: '20px', type: 'number', min: 8, max: 72, step: 1, elId: 'label-font-size-input' }
};

function getCSSVariableValue_UM(varName) { 
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

function initializeUIElements() {
    shapeSelector = document.getElementById('shape-selector');
    shapeNameDisplay = document.getElementById('shape-name');
    facesCountDisplay = document.getElementById('faces-count');
    edgesCountDisplay = document.getElementById('edges-count');
    demoExplanation = document.getElementById('demo-explanation');

    btnViewFull = document.getElementById('view-mode-full');
    btnViewEdges = document.getElementById('view-mode-edges');

    btnPartyMode = document.getElementById('party-mode');

    mainUiPanelToggle = document.getElementById('main-ui-panel-toggle'); // For mobile
    uiPanel = document.getElementById('ui-panel'); // The main UI panel

    hiddenMenuToggle = document.getElementById('hidden-menu-toggle'); // Gear button
    hiddenMenuPanel = document.getElementById('hidden-menu-panel'); // Advanced options

    btnAxiom1 = document.getElementById('run-axiom-1');
    btnAxiom2 = document.getElementById('run-axiom-2');
    btnAxiom3 = document.getElementById('run-axiom-3');

    btnLinesCoplanarIntersecting = document.getElementById('lines-coplanar-intersecting');
    btnLinesCoplanarStrictlyParallel = document.getElementById('lines-coplanar-strictly-parallel');
    btnLinesCoplanarCoincident = document.getElementById('lines-coplanar-coincident');

    btnPlanesStrictlyParallel = document.getElementById('planes-strictly-parallel');
    btnPlanesCoincident = document.getElementById('planes-coincident');
    btnPlanesIntersecting = document.getElementById('planes-intersecting');

    btnLinePlaneStrictlyParallel = document.getElementById('line-plane-strictly-parallel');
    btnLinePlaneIncluded = document.getElementById('line-plane-included');
    btnLinePlaneIntersecting = document.getElementById('line-plane-intersecting');

    // New Property Buttons
    btnPropTransitivityParallelLines = document.getElementById('prop-transitivity-parallel-lines');
    btnPropLineParallelToPlaneViaLine = document.getElementById('prop-line-parallel-plane-via-line');
    btnPropPlaneIntersectingParallelLines = document.getElementById('prop-plane-intersecting-parallel-lines');
    btnPropRoofTheorem = document.getElementById('prop-roof-theorem');


    btnMiddlePointMode = document.getElementById('middle-point-mode');
    btnMeasureMode = document.getElementById('measure-mode-button'); 
    btnToggleAxesHelper = document.getElementById('toggle-axes-helper-button'); 
    btnCleanDynamicPoints = document.getElementById('clean-dynamic-points-button'); 
    dynamicPointsInfoDisplay = document.getElementById('dynamic-points-info');
    btnUndo = document.getElementById('undo-button');
    btnRedo = document.getElementById('redo-button');


    // Create Edge Panel Elements
    createEdgePanel = document.getElementById('create-edge-panel');
    edgePoint1Input = document.getElementById('edge-point1-input');
    edgePoint2Input = document.getElementById('edge-point2-input');
    btnCreateEdge = document.getElementById('create-edge-button');


    fpsCurrentDisplay = document.getElementById('fps-current');
    fpsMinDisplay = document.getElementById('fps-min');
    fpsMaxDisplay = document.getElementById('fps-max');
    fpsGraphBar = document.getElementById('fps-graph-bar');
    mainContainer_UM = document.getElementById('container');


    mainFillColorPicker = document.getElementById('main-fill-color-picker');
    mainEdgeColorPicker = document.getElementById('main-edge-color-picker');
    
    colorCustomizationPanel = document.getElementById('color-customization-panel');
    visualOptionsPanel = document.getElementById('visual-options-panel'); 
    labelFontSizeInput = document.getElementById('label-font-size-input');
    applyAdvancedOptionsButton = document.getElementById('apply-advanced-options-button');
    resetAdvancedOptionsButton = document.getElementById('reset-advanced-options-button');

    createAdvancedPanelControls();
    populateAdvancedOptions_UM(); 
}

function createAdvancedPanelControls() {
    if (!colorCustomizationPanel || !visualOptionsPanel) return;
    colorCustomizationPanel.innerHTML = ''; 
    
    const colorCategories = {
        demoObject: 'Objets de Démonstration',
        sceneLighting: 'Scène et Lumières',
        dynamicElements: 'Éléments Dynamiques'
    };
    
    let currentCategoryKey = null;

    for (const key in advancedOptionsMap_UM) {
        const item = advancedOptionsMap_UM[key];
        if (item.cssVar === '--main-shape-fill-color' || item.cssVar === '--main-shape-edge-color') continue;
        if (item.type === 'number') continue;

        let itemCategoryKey;
        if (key.includes('demo-point') || key === 'line' || key === 'plane' || key === 'accent-primary') {
            itemCategoryKey = 'demoObject';
        } else if (key.includes('light') || key === 'scene-bg') {
            itemCategoryKey = 'sceneLighting';
        } else if (key === 'dynamic-point' || key === 'custom-edge') {
            itemCategoryKey = 'dynamicElements';
        } else {
            itemCategoryKey = 'other'; // Fallback category
        }
        
        if (itemCategoryKey !== currentCategoryKey && item.type ==='color') {
            currentCategoryKey = itemCategoryKey;
            const subHeading = document.createElement('h5');
            subHeading.textContent = colorCategories[currentCategoryKey] || 'Couleurs Diverses';
            colorCustomizationPanel.appendChild(subHeading);
        }
        
        if (item.type === 'color') {
            const container = document.createElement('div');
            container.className = 'color-picker-container';

            const label = document.createElement('label');
            label.htmlFor = `adv-picker-${key}`;
            label.textContent = `${item.label}:`;

            const picker = document.createElement('input');
            picker.type = 'color';
            picker.id = `adv-picker-${key}`; 
            picker.dataset.cssVar = item.cssVar;
            picker.setAttribute('aria-label', item.label);
            
            let initialValue = item.default;
            if (initialValue.startsWith('rgba')) {
                const match = initialValue.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
                if (match) {
                    const r = parseInt(match[1]).toString(16).padStart(2, '0');
                    const g = parseInt(match[2]).toString(16).padStart(2, '0');
                    const b = parseInt(match[3]).toString(16).padStart(2, '0');
                    initialValue = `#${r}${g}${b}`;
                } else { 
                    initialValue = '#FFFFFF'; 
                }
            }
            picker.value = initialValue;

            container.appendChild(label);
            container.appendChild(picker);
            colorCustomizationPanel.appendChild(container);
        }
    }
}


function populateAdvancedOptions_UM() { 
    for (const key in advancedOptionsMap_UM) {
        const item = advancedOptionsMap_UM[key];
        
        if (item.cssVar === '--main-shape-fill-color' || item.cssVar === '--main-shape-edge-color') {
             const picker = item.cssVar === '--main-shape-fill-color' ? mainFillColorPicker : mainEdgeColorPicker;
             if(picker) picker.value = getCSSVariableValue_UM(item.cssVar) || item.default;
             continue;
        }


        if (item.type === 'color') {
            const picker = document.getElementById(`adv-picker-${key}`);
            if (picker) {
                let currentColor = getCSSVariableValue_UM(item.cssVar) || item.default; 
                 if (currentColor.startsWith('rgba')) {
                     const match = currentColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
                    if (match) {
                        const r = parseInt(match[1]).toString(16).padStart(2, '0');
                        const g = parseInt(match[2]).toString(16).padStart(2, '0');
                        const b = parseInt(match[3]).toString(16).padStart(2, '0');
                        currentColor = `#${r}${g}${b}`;
                    } else { 
                        currentColor = item.default.startsWith('rgba') ? '#FFFFFF' : item.default; 
                    }
                }
                picker.value = currentColor;
            }
        } else if (item.type === 'number' && item.elId) {
            const inputEl = document.getElementById(item.elId);
            if (inputEl) {
                let currentValue = getCSSVariableValue_UM(item.cssVar) || item.default;
                inputEl.value = parseFloat(currentValue) || parseFloat(item.default);
            }
        }
    }
}


function setupEventListeners(callbacks) {
    switchShapeCallback = callbacks.switchShape;
    setViewModeCallback = callbacks.setViewMode;
    togglePartyModeCallback = callbacks.togglePartyMode;
    runAxiom1Callback = callbacks.runAxiom1;
    runAxiom2Callback = callbacks.runAxiom2;
    runAxiom3Callback = callbacks.runAxiom3;
    
    runLinesCoplanarIntersectingCallback = callbacks.runLinesCoplanarIntersecting;
    runLinesCoplanarStrictlyParallelCallback = callbacks.runLinesCoplanarStrictlyParallel;
    runLinesCoplanarCoincidentCallback = callbacks.runLinesCoplanarCoincident;

    runPlanesStrictlyParallelCallback = callbacks.runPlanesStrictlyParallel;
    runPlanesCoincidentCallback = callbacks.runPlanesCoincident;
    runPlanesIntersectingCallback = callbacks.runPlanesIntersecting;

    runLinePlaneStrictlyParallelCallback = callbacks.runLinePlaneStrictlyParallel; 
    runLinePlaneIncludedCallback = callbacks.runLinePlaneIncluded; 
    runLinePlaneIntersectingCallback = callbacks.runLinePlaneIntersecting; 

    // New Property Callbacks
    runPropTransitivityParallelLinesCallback = callbacks.runPropTransitivityParallelLines;
    runPropLineParallelToPlaneViaLineCallback = callbacks.runPropLineParallelToPlaneViaLine;
    runPropPlaneIntersectingParallelLinesCallback = callbacks.runPropPlaneIntersectingParallelLines;
    runPropRoofTheoremCallback = callbacks.runPropRoofTheorem;


    toggleMiddlePointModeCallback = callbacks.toggleMiddlePointMode;
    toggleMeasureModeCallback_M = callbacks.toggleMeasureMode; 
    toggleAxesHelperCallback_M = callbacks.toggleAxesHelper; 
    cleanDynamicElementsCallback = callbacks.cleanDynamicElements; 
    createCustomEdgeCallback = callbacks.createCustomEdge; 
    undoCallback = callbacks.undo; 
    redoCallback = callbacks.redo; 

    applyAdvancedOptionsCallback_M = callbacks.applyAdvancedOptions;
    resetAdvancedOptionsCallback_M = callbacks.resetAdvancedOptions;
    updateSceneColorsCallback = callbacks.updateSceneColors; 

    if(shapeSelector) shapeSelector.onchange = (event) => switchShapeCallback(event.target.value);

    if(btnPartyMode) btnPartyMode.onclick = togglePartyModeCallback;
    if(btnViewFull) btnViewFull.onclick = () => setViewModeCallback('full');
    if(btnViewEdges) btnViewEdges.onclick = () => setViewModeCallback('edges');

    if(btnAxiom1) btnAxiom1.onclick = runAxiom1Callback;
    if(btnAxiom2) btnAxiom2.onclick = runAxiom2Callback;
    if(btnAxiom3) btnAxiom3.onclick = runAxiom3Callback;

    if(btnLinesCoplanarIntersecting) btnLinesCoplanarIntersecting.onclick = runLinesCoplanarIntersectingCallback;
    if(btnLinesCoplanarStrictlyParallel) btnLinesCoplanarStrictlyParallel.onclick = runLinesCoplanarStrictlyParallelCallback;
    if(btnLinesCoplanarCoincident) btnLinesCoplanarCoincident.onclick = runLinesCoplanarCoincidentCallback;

    if(btnPlanesStrictlyParallel) btnPlanesStrictlyParallel.onclick = runPlanesStrictlyParallelCallback;
    if(btnPlanesCoincident) btnPlanesCoincident.onclick = runPlanesCoincidentCallback;
    if(btnPlanesIntersecting) btnPlanesIntersecting.onclick = runPlanesIntersectingCallback;

    if(btnLinePlaneStrictlyParallel) btnLinePlaneStrictlyParallel.onclick = runLinePlaneStrictlyParallelCallback; 
    if(btnLinePlaneIncluded) btnLinePlaneIncluded.onclick = runLinePlaneIncludedCallback; 
    if(btnLinePlaneIntersecting) btnLinePlaneIntersecting.onclick = runLinePlaneIntersectingCallback; 

    // New Property Button Listeners
    if(btnPropTransitivityParallelLines) btnPropTransitivityParallelLines.onclick = runPropTransitivityParallelLinesCallback;
    if(btnPropLineParallelToPlaneViaLine) btnPropLineParallelToPlaneViaLine.onclick = runPropLineParallelToPlaneViaLineCallback;
    if(btnPropPlaneIntersectingParallelLines) btnPropPlaneIntersectingParallelLines.onclick = runPropPlaneIntersectingParallelLinesCallback;
    if(btnPropRoofTheorem) btnPropRoofTheorem.onclick = runPropRoofTheoremCallback;


    if(btnMiddlePointMode) btnMiddlePointMode.onclick = toggleMiddlePointModeCallback;
    if(btnMeasureMode) btnMeasureMode.onclick = toggleMeasureModeCallback_M; 
    if(btnToggleAxesHelper) btnToggleAxesHelper.onclick = toggleAxesHelperCallback_M; 
    if(btnCleanDynamicPoints) btnCleanDynamicPoints.onclick = cleanDynamicElementsCallback; 
    if(btnCreateEdge) btnCreateEdge.onclick = createCustomEdgeCallback; 
    if(btnUndo) btnUndo.onclick = undoCallback; 
    if(btnRedo) btnRedo.onclick = redoCallback; 


    if(mainUiPanelToggle && uiPanel) { 
        mainUiPanelToggle.onclick = (event) => {
            event.stopPropagation(); // Prevent click from bubbling to container
            const isVisible = uiPanel.classList.toggle('visible');
            mainUiPanelToggle.setAttribute('aria-expanded', isVisible.toString());
            uiPanel.setAttribute('aria-hidden', (!isVisible).toString());
        };
        
        if(mainContainer_UM) {
            mainContainer_UM.addEventListener('click', () => {
                if (uiPanel.classList.contains('visible') && window.innerWidth <= 768) { // Only for mobile
                    uiPanel.classList.remove('visible');
                    mainUiPanelToggle.setAttribute('aria-expanded', 'false');
                    uiPanel.setAttribute('aria-hidden', 'true');
                }
            });
        }
        uiPanel.addEventListener('click', (event) => {
            event.stopPropagation(); 
        });
    }

    if(hiddenMenuToggle && hiddenMenuPanel) { 
        hiddenMenuToggle.onclick = (event) => {
            event.stopPropagation();
            const isVisible = hiddenMenuPanel.classList.toggle('visible');
            hiddenMenuToggle.setAttribute('aria-expanded', isVisible.toString());
            hiddenMenuPanel.setAttribute('aria-hidden', (!isVisible).toString());
        };
    }


    if (mainFillColorPicker) {
        mainFillColorPicker.oninput = () => {
            document.documentElement.style.setProperty(mainFillColorPicker.dataset.cssVar, mainFillColorPicker.value);
            if (typeof updateSceneColorsCallback === 'function') updateSceneColorsCallback();
        };
    }
    if (mainEdgeColorPicker) {
        mainEdgeColorPicker.oninput = () => {
            document.documentElement.style.setProperty(mainEdgeColorPicker.dataset.cssVar, mainEdgeColorPicker.value);
            if (typeof updateSceneColorsCallback === 'function') updateSceneColorsCallback();
        };
    }

    if (applyAdvancedOptionsButton && typeof applyAdvancedOptionsCallback_M === 'function') {
        applyAdvancedOptionsButton.onclick = applyAdvancedOptionsCallback_M;
    }
    if (resetAdvancedOptionsButton && typeof resetAdvancedOptionsCallback_M === 'function') {
        resetAdvancedOptionsButton.onclick = resetAdvancedOptionsCallback_M;
    }
}

function updateShapeInfo(name, faces, edges) {
    if(shapeNameDisplay) shapeNameDisplay.textContent = name;
    if(facesCountDisplay) facesCountDisplay.textContent = faces !== undefined ? faces : 'N/A';
    if(edgesCountDisplay) edgesCountDisplay.textContent = edges !== undefined ? edges : 'N/A';
}

function updateDemoExplanation(text) {
    if(demoExplanation) demoExplanation.innerHTML = text;
}

function setActiveViewModeButton(mode) {
    if(btnViewFull) btnViewFull.classList.remove('mode-button-active');
    if(btnViewEdges) btnViewEdges.classList.remove('mode-button-active');

    if (mode === 'full' && btnViewFull) btnViewFull.classList.add('mode-button-active');
    else if (mode === 'edges' && btnViewEdges) btnViewEdges.classList.add('mode-button-active');
}

function setPartyModeButtonState(isActive) {
    if (btnPartyMode) {
        btnPartyMode.textContent = isActive ? "Arrêter Festivités" : "Mode Festif !";
        btnPartyMode.classList.toggle('mode-button-active', isActive);
    }
}

function setMiddlePointModeButtonState(isActive) {
    if (btnMiddlePointMode) {
        btnMiddlePointMode.classList.toggle('mode-button-active', isActive);
        btnMiddlePointMode.setAttribute('aria-pressed', isActive.toString());
    }
}

function setMeasureModeButtonState(isActive) {
    if (btnMeasureMode) {
        btnMeasureMode.classList.toggle('mode-button-active', isActive);
        btnMeasureMode.setAttribute('aria-pressed', isActive.toString());
    }
}

function setToggleAxesHelperButtonState(isActive) {
    if (btnToggleAxesHelper) {
        btnToggleAxesHelper.classList.toggle('mode-button-active', isActive);
        btnToggleAxesHelper.setAttribute('aria-pressed', isActive.toString());
    }
}


function updateFPSDisplay(current, min, max, normalizedCurrent) {
    if (fpsCurrentDisplay) fpsCurrentDisplay.textContent = current.toFixed(1);
    if (fpsMinDisplay) fpsMinDisplay.textContent = min === Infinity ? '--' : min.toFixed(1);
    if (fpsMaxDisplay) fpsMaxDisplay.textContent = max === 0 ? '--' : max.toFixed(1);
    if (fpsGraphBar) fpsGraphBar.style.width = `${Math.min(100, normalizedCurrent * 100)}%`;
}

function promptForNewLabel_UM(currentLabel, validatorFn) {
    const newLabel = prompt(`Entrez la nouvelle étiquette (1-2 caractères alpha-numériques):`, currentLabel);
    if (newLabel && newLabel.length > 0 && newLabel.length <= 2 && /^[a-zA-Z0-9]+$/.test(newLabel)) {
        const upperLabel = newLabel.toUpperCase();
        if (typeof validatorFn === 'function' && !validatorFn(upperLabel)) {
            alert("Cette étiquette est déjà utilisée ou invalide. Veuillez en choisir une autre.");
            return null;
        }
        return upperLabel;
    } else if (newLabel !== null) { 
        alert("Étiquette invalide. Veuillez entrer 1 ou 2 caractères alpha-numériques.");
    }
    return null; 
}

function getAdvancedOptionsMap_UM() { 
    return advancedOptionsMap_UM;
}

function setCreateEdgePanelVisibility_UM(visible) {
    if (createEdgePanel) {
        createEdgePanel.style.display = visible ? 'flex' : 'none';
    }
}

function getCreateEdgeInputValues_UM() {
    if (edgePoint1Input && edgePoint2Input) {
        return {
            label1: edgePoint1Input.value.trim().toUpperCase(),
            label2: edgePoint2Input.value.trim().toUpperCase()
        };
    }
    return { label1: '', label2: '' };
}

function clearCreateEdgeInputs_UM() {
    if (edgePoint1Input) edgePoint1Input.value = '';
    if (edgePoint2Input) edgePoint2Input.value = '';
}

function setUndoRedoButtonStates_UM(canUndo, canRedo) {
    if (btnUndo) {
        btnUndo.disabled = !canUndo;
        btnUndo.setAttribute('aria-disabled', (!canUndo).toString());
    }
    if (btnRedo) {
        btnRedo.disabled = !canRedo;
        btnRedo.setAttribute('aria-disabled', (!canRedo).toString());
    }
}