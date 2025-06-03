"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const AnimatedBackground = () => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const raycasterRef = useRef(new THREE.Raycaster());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !containerRef.current) return;

    let animationFrameId;

    // 初始化場景
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 初始化相機
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 6;
    camera.position.y = 1;
    cameraRef.current = camera;

    // 初始化渲染器
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 顏色方案
    const colors = [
      "#b85e39",
      "#f49269",
      "#ffc99d",
      "#f2fedc",
      "#AFC16D",
      "#101828",
      "#F0F0F0",
      "#FBF9FA"
    ];

    // 創建粒子
    const createParticles = () => {
      const navbarHeight = 160;
      const footerHeight = 450;
      const viewportHeight = window.innerHeight;

      const minY = (navbarHeight / viewportHeight) * 10;
      const maxY = 10 - (footerHeight / viewportHeight) * 10;

      const geometry = new THREE.TetrahedronGeometry(0.2, 0);

      const corners = [
        { x: -4, y: 3 },
        { x: 4, y: 3 },
        { x: -4, y: 0 },
        { x: 4, y: 0 },
      ];

      corners.forEach((corner) => {
        for (let i = 0; i < 16; i++) {
          const material = new THREE.MeshBasicMaterial({
            color: colors[i % colors.length],
            transparent: true,
            opacity: 0.15,
          });

          const particle = new THREE.Mesh(geometry, material);

          particle.position.set(
            corner.x + (Math.random() - 0.5) * 2,
            corner.y + (Math.random() - 0.5) * 1.5,
            (Math.random() - 0.5) * 2
          );

          particle.scale.set(1, 1.5, 1);

          scene.add(particle);
          particlesRef.current.push({
            mesh: particle,
            baseX: corner.x,
            baseY: corner.y,
            offsetX: particle.position.x - corner.x,
            offsetY: particle.position.y - corner.y,
            speed: 0.001 + Math.random() * 0.0005,
            angle: Math.random() * Math.PI * 2,
            originalOpacity: 0.15,
            targetOpacity: 0.15,
          });
        }
      });
    };

    createParticles();

    // 處理視窗大小變化
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;

      const camera = cameraRef.current;
      const renderer = rendererRef.current;

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

      const navbarHeight = 120;
      const footerHeight = 450;
      const viewportHeight = window.innerHeight;

      const minY = (navbarHeight / viewportHeight) * 10;
      const maxY = 10 - (footerHeight / viewportHeight) * 10;

      particlesRef.current.forEach((particle) => {
        if (particle.baseY < minY || particle.baseY > maxY) {
          particle.baseY = Math.random() * (maxY - minY) + minY;
        }
      });
    };

    // 處理滑鼠移動
    const handleMouseMove = (event) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    // 動畫循環
    const animate = () => {
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

      animationFrameId = requestAnimationFrame(animate);

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

      particlesRef.current.forEach((particle) => {
        particle.mesh.rotation.x += 0.001;
        particle.mesh.rotation.y += 0.001;

        const distanceToMouse = Math.sqrt(
          Math.pow(particle.mesh.position.x - mouseRef.current.x * 5, 2) +
          Math.pow(particle.mesh.position.y - mouseRef.current.y * 3, 2)
        );

        particle.targetOpacity = distanceToMouse < 2 ? 0.25 : 0.15;
        particle.mesh.material.opacity += (particle.targetOpacity - particle.mesh.material.opacity) * 0.05;

        const moveFactor = distanceToMouse < 3 ? 0.9 : 1.1;
        particle.angle += particle.speed * moveFactor;
        const baseX = particle.baseX + Math.cos(particle.angle) * 1.5;
        const baseY = particle.baseY + Math.sin(particle.angle) * 1.2;

        if (distanceToMouse < 3) {
          particle.mesh.position.x += (baseX + (mouseRef.current.x * 5 - baseX) * 0.15 - particle.mesh.position.x) * 0.05;
          particle.mesh.position.y += (baseY + (mouseRef.current.y * 3 - baseY) * 0.15 - particle.mesh.position.y) * 0.05;
        } else {
          particle.mesh.position.x += (baseX - particle.mesh.position.x) * 0.05;
          particle.mesh.position.y += (baseY - particle.mesh.position.y) * 0.05;
        }
      });

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    animate();

    // 清理函數
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (containerRef.current && rendererRef.current?.domElement) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
      // 清理所有引用
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      particlesRef.current = [];
    };
  }, [isClient]);

  if (!isClient) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        background: "transparent",
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0
      }}
    />
  );
};

export default AnimatedBackground;