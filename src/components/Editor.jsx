// src/components/Editor.jsx v1.1
/* 
 * 파일 설명: 마크다운 텍스트를 작성하는 에디터 영역 및 서식 지정 툴바 컴포넌트 
 * 연결 위치: App.jsx에서 에디터 영역으로 렌더링되며, Editor.css로 스타일이 적용됨
 */
import { useRef } from 'react';
import './Editor.css';

function Editor({ markdown, setMarkdown }) {
  console.log("Editor 컴포넌트(v1.1) 렌더링 시작");
  
  // textarea DOM 요소에 직접 접근하여 커서 위치 및 드래그 영역을 확인하기 위한 ref
  const textareaRef = useRef(null);

  // 드래그한 텍스트 양끝에 마크다운 문법을 추가하는 함수
  const handleFormat = (prefix, suffix = '') => {
    console.log("handleFormat 함수 실행. prefix:", prefix, "suffix:", suffix);
    
    if (!textareaRef.current) {
      console.log("textareaRef가 할당되지 않아 처리를 중단함");
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);

    console.log("선택된 텍스트 정보 추출 - 시작점:", start, "종료점:", end, "내용:", selectedText);

    // 드래그 영역 기준 앞, 뒤 텍스트 분리
    const beforeText = markdown.substring(0, start);
    const afterText = markdown.substring(end);

    // 문법 요소와 기존 텍스트 병합
    const newText = beforeText + prefix + selectedText + suffix + afterText;
    
    console.log("병합된 새 마크다운 상태 업데이트 호출");
    setMarkdown(newText);

    // 상태 업데이트 후 렌더링 사이클이 끝난 뒤 커서 위치를 재조정하기 위해 setTimeout 사용
    setTimeout(() => {
      console.log("커서 포커스 복원 및 선택 영역 재설정 로직 실행");
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  return (
    <div className="editor-container">
      <div className="editor-toolbar">
        <button onClick={() => { console.log("H1 버튼 클릭"); handleFormat('# '); }} title="제목 1">H1</button>
        <button onClick={() => { console.log("H2 버튼 클릭"); handleFormat('## '); }} title="제목 2">H2</button>
        <button onClick={() => { console.log("H3 버튼 클릭"); handleFormat('### '); }} title="제목 3">H3</button>
        <button onClick={() => { console.log("볼드체 버튼 클릭"); handleFormat('**', '**'); }} title="굵게"><b>B</b></button>
        <button onClick={() => { console.log("이탤릭체 버튼 클릭"); handleFormat('*', '*'); }} title="기울임"><i>I</i></button>
        <button onClick={() => { console.log("취소선 버튼 클릭"); handleFormat('~~', '~~'); }} title="취소선"><strike>S</strike></button>
        <button onClick={() => { console.log("체크리스트 버튼 클릭"); handleFormat('- [ ] '); }} title="할 일">☑</button>
        <button onClick={() => { console.log("코드블록 버튼 클릭"); handleFormat('\n```\n', '\n```\n'); }} title="코드블록">Code</button>
      </div>
      <textarea
        ref={textareaRef}
        className="editor-textarea"
        value={markdown}
        onChange={(e) => {
          console.log("textarea 내용 변경 감지됨");
          setMarkdown(e.target.value);
        }}
        placeholder="여기에 마크다운을 작성하세요..."
        spellCheck="false"
      />
    </div>
  );
}

export default Editor;