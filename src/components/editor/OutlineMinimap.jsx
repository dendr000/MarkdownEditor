// src/components/editor/OutlineMinimap.jsx v1.1
/*
 * 파일 설명: 추출된 목차 데이터를 기반으로 에디터 우측 상단에 렌더링되는 아웃라인 내비게이션 패널입니다. 노드 클릭 시 textarea의 스크롤을 해당 위치로 이동시킵니다.
 * (v1.1 수정사항): 텍스트 중앙 정렬 상속 버그 해결(textAlign: 'left' 강제 적용) 및 목차 간격(padding, gap) 축소.
 * 연결 위치: src/components/editor/Editor.jsx 내부
 */
import React from 'react';
import { ListTree, X } from 'lucide-react';

function OutlineMinimap({ outline, textareaRef, isOpen, onClose }) {
  if (!isOpen) return null;

  const handleScrollToNode = (charIndex) => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(charIndex, charIndex);
    }
  };

  return (
    <div style={{ 
      position: 'absolute', 
      top: '60px', 
      right: '24px', 
      width: '260px', 
      maxHeight: 'calc(100% - 80px)', 
      backgroundColor: '#ffffff', 
      border: '1px solid #d0d7de', 
      borderRadius: '6px', 
      display: 'flex', 
      flexDirection: 'column', 
      boxShadow: '0 8px 24px rgba(140,149,159,0.2)', 
      zIndex: 100, 
      overflow: 'hidden' 
    }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #d0d7de', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f6f8fa' }}>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#24292f', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ListTree size={14} /> 문서 개요
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#57606a' }}>
          <X size={14} />
        </button>
      </div>
      
      {/* 컨테이너의 상하 여백 및 항목 간 gap을 4px에서 2px로 축소 */}
      <div style={{ padding: '8px 12px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {outline.length === 0 ? (
          <span style={{ fontSize: '12px', color: '#8c959f', textAlign: 'center', padding: '20px 0' }}>작성된 제목(#)이 없습니다.</span>
        ) : (
          outline.map(node => (
            <div 
              key={node.id}
              onClick={() => handleScrollToNode(node.charIndex)}
              style={{ 
                fontSize: '12px', 
                color: '#0969da', 
                cursor: 'pointer', 
                // 아이템 내부 상하 패딩을 6px에서 4px로 축소
                padding: '4px 8px', 
                marginLeft: `${(node.level - 1) * 12}px`, 
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textAlign: 'left', // 중앙 정렬 상속 붕괴 방지
                transition: 'background-color 0.1s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              title={node.text}
            >
              {node.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default OutlineMinimap;