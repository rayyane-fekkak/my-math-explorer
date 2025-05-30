
// axiomUtilities.js: Shared utility functions for geometric demos.

// Local references to THREE, anime, and scene objects, set by initializeAxiomUtilities
let THREE_AU, ANIME_AU, demoGroup_AU, camera_AU, renderer_AU, controls_AU, container_AU;

// Draggable object logic
let draggedObject_AU = null;
let dragPlaneGlobal_AU;
let intersectionGlobal_AU;
let offsetGlobal_AU;
let raycasterDraggable_AU;
let mouseDraggable_AU;

// Keep track of all demo element stores for easy clearing
let allDemoElementStores_AU = []; // Will be populated by individual demo files

// Helper to get CSS var values within this module too
function getCSSVariableValue_AU(varName, defaultValue = null) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return value || defaultValue;
}


function initializeAxiomUtilities(threeRef, animeRef, demoGroupRef, cameraRef, rendererRef, controlsRef, containerRef) {
    THREE_AU = threeRef;
    ANIME_AU = animeRef;
    demoGroup_AU = demoGroupRef;
    camera_AU = cameraRef;
    renderer_AU = rendererRef;
    controls_AU = controlsRef;
    container_AU = containerRef;

    dragPlaneGlobal_AU = new THREE_AU.Plane();
    intersectionGlobal_AU = new THREE_AU.Vector3();
    offsetGlobal_AU = new THREE_AU.Vector3();
    raycasterDraggable_AU = new THREE_AU.Raycaster();
    mouseDraggable_AU = new THREE_AU.Vector2();

    if (renderer_AU && renderer_AU.domElement) {
        renderer_AU.domElement.addEventListener('pointerdown', onDragStart_AU, false);
        renderer_AU.domElement.addEventListener('pointermove', onDragMove_AU, false);
        renderer_AU.domElement.addEventListener('pointerup', onDragEnd_AU, false);
        renderer_AU.domElement.addEventListener('pointerleave', onDragEnd_AU, false);
    } else {
        console.error("AxiomUtilities: Renderer DOM element not available for attaching drag listeners.");
    }
}

function registerDemoElementStore_AU(store) {
    if (!allDemoElementStores_AU.includes(store)) {
        allDemoElementStores_AU.push(store);
    }
}


function createAxiomObjectMaterial_AU(type, colorValue, opacity = 1) {
    let material;
    const color = new THREE_AU.Color(colorValue);
    switch (type) {
        case 'point': material = new THREE_AU.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.3, roughness: 0.6, metalness: 0.1 }); break;
        case 'line': material = new THREE_AU.LineBasicMaterial({ color: color, linewidth: 2 }); break;
        case 'dashedLine': material = new THREE_AU.LineDashedMaterial({ color: color, linewidth: 1, scale: 1, dashSize: 0.1, gapSize: 0.05 }); break;
        case 'plane': material = new THREE_AU.MeshStandardMaterial({ color: color, side: THREE_AU.DoubleSide, transparent: true, opacity: opacity, metalness: 0.1, roughness: 0.8 }); break;
        default: material = new THREE_AU.MeshBasicMaterial({ color: color });
    }
    return material;
}

function createAxiomPoint_AU(position, colorValue = '#ff6347', name = "", size = 0.2, labelOffsetFactor = 1.8, isDraggable = false, labelColor = null, labelFontSizeOverride = null, labelScaleFactor = 0.005, isDynamicPointLabel = false) {
    if (!THREE_AU) return null;
    const geometry = new THREE_AU.SphereGeometry(size, 16, 16);
    const material = createAxiomObjectMaterial_AU('point', colorValue);
    const point = new THREE_AU.Mesh(geometry, material);
    point.position.copy(position); point.name = name; 
    point.userData.labelName = name; 
    point.userData.isDraggable = isDraggable;
    point.userData.dragConstraint = null;
    point.userData.isDynamicPoint = isDynamicPointLabel; // Mark if it's a dynamic point

    if (name && name !== '') {
      const spriteLabelColor = labelColor ? labelColor : (getCSSVariableValue_AU('--text-light') ||'#FFFFFF');
      const sprite = createTextSprite_AU(name, new THREE_AU.Vector3(0, size * labelOffsetFactor, 0), spriteLabelColor, labelFontSizeOverride, labelScaleFactor, true, isDynamicPointLabel);
      point.add(sprite);
      point.userData.spriteLabel = sprite; 
      if(isDynamicPointLabel && sprite) {
          sprite.userData.ownerPointMesh = point; // Link label back to its point mesh
      }
    }
    return point;
}

