"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useTheme } from "./ThemeProvider";
import Image from 'next/image';

// === Easy-to-tune Wave Animation Controls ===
const WAVE_CONFIG = {
  SEPARATION: 100, // Distance between points
  AMOUNTX: 50, // Number of points in X
  AMOUNTY: 50, // Number of points in Y
  X_FREQ: 0.3, // X axis wave frequency
  Y_FREQ: 0.5, // Y axis wave frequency
  Y_AMP: 50, // Y axis amplitude
  SCALE_AMP: 20, // Scale amplitude
  SCALE_OFFSET: 20, // Scale offset
  SPEED: 0.1, // Animation speed
  CAMERA: {
    Z: 1000, // Camera distance
    X: 0, // Camera X position
    Y: 200, // Camera Y position (height/lookdown)
    LOOK_AT: { x: 0, y: 0, z: 0 }, // Where the camera looks
  },
};

// Helper to get CSS variable value as hex
function cssVarToHex(varName: string, fallback: string = "#ffffff"): string {
  if (typeof window === "undefined") return fallback;
  const style = getComputedStyle(document.documentElement);
  const value = style.getPropertyValue(varName).trim();
  if (!value) return fallback;
  // Convert rgb/rgba to hex if needed
  if (value.startsWith("#")) return value;
  if (value.startsWith("rgb")) {
    const rgb = value.match(/\d+/g)?.map(Number);
    if (rgb && rgb.length >= 3) {
      return (
        "#" +
        rgb
          .slice(0, 3)
          .map((x) => x.toString(16).padStart(2, "0"))
          .join("")
      );
    }
  }
  return fallback;
}

// Helper to lighten a hex color (0-1 amount)
function lighten(hex: string, amount: number): string {
  hex = hex.replace("#", "");
  if (hex.length === 3)
    hex = hex
      .split("")
      .map((x) => x + x)
      .join("");
  const num = parseInt(hex, 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + 255 * amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + 255 * amount);
  const b = Math.min(255, (num & 0xff) + 255 * amount);
  return (
    "#" +
    ((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b))
      .toString(16)
      .slice(1)
  );
}

