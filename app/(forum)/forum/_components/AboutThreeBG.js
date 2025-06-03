"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// 產生鵝卵石型橢圓體
function createPebbleGeometry() {
  const geo = new THREE.SphereGeometry(0.4 + Math.random() * 0.5, 24, 24);
  // 隨機 scale 產生橢圓/鵝卵石感
  const sx = 0.08 + Math.random() * 1.2;
  const sy = 0.05 + Math.random() * 1.1;
  const sz = 0.08 + Math.random() * 1.2;
  geo.scale(sx, sy, sz);
  return geo;
}

const AboutThreeBG = ({ foregroundOnly = false }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // 場景
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 相機
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 8;
    cameraRef.current = camera;

    // 渲染器
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 顏色
    const colors = [
      "#AFC16D", // 主綠
      "#101828", // 主黑
      "#F0F0F0", // 主灰
      "#FBF9FA", // 主白
      "#b85e39", // 輔色
      "#f49269",
      "#ffc99d",
      "#f2fedc",
    ];

    // 粒子
    const createParticles = () => {
      const navbarHeight = 70; // 假設 navbar 高度為 80px
      const footerHeight = 400; // 假設 footer 高度為 100px
      const viewportHeight = window.innerHeight;

      for (let i = 0; i < 10; i++) {
        const geometry = createPebbleGeometry();
        const material = new THREE.MeshBasicMaterial({
          color: colors[i % colors.length],
          transparent: true,
          opacity: 0.13 + Math.random() * 0.07,
        });
        const mesh = new THREE.Mesh(geometry, material);

        // 計算粒子的垂直範圍
        const minY = navbarHeight / viewportHeight * 10;
        const maxY = 10 - footerHeight / viewportHeight * 10;

        // 隨機生成粒子的位置，限制在 minY 和 maxY 之間
        mesh.position.set(
          (Math.random() - 0.5) * 12,
          Math.random() * (maxY - minY) + minY,
          (Math.random() - 0.5) * 4
        );

        mesh.userData.baseScale = 1 + Math.random() * 0.7;
        mesh.scale.set(
          mesh.userData.baseScale,
          mesh.userData.baseScale,
          mesh.userData.baseScale
        );
        scene.add(mesh);
        particlesRef.current.push({
          mesh,
          speed: 0.0005 + Math.random() * 0.0007,
          direction: Math.random() > 0.5 ? 1 : -1,
          baseY: mesh.position.y,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };
    createParticles();

    // resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // animate
    const animate = () => {
      requestAnimationFrame(animate);
      const scrollY = window.scrollY || window.pageYOffset;
      const scaleFactor = 1 + Math.min(scrollY / 600, 1.5); // 最多放大到2.5倍

      particlesRef.current.forEach((p) => {
        // 緩慢上下浮動
        p.mesh.position.y =
          p.baseY +
          Math.sin(Date.now() * p.speed + p.phase) * 0.5 * p.direction;

        // // 根據粒子位置調整透明度
        // const navbarHeight = 80;
        // const footerHeight = 100;
        // const viewportHeight = window.innerHeight;
        // const minY = navbarHeight / viewportHeight * 10;
        // const maxY = 10 - footerHeight / viewportHeight * 10;

        // if (p.mesh.position.y < minY || p.mesh.position.y > maxY) {
        //   p.mesh.material.opacity = 0; // 隱藏超出範圍的粒子
        // } else {
        //   p.mesh.material.opacity = 0.13 + Math.random() * 0.07; // 恢復正常透明度
        // }

        // 緩慢旋轉
        p.mesh.rotation.x += 0.001 * p.direction;
        p.mesh.rotation.y += 0.001 * p.direction;

        // 根據 scrollY 放大
        const s = p.mesh.userData.baseScale * scaleFactor;
        p.mesh.scale.set(s, s, s);
      });

      renderer.render(scene, camera);
    };
    animate();

    // cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      scene.clear();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={
        foregroundOnly
          ? "absolute inset-0 pointer-events-none z-30"
          : "fixed inset-0 pointer-events-none z-0"
      }
      style={{ background: "transparent" }}
    />
  );
};

export default AboutThreeBG;