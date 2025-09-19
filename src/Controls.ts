import {
  Vector2,
  Vector3,
  Vector4,
  Spherical,
  Box3,
  Sphere,
  Quaternion,
  Matrix4,
  Raycaster,
  type PerspectiveCamera,
  type OrthographicCamera,
} from "three";

import CameraControls from "camera-controls";
import type { Clock, Lifecycle } from "~/core";

CameraControls.install({
  THREE: {
    Vector2,
    Vector3,
    Vector4,
    Quaternion,
    Matrix4,
    Spherical,
    Box3,
    Sphere,
    Raycaster,
  },
});

export interface ControlsParameters {
  camera: PerspectiveCamera | OrthographicCamera;
  element: HTMLElement;
  clock: Clock;
}

export class Controls extends CameraControls implements Lifecycle {
  public clock: Clock;
  public element: HTMLElement;

  public constructor({ camera, element, clock }: ControlsParameters) {
    super(camera);

    this.clock = clock;
    this.element = element;

    this.mouseButtons.wheel = CameraControls.ACTION.NONE;
    this.touches.two = CameraControls.ACTION.NONE;

    this.minDistance = 8;
    this.maxDistance = 15;
    this.minPolarAngle = Math.PI / 4;
    this.maxPolarAngle = (3 * Math.PI) / 4;

    this.setPosition(10, 2, 10);
    this.setTarget(0, 0, 0);

    this.enabled = false;
  }

  public start(): void {
    this.disconnect();
    this.connect(this.element);
  }

  public stop(): void {
    this.disconnect();
  }

  // private isInLastSection(): boolean {
  //   const lastSection = document.getElementById("last-section");
  //   if (!lastSection) return false;

  //   const rect = lastSection.getBoundingClientRect();
  //   const windowHeight = window.innerHeight;
  //   const visibleThreshold = windowHeight * 0.5;

  //   return rect.top < visibleThreshold && rect.bottom > visibleThreshold;
  // }

  public update = (): boolean => {
    // if (this.isInLastSection()) {
    //   this.enabled = true;

    //   const currentPolar = this.polarAngle;
    //   this.minPolarAngle = currentPolar;
    //   this.maxPolarAngle = currentPolar;

    // } else {
    this.enabled = false;

    this.minPolarAngle = -Infinity;
    this.maxPolarAngle = Infinity;
    // }

    return super.update(this.clock.delta / 1000);
  };
}
