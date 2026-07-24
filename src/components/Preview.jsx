// src/components/Preview.jsx v2.7
/*
 * 파일 설명: 마크다운 텍스트를 전달받아 깃허브 스타일로 렌더링하는 실시간 뷰어 메인 컨테이너입니다.
 * (v2.7 수정사항): 코드 가독성을 위해 코드 블록 및 링크 인터셉트 로직을 별도 파일로 모듈화했습니다.
 * 연결 위치: src/App.jsx 내부
 */
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math'; 
import rehypeRaw from 'rehype-raw'; 
import rehypeKatex from 'rehype-katex'; 
import { preprocessGitHubFlavored } from '../utils/githubMarkdownParser'; 
import CodeBlockRenderer from './preview/CodeBlockRenderer';
import LinkRenderer, { resolvePath } from './preview/LinkRenderer';
import 'github-markdown-css/github-markdown.css'; 
import './Preview.css';

// previewRef 프롭스를 추가하여 App.jsx가 스크롤 이벤트를 제어할 수 있게 엽니다. [버전 2.8]
function Preview({ markdown, selectedFile, onSelectFile, previewRef }) {
  const processedMarkdown = preprocessGitHubFlavored(markdown);
  
  console.log("[Preview v2.8] 실시간 마크다운 뷰어 렌더링 실행 (스크롤 동기화 Ref 추가)");

  return (
    // previewRef를 스크롤이 발생하는 최상위 래퍼에 연결합니다.
    <div className="preview-container" ref={previewRef}>
      <div className="preview-content markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeRaw, rehypeKatex]}
          components={{
            code: CodeBlockRenderer,
            img: ({ node, src, alt, ...props }) => {
              const isExternal = src && (src.startsWith('http') || src.startsWith('data:'));
              let displaySrc = src;
              
              if (!isExternal) {
                const targetPath = resolvePath(selectedFile || '', src);
                displaySrc = `/api/raw?target=${encodeURIComponent(targetPath)}`;
                console.log(`[Preview v2.7] 이미지 경로 변환 - 원본: ${src}, 변환: ${displaySrc}`);
              }
              
              return <img src={displaySrc} alt={alt} style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }} {...props} />;
            },
            a: (props) => <LinkRenderer {...props} selectedFile={selectedFile} onSelectFile={onSelectFile} />
          }}
        >
          {processedMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default Preview;