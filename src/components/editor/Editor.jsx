// src/components/editor/Editor.jsx v3.0
import { useRef, useState } from 'react';
import { Table, FileCode2 } from 'lucide-react';
import TableModal from '../table/TableModal';
import HtmlTableModal from '../table/HtmlTableModal';
import { HeadingGroup, FormatGroup, ListGroup, MediaGroup, GithubGroup } from './toolbar/ToolbarGroups';
import './Editor.css'; 

function Editor({ markdown, setMarkdown }) {
  const textareaRef = useRef(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isHtmlTableModalOpen, setIsHtmlTableModalOpen] = useState(false);
  const [selectedTableText, setSelectedTableText] = useState('');
  const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 });
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleFormat = (prefix, suffix = '', isBlock = false) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);
    const beforeText = markdown.substring(0, start);
    const afterText = markdown.substring(end);

    let newText = '';
    let newCursorPos = 0;

    if (isBlock) {
      const defaultPlaceholder = '내용을 입력하세요';
      newText = beforeText + prefix + (selectedText || defaultPlaceholder) + suffix + afterText;
      newCursorPos = start + prefix.length + (selectedText ? selectedText.length : defaultPlaceholder.length);
    } else {
      newText = beforeText + prefix + selectedText + suffix + afterText;
      newCursorPos = start + prefix.length + selectedText.length;
    }
    
    setMarkdown(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, newCursorPos);
    }, 0);
  };

  const prepareModalState = (modalType) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      setSelectionRange({ start, end });
      setSelectedTableText(start !== end ? markdown.substring(start, end) : '');
    }
  };

  // 파일 드래그 오버 상태를 감지하여 CSS 테두리 및 배경색 피드백을 활성화하는 상태 선언
  const [isDragActive, setIsDragActive] = useState(false);

  // 드래그 대상이 에디터 텍스트 영역 위에 머무를 때의 기본 브라우저 파일 열기 동작 차단 및 활성 클래스 부여
  const handleDragOver = (e) => {
    e.preventDefault();
    console.log("[드래그 핸들러] 드래그 오버 상태 진입 - 브라우저 기본 동작 차단 완료");
    setIsDragActive(true);
  };

  // 드래그가 텍스트 영역을 벗어났을 때 상태값 비활성화 처리
  const handleDragLeave = () => {
    console.log("[드래그 핸들러] 드래그 영역 이탈 - 비활성 상태 전환 완료");
    setIsDragActive(false);
  };

  // 이미지 바이너리 파일을 비동기 FileReader를 이용해 Base64 텍스트 스트링으로 변환하고 에디터 커서 자리에 마크다운 이미지 태그 형식으로 삽입하는 함수
  const handleImageUpload = (file) => {
    console.log("[업로드 연계] 이미지 파싱 연산 진입 - 파일명:", file.name, "MIME 규격:", file.type);
    
    // 삽입 대상이 유효한 이미지 유형인지 MIME 타입을 1차 검증합니다.
    if (!file.type.startsWith('image/')) {
      console.log("[업로드 연계] 에러: 삽입 거부 - 파일 규격이 이미지(image/*) 형식이 아닙니다.");
      alert("이미지 포맷의 파일만 에디터 내에 즉시 삽입할 수 있습니다.");
      return;
    }

    const reader = new FileReader();
    
    // 파일 로드가 비동기적으로 마쳐진 시점에 데이터 주입 및 포커스 재설정을 수행합니다.
    reader.onload = (event) => {
      console.log("[FileReader] 파일 텍스트 스트림 인코딩 성공 - Base64 주소값 획득");
      const base64Data = event.target.result;
      const imageMarkdown = `![${file.name}](${base64Data})`;
      
      const textarea = textareaRef.current;
      if (!textarea) {
        console.log("[FileReader] 에러: textarea 엘리먼트 참조 인스턴스가 존재하지 않습니다.");
        return;
      }
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // 기존 원본 텍스트 구조를 분해하여 커서 시작점과 끝점 사이에 완성된 이미지 마크다운 구조를 체결합니다.
      const newText = markdown.substring(0, start) + imageMarkdown + markdown.substring(end);
      setMarkdown(newText);
      
      // 비동기 반영 이후 에디터 입력창에 포커스를 즉시 되돌리고 커서 위치를 주입된 문자 구조 맨 끝으로 수동 동기화합니다.
      setTimeout(() => {
        console.log("[FileReader] 텍스트 영역 데이터 갱신 완료 - 입력 타겟 포커스 재부여 및 커서 바인딩");
        textarea.focus();
        const nextCursorPos = start + imageMarkdown.length;
        textarea.setSelectionRange(nextCursorPos, nextCursorPos);
      }, 0);
    };

    // 로컬 디스크 상의 이미지 리소스를 Base64 데이터 스키마 URI 문자열 포맷으로 비동기 판독 처리합니다.
    reader.readAsDataURL(file);
  };

  // 드롭 영역 내에 파일 방출 시 파일 리스트를 배열화하여 첫 번째 물리 자산을 업로드 프로세서로 주입
  const handleDrop = (e) => {
    e.preventDefault();
    console.log("[드롭 핸들러] 파일 유실 감지 및 다운로드 차단 처리 완료");
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      console.log("[드롭 핸들러] 파일 추출 성공. 개수:", files.length, "- 업로드 연계 이관 진행");
      handleImageUpload(files[0]);
    } else {
      console.log("[드롭 핸들러] 드롭된 파일 정보 배열이 확인되지 않습니다.");
    }
  };

  // 클립보드 내에 저장되어 있던 이진 캡처 파일 또는 복사 이미지의 에디터 단축 입력 시 이벤트를 가로채 가상 임베딩 처리
  const handlePaste = (e) => {
    console.log("[붙여넣기 핸들러] 복사 붙여넣기 이벤트 감지 완료");
    const items = e.clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      // 클립보드 데이터 구조에서 파일이면서 실제 이미지 래스터 데이터의 특징을 지니고 있는지 탐색합니다.
      if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
        console.log("[붙여넣기 핸들러] 클립보드 내 파일 기반 이미지 노드 확인 성공 - 기본 브라우저 동작 중지");
        e.preventDefault(); // 단순 파일명 텍스트가 바인딩되는 동작 사전 무력화
        const file = items[i].getAsFile();
        handleImageUpload(file);
        break;
      }
    }
  };

  const handleInsertTable = (tableOutput) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const { start, end } = selectionRange;
    setMarkdown(markdown.substring(0, start) + tableOutput + markdown.substring(end));
    setTimeout(() => {
      textarea.focus();
      const newPos = start + tableOutput.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleKeyDown = (e) => {
    console.log("handleKeyDown 실행 - 키보드 입력 이벤트 감지 완료. 입력된 키:", e.key);
    
    if (e.key === 'Enter' && !e.shiftKey) {
      const textarea = textareaRef.current;
      if (!textarea) {
        console.log("[로그] textarea 인스턴스 참조 실패로 키 이벤트를 중단합니다.");
        return;
      }

      const start = textarea.selectionStart;
      const textBeforeCursor = markdown.substring(0, start);
      const lines = textBeforeCursor.split('\n');
      const currentLine = lines[lines.length - 1];

      console.log("[로그] 엔터 입력 활성화. 현재 커서 줄 내용 분석:", currentLine);

      // 정규식 수정: 인용문(>) 또는 글머리 기호(-)로 시작하는 패턴을 모두 감지합니다.
      const match = currentLine.match(/^([>-])\s*(.*)/);

      if (match) {
        e.preventDefault();
        const prefix = match[1]; // 추출된 기호 ('>' 또는 '-')
        const content = match[2].trim();

        if (content === '') {
          console.log(`[로그] 내용이 비어 있는 '${prefix}' 기호 감지 - 기호 제거 및 탈출 전개`);
          const lineStartIdx = start - currentLine.length;
          const newText = markdown.substring(0, lineStartIdx) + '\n' + markdown.substring(start);
          
          setMarkdown(newText);
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(lineStartIdx + 1, lineStartIdx + 1);
          }, 0);
        } else {
          console.log(`[로그] 내용이 포함된 '${prefix}' 줄 확인 - 다음 줄 자동 기호 주입 전개`);
          const afterText = markdown.substring(start);
          let injection = '';
          let cursorOffset = 0;

          // 기호 종류에 따라 주입할 문자열과 커서 이동 거리를 다르게 설정합니다.
          if (prefix === '>') {
            injection = '<br>\n> ';
            cursorOffset = 7; // <br>\n> 의 길이
          } else if (prefix === '-') {
            injection = '\n- ';
            cursorOffset = 3; // \n- 의 길이
          }

          const newText = textBeforeCursor + injection + afterText;
          
          setMarkdown(newText);
          setTimeout(() => {
            console.log(`[로그] 기호 자동 주입 완료. 커서를 ${cursorOffset}칸 뒤로 이동합니다.`);
            textarea.focus();
            textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
          }, 0);
        }
      }
    }
  };

  return (
    <div className="editor-container">
      <div className="editor-toolbar-wrapper">
        <div className="editor-toolbar">
          <HeadingGroup handleFormat={handleFormat} />
          <div className="toolbar-divider" />
          
          <FormatGroup handleFormat={handleFormat} />
          <div className="toolbar-divider" />
          
          <ListGroup handleFormat={handleFormat} />
          <div className="toolbar-divider" />
          
          <MediaGroup handleFormat={handleFormat} />
          <div className="toolbar-divider" />
          
          <GithubGroup handleFormat={handleFormat} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} />
          <div className="toolbar-divider" />

          <div className="toolbar-group">
            <button onClick={() => { prepareModalState('MD Table'); setIsTableModalOpen(true); }} title="마크다운 표 삽입"><Table size={18} /></button>
            <button onClick={() => { prepareModalState('HTML Table'); setIsHtmlTableModalOpen(true); }} title="고급 HTML 표 삽입"><FileCode2 size={18} /></button>
          </div>
        </div>
      </div>
      
      <textarea
        ref={textareaRef}
        // 드래그 상태가 활성화(isDragActive)되었을 때 시각 효과 피드백용 클래스를 동적으로 주입합니다.
        className={`editor-textarea ${isDragActive ? 'drag-active' : ''}`}
        value={markdown}
        onChange={(e) => {
          console.log("textarea 입력 상태 변경으로 마크다운 실시간 상태값 동기화");
          setMarkdown(e.target.value);
        }}
        onKeyDown={(e) => {
          console.log("textarea 엘리먼트 내부 키 다운 이벤트 가로채기 수행");
          handleKeyDown(e);
        }}
        onDragOver={(e) => {
          console.log("textarea 영역 파일 진입 감지 - 피드백 상태 가동");
          handleDragOver(e);
        }}
        onDragLeave={(e) => {
          console.log("textarea 영역 파일 이탈 감지 - 피드백 상태 정지");
          handleDragLeave(e);
        }}
        onDrop={(e) => {
          console.log("textarea 영역 파일 드롭 릴리즈 감지 - 데이터 추출 프로세스 작동");
          handleDrop(e);
        }}
        onPaste={(e) => {
          console.log("textarea 영역 클립보드 파일 붙여넣기 감지 - 이진 데이터 주입 프로세스 작동");
          handlePaste(e);
        }}
        placeholder="여기에 마크다운을 작성하세요..."
        spellCheck="false"
      />

      <TableModal isOpen={isTableModalOpen} onClose={() => setIsTableModalOpen(false)} onInsert={handleInsertTable} initialTableMarkdown={selectedTableText} />
      <HtmlTableModal isOpen={isHtmlTableModalOpen} onClose={() => setIsHtmlTableModalOpen(false)} onInsert={handleInsertTable} initialTableHtml={selectedTableText} />
    </div>
  );
}

export default Editor;