function createLineMesh_AU(pt1, pt2, color, thickness = 0.02, name = "Line") {
    if (!THREE_AU) return null;
    const direction = new THREE_AU.Vector3().subVectors(pt2, pt1);
    const length = direction.length();
    if (length < 0.001) return null;

    const lineGeometry = new THREE_AU.CylinderGeometry(thickness, thickness, length, 8);
    // Use a more robust material for custom edges if needed, or make color configurable
    const lineMaterial = new THREE_AU.MeshStandardMaterial({ 
        color: color, 
        emissive: color, 
        emissiveIntensity: 0.2,
        metalness: 0.1,
        roughness: 0.7
    });
    const lineMesh = new THREE_AU.Mesh(lineGeometry, lineMaterial);
    lineMesh.name = name;

    lineMesh.position.copy(pt1).add(direction.clone().multiplyScalar(0.5));
    lineMesh.quaternion.setFromUnitVectors(new THREE_AU.Vector3(0, 1, 0), direction.normalize());
    lineMesh.userData.isCustomEdge = (name === "CustomEdge"); // Mark custom edges
    return lineMesh;
}

function createDashedLineMesh_AU(pt1, pt2, color, dashSize = 0.1, gapSize = 0.05, name = "DashedLine") {
    if (!THREE_AU) return null;
    const points = [pt1, pt2];
    const geometry = new THREE_AU.BufferGeometry().setFromPoints(points);
    geometry.computeLineDistances(); // Important for dashed lines

    const material = createAxiomObjectMaterial_AU('dashedLine', color);
    material.dashSize = dashSize;
    material.gapSize = gapSize;
    material.needsUpdate = true; // Ensure material updates if dash/gap sizes are dynamic

    const lineMesh = new THREE_AU.LineSegments(geometry, material); // Use LineSegments for LineDashedMaterial
    lineMesh.name = name;
    return lineMesh;
}

function updateDashedLineMesh_AU(lineMesh, pt1, pt2) {
    if (!lineMesh || !pt1 || !pt2 || !THREE_AU) return;
    if (!lineMesh.geometry || !lineMesh.geometry.attributes.position) return;

    const positions = lineMesh.geometry.attributes.position;
    positions.setXYZ(0, pt1.x, pt1.y, pt1.z);
    positions.setXYZ(1, pt2.x, pt2.y, pt2.z);
    positions.needsUpdate = true;
    lineMesh.geometry.computeLineDistances(); // Recompute for new length
    lineMesh.geometry.computeBoundingSphere();
}


function updateLineMesh_AU(lineMesh, pt1, pt2) {
    if (!lineMesh || !pt1 || !pt2 || !THREE_AU) return;
    const direction = new THREE_AU.Vector3().subVectors(pt2, pt1);
    const length = direction.length();

    if (length < 0.001) {
        lineMesh.visible = false;
        return;
    }
    lineMesh.visible = true;

    if (lineMesh.geometry) lineMesh.geometry.dispose();
    
    // Ensure consistent parameters when recreating geometry
    const oldParams = lineMesh.geometry.parameters;
    lineMesh.geometry = new THREE_AU.CylinderGeometry(
        oldParams.radiusTop, 
        oldParams.radiusBottom, 
        length, 
        oldParams.radialSegments
    );


    lineMesh.position.copy(pt1).add(direction.clone().multiplyScalar(0.5));
    lineMesh.quaternion.setFromUnitVectors(new THREE_AU.Vector3(0, 1, 0), direction.normalize());
}


function createTextSprite_AU(text, position, color = "#FFFFFF", fontSizeOverride = null, scaleFactor = 0.005, isAttached = false, isDynamicPointLabel = false) {
    if (!THREE_AU) return null;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    const cssFontSizePx = getCSSVariableValue_AU('--label-font-size', '20px');
    const fontSize = fontSizeOverride !== null ? fontSizeOverride : parseFloat(cssFontSizePx);

    const font = `Bold ${fontSize}px Arial`;
    context.font = font;
    const textMetrics = context.measureText(text);

    canvas.width = THREE_AU.MathUtils.ceilPowerOfTwo(textMetrics.width + 10);
    canvas.height = THREE_AU.MathUtils.ceilPowerOfTwo(fontSize + 10);

    context.font = font; 
    context.fillStyle = color.startsWith('rgba') ? color : new THREE_AU.Color(color).getStyle();
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE_AU.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const spriteMaterial = new THREE_AU.SpriteMaterial({
        map: texture,
        depthTest: !isAttached,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: !isAttached 
    });
    const sprite = new THREE_AU.Sprite(spriteMaterial);

    sprite.scale.set(scaleFactor * canvas.width, scaleFactor * canvas.height, 1.0);
    if (!isAttached) {
      sprite.position.copy(position);
    } else {
      sprite.position.copy(position); 
    }
    sprite.userData.labelText = text; 
    sprite.userData.labelColor = color;
    sprite.userData.baseScaleFactor = scaleFactor; 
    sprite.userData.isDynamicPointLabel = isDynamicPointLabel; // Mark if it's for a dynamic point
    return sprite;
}

