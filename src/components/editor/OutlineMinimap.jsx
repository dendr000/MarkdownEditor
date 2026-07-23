// src/components/editor/OutlineMinimap.jsx v2.2
/*
 * 파일 설명: 에디터 우측에 고정되어 마우스 호버 시 스르륵 나타나는(Drawer) 목차(TOC) 내비게이션 컴포넌트입니다.
 * (v2.2 수정사항): 3단 레이아웃 개편에 맞춰 고정 위치가 화면 우측(right)으로 변경되었습니다.
 * 연결 위치: src/App.jsx 내부
 */
import React, { useState } from 'react';

function OutlineMinimap({ outline, textareaRef }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleScrollToNode = (charIndex, text) => {
    console.log(`[OutlineMinimap v2.2] 목차 항목 클릭 - 텍스트: '${text}', charIndex: ${charIndex}`);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      textarea.setSelectionRange(charIndex, charIndex);
      textarea.blur();
      textarea.focus();
    }

    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    for (const heading of headings) {
      if (heading.textContent.trim() === text.trim()) {
        heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      }
    }
  };

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'absolute', // App.jsx의 workspace가 relative이므로 기준을 잡기 위해 absolute 사용
        right: isHovered ? '0px' : '-260px', // 화면 우측에 숨김
        top: '0',
        bottom: '0',
        width: '260px',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #d0d7de',
        boxShadow: isHovered ? '-4px 0 16px rgba(0,0,0,0.1)' : 'none',
        transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 탭 트리거 - 패널 좌측에 붙도록 수정 */}
      <div style={{
        position: 'absolute',
        left: '-32px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '32px',
        height: '56px',
        backgroundColor: '#ffffff',
        border: '1px solid #d0d7de',
        borderRight: 'none',
        borderRadius: '8px 0 0 8px',
        boxShadow: '-4px 0 8px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#57606a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </div>

      <div style={{ padding: '20px 16px', borderBottom: '1px solid #d0d7de', backgroundColor: '#f6f8fa' }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#24292f' }}>문서 목차 (TOC)</span>
      </div>
      
      <div style={{ padding: '12px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {(!outline || outline.length === 0) ? (
          <span style={{ fontSize: '13px', color: '#8c959f', textAlign: 'center', padding: '20px 0' }}>작성된 제목(#)이 없습니다.</span>
        ) : (
          outline.map(node => (
            <div 
              key={node.id}
              onClick={() => handleScrollToNode(node.charIndex, node.text)}
              style={{ 
                flexShrink: 0,
                fontSize: '13px', 
                color: '#0969da', 
                cursor: 'pointer', 
                padding: '6px 8px', 
                marginLeft: `${(node.level - 1) * 12}px`, 
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textAlign: 'left',
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