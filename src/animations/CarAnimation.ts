import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ExampleScene } from "../scenes/ExampleScene";
import { Vector3 } from "three";

export class CarAnimation {
  private scene: ExampleScene;
  private colorChanged: boolean = false;

  constructor(scene: ExampleScene) {
    this.scene = scene;
    this.initAnimations();
    this.setupEventListeners();
  }

  private initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    this.scene.rotation.set(0, 0, 0);
    this.scene.camera.position.set(0, 0, 0);

    ScrollTrigger.defaults({
      immediateRender: false,
    });

    const position = new Vector3(-0.5, -1, 0);

    position.unproject(this.scene.camera);

    const car_anim_ap = gsap.timeline({
      scrollTrigger: {
        trigger: ".section-one",
        start: "middle center",
        endTrigger: ".section-one",
        end: "25% center",
        scrub: 1,
      },
      ease: "power1.inOut",
    });

    if (this.scene.model) {
      car_anim_ap.to(this.scene.model.position, { x: -5, y: -1, z: 0 }, 0);
    }

    const car_anim_tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".section-one",
        start: "75% center",
        endTrigger: ".section-two",
        end: "25% center",
        scrub: 1,
      },
      ease: "power1.inOut",
    });

    if (this.scene.model) {
      car_anim_tl
        .to(this.scene.model.position, { x: 3, y: 0, z: 0 }, 0)
        .to(this.scene.model.rotation, { x: 0, y: 0, z: 0 }, 0)
        .to(this.scene.model.scale, { x: 80, y: 80, z: 80 }, 0);
    }

    const car_anim_dp = gsap.timeline({
      scrollTrigger: {
        trigger: ".section-two",
        start: "25% middle",
        endTrigger: ".section-two",
        end: "50% top",
        scrub: 1,
      },
      ease: "power1.inOut",
    });

    if (this.scene.model) {
      car_anim_dp.to(this.scene.model.position, { x: 10, y: -1, z: 0 }, 0);
    }

    const engine_anim_ap = gsap.timeline({
      scrollTrigger: {
        trigger: ".section-two",
        start: "bottom bottom",
        endTrigger: ".section-three",
        end: "25% center",
        scrub: 1,
      },
      ease: "power1.inOut",
    });

    if (this.scene.engineModel) {
      engine_anim_ap.to(
        this.scene.engineModel.position,
        { x: -1, y: -1, z: 0 },
        0
      );
    }

    // const engine_anim_tr = gsap.timeline({
    //   scrollTrigger: {
    //     trigger: ".section-three",
    //     start: "top center",
    //     endTrigger: ".section-three",
    //     end: "middle middle",
    //     scrub: 1,
    //   },
    //   ease: "power1.inOut",
    // });

    // if (this.scene.engineModel) {
    //   engine_anim_tr.to(this.scene.engineModel.rotation, {
    //     y: Math.PI * 2,
    //     duration: 2,
    //     ease: "none",
    //     transformOrigin: "center center",
    //   });
    // }

    const engine_anim_dp = gsap.timeline({
      scrollTrigger: {
        trigger: ".section-three",
        start: "middle middle",
        endTrigger: ".section-three",
        end: "bottom middle",
        scrub: 1,
      },
      ease: "power1.inOut",
    });

    if (this.scene.engineModel) {
      engine_anim_dp.to(
        this.scene.engineModel.position,
        { x: -1, y: 7, z: 0 },
        0
      );
    }

    // if (this.scene.engineModel) {
    //   engine_anim
    //     .fromTo(
    //       this.scene.engineModel.position,
    //       { x: -50 }, // Position de départ (hors écran à gauche)
    //       { x: -5, duration: 1 } // Position finale
    //     )
    //     .to(
    //       this.scene.engineModel.rotation,
    //       { y: this.scene.engineModel.rotation.y + Math.PI * 2, duration: 2 } // Rotation complète
    //     );
    // }

    const car_anim_reap = gsap.timeline({
      scrollTrigger: {
        trigger: "#last-section",
        start: "top bottom",
        endTrigger: "#last-section",
        end: "middle middle",
        scrub: 1,
        // onLeaveBack: () => {
        //   if (this.scene.model) {
        //     gsap.to(this.scene.model.rotation, {
        //       x: 0,
        //       y: 0,
        //       z: 0,
        //       duration: 0.5,
        //     });
        //     gsap.to(this.scene.model.position, {
        //       x: 0,
        //       y: -1,
        //       z: 0,
        //       duration: 0.5,
        //     });
        //     gsap.to(this.scene.model.scale, {
        //       x: 80,
        //       y: 80,
        //       z: 80,
        //       duration: 0.5,
        //     });
        //   }
        // },
      },
      ease: "power1.inOut",
    });

    if (this.scene.model) {
      car_anim_reap.to(this.scene.model.position, { x: 0, y: -1, z: 0 }, 0);
    }
  }

  private setupEventListeners() {
    const button = document.querySelector(".button");
    if (button) {
      button.addEventListener("click", () => this.changeBG());
    }
  }

  private changeBG() {
    const sections = document.querySelectorAll("section");
    if (!this.colorChanged) {
      gsap.to(sections, { backgroundColor: "white" });
      this.colorChanged = true;
    } else {
      gsap.to(sections, { backgroundColor: "" });
      this.colorChanged = false;
    }
  }
}
