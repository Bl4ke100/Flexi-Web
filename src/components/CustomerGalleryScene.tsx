"use client";

import { memo, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import type { CustomerPhoto } from "@/data/fleetData";
import { FILM_CURVE_LENGTH, FILM_SEGMENTS, FILM_STEP, FILM_WIDTH, createRibbonScratch, deformFilmRibbon } from "@/lib/film-ribbon";
import { canvasImage } from "@/lib/responsive-image";
import { paintGalleryPoster, createGalleryHeadline } from "@/lib/gallery-artwork";

function useCustomerPosterTexture(photo: CustomerPhoto): THREE.CanvasTexture {
  const invalidate = useThree(state => state.invalidate);
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 560;
    canvas.height = 720;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, []);

  useEffect(() => {
    const canvas = texture.image as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawPoster = (img?: HTMLImageElement) => {
      paintGalleryPoster(canvas, photo, img);
      texture.needsUpdate = true;
      invalidate();
    };

    // Draw initial placeholder immediately, then draw loaded image
    drawPoster();

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => drawPoster(img);
    img.src = canvasImage(photo.image);
    return () => { img.onload = null; };
  }, [photo, texture, invalidate]);

  useEffect(() => () => texture.dispose(), [texture]);

  return texture;
}

// ============================================================================
// SINGLE CURVED FILM FRAME MESH (48 HORIZONTAL SEGMENTS DEFORMED ONTO SPLINE)
// ============================================================================
function FilmFrameMesh({ photo, cardIndex, progress, totalCards, onSelect }: {
  photo: CustomerPhoto; cardIndex: number; progress: MotionValue<number>;
  totalCards: number; onSelect: (photo: CustomerPhoto) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useCustomerPosterTexture(photo);
  const geometry = useMemo(() => {
    const result = new THREE.PlaneGeometry(1, 1, FILM_SEGMENTS, 1);
    (result.attributes.position as THREE.BufferAttribute).setUsage(THREE.DynamicDrawUsage);
    // A fixed bound encloses every point of the moving ribbon. It also keeps
    // click raycasts correct after the vertices move away from their first frame.
    result.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 32);
    return result;
  }, []);
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: texture },
        uOpacity: { value: 1.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vDepth;
        void main() {
          vUv = uv;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vDepth = position.z;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D uMap;
        uniform float uOpacity;
        varying vec2 vUv;
        varying float vDepth;
        void main() {
          if (uOpacity <= 0.01) discard;
          // Ensure texture reads left-to-right whether on front or back of cylinder
          vec2 sampleUv = gl_FrontFacing ? vUv : vec2(1.0 - vUv.x, vUv.y);
          vec4 texColor = texture2D(uMap, sampleUv);
          // Subtle atmospheric dimming when deep in the back row (vDepth < 0)
          float depthShade = clamp(0.75 + (vDepth + 5.0) * 0.035, 0.68, 1.0);
          gl_FragColor = vec4(texColor.rgb * depthShade, texColor.a * uOpacity);
        }
      `,
      side: THREE.DoubleSide,
      transparent: true,
    });
  }, [texture]);


  const scratch = useMemo(createRibbonScratch, []);
  const previous = useRef({ progress: NaN, count: 0 });
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  useFrame(() => {
    if (!meshRef.current) return;
    const value = progress.get();
    if (value === previous.current.progress && totalCards === previous.current.count) return;
    previous.current.progress = value;
    previous.current.count = totalCards;
    const halfWidth = FILM_WIDTH * 0.5;
    const start = -halfWidth;
    const end = FILM_CURVE_LENGTH + halfWidth + (totalCards - 1) * FILM_STEP;
    const center = start + Math.max(0, Math.min(1, value)) * (end - start) - cardIndex * FILM_STEP;
    const visible = center + halfWidth > 0.05 && center - halfWidth < FILM_CURVE_LENGTH - 0.05;
    meshRef.current.visible = visible;
    if (!visible) return;
    const positions = geometry.attributes.position as THREE.BufferAttribute;
    deformFilmRibbon(positions.array as Float32Array, center, scratch);
    positions.needsUpdate = true;
    // The shader uses position/UV only; recomputing normals has no visual effect.
  });
  return <mesh ref={meshRef} geometry={geometry} material={material} onClick={event => { event.stopPropagation(); onSelect(photo); }} />;
}

// ============================================================================
// GIANT 2-LINE CENTER HEADLINE PLANE AT Z = 0 INSIDE THE 3D HELIX
// Because it sits at Z = 0 in the 3D scene:
// - The Back Film Tape (Z < 0) renders physically BEHIND this headline!
// - The Front Film Tape (Z > 0) renders physically IN FRONT OF this headline!
// ============================================================================
function CenterHeadlinePlane() {
  const texture = useMemo(() => {
    const canvas = createGalleryHeadline();
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={[0, -0.08, 0]}>
      <planeGeometry args={[12.6, 3.99]} />
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.04}
        depthWrite={true}
        depthTest={true}
      />
    </mesh>
  );
}


function RenderOnProgress({ progress }: { progress: MotionValue<number> }) {
  const invalidate = useThree(state => state.invalidate);
  useEffect(() => progress.on("change", () => invalidate()), [progress, invalidate]);
  return null;
}

function CustomerGalleryScene({ photos, progress, onSelect, onUnavailable }: {
  photos: CustomerPhoto[]; progress: MotionValue<number>; onSelect: (photo: CustomerPhoto) => void; onUnavailable: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleContextLost = (event: Event) => { event.preventDefault(); onUnavailable(); };
    canvas.addEventListener("webglcontextlost", handleContextLost);
    return () => canvas.removeEventListener("webglcontextlost", handleContextLost);
  }, [onUnavailable]);
  return <Canvas ref={canvasRef} frameloop="demand" camera={{ position: [0, 0, 11], fov: 38, near: 0.1, far: 50 }} gl={{ antialias: true, alpha: true }}>
    <RenderOnProgress progress={progress} />
    <CenterHeadlinePlane />
    {photos.map((photo, index) => <FilmFrameMesh key={photo.id} photo={photo} cardIndex={index} progress={progress} totalCards={photos.length} onSelect={onSelect} />)}
  </Canvas>;
}

export default memo(CustomerGalleryScene);
