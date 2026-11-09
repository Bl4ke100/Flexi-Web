"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import { Upload, X, MapPin, Car } from "lucide-react";
import {
  CUSTOMER_GALLERY_PHOTOS,
  CustomerPhoto,
  FLEET_VEHICLES,
} from "@/data/fleetData";
import { FourPointStar } from "./AnimatedText";

// ============================================================================
// 3D HELICAL FILM TAPE SPLINE IN WORLD SPACE
// Camera sits at [0, 0, 11] with fov = 38.
// Z = 0 is the exact plane of the giant center headline ("THE DRIVES WE MADE MEMORIES").
// - Points P0..P3 have Z < 0 (Physically BEHIND the center headline, scaled down by true 3D perspective).
// - Point P4 is the Right-Hand 3D Cylinder Roller (X = +5.35, Z curves from -3.8 -> +2.8).
// - Points P5..P8 have Z > 0 (Physically IN FRONT OF the center headline).
// - Points P9..P10 go all the way off the top-left of the screen (X = -14.5, Y = +4.6)
//   so every single photo leaves the screen before the section unpins!
// ============================================================================
const HELIX_CONTROL_POINTS = [
  new THREE.Vector3(-11.8, -4.1, -6.4), // P0: Just off-screen on the left side (entry point)
  new THREE.Vector3(-7.2, -3.35, -6.2), // P1: Enters from left side of screen (behind text)
  new THREE.Vector3(-3.0, -2.7, -6.0),  // P2: Back-left (behind text)
  new THREE.Vector3(0.8, -2.1, -5.6),   // P3: Back-center (behind text)
  new THREE.Vector3(3.8, -1.58, -4.1),  // P4: Back-right approach (behind text)
  new THREE.Vector3(5.35, -1.05, -0.4), // P5: Right-edge 3D cylinder turnaround apex
  new THREE.Vector3(4.15, -0.5, 2.85),  // P6: Front-right emerging from bend (in front of text)
  new THREE.Vector3(1.15, 0.25, 3.55),  // P7: Front-center-right (in front of text)
  new THREE.Vector3(-2.1, 1.08, 3.45),  // P8: Front-center-left (in front of text)
  new THREE.Vector3(-5.5, 1.98, 2.95),  // P9: Front-top-left edge of screen
  new THREE.Vector3(-8.4, 2.85, 2.4),   // P10: Just off-screen on the left side (immediate exit)
];

const HELIX_CURVE = new THREE.CatmullRomCurve3(
  HELIX_CONTROL_POINTS,
  false,
  "centripetal",
  0.5
);
const TOTAL_CURVE_LENGTH = HELIX_CURVE.getLength();

// Helper to evaluate point P(s), tangent T(s), and smooth upward ribbon vector B(s)
// at arc-length distance s ∈ [0, TOTAL_CURVE_LENGTH]
function sampleFilmRibbonAtArcLength(
  s: number,
  outPos: THREE.Vector3,
  outUp: THREE.Vector3,
  outNormal: THREE.Vector3
) {
  const u = Math.max(0, Math.min(1, s / TOTAL_CURVE_LENGTH));
  HELIX_CURVE.getPointAt(u, outPos);
  const tangent = HELIX_CURVE.getTangentAt(u);

  // Smoothly align the top/bottom edges of the film tape with the screen slope
  // while keeping B pointing strictly upward (By > 0) so the tape NEVER flips or twists!
  const tx = tangent.x;
  const ty = tangent.y;
  const effectiveSlope = (ty * tx) / (tx * tx + 0.55);

  outUp.set(-effectiveSlope, 1.0, 0.0).normalize();
  outNormal.crossVectors(tangent, outUp).normalize();
}

