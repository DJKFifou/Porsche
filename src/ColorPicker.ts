import { MainScene } from "./scenes/MainScene";

export class ColorPicker {
  private scene: MainScene;
  private customPicker: HTMLInputElement;

  constructor(scene: MainScene) {
    this.scene = scene;
    this.customPicker = document.querySelector("#customColorPicker")!;

    this.init();
  }

  private init(): void {
    this.customPicker.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      this.updateCarColor(target.value);
    });
  }

  private updateCarColor(colorString: string): void {
    const color = parseInt(colorString.replace("#", "0x"), 16);
    this.scene.setCarColor(color);
  }
}
