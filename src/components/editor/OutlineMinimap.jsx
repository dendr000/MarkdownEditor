// src/components/editor/OutlineMinimap.jsx v2.3
/*
 * 파일 설명: 에디터 우측에 고정되어 마우스 호버 시 스르륵 나타나는(Drawer) 목차(TOC) 내비게이션 컴포넌트입니다.
 * (v2.3 수정사항): 모든 하드코딩된 색상을 제거하고 CSS 변수(var) 체계에 병합하여 다크 테마 전환 시 배경과 텍스트 색상이 동기화되도록 수정했습니다.
 * 연결 위치: src/App.jsx 내부
 */
import React, { useState } from 'react';

function OutlineMinimap({ outline, textareaRef }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleScrollToNode = (charIndex, text) => {
    console.log(`[OutlineMinimap v2.3] 목차 항목 클릭 - 텍스트: '${text}', charIndex: ${charIndex}`);
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
        position: 'absolute', 
        right: isHovered ? '0px' : '-260px', 
        top: '0',
        bottom: '0',
        width: '260px',
        backgroundColor: 'var(--bg-main, #ffffff)', // [수정] 다크 테마 변수 적용
        borderLeft: '1px solid var(--border-color, #d0d7de)', // [수정] 다크 테마 변수 적용
        boxShadow: isHovered ? '-4px 0 16px rgba(0,0,0,0.2)' : 'none',
        transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 탭 트리거 */}
      <div style={{
        position: 'absolute',
        left: '-32px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '32px',
        height: '56px',
        backgroundColor: 'var(--bg-main, #ffffff)', // [수정] 다크 테마 변수 적용
        border: '1px solid var(--border-color, #d0d7de)', // [수정] 다크 테마 변수 적용
        borderRight: 'none',
        borderRadius: '8px 0 0 8px',
        boxShadow: '-4px 0 8px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted, #57606a)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </div>

      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border-color, #d0d7de)', backgroundColor: 'var(--explorer-bg, #f6f8fa)' }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main, #24292f)' }}>문서 목차 (TOC)</span>
      </div>
      
      <div style={{ padding: '12px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {(!outline || outline.length === 0) ? (
          <span style={{ fontSize: '13px', color: 'var(--text-muted, #8c959f)', textAlign: 'center', padding: '20px 0' }}>작성된 제목(#)이 없습니다.</span>
        ) : (
          outline.map(node => (
            <div 
              key={node.id}
              onClick={() => handleScrollToNode(node.charIndex, node.text)}
              style={{ 
                flexShrink: 0,
                fontSize: '13px', 
                color: 'var(--text-main, #24292f)', // [수정] 다크 테마 가독성을 위해 기본 폰트 색상으로 치환 
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
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(140, 149, 159, 0.15)'}
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