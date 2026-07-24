// src/components/Preview.jsx v2.5
/*
 * 파일 설명: 마크다운 텍스트를 전달받아 깃허브 스타일로 렌더링하는 실시간 뷰어입니다.
 * (v2.5 수정사항): 에디터에서 스페이스 2개 줄바꿈을 직접 제어하므로 불필요해진 remark-breaks 플러그인을 제거했습니다.
 * 연결 위치: src/App.jsx 내부
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

// src/components/Preview.jsx 내부
// 현재 열려있는 파일의 경로를 기준으로 타겟 링크의 절대 경로를 연산하는 함수 (버전 1.1)
const resolvePath = (currentFilePath, targetPath) => {
  // 윈도우 환경의 역슬래시(\)를 슬래시(/)로 강제 정규화하여 경로 파싱 오류 방지
  const normalizedCurrent = currentFilePath.replace(/\\/g, '/');
  const normalizedTarget = targetPath.replace(/\\/g, '/');

  console.log(`[resolvePath v1.1] 경로 연산 시작 - 현재 파일: ${normalizedCurrent}, 타겟 경로: ${normalizedTarget}`);
  if (!normalizedTarget) {
    console.log(`[resolvePath v1.1] 타겟 경로가 존재하지 않아 빈 문자열을 반환합니다.`);
    return '';
  }
  
  // 최상단 루트(/)에서 시작하는 절대 경로일 경우
  if (normalizedTarget.startsWith('/')) {
    const absolutePath = normalizedTarget.substring(1);
    console.log(`[resolvePath v1.1] 최상단 루트 절대 경로 감지 - 반환 경로: ${absolutePath}`);
    return absolutePath;
  }
  
  // 현재 파일이 위치한 디렉토리 경로 추출
  const lastSlashIndex = normalizedCurrent.lastIndexOf('/');
  const currentDir = lastSlashIndex === -1 ? '' : normalizedCurrent.substring(0, lastSlashIndex);
  
  const currentParts = currentDir ? currentDir.split('/') : [];
  const targetParts = normalizedTarget.split('/');
  
  for (const part of targetParts) {
    if (part === '.' || part === '') {
      continue;
    } else if (part === '..') {
      // 상위 폴더로 이동
      if (currentParts.length > 0) currentParts.pop();
    } else {
      // 하위 폴더로 진입
      currentParts.push(part);
    }
  }
  const finalPath = currentParts.join('/');
  console.log(`[resolvePath v1.1] 경로 연산 완료 - 최종 경로: ${finalPath}`);
  return finalPath;
};

// 실시간 마크다운 뷰어 메인 컴포넌트 (버전 2.6)
function Preview({ markdown, selectedFile, onSelectFile }) {
  // 깃허브 스타일 마크다운 전처리 로직 실행
  const processedMarkdown = preprocessGitHubFlavored(markdown);
  
  console.log("[Preview v2.6] 실시간 마크다운 뷰어 렌더링 실행 - 내부 링크 인터셉트 기능 추가됨");

  return (
    <div className="preview-container">
      <div className="preview-content markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeRaw, rehypeKatex]}
          components={{
            code: CodeBlock,
            // a 태그 렌더링 시 클릭 이벤트를 가로채는 커스텀 로직 (v2.7 업데이트)
            a: ({ node, href, children, ...props }) => {
              const isInternal = href && !href.startsWith('http') && !href.startsWith('mailto:');
              let displayHref = href;

              // 새 탭 열기 등을 지원하기 위해, 마우스 오버 시 올바른 파라미터가 보이도록 href 속성을 강제로 덮어씌웁니다.
              if (isInternal) {
                const targetPath = resolvePath(selectedFile || '', href);
                displayHref = `?file=${encodeURIComponent(targetPath)}`;
              }
              
              const handleClick = (e) => {
                if (isInternal && onSelectFile) {
                  // 사용자가 Ctrl+클릭, Shift+클릭, 휠 클릭(새 탭 열기)을 시도한 경우 가로채지 않고 브라우저에 맡김
                  if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) {
                    return;
                  }
                  
                  e.preventDefault();
                  const targetPath = resolvePath(selectedFile || '', href);
                  console.log(`[Preview v2.7] 내부 링크 단순 클릭 감지 - 탭 내부 이동: ${targetPath}`);
                  onSelectFile(targetPath); 
                }
              };

              return (
                <a 
                  href={displayHref} 
                  onClick={handleClick} 
                  target={isInternal ? "_self" : "_blank"} 
                  rel={isInternal ? "" : "noopener noreferrer"} 
                  {...props}
                >
                  {children}
                </a>
              );
            }
          }}
        >
          {processedMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default Preview;