// ============================================================================
// GENERATE HIGH-RES POSTER TEXTURE FOR EACH CUSTOMER + CAR CARD
// ============================================================================
function useCustomerPosterTexture(photo: CustomerPhoto): THREE.CanvasTexture {
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
      const W = canvas.width;
      const H = canvas.height;

      // Base dark fill
      ctx.fillStyle = "#0B0B0B";
      ctx.fillRect(0, 0, W, H);

      // Draw customer + car image with object-fit: cover
      if (img && img.width > 0 && img.height > 0) {
        const imgAspect = img.width / img.height;
        const canvasAspect = W / H;
        let drawW = W;
        let drawH = H;
        let offsetX = 0;
        let offsetY = 0;

        if (imgAspect > canvasAspect) {
          drawH = H;
          drawW = H * imgAspect;
          offsetX = -(drawW - W) * 0.5;
        } else {
          drawW = W;
          drawH = W / imgAspect;
          offsetY = -(drawH - H) * 0.5;
        }
        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      }

      // Top & bottom dark editorial gradients
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "rgba(0,0,0,0.55)");
      grad.addColorStop(0.35, "rgba(0,0,0,0.08)");
      grad.addColorStop(0.65, "rgba(0,0,0,0.35)");
      grad.addColorStop(1, "rgba(0,0,0,0.92)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Subtle Orange Light-Leak Corners (Like LFG Posters)
      const topGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, 190);
      topGlow.addColorStop(0, "rgba(255, 85, 0, 0.42)");
      topGlow.addColorStop(1, "rgba(255, 85, 0, 0)");
      ctx.fillStyle = topGlow;
      ctx.fillRect(0, 0, W, H);

      const botGlow = ctx.createRadialGradient(W, H, 10, W, H, 210);
      botGlow.addColorStop(0, "rgba(255, 85, 0, 0.38)");
      botGlow.addColorStop(1, "rgba(255, 85, 0, 0)");
      ctx.fillStyle = botGlow;
      ctx.fillRect(0, 0, W, H);

      // Top Center Emblem: FLEXI RENTAL
      ctx.textAlign = "center";
      ctx.font = "900 22px sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("FLEXI", W * 0.5 - 38, 46);
      ctx.fillStyle = "#FF5500";
      ctx.fillText("RENTAL", W * 0.5 + 36, 46);

      ctx.font = "600 11px monospace";
      ctx.fillStyle = "rgba(255,255,255,0.72)";
      ctx.fillText("SRI LANKA", W * 0.5, 64);

      // Bottom Orange Vehicle Pill
      const vehicleLabel = photo.vehicleName.toUpperCase();
      ctx.font = "700 14px monospace";
      const pillW = Math.min(W - 60, ctx.measureText(vehicleLabel).width + 28);
      ctx.fillStyle = "#FF5500";
      ctx.fillRect((W - pillW) * 0.5, H - 148, pillW, 26);

      ctx.fillStyle = "#050505";
      ctx.fillText(vehicleLabel, W * 0.5, H - 130);

      // Customer Name (Bold Poster Headline)
      ctx.font = "900 40px sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(photo.customerName.toUpperCase(), W * 0.5, H - 78, W - 48);

      // Location Subtitle
      ctx.font = "700 15px monospace";
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillText(photo.location.toUpperCase(), W * 0.5, H - 44, W - 48);

      // Subtle Film Frame Border
      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      ctx.lineWidth = 3;
      ctx.strokeRect(1.5, 1.5, W - 3, H - 3);

      texture.needsUpdate = true;
    };

    // Draw initial placeholder immediately, then draw loaded image
    drawPoster();

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => drawPoster(img);
    img.src = photo.image;
  }, [photo, texture]);

  return texture;
}

// ============================================================================
// SINGLE CURVED FILM FRAME MESH (48 HORIZONTAL SEGMENTS DEFORMED ONTO SPLINE)
// ============================================================================
const SEGMENTS_X = 48;
const SEGMENTS_Y = 1;
const CARD_ARC_WIDTH = 2.08; // Physical width along the 3D film strip
const CARD_HEIGHT = 2.66;    // Physical height of the film strip
const CARD_GAP = 0.13;       // Tight, uniform film-tape gap between frames!
const CARD_STEP = CARD_ARC_WIDTH + CARD_GAP;

