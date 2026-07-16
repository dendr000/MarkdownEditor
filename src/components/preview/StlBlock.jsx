// src/components/preview/StlBlock.jsx v1.0
/*
 * 파일 설명: ASCII STL 구문 문자열을 Blob 객체로 변환하여 대화형 3D 뷰어로 렌더링하는 컴포넌트입니다.
 * 연결 위치: src/components/Preview.jsx 내부 CodeBlock 컴포넌트
 */
import React, { useEffect, useState } from 'react';
import { StlViewer } from 'react-stl-viewer';

const StlBlock = ({ stlString }) => {
  console.log("[StlBlock v1.0] STL 3D 모델 렌더링 시작");
  const [url, setUrl] = useState('');

  useEffect(() => {
    console.log("[StlBlock v1.0] STL 문자열을 비동기 렌더링을 위한 Blob 데이터 객체로 변환합니다.");
    const blob = new Blob([stlString], { type: 'text/plain' });
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);

    return () => {
      console.log("[StlBlock v1.0] 언마운트 감지 - Blob 메모리 누수 방지용 URL 할당 해제 수행");
      URL.revokeObjectURL(objectUrl);
    };
  }, [stlString]);

  const style = {
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  };

  if (!url) {
    return <div style={{ padding: '12px', fontSize: '13px', color: '#57606a' }}>3D 모델 리소스를 불러오는 중입니다...</div>;
  }

  return (
    <div style={{ width: '100%', height: '400px', margin: '16px 0', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f6f8fa', border: '1px solid #d0d7de' }}>
      <StlViewer style={style} orbitControls shadows url={url} />
    </div>
  );
};

export default StlBlock;