function updateTextSpriteSize_AU(sprite) {
    if (!sprite || !sprite.userData.labelText || !THREE_AU) return;

    const text = sprite.userData.labelText;
    const color = sprite.userData.labelColor || "#FFFFFF";
    const baseScaleFactor = sprite.userData.baseScaleFactor || 0.005;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const cssFontSizePx = getCSSVariableValue_AU('--label-font-size', '20px');
    const fontSize = parseFloat(cssFontSizePx);
    
    const font = `Bold ${fontSize}px Arial`;
    context.font = font;
    const textMetrics = context.measureText(text);

    canvas.width = THREE_AU.MathUtils.ceilPowerOfTwo(textMetrics.width + 10);
    canvas.height = THREE_AU.MathUtils.ceilPowerOfTwo(fontSize + 10);

    context.font = font; 
    context.fillStyle = color.startsWith('rgba') ? color : new THREE_AU.Color(color).getStyle();
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    if (sprite.material.map) sprite.material.map.dispose();
    
    const newTexture = new THREE_AU.CanvasTexture(canvas);
    newTexture.needsUpdate = true;
    
    sprite.material.map = newTexture;
    sprite.material.needsUpdate = true;
    
    sprite.scale.set(baseScaleFactor * canvas.width, baseScaleFactor * canvas.height, 1.0);
}


function animateAxiomObject_AU(target, delay = 0, duration = 700, finalScale = 1) {
    if (!target || !ANIME_AU) return Promise.resolve();
    target.scale.set(0.01, 0.01, 0.01);
    let finalOpacity = target.userData.finalOpacity !== undefined ? target.userData.finalOpacity : (target.isSprite ? 0.9 : (target.material && target.material.transparent ? target.material.opacity : 1));
    if(target.material && target.material.hasOwnProperty('opacity')) target.material.opacity = 0;


    const animations = [
        ANIME_AU({ targets: target.scale, x: finalScale, y: finalScale, z: finalScale, duration: duration, delay: delay, easing: 'easeOutElastic(1, .7)'}).finished
    ];
    if(target.material && target.material.hasOwnProperty('opacity')) {
        animations.push(
             ANIME_AU({targets: target.material, opacity: finalOpacity, duration: duration * 0.8, delay: delay + duration * 0.2, easing: 'easeOutQuad'}).finished
        );
    }
    return Promise.all(animations);
}

function clearDemoGroup_AU() {
    if (!demoGroup_AU || !ANIME_AU) return;
    if (demoGroup_AU.children.length > 0) {
        ANIME_AU.remove(demoGroup_AU.children.map(c => [c.scale, c.position, c.material, c.rotation]).flat().filter(Boolean));

        allDemoElementStores_AU.forEach(demoElSet => {
            const keys = Object.keys(demoElSet);
            keys.forEach(key => {
                const el = demoElSet[key];
                 if(el && el.isMesh) {
                    if(el.geometry) el.geometry.dispose();
                    if(el.material) {
                        if(Array.isArray(el.material)) el.material.forEach(m=>m.dispose());
                        else el.material.dispose();
                    }
                    if (el.userData.spriteLabel) {
                        if(el.userData.spriteLabel.material.map) el.userData.spriteLabel.material.map.dispose();
                        el.userData.spriteLabel.material.dispose();
                    }
                } else if (el && el.isSprite) {
                    if(el.material.map) el.material.map.dispose();
                    el.material.dispose();
                } else if (el && el.isLine) { // Includes LineSegments
                     if(el.geometry) el.geometry.dispose();
                     if(el.material) el.material.dispose();
                }
                demoElSet[key] = null; 
            });
        });
        demoGroup_AU.clear();
    }
    demoGroup_AU.visible = false;
}


