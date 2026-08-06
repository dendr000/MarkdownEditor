// src/components/preview/CodeBlockRenderer.jsx v3.0
/*
 * 파일 설명: 마크다운 내부의 코드 블록을 언어에 맞춰 렌더링하고 코드 복사 기능을 제공하는 컴포넌트입니다.
 * (v3.0 수정사항): 임의로 추가된 다크 테마 및 줄 번호 기능을 완전히 제거하고 기본 테마(oneLight)로 복구했습니다.
 */
import React, { useState } from 'react';
import { copyToClipboard } from '../../utils/clipboard';
import { highlightCode } from '../../utils/editor/syntaxHighlighter';
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

  if (!inline) {
    const lang = match ? match[1] : 'text';
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
          /* react-markdown이 부모 레벨에서 이미 <pre>를 씌우므로 중복을 피하기 위해 제거하고 <code> 태그에 속성을 직접 부여합니다. */
          <code className="language-diff" style={{ display: 'block', padding: '16px', overflowX: 'auto', fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace', fontSize: '14px', lineHeight: '1.45' }}>
            {String(children).replace(/\n$/, '').split('\n').map((line, idx) => {
              if (line.startsWith('+')) return <span key={idx} className="diff-add">{line}</span>;
              if (line.startsWith('-')) return <span key={idx} className="diff-remove">{line}</span>;
              if (line.startsWith('!')) return <span key={idx} className="diff-change">{line}</span>;
              return <span key={idx} className="diff-normal" style={{ display: 'block' }}>{line || ' '}</span>;
            })}
          </code>
        ) : match ? (
          /* 언어가 지정되어 있는 경우: 구문 강조 로직 파싱 */
          <code 
            className={`language-${lang}`}
            style={{ display: 'block', padding: '16px', overflowX: 'auto', fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace', fontSize: '14px', lineHeight: '1.45' }}
            dangerouslySetInnerHTML={{ __html: highlightCode(String(children).replace(/\n$/, ''), lang) }}
          />
        ) : (
          /* 언어가 지정되지 않은 일반 코드 블록인 경우: 원본 텍스트 그대로 출력 */
          <code 
            className={`language-${lang}`}
            style={{ display: 'block', padding: '16px', overflowX: 'auto', fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace', fontSize: '14px', lineHeight: '1.45' }}
          >
            {String(children).replace(/\n$/, '')}
          </code>
        )}
      </div>
    );
  }
  
  return (
    <code 
      className={className} 
      style={{ backgroundColor: '#f0f2f5', color: '#e83e8c', padding: '3px 6px', borderRadius: '4px', fontSize: '85%' }} 
      {...props}
    >
      {children}
    </code>
  );
}

export default CodeBlockRenderer;