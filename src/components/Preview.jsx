// src/components/Preview.jsx v2.0
/*
 * 파일 위치: src/components/Preview.jsx
 * 연결 위치: src/App.jsx 내부에서 우측(또는 분할) 실시간 뷰어 영역에 렌더링됨
 * 기능 요약: 마크다운 텍스트를 HTML로 파싱하여 렌더링하는 실시간 뷰어 컴포넌트입니다.
 * (v2.0 수정사항): java, js 등 개발 언어 파일이 열렸을 때, 4칸 들여쓰기로 인한 마크다운 파싱 오류(부분 회색 박스)를 
 * 방지하고 텍스트 전체에 구문 강조(Syntax Highlighting)가 적용되도록 자동 래핑 로직을 추가했습니다.
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
import './Preview.css';

function Preview({ markdown, selectedFile, onSelectFile, previewRef }) {
  // 1. 현재 열려있는 파일의 확장자를 소문자로 추출 (없으면 기본값 md)
  const fileExt = selectedFile ? selectedFile.split('.').pop().toLowerCase() : 'md';
  
  // 2. 구문 강조(색상)를 적용할 개발 코드 확장자 목록
  const codeExtensions = [
    'java', 'py', 'c', 'cpp', 'cs', 'go', 'rb', 'php', 'sh', 
    'yaml', 'yml', 'xml', 'ini', 'env', 'properties', 'bat', 'cmd', 
    'json', 'html', 'css', 'js', 'jsx', 'ts', 'tsx'
  ];

  // 3. 확장자에 따른 마크다운 문자열 전처리
  // 개발 파일일 경우 텍스트 전체를 마크다운 코드 블록(```확장자) 문법으로 감싸서 전달합니다.
  const displayContent = codeExtensions.includes(fileExt)
    ? `\`\`\`${fileExt}\n${markdown}\n\`\`\``
    : markdown;

  return (
    <div className="preview-container" ref={previewRef}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          code: CodeBlockRenderer,
          a: (props) => <LinkRenderer {...props} currentFile={selectedFile} onSelectFile={onSelectFile} />
        }}
      >
        {displayContent}
      </ReactMarkdown>
    </div>
  );
}

export default Preview;