// --- Draggable Logic ---
function onDragStart_AU(event) {
    if (event.button !== 0 || !demoGroup_AU || !demoGroup_AU.visible || !renderer_AU || !camera_AU || !raycasterDraggable_AU) return;

    const rect = renderer_AU.domElement.getBoundingClientRect();
    mouseDraggable_AU.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseDraggable_AU.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycasterDraggable_AU.setFromCamera(mouseDraggable_AU, camera_AU);

    let relevantDraggableObjects = [];
    allDemoElementStores_AU.forEach(set => {
        Object.values(set).forEach(obj => {
            if (obj && obj.isMesh && obj.userData.isDraggable) {
                relevantDraggableObjects.push(obj);
            }
        });
    });

    const intersects = raycasterDraggable_AU.intersectObjects(relevantDraggableObjects, false);

    if (intersects.length > 0) {
        let intersectedObject = intersects[0].object;
        while (intersectedObject && !intersectedObject.userData.isDraggable) {
             if (!intersectedObject.parent || intersectedObject.parent === demoGroup_AU || typeof scene !== 'undefined' && intersectedObject.parent === scene) { 
                intersectedObject = null; break;
            }
            intersectedObject = intersectedObject.parent;
        }

        if (intersectedObject && intersectedObject.userData.isDraggable) {
            draggedObject_AU = intersectedObject;
            if(controls_AU) controls_AU.enabled = false;
            if(container_AU) container_AU.classList.add('dragging');

            let fixedYValue = draggedObject_AU.userData.fixedYValue; // Check direct fixedYValue first

            // Check across different demo element stores for fixedY constraints if not directly set
            if (fixedYValue === undefined) {
                if (typeof axiom3Elements_AC !== 'undefined' && draggedObject_AU.userData.axiom === 3 && axiom3Elements_AC.fixedY !== undefined) {
                    fixedYValue = axiom3Elements_AC.fixedY;
                } else if (typeof linePlaneIncludedElements_RP !== 'undefined' && draggedObject_AU.userData.demo === 'linePlaneIncluded' && linePlaneIncludedElements_RP.planeY !== undefined) {
                    fixedYValue = linePlaneIncludedElements_RP.planeY;
                } else if (typeof linesIntersectingElements_RP !== 'undefined' && draggedObject_AU.userData.demo === 'linesCoplanarIntersecting' && linesIntersectingElements_RP.planeY !== undefined) {
                    fixedYValue = linesIntersectingElements_RP.planeY;
                } else if (typeof linesStrictlyParallelElements_RP !== 'undefined' && draggedObject_AU.userData.demo === 'linesCoplanarStrictlyParallel' && linesStrictlyParallelElements_RP.planeY !== undefined) {
                    fixedYValue = linesStrictlyParallelElements_RP.planeY;
                } else if (typeof linesCoincidentElements_RP !== 'undefined' && draggedObject_AU.userData.demo === 'linesCoplanarCoincident' && linesCoincidentElements_RP.planeY !== undefined) {
                    fixedYValue = linesCoincidentElements_RP.planeY;
                } else if (typeof linePlaneStrictlyParallelElements_RP !== 'undefined' && draggedObject_AU.userData.demo === 'linePlaneStrictlyParallel' && linePlaneStrictlyParallelElements_RP.lineY_D !== undefined) {
                    fixedYValue = linePlaneStrictlyParallelElements_RP.lineY_D;
                }
            }


            if (draggedObject_AU.userData.dragConstraint === 'planeY0' ||
                draggedObject_AU.userData.dragConstraint === 'planeY0_XAxisOnly' ||
                (draggedObject_AU.userData.dragConstraint === 'fixedY' && fixedYValue !== undefined)) { // Use fixedYValue for 'fixedY' constraint
                dragPlaneGlobal_AU.setFromNormalAndCoplanarPoint(new THREE_AU.Vector3(0, 1, 0), new THREE_AU.Vector3(0, fixedYValue !== undefined ? fixedYValue : 0, 0));
            } else if (draggedObject_AU.userData.dragConstraint === 'yAxisOnly') {
                const cameraDirection = new THREE_AU.Vector3();
                camera_AU.getWorldDirection(cameraDirection);
                const planeNormal = new THREE_AU.Vector3(cameraDirection.x, 0, cameraDirection.z).normalize();
                if (planeNormal.lengthSq() === 0) planeNormal.set(1,0,0); 
                dragPlaneGlobal_AU.setFromNormalAndCoplanarPoint(planeNormal, draggedObject_AU.position);
            } else if (draggedObject_AU.userData.dragConstraint === 'circleXY') {
                dragPlaneGlobal_AU.setFromNormalAndCoplanarPoint(new THREE_AU.Vector3(0, 0, 1), draggedObject_AU.position);
            } else {
                camera_AU.getWorldDirection(dragPlaneGlobal_AU.normal).negate();
                dragPlaneGlobal_AU.setFromNormalAndCoplanarPoint(dragPlaneGlobal_AU.normal, draggedObject_AU.position);
            }


            if (raycasterDraggable_AU.ray.intersectPlane(dragPlaneGlobal_AU, intersectionGlobal_AU)) {
                 offsetGlobal_AU.copy(intersectionGlobal_AU).sub(draggedObject_AU.position);
            } else {
                offsetGlobal_AU.set(0,0,0);
            }
            return;
        }
    }
}

