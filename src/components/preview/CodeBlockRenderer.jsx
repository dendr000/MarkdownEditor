// src/components/preview/CodeBlockRenderer.jsx v1.0
/*
 * 파일 설명: 마크다운 내부의 코드 블록을 언어(language)에 맞춰 렌더링하고 코드 복사 기능을 제공하는 컴포넌트입니다.
 * Preview.jsx에서 분리되었습니다.
 * 연결 위치: src/components/Preview.jsx 내부
 */
import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { copyToClipboard } from '../../utils/clipboard';
import MermaidBlock from './MermaidBlock';
import GeoJsonBlock from './GeoJsonBlock';
import StlBlock from './StlBlock';

function CodeBlockRenderer({ inline, className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || '');
  const [isCopied, setIsCopied] = useState(false);

  const handleCodeCopy = async () => {
    const codeText = String(children).replace(/\n$/, '');
    const success = await copyToClipboard(codeText);
    
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (!inline && match) {
    const lang = match[1];
    const isDiff = lang === 'diff';
    const isMermaid = lang === 'mermaid';
    const isGeoJson = lang === 'geojson' || lang === 'topojson';
    const isStl = lang === 'stl';

    if (isMermaid || isGeoJson || isStl) {
      return (
        <div className="code-block-wrapper">
          <button className="code-copy-btn" onClick={handleCodeCopy} title="코드 복사">
            {isCopied ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2da44e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            )}
          </button>
          {isMermaid && <MermaidBlock chart={String(children)} />}
          {isGeoJson && <GeoJsonBlock dataString={String(children)} isTopoJson={lang === 'topojson'} />}
          {isStl && <StlBlock stlString={String(children)} />}
        </div>
      );
    }

    return (
      <div className="code-block-wrapper">
        <button className="code-copy-btn" onClick={handleCodeCopy} title="코드 복사">
          {isCopied ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2da44e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          )}
        </button>
        {isDiff ? (
          <pre className="language-diff" style={{ backgroundColor: '#f6f8fa', padding: '16px', borderRadius: '6px', overflowX: 'auto', fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace', fontSize: '14px', lineHeight: '1.45' }}>
            <code className="language-diff">
              {String(children).replace(/\n$/, '').split('\n').map((line, idx) => {
                if (line.startsWith('+')) return <span key={idx} className="diff-add">{line}</span>;
                if (line.startsWith('-')) return <span key={idx} className="diff-remove">{line}</span>;
                if (line.startsWith('!')) return <span key={idx} className="diff-change">{line}</span>;
                return <span key={idx} className="diff-normal" style={{ display: 'block' }}>{line || ' '}</span>;
              })}
            </code>
          </pre>
        ) : (
          <SyntaxHighlighter
            style={oneLight}
            language={lang}
            PreTag="div"
            customStyle={{ backgroundColor: 'transparent' }}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        )}
      </div>
    );
  }
  
  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
}

export default CodeBlockRenderer;