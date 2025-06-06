// References to global objects from main.js, stored locally
let sm_THREE, sm_ANIME; // Scoped to shapeManager
let currentShapeMaterial_SM, currentEdgesMaterial_SM; 
let mainShapeGroup_SM;
let currentViewMode_SM;

// Local store for shape-specific data and creation functions
const shapesData_SM = {};

// Helper to store corner labels for easy removal/update
let cornerLabelsGroup_SM = null;

// Label management functions from main.js
let registerLabel_SM, unregisterLabel_SM, isLabelUsed_SM_Callback;


// Helper function to get CSS variable values within this module
function getCSSVariableValue_SM(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

function initializeShapeManager(three, anime, mainGroup, initialViewMode, labelManagementFns) {
    sm_THREE = three;
    sm_ANIME = anime;
    mainShapeGroup_SM = mainGroup;
    currentViewMode_SM = initialViewMode; 

    if (labelManagementFns) {
        registerLabel_SM = labelManagementFns.registerLabel;
        unregisterLabel_SM = labelManagementFns.unregisterLabel;
        isLabelUsed_SM_Callback = labelManagementFns.isLabelUsed;
    } else {
        console.error("ShapeManager: Label management functions not provided from main.js!");
        registerLabel_SM = () => {};
        unregisterLabel_SM = () => {};
        isLabelUsed_SM_Callback = () => false;
    }


    shapesData_SM.cube = { name: "Cube", faces: 6, edges: 12, vertices: 8, create: createCube_SM };
    shapesData_SM.rectangularParallelepiped = { name: "Parallélépipède Rectangle", faces: 6, edges: 12, vertices: 8, create: createRectangularParallelepiped_SM };
    shapesData_SM.sphere = { name: "Sphère", faces: undefined, edges: undefined, vertices: undefined, create: createSphere_SM };
    shapesData_SM.cylinder = { name: "Cylindre", faces: 3, edges: 2, vertices: undefined, create: createCylinder_SM };
    shapesData_SM.cone = { name: "Cône", faces: 2, edges: 1, vertices: 1, create: createCone_SM }; 
    shapesData_SM.pyramid = { name: "Pyramide (base carrée)", faces: 5, edges: 8, vertices: 5, create: createPyramid_SM };
    shapesData_SM.tetrahedron = { name: "Tétraèdre", faces: 4, edges: 6, vertices: 4, create: createTetrahedron_SM };
    shapesData_SM.triangularPrism = { name: "Prisme Triangulaire", faces: 5, edges: 9, vertices: 6, create: createTriangularPrism_SM };
    shapesData_SM.pentagonalPrism = { name: "Prisme Pentagonal", faces: 7, edges: 15, vertices: 10, create: createPentagonalPrism_SM };
    shapesData_SM.torus = { name: "Tore", faces: undefined, edges: undefined, vertices: undefined, create: createTorus_SM };
    shapesData_SM.torusKnot = { name: "Nœud Torique", faces: undefined, edges: undefined, vertices: undefined, create: createTorusKnot_SM };


    currentShapeMaterial_SM = createShapeMaterial_SM(null, currentViewMode_SM);
    currentEdgesMaterial_SM = createEdgesMaterial_SM(null);

    cornerLabelsGroup_SM = new sm_THREE.Group();
    mainShapeGroup_SM.add(cornerLabelsGroup_SM); 
}

function getShapesDataSM() {
    return shapesData_SM;
}
function getCurrentShapeMaterialSM() {
    return currentShapeMaterial_SM;
}
function getCurrentEdgesMaterialSM() {
    return currentEdgesMaterial_SM;
}

function clearCornerLabels_SM() {
    if (cornerLabelsGroup_SM) {
        while (cornerLabelsGroup_SM.children.length > 0) {
            const label = cornerLabelsGroup_SM.children[0];
            if (label.userData.labelText && typeof unregisterLabel_SM === 'function') {
                unregisterLabel_SM(label.userData.labelText);
            }
            if (label.material.map) label.material.map.dispose();
            label.material.dispose();
            cornerLabelsGroup_SM.remove(label);
        }
    }
}

function updateCornerLabelText_SM(labelSprite, newText) {
    if (!labelSprite || !labelSprite.userData.isCornerLabel || !sm_THREE) return false;
    
    const oldLabel = labelSprite.userData.labelText;

    // Validation is now primarily handled before calling this, or by the command.
    // This function's role is reduced if performLabelRename_M in main.js handles registration.
    // However, for direct calls (if any), validation is still useful here.
    if (typeof isLabelUsed_SM_Callback === 'function' && newText !== oldLabel && isLabelUsed_SM_Callback(newText)) {
        // This alert might be redundant if promptForNewLabel_UM already validates.
        // Consider if this specific alert is needed or if the command pattern handles it.
        // For now, keeping it as a safeguard for direct calls.
        // alert("Cette étiquette est déjà utilisée. Veuillez en choisir une autre.");
        return false; 
    }

    // The actual label update (unregister old, register new, update sprite)
    // is now expected to be handled by performLabelRename_M in main.js,
    // which is called by the RenameLabelCommand.
    // This function now might just confirm the sprite type.
    
    // Example of direct update (if not using command pattern for some reason):
    // if (typeof unregisterLabel_SM === 'function' && oldLabel) {
    //     unregisterLabel_SM(oldLabel);
    // }
    // if (typeof registerLabel_SM === 'function' && newText) {
    //     registerLabel_SM(newText);
    // }
    // labelSprite.userData.labelText = newText; 
    // if (typeof updateTextSpriteSize_AU === 'function') updateTextSpriteSize_AU(labelSprite); 

    return true; // Indicate success for the command pattern
}


function createCornerLabel_SM(text, position) {
    const labelSprite = createTextSprite_AU(text, position, getCSSVariableValue_SM('--text-light') || "rgba(230, 230, 230, 0.9)", null, 0.0035, true, false); 
        
    if (labelSprite) {
        labelSprite.userData.isCornerLabel = true;
        labelSprite.userData.vertexPosition = position.clone(); // Store local vertex position
    }
    return labelSprite;
}


function addCornerLabelsToShape_SM(shapeMesh) {
    clearCornerLabels_SM(); 

    const geometry = shapeMesh.geometry;
    if (!geometry || !geometry.attributes.position) return;

    const uniqueVertices = [];
    const labels = [];
    const verticesAttribute = geometry.attributes.position;

    if (shapeMesh.geometry.type === "BoxGeometry" || shapeMesh.geometry.name === "Parallélépipède Rectangle") {
        if (!geometry.boundingBox) geometry.computeBoundingBox();
        const min = geometry.boundingBox.min;
        const max = geometry.boundingBox.max;
        uniqueVertices.push(
            new sm_THREE.Vector3(min.x, max.y, min.z), new sm_THREE.Vector3(max.x, max.y, min.z), 
            new sm_THREE.Vector3(max.x, max.y, max.z), new sm_THREE.Vector3(min.x, max.y, max.z), 
            new sm_THREE.Vector3(min.x, min.y, min.z), new sm_THREE.Vector3(max.x, min.y, min.z), 
            new sm_THREE.Vector3(max.x, min.y, max.z), new sm_THREE.Vector3(min.x, min.y, max.z)
        );
        labels.push('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H');
    } else if (shapeMesh.geometry.name === "Prisme Triangulaire" && geometry.parameters.radialSegments === 3) {
        const radius = geometry.parameters.radiusTop; 
        const height = geometry.parameters.height;
        const N = 3;
        for (let i = 0; i < N; i++) {
            const angle = (i / N) * Math.PI * 2;
            uniqueVertices.push(new sm_THREE.Vector3(radius * Math.cos(angle), height / 2, radius * Math.sin(angle)));
            labels.push(String.fromCharCode(65 + i));
        }
        for (let i = 0; i < N; i++) {
            const angle = (i / N) * Math.PI * 2;
            uniqueVertices.push(new sm_THREE.Vector3(radius * Math.cos(angle), -height / 2, radius * Math.sin(angle)));
            labels.push(String.fromCharCode(65 + N + i));
        }
    } else if (shapeMesh.geometry.name === "Prisme Pentagonal" && geometry.parameters.radialSegments === 5) {
        const radius = geometry.parameters.radiusTop; 
        const height = geometry.parameters.height;
        const N = 5;
        for (let i = 0; i < N; i++) {
            const angle = (i / N) * Math.PI * 2;
            uniqueVertices.push(new sm_THREE.Vector3(radius * Math.cos(angle), height / 2, radius * Math.sin(angle)));
            labels.push(String.fromCharCode(65 + i));
        }
        for (let i = 0; i < N; i++) {
            const angle = (i / N) * Math.PI * 2;
            uniqueVertices.push(new sm_THREE.Vector3(radius * Math.cos(angle), -height / 2, radius * Math.sin(angle)));
            labels.push(String.fromCharCode(65 + N + i));
        }
    } else if (shapeMesh.geometry.type === "ConeGeometry" && geometry.parameters.radialSegments === 4) { // Pyramid
        uniqueVertices.push(new sm_THREE.Vector3(0, geometry.parameters.height / 2, 0)); // Apex
        labels.push('S'); 
        const radius = geometry.parameters.radius;
        const height = geometry.parameters.height;
        for (let i = 0; i < 4; i++) { 
            const angle = (i / 4) * Math.PI * 2 + Math.PI / 4; 
            uniqueVertices.push(new sm_THREE.Vector3(radius * Math.cos(angle), -height / 2, radius * Math.sin(angle)));
            labels.push(String.fromCharCode(65 + i)); 
        }
    } else if (shapeMesh.geometry.type === "TetrahedronGeometry") {
        const uniqueSet = new Set();
        for (let i = 0; i < verticesAttribute.count && uniqueVertices.length < 4 ; ++i) {
            const x = verticesAttribute.getX(i);
            const y = verticesAttribute.getY(i);
            const z = verticesAttribute.getZ(i);
            const key = `${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}`;
            if (!uniqueSet.has(key)) {
                uniqueSet.add(key);
                uniqueVertices.push(new sm_THREE.Vector3(x,y,z));
                labels.push(String.fromCharCode(65 + uniqueVertices.length - 1));
            }
        }
    } else if (shapeMesh.geometry.type === "ConeGeometry") { 
         uniqueVertices.push(new sm_THREE.Vector3(0, geometry.parameters.height / 2, 0));
         labels.push('S');
    }

    uniqueVertices.forEach((vertexPos, index) => {
        if (labels[index]) { 
            const labelText = labels[index];
            if (typeof registerLabel_SM === 'function') {
                registerLabel_SM(labelText);
            }
            const labelSprite = createCornerLabel_SM(labelText, vertexPos);
            if(labelSprite) cornerLabelsGroup_SM.add(labelSprite);
        }
    });
    cornerLabelsGroup_SM.visible = (currentViewMode_SM === 'full' || currentViewMode_SM === 'edges');
}


function initializeVertexColors_SM(geometry, baseColor) {
    const numVertices = geometry.attributes.position.count;
    const colors = new Float32Array(numVertices * 3);
    for (let i = 0; i < numVertices; i++) {
        colors[i * 3 + 0] = baseColor.r;
        colors[i * 3 + 1] = baseColor.g;
        colors[i * 3 + 2] = baseColor.b;
    }
    geometry.setAttribute('color', new sm_THREE.BufferAttribute(colors, 3));
}

function resetHighlights_SM(currentShapeMesh, currentEdgesMesh, currentViewMode) {
    currentViewMode_SM = currentViewMode; 
    if (currentShapeMesh && currentShapeMesh.geometry && currentShapeMesh.geometry.attributes.color) {
        const baseColor = getViewModeColor_SM(currentShapeMesh.geometry.name, 'full');
        initializeVertexColors_SM(currentShapeMesh.geometry, baseColor);
        currentShapeMesh.geometry.attributes.color.needsUpdate = true;
    }
    if (currentEdgesMesh && currentEdgesMesh.geometry && currentEdgesMesh.geometry.attributes.color) {
        const baseColor = getViewModeColor_SM(currentShapeMesh ? currentShapeMesh.geometry.name : null, 'edges');
        initializeVertexColors_SM(currentEdgesMesh.geometry, baseColor);
        currentEdgesMesh.geometry.attributes.color.needsUpdate = true;
    }
     if (currentShapeMesh) { 
        addCornerLabelsToShape_SM(currentShapeMesh);
    } else {
        clearCornerLabels_SM();
    }
}


function getViewModeColor_SM(shapeNameUnused, mode) {
    let colorString;
    if (mode === 'edges') { 
        colorString = getCSSVariableValue_SM('--main-shape-edge-color');
    } else { // 'full'
        colorString = getCSSVariableValue_SM('--main-shape-fill-color');
    }
    return new sm_THREE.Color(colorString);
}

function createShapeMaterial_SM(shapeInfo, mode) { 
    const materialColor = getViewModeColor_SM(shapeInfo ? shapeInfo.name : null, 'full');
    return new sm_THREE.MeshStandardMaterial({
        color: materialColor,
        vertexColors: true,
        metalness: 0.3,  // Adjusted for better look
        roughness: 0.4,  // Adjusted for better look
        wireframe: false, 
        flatShading: false,
        side: sm_THREE.DoubleSide,
        transparent: true, 
        opacity: 1         
    });
}

function createEdgesMaterial_SM(shapeInfo) {
    const color = getViewModeColor_SM(shapeInfo ? shapeInfo.name : null, 'edges');
    return new sm_THREE.LineBasicMaterial({
        color: color,
        vertexColors: true, 
        transparent: true, 
        opacity: 1         
    });
}

function createCube_SM() {
    const geometry = new sm_THREE.BoxGeometry(2.5, 2.5, 2.5);
    geometry.name = 'Cube';
    initializeVertexColors_SM(geometry, getViewModeColor_SM('Cube', 'full'));
    const mesh = new sm_THREE.Mesh(geometry, currentShapeMaterial_SM);
    return mesh;
}

function createRectangularParallelepiped_SM() {
    const geometry = new sm_THREE.BoxGeometry(3.5, 2.0, 1.5); 
    geometry.name = 'Parallélépipède Rectangle';
    initializeVertexColors_SM(geometry, getViewModeColor_SM('Parallélépipède Rectangle', 'full'));
    const mesh = new sm_THREE.Mesh(geometry, currentShapeMaterial_SM);
    return mesh;
}

function createSphere_SM() {
    const geometry = new sm_THREE.SphereGeometry(1.8, 32, 16);
    geometry.name = 'Sphère';
    initializeVertexColors_SM(geometry, getViewModeColor_SM('Sphère', 'full'));
    const mesh = new sm_THREE.Mesh(geometry, currentShapeMaterial_SM);
    return mesh;
}
function createCylinder_SM() {
    const geometry = new sm_THREE.CylinderGeometry(1.2, 1.2, 3, 32);
    geometry.name = 'Cylindre';
    initializeVertexColors_SM(geometry, getViewModeColor_SM('Cylindre', 'full'));
    const mesh = new sm_THREE.Mesh(geometry, currentShapeMaterial_SM);
    return mesh;
}
function createCone_SM() {
    const geometry = new sm_THREE.ConeGeometry(1.5, 3.5, 32);
    geometry.name = 'Cône';
    initializeVertexColors_SM(geometry, getViewModeColor_SM('Cône', 'full'));
    const mesh = new sm_THREE.Mesh(geometry, currentShapeMaterial_SM);
    return mesh;
}
function createPyramid_SM() {
    const geometry = new sm_THREE.ConeGeometry(1.8, 2.8, 4); 
    geometry.name = 'Pyramide (base carrée)';
    initializeVertexColors_SM(geometry, getViewModeColor_SM('Pyramide (base carrée)', 'full'));
    const mesh = new sm_THREE.Mesh(geometry, currentShapeMaterial_SM);
    return mesh;
}
function createTetrahedron_SM() {
    const geometry = new sm_THREE.TetrahedronGeometry(2);
    geometry.name = 'Tétraèdre';
    initializeVertexColors_SM(geometry, getViewModeColor_SM('Tétraèdre', 'full'));
    const mesh = new sm_THREE.Mesh(geometry, currentShapeMaterial_SM);
    return mesh;
}

function createTriangularPrism_SM() {
    const geometry = new sm_THREE.CylinderGeometry(1.5, 1.5, 3, 3, 1);
    geometry.name = 'Prisme Triangulaire';
    initializeVertexColors_SM(geometry, getViewModeColor_SM(geometry.name, 'full'));
    const mesh = new sm_THREE.Mesh(geometry, currentShapeMaterial_SM);
    return mesh;
}

function createPentagonalPrism_SM() {
    const geometry = new sm_THREE.CylinderGeometry(1.5, 1.5, 2.5, 5, 1);
    geometry.name = 'Prisme Pentagonal';
    initializeVertexColors_SM(geometry, getViewModeColor_SM(geometry.name, 'full'));
    const mesh = new sm_THREE.Mesh(geometry, currentShapeMaterial_SM);
    return mesh;
}

function createTorus_SM() {
    const geometry = new sm_THREE.TorusGeometry(2, 0.8, 16, 40);
    geometry.name = 'Tore';
    initializeVertexColors_SM(geometry, getViewModeColor_SM(geometry.name, 'full'));
    const mesh = new sm_THREE.Mesh(geometry, currentShapeMaterial_SM);
    return mesh;
}

function createTorusKnot_SM() {
    const geometry = new sm_THREE.TorusKnotGeometry(2, 0.6, 100, 16, 2, 3);
    geometry.name = 'Nœud Torique';
    initializeVertexColors_SM(geometry, getViewModeColor_SM(geometry.name, 'full'));
    const mesh = new sm_THREE.Mesh(geometry, currentShapeMaterial_SM);
    return mesh;
}


function createEdgesRepresentation_SM(sourceGeometry) {
    if (!sourceGeometry) return null;
    const edgesGeom = new sm_THREE.EdgesGeometry(sourceGeometry, 1);
    edgesGeom.name = sourceGeometry.name + "_edges";
    initializeVertexColors_SM(edgesGeom, getViewModeColor_SM(sourceGeometry.name, 'edges'));
    return new sm_THREE.LineSegments(edgesGeom, currentEdgesMaterial_SM);
}

function disposeShapeResources_SM(mesh) {
    if (mesh) {
        if (mesh.geometry) mesh.geometry.dispose();
        if (mainShapeGroup_SM && mainShapeGroup_SM.children.includes(mesh)) {
            mainShapeGroup_SM.remove(mesh);
        }
    }
}