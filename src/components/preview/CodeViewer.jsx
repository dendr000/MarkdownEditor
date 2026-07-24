// src/components/preview/CodeViewer.jsx v2.0
/*
 * 파일 위치: src/components/preview/CodeViewer.jsx
 * 기능 요약: 마크다운 파서를 완전히 배제하고 순수하게 코드 원문과 줄바꿈을 보여주기 위한 개발 파일 전용 뷰어입니다.
 */
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

function CodeViewer({ content, fileExt, previewRef }) {
  return (
    <div className="preview-container" ref={previewRef} style={{ backgroundColor: '#f6f8fa' }}>
      <div style={{ padding: '24px', height: '100%', overflow: 'auto', boxSizing: 'border-box', textAlign: 'left' }}>
        <SyntaxHighlighter
          style={oneLight}
          language={fileExt}
          PreTag="pre"
          showLineNumbers={true}
          customStyle={{ 
            backgroundColor: 'transparent', 
            margin: 0, 
            padding: 0, 
            fontSize: '14px',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace'
          }}
        >
          {content || ' '}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

export default CodeViewer;