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
import { preprocessGitHubFlavored } from '../utils/githubMarkdownParser';
import 'katex/dist/katex.min.css';
import 'github-markdown-css/github-markdown.css';
import './Preview.css';

function Preview({ markdown, selectedFile, onSelectFile, previewRef }) {
  console.log("[Preview v2.3] 실시간 뷰어 렌더링 시작 (GitHub 확장 문법 파이프라인 연결)");

  // 파일 확장자 추출 (경로 구분자 처리 및 확장자 존재 여부 엄격 확인)
  let ext = '';
  let isCodeFile = false;
  
  if (selectedFile) {
    const fileName = selectedFile.split('/').pop();
    // 파일명에 마침표(.)가 있는 경우에만 확장자를 추출 (확장자가 없는 폴더 뷰 등은 기본 마크다운으로 취급)
    if (fileName.includes('.')) {
      ext = fileName.split('.').pop().toLowerCase();
      // 마크다운이나 일반 텍스트 파일이 아닌 경우 강제로 코드 블록 백틱 적용 대상
      isCodeFile = !['md', 'txt'].includes(ext);
    }
  }
  
  // 에디터에서 입력된 특수 공백(Non-breaking space, \xA0)을 일반 공백(\x20)으로 정규화하여 표 렌더링 파서 오류 방지
  const sanitizedMarkdown = markdown ? markdown.replace(/\xA0/g, ' ') : '';
  
  // 1. 마크다운 파일일 경우 GitHub Alerts 등 확장 문법(HTML)으로 사전 파싱
  const processedMarkdown = isCodeFile ? sanitizedMarkdown : preprocessGitHubFlavored(sanitizedMarkdown);
  
  // 2. 뷰어에 전달할 최종 텍스트 가공
  const displayMarkdown = isCodeFile ? `\`\`\`${ext}\n${processedMarkdown}\n\`\`\`` : processedMarkdown;

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