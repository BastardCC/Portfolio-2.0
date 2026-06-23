"use client";

import { Center, Environment, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Suspense,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
} from "react";
import {
  Box3,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  type Group,
  type Object3D,
} from "three";

const TROPHY_URL = "/models/trophy/scene.gltf";
const TROPHY_ROTATION_TURNS = 0.6;
const DRAG_ROTATION_SENSITIVITY = 0.005;
const MAX_PITCH_ROTATION = Math.PI / 2.5;
const TROPHY_TARGET_SIZE = 2.6;

type DragRotation = {
  x: number;
  y: number;
};

const enhanceGoldMaterials = (object: Object3D) => {
  object.traverse((child) => {
    if (!(child instanceof Mesh)) return;

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    materials.forEach((material) => {
      if (!(material instanceof MeshStandardMaterial)) return;

      material.envMapIntensity = 1.8;
      material.metalness = Math.min(material.metalness + 0.15, 1);
      material.roughness = Math.max(material.roughness - 0.12, 0.18);
      material.needsUpdate = true;
    });
  });
};

const getModelScale = (object: Object3D) => {
  const box = new Box3().setFromObject(object);
  const size = box.getSize(new Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z);

  if (maxDimension <= 0) return 1;

  return TROPHY_TARGET_SIZE / maxDimension;
};

type TrophyModelProps = {
  scrollProgressRef: RefObject<number>;
  dragRotationRef: RefObject<DragRotation>;
};

const TrophyModel = ({
  scrollProgressRef,
  dragRotationRef,
}: TrophyModelProps) => {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(TROPHY_URL);
  const model = useMemo(() => {
    const cloned = scene.clone(true);
    enhanceGoldMaterials(cloned);
    return cloned;
  }, [scene]);
  const modelScale = useMemo(() => getModelScale(model), [model]);

  useFrame(() => {
    if (!groupRef.current) return;

    groupRef.current.rotation.x = dragRotationRef.current.x;
    groupRef.current.rotation.y =
      scrollProgressRef.current * Math.PI * 2 * TROPHY_ROTATION_TURNS +
      dragRotationRef.current.y;
  });

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={model} scale={modelScale} />
      </Center>
    </group>
  );
};

type AwardTrophyProps = {
  scrollProgressRef: RefObject<number>;
};

const AwardTrophy = ({ scrollProgressRef }: AwardTrophyProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRotationRef = useRef<DragRotation>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const lastPointerXRef = useRef(0);
  const lastPointerYRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const checkSize = () => {
      const { width, height } = container.getBoundingClientRect();
      setIsReady(width > 0 && height > 0);
    };

    checkSize();

    const observer = new ResizeObserver(checkSize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    lastPointerXRef.current = event.clientX;
    lastPointerYRef.current = event.clientY;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const deltaX = event.clientX - lastPointerXRef.current;
    const deltaY = event.clientY - lastPointerYRef.current;
    lastPointerXRef.current = event.clientX;
    lastPointerYRef.current = event.clientY;

    dragRotationRef.current.y += deltaX * DRAG_ROTATION_SENSITIVITY;
    dragRotationRef.current.x = Math.max(
      -MAX_PITCH_ROTATION,
      Math.min(
        MAX_PITCH_ROTATION,
        dragRotationRef.current.x - deltaY * DRAG_ROTATION_SENSITIVITY,
      ),
    );
  }, []);

  const endDrag = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    setIsDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={[
        "awards__trophy",
        isDragging ? "awards__trophy--dragging" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onPointerCancel={endDrag}
      role="img"
      aria-label="Trophée 3D — faire glisser pour le faire tourner dans toutes les directions"
    >
      {isReady ? (
        <Canvas
          camera={{ position: [0, 1.2, 6.5], fov: 32 }}
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true }}
          onCreated={({ gl }) => {
            gl.toneMappingExposure = 1.35;
          }}
        >
          <ambientLight intensity={1.15} color="#fff8e8" />
          <directionalLight
            intensity={2.2}
            position={[4, 6, 5]}
            color="#fff5d0"
          />
          <directionalLight
            intensity={1.1}
            position={[-4, 2, 4]}
            color="#ffe8b8"
          />
          <pointLight intensity={0.9} position={[0, 1.5, 2]} color="#ffffff" />
          <Suspense fallback={null}>
            <Environment preset="city" environmentIntensity={1.1} />
            <TrophyModel
              scrollProgressRef={scrollProgressRef}
              dragRotationRef={dragRotationRef}
            />
          </Suspense>
        </Canvas>
      ) : null}
    </div>
  );
};

useGLTF.preload(TROPHY_URL);

export default AwardTrophy;
