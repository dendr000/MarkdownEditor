// src/components/preview/StlBlock.jsx v2.0
/*
 * 파일 설명: React 19 호환성 에러를 해결하기 위해 외부 래퍼 라이브러리 대신 순수 three.js 네이티브 API를 사용하여 구현한 3D STL 렌더러입니다.
 * 연결 위치: src/components/Preview.jsx 내부 CodeBlock 컴포넌트
 */
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const StlBlock = ({ stlString }) => {
  console.log("[StlBlock v2.0] three.js 기반 STL 3D 모델 렌더링 시작");
  const mountRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!mountRef.current || !stlString) return;

    // 1. 씬(Scene), 카메라, 렌더러 초기화
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f6f8fa'); // 깃허브 테마 배경색

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(3, 3, 3); // 카메라 기본 시점 설정

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    // 2. 조명 설정 (주변광 및 방향광)
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // 3. 컨트롤러 설정 (마우스 드래그 궤도 회전, 줌인/아웃 지원)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 4. STL 텍스트 파싱 및 메쉬(Mesh) 생성
    try {
      const loader = new STLLoader();
      const geometry = loader.parse(stlString); // ASCII 문자열 직접 파싱

      // 모델이 뷰포트 정중앙에 위치하도록 중심점 보정 좌표 연산
      geometry.computeBoundingBox();
      const boundingBox = geometry.boundingBox;
      const center = new THREE.Vector3();
      boundingBox.getCenter(center);
      geometry.translate(-center.x, -center.y, -center.z);

      // 재질 및 색상 지정 (깃허브 블루톤)
      const material = new THREE.MeshStandardMaterial({
        color: '#0969da',
        metalness: 0.3,
        roughness: 0.4,
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      setError(false);
    } catch (err) {
      console.error("[StlBlock v2.0] STL 파싱 에러:", err);
      setError(true);
    }

    // 5. 애니메이션 렌더링 루프 가동
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 6. 브라우저 크기 조절 대응
    const handleResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // 7. 클린업 (컴포넌트 소멸 시 메모리 누수 방지 처리)
    return () => {
      console.log("[StlBlock v2.0] 언마운트 감지 - 렌더러 메모리 해제 수행");
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [stlString]);

  if (error) {
    return <div style={{ color: '#cf222e', padding: '12px', backgroundColor: '#ffebe9', border: '1px solid rgba(207,34,46,0.2)', borderRadius: '6px', fontSize: '13px' }}>STL 모델을 렌더링할 수 없습니다. ASCII STL 포맷 문법을 확인해 주세요.</div>;
  }

  return (
    <div 
      ref={mountRef} 
      style={{ width: '100%', height: '400px', margin: '16px 0', borderRadius: '6px', overflow: 'hidden', border: '1px solid #d0d7de', cursor: 'grab' }} 
      onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
      onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
    />
  );
};

export default StlBlock;