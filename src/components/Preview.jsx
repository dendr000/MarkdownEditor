// src/components/Preview.jsx v2.4
/*
 * 파일 위치: src/components/Preview.jsx
 * 연결 위치: src/App.jsx 내부에서 우측(또는 분할) 실시간 뷰어 영역에 렌더링됨
 * 기능 요약: 마크다운 텍스트를 HTML로 파싱하여 렌더링하는 실시간 뷰어 컴포넌트입니다.
 * (v2.4 수정사항): 잔존해 있던 닫는 중괄호(}) 구문 오류를 수정하고, CodeViewer로 이관된 코드 렌더링 분기 로직을 완전히 제거하여 마크다운 전용으로 최적화했습니다.
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
  console.log("[Preview v2.4] 실시간 마크다운 뷰어 렌더링 실행 (코드 파일 렌더링은 CodeViewer로 이관됨)");
  
  return (
    <div className="preview-container" ref={previewRef}>
      <div className="preview-content markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeRaw, rehypeKatex]}
          components={{
            code: CodeBlockRenderer,
            a: (props) => <LinkRenderer {...props} currentFile={selectedFile} onSelectFile={onSelectFile} />
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default Preview;