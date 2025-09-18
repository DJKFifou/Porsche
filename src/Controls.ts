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

// Improve tree-shaking by only importing the necessary THREE subset instead
// of the whole namespace
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

    // Désactive le zoom au scroll
    this.mouseButtons.wheel = CameraControls.ACTION.NONE;
    this.touches.two = CameraControls.ACTION.NONE;

    // Configure les limites de la caméra avec plus de liberté
    this.minDistance = 8;
    this.maxDistance = 15;
    this.minPolarAngle = Math.PI / 4; // Permet de voir du dessus
    this.maxPolarAngle = (3 * Math.PI) / 4; // Permet de voir du dessous

    // Position initiale de la caméra
    this.setPosition(10, 2, 10);
    this.setTarget(0, 0, 0); // Regarde toujours le centre

    // Désactive les contrôles par défaut
    this.enabled = false;
  }

  public start(): void {
    this.disconnect();
    this.connect(this.element);
  }

  public stop(): void {
    this.disconnect();
  }

  private isInLastSection(): boolean {
    const lastSection = document.getElementById("last-section");
    if (!lastSection) return false;

    const rect = lastSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const visibleThreshold = windowHeight * 0.5; // La section doit être visible à 50%

    return rect.top < visibleThreshold && rect.bottom > visibleThreshold;
  }

  public update = (): boolean => {
    if (this.isInLastSection()) {
      this.enabled = true;

      // Autoriser seulement la rotation sur l’axe X
      const currentPolar = this.polarAngle;
      this.minPolarAngle = currentPolar;
      this.maxPolarAngle = currentPolar;

      // (optionnel) si tu veux aussi restreindre l’angle vertical,
      // ajuste minPolarAngle / maxPolarAngle selon ton besoin
    } else {
      this.enabled = false;

      // Rétablir la liberté hors de la dernière section
      this.minPolarAngle = -Infinity;
      this.maxPolarAngle = Infinity;
    }

    return super.update(this.clock.delta / 1000);
  };
}