function FilmFrameMesh({
  photo,
  cardIndex,
  scrollRef,
  totalCards,
  onSelect,
}: {
  photo: CustomerPhoto;
  cardIndex: number;
  scrollRef: React.MutableRefObject<number>;
  totalCards: number;
  onSelect: (p: CustomerPhoto) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useCustomerPosterTexture(photo);

  // Create a dedicated PlaneGeometry whose vertices we deform every frame onto the 3D helix
  const { geometry, baseUVs } = useMemo(() => {
    const geom = new THREE.PlaneGeometry(1, 1, SEGMENTS_X, SEGMENTS_Y);
    const uvAttr = geom.attributes.uv;
    const uvs: Array<{ u: number; v: number }> = [];
    for (let i = 0; i < uvAttr.count; i++) {
      uvs.push({
        u: uvAttr.getX(i) - 0.5, // -0.5 (left) to +0.5 (right)
        v: uvAttr.getY(i) - 0.5, // -0.5 (bottom) to +0.5 (top)
      });
    }
    return { geometry: geom, baseUVs: uvs };
  }, []);

  // Custom shader so both front & back of the curved film strip display un-mirrored imagery
  // with subtle 3D cylinder shading around the right-hand bend
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

  const tmpPos = useMemo(() => new THREE.Vector3(), []);
  const tmpUp = useMemo(() => new THREE.Vector3(), []);
  const tmpNormal = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!meshRef.current) return;
    const progress = scrollRef.current;

    const halfW = CARD_ARC_WIDTH * 0.5;

    // 1. At progress = 0 (when first scrolling to this section):
    //    startLeadS = -halfW so NO image is on screen initially.
    // 2. As progress goes 0 -> 1:
    //    The roll enters from the bottom, winds around the 3D helix, and at
    //    progress = 1.0 the trailing edge of the LAST image (cardIndex = totalCards - 1)
    //    just exits P9 (top-left of screen), immediately releasing the scroll to the next section!
    const startLeadS = -halfW;
    const endLeadS =
      TOTAL_CURVE_LENGTH + halfW + (totalCards - 1) * CARD_STEP;

    const clampedProgress = Math.min(1, Math.max(0, progress));
    const leadS = startLeadS + clampedProgress * (endLeadS - startLeadS);
    const cardCenterS = leadS - cardIndex * CARD_STEP;

    // Hide card when it hasn't entered yet (s <= 0) or has exited top-left (s >= TOTAL_CURVE_LENGTH)
    if (
      cardCenterS + halfW <= 0.05 ||
      cardCenterS - halfW >= TOTAL_CURVE_LENGTH - 0.05
    ) {
      meshRef.current.visible = false;
      return;
    }
    meshRef.current.visible = true;
    material.uniforms.uOpacity.value = 1.0;

    // Deform all 48 horizontal vertex columns directly onto the 3D helical spline!
    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < baseUVs.length; i++) {
      const { u, v } = baseUVs[i];
      // u ∈ [-0.5, +0.5]: map along arc-length s so card bends smoothly along the 3D curve
      const vertexS = cardCenterS - u * CARD_ARC_WIDTH;
      sampleFilmRibbonAtArcLength(vertexS, tmpPos, tmpUp, tmpNormal);

      const vx = tmpPos.x + v * CARD_HEIGHT * tmpUp.x;
      const vy = tmpPos.y + v * CARD_HEIGHT * tmpUp.y;
      const vz = tmpPos.z + v * CARD_HEIGHT * tmpUp.z;

      posAttr.setXYZ(i, vx, vy, vz);
    }

    posAttr.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(photo);
      }}
    />
  );
}

