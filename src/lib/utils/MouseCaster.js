import TM from '../tm';
import * as THREE from 'three';
/*
	Translates mouse interactivity into 3D positions, so we can easily pick objects in the scene.

	Like everything else in ThreeJS, ray casting creates a ton of new objects each time it's used. This contributes to frequent garbage collections (causing frame hitches), so if you're limited to low-end hardware like mobile, it would be better to only update it when the user clicks, instead of every frame (so no hover effects, but on mobile those don't work anyway). You'll want to create a version that handles touch anyway.

	group - any Object3D (Scene, Group, Mesh, Sprite, etc) that the mouse will cast against
	camera - the camera to cast from
	[element] - optional element to attach mouse event to

	@author Corey Birnbaum https://github.com/vonWolfehaus/
 */
class MouseCaster {
  constructor(group, camera, element) {
    this.down = false; // left click
    this.rightDown = false;
    // the object that was just clicked on
    this.pickedObject = null;
    // the object currently being 'held'
    this.selectedObject = null;
    // store the results of the last cast
    this.allHits = null;
    // disable the caster easily to temporarily prevent user input
    this.active = true;

    this.shift = false;
    this.ctrl = false;
    this.wheel = 0;

    // you can track exactly where the mouse is in the 3D scene by using the z component
    this.position = new THREE.Vector3();
    this.screenPosition = new THREE.Vector2();
    this.signal = new TM.Signal();
    this.group = group;

    // behind-the-scenes stuff you shouldn't worry about
    this._camera = camera;
    this._raycaster = new THREE.Raycaster();
    this._preventDefault = false;

    this.element = element || document;

    this.element.addEventListener('mousemove', this._onDocumentMouseMove.bind(this), false);
    this.element.addEventListener('mousedown', this._onDocumentMouseDown.bind(this), false);
    this.element.addEventListener('mouseup', this._onDocumentMouseUp.bind(this), false);
    this.element.addEventListener('mousewheel', this._onMouseWheel.bind(this), false);
    this.element.addEventListener('DOMMouseScroll', this._onMouseWheel.bind(this), false); // firefox
    this.element.addEventListener("touchstart", (e) => {
      this._onDocumentMouseDown(e.touches[0]).bind(this)
      e.preventDefault()
    }, false)
    this.element.addEventListener("touchmove", (e) => {
      this._onDocumentMouseMove(e.touches[0]).bind(this)
      e.preventDefault()
    }, false)
    this.element.addEventListener("touchend", (e) => this._onDocumentMouseUp(e.touches[0] || e.changedTouches[0]).bind(this), false)
  }
  dispose(ctx) {
    this.signal.removeAll(ctx);
    this.element.removeEventListener('mousemove', this._onDocumentMouseDown, false);
    this.element.removeEventListener('touchmove', this._onDocumentMouseMove, false);
    this.element.removeEventListener('mousedown', this._onDocumentMouseDown, false);
    this.element.removeEventListener('touchstart', this._onDocumentMouseDown, false);
    this.element.removeEventListener('mouseup', this._onDocumentMouseUp, false);
    this.element.removeEventListener('touchend', this._onDocumentMouseUp, false);
    this.element.removeEventListener('mousewheel', this._onMouseWheel, false);
    this.element.removeEventListener('DOMMouseScroll', this._onMouseWheel, false); // firefox
  }
  update() {
    if (!this.active) {
      return;
    }
    this._raycaster.setFromCamera(this.screenPosition, this._camera);

    let intersects = this._raycaster.intersectObject(this.group, true);
    var hit, obj;

    if (intersects.length > 0) {
      // get the first object under the mouse
      hit = intersects[0];
      obj = hit.object.userData.structure;
      if (this.pickedObject != obj) {
        // the first object changed, meaning there's a different one, or none at all
        if (this.pickedObject) {
          // it's a new object, notify the old object is going away
          this.signal.dispatch('out', this.pickedObject);
        }
        /*else {
          // hit a new object when nothing was there previously
        }*/
        this.pickedObject = obj;
        this.selectedObject = null; // cancel click, otherwise it'll confuse the user

        this.signal.dispatch('over', this.pickedObject);
      }
      this.position.copy(hit.point);
      this.screenPosition.z = hit.distance;
    }
    else {
      // there isn't anything under the mouse
      if (this.pickedObject) {
        // there was though, we just moved out
        this.signal.dispatch('out', this.pickedObject);
      }
      this.pickedObject = null;
      this.selectedObject = null;
    }

    this.allHits = intersects;
  }

