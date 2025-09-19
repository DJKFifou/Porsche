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
  Raycaster,
  Vector2,
} from "three";

import type { Viewport, Clock, Lifecycle } from "~/core";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  applyLightSweepShader,
  SweepMaterial,
} from "../shaders/lightSweepShader";

export interface MainSceneParamaters {
  clock: Clock;
  camera: PerspectiveCamera;
  viewport: Viewport;
}

export class MainScene extends Scene implements Lifecycle {
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

  private raycaster = new Raycaster();
  private mouse = new Vector2();
  private hovered = false;

  private sweepMaterials: SweepMaterial[] = [];

  constructor({ clock, camera, viewport }: MainSceneParamaters) {
    super();

    this.clock = clock;
    this.camera = camera;
    this.viewport = viewport;

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

    window.addEventListener("mousemove", this.onMouseMove);
  }

  private loadModel(loader: GLTFLoader, path: string): Promise<Object3D> {
    return new Promise((resolve, reject) => {
      loader.load(
        path,
        (gltf) => resolve(gltf.scene),
        (xhr) =>
          console.log(`${path}: ${(xhr.loaded / xhr.total) * 100}% chargé`),
        (error) => reject(error)
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
      this.model.position.set(-30, -1, 0);
      this.model.rotation.set(0, 1.5, 0);
      this.model.scale.set(120, 120, 120);
      this.add(this.model);

      this.engineModel = engineModel;
      this.engineModel.position.set(-30, -1, 0);
      this.engineModel.rotation.set(0, 1.5, 0);
      this.engineModel.scale.set(0.3, 0.3, 0.3);
      this.add(this.engineModel);

      applyLightSweepShader(this.model, this.sweepMaterials);

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

    this.sweepMaterials.forEach((mat) => {
      if (mat.userData.sweepUniforms) {
        mat.userData.sweepUniforms.time.value = this.clock.elapsed * 0.001;
        mat.userData.sweepUniforms.sweepActive.value = this.hovered ? 1 : 0;
      }
    });

    if (this.model) {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObject(this.model, true);
      this.hovered = intersects.length > 0;
    }
  }

  public resize(): void {
    this.camera.aspect = this.viewport.ratio;
    this.camera.updateProjectionMatrix();
  }

  public dispose(): void {
    window.removeEventListener("mousemove", this.onMouseMove);

    if (this.model) {
      this.model.traverse((child) => {
        if ((child as Mesh).geometry) (child as Mesh).geometry.dispose();

        const material = (child as Mesh).material;
        if (Array.isArray(material)) {
          material.forEach((m) => m?.dispose?.());
        } else {
          material?.dispose?.();
        }
      });
    }
  }

  public setCarColor(color: number): void {
    if (!this.model) return;

    this.model.traverse((child) => {
      const mat = (child as Mesh).material;
      if (!mat) return;

      const materials: MeshStandardMaterial[] = [];

      const flattenMaterials = (m: any) => {
        if (Array.isArray(m)) m.forEach(flattenMaterials);
        else if (m instanceof MeshStandardMaterial) materials.push(m);
      };

      flattenMaterials(mat);

      materials.forEach((m) => {
        if (m.name === "EXT_Carpaint_Inst") {
          m.color.setHex(color);
        }
      });
    });
  }

  private onMouseMove = (event: MouseEvent) => {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  };
}
