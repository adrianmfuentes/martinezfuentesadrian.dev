import * as THREE from "three";
import { ReactThreeFiber } from "@react-three/fiber";
import { GridShaderMaterial } from "./components/GridShaderMaterial"; 

declare global {
  namespace JSX {
    interface IntrinsicElements {
      gridShaderMaterial: ReactThreeFiber.ShaderMaterialProps & {
        color?: THREE.Color | string;
        secondaryColor?: THREE.Color | string;
        time?: number;
        resolution?: THREE.Vector2;
        isDarkMode?: number;
      };
    }
  }
}

export {};