// Helper: Check if WebGL is available
function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export default function ThreeWavesBackground() {
  const mountRef = useRef<HTMLDivElement>(null);
  // Keep references for cleanup
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const { theme } = useTheme();
  const [webGLError, setWebGLError] = useState(false);

  useEffect(() => {
    let count = 0;
    let frameId: number;

    // Setup
    const container = mountRef.current;
    if (!container) return;

    // Check for WebGL support
    if (!isWebGLAvailable()) {
      setWebGLError(true);
      return;
    }

    try {
      // Camera
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        1,
        10000,
      );
      camera.position.set(
        WAVE_CONFIG.CAMERA.X,
        WAVE_CONFIG.CAMERA.Y,
        WAVE_CONFIG.CAMERA.Z,
      );
      camera.lookAt(
        WAVE_CONFIG.CAMERA.LOOK_AT.x,
        WAVE_CONFIG.CAMERA.LOOK_AT.y,
        WAVE_CONFIG.CAMERA.LOOK_AT.z,
      );

      // Scene
      const scene = new THREE.Scene();

      // Geometry
      const numParticles = WAVE_CONFIG.AMOUNTX * WAVE_CONFIG.AMOUNTY;
      const positions = new Float32Array(numParticles * 3);
      const scales = new Float32Array(numParticles);
      let i = 0,
        j = 0;
      for (let ix = 0; ix < WAVE_CONFIG.AMOUNTX; ix++) {
        for (let iy = 0; iy < WAVE_CONFIG.AMOUNTY; iy++) {
          positions[i] =
            ix * WAVE_CONFIG.SEPARATION -
            (WAVE_CONFIG.AMOUNTX * WAVE_CONFIG.SEPARATION) / 2; // x
          positions[i + 1] = 0; // y
          positions[i + 2] =
            iy * WAVE_CONFIG.SEPARATION -
            (WAVE_CONFIG.AMOUNTY * WAVE_CONFIG.SEPARATION) / 2; // z
          scales[j] = 1;
          i += 3;
          j++;
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("scale", new THREE.BufferAttribute(scales, 1));

      // Shaders
      const vertexShader = `
        attribute float scale;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
          gl_PointSize = scale * ( 300.0 / - mvPosition.z );
          gl_Position = projectionMatrix * mvPosition;
        }
      `;
      // Asterisk-like star using lines in the fragment shader
      const fragmentShader = `
        uniform vec3 color;
        uniform float u_time;
        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float d = length(uv);
          float thickness = 0.13;
          // Rotate the uv by time
          float angle = u_time * 0.7; // Rotation speed
          float s = sin(angle);
          float c = cos(angle);
          mat2 rot = mat2(c, -s, s, c);
          uv = rot * uv;
          float a = atan(uv.y, uv.x);
          float r1 = abs(sin(3.14159 * 3.0 * a)); // 3 arms (6 lines)
          float r2 = abs(cos(3.14159 * 3.0 * a));
          float line = smoothstep(thickness, 0.0, abs(uv.x)) + smoothstep(thickness, 0.0, abs(uv.y));
          float star = max(smoothstep(thickness, 0.0, r1 * d), smoothstep(thickness, 0.0, r2 * d));
          float mask = max(line, star);
          if (d > 0.5 || mask < 0.5) discard;
          // Add a white glow to the center
          float glow = smoothstep(0.18, 0.0, d); // Soft white center
          vec3 finalColor = mix(color, vec3(1.0, 1.0, 1.0), glow * 0.7); // 70% white at center
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `;

      // Material
      // Pick CSS variable for color based on theme
      const colorVar =
        theme === "dark"
          ? "--color-theme-dark-brand-accent"
          : "--color-theme-light-brand-accent";
      let colorHex = cssVarToHex(colorVar, "#4051b5");
      if (theme === "dark") {
        // Lighten the accent color for dark mode
        colorHex = lighten(colorHex, 0.35);
      }
      const material = new THREE.ShaderMaterial({
        uniforms: {
          color: { value: new THREE.Color(colorHex) },
          u_time: { value: 0.0 },
        },
        vertexShader,
        fragmentShader,
      });

      // Particles
      const particles = new THREE.Points(geometry, material);
      scene.add(particles);

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0); // transparent: alpha=0
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Events
      function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
      window.addEventListener("resize", onWindowResize);

      // Animation
      function animate() {
        render();
        material.uniforms.u_time.value = performance.now() * 0.001;
        frameId = requestAnimationFrame(animate);
      }
      function render() {
        camera.position.set(
          WAVE_CONFIG.CAMERA.X,
          WAVE_CONFIG.CAMERA.Y,
          WAVE_CONFIG.CAMERA.Z,
        );
        camera.lookAt(
          WAVE_CONFIG.CAMERA.LOOK_AT.x,
          WAVE_CONFIG.CAMERA.LOOK_AT.y,
          WAVE_CONFIG.CAMERA.LOOK_AT.z,
        );
        const positions = particles.geometry.attributes.position.array;
        const scales = particles.geometry.attributes.scale.array;
        let i = 0,
          j = 0;
        for (let ix = 0; ix < WAVE_CONFIG.AMOUNTX; ix++) {
          for (let iy = 0; iy < WAVE_CONFIG.AMOUNTY; iy++) {
            positions[i + 1] =
              Math.sin((ix + count) * WAVE_CONFIG.X_FREQ) * WAVE_CONFIG.Y_AMP +
              Math.sin((iy + count) * WAVE_CONFIG.Y_FREQ) * WAVE_CONFIG.Y_AMP;
            scales[j] =
              (Math.sin((ix + count) * WAVE_CONFIG.X_FREQ) + 1) *
                WAVE_CONFIG.SCALE_AMP +
              (Math.sin((iy + count) * WAVE_CONFIG.Y_FREQ) + 1) *
                WAVE_CONFIG.SCALE_OFFSET;
            i += 3;
            j++;
          }
        }
        particles.geometry.attributes.position.needsUpdate = true;
        particles.geometry.attributes.scale.needsUpdate = true;
        renderer.render(scene, camera);
        count += WAVE_CONFIG.SPEED;
      }
      animate();
      // Cleanup
      return () => {
        window.removeEventListener("resize", onWindowResize);
        cancelAnimationFrame(frameId);
        renderer.dispose();
        container.removeChild(renderer.domElement);
      };
    } catch (err) {
      setWebGLError(true);
      console.error("Error creating WebGLRenderer:", err);
      return;
    }
  }, [theme]);

  if (webGLError) {
    return (
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        fontSize: 16,
        fontFamily: "sans-serif",
        overflow: "hidden",
      }}>
        {/* SVG fallback using primary color */}
        <Image
          src="/wave-backdrop.svg"
          alt="Wave Backdrop"
          fill
          style={{
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 0,
            pointerEvents: "none",
          }}
          priority
        />
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        minHeight: "inherit",
        maxHeight: "inherit",
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    />
  );
}
