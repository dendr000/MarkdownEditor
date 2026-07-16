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