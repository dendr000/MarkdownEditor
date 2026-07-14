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
    
    // 엔터 키가 눌렸고 Shift 키가 조합되지 않은 순수 엔터 입력 상황인지 판별합니다.
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

      // 인용문 기호(>)로 시작하는 패턴인지 정규식 검사를 수행합니다.
      const match = currentLine.match(/^>\s*(.*)/);

      if (match) {
        // 브라우저의 기본 엔터 처리 동작(단순 줄바꿈)을 차단하고 커스텀 서식을 주입하기 위한 설정입니다.
        e.preventDefault();
        const content = match[1].trim();

        if (content === '') {
          console.log("[로그] 내용이 비어 있는 인용문 기호만 존재함을 확인 - 기호 제거 및 탈출 전개");
          // 내용 없이 엔터만 연속으로 두 번 친 경우에 해당하므로 현재 줄의 '> ' 기호를 제거하여 일반 줄로 복구합니다.
          const lineStartIdx = start - currentLine.length;
          const newText = markdown.substring(0, lineStartIdx) + '\n' + markdown.substring(start);
          
          setMarkdown(newText);
          setTimeout(() => {
            console.log("[로그] 기존 기호 삭제 후 커서 포커스 위치 재동기화 수행");
            textarea.focus();
            textarea.setSelectionRange(lineStartIdx + 1, lineStartIdx + 1);
          }, 0);
        } else {
          console.log("[로그] 내용이 포함된 인용문 줄 확인 - 현재 줄 끝에 <br> 삽입 및 다음 줄 자동 기호(> ) 주입 전개");
          // 내용이 차 있는 상태이므로 현재 줄 끝(커서 위치)에 <br> 태그를 넣어 강제 줄바꿈을 유도하고, 다음 줄에 인용문 기호를 공급합니다.
          const afterText = markdown.substring(start);
          const newText = textBeforeCursor + '<br>\n> ' + afterText;
          
          setMarkdown(newText);
          setTimeout(() => {
            console.log("[로그] <br> 및 기호 자동 주입 완료 후 주입된 문자열 바로 뒤로 커서 포커스 동기화 수행");
            textarea.focus();
            // <br>(4글자) + \n(1글자) + >(1글자) + 스페이스(1글자) = 총 7칸 뒤로 커서 이동
            textarea.setSelectionRange(start + 7, start + 7);
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
        className="editor-textarea"
        value={markdown}
        onChange={(e) => {
          console.log("textarea 입력 상태 변경으로 마크다운 실시간 상태값 동기화");
          setMarkdown(e.target.value);
        }}
        onKeyDown={(e) => {
          console.log("textarea 엘리먼트 내부 키 다운 이벤트 가로채기 수행");
          handleKeyDown(e);
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