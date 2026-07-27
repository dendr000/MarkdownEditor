// src/components/explorer/NodeTooltip.jsx v1.0
/*
 * 파일 위치: src/components/explorer/NodeTooltip.jsx
 * 연결 위치: src/components/explorer/ExplorerTreeNode.jsx 내부 노드 하단 팝업 렌더링
 * 기능 요약: 탐색기 항목에 마우스 호버 시 노출되는 상대 경로 표시 및 클립보드 복사 기능을 전담하는 툴팁 컴포넌트입니다.
 */
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

function NodeTooltip({ relativePath, nodePath, onTooltipOpen, onTooltipClose }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (relativePath) {
      navigator.clipboard.writeText(relativePath).then(() => {
        console.log(`[NodeTooltip v1.0] 상대 경로 복사 완료: ${relativePath}`);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  return (
    <div 
      style={{
        position: 'absolute',
        top: '100%',
        left: '0', 
        paddingTop: '4px', 
        zIndex: 1000,
        width: 'max-content',
        maxWidth: '210px'
      }}
      onMouseEnter={() => {
        console.log(`[NodeTooltip v1.0] 툴팁 호버 유지 - 경로: ${nodePath}`);
        onTooltipOpen(nodePath);
      }} 
      onMouseLeave={() => {
        console.log(`[NodeTooltip v1.0] 툴팁 마우스 아웃`);
        onTooltipClose();
      }}
      onClick={(e) => e.stopPropagation()} 
    >
      <div 
        onClick={handleCopy}
        title="클릭하여 상대 경로 복사"
        style={{
          backgroundColor: 'var(--text-main, #24292f)',
          color: 'var(--bg-main, #ffffff)',
          padding: '6px 10px',
          borderRadius: '6px',
          fontSize: '11px',
          whiteSpace: 'normal',
          wordBreak: 'break-all',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: '1px solid var(--border-color, #57606a)',
          lineHeight: '1.4',
          cursor: 'pointer'
        }}
      >
        <span style={{ flex: 1 }}>{relativePath}</span>
        <button 
          style={{
            background: 'none',
            border: 'none',
            color: isCopied ? '#2da44e' : 'var(--text-muted, #8c959f)',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s',
            flexShrink: 0,
            pointerEvents: 'none'
          }}
        >
          {isCopied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}

export default NodeTooltip;