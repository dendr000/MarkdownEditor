// src/components/editor/Editor.jsx v4.0
/*
 * 파일 설명: 복잡한 드래그 앤 드롭 및 자동완성 팝업 로직을 커스텀 훅으로 외부 분리하여 구조화한 메인 에디터 컴포넌트입니다.
 */
import { useRef, useState } from 'react';
import { Table, FileCode2 } from 'lucide-react';
import TableModal from '../table/TableModal';
import HtmlTableModal from '../table/HtmlTableModal';
import { HeadingGroup, FormatGroup, ListGroup, MediaGroup, GithubGroup } from './toolbar/ToolbarGroups';
import AutocompletePopup from './AutocompletePopup';
import { useImageUpload } from '../../hooks/editor/useImageUpload';
import { useAutocomplete } from '../../hooks/editor/useAutocomplete';
import './Editor.css'; 

function Editor({ markdown, setMarkdown }) {
  console.log("Editor 컴포넌트(v4.0) 렌더링 시작 - 로직 모듈화 적용");
  
  const textareaRef = useRef(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isHtmlTableModalOpen, setIsHtmlTableModalOpen] = useState(false);
  const [selectedTableText, setSelectedTableText] = useState('');
  const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 });
  const [openDropdown, setOpenDropdown] = useState(null);

  // 분리된 이미지 업로드 및 자동완성 훅 연결
  const { isDragActive, handleDragOver, handleDragLeave, handleDrop, handlePaste } = useImageUpload(markdown, setMarkdown, textareaRef);
  const { suggestState, currentSuggestList, handleSelectSuggest, handleAutocompleteChange, handleAutocompleteKeyDown } = useAutocomplete(markdown, setMarkdown, textareaRef);

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
    setMarkdown(markdown.substring(0, start) + tableOutput + substring(end));
    setTimeout(() => {
      textarea.focus();
      const newPos = start + tableOutput.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleKeyDown = (e) => {
    console.log("Editor 내부 키 이벤트 감지:", e.key);
    
    // 1. 가상 자동완성 팝업 컨트롤러 가로채기
    const isAutocompleteHandled = handleAutocompleteKeyDown(e);
    if (isAutocompleteHandled) return;

    // 2. 스마트 인용문/개행 연속 로직
    if (e.key === 'Enter' && !e.shiftKey) {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const textBeforeCursor = markdown.substring(0, start);
      const lines = textBeforeCursor.split('\n');
      const currentLine = lines[lines.length - 1];

      const match = currentLine.match(/^([>-])\s*(.*)/);

      if (match) {
        e.preventDefault();
        const prefix = match[1];
        const content = match[2].trim();

        if (content === '') {
          const lineStartIdx = start - currentLine.length;
          const newText = markdown.substring(0, lineStartIdx) + '\n' + markdown.substring(start);
          setMarkdown(newText);
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(lineStartIdx + 1, lineStartIdx + 1);
          }, 0);
        } else {
          const afterText = markdown.substring(start);
          let injection = prefix === '>' ? '<br>\n> ' : '\n- ';
          let cursorOffset = prefix === '>' ? 7 : 3;

          const newText = textBeforeCursor + injection + afterText;
          setMarkdown(newText);
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
          }, 0);
        }
      }
    }
  };

  return (
    <div className="editor-container" style={{ position: 'relative' }}>
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
        className={`editor-textarea ${isDragActive ? 'drag-active' : ''}`}
        value={markdown}
        onChange={(e) => {
          setMarkdown(e.target.value);
          handleAutocompleteChange(e.target.value, e.target.selectionStart);
        }}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        placeholder="여기에 마크다운을 작성하세요..."
        spellCheck="false"
      />

      <AutocompletePopup 
        suggestState={suggestState} 
        currentSuggestList={currentSuggestList} 
        onSelect={handleSelectSuggest} 
      />

      <TableModal isOpen={isTableModalOpen} onClose={() => setIsTableModalOpen(false)} onInsert={handleInsertTable} initialTableMarkdown={selectedTableText} />
      <HtmlTableModal isOpen={isHtmlTableModalOpen} onClose={() => setIsHtmlTableModalOpen(false)} onInsert={handleInsertTable} initialTableHtml={selectedTableText} />
    </div>
  );
}

export default Editor;