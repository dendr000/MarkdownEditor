// src/components/Editor.jsx v1.4
/* * 파일 설명: 마크다운 텍스트를 작성하는 에디터 영역, 서식 지정 툴바 및 마크다운/HTML 표 모달을 포함하는 컴포넌트 
 * 연결 위치: App.jsx에서 에디터 영역으로 렌더링되며, TableModal.jsx 및 HtmlTableModal.jsx를 자식으로 포함함
 */
import { useRef, useState } from 'react';
import TableModal from './TableModal';
import HtmlTableModal from './HtmlTableModal'; // 새롭게 추가된 HTML 표 전용 모달 임포트
import './Editor.css';

function Editor({ markdown, setMarkdown }) {
  console.log("Editor 컴포넌트(v1.4) 렌더링 시작");
  
  // textarea DOM 요소에 직접 접근하여 커서 위치 및 드래그 영역을 확인하기 위한 ref
  const textareaRef = useRef(null);
  
  // 마크다운 표 모달과 HTML 표 모달의 열림/닫힘 상태를 각각 관리하는 State
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isHtmlTableModalOpen, setIsHtmlTableModalOpen] = useState(false);
  
  // 드래그된 텍스트와 드래그 영역의 시작/끝 인덱스를 저장하는 State
  const [selectedTableText, setSelectedTableText] = useState('');
  const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 });

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

  // 공통적으로 드래그된 텍스트를 추출하고 모달 상태를 준비하는 함수
  const prepareModalState = (modalType) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      console.log(`${modalType} 모달 열기 요청. 현재 선택 영역: ${start} ~ ${end}`);
      
      // 원본 드래그 영역을 정확히 대체하기 위해 범위를 저장
      setSelectionRange({ start, end });

      if (start !== end) {
        const text = markdown.substring(start, end);
        console.log("드래그된 텍스트 추출 완료. 모달로 전달될 텍스트:\n", text);
        setSelectedTableText(text);
      } else {
        console.log("드래그된 텍스트가 없습니다. 빈 문자열을 전달합니다.");
        setSelectedTableText('');
      }
    }
  };

  // 마크다운 표 버튼 클릭 핸들러
  const handleOpenTableModal = () => {
    prepareModalState('MD Table');
    setIsTableModalOpen(true);
  };

  // HTML 표 버튼 클릭 핸들러
  const handleOpenHtmlTableModal = () => {
    prepareModalState('HTML Table');
    setIsHtmlTableModalOpen(true);
  };

  // 모달에서 반환된 텍스트(마크다운 또는 HTML)를 저장해둔 커서 영역에 대체 삽입하는 함수
  const handleInsertTable = (tableOutput) => {
    console.log("handleInsertTable 함수 실행. 삽입할 텍스트:\n", tableOutput);
    
    if (!textareaRef.current) {
      console.log("textareaRef가 할당되지 않아 처리를 중단함");
      return;
    }

    const textarea = textareaRef.current;
    const { start, end } = selectionRange;

    // 저장된 영역을 기준으로 기존 텍스트 분리
    const beforeText = markdown.substring(0, start);
    const afterText = markdown.substring(end);

    // 기존 텍스트 사이에 표(MD 또는 HTML) 텍스트를 병합하여 선택 영역 전체 교체
    const newText = beforeText + tableOutput + afterText;
    
    console.log("기존 선택 영역이 표로 교체된 새 마크다운 상태 업데이트 호출");
    setMarkdown(newText);

    // 삽입 후 커서 위치를 표 바로 다음으로 조정하기 위해 setTimeout 사용
    setTimeout(() => {
      console.log("표 삽입 후 커서 포커스 복원 로직 실행");
      textarea.focus();
      const newCursorPos = start + tableOutput.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
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
        {/* 마크다운 표 버튼과 HTML 표 버튼 분리 배치 */}
        <button onClick={handleOpenTableModal} title="마크다운 표 삽입">MD Table</button>
        <button onClick={handleOpenHtmlTableModal} title="개별 정렬 지원 HTML 표 삽입">HTML Table</button>
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

      {/* 마크다운 표 생성 모달 */}
      <TableModal 
        isOpen={isTableModalOpen} 
        onClose={() => { console.log("MD 모달 닫기 콜백 실행"); setIsTableModalOpen(false); }} 
        onInsert={handleInsertTable} 
        initialTableMarkdown={selectedTableText}
      />

      {/* HTML 표 생성 모달 */}
      <HtmlTableModal 
        isOpen={isHtmlTableModalOpen} 
        onClose={() => { console.log("HTML 모달 닫기 콜백 실행"); setIsHtmlTableModalOpen(false); }} 
        onInsert={handleInsertTable} 
        initialTableHtml={selectedTableText}
      />
    </div>
  );
}

export default Editor;