// src/components/preview/MermaidBlock.jsx v3.0
/*
 * 파일 설명: Mermaid 문법을 파싱하여 SVG 다이어그램으로 렌더링하는 컴포넌트입니다.
 * 깃허브와 동일한 폰트 스택을 초기화 설정에 주입하여, 가로폭 오계산으로 인한 텍스트 잘림(Truncation) 버그와 폰트 불일치 현상을 해결했습니다.
 * 연결 위치: src/components/Preview.jsx 및 src/components/diagram/DiagramModal.jsx
 */
import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// [핵심 수정] 머메이드 엔진 초기화 설정에 깃허브 공식 폰트 스택을 주입하여 Bounding Box 계산 정확도 향상
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
  flowchart: {
    htmlLabels: true, // 마크다운 문자열 및 HTML 태그 렌더링 강제 활성화
  }
});

const MermaidBlock = ({ chart, onNodeClick }) => {
  const containerRef = useRef(null);
  const [svgContent, setSvgContent] = useState('');

  // 1. Mermaid 구문 파싱 및 SVG 문자열 생성
  useEffect(() => {
    const renderChart = async () => {
      console.log("[MermaidBlock v3.0] 다이어그램 파싱 연산 시작");
      try {
        const id = `mermaid-svg-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvgContent(svg);
        console.log("[MermaidBlock v3.0] SVG 렌더링 완료");
      } catch (error) {
        console.error('[MermaidBlock v3.0] 구문 분석 오류:', error);
        setSvgContent(`<div style="color: #cf222e; padding: 12px; background-color: #ffebe9; border: 1px solid rgba(207,34,46,0.2); border-radius: 6px; font-size: 13px;">다이어그램 구문 분석 오류가 발생했습니다.<br>문법을 확인해 주세요.</div>`);
      }
    };

    if (chart) {
      renderChart();
    }
  }, [chart]);

  // 2. SVG가 DOM에 삽입된 후 노드 요소를 탐색하여 클릭 이벤트 리스너 바인딩
  useEffect(() => {
    if (!svgContent || !containerRef.current || !onNodeClick) return;

    console.log("[MermaidBlock v3.0] 생성된 SVG DOM에서 상호작용 노드 탐색 시작");
    const nodes = containerRef.current.querySelectorAll('.node');
    
    const handleNodeClick = (e) => {
      const idAttr = e.currentTarget.getAttribute('id');
      if (idAttr) {
        // Mermaid가 생성하는 기본 ID 구조(flowchart-노드명-난수)에서 원본 노드명을 추출합니다.
        const parts = idAttr.split('-');
        if (parts.length >= 3) {
          const nodeId = parts.slice(1, -1).join('-');
          console.log("[MermaidBlock v3.0] 노드 클릭 감지. 추출된 대상 ID:", nodeId);
          onNodeClick(nodeId);
        }
      }
    };

    nodes.forEach(node => {
      node.style.cursor = 'pointer';
      node.addEventListener('click', handleNodeClick);
    });

    return () => {
      console.log("[MermaidBlock v3.0] 노드 클릭 이벤트 리스너 메모리 해제");
      nodes.forEach(node => node.removeEventListener('click', handleNodeClick));
    };
  }, [svgContent, onNodeClick]);

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