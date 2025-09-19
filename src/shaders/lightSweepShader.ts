import { Object3D, Mesh, MeshStandardMaterial } from "three";

export interface SweepMaterial extends MeshStandardMaterial {
  userData: {
    sweepUniforms?: {
      time: { value: number };
      sweepActive: { value: number };
    };
  };
}

export function applyLightSweepShader(
  obj: Object3D,
  sweepMaterials: SweepMaterial[]
) {
  obj.traverse((child) => {
    if (child instanceof Mesh && child.material) {
      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      materials.forEach((mat) => {
        if (mat instanceof MeshStandardMaterial) {
          const uniforms = {
            time: { value: 0 },
            sweepActive: { value: 0 },
          };

          mat.onBeforeCompile = (shader: any) => {
            shader.uniforms.time = uniforms.time;
            shader.uniforms.sweepActive = uniforms.sweepActive;

            (mat as SweepMaterial).userData.sweepUniforms = uniforms;

            shader.vertexShader =
              `
              varying vec3 vWorldPos;
            ` + shader.vertexShader;

            shader.vertexShader = shader.vertexShader.replace(
              `#include <worldpos_vertex>`,
              `
                #include <worldpos_vertex>
                vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
              `
            );

            shader.fragmentShader =
              `
              varying vec3 vWorldPos;
              uniform float time;
              uniform float sweepActive;
            ` + shader.fragmentShader;

            shader.fragmentShader = shader.fragmentShader.replace(
              `#include <dithering_fragment>`,
              `
                #include <dithering_fragment>

                float sweepY = mod(time * 2.0, 10.0) - 5.0;
                float intensity = exp(-10.0 * abs(vWorldPos.y - sweepY));

                if (sweepActive > 0.5) {
                  gl_FragColor.rgb += intensity;
                }
              `
            );
          };

          sweepMaterials.push(mat as SweepMaterial);
        }
      });
    }
  });
}
