import { ExampleScene } from "./scenes/ExampleScene";

export class ColorPicker {
  private scene: ExampleScene;
  private container: HTMLElement;
  private customPicker: HTMLInputElement;

  constructor(scene: ExampleScene) {
    this.scene = scene;
    this.container = document.querySelector(".color-picker-container")!;
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
