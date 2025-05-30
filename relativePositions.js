
// relativePositions.js: Manages logic for Relative Positions of Lines and Planes demos.

// --- Element Stores for Lines ---
let linesIntersectingElements_RP = {
    lineD_PtA: null, lineD_PtB: null, lineDelta_PtC: null, lineDelta_PtE: null,
    lineD_Mesh: null, lineDelta_Mesh: null,
    intersectionMarker_X: null, intersectionLabel_A: null,
    planeVisual: null, planeY: 0,
    label_D_Sprite: null, label_Delta_Sprite: null
};
let linesStrictlyParallelElements_RP = {
    lineD_PtA: null, lineD_PtB: null, lineDelta_PtC: null, lineDelta_PtE: null,
    lineD_Mesh: null, lineDelta_Mesh: null, planeVisual: null, planeY: 0,
    label_D_Sprite: null, label_Delta_Sprite: null, initialDeltaLength: null
};
let linesCoincidentElements_RP = {
    lineD_PtA: null, lineD_PtB: null, lineDelta_PtC: null, lineDelta_PtE: null,
    lineD_Mesh: null, lineDelta_Mesh: null, planeVisual: null, planeY: 0,
    label_D_Sprite: null, label_Delta_Sprite: null
};

// --- Element Stores for Planes ---
let planesStrictlyParallelElements_RP = {
    planeP_Mesh: null, planeQ_Mesh: null,
    label_P_Sprite: null, label_Q_Sprite: null,
    controlPointQ_Y: null
};
let planesCoincidentElements_RP = {
    coincidentPlane_Mesh: null,
    label_P_Sprite: null, label_Q_Sprite: null,
    controlPoint_Y: null
};
let planesIntersectingElements_RP = {
    planeP_Mesh: null, planeQ_Mesh: null,
    label_P_Sprite: null, label_Q_Sprite: null,
    controlPointQ_Rotation: null,
    intersectionLine_Mesh: null
};

// --- Element Stores for Line and Plane ---
let linePlaneStrictlyParallelElements_RP = {
    planeP_Mesh: null, lineD_PtA: null, lineD_PtB: null, lineD_Mesh: null,
    label_P_Sprite: null, label_D_Sprite: null, lineY_D: 1.0, planeY_P: 0
};
let linePlaneIncludedElements_RP = {
    planeP_Mesh: null, lineD_PtA: null, lineD_PtB: null, lineD_Mesh: null,
    label_P_Sprite: null, label_D_Sprite: null, planeY: 0
};
let linePlaneIntersectingElements_RP = {
    planeP_Mesh: null, lineD_PtA: null, lineD_PtB: null,
    lineD_Mesh_Visible: null, lineD_Mesh_Hidden: null, // Solid and Dashed parts
    intersectionPointVisual: null, intersectionLabel: null,
    label_P_Sprite: null, label_D_Sprite: null, planeY_P: 0
};

// --- Element Stores for New Property Demos ---
let transitivityParallelLinesElements_RP = {
    planeP: null,
    linePrime_PtA: null, linePrime_PtB: null, linePrime_Mesh: null, label_Prime: null,
    line1_PtA: null, line1_PtB_Vis: null, line1_Mesh: null, label_1: null,
    line2_PtA: null, line2_PtB_Vis: null, line2_Mesh: null, label_2: null,
    fixedY: 0
};
let lineParallelToPlaneViaIncludedLineElements_RP = {
    planeP: null, label_P: null, planeP_Y: 0,
    linePrime_PtA: null, linePrime_PtB: null, linePrime_Mesh: null, label_Prime: null, // In plane P
    lineD_PtA: null, lineD_PtB_Vis: null, lineD_Mesh: null, label_D: null,  // Parallel to P
    lineD_Y_Offset: 1.5, lineD_Y_Control: null // Control for line D's height
};
let planeIntersectingParallelLinesElements_RP = {
    lineD_PtA: null, lineD_PtB: null, lineD_Mesh: null, label_D: null,
    lineDPrime_PtA: null, lineDPrime_PtB_Vis: null, lineDPrime_Mesh: null, label_DPrime: null,
    planeP_Pt1: null, planeP_Pt2: null, planeP_Pt3: null, planeP_Mesh: null, label_P: null,
    intersectionI: null, intersectionI_Label: null,
    intersectionJ: null, intersectionJ_Label: null
};
let roofTheoremElements_RP = {
    planeP1: null, label_P1: null, planeP2: null, label_P2: null,
    lineD1_PtA: null, lineD1_PtB: null, lineD1_Mesh: null, label_D1: null,
    planeP1_PtC: null, // Third point to define P1
    lineD2_PtA: null, lineD2_PtB_Vis: null, lineD2_Mesh: null, label_D2: null,
    planeP2_PtC: null, // Third point to define P2
    intersectionLineDelta_Mesh: null, label_Delta: null
};


// Register stores with utilities for centralized clearing
if (typeof registerDemoElementStore_AU === 'function') {
    registerDemoElementStore_AU(linesIntersectingElements_RP);
    registerDemoElementStore_AU(linesStrictlyParallelElements_RP);
    registerDemoElementStore_AU(linesCoincidentElements_RP);
    registerDemoElementStore_AU(planesStrictlyParallelElements_RP);
    registerDemoElementStore_AU(planesCoincidentElements_RP);
    registerDemoElementStore_AU(planesIntersectingElements_RP);
    registerDemoElementStore_AU(linePlaneStrictlyParallelElements_RP);
    registerDemoElementStore_AU(linePlaneIncludedElements_RP);
    registerDemoElementStore_AU(linePlaneIntersectingElements_RP);
    // New Stores
    registerDemoElementStore_AU(transitivityParallelLinesElements_RP);
    registerDemoElementStore_AU(lineParallelToPlaneViaIncludedLineElements_RP);
    registerDemoElementStore_AU(planeIntersectingParallelLinesElements_RP);
    registerDemoElementStore_AU(roofTheoremElements_RP);

} else {
    console.error("relativePositions.js: registerDemoElementStore_AU is not defined. Ensure axiomUtilities.js is loaded first.");
}

