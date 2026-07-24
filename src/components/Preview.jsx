// src/components/Preview.jsx v2.3
/*
 * 파일 위치: src/components/Preview.jsx
 * 연결 위치: src/App.jsx 내부에서 우측(또는 분할) 실시간 뷰어 영역에 렌더링됨
 * 기능 요약: 마크다운 텍스트를 HTML로 파싱하여 렌더링하는 실시간 뷰어 컴포넌트입니다.
 * (v2.3 수정사항): 마크다운 렌더링이 붕괴되는 현상을 해결하기 위해 github-markdown-css 임포트와 
 * markdown-body 래퍼 클래스를 복구했으며, 코드 파일(java, json 등)의 줄바꿈 뭉개짐을 방지하는 CSS를 인라인으로 강제했습니다.
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
import 'github-markdown-css/github-markdown.css'; // [핵심 복구] 깃허브 마크다운 기본 뼈대 CSS
import './Preview.css';

function Preview({ markdown, selectedFile, onSelectFile, previewRef }) {
  const fileExt = selectedFile ? selectedFile.split('.').pop().toLowerCase() : 'md';
  
  const codeExtensions = [
    'java', 'py', 'c', 'cpp', 'cs', 'go', 'rb', 'php', 'sh', 
    'yaml', 'yml', 'xml', 'ini', 'env', 'properties', 'bat', 'cmd', 
    'json', 'html', 'css', 'js', 'jsx', 'ts', 'tsx'
  ];

  if (codeExtensions.includes(fileExt)) {
    console.log(`[Preview v2.3] 개발 코드 파일(${fileExt}) 감지, 마크다운 파서를 우회하여 직접 렌더링합니다.`);
    return (
      <div className="preview-container" ref={previewRef}>
        <div className="preview-content code-file-view" style={{ padding: '16px', backgroundColor: '#f6f8fa', height: '100%', overflow: 'auto', textAlign: 'left' }}>
          {/* [핵심 수정] HTML 기본 동작으로 인해 줄바꿈이 무시되는 것을 막기 위해 whiteSpace: pre-wrap을 강제합니다. */}
          <pre style={{ margin: 0, padding: 0, backgroundColor: 'transparent', border: 'none', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            <CodeBlockRenderer className={`language-${fileExt}`} inline={false}>
              {markdown}
            </CodeBlockRenderer>
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-container" ref={previewRef}>
      {/* [핵심 복구] markdown-body 클래스가 있어야 마크다운 문서 레이아웃과 폰트 크기가 정상적으로 렌더링됩니다. */}
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