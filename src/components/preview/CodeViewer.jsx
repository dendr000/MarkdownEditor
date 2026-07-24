// src/components/preview/CodeViewer.jsx v1.2
/*
 * 파일 위치: src/components/preview/CodeViewer.jsx
 * 연결 위치: src/App.jsx
 * 기능 요약: 일반 마크다운 파일과 완전히 분리되어, java, json 등 개발 코드 파일만을 전담하여 
 * 구문 강조(Syntax Highlighting) 및 줄바꿈 보존을 렌더링하는 전용 실시간 뷰어입니다.
 * (v1.2 수정사항): PreTag를 div에서 pre로 변경하여 브라우저가 줄바꿈(\n)을 강제로 무시하는 현상 해결 및 가로 스크롤 적용.
 */
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

function CodeViewer({ content, fileExt, previewRef }) {
  // 렌더링 시마다 로그 출력
  console.log(`[CodeViewer v1.2] 개발 코드 전용 뷰어 렌더링 시작 - 확장자: ${fileExt}`);
  
  return (
    <div className="preview-container" ref={previewRef} style={{ backgroundColor: '#f6f8fa' }}>
      <div 
        className="preview-content code-file-view" 
        style={{ 
          padding: '24px', 
          height: '100%', 
          overflow: 'auto', 
          boxSizing: 'border-box',
          textAlign: 'left'
        }}
      >
        <SyntaxHighlighter
          style={oneLight}
          language={fileExt}
          PreTag="pre" // [수정] div에서 pre로 변경하여 줄바꿈(\n) 보존
          customStyle={{ 
            backgroundColor: 'transparent', 
            margin: 0, 
            padding: 0, 
            fontSize: '14px',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
            whiteSpace: 'pre' // [수정] 자동 줄바꿈을 해제하고 VSC, STS처럼 가로 스크롤 적용
          }}
        >
          {content || ' '}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export default CodeViewer;