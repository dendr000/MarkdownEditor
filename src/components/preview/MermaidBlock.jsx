// src/components/preview/MermaidBlock.jsx v1.0
/*
 * 파일 설명: Mermaid 문법 텍스트를 비동기 파싱하여 SVG 다이어그램으로 변환 및 렌더링하는 컴포넌트입니다.
 * 연결 위치: src/components/Preview.jsx 내부 CodeBlock 컴포넌트
 */
import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// 전역 Mermaid 초기화 설정
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'inherit'
});

const MermaidBlock = ({ chart }) => {
  const containerRef = useRef(null);
  const [svgContent, setSvgContent] = useState('');

  useEffect(() => {
    const renderChart = async () => {
      console.log("[MermaidBlock] 다이어그램 파싱 연산 시작");
      try {
        // 페이지 내 여러 다이어그램 렌더링 시 DOM ID 충돌을 방지하기 위한 난수 생성
        const id = `mermaid-svg-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvgContent(svg);
        console.log("[MermaidBlock] SVG 렌더링 완료");
      } catch (error) {
        console.error('[MermaidBlock] 구문 분석 오류:', error);
        setSvgContent(`<div style="color: #cf222e; padding: 12px; background-color: #ffebe9; border: 1px solid rgba(207,34,46,0.2); border-radius: 6px; font-size: 13px;">다이어그램 구문 분석 오류가 발생했습니다.<br>문법을 확인해 주세요.</div>`);
      }
    };

    if (chart) {
      renderChart();
    }
  }, [chart]);

  return (
    <div
      ref={containerRef}
      className="mermaid-container"
      style={{ display: 'flex', justifyContent: 'center', margin: '16px 0', overflowX: 'auto' }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

export default MermaidBlock;