function getCSSVarColor_RP(varName) { // Suffix to avoid conflict if this file is ever merged differently
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

// --- Relative Positions of Lines ---

// Intersecting Lines
function updateLinesCoplanarIntersectingGeometry_RP() {
    const { lineD_PtA, lineD_PtB, lineDelta_PtC, lineDelta_PtE,
            lineD_Mesh, lineDelta_Mesh,
            intersectionMarker_X, intersectionLabel_A,
            planeVisual, planeY,
            label_D_Sprite, label_Delta_Sprite } = linesIntersectingElements_RP;

    if (!THREE_AU || !lineD_PtA || !lineD_PtB || !lineDelta_PtC || !lineDelta_PtE || !lineD_Mesh || !lineDelta_Mesh ||
        !intersectionMarker_X || !intersectionLabel_A ||
        !planeVisual || !label_D_Sprite || !label_Delta_Sprite) return;
    
    lineD_PtA.position.y = planeY; lineD_PtB.position.y = planeY;
    lineDelta_PtC.position.y = planeY; lineDelta_PtE.position.y = planeY;

    updateLineMesh_AU(lineD_Mesh, lineD_PtA.position, lineD_PtB.position);
    updateLineMesh_AU(lineDelta_Mesh, lineDelta_PtC.position, lineDelta_PtE.position);

    const labelOffsetD = new THREE_AU.Vector3().subVectors(lineD_PtB.position, lineD_PtA.position).normalize().multiplyScalar(0.5);
    label_D_Sprite.position.copy(lineD_PtB.position).add(labelOffsetD.multiplyScalar(1.2)).add(new THREE_AU.Vector3(0, 0.2, 0));

    const labelOffsetDelta = new THREE_AU.Vector3().subVectors(lineDelta_PtE.position, lineDelta_PtC.position).normalize().multiplyScalar(0.5);
    label_Delta_Sprite.position.copy(lineDelta_PtE.position).add(labelOffsetDelta.multiplyScalar(1.2)).add(new THREE_AU.Vector3(0, 0.2, 0));


    const p1 = lineD_PtA.position; const p2 = lineD_PtB.position;
    const p3 = lineDelta_PtC.position; const p4 = lineDelta_PtE.position;

    const den = (p1.x - p2.x) * (p3.z - p4.z) - (p1.z - p2.z) * (p3.x - p4.x);
    if (Math.abs(den) < 0.001) {
        intersectionMarker_X.visible = false;
        intersectionLabel_A.visible = false;
    } else {
        const t_num = (p1.x - p3.x) * (p3.z - p4.z) - (p1.z - p3.z) * (p3.x - p4.x);
        const t = t_num / den;
        const intersectionX = p1.x + t * (p2.x - p1.x);
        const intersectionZ = p1.z + t * (p2.z - p1.z);

        intersectionMarker_X.position.set(intersectionX, planeY + 0.02, intersectionZ); 
        intersectionMarker_X.visible = true;

        intersectionLabel_A.position.set(intersectionX + 0.15, planeY + 0.2, intersectionZ + 0.15);
        intersectionLabel_A.visible = true;
    }

    const allPoints = [p1, p2, p3, p4];
    if(intersectionMarker_X.visible) allPoints.push(intersectionMarker_X.position);

    const box = new THREE_AU.Box3().setFromPoints(allPoints);
    const center = new THREE_AU.Vector3(); box.getCenter(center);
    
    planeVisual.position.set(center.x, planeY - 0.05, center.z); 
}

function runLinesCoplanarIntersecting_RP() {
    linesIntersectingElements_RP.planeY = 0;
    const { planeY } = linesIntersectingElements_RP;

    const lineD_Color = getCSSVarColor_RP('--point-color-a');
    const lineDelta_Color = getCSSVarColor_RP('--point-color-b');
    const intersection_Marker_X_Color = '#000000'; 
    const intersection_Label_A_Color = lineDelta_Color; 

    const pD1_init = new THREE_AU.Vector3(-3, planeY, -0.5); const pD2_init = new THREE_AU.Vector3(3, planeY, 0.5);
    const pDelta1_init = new THREE_AU.Vector3(-1.5, planeY, 2); const pDelta2_init = new THREE_AU.Vector3(1.5, planeY, -2);

    linesIntersectingElements_RP.lineD_PtA = createAxiomPoint_AU(pD1_init, lineD_Color, 'P1', 0.10, 2.5, true);
    linesIntersectingElements_RP.lineD_PtB = createAxiomPoint_AU(pD2_init, lineD_Color, 'P2', 0.10, 2.5, true);
    linesIntersectingElements_RP.lineDelta_PtC = createAxiomPoint_AU(pDelta1_init, lineDelta_Color, 'P3', 0.10, 2.5, true);
    linesIntersectingElements_RP.lineDelta_PtE = createAxiomPoint_AU(pDelta2_init, lineDelta_Color, 'P4', 0.10, 2.5, true);

    const pointsToDrag = [linesIntersectingElements_RP.lineD_PtA, linesIntersectingElements_RP.lineD_PtB, linesIntersectingElements_RP.lineDelta_PtC, linesIntersectingElements_RP.lineDelta_PtE];
    pointsToDrag.forEach(p => { if(p) { p.userData.dragConstraint = 'fixedY'; p.userData.fixedYValue = planeY; p.userData.updateFunction = updateLinesCoplanarIntersectingGeometry_RP; p.userData.demo = 'linesCoplanarIntersecting'; demoGroup_AU.add(p); }});

    linesIntersectingElements_RP.lineD_Mesh = createLineMesh_AU(pD1_init, pD2_init, lineD_Color, 0.03, "LineD");
    linesIntersectingElements_RP.lineDelta_Mesh = createLineMesh_AU(pDelta1_init, pDelta2_init, lineDelta_Color, 0.03, "LineDelta");
    if(linesIntersectingElements_RP.lineD_Mesh) demoGroup_AU.add(linesIntersectingElements_RP.lineD_Mesh);
    if(linesIntersectingElements_RP.lineDelta_Mesh) demoGroup_AU.add(linesIntersectingElements_RP.lineDelta_Mesh);

    linesIntersectingElements_RP.label_D_Sprite = createTextSprite_AU("(D)", new THREE_AU.Vector3(), lineD_Color, 30, 0.0055, false);
    linesIntersectingElements_RP.label_Delta_Sprite = createTextSprite_AU("(Δ)", new THREE_AU.Vector3(), lineDelta_Color, 30, 0.0055, false);
    demoGroup_AU.add(linesIntersectingElements_RP.label_D_Sprite, linesIntersectingElements_RP.label_Delta_Sprite);

    linesIntersectingElements_RP.intersectionMarker_X = createTextSprite_AU("X", new THREE_AU.Vector3(), intersection_Marker_X_Color, 35, 0.0055, false);
    linesIntersectingElements_RP.intersectionMarker_X.visible = false;
    demoGroup_AU.add(linesIntersectingElements_RP.intersectionMarker_X);

    linesIntersectingElements_RP.intersectionLabel_A = createTextSprite_AU("I", new THREE_AU.Vector3(), intersection_Label_A_Color, 30, 0.0055, false); // Label for intersection point
    linesIntersectingElements_RP.intersectionLabel_A.visible = false;
    demoGroup_AU.add(linesIntersectingElements_RP.intersectionLabel_A);

    const planeGeom = new THREE_AU.PlaneGeometry(8, 8);
    const planeMat = createAxiomObjectMaterial_AU('plane', getCSSVarColor_RP('--plane-color'), 0);
    linesIntersectingElements_RP.planeVisual = new THREE_AU.Mesh(planeGeom, planeMat);
    linesIntersectingElements_RP.planeVisual.rotation.x = -Math.PI / 2;
    linesIntersectingElements_RP.planeVisual.userData.finalOpacity = 0.35;
    demoGroup_AU.add(linesIntersectingElements_RP.planeVisual);

    updateLinesCoplanarIntersectingGeometry_RP();
    Object.values(linesIntersectingElements_RP).filter(el => el && typeof el.scale !== 'undefined').forEach((el, index) => {
        animateAxiomObject_AU(el, index * 30, 500, 1);
    });
}


// Strictly Parallel Lines
function updateLinesStrictlyParallelGeometry_RP() {
    const { lineD_PtA, lineD_PtB, lineDelta_PtC, lineDelta_PtE,
            lineD_Mesh, lineDelta_Mesh, planeVisual, planeY,
            label_D_Sprite, label_Delta_Sprite, initialDeltaLength } = linesStrictlyParallelElements_RP;

    if (!THREE_AU || !lineD_PtA || !lineD_PtB || !lineDelta_PtC || !lineDelta_PtE || !lineD_Mesh || !lineDelta_Mesh || !planeVisual || !label_D_Sprite || !label_Delta_Sprite) return;

    lineD_PtA.position.y = planeY; lineD_PtB.position.y = planeY;
    lineDelta_PtC.position.y = planeY; lineDelta_PtE.position.y = planeY;


    const dirD = new THREE_AU.Vector3().subVectors(lineD_PtB.position, lineD_PtA.position);
    dirD.normalize();

    const deltaLength = initialDeltaLength || 5;
    lineDelta_PtE.position.copy(lineDelta_PtC.position).add(dirD.clone().multiplyScalar(deltaLength));


    updateLineMesh_AU(lineD_Mesh, lineD_PtA.position, lineD_PtB.position);
    updateLineMesh_AU(lineDelta_Mesh, lineDelta_PtC.position, lineDelta_PtE.position);

    const labelOffsetD = new THREE_AU.Vector3().subVectors(lineD_PtB.position, lineD_PtA.position).normalize().multiplyScalar(0.5);
    label_D_Sprite.position.copy(lineD_PtB.position).add(labelOffsetD.multiplyScalar(1.2)).add(new THREE_AU.Vector3(0, 0.2, 0));

    const labelOffsetDelta = new THREE_AU.Vector3().subVectors(lineDelta_PtE.position, lineDelta_PtC.position).normalize().multiplyScalar(0.5);
    label_Delta_Sprite.position.copy(lineDelta_PtE.position).add(labelOffsetDelta.multiplyScalar(1.2)).add(new THREE_AU.Vector3(0, 0.2, 0));

    const allPoints = [lineD_PtA.position, lineD_PtB.position, lineDelta_PtC.position, lineDelta_PtE.position];
    const box = new THREE_AU.Box3().setFromPoints(allPoints);
    const center = new THREE_AU.Vector3(); box.getCenter(center);
    
    planeVisual.position.set(center.x, planeY - 0.05, center.z); 
}

function runLinesCoplanarStrictlyParallel_RP() {
    linesStrictlyParallelElements_RP.planeY = 0;
    const {planeY} = linesStrictlyParallelElements_RP;

    const colorD_StrPar = getCSSVarColor_RP('--accent-tertiary');
    const colorDelta_StrPar = getCSSVarColor_RP('--accent-primary');

    const pA_sp = new THREE_AU.Vector3(-3, planeY, -1); const pB_sp = new THREE_AU.Vector3(3, planeY, -1);
    const pC_sp = new THREE_AU.Vector3(-2.5, planeY, 1);

    linesStrictlyParallelElements_RP.lineD_PtA = createAxiomPoint_AU(pA_sp, colorD_StrPar, 'P1', 0.10, 2.5, true);
    linesStrictlyParallelElements_RP.lineD_PtB = createAxiomPoint_AU(pB_sp, colorD_StrPar, 'P2', 0.10, 2.5, true);
    linesStrictlyParallelElements_RP.lineDelta_PtC = createAxiomPoint_AU(pC_sp, colorDelta_StrPar, 'P3', 0.10, 2.5, true);

    const initialDirD = new THREE_AU.Vector3().subVectors(pB_sp,pA_sp).normalize();
    linesStrictlyParallelElements_RP.initialDeltaLength = new THREE_AU.Vector3().subVectors(pB_sp,pA_sp).length() * 0.8;
    const pE_sp_init = pC_sp.clone().add(initialDirD.multiplyScalar(linesStrictlyParallelElements_RP.initialDeltaLength));
    linesStrictlyParallelElements_RP.lineDelta_PtE = createAxiomPoint_AU(pE_sp_init, colorDelta_StrPar, 'P4', 0.10, 2.5, false); 

    [linesStrictlyParallelElements_RP.lineD_PtA, linesStrictlyParallelElements_RP.lineD_PtB, linesStrictlyParallelElements_RP.lineDelta_PtC]
    .forEach(p => { if(p) { p.userData.dragConstraint = 'fixedY'; p.userData.fixedYValue = planeY; p.userData.updateFunction = updateLinesStrictlyParallelGeometry_RP; p.userData.demo = 'linesCoplanarStrictlyParallel'; demoGroup_AU.add(p); }});
    demoGroup_AU.add(linesStrictlyParallelElements_RP.lineDelta_PtE); 

    linesStrictlyParallelElements_RP.lineD_Mesh = createLineMesh_AU(pA_sp, pB_sp, colorD_StrPar, 0.03, "LineD_SP");
    linesStrictlyParallelElements_RP.lineDelta_Mesh = createLineMesh_AU(pC_sp, pE_sp_init, colorDelta_StrPar, 0.03, "LineDelta_SP");
    if(linesStrictlyParallelElements_RP.lineD_Mesh) demoGroup_AU.add(linesStrictlyParallelElements_RP.lineD_Mesh);
    if(linesStrictlyParallelElements_RP.lineDelta_Mesh) demoGroup_AU.add(linesStrictlyParallelElements_RP.lineDelta_Mesh);

    linesStrictlyParallelElements_RP.label_D_Sprite = createTextSprite_AU("(D)", new THREE_AU.Vector3(), colorD_StrPar, 30, 0.0055, false);
    linesStrictlyParallelElements_RP.label_Delta_Sprite = createTextSprite_AU("(Δ)", new THREE_AU.Vector3(), colorDelta_StrPar, 30, 0.0055, false);
    demoGroup_AU.add(linesStrictlyParallelElements_RP.label_D_Sprite, linesStrictlyParallelElements_RP.label_Delta_Sprite);

    const planeGeom_sp = new THREE_AU.PlaneGeometry(8, 8);
    const planeMat_sp = createAxiomObjectMaterial_AU('plane', getCSSVarColor_RP('--plane-color'), 0); 
    linesStrictlyParallelElements_RP.planeVisual = new THREE_AU.Mesh(planeGeom_sp, planeMat_sp);
    linesStrictlyParallelElements_RP.planeVisual.rotation.x = -Math.PI / 2;
    linesStrictlyParallelElements_RP.planeVisual.userData.finalOpacity = 0.35;
    demoGroup_AU.add(linesStrictlyParallelElements_RP.planeVisual);

    updateLinesStrictlyParallelGeometry_RP();
    Object.values(linesStrictlyParallelElements_RP).filter(el => el && typeof el.scale !== 'undefined').forEach((el, index) => { animateAxiomObject_AU(el, index * 30); });
}

// Coincident Lines
function updateLinesCoincidentGeometry_RP() {
    const { lineD_PtA, lineD_PtB, lineDelta_PtC, lineDelta_PtE,
            lineD_Mesh, lineDelta_Mesh, planeVisual, planeY,
            label_D_Sprite, label_Delta_Sprite } = linesCoincidentElements_RP;

    if (!THREE_AU || !lineD_PtA || !lineD_PtB || !lineDelta_PtC || !lineDelta_PtE || !lineD_Mesh || !lineDelta_Mesh || !planeVisual || !label_D_Sprite || !label_Delta_Sprite) return;
    
    lineD_PtA.position.y = planeY; lineD_PtB.position.y = planeY;

    const lineDir = new THREE_AU.Vector3().subVectors(lineD_PtB.position, lineD_PtA.position);
    lineDelta_PtC.position.copy(lineD_PtA.position).add(lineDir.clone().multiplyScalar(0.25));
    lineDelta_PtE.position.copy(lineD_PtA.position).add(lineDir.clone().multiplyScalar(0.75));
    lineDelta_PtC.position.y = planeY; lineDelta_PtE.position.y = planeY;


    updateLineMesh_AU(lineD_Mesh, lineD_PtA.position, lineD_PtB.position);
    updateLineMesh_AU(lineDelta_Mesh, lineDelta_PtC.position, lineDelta_PtE.position);

    if (lineDelta_Mesh.material.color.getHex() !== lineD_Mesh.material.color.getHex()) {
        lineDelta_Mesh.position.y = lineD_Mesh.position.y + 0.005; 
    }


    const labelOffsetD_Co = new THREE_AU.Vector3().subVectors(lineD_PtB.position, lineD_PtA.position).normalize().multiplyScalar(0.5);
    label_D_Sprite.position.copy(lineD_PtB.position).add(labelOffsetD_Co.multiplyScalar(1.2)).add(new THREE_AU.Vector3(0, 0.25, 0)); 


    const labelOffsetDelta_Co = new THREE_AU.Vector3().subVectors(lineDelta_PtE.position, lineDelta_PtC.position).normalize().multiplyScalar(0.5);
    label_Delta_Sprite.position.copy(lineDelta_PtE.position).add(labelOffsetDelta_Co.multiplyScalar(0.8)).add(new THREE_AU.Vector3(0, 0.35, 0)); 

    const allPoints_co = [lineD_PtA.position, lineD_PtB.position];
    const box_co = new THREE_AU.Box3().setFromPoints(allPoints_co);
    const center_co = new THREE_AU.Vector3(); box_co.getCenter(center_co);
    
    planeVisual.position.set(center_co.x, planeY - 0.05, center_co.z); 
}

function runLinesCoplanarCoincident_RP() {
    linesCoincidentElements_RP.planeY = 0;
    const { planeY } = linesCoincidentElements_RP;

    const colorD_Coin = getCSSVarColor_RP('--accent-tertiary');
    const colorDelta_Coin = getCSSVarColor_RP('--accent-primary');

    const pA_c = new THREE_AU.Vector3(-3, planeY, 0); const pB_c = new THREE_AU.Vector3(3, planeY, 0);

    linesCoincidentElements_RP.lineD_PtA = createAxiomPoint_AU(pA_c, colorD_Coin, 'P1', 0.10, 2.5, true);
    linesCoincidentElements_RP.lineD_PtB = createAxiomPoint_AU(pB_c, colorD_Coin, 'P2', 0.10, 2.5, true);

    const pC_c_init = pA_c.clone().lerp(pB_c, 0.25); const pE_c_init = pA_c.clone().lerp(pB_c, 0.75);
    linesCoincidentElements_RP.lineDelta_PtC = createAxiomPoint_AU(pC_c_init, colorDelta_Coin, 'P3', 0.08, 3.0, false); 
    linesCoincidentElements_RP.lineDelta_PtE = createAxiomPoint_AU(pE_c_init, colorDelta_Coin, 'P4', 0.08, 3.0, false); 

    [linesCoincidentElements_RP.lineD_PtA, linesCoincidentElements_RP.lineD_PtB]
    .forEach(p => { if(p) { p.userData.dragConstraint = 'fixedY'; p.userData.fixedYValue = planeY; p.userData.updateFunction = updateLinesCoincidentGeometry_RP; p.userData.demo = 'linesCoplanarCoincident'; demoGroup_AU.add(p); }});
    demoGroup_AU.add(linesCoincidentElements_RP.lineDelta_PtC, linesCoincidentElements_RP.lineDelta_PtE); 

    linesCoincidentElements_RP.lineD_Mesh = createLineMesh_AU(pA_c, pB_c, colorD_Coin, 0.05, "LineD_Co");
    linesCoincidentElements_RP.lineDelta_Mesh = createLineMesh_AU(pC_c_init, pE_c_init, colorDelta_Coin, 0.025, "LineDelta_Co");
    if(linesCoincidentElements_RP.lineD_Mesh) demoGroup_AU.add(linesCoincidentElements_RP.lineD_Mesh);
    if(linesCoincidentElements_RP.lineDelta_Mesh) demoGroup_AU.add(linesCoincidentElements_RP.lineDelta_Mesh);

    linesCoincidentElements_RP.label_D_Sprite = createTextSprite_AU("(D)", new THREE_AU.Vector3(), colorD_Coin, 30, 0.0055, false);
    linesCoincidentElements_RP.label_Delta_Sprite = createTextSprite_AU("(Δ)", new THREE_AU.Vector3(), colorDelta_Coin, 30, 0.0055, false);
    demoGroup_AU.add(linesCoincidentElements_RP.label_D_Sprite, linesCoincidentElements_RP.label_Delta_Sprite);

    const planeGeom_c = new THREE_AU.PlaneGeometry(8, 8);
    const planeMat_c = createAxiomObjectMaterial_AU('plane', getCSSVarColor_RP('--plane-color'), 0); 
    linesCoincidentElements_RP.planeVisual = new THREE_AU.Mesh(planeGeom_c, planeMat_c);
    linesCoincidentElements_RP.planeVisual.rotation.x = -Math.PI / 2;
    linesCoincidentElements_RP.planeVisual.userData.finalOpacity = 0.25;
    demoGroup_AU.add(linesCoincidentElements_RP.planeVisual);

    updateLinesCoincidentGeometry_RP();
    Object.values(linesCoincidentElements_RP).filter(el=>el && typeof el.scale !== 'undefined').forEach((el, index) => { animateAxiomObject_AU(el, index * 30); });
}


// --- Relative Positions of Planes ---

// Strictly Parallel Planes
function updatePlanesStrictlyParallelGeometry_RP() {
    const { planeP_Mesh, planeQ_Mesh, label_P_Sprite, label_Q_Sprite, controlPointQ_Y } = planesStrictlyParallelElements_RP;
    if (!planeP_Mesh || !planeQ_Mesh || !label_P_Sprite || !label_Q_Sprite || !controlPointQ_Y) return;

    planeQ_Mesh.position.y = controlPointQ_Y.position.y;
    if (Math.abs(planeP_Mesh.position.y - planeQ_Mesh.position.y) < 0.1) {
        planeQ_Mesh.position.y = planeP_Mesh.position.y + (planeP_Mesh.position.y > 0 ? -0.1 : 0.1);
        controlPointQ_Y.position.y = planeQ_Mesh.position.y;
    }

    label_P_Sprite.position.set(planeP_Mesh.geometry.parameters.width / 2 - 0.5, planeP_Mesh.position.y + 0.15, planeP_Mesh.geometry.parameters.height / 2 - 0.5);
    label_Q_Sprite.position.set(planeQ_Mesh.geometry.parameters.width / 2 - 0.5, planeQ_Mesh.position.y + 0.15, planeQ_Mesh.geometry.parameters.height / 2 - 0.5);
}

function runPlanesStrictlyParallel_RP() {
    const colorP = getCSSVarColor_RP('--point-color-a'); 
    const colorQ = getCSSVarColor_RP('--point-color-b'); 

    const planeGeom = new THREE_AU.PlaneGeometry(8, 8);
    const materialP = createAxiomObjectMaterial_AU('plane', colorP, 0.7);
    planesStrictlyParallelElements_RP.planeP_Mesh = new THREE_AU.Mesh(planeGeom.clone(), materialP);
    planesStrictlyParallelElements_RP.planeP_Mesh.rotation.x = -Math.PI / 2;
    planesStrictlyParallelElements_RP.planeP_Mesh.position.y = 0.5;
    demoGroup_AU.add(planesStrictlyParallelElements_RP.planeP_Mesh);

    const materialQ = createAxiomObjectMaterial_AU('plane', colorQ, 0.7);
    planesStrictlyParallelElements_RP.planeQ_Mesh = new THREE_AU.Mesh(planeGeom.clone(), materialQ);
    planesStrictlyParallelElements_RP.planeQ_Mesh.rotation.x = -Math.PI / 2;
    planesStrictlyParallelElements_RP.planeQ_Mesh.position.y = -0.5;
    demoGroup_AU.add(planesStrictlyParallelElements_RP.planeQ_Mesh);

    planesStrictlyParallelElements_RP.label_P_Sprite = createTextSprite_AU("𝒫", new THREE_AU.Vector3(), colorP, 40, 0.008);
    planesStrictlyParallelElements_RP.label_Q_Sprite = createTextSprite_AU("𝒬", new THREE_AU.Vector3(), colorQ, 40, 0.008);
    demoGroup_AU.add(planesStrictlyParallelElements_RP.label_P_Sprite, planesStrictlyParallelElements_RP.label_Q_Sprite);

    planesStrictlyParallelElements_RP.controlPointQ_Y = createAxiomPoint_AU(new THREE_AU.Vector3(0, -0.5, 4.5), colorQ, '↕', 0.2, 1.5, true);
    planesStrictlyParallelElements_RP.controlPointQ_Y.userData.dragConstraint = 'yAxisOnly';
    planesStrictlyParallelElements_RP.controlPointQ_Y.userData.updateFunction = updatePlanesStrictlyParallelGeometry_RP;
    demoGroup_AU.add(planesStrictlyParallelElements_RP.controlPointQ_Y);

    updatePlanesStrictlyParallelGeometry_RP();
    Object.values(planesStrictlyParallelElements_RP).filter(el => el && typeof el.scale !== 'undefined').forEach((el, index) => { animateAxiomObject_AU(el, index * 50); });
}

// Coincident Planes
function updatePlanesCoincidentGeometry_RP() {
    const { coincidentPlane_Mesh, label_P_Sprite, label_Q_Sprite, controlPoint_Y } = planesCoincidentElements_RP;
    if (!coincidentPlane_Mesh || !label_P_Sprite || !label_Q_Sprite || !controlPoint_Y) return;

    coincidentPlane_Mesh.position.y = controlPoint_Y.position.y;
    label_P_Sprite.position.set(coincidentPlane_Mesh.geometry.parameters.width / 2 - 0.5, controlPoint_Y.position.y + 0.15, coincidentPlane_Mesh.geometry.parameters.height / 2 - 0.8);
    label_Q_Sprite.position.set(coincidentPlane_Mesh.geometry.parameters.width / 2 - 0.8, controlPoint_Y.position.y + 0.15, coincidentPlane_Mesh.geometry.parameters.height / 2 - 0.5);
}

function runPlanesCoincident_RP() {
    const colorP_text = getCSSVarColor_RP('--point-color-a'); 
    const colorQ_plane_and_text = getCSSVarColor_RP('--point-color-b'); 

    const planeGeom = new THREE_AU.PlaneGeometry(8, 8);
    const materialPlane = createAxiomObjectMaterial_AU('plane', colorQ_plane_and_text, 0.7);
    planesCoincidentElements_RP.coincidentPlane_Mesh = new THREE_AU.Mesh(planeGeom, materialPlane);
    planesCoincidentElements_RP.coincidentPlane_Mesh.rotation.x = -Math.PI / 2;
    planesCoincidentElements_RP.coincidentPlane_Mesh.position.y = 0;
    demoGroup_AU.add(planesCoincidentElements_RP.coincidentPlane_Mesh);

    planesCoincidentElements_RP.label_P_Sprite = createTextSprite_AU("𝒫", new THREE_AU.Vector3(), colorP_text, 40, 0.008);
    planesCoincidentElements_RP.label_Q_Sprite = createTextSprite_AU("𝒬", new THREE_AU.Vector3(), colorQ_plane_and_text, 40, 0.008);
    demoGroup_AU.add(planesCoincidentElements_RP.label_P_Sprite, planesCoincidentElements_RP.label_Q_Sprite);

    planesCoincidentElements_RP.controlPoint_Y = createAxiomPoint_AU(new THREE_AU.Vector3(0, 0, 4.5), colorQ_plane_and_text, '↕', 0.2, 1.5, true);
    planesCoincidentElements_RP.controlPoint_Y.userData.dragConstraint = 'yAxisOnly';
    planesCoincidentElements_RP.controlPoint_Y.userData.updateFunction = updatePlanesCoincidentGeometry_RP;
    demoGroup_AU.add(planesCoincidentElements_RP.controlPoint_Y);

    updatePlanesCoincidentGeometry_RP();
    Object.values(planesCoincidentElements_RP).filter(el => el && typeof el.scale !== 'undefined').forEach((el, index) => { animateAxiomObject_AU(el, index * 50); });
}

// Intersecting Planes
function updatePlanesIntersectingGeometry_RP() {
    const { planeP_Mesh, planeQ_Mesh, label_P_Sprite, label_Q_Sprite, controlPointQ_Rotation, intersectionLine_Mesh } = planesIntersectingElements_RP;
    if (!THREE_AU || !planeP_Mesh || !planeQ_Mesh || !label_P_Sprite || !label_Q_Sprite || !controlPointQ_Rotation || !intersectionLine_Mesh) return;

    const angle = Math.atan2(controlPointQ_Rotation.position.y, controlPointQ_Rotation.position.x);
    planeQ_Mesh.rotation.z = angle;
    planeQ_Mesh.updateMatrixWorld(); 

    label_P_Sprite.position.set(planeP_Mesh.geometry.parameters.width / 2 - 0.5, planeP_Mesh.position.y + 0.15, planeP_Mesh.geometry.parameters.height / 2 - 0.5);
    
    const qLabelPos = new THREE_AU.Vector3(planeQ_Mesh.geometry.parameters.width / 2 - 0.5, planeQ_Mesh.geometry.parameters.height / 2 - 0.5, 0.15);
    qLabelPos.applyQuaternion(planeQ_Mesh.quaternion); 
    qLabelPos.add(planeQ_Mesh.position); 
    label_Q_Sprite.position.copy(qLabelPos);


    const pNormal = new THREE_AU.Vector3(0,1,0).applyQuaternion(planeP_Mesh.quaternion);
    const qNormal = new THREE_AU.Vector3(0,1,0).applyQuaternion(planeQ_Mesh.quaternion);
    const pPlane = new THREE_AU.Plane().setFromNormalAndCoplanarPoint(pNormal, planeP_Mesh.position);
    const qPlane = new THREE_AU.Plane().setFromNormalAndCoplanarPoint(qNormal, planeQ_Mesh.position);

    const lineDir = new THREE_AU.Vector3().crossVectors(pPlane.normal, qPlane.normal).normalize();
    
    const n1 = pPlane.normal; const n2 = qPlane.normal;
    const d1 = -pPlane.constant; const d2 = -qPlane.constant; 

    const n1_n2 = n1.dot(n2);
    const det = 1 - n1_n2 * n1_n2;

    let pointOnLine = new THREE_AU.Vector3();
    if (Math.abs(det) > 1e-6) { 
        const c1 = (d1 - d2 * n1_n2) / det;
        const c2 = (d2 - d1 * n1_n2) / det;
        pointOnLine = n1.clone().multiplyScalar(c1).add(n2.clone().multiplyScalar(c2));
    } else { 
        intersectionLine_Mesh.visible = false;
        return;
    }
    intersectionLine_Mesh.visible = true;
    
    const lineLength = 10; 
    const pt1 = pointOnLine.clone().add(lineDir.clone().multiplyScalar(-lineLength / 2));
    const pt2 = pointOnLine.clone().add(lineDir.clone().multiplyScalar(lineLength / 2));
    
    updateLineMesh_AU(intersectionLine_Mesh, pt1, pt2);
}

function runPlanesIntersecting_RP() {
    const colorP = getCSSVarColor_RP('--point-color-a'); 
    const colorQ = getCSSVarColor_RP('--point-color-b'); 
    const colorIntersection = getCSSVarColor_RP('--accent-primary'); 

    const planeGeom = new THREE_AU.PlaneGeometry(8, 8);
    const materialP = createAxiomObjectMaterial_AU('plane', colorP, 0.7);
    planesIntersectingElements_RP.planeP_Mesh = new THREE_AU.Mesh(planeGeom.clone(), materialP);
    planesIntersectingElements_RP.planeP_Mesh.rotation.x = -Math.PI / 2; 
    planesIntersectingElements_RP.planeP_Mesh.position.y = 0;
    demoGroup_AU.add(planesIntersectingElements_RP.planeP_Mesh);

    const materialQ = createAxiomObjectMaterial_AU('plane', colorQ, 0.7);
    planesIntersectingElements_RP.planeQ_Mesh = new THREE_AU.Mesh(planeGeom.clone(), materialQ);
    planesIntersectingElements_RP.planeQ_Mesh.rotation.z = Math.PI / 4; 
    demoGroup_AU.add(planesIntersectingElements_RP.planeQ_Mesh);

    planesIntersectingElements_RP.label_P_Sprite = createTextSprite_AU("𝒫", new THREE_AU.Vector3(), colorP, 40, 0.008);
    planesIntersectingElements_RP.label_Q_Sprite = createTextSprite_AU("𝒬", new THREE_AU.Vector3(), colorQ, 40, 0.008);
    demoGroup_AU.add(planesIntersectingElements_RP.label_P_Sprite, planesIntersectingElements_RP.label_Q_Sprite);
    
    const controlRadius = 3;
    const initialAngle = Math.PI / 4;
    planesIntersectingElements_RP.controlPointQ_Rotation = createAxiomPoint_AU(
        new THREE_AU.Vector3(controlRadius * Math.cos(initialAngle), controlRadius * Math.sin(initialAngle), 0),
        colorQ, '⟳', 0.2, 1.5, true
    );
    planesIntersectingElements_RP.controlPointQ_Rotation.userData.dragConstraint = 'circleXY'; 
    planesIntersectingElements_RP.controlPointQ_Rotation.userData.dragConstraintRadius = controlRadius;
    planesIntersectingElements_RP.controlPointQ_Rotation.userData.updateFunction = updatePlanesIntersectingGeometry_RP;
    demoGroup_AU.add(planesIntersectingElements_RP.controlPointQ_Rotation);

    planesIntersectingElements_RP.intersectionLine_Mesh = createLineMesh_AU(new THREE_AU.Vector3(), new THREE_AU.Vector3(0,0,1), colorIntersection, 0.05, "IntersectionLine");
    demoGroup_AU.add(planesIntersectingElements_RP.intersectionLine_Mesh);


    updatePlanesIntersectingGeometry_RP();
    Object.values(planesIntersectingElements_RP).filter(el => el && typeof el.scale !== 'undefined').forEach((el, index) => { animateAxiomObject_AU(el, index * 50); });
}

// --- Relative Positions of Line and Plane ---

// Line Strictly Parallel to Plane
function updateLinePlaneStrictlyParallelGeometry_RP() {
    const { planeP_Mesh, lineD_PtA, lineD_PtB, lineD_Mesh, label_P_Sprite, label_D_Sprite, lineY_D } = linePlaneStrictlyParallelElements_RP;
    if (!THREE_AU ||!planeP_Mesh || !lineD_PtA || !lineD_PtB || !lineD_Mesh || !label_P_Sprite || !label_D_Sprite) return;

    lineD_PtA.position.y = lineY_D;
    lineD_PtB.position.y = lineY_D;

    updateLineMesh_AU(lineD_Mesh, lineD_PtA.position, lineD_PtB.position);
    
    label_P_Sprite.position.set(planeP_Mesh.geometry.parameters.width / 2 - 0.5, planeP_Mesh.position.y + 0.1, planeP_Mesh.geometry.parameters.height / 2 - 0.5);
    const lineCenterD = new THREE_AU.Vector3().addVectors(lineD_PtA.position, lineD_PtB.position).multiplyScalar(0.5);
    const dirD = new THREE_AU.Vector3().subVectors(lineD_PtB.position, lineD_PtA.position).normalize();
    label_D_Sprite.position.copy(lineD_PtA.position).addScaledVector(dirD, lineD_PtA.position.distanceTo(lineD_PtB.position) + 0.3).add(new THREE_AU.Vector3(0,0.2,0));
}

function runLinePlaneStrictlyParallel_RP() {
    const planeColor = getCSSVarColor_RP('--plane-color');
    const lineColor = getCSSVarColor_RP('--accent-primary');
    const pointColor = getCSSVarColor_RP('--point-color-a');
    
    linePlaneStrictlyParallelElements_RP.planeY_P = 0;
    linePlaneStrictlyParallelElements_RP.lineY_D = 1.0; 
    const { planeY_P, lineY_D } = linePlaneStrictlyParallelElements_RP;

    const planeGeom = new THREE_AU.PlaneGeometry(7, 5);
    const planeMat = createAxiomObjectMaterial_AU('plane', planeColor, 0);
    linePlaneStrictlyParallelElements_RP.planeP_Mesh = new THREE_AU.Mesh(planeGeom, planeMat);
    linePlaneStrictlyParallelElements_RP.planeP_Mesh.rotation.x = -Math.PI / 2;
    linePlaneStrictlyParallelElements_RP.planeP_Mesh.position.y = planeY_P;
    linePlaneStrictlyParallelElements_RP.planeP_Mesh.userData.finalOpacity = 0.45;
    demoGroup_AU.add(linePlaneStrictlyParallelElements_RP.planeP_Mesh);

    const pA_init = new THREE_AU.Vector3(-2, lineY_D, 0);
    const pB_init = new THREE_AU.Vector3(2, lineY_D, 0);
    linePlaneStrictlyParallelElements_RP.lineD_PtA = createAxiomPoint_AU(pA_init, pointColor, "A", 0.1, 1.8, true);
    linePlaneStrictlyParallelElements_RP.lineD_PtB = createAxiomPoint_AU(pB_init, pointColor, "B", 0.1, 1.8, true);
    [linePlaneStrictlyParallelElements_RP.lineD_PtA, linePlaneStrictlyParallelElements_RP.lineD_PtB].forEach(p => {
        if (p) {
            p.userData.dragConstraint = 'fixedY';
            p.userData.fixedYValue = lineY_D;
            p.userData.updateFunction = updateLinePlaneStrictlyParallelGeometry_RP;
            p.userData.demo = 'linePlaneStrictlyParallel';
            demoGroup_AU.add(p);
        }
    });

    linePlaneStrictlyParallelElements_RP.lineD_Mesh = createLineMesh_AU(pA_init, pB_init, lineColor, 0.025, "LineD");
    demoGroup_AU.add(linePlaneStrictlyParallelElements_RP.lineD_Mesh);

    linePlaneStrictlyParallelElements_RP.label_P_Sprite = createTextSprite_AU("𝒫", new THREE_AU.Vector3(), planeColor, 35, 0.007);
    linePlaneStrictlyParallelElements_RP.label_D_Sprite = createTextSprite_AU("(𝓓)", new THREE_AU.Vector3(), lineColor, 35, 0.007);
    demoGroup_AU.add(linePlaneStrictlyParallelElements_RP.label_P_Sprite, linePlaneStrictlyParallelElements_RP.label_D_Sprite);

    updateLinePlaneStrictlyParallelGeometry_RP();
    Object.values(linePlaneStrictlyParallelElements_RP).filter(el => el && typeof el.scale !== 'undefined').forEach((el, index) => {
        animateAxiomObject_AU(el, index * 40);
    });
}

// Line Included in Plane
function updateLinePlaneIncludedGeometry_RP() {
    const { planeP_Mesh, lineD_PtA, lineD_PtB, lineD_Mesh, label_P_Sprite, label_D_Sprite, planeY } = linePlaneIncludedElements_RP;
    if (!THREE_AU || !planeP_Mesh || !lineD_PtA || !lineD_PtB || !lineD_Mesh || !label_P_Sprite || !label_D_Sprite) return;
    
    lineD_PtA.position.y = planeY;
    lineD_PtB.position.y = planeY;

    updateLineMesh_AU(lineD_Mesh, lineD_PtA.position, lineD_PtB.position);

    label_P_Sprite.position.set(planeP_Mesh.geometry.parameters.width / 2 - 0.5, planeP_Mesh.position.y + 0.1, planeP_Mesh.geometry.parameters.height / 2 - 0.5);
    const lineCenterD = new THREE_AU.Vector3().addVectors(lineD_PtA.position, lineD_PtB.position).multiplyScalar(0.5);
    const dirD = new THREE_AU.Vector3().subVectors(lineD_PtB.position, lineD_PtA.position).normalize();
    label_D_Sprite.position.copy(lineD_PtA.position).addScaledVector(dirD, lineD_PtA.position.distanceTo(lineD_PtB.position) + 0.3).add(new THREE_AU.Vector3(0,0.2,0));
}

function runLinePlaneIncluded_RP() {
    const planeColor = getCSSVarColor_RP('--plane-color');
    const lineColor = getCSSVarColor_RP('--accent-primary');
    const pointColor = getCSSVarColor_RP('--point-color-a');
    linePlaneIncludedElements_RP.planeY = 0;
    const { planeY } = linePlaneIncludedElements_RP;

    const planeGeom = new THREE_AU.PlaneGeometry(7, 5);
    const planeMat = createAxiomObjectMaterial_AU('plane', planeColor, 0);
    linePlaneIncludedElements_RP.planeP_Mesh = new THREE_AU.Mesh(planeGeom, planeMat);
    linePlaneIncludedElements_RP.planeP_Mesh.rotation.x = -Math.PI / 2;
    linePlaneIncludedElements_RP.planeP_Mesh.position.y = planeY;
    linePlaneIncludedElements_RP.planeP_Mesh.userData.finalOpacity = 0.45;
    demoGroup_AU.add(linePlaneIncludedElements_RP.planeP_Mesh);

    const pA_init = new THREE_AU.Vector3(-2, planeY, 0);
    const pB_init = new THREE_AU.Vector3(2, planeY, 0);
    linePlaneIncludedElements_RP.lineD_PtA = createAxiomPoint_AU(pA_init, pointColor, "A", 0.1, 1.8, true);
    linePlaneIncludedElements_RP.lineD_PtB = createAxiomPoint_AU(pB_init, pointColor, "B", 0.1, 1.8, true);
    [linePlaneIncludedElements_RP.lineD_PtA, linePlaneIncludedElements_RP.lineD_PtB].forEach(p => {
        if (p) {
            p.userData.dragConstraint = 'fixedY';
            p.userData.fixedYValue = planeY;
            p.userData.updateFunction = updateLinePlaneIncludedGeometry_RP;
            p.userData.demo = 'linePlaneIncluded';
            demoGroup_AU.add(p);
        }
    });

    linePlaneIncludedElements_RP.lineD_Mesh = createLineMesh_AU(pA_init, pB_init, lineColor, 0.025, "LineD");
    demoGroup_AU.add(linePlaneIncludedElements_RP.lineD_Mesh);

    linePlaneIncludedElements_RP.label_P_Sprite = createTextSprite_AU("𝒫", new THREE_AU.Vector3(), planeColor, 35, 0.007);
    linePlaneIncludedElements_RP.label_D_Sprite = createTextSprite_AU("(𝓓)", new THREE_AU.Vector3(), lineColor, 35, 0.007);
    demoGroup_AU.add(linePlaneIncludedElements_RP.label_P_Sprite, linePlaneIncludedElements_RP.label_D_Sprite);

    updateLinePlaneIncludedGeometry_RP();
    Object.values(linePlaneIncludedElements_RP).filter(el => el && typeof el.scale !== 'undefined').forEach((el, index) => {
        animateAxiomObject_AU(el, index * 40);
    });
}

// Line and Plane Intersecting
function updateLinePlaneIntersectingGeometry_RP() {
    const { planeP_Mesh, lineD_PtA, lineD_PtB, lineD_Mesh_Visible, lineD_Mesh_Hidden, intersectionPointVisual, intersectionLabel, label_P_Sprite, label_D_Sprite, planeY_P } = linePlaneIntersectingElements_RP;
    if (!THREE_AU || !planeP_Mesh || !lineD_PtA || !lineD_PtB || !lineD_Mesh_Visible || !lineD_Mesh_Hidden || !intersectionPointVisual || !intersectionLabel || !label_P_Sprite || !label_D_Sprite) return;

    const planeNormal = new THREE_AU.Vector3(0, 1, 0);
    const planePoint = new THREE_AU.Vector3(0, planeY_P, 0);
    const lineDir = new THREE_AU.Vector3().subVectors(lineD_PtB.position, lineD_PtA.position);
    const ray = new THREE_AU.Ray(lineD_PtA.position, lineDir.clone().normalize());
    const plane = new THREE_AU.Plane().setFromNormalAndCoplanarPoint(planeNormal, planePoint);
    const intersectPt = new THREE_AU.Vector3();
    
    const hasIntersection = ray.intersectPlane(plane, intersectPt);
    const segmentLengthSq = lineDir.lengthSq();
    const distToIntersectionSq = lineD_PtA.position.distanceToSquared(intersectPt);
    const isIntersectionOnSegment = distToIntersectionSq <= segmentLengthSq && lineDir.dot(new THREE_AU.Vector3().subVectors(intersectPt, lineD_PtA.position)) >=0;


    if (hasIntersection && isIntersectionOnSegment) {
        intersectionPointVisual.position.copy(intersectPt);
        intersectionPointVisual.visible = true;
        intersectionLabel.position.copy(intersectPt).add(new THREE_AU.Vector3(0.15, 0.2, 0.15));
        intersectionLabel.visible = true;

        // Determine which point is "above" (positive y relative to planeY_P)
        const dotA = (lineD_PtA.position.y - planeY_P);
        const dotB = (lineD_PtB.position.y - planeY_P);

        let ptAbove, ptBelow;
        if (dotA * dotB < 0) { // Points are on opposite sides
            ptAbove = dotA > 0 ? lineD_PtA.position : lineD_PtB.position;
            ptBelow = dotA < 0 ? lineD_PtA.position : lineD_PtB.position;
        } else if (Math.abs(dotA) < 0.001 && Math.abs(dotB) < 0.001) { // Line in plane
            ptAbove = lineD_PtA.position;
            ptBelow = lineD_PtB.position; // Show full solid line
        } else { // Both points on same side, line passes through
            // This case means the intersection is outside the segment P1-P2,
            // which should be handled by isIntersectionOnSegment.
            // For simplicity, assume P1 is start, P2 is end.
            // One point is the line start, the other is the line end.
            // Determine which segment is "visible" based on camera or an arbitrary rule (e.g., P1 to intersect solid)
            // For now, let's assume if P1.y > planeY_P, P1-Intersect is visible, else P2-Intersect is visible.
            if (lineD_PtA.position.distanceToSquared(intersectPt) < lineD_PtB.position.distanceToSquared(intersectPt)) {
                ptAbove = lineD_PtA.position;
                ptBelow = lineD_PtB.position;
            } else {
                ptAbove = lineD_PtB.position;
                ptBelow = lineD_PtA.position;
            }
        }
        
        updateLineMesh_AU(lineD_Mesh_Visible, ptAbove, intersectPt);
        updateDashedLineMesh_AU(lineD_Mesh_Hidden, intersectPt, ptBelow);
        lineD_Mesh_Visible.visible = true;
        lineD_Mesh_Hidden.visible = true;

    } else { // No intersection on segment (parallel or outside segment)
        intersectionPointVisual.visible = false;
        intersectionLabel.visible = false;
        updateLineMesh_AU(lineD_Mesh_Visible, lineD_PtA.position, lineD_PtB.position);
        lineD_Mesh_Visible.visible = true;
        lineD_Mesh_Hidden.visible = false;
    }
    
    label_P_Sprite.position.set(planeP_Mesh.geometry.parameters.width / 2 - 0.5, planeP_Mesh.position.y + 0.1, planeP_Mesh.geometry.parameters.height / 2 - 0.5);
    const dirD_Label = new THREE_AU.Vector3().subVectors(lineD_PtB.position, lineD_PtA.position).normalize();
    label_D_Sprite.position.copy(lineD_PtA.position).addScaledVector(dirD_Label, lineD_PtA.position.distanceTo(lineD_PtB.position) + 0.3).add(new THREE_AU.Vector3(0,0.2,0));
}

function runLinePlaneIntersecting_RP() {
    const planeColor = getCSSVarColor_RP('--plane-color');
    const lineColor = getCSSVarColor_RP('--accent-primary');
    const pointColor = getCSSVarColor_RP('--point-color-a');
    const intersectionColor = getCSSVarColor_RP('--point-color-c');
    
    linePlaneIntersectingElements_RP.planeY_P = 0;
    const { planeY_P } = linePlaneIntersectingElements_RP;

    const planeGeom = new THREE_AU.PlaneGeometry(7, 5);
    const planeMat = createAxiomObjectMaterial_AU('plane', planeColor, 0);
    linePlaneIntersectingElements_RP.planeP_Mesh = new THREE_AU.Mesh(planeGeom, planeMat);
    linePlaneIntersectingElements_RP.planeP_Mesh.rotation.x = -Math.PI / 2;
    linePlaneIntersectingElements_RP.planeP_Mesh.position.y = planeY_P;
    linePlaneIntersectingElements_RP.planeP_Mesh.userData.finalOpacity = 0.45;
    demoGroup_AU.add(linePlaneIntersectingElements_RP.planeP_Mesh);

    const pA_init = new THREE_AU.Vector3(-2, 1, 0.5);
    const pB_init = new THREE_AU.Vector3(2, -1, -0.5);
    linePlaneIntersectingElements_RP.lineD_PtA = createAxiomPoint_AU(pA_init, pointColor, "P1", 0.1, 1.8, true);
    linePlaneIntersectingElements_RP.lineD_PtB = createAxiomPoint_AU(pB_init, pointColor, "P2", 0.1, 1.8, true);
    [linePlaneIntersectingElements_RP.lineD_PtA, linePlaneIntersectingElements_RP.lineD_PtB].forEach(p => {
        if (p) {
            p.userData.updateFunction = updateLinePlaneIntersectingGeometry_RP;
            // p.userData.demo = 'linePlaneIntersecting'; // Not needed as no fixed Y constraint from a store
            demoGroup_AU.add(p);
        }
    });

    linePlaneIntersectingElements_RP.lineD_Mesh_Visible = createLineMesh_AU(pA_init, pB_init, lineColor, 0.025, "LineD_Visible");
    linePlaneIntersectingElements_RP.lineD_Mesh_Hidden = createDashedLineMesh_AU(pA_init,pB_init, lineColor, 0.1,0.05,"LineD_Hidden");
    demoGroup_AU.add(linePlaneIntersectingElements_RP.lineD_Mesh_Visible, linePlaneIntersectingElements_RP.lineD_Mesh_Hidden);
    
    linePlaneIntersectingElements_RP.intersectionPointVisual = createAxiomPoint_AU(new THREE_AU.Vector3(), intersectionColor, "", 0.08, 1.5, false);
    linePlaneIntersectingElements_RP.intersectionLabel = createTextSprite_AU("A", new THREE_AU.Vector3(), intersectionColor, 30, 0.006);
    demoGroup_AU.add(linePlaneIntersectingElements_RP.intersectionPointVisual, linePlaneIntersectingElements_RP.intersectionLabel);

    linePlaneIntersectingElements_RP.label_P_Sprite = createTextSprite_AU("𝒫", new THREE_AU.Vector3(), planeColor, 35, 0.007);
    linePlaneIntersectingElements_RP.label_D_Sprite = createTextSprite_AU("(𝓓)", new THREE_AU.Vector3(), lineColor, 35, 0.007);
    demoGroup_AU.add(linePlaneIntersectingElements_RP.label_P_Sprite, linePlaneIntersectingElements_RP.label_D_Sprite);
    
    updateLinePlaneIntersectingGeometry_RP();
    Object.values(linePlaneIntersectingElements_RP).filter(el => el && typeof el.scale !== 'undefined').forEach((el, index) => {
        animateAxiomObject_AU(el, index * 40);
    });
}

// --- NEW PROPERTY DEMOS ---

// Demo 1: Transitivity of Parallel Lines
function updateTransitivityParallelLinesGeometry_RP() {
    // Implement logic
}
function runTransitivityParallelLines_RP() {
    // Implement setup
}

// Demo 2: Line Parallel to Plane via Included Line
function updateLineParallelToPlaneViaIncludedLineGeometry_RP() {
    // Implement logic
}
function runLineParallelToPlaneViaIncludedLine_RP() {
    // Implement setup
}

// Demo 3: Plane Intersecting Parallel Lines
function updatePlaneIntersectingParallelLinesGeometry_RP() {
    // Implement logic
}
function runPlaneIntersectingParallelLines_RP() {
    // Implement setup
}

// Demo 4: Roof Theorem
function updateRoofTheoremGeometry_RP() {
    // Implement logic
}
function runRoofTheorem_RP() {
    // Implement setup
}