function onDragMove_AU(event) {
    if (draggedObject_AU && renderer_AU && camera_AU && raycasterDraggable_AU && intersectionGlobal_AU && offsetGlobal_AU) {
        const rect = renderer_AU.domElement.getBoundingClientRect();
        mouseDraggable_AU.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseDraggable_AU.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycasterDraggable_AU.setFromCamera(mouseDraggable_AU, camera_AU);

        let targetPosition = new THREE_AU.Vector3();
        if (raycasterDraggable_AU.ray.intersectPlane(dragPlaneGlobal_AU, intersectionGlobal_AU)) {
            targetPosition.copy(intersectionGlobal_AU).sub(offsetGlobal_AU);

            let fixedYValue = draggedObject_AU.userData.fixedYValue; // Check direct fixedYValue first
            // Check across different demo element stores for fixedY constraints if not directly set
            if (fixedYValue === undefined) {
                 if (typeof axiom3Elements_AC !== 'undefined' && draggedObject_AU.userData.axiom === 3 && axiom3Elements_AC.fixedY !== undefined) {
                    fixedYValue = axiom3Elements_AC.fixedY;
                } else if (typeof linePlaneIncludedElements_RP !== 'undefined' && draggedObject_AU.userData.demo === 'linePlaneIncluded' && linePlaneIncludedElements_RP.planeY !== undefined) {
                    fixedYValue = linePlaneIncludedElements_RP.planeY;
                } else if (typeof linesIntersectingElements_RP !== 'undefined' && draggedObject_AU.userData.demo === 'linesCoplanarIntersecting' && linesIntersectingElements_RP.planeY !== undefined) {
                    fixedYValue = linesIntersectingElements_RP.planeY;
                } else if (typeof linesStrictlyParallelElements_RP !== 'undefined' && draggedObject_AU.userData.demo === 'linesCoplanarStrictlyParallel' && linesStrictlyParallelElements_RP.planeY !== undefined) {
                    fixedYValue = linesStrictlyParallelElements_RP.planeY;
                } else if (typeof linesCoincidentElements_RP !== 'undefined' && draggedObject_AU.userData.demo === 'linesCoplanarCoincident' && linesCoincidentElements_RP.planeY !== undefined) {
                    fixedYValue = linesCoincidentElements_RP.planeY;
                } else if (typeof linePlaneStrictlyParallelElements_RP !== 'undefined' && draggedObject_AU.userData.demo === 'linePlaneStrictlyParallel' && linePlaneStrictlyParallelElements_RP.lineY_D !== undefined) {
                    fixedYValue = linePlaneStrictlyParallelElements_RP.lineY_D;
                }
            }


            if (draggedObject_AU.userData.dragConstraint === 'fixedY' && fixedYValue !== undefined) {
                 targetPosition.y = fixedYValue;
            } else if (draggedObject_AU.userData.dragConstraint === 'planeY0') {
                targetPosition.y = 0;
            } else if (draggedObject_AU.userData.dragConstraint === 'planeY0_XAxisOnly') {
                targetPosition.y = 0;
                targetPosition.z = draggedObject_AU.position.z; 
            } else if (draggedObject_AU.userData.dragConstraint === 'yAxisOnly') {
                targetPosition.x = draggedObject_AU.position.x; 
                targetPosition.z = draggedObject_AU.position.z; 
            } else if (draggedObject_AU.userData.dragConstraint === 'circleXY') {
                 const radius = draggedObject_AU.userData.dragConstraintRadius || 1;
                 targetPosition.z = draggedObject_AU.position.z; 
                 targetPosition.normalize().multiplyScalar(radius); 
            }
            draggedObject_AU.position.copy(targetPosition);
        }

        if (draggedObject_AU.userData.updateFunction) draggedObject_AU.userData.updateFunction();
    }
}
function onDragEnd_AU(event) {
    if (draggedObject_AU) {
        draggedObject_AU = null;
        if(controls_AU) controls_AU.enabled = true;
        if(container_AU) container_AU.classList.remove('dragging');
    }
}