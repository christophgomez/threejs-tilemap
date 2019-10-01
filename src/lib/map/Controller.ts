import { ViewController, CameraControlSettings } from "../utils/Interfaces"
import { OrbitControls } from "../lib/OrbitControls"
import { MOUSE, Vector3 } from "three"
import TM from '../tm';
import View from "./View";
import Tile from "../grids/Tile";
import Cell from "../grids/Cell";

class Animation {
  /**
   * Progress of the animation between 0.0 (start) and 1.0 (end).
   */
  private progress = 0.0;


  /**
   * Simple animation helper
   * @param durationMs duration of the animation in milliseconds
   * @param update animation function which will receive values between 0.0 and 1.0 over the duration of the animation
   * @param easingFunction function that determines the progression of the animation over time
   */
  constructor(private durationMs: number, private update: (progress: number) => void, private easingFunction = Animation.easeInOutQuad) {
  }

  /**
   * Advances the animation by the given amount of time in seconds.
   * Returns true if the animation is finished.
   */
  animate(dtS: number): boolean {
    this.progress = this.progress + dtS * 1000 / this.durationMs
    this.update(this.easingFunction(this.progress))
    return this.progress >= 1.0
  }

  static easeInOutQuad = (t: number): number => {
    return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  }

  static easeLinear = (t: number): number => t
}

export default class Controller implements ViewController {

  private _controls: OrbitControls;
  private animations: Animation[] = [];

  constructor(private _view: View, config?: CameraControlSettings) {
    if (!_view) {
      throw new Error('Controller missing View reference');
    }
    if (config) {
      this.initControls(config);
    }
  }

  dispose(): void {
    this._controls.dispose();
  }

  update(): void {
    this._controls.update();
  }

  panInDirection(left: boolean, right: boolean, top: boolean, bottom: boolean): void {
    if (left && top) {
      this._controls.pan(15, 15);
    } else if (left && bottom) {
      this._controls.pan(15, -15);
    } else if (right && top) {
      this._controls.pan(-15, 15);
    } else if (right && bottom) {
      this._controls.pan(-15, -15);
    } else if (right) {
      this._controls.pan(-15, 0);
    } else if (left) {
      this._controls.pan(15, 0);
    } else if (top) {
      this._controls.pan(0, 15);
    } else {
      this._controls.pan(0, -15);
    }
    this._controls.update();
  }
  private addAnimation(animation: Animation): void {
    this.animations.push(animation)
  }

  panCameraTo(tile: Tile | Cell | Vector3, durationMs: number): void {
    if (tile instanceof Vector3) {

    } else {
      const from = this._controls.target.clone();
      const to = (tile as Tile).position.clone();

      this.addAnimation(new Animation(durationMs, (a): void => {
        this._view.focusOn(tile);
        this._controls.target = from.lerp(to, a);
        this._controls.update();

        //this._view.camera.position.copy(from.clone().lerp(to, a));
      }));
    }
  }

  toggleControls(): void {
    if (this._view.controlled) {
      this._view.controlled = false;
      this._controls.dispose();
      delete this._controls;
    } else {
      this.initControls(this._view.settings.cameraControlSettings);
    }
  }

  updateControls(settings: CameraControlSettings): void {
    if (this._view.controlled) {
      this._view.settings.cameraControlSettings = TM.Tools.merge(this._view.settings.cameraControlSettings, settings) as CameraControlSettings;
      this._controls.minDistance = settings.minDistance || this._controls.minDistance;
      this._controls.maxDistance = settings.maxDistance || this._controls.maxDistance;
      this._controls.zoomSpeed = settings.zoomSpeed || this._controls.zoomSpeed;
      settings.hotEdges !== undefined ? this._view.hotEdges = settings.hotEdges : this._view.hotEdges = this._view.settings.cameraControlSettings.hotEdges;
      if (settings.autoRotate !== undefined) {
        this.toggleHorizontalRotation(settings.autoRotate);
        this._controls.autoRotate = settings.autoRotate;
      } else {
        this._controls.autoRotate = this._view.settings.cameraControlSettings.autoRotate;
      }
      settings.enableDamping !== undefined ? this._controls.enableDamping = settings.enableDamping : this._controls.enableDamping = this._view.settings.cameraControlSettings.enableDamping;
      this._controls.dampingFactor = settings.dampingFactor || this._view.settings.cameraControlSettings.dampingFactor;
      settings.screenSpacePanning !== undefined ? this._controls.screenSpacePanning = settings.screenSpacePanning : this._controls.screenSpacePanning = this._view.settings.cameraControlSettings.screenSpacePanning;
      if (settings.minPolarAngle)
        this._controls.minPolarAngle = settings.minPolarAngle;
      if (settings.maxPolarAngle)
        this._controls.maxPolarAngle = settings.maxPolarAngle
      if (settings.maxAzimuthAngle)
        this._controls.maxAzimuthAngle = settings.maxAzimuthAngle;
      if (settings.minAzimuthAngle)
        this._controls.minAzimuthAngle = settings.minAzimuthAngle;
    }
  }

