// src/components/preview/StlBlock.jsx v6.0
/*
 * 파일 설명: Three.js의 STLLoader가 ArrayBuffer를 이진 데이터(Binary)로 오인하여 발생하는 RangeError(메모리 초과 할당)를 해결하기 위해, 순수 문자열(String)을 직접 파싱하도록 수정된 렌더러 컴포넌트입니다.
 * 연결 위치: src/components/Preview.jsx 내부 CodeBlock 컴포넌트
 */
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const StlBlock = ({ stlString }) => {
  const mountRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    console.log("[StlBlock v6.0] STL 렌더링 이펙트 시작");
    if (!mountRef.current || !stlString) {
      console.log("[StlBlock v6.0] 마운트 요소 또는 STL 문자열이 없어 렌더링을 중지합니다.");
      return;
    }

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f6f8fa');

    const gridHelper = new THREE.GridHelper(10, 10, '#d0d7de', '#e1e4e8');
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 2.0);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    let animationId;

    try {
      console.log("[StlBlock v6.0] STLLoader를 통한 문자열 동기식 파싱 시도");
      const loader = new STLLoader();
      
      // [핵심 해결] ArrayBuffer 변환을 제거하고 순수 ASCII 문자열을 그대로 전달하여 이진 파싱(parseBinary)으로 넘어가는 버그를 원천 차단합니다.
      const geometry = loader.parse(stlString);
      
      if (!geometry || !geometry.attributes.position || geometry.attributes.position.count === 0) {
        throw new Error("유효한 정점(Vertex) 데이터가 존재하지 않습니다.");
      }

      geometry.computeVertexNormals();
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();

      const center = new THREE.Vector3();
      geometry.boundingBox.getCenter(center);
      geometry.translate(-center.x, -center.y, -center.z);

      const material = new THREE.MeshStandardMaterial({
        color: '#0969da',
        metalness: 0.2,
        roughness: 0.5,
        side: THREE.DoubleSide
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const radius = geometry.boundingSphere ? geometry.boundingSphere.radius : 1;
      const safeRadius = (isNaN(radius) || radius === 0) ? 1 : radius;
      const distance = Math.max(safeRadius * 3, 3);
      
      camera.position.set(distance, distance, distance);
      camera.lookAt(0, 0, 0);
      controls.target.set(0, 0, 0);
      controls.update();

      console.log("[StlBlock v6.0] 렌더링 씬 구성 완료. 에러 상태 해제.");
      setError(false);
    } catch (err) {
      console.log("[StlBlock v6.0] STL 구문 파싱 에러 감지 (불완전한 문자열):", err);
      setError(true);
    }

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    
    if (!error) {
      console.log("[StlBlock v6.0] 애니메이션 루프 가동");
      animate();
    }

    const handleResize = () => {
      if (!mountRef.current) return;
      console.log("[StlBlock v6.0] 브라우저 리사이즈 이벤트 감지");
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      console.log("[StlBlock v6.0] 컴포넌트 언마운트 - 리소스 정리 수행");
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [stlString, error]);

  if (error) {
    console.log("[StlBlock v6.0] 에러 UI 렌더링");
    return (
      <div style={{ height: '400px', margin: '16px 0', border: '1px solid rgba(207,34,46,0.3)', borderRadius: '6px', backgroundColor: '#ffebe9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#cf222e' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}>
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
        <span style={{ fontSize: '14px', fontWeight: '500' }}>STL 문법 오류 (렌더링 중단)</span>
        <span style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>올바른 ASCII STL 구조를 완성해 주세요.</span>
      </div>
    );
  }

  console.log("[StlBlock v6.0] 정상 3D 캔버스 UI 렌더링");
  return (
    <div 
      ref={mountRef} 
      style={{ width: '100%', height: '400px', margin: '16px 0', borderRadius: '6px', overflow: 'hidden', border: '1px solid #d0d7de', cursor: 'grab' }} 
      onMouseDown={(e) => {
        console.log("[StlBlock v6.0] 마우스 다운 이벤트 감지 - 커서 상태 변경 (grabbing)");
        e.currentTarget.style.cursor = 'grabbing';
      }}
      onMouseUp={(e) => {
        console.log("[StlBlock v6.0] 마우스 업 이벤트 감지 - 커서 상태 변경 (grab)");
        e.currentTarget.style.cursor = 'grab';
      }}
    />
  );
};

export default StlBlock;