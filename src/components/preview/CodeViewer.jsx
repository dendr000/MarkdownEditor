// src/components/preview/CodeViewer.jsx v1.0
/*
 * 파일 위치: src/components/preview/CodeViewer.jsx
 * 연결 위치: src/App.jsx
 * 기능 요약: 일반 마크다운 파일과 분리되어, java, json 등 개발 코드 파일만을 전담하여 
 * 구문 강조(Syntax Highlighting) 및 줄바꿈 보존을 처리하는 전용 실시간 뷰어입니다.
 */
import React from 'react';
import CodeBlockRenderer from './CodeBlockRenderer';

function CodeViewer({ content, fileExt, previewRef }) {
  console.log(`[CodeViewer v1.0] 개발 코드 전용 뷰어 렌더링 시작 - 확장자: ${fileExt}`);
  return (
    <div className="preview-container" ref={previewRef} style={{ backgroundColor: '#f6f8fa' }}>
      <div className="preview-content code-file-view" style={{ padding: '24px', height: '100%', overflow: 'auto', boxSizing: 'border-box' }}>
        <pre style={{ margin: 0, padding: 0, backgroundColor: 'transparent', border: 'none', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          <CodeBlockRenderer className={`language-${fileExt}`} inline={false}>
            {content}
          </CodeBlockRenderer>
        </pre>
      </div>
    </div>
  );
}

export default CodeViewer;