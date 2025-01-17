import { Euler, InstancedMesh, LinearMipMapLinearFilter, Matrix4, Mesh, RepeatWrapping, TextureLoader, Vector2, Vector3, } from "three";
import View from "../../../lib/scene/View";
import { createClayLand, generateDustSystem } from ".";
import Tile from "../../../lib/map/Tile";
import clayTAsset from '../../../Assets/Textures/texture-damaged-clay.jpg';

export default async (containers: Tile[], boundary: Vector2[], view: View) => {

    containers[0].geometry.computeBoundingBox();
    let measure = containers[0].geometry.boundingBox;

    //Patch side length
    var width = (measure.max.x - measure.min.x);
    var height = (measure.max.y - measure.min.y);

    //Number of vertices on ground plane side
    var resolution = 128;
    var loader = new TextureLoader();

    const t = await loader.load(clayTAsset);

    t.wrapS = t.wrapT = RepeatWrapping;
    t.minFilter = LinearMipMapLinearFilter;
    t.anisotropy = view.renderer.capabilities.getMaxAnisotropy();
    const { ground, noise } = createClayLand(width, height, resolution, boundary, containers[0], t);
    // Calculate the base rotation
    const baseRotation = new Euler(0, -Math.PI / 2, 0);
    // Create the instanced mesh
    const instanceCount = containers.length;

    const groundInstances = new InstancedMesh(ground.geometry.clone(), ground.material, instanceCount);

    // Populate the instance positions
    for (let i = 0; i < instanceCount; i++) {
        const x = containers[i].mesh.position.x;
        const y = 0;
        const z = containers[i].mesh.position.z;
        groundInstances.setMatrixAt(i, new Matrix4().setPosition(x, y, z));
    }

    groundInstances.rotation.copy(baseRotation);
    // groundInstances.frustumCulled = false;

    // scene.add(groundInstances);
    view.container.add(groundInstances);
    const flakes = [];
    for (let i = 0; i < instanceCount; i++) {
        const { system, render } = generateDustSystem(width, height, boundary, containers[0]);
        containers[i].mesh.add(system);
        flakes.push({ system, render });
    }

    var time = 0;
    var lastFrame = Date.now();
    var thisFrame;
    var dT;
    const yAxis = new Vector3(0, 1, 0); // Assuming your y-axis is the axis around which you want to rotate
    const yRot = -90 * Math.PI / 180; // Assuming your rotation angle in radians
    // Assuming _yRot is the rotation angle of the tile in radians
    const rotationMatrix = new Matrix4().makeRotationAxis(yAxis, yRot);


    let closestDistance = Number.POSITIVE_INFINITY; // Set to a very large value initially
    let curClosest = -1;
    const maxDistance = view.controller.config.maxDistance;

    view.animationManager.addOnAnimateListener(() => {
        thisFrame = Date.now();
        dT = (thisFrame - lastFrame) / 1000.0; // Convert to seconds
        time += dT;
        lastFrame = thisFrame;

        let cameraPositionInTileSpace = view.camera.position.clone();

        // Apply the rotation transformation to the camera position
        cameraPositionInTileSpace = cameraPositionInTileSpace.applyMatrix4(rotationMatrix.clone().invert());

        for (let i = 0; i < flakes.length; i++) {
            const { system, render } = flakes[i];
            const tilePositionInCameraSpace = containers[i].mesh.position.clone().applyMatrix4(rotationMatrix);

            // The distance calculation in the tile's coordinate space
            const dx = view.camera.position.x - tilePositionInCameraSpace.x;
            const dy = view.camera.position.y - tilePositionInCameraSpace.y;
            const dz = view.camera.position.z - tilePositionInCameraSpace.z;

            // Calculate the squared distance
            let distanceSquared = dx * dx + dy * dy + dz * dz;

            // Apply the exponential scaling factor (adjust the exponent value as needed)
            let scaleFactor = 1.0; // You can adjust this value to control the exaggeration
            let scaledDistanceInTileSpace = Math.pow(distanceSquared, scaleFactor);

            // Take the square root to get the final distance
            let distanceInTileSpace = Math.sqrt(scaledDistanceInTileSpace);

            // Update the closestDistance if the current instance is closer
            if (distanceInTileSpace < closestDistance) {
                closestDistance = distanceInTileSpace;
                curClosest = i;
            }
        }

        // Update the position of each snowflake system
        for (let i = 0; i < flakes.length; i++) {
            const { system, render } = flakes[i];

            const tilePositionInCameraSpace = containers[i].mesh.position.clone().applyMatrix4(rotationMatrix);

            // The distance calculation in the tile's coordinate space
            const dx = view.camera.position.x - tilePositionInCameraSpace.x;
            const dy = view.camera.position.y - tilePositionInCameraSpace.y;
            const dz = view.camera.position.z - tilePositionInCameraSpace.z;

            // Calculate the squared distance
            let distanceSquared = dx * dx + dy * dy + dz * dz;

            // Apply the exponential scaling factor (adjust the exponent value as needed)
            let scaleFactor = i === curClosest ? 1 : 1.125; // You can adjust this value to control the exaggeration
            let scaledDistanceInTileSpace = Math.pow(distanceSquared, scaleFactor);

            // Take the square root to get the final distance
            let distanceInTileSpace = Math.sqrt(scaledDistanceInTileSpace);
            const alpha = 1.0 - Math.min(distanceInTileSpace / maxDistance, 1.0);
            system.material.opacity = 1;
            // system.rotation.y = time / 6 * (i < 4 ? i + 1 : - (i + 1));
            render(time);
        }
    });
}

// window.addEventListener('resize', onWindowResize, false);
// function onWindowResize(){
//   let w = canvas.clientWidth;
//   let h = canvas.clientHeight;
//   if(!isInFullscreen()){
//     renderer.setPixelRatio( window.devicePixelRatio );
//     h = w/1.6;
//   }else{
//     //Reduce resolution at full screen for better performance
//     renderer.setPixelRatio( defaultPixelRatio );
//   }
//   camera.aspect = w / h;
//   renderer.setSize(w, h, false);
//   backgroundMaterial.uniforms.resolution.value = new Vector2(canvas.width, canvas.height);
//   camera.updateProjectionMatrix();
// }