// ============================================================================
// GIANT 2-LINE CENTER HEADLINE PLANE AT Z = 0 INSIDE THE 3D HELIX
// Because it sits at Z = 0 in the 3D scene:
// - The Back Film Tape (Z < 0) renders physically BEHIND this headline!
// - The Front Film Tape (Z > 0) renders physically IN FRONT OF this headline!
// ============================================================================
function CenterHeadlinePlane() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 2400;
    canvas.height = 760;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Top Line: "THE DRIVES WE" (Right-shifted like "THE NIGHTS WE" in LFG screenshot)
      ctx.font = "900 225px sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "right";
      ctx.fillText("THE DRIVES WE", 2320, 255);

      // Middle Tracked Subtitle Line
      ctx.font = "700 26px monospace";
      ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
      ctx.textAlign = "center";
      ctx.letterSpacing = "8px";
      ctx.fillText(
        "COLOMBO  •  KATUNAYAKE BIA  •  KANDY  •  ELLA  •  GALLE",
        1200,
        365
      );

      // Bottom Line: "MADE MEMORIES" (Left-shifted like "MADE HISTORY" in LFG screenshot)
      ctx.font = "900 225px sans-serif";
      ctx.textAlign = "left";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("MADE ", 70, 620);

      const madeWidth = ctx.measureText("MADE ").width;
      ctx.fillStyle = "#FF5500";
      ctx.fillText("MEMORIES", 70 + madeWidth, 620);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, []);

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

