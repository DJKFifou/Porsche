import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import glsl from "vite-plugin-glsl";
import tsconfigPaths from "vite-tsconfig-paths";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  assetsInclude: [
    "**/*.gltf",
    "**/*.glb",
    "**/*.obj",
    "**/*.mtl",
    "**/*.bin",
    "**/*.png",
    "**/*.jpg",
    "**/*.jpeg",
  ],
  build: {
    assetsInlineLimit: 0,
  },
  plugins: [
    tsconfigPaths(),
    glsl(),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/three/examples/jsm/libs/draco",
          dest: "libs",
        },
        {
          src: "node_modules/three/examples/jsm/libs/basis",
          dest: "libs",
        },
      ],
    }),
    tailwindcss(),
  ],
});
