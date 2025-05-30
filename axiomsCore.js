
// axiomsCore.js: Manages logic for Axiom 1, 2, and 3 demos.

// Element stores for Axioms
let axiom1Elements_AC = { pointA: null, pointB: null, line: null };
let axiom2Elements_AC = { pointA: null, pointB: null, pointC: null, planeMesh: null };
let axiom3Elements_AC = { pointA: null, pointB: null, pointC_visual: null, pointD_visual: null, lineAB: null, planeP: null, quadFace: null, fixedY: 0 };

// Register stores with utilities for centralized clearing
if (typeof registerDemoElementStore_AU === 'function') {
    registerDemoElementStore_AU(axiom1Elements_AC);
    registerDemoElementStore_AU(axiom2Elements_AC);
    registerDemoElementStore_AU(axiom3Elements_AC);
} else {
    console.error("axiomsCore.js: registerDemoElementStore_AU is not defined. Ensure axiomUtilities.js is loaded first.");
}

function getCSSVarColor(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

// --- Axiom 1 ---
function updateAxiom1Geometry_AC() {
    if (axiom1Elements_AC.pointA && axiom1Elements_AC.pointB && axiom1Elements_AC.line) {
        const pos = axiom1Elements_AC.line.geometry.attributes.position;
        pos.setXYZ(0, axiom1Elements_AC.pointA.position.x, axiom1Elements_AC.pointA.position.y, axiom1Elements_AC.pointA.position.z);
        pos.setXYZ(1, axiom1Elements_AC.pointB.position.x, axiom1Elements_AC.pointB.position.y, axiom1Elements_AC.pointB.position.z);
        pos.needsUpdate = true;
        axiom1Elements_AC.line.geometry.computeBoundingSphere();
    }
}
function runAxiom1_AC() {
    const pA_initial = new THREE_AU.Vector3(-2.5, 1, 0.5), pB_initial = new THREE_AU.Vector3(2.5, -0.5, -0.5);
    axiom1Elements_AC.pointA = createAxiomPoint_AU(pA_initial, getCSSVarColor('--point-color-a'),"A", 0.2, 1.8, true);
    axiom1Elements_AC.pointB = createAxiomPoint_AU(pB_initial, getCSSVarColor('--point-color-b'),"B", 0.2, 1.8, true);
    [axiom1Elements_AC.pointA, axiom1Elements_AC.pointB].forEach(p => { if(p){p.userData.axiom = 1; p.userData.updateFunction = updateAxiom1Geometry_AC; demoGroup_AU.add(p); }});

    const lineGeom = new THREE_AU.BufferGeometry().setFromPoints([pA_initial.clone(), pB_initial.clone()]);
    axiom1Elements_AC.line = new THREE_AU.Line(lineGeom, createAxiomObjectMaterial_AU('line', getCSSVarColor('--line-color')));
    demoGroup_AU.add(axiom1Elements_AC.line);

    Promise.all([animateAxiomObject_AU(axiom1Elements_AC.pointA), animateAxiomObject_AU(axiom1Elements_AC.pointB,150)]).catch(e => console.warn("Axiom 1 anim error",e));
}

// --- Axiom 2 ---
function updateAxiom2Geometry_AC() {
     if (axiom2Elements_AC.pointA && axiom2Elements_AC.pointB && axiom2Elements_AC.pointC && axiom2Elements_AC.planeMesh) {
        const geom = axiom2Elements_AC.planeMesh.geometry; const pos = geom.attributes.position;
        pos.setXYZ(0, axiom2Elements_AC.pointA.position.x, axiom2Elements_AC.pointA.position.y, axiom2Elements_AC.pointA.position.z);
        pos.setXYZ(1, axiom2Elements_AC.pointB.position.x, axiom2Elements_AC.pointB.position.y, axiom2Elements_AC.pointB.position.z);
        pos.setXYZ(2, axiom2Elements_AC.pointC.position.x, axiom2Elements_AC.pointC.position.y, axiom2Elements_AC.pointC.position.z);
        pos.needsUpdate = true;
        geom.computeVertexNormals();
        geom.computeBoundingSphere();
    }
}
function runAxiom2_AC() {
    const pA_i=new THREE_AU.Vector3(-2.5,-1,1), pB_i=new THREE_AU.Vector3(2,0,-1), pC_i=new THREE_AU.Vector3(0,2.5,0.5);
    axiom2Elements_AC.pointA = createAxiomPoint_AU(pA_i,getCSSVarColor('--point-color-a'),"A", 0.2, 1.8, true);
    axiom2Elements_AC.pointB = createAxiomPoint_AU(pB_i,getCSSVarColor('--point-color-b'),"B", 0.2, 1.8, true);
    axiom2Elements_AC.pointC = createAxiomPoint_AU(pC_i,getCSSVarColor('--point-color-c'),"C", 0.2, 1.8, true);
    [axiom2Elements_AC.pointA,axiom2Elements_AC.pointB,axiom2Elements_AC.pointC].forEach(p=>{if(p){p.userData.axiom=2;p.userData.updateFunction=updateAxiom2Geometry_AC;demoGroup_AU.add(p);}});

    const planeGeom = new THREE_AU.BufferGeometry();
    const vertices = new Float32Array([ pA_i.x,pA_i.y,pA_i.z,  pB_i.x,pB_i.y,pB_i.z,  pC_i.x,pC_i.y,pC_i.z ]);
    planeGeom.setAttribute('position',new THREE_AU.BufferAttribute(vertices,3));
    planeGeom.setIndex([0,1,2]);
    planeGeom.computeVertexNormals();

    axiom2Elements_AC.planeMesh = new THREE_AU.Mesh(planeGeom, createAxiomObjectMaterial_AU('plane',getCSSVarColor('--plane-color')));
    axiom2Elements_AC.planeMesh.material.opacity = 0;
    axiom2Elements_AC.planeMesh.userData.finalOpacity = 0.5;
    demoGroup_AU.add(axiom2Elements_AC.planeMesh);

    Promise.all([ animateAxiomObject_AU(axiom2Elements_AC.pointA), animateAxiomObject_AU(axiom2Elements_AC.pointB,150), animateAxiomObject_AU(axiom2Elements_AC.pointC,300), animateAxiomObject_AU(axiom2Elements_AC.planeMesh, 450) ])
    .catch(e => console.warn("Axiom 2 anim error",e));
}

// --- Axiom 3 ---
function updateAxiom3Geometry_AC() {
    if (!axiom3Elements_AC.pointA || !axiom3Elements_AC.pointB || !axiom3Elements_AC.lineAB || !axiom3Elements_AC.pointC_visual || !axiom3Elements_AC.pointD_visual || !axiom3Elements_AC.quadFace) return;
    const { pointA, pointB, pointC_visual, pointD_visual, lineAB, quadFace } = axiom3Elements_AC;

    const linePos = lineAB.geometry.attributes.position;
    linePos.setXYZ(0, pointA.position.x, pointA.position.y, pointA.position.z);
    linePos.setXYZ(1, pointB.position.x, pointB.position.y, pointB.position.z);
    linePos.needsUpdate = true;
    lineAB.geometry.computeBoundingSphere();

    const vec_AB = new THREE_AU.Vector3().subVectors(pointB.position, pointA.position);
    const rectangleWidthFactor = 1.0;
    let vec_perpendicular_to_AB_in_plane = new THREE_AU.Vector3(-vec_AB.z, 0, vec_AB.x).normalize().multiplyScalar(rectangleWidthFactor);
    if(vec_perpendicular_to_AB_in_plane.lengthSq() < 0.0001) {
         vec_perpendicular_to_AB_in_plane.set(rectangleWidthFactor, 0, 0);
    }

    pointD_visual.position.copy(pointA.position).add(vec_perpendicular_to_AB_in_plane);
    pointC_visual.position.copy(pointB.position).add(vec_perpendicular_to_AB_in_plane);

    const quadPos = quadFace.geometry.attributes.position;
    quadPos.setXYZ(0, pointA.position.x, pointA.position.y, pointA.position.z);
    quadPos.setXYZ(1, pointB.position.x, pointB.position.y, pointB.position.z);
    quadPos.setXYZ(2, pointC_visual.position.x, pointC_visual.position.y, pointC_visual.position.z);
    quadPos.setXYZ(3, pointD_visual.position.x, pointD_visual.position.y, pointD_visual.position.z);
    quadPos.needsUpdate = true;
    quadFace.geometry.computeVertexNormals();
    quadFace.geometry.computeBoundingSphere();
}
function runAxiom3_AC() {
    axiom3Elements_AC.fixedY = 0;
    axiom3Elements_AC.planeP = null;

    const pA_i = new THREE_AU.Vector3(-2, axiom3Elements_AC.fixedY, -1), pB_i = new THREE_AU.Vector3(2, axiom3Elements_AC.fixedY, -1.5);
    axiom3Elements_AC.pointA = createAxiomPoint_AU(pA_i, getCSSVarColor('--point-color-a'),"A", 0.2, 1.8, true);
    axiom3Elements_AC.pointB = createAxiomPoint_AU(pB_i, getCSSVarColor('--point-color-b'),"B", 0.2, 1.8, true);
    [axiom3Elements_AC.pointA, axiom3Elements_AC.pointB].forEach(p => { if(p){p.userData.axiom = 3; p.userData.updateFunction = updateAxiom3Geometry_AC; demoGroup_AU.add(p);}});

    const pD_i = new THREE_AU.Vector3(), pC_i = new THREE_AU.Vector3();
    const vec_AB_init = new THREE_AU.Vector3().subVectors(pB_i, pA_i);
    let vec_perp_init = new THREE_AU.Vector3(-vec_AB_init.z, 0, vec_AB_init.x).normalize().multiplyScalar(1.0);
    if(vec_perp_init.lengthSq() < 0.0001) vec_perp_init.set(1.0, 0, 0);
    pD_i.copy(pA_i).add(vec_perp_init); pC_i.copy(pB_i).add(vec_perp_init);

    axiom3Elements_AC.pointD_visual = createAxiomPoint_AU(pD_i,getCSSVarColor('--point-color-d'),"D",0.15);
    axiom3Elements_AC.pointC_visual = createAxiomPoint_AU(pC_i,getCSSVarColor('--point-color-c'),"C",0.15);
    if(axiom3Elements_AC.pointD_visual) { demoGroup_AU.add(axiom3Elements_AC.pointD_visual);}
    if(axiom3Elements_AC.pointC_visual) { demoGroup_AU.add(axiom3Elements_AC.pointC_visual);}

    axiom3Elements_AC.lineAB = new THREE_AU.Line( new THREE_AU.BufferGeometry().setFromPoints([pA_i.clone(),pB_i.clone()]), createAxiomObjectMaterial_AU('line',getCSSVarColor('--line-color')));
    demoGroup_AU.add(axiom3Elements_AC.lineAB);

    const quadGeom = new THREE_AU.BufferGeometry();
    const quadVertices = new Float32Array([ pA_i.x,pA_i.y,pA_i.z,  pB_i.x,pB_i.y,pB_i.z,  pC_i.x,pC_i.y,pC_i.z,  pD_i.x,pD_i.y,pD_i.z ]);
    quadGeom.setAttribute('position', new THREE_AU.BufferAttribute(quadVertices, 3));
    quadGeom.setIndex([0,1,2, 0,2,3]);
    quadGeom.computeVertexNormals();
    const quadMaterial = createAxiomObjectMaterial_AU('plane', getCSSVarColor('--accent-primary'), 0);
    axiom3Elements_AC.quadFace = new THREE_AU.Mesh(quadGeom, quadMaterial);
    axiom3Elements_AC.quadFace.userData.finalOpacity = 0.4;
    demoGroup_AU.add(axiom3Elements_AC.quadFace);

    updateAxiom3Geometry_AC();
    Promise.all([
        animateAxiomObject_AU(axiom3Elements_AC.pointA, 100), animateAxiomObject_AU(axiom3Elements_AC.pointB, 200),
        animateAxiomObject_AU(axiom3Elements_AC.pointC_visual, 300, 500, 1), animateAxiomObject_AU(axiom3Elements_AC.pointD_visual, 400, 500, 1),
        animateAxiomObject_AU(axiom3Elements_AC.quadFace, 250)
    ]).catch(e => console.warn("Axiom 3 anim error",e));
}