export default function CustomerWormGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollProgressRef = useRef<number>(0);

  const [photos, setPhotos] = useState<CustomerPhoto[]>(
    CUSTOMER_GALLERY_PHOTOS
  );
  const [selectedPhoto, setSelectedPhoto] = useState<CustomerPhoto | null>(
    null
  );
  const [fullGalleryOpen, setFullGalleryOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Upload Form State
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newLocation, setNewLocation] = useState("Katunayake BIA Airport");
  const [newVehicleName, setNewVehicleName] = useState(
    FLEET_VEHICLES[1].name
  );
  const [newQuote, setNewQuote] = useState(
    "Smooth pickup and spotless hybrid car for our Sri Lanka trip!"
  );
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 30,
    restDelta: 0.0002,
  });

  useMotionValueEvent(smoothScroll, "change", (v) => {
    scrollProgressRef.current = v;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleAddCustomerPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) return;

    const added: CustomerPhoto = {
      id: `custom-${Date.now()}`,
      customerName: newCustomerName.trim() || "Happy Flexi Customer",
      location: newLocation.trim() || "Colombo, Sri Lanka",
      vehicleName: newVehicleName,
      tripTag: `HANDOVER // 0${photos.length + 1}`,
      quote:
        newQuote.trim() ||
        "Great car rental experience in Sri Lanka with Flexi Rental!",
      image: previewUrl,
    };

    setPhotos((prev) => [added, ...prev]);
    setNewCustomerName("");
    setPreviewUrl("");
    setUploadModalOpen(false);
  };

  return (
    <section
      id="customer-moments"
      ref={sectionRef}
      className="relative h-[580vh] bg-[#050505] border-t border-white/10 select-none"
    >
      {/* Sticky Full-Screen Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        {/* ===================================================================
            THIN ORBITAL HAIRLINE ARCS IN BACKGROUND (EXACT LFG STYLE)
        =================================================================== */}
        <svg
          viewBox="0 0 1440 900"
          fill="none"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 w-full h-full z-[1]"
        >
          <path
            d="M 130 115 C 85 80, 380 110, 1255 410"
            stroke="rgba(255, 255, 255, 0.18)"
            strokeWidth="1.1"
          />
          <path
            d="M 205 390 C 65 435, 185 655, 1045 810"
            stroke="rgba(255, 255, 255, 0.18)"
            strokeWidth="1.1"
          />
        </svg>

        {/* ===================================================================
            WEBGL / THREE.JS TRUE 3D BENDING HELICAL FILM TAPE + Z=0 HEADLINE
        =================================================================== */}
        <div
          data-cursor="VIEW"
          className="absolute inset-0 z-10 w-full h-full"
        >
          <Canvas
            camera={{ position: [0, 0, 11], fov: 38, near: 0.1, far: 50 }}
            gl={{ antialias: true, alpha: true }}
          >
            {/* Center 2-Line Headline Plane at Z = 0 inside the 3D Film Loop */}
            <CenterHeadlinePlane />

            {/* Continuous 3D Bending Film Strip Frames */}
            {photos.map((photo, idx) => (
              <FilmFrameMesh
                key={photo.id}
                photo={photo}
                cardIndex={idx}
                scrollRef={scrollProgressRef}
                totalCards={photos.length}
                onSelect={(p) => setSelectedPhoto(p)}
              />
            ))}
          </Canvas>
        </div>

        {/* ===================================================================
            TOP & BOTTOM UI CORNERS
        =================================================================== */}
        <div className="pointer-events-none relative z-30 w-full max-w-[1440px] mx-auto px-6 sm:px-12 pt-24 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#FF5500] flex items-center gap-2">
            <FourPointStar className="w-3.5 h-3.5 text-[#FF5500]" />
            (Customer Gallery)
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-400">
            Scroll until all frames pass ↑
          </span>
        </div>

        <div className="relative z-30 w-full max-w-[1440px] mx-auto px-6 sm:px-12 pb-8 sm:pb-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <p className="pointer-events-none text-neutral-300 text-sm sm:text-base leading-snug font-light">
            More than just a gallery.
            <br />
            <span className="text-white font-medium">
              Every customer on the road.
            </span>
          </p>

          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-[#FF5500] hover:text-white border-b border-[#FF5500] pb-1 transition-colors"
            >
              + ADD CUSTOMER PHOTO
            </button>

            <button
              onClick={() => setFullGalleryOpen(true)}
              className="font-mono text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-white hover:text-[#FF5500] border-b border-white hover:border-[#FF5500] pb-1 transition-colors"
            >
              VIEW FULL GALLERY
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          SINGLE PHOTO LIGHTBOX MODAL
      ===================================================================== */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full bg-[#0D0D0D] border border-[#FF5500] overflow-hidden"
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/80 border border-white/20 text-white hover:bg-[#FF5500] hover:text-black flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="aspect-[16/10] w-full bg-black overflow-hidden">
                <img
                  src={selectedPhoto.image}
                  alt={selectedPhoto.customerName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs uppercase tracking-[0.2em]">
                  <span className="px-3 py-1 bg-[#FF5500] text-black font-bold">
                    {selectedPhoto.tripTag}
                  </span>
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#FF5500]" />
                    {selectedPhoto.location}
                  </span>
                </div>

                <h3 className="font-display font-black text-2xl sm:text-3xl text-white">
                  {selectedPhoto.customerName} —{" "}
                  <span className="text-[#FF5500]">
                    {selectedPhoto.vehicleName}
                  </span>
                </h3>

                <p className="text-neutral-300 text-base leading-relaxed">
                  &ldquo;{selectedPhoto.quote}&rdquo;
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          FULL GALLERY GRID MODAL ("VIEW FULL GALLERY")
      ===================================================================== */}
      <AnimatePresence>
        {fullGalleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullGalleryOpen(false)}
            className="fixed inset-0 z-[80] bg-black/95 backdrop-blur-md overflow-y-auto p-6 sm:p-12"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="max-w-7xl mx-auto"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-10 border-b border-white/15">
                <div>
                  <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#FF5500] block mb-1">
                    (All Customer Handovers)
                  </span>
                  <h3 className="font-display font-black text-3xl sm:text-5xl text-white uppercase">
                    THE DRIVES WE MADE{" "}
                    <span className="text-[#FF5500]">MEMORIES</span>
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setFullGalleryOpen(false);
                      setUploadModalOpen(true);
                    }}
                    className="px-5 py-3 bg-[#FF5500] text-black font-mono text-xs font-bold uppercase tracking-[0.18em]"
                  >
                    + Add Photo
                  </button>
                  <button
                    onClick={() => setFullGalleryOpen(false)}
                    className="w-11 h-11 border border-white/20 text-white hover:border-[#FF5500] flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {photos.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setFullGalleryOpen(false);
                      setSelectedPhoto(item);
                    }}
                    className="cursor-pointer group relative aspect-[3.8/4.8] overflow-hidden bg-[#0D0D0D] border border-white/15 hover:border-[#FF5500]"
                  >
                    <img
                      src={item.image}
                      alt={item.customerName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 inset-x-4">
                      <span className="px-2 py-0.5 bg-[#FF5500] text-black font-mono text-[9px] font-bold uppercase tracking-wider">
                        {item.vehicleName}
                      </span>
                      <h4 className="font-display font-black text-xl text-white mt-2">
                        {item.customerName}
                      </h4>
                      <p className="font-mono text-[10px] text-neutral-400 uppercase">
                        {item.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          UPLOAD MODAL ("+ ADD CUSTOMER PHOTO")
      ===================================================================== */}
      <AnimatePresence>
        {uploadModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setUploadModalOpen(false)}
            className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full bg-[#0C0C0C] border border-white/20 p-6 sm:p-8"
            >
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF5500] block">
                    (Customer Handover Gallery)
                  </span>
                  <h3 className="font-display font-bold text-2xl text-white">
                    Add Customer + Car Photo
                  </h3>
                </div>
                <button
                  onClick={() => setUploadModalOpen(false)}
                  className="w-9 h-9 border border-white/15 text-neutral-400 hover:text-white hover:border-[#FF5500] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddCustomerPhoto} className="space-y-4">
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-40 border border-dashed border-[#FF5500]/60 hover:border-[#FF5500] bg-white/[0.02] flex flex-col items-center justify-center gap-2 transition-colors overflow-hidden relative"
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-[#FF5500]" />
                        <span className="font-mono text-xs uppercase tracking-[0.18em] text-white">
                          Click to Select Customer + Car Image
                        </span>
                        <span className="font-mono text-[10px] text-neutral-500">
                          JPG, PNG, or WEBP
                        </span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400 mb-1.5">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      placeholder="e.g. Nuwan & Family"
                      className="w-full px-3.5 py-2.5 bg-black border border-white/15 text-white text-sm focus:border-[#FF5500] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400 mb-1.5">
                      Pickup / Trip Location
                    </label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. Katunayake BIA / Kandy"
                      className="w-full px-3.5 py-2.5 bg-black border border-white/15 text-white text-sm focus:border-[#FF5500] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400 mb-1.5">
                    Rented Vehicle
                  </label>
                  <div className="relative">
                    <Car className="w-4 h-4 text-[#FF5500] absolute left-3.5 top-3" />
                    <select
                      value={newVehicleName}
                      onChange={(e) => setNewVehicleName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-black border border-white/15 text-white text-sm focus:border-[#FF5500] focus:outline-none"
                    >
                      {FLEET_VEHICLES.map((v) => (
                        <option key={v.id} value={v.name}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-400 mb-1.5">
                    Short Customer Note
                  </label>
                  <input
                    type="text"
                    value={newQuote}
                    onChange={(e) => setNewQuote(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black border border-white/15 text-white text-sm focus:border-[#FF5500] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!previewUrl}
                  className="w-full py-3.5 bg-[#FF5500] disabled:opacity-40 hover:bg-white text-black font-mono text-xs font-bold uppercase tracking-[0.2em] transition-colors"
                >
                  [ Add Photo to 3D Film Tape ]
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
