// src/components/Preview.jsx v2.3
/*
 * 파일 설명: 마크다운 텍스트를 전달받아 깃허브 스타일로 렌더링하는 실시간 뷰어입니다.
 * (v2.3) remark-math 및 rehype-katex 플러그인을 파이프라인에 주입하여 수학/통계 수식($$) 렌더링 기능을 추가했습니다.
 */
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math'; // 수식 마크다운 스캔 플러그인
import rehypeRaw from 'rehype-raw'; 
import rehypeKatex from 'rehype-katex'; // 수식 HTML/CSS 변환 렌더러
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
};

function Preview({ markdown }) {
  const processedMarkdown = preprocessGitHubFlavored(markdown);

  return (
    <div className="preview-container">
      <div className="preview-content markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeRaw, rehypeKatex]}
          components={{ code: CodeBlock }}
        >
          {processedMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default Preview;