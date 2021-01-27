import { AbstractMesh } from "../Meshes/abstractMesh";
import { Scene } from "../scene";

export class WebXRNearInteractor {
    // class runs before render when it has a scene
    // gets scene from hands when they register touch sources
    // external classes call in to activate themselves as targets
    // the render runs as long as there are targets, but early outs with no sources
    //    - this is since hands can come/go rapidly when on tracking border

    // has methods to add/remove input source, input target, can return nearest target for source (+ distance to it)
    // scene used doesn't matter? register on the scene (and save it) used for hands when they first appear though

    private _touchInputs = new Set<AbstractMesh>();
    private _touchTargets = new Set<{mesh: AbstractMesh,
        collisionCallback: (touchInputMesh: AbstractMesh) => void,
        collisionExitCallback: (touchInputMesh: AbstractMesh) => void}>();

    private _scene: Scene;

    constructor() {}

    public registerTouchInputMesh(mesh: AbstractMesh) {
        this._touchInputs.add(mesh);

        if (!this._scene) {
            this._scene = mesh.getScene();
            this._scene.registerBeforeRender(this._renderLoopCollisionCheck);
        }
    }

    public unregisterTouchInputMesh(mesh: AbstractMesh) {
        this._touchInputs.delete(mesh);

        if (this._touchInputs.size == 0) {
            this._scene.unregisterBeforeRender(this._renderLoopCollisionCheck);
        }
    }

    public registerTouchTarget(mesh: AbstractMesh,
                               collisionCallback: (touchInputMesh: AbstractMesh) => void,
                               collisionExitCallback: (touchInputMesh: AbstractMesh) => void) {
        this._touchTargets.add({mesh: mesh, collisionCallback: collisionCallback, collisionExitCallback: collisionExitCallback});
    }

    public unregisterTouchTarget(mesh: AbstractMesh) {
        this._touchTargets.forEach((input) => {
            if (input.mesh === mesh) {
                input.collisionExitCallback(mesh);//wrong mesh
                this._touchTargets.delete(input);
            }
        });
    }

    private _renderLoopCollisionCheck() {
        this._touchTargets.forEach((target) => {
            this._touchInputs.forEach((input) => {
            //    if (interactionListener.mesh.intersectsMesh(collisionMesh)) {
                    target.collisionCallback(input);
            //    }
            });
        });
    }
}