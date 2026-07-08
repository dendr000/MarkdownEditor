// src/components/Preview.jsx v1.2
/* * 파일 설명: 실시간 뷰어 영역. 마크다운 렌더링, 코드 블록 구문 강조(Syntax Highlighting) 및 개별 복사 버튼 기능을 제공함
 * 연결 위치: src/App.jsx 파일에서 호출되며, src/components/Preview.css를 통해 스타일링됨 
 */
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// 깃허브와 유사한 밝은 테마 적용
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { copyToClipboard } from '../utils/clipboard';
import 'github-markdown-css/github-markdown.css'; 
import './Preview.css';

/* * 컴포넌트 설명: 마크다운 내부의 코드 블록(```)을 감지하여 구문 강조와 복사 버튼을 렌더링하는 내부 컴포넌트 
 */
const CodeBlock = ({ inline, className, children, ...props }) => {
  console.log("CodeBlock 컴포넌트(v1.3) 렌더링 시작. inline 여부:", inline, "className:", className);
  
  // 언어 클래스(예: language-css)에서 언어 이름만 추출
  const match = /language-(\w+)/.exec(className || '');
  
  // 개별 코드 블록의 복사 성공 상태 관리
  const [isCopied, setIsCopied] = useState(false);

  // 복사 버튼 클릭 핸들러
  const handleCodeCopy = async () => {
    console.log("코드블록 내부 복사 버튼 클릭됨. 복사 대상 언어:", match ? match[1] : "지정되지 않음");
    // 끝에 붙는 불필요한 개행 문자 제거 후 문자열로 변환
    const codeText = String(children).replace(/\n$/, '');
    const success = await copyToClipboard(codeText);
    
    if (success) {
      console.log("코드블록 텍스트 복사 성공. 복사된 텍스트 길이:", codeText.length);
      setIsCopied(true);
      // 2초 후 복사 완료 상태 플래그 초기화
      setTimeout(() => {
        console.log("코드블록 복사 상태 플래그 초기화 완료 (원래 SVG 아이콘으로 복구)");
        setIsCopied(false);
      }, 2000);
    } else {
      console.log("코드블록 텍스트 복사 실패. 클립보드 API 권한 또는 기타 문제 발생");
    }
  };

  // 인라인 코드가 아니고 언어가 지정된 코드 블록일 경우에만 구문 강조 및 복사 버튼 적용
  if (!inline && match) {
    console.log("구문 강조가 적용된 코드 블록 렌더링. 언어:", match[1], "배경색 투명화 적용 완료");
    return (
      <div className="code-block-wrapper">
        <button className="code-copy-btn" onClick={handleCodeCopy} title="코드 복사">
          {/* 복사 성공 여부에 따라 체크 아이콘 또는 일반 복사 아이콘 렌더링 */}
          {isCopied ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2da44e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          )}
        </button>
        <SyntaxHighlighter
          style={oneLight}
          language={match[1]}
          PreTag="div"
          customStyle={{ backgroundColor: 'transparent' }} // 구문 강조 라이브러리의 기본 배경색을 투명으로 덮어씀
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    );
  }
  
  // 인라인 코드(`code`)이거나 언어가 지정되지 않은 경우 기본 code 태그 반환
  console.log("일반 인라인 코드 또는 언어 미지정 코드 렌더링 (구문 강조 및 복사 버튼 없음)");
  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
};

/* * 컴포넌트 설명: 마크다운 텍스트를 전달받아 HTML로 파싱하고 렌더링하는 실시간 뷰어 
 */
function Preview({ markdown }) {
  console.log("Preview 컴포넌트(v1.2) 렌더링 시작");
  return (
    <div className="preview-container">
      <div className="preview-content markdown-body">
        {/* components 속성을 통해 기본 code 태그 렌더링 방식을 커스텀 CodeBlock으로 덮어씌움 */}
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code: CodeBlock
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default Preview;