// src/components/editor/OutlineMinimap.jsx v2.1
/*
 * 파일 설명: 에디터 좌측에 고정되어 마우스 호버 시 스르륵 나타나는(Drawer) 목차(TOC) 내비게이션 컴포넌트입니다.
 * (v2.1 수정사항): 목차 클릭 시 에디터(textarea)뿐만 아니라 실시간 뷰어(Preview)의 DOM 요소로도 스크롤이 동기화되도록 연동 로직 추가.
 * 연결 위치: src/components/editor/Editor.jsx 내부
 */
import React, { useState } from 'react';

function OutlineMinimap({ outline, textareaRef }) {
  // 마우스 호버 상태를 관리하여 드로어의 슬라이드 인/아웃을 제어합니다.
  const [isHovered, setIsHovered] = useState(false);

  // 클릭 시 에디터 커서를 해당 위치로 이동시키고 실시간 뷰어의 스크롤도 동기화하는 로직
  const handleScrollToNode = (charIndex, text) => {
    console.log(`[OutlineMinimap v2.1] 목차 항목 클릭 - 텍스트: '${text}', charIndex: ${charIndex}`);

    // 1. 에디터(Textarea) 위치 이동
    const textarea = textareaRef.current;
    if (textarea) {
      console.log(`[OutlineMinimap v2.1] 에디터 스크롤 포커싱 실행`);
      textarea.focus();
      textarea.setSelectionRange(charIndex, charIndex);
      // 커서 위치로 스크롤을 확실히 강제하기 위해 blur 후 다시 focus 하는 트릭 사용
      textarea.blur();
      textarea.focus();
    }

    // 2. 실시간 뷰어(Preview) 스크롤 이동
    console.log(`[OutlineMinimap v2.1] 실시간 뷰어 DOM 스크롤 동기화 실행`);
    // 브라우저에 렌더링된 전체 헤더 태그(h1~h6)를 수집
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    for (const heading of headings) {
      // 목차의 텍스트와 뷰어에 렌더링된 텍스트가 일치하는 DOM 요소를 탐색
      if (heading.textContent.trim() === text.trim()) {
        console.log(`[OutlineMinimap v2.1] 일치하는 뷰어 DOM 엘리먼트 발견. 해당 위치로 부드럽게 스크롤 이동.`);
        heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break; // 가장 먼저 일치하는 하나만 스크롤 후 반복문 즉시 종료
      }
    }
  };

  return (
    <div 
      onMouseEnter={() => {
        console.log("[OutlineMinimap v2.1] 마우스 호버 감지 - TOC 패널 열림");
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        console.log("[OutlineMinimap v2.1] 마우스 이탈 감지 - TOC 패널 닫힘");
        setIsHovered(false);
      }}
      style={{
        position: 'fixed',
        left: isHovered ? '0px' : '-260px', // 호버되지 않았을 때는 패널 너비(260px)만큼 밖으로 숨김 처리
        top: '0',
        bottom: '0',
        width: '260px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #d0d7de',
        boxShadow: isHovered ? '4px 0 16px rgba(0,0,0,0.1)' : 'none',
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 패널을 열기 위한 햄버거(三) 모양의 트리거 탭 */}
      <div style={{
        position: 'absolute',
        right: '-32px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '32px',
        height: '56px',
        backgroundColor: '#ffffff',
        border: '1px solid #d0d7de',
        borderLeft: 'none',
        borderRadius: '0 8px 8px 0',
        boxShadow: '4px 0 8px rgba(0,0,0,0.05)',
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

      {/* TOC 헤더 영역 */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid #d0d7de', backgroundColor: '#f6f8fa' }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#24292f' }}>문서 목차 (TOC)</span>
      </div>
      
      {/* TOC 리스트 영역 */}
      <div style={{ padding: '12px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {outline.length === 0 ? (
          <span style={{ fontSize: '13px', color: '#8c959f', textAlign: 'center', padding: '20px 0' }}>작성된 제목(#)이 없습니다.</span>
        ) : (
          outline.map(node => (
            <div 
              key={node.id}
              onClick={() => handleScrollToNode(node.charIndex, node.text)} // 파라미터로 node.text 추가 전달
              style={{ 
                flexShrink: 0, // [버그 수정] 항목이 많아져도 컨테이너 안에서 높이가 찌그러져 글자가 잘리지 않도록 강제 고정
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