// src/components/Preview.jsx v2.0
/*
 * 파일 위치: src/components/Preview.jsx
 * 연결 위치: src/App.jsx 내부에서 우측(또는 좌측 분할) 실시간 뷰어 영역에 렌더링됨
 * 기능 요약: 마크다운 텍스트를 HTML로 파싱하여 렌더링하는 실시간 뷰어 컴포넌트입니다.
 * (v2.0 수정사항): 백틱(```) 강제 래핑 로직을 제거하고 원래의 렌더링 방식으로 완전 롤백했습니다.
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
  console.log("[Preview v2.0] 실시간 뷰어 렌더링 시작 (롤백 적용)");

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