  preventDefault() {
    this._preventDefault = true;
  }

  _onDocumentMouseDown(evt) {
    evt = evt || window.event;
    //evt.preventDefault();
    if (this._preventDefault) {
      this._preventDefault = false;
      return false;
    }
    if (this.pickedObject) {
      this.selectedObject = this.pickedObject;
    }
    this.shift = evt.shiftKey;
    this.ctrl = evt.ctrlKey;

    this.down = evt.which === 1;
    this.rightDown = evt.which === 3;

    this.signal.dispatch('down', this.pickedObject);
  }

  _onDocumentMouseUp(evt) {
    evt.preventDefault();
    if (this._preventDefault) {
      this._preventDefault = false;
      return false;
    }
    this.shift = evt.shiftKey;
    this.ctrl = evt.ctrlKey;

    this.signal.dispatch('up', this.pickedObject);
    if (this.selectedObject && this.pickedObject && this.selectedObject.uniqueID === this.pickedObject.uniqueID) {
      this.signal.dispatch('click', this.pickedObject);
    }

    this.down = evt.which === 1 ? false : this.down;
    this.rightDown = evt.which === 3 ? false : this.rightDown;
  }

  _onDocumentMouseMove(evt) {
    evt.preventDefault();
    this.screenPosition.x = (evt.clientX / window.innerWidth) * 2 - 1;
    this.screenPosition.y = -(evt.clientY / window.innerHeight) * 2 + 1;
    this.signal.dispatch('move', evt);
  }

  _onMouseWheel(evt) {
    if (!this.active) {
      return;
    }
    //evt.preventDefault();
    evt.stopPropagation();

    var delta = 0;
    if (evt.wheelDelta !== undefined) { // WebKit / Opera / Explorer 9
      delta = evt.wheelDelta;
    }
    else if (evt.detail !== undefined) { // Firefox
      delta = -evt.detail;
    }
    if (delta > 0) {
      this.wheel++;
    }
    else {
      this.wheel--;
    }
    this.signal.dispatch('wheel', this.wheel);
  }
  mouseToWorld(pos, camera) {
    if (pos) {
      const mv = new THREE.Vector3((pos.x / window.innerWidth) * 2 - 1, -(pos.y / window.innerHeight) * 2 + 1, 0.5)
      const raycaster = this.pickingRay(mv, camera);
      return raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0))
    } else {
      const mv = new THREE.Vector3((this.screenPosition.x / window.innerWidth) * 2 - 1, -(this.screenPosition.y / window.innerHeight) * 2 + 1, 0.5)
      const raycaster = this.pickingRay(mv, camera);
      return raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0))
    }
  }
  pickingRay(vector, camera) {
    // set two vectors with opposing z values
    vector.z = -1.0;
    const end = new THREE.Vector3(vector.x, vector.y, 1.0);

    vector.unproject(camera);
    end.unproject(camera);

    // find direction from vector to end
    end.sub(vector).normalize();
    return new THREE.Raycaster(vector, end);
  }
}

MouseCaster.OVER = 'over';
MouseCaster.OUT = 'out';
MouseCaster.DOWN = 'down';
MouseCaster.UP = 'up';
MouseCaster.CLICK = 'click'; // only fires if the user clicked down and up while on the same object
MouseCaster.WHEEL = 'wheel';
MouseCaster.MOVE = 'move';

export default MouseCaster;