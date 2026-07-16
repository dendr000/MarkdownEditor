// src/components/Preview.jsx v2.2
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw'; 
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { copyToClipboard } from '../utils/clipboard';
import { preprocessGitHubFlavored } from '../utils/githubMarkdownParser'; 
import MermaidBlock from './preview/MermaidBlock';
import GeoJsonBlock from './preview/GeoJsonBlock';
import StlBlock from './preview/StlBlock';
import 'github-markdown-css/github-markdown.css'; 
import './Preview.css';

const CodeBlock = ({ inline, className, children, ...props }) => {
  console.log("CodeBlock 컴포넌트 렌더링 시작. inline 여부:", inline, "className:", className);
  
  const match = /language-(\w+)/.exec(className || '');
  const [isCopied, setIsCopied] = useState(false);

  const handleCodeCopy = async () => {
    console.log("코드블록 내부 복사 버튼 클릭됨. 복사 대상 언어:", match ? match[1] : "지정되지 않음");
    const codeText = String(children).replace(/\n$/, '');
    const success = await copyToClipboard(codeText);
    
    if (success) {
      console.log("코드블록 텍스트 복사 성공.");
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } else {
      console.log("코드블록 텍스트 복사 실패. 클립보드 API 권한 문제");
    }
  };

  if (!inline && match) {
    console.log("구문 강조가 적용된 코드 블록 렌더링. 언어:", match[1]);
    
    // 언어 식별자에 따른 분기 처리 (Diff, Mermaid, GeoJSON, TopoJSON, STL 지원)
    const lang = match[1];
    const isDiff = lang === 'diff';
    const isMermaid = lang === 'mermaid';
    const isGeoJson = lang === 'geojson' || lang === 'topojson';
    const isStl = lang === 'stl';

    // 특수 렌더링 블록 (Mermaid, GeoJSON, TopoJSON, STL)
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2da44e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          )}
        </button>
        {isDiff ? (
          // Diff 블록: [object Object] 버그를 방지하기 위해 원본 문자열을 직접 분해하여 렌더링
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
};

/* * 컴포넌트 설명: 마크다운 텍스트를 전달받아 깃허브 스타일로 렌더링하는 실시간 뷰어 */
function Preview({ markdown }) {
  console.log("Preview 컴포넌트(v2.2) 렌더링 시작");
  
  // 렌더링 직전 깃허브 특화 문법(Alerts)을 HTML로 사전 번역
  const processedMarkdown = preprocessGitHubFlavored(markdown);

  return (
    <div className="preview-container">
      <div className="preview-content markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{ code: CodeBlock }}
        >
          {processedMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default Preview;