  toggleHorizontalRotation(bool: boolean): void {
    if (bool) {
      this._controls.dispose();
      this._controls = new OrbitControls(this._view.camera, this._view.renderer.domElement);
      this._controls.minDistance = this._view.settings.cameraControlSettings.minDistance;
      this._controls.maxDistance = this._view.settings.cameraControlSettings.maxDistance;
      this._controls.zoomSpeed = this._view.settings.cameraControlSettings.zoomSpeed;
      this._view.hotEdges = this._view.settings.cameraControlSettings.hotEdges;
      this._controls.autoRotate = this._view.settings.cameraControlSettings.autoRotate;
      this._controls.enableDamping = this._view.settings.cameraControlSettings.enableDamping;
      this._controls.screenSpacePanning = this._view.settings.cameraControlSettings.screenSpacePanning;
      this._controls.minPolarAngle = this._view.settings.cameraControlSettings.minPolarAngle;
      this._controls.maxPolarAngle = this._view.settings.cameraControlSettings.maxPolarAngle;
      this._controls.mouseButtons = { LEFT: MOUSE.RIGHT, MIDDLE: MOUSE.MIDDLE, RIGHT: MOUSE.LEFT };
    } else {
      this._controls.dispose();
      this._controls = new OrbitControls(this._view.camera, this._view.renderer.domElement);
      this._controls.minDistance = this._view.settings.cameraControlSettings.minDistance;
      this._controls.maxDistance = this._view.settings.cameraControlSettings.maxDistance;
      this._controls.zoomSpeed = this._view.settings.cameraControlSettings.zoomSpeed;
      this._view.hotEdges = this._view.settings.cameraControlSettings.hotEdges;
      this._controls.autoRotate = this._view.settings.cameraControlSettings.autoRotate;
      this._controls.enableDamping = this._view.settings.cameraControlSettings.enableDamping;
      this._controls.screenSpacePanning = this._view.settings.cameraControlSettings.screenSpacePanning;
      this._controls.minPolarAngle = this._view.settings.cameraControlSettings.minPolarAngle;
      this._controls.maxPolarAngle = this._view.settings.cameraControlSettings.maxPolarAngle;
      if (this._view.settings.cameraControlSettings.maxAzimuthAngle)
        this._controls.maxAzimuthAngle = this._view.settings.cameraControlSettings.maxAzimuthAngle;
      if (this._view.settings.cameraControlSettings.minAzimuthAngle)
        this._controls.minAzimuthAngle = this._view.settings.cameraControlSettings.minAzimuthAngle;
      this._controls.mouseButtons = { LEFT: MOUSE.RIGHT, MIDDLE: MOUSE.MIDDLE, RIGHT: MOUSE.LEFT };
    }
  }

  initControls(config: CameraControlSettings): void {
    this._view.controlled = config.controlled;
    this._controls = new OrbitControls(this._view.camera, this._view.renderer.domElement);
    this._controls.minDistance = config.minDistance;
    this._controls.maxDistance = config.maxDistance;
    this._controls.zoomSpeed = config.zoomSpeed;
    this._view.hotEdges = config.hotEdges;
    this._controls.autoRotate = config.autoRotate;
    this._controls.enableDamping = config.enableDamping;
    this._controls.dampingFactor = config.dampingFactor;
    this._controls.screenSpacePanning = config.screenSpacePanning;
    this._controls.minPolarAngle = config.minPolarAngle;
    this._controls.maxPolarAngle = config.maxPolarAngle;
    if (!config.horizontalRotation) {
      if (config.maxAzimuthAngle)
        this._controls.maxAzimuthAngle = config.maxAzimuthAngle;
      if (config.minAzimuthAngle)
        this._controls.minAzimuthAngle = config.minAzimuthAngle;
    }
    this._controls.mouseButtons = { LEFT: MOUSE.RIGHT, MIDDLE: MOUSE.MIDDLE, RIGHT: MOUSE.LEFT };

    const onAnimate = (dtS: number): void => {
      const animations = this.animations

      for (let i = 0; i < animations.length; i++) {
        // advance the animation
        const animation = animations[i]
        const finished = animation.animate(dtS)

        // if the animation is finished (returned true) remove it
        if (finished) {
          // remove the animation
          animations[i] = animations[animations.length - 1]
          animations[animations.length - 1] = animation
          animations.pop()
        }
      }
    }
    this._view.setOnAnimateCallback(onAnimate.bind(this));
  }

}