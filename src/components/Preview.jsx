// src/components/Preview.jsx v2.2
/*
 * 파일 위치: src/components/Preview.jsx
 * 연결 위치: src/App.jsx 내부에서 우측(또는 좌측 분할) 실시간 뷰어 영역에 렌더링됨
 * 기능 요약: 마크다운 텍스트를 HTML로 파싱하여 렌더링하는 실시간 뷰어 컴포넌트입니다.
 * (v2.2 수정사항): 일반 마크다운 파일(.md, .txt)이 아닌 개발 언어 파일(.java, .html 등)일 경우, 
 * 실시간 뷰어에서 자동으로 코드 블록(```)으로 감싸져 구문 강조가 적용되도록 가상 래핑 로직을 추가했습니다.
 */
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import CodeBlockRenderer from './preview/CodeBlockRenderer';
import LinkRenderer from './preview/LinkRenderer';
import 'katex/dist/katex.min.css';
import 'github-markdown-css/github-markdown.css';
import './Preview.css';

function Preview({ markdown, selectedFile, onSelectFile, previewRef }) {
  console.log("[Preview v2.2] 실시간 뷰어 렌더링 시작 (비 마크다운 파일 코드 블록 자동 래핑 적용)");

  // 파일 확장자 추출
  const ext = selectedFile ? selectedFile.split('.').pop().toLowerCase() : '';
  
  // 마크다운이나 일반 텍스트 파일이 아닌 경우 강제로 코드 블록 백틱 적용
  const isCodeFile = selectedFile && !['md', 'txt'].includes(ext);
  
  // 뷰어에 전달할 최종 텍스트 (원본 markdown 상태는 유지한 채 뷰어 렌더링용으로만 가공)
  const displayMarkdown = isCodeFile ? `\`\`\`${ext}\n${markdown}\n\`\`\`` : markdown;

  return (
    <div className="preview-container" ref={previewRef}>
      <div className={`preview-content markdown-body ${isCodeFile ? 'code-file-view' : ''}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeRaw, rehypeKatex]}
          components={{
            code: CodeBlockRenderer,
            a: (props) => <LinkRenderer {...props} currentFile={selectedFile} onSelectFile={onSelectFile} />
          }}
        >
          {displayMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default Preview;