import {
  Scene,
  Mesh,
  PointLight,
  PerspectiveCamera,
  Object3D,
  Box3,
  Vector3,
  AmbientLight,
  DirectionalLight,
  MeshStandardMaterial,
} from "three";

import type { Viewport, Clock, Lifecycle } from "~/core";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export interface MainSceneParamaters {
  clock: Clock;
  camera: PerspectiveCamera;
  viewport: Viewport;
}

export class ExampleScene extends Scene implements Lifecycle {
  public clock: Clock;
  public camera: PerspectiveCamera;
  public viewport: Viewport;
  public model: Object3D | null = null;
  public engineModel: Object3D | null = null;
  public light1: PointLight;
  public light2: PointLight;
  public light3: PointLight;
  public ambient: AmbientLight;
  public sun: DirectionalLight;

  // private scrollProgress: number = 0;
  // private initialY: number = 0;

  public constructor({ clock, camera, viewport }: MainSceneParamaters) {
    super();

    this.clock = clock;
    this.camera = camera;
    this.viewport = viewport;

    // window.addEventListener("scroll", () => {
    //   const maxScroll =
    //     document.documentElement.scrollHeight - window.innerHeight;
    //   this.scrollProgress = window.scrollY / maxScroll;
    // });

    this.ambient = new AmbientLight(0xffffff, 3);

    this.sun = new DirectionalLight(0xffffff, 5);
    this.sun.position.set(10, 20, 10);

    this.light1 = new PointLight(0xffffff, 2, 100);
    this.light1.position.set(2, 0, -2);

    this.light2 = new PointLight(0xffffff, 2, 100);
    this.light2.position.set(-2, 4, 2);

    this.light3 = new PointLight(0xffffff, 2, 100);
    this.light3.position.set(-10, 5, -10);

    this.add(this.light1, this.light2, this.light3, this.ambient, this.sun);
  }

  private loadModel(loader: GLTFLoader, path: string): Promise<Object3D> {
    return new Promise((resolve, reject) => {
      loader.load(
        path,
        (gltf) => {
          console.log(`Modèle ${path} chargé avec succès`);
          resolve(gltf.scene);
        },
        (xhr) => {
          console.log(`${path}: ${(xhr.loaded / xhr.total) * 100}% chargé`);
        },
        (error) => {
          console.error(`Erreur de chargement de ${path}:`, error);
          reject(error);
        }
      );
    });
  }

  public async load(): Promise<void> {
    const loader = new GLTFLoader();

    try {
      const [carModel, engineModel] = await Promise.all([
        this.loadModel(loader, "/models/GT2-RS/scene.gltf"),
        this.loadModel(loader, "/models/Engine/scene.gltf"),
      ]);

      this.model = carModel;
      this.model.position.set(-20, -1, 0);
      this.model.rotation.set(0, 1.5, 0);
      this.model.scale.set(120, 120, 120);
      this.add(this.model);

      this.engineModel = engineModel;
      this.engineModel.position.set(-50, -1, 0);
      this.engineModel.rotation.set(0, 1.5, 0);
      this.engineModel.scale.set(0.3, 0.3, 0.3);
      this.add(this.engineModel);

      // this.initialY = this.model.position.y;

      const box = new Box3().setFromObject(this.model);

      console.log(
        "BoundingBox:",
        box.min,
        box.max,
        "Size:",
        box.getSize(new Vector3())
      );

      this.camera.lookAt(0, 0, 0);

      const { CarAnimation } = await import("../animations/CarAnimation");
      new CarAnimation(this);
    } catch (error) {
      console.error("Erreur lors du chargement des modèles:", error);
      throw error;
    }
  }

  public update(): void {
    const theta = Math.atan2(this.camera.position.x, this.camera.position.z);

    this.light1.position.x = Math.cos(theta + this.clock.elapsed * 0.001) * 2;
    this.light1.position.z = Math.sin(theta + this.clock.elapsed * 0.0005) * 2;
    this.light2.position.y = Math.sin(theta + this.clock.elapsed * 0.001) * 4;
    this.light2.position.z = Math.cos(theta + this.clock.elapsed * 0.0005) * 2;

    // if (this.model) {
    // this.model.rotation.y = this.scrollProgress * Math.PI * 2;
    // this.model.position.y = this.initialY + this.scrollProgress * 5;
    // }
  }

  public resize(): void {
    this.camera.aspect = this.viewport.ratio;
    this.camera.updateProjectionMatrix();
  }

  public dispose(): void {
    if (this.model) {
      this.model.traverse((child) => {
        if ((child as Mesh).geometry) {
          (child as Mesh).geometry.dispose();
        }
        const material = (child as Mesh).material;
        if (Array.isArray(material)) {
          material.forEach(
            (m) => m && typeof m.dispose === "function" && m.dispose()
          );
        } else if (material && typeof material.dispose === "function") {
          material.dispose();
        }
      });
    }
  }

  public setCarColor(color: number): void {
    if (this.model) {
      this.model.traverse((child) => {
        if ((child as Mesh).material) {
          const material = (child as Mesh).material;
          if (Array.isArray(material)) {
            material.forEach((m) => {
              if (
                m.name === "EXT_Carpaint_Inst" &&
                m instanceof MeshStandardMaterial
              ) {
                m.color.setHex(color);
              }
            });
          } else if (
            material.name === "EXT_Carpaint_Inst" &&
            material instanceof MeshStandardMaterial
          ) {
            material.color.setHex(color);
          }
        }
      });
    }
  }
}
