// src/components/Preview.jsx
/*
 * 파일 위치: src/components/Preview.jsx
 * 연결 위치: src/App.jsx 내부에서 우측(또는 좌측 분할) 실시간 뷰어 영역에 렌더링됨
 * 기능 요약: 마크다운 텍스트를 HTML로 파싱하여 렌더링하는 실시간 뷰어 컴포넌트입니다.
 * 수정사항: java, yml 등 개발 코드 파일일 경우, 뷰어가 일반 텍스트로 오인하여 줄바꿈을 뭉개는 것을 
 * 방지하기 위해 내부적으로 텍스트 전체를 마크다운 코드 블록(```)으로 감싸서 렌더링합니다.
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
  // 1. 현재 열려있는 파일의 확장자를 소문자로 추출 (없으면 기본값 md)
  const fileExt = selectedFile ? selectedFile.split('.').pop().toLowerCase() : 'md';
  
  // 2. 구문 강조 및 줄바꿈 보존을 적용할 개발 코드 확장자 목록
  const codeExtensions = [
    'java', 'py', 'c', 'cpp', 'cs', 'go', 'rb', 'php', 'sh', 
    'yaml', 'yml', 'xml', 'ini', 'env', 'properties', 'bat', 'cmd', 
    'json', 'html', 'css', 'js', 'jsx', 'ts', 'tsx'
  ];

  // 3. 확장자에 따른 문자열 전처리
  // 개발 파일인 경우에만 텍스트의 앞뒤로 마크다운 코드 블록 문법을 자동으로 씌워줍니다.
  // 에디터(작업뷰)의 원본 데이터에는 영향을 주지 않으며, 오직 실시간 뷰어(왼쪽 화면)의 렌더링에만 적용됩니다.
  const displayContent = codeExtensions.includes(fileExt)
    ? `\`\`\`${fileExt}\n${markdown}\n\`\`\`` 
    : markdown;

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
          {displayContent}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default Preview;