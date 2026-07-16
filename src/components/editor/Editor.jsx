// src/components/editor/Editor.jsx v7.0
/*
 * 파일 설명: 드래그 선택 영역의 텍스트 콘텐츠(selectedTableText)를 다이어그램 모달 열기 시점의 초기 변수(initialDiagramMarkdown)로 바인딩하여 주입하도록 개선된 메인 에디터 컴포넌트입니다.
 */
import { useRef, useState } from 'react';
import { Table, FileCode2, FolderTree, Workflow } from 'lucide-react';
import TableModal from '../table/TableModal';
import HtmlTableModal from '../table/HtmlTableModal';
import FolderTreeModal from '../tree/FolderTreeModal';
import DiagramModal from '../diagram/DiagramModal';
import { HeadingGroup, FormatGroup, ListGroup, MediaGroup, GithubGroup } from './toolbar/ToolbarGroups';
import AutocompletePopup from './AutocompletePopup';
import { useImageUpload } from '../../hooks/editor/useImageUpload';
import { useAutocomplete } from '../../hooks/editor/useAutocomplete';
import './Editor.css'; 

function Editor({ markdown, setMarkdown }) {
  console.log("Editor 컴포넌트(v7.0) 렌더링 시작 - 다이어그램 역파싱 데이터 주입 체결");
  
  const textareaRef = useRef(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isHtmlTableModalOpen, setIsHtmlTableModalOpen] = useState(false);
  const [isFolderTreeModalOpen, setIsFolderTreeModalOpen] = useState(false);
  const [isDiagramModalOpen, setIsDiagramModalOpen] = useState(false);
  const [selectedTableText, setSelectedTableText] = useState('');
  const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 });
  const [openDropdown, setOpenDropdown] = useState(null);

  // 외부 추출 커서 연동 커스텀 훅 연결
  const { isDragActive, handleDragOver, handleDragLeave, handleDrop, handlePaste } = useImageUpload(markdown, setMarkdown, textareaRef);
  const { suggestState, currentSuggestList, handleSelectSuggest, handleAutocompleteChange, handleAutocompleteKeyDown } = useAutocomplete(markdown, setMarkdown, textareaRef);

  // 마크다운 지정 접두/접미 서식 바인딩 핸들러
  const handleFormat = (prefix, suffix = '', isBlock = false) => {
    console.log(`[Editor v7.0] handleFormat 서식 주입 실행 - prefix: ${prefix}, suffix: ${suffix}`);
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

  // 모달 활성화 호출 전 선택 블록 텍스트 스캔 및 임시 저장 유틸
  const prepareModalState = (modalType) => {
    console.log(`[Editor v7.0] prepareModalState 구동 - 모달 유형 타겟팅: ${modalType}`);
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      setSelectionRange({ start, end });
      
      const textChunk = start !== end ? markdown.substring(start, end) : '';
      console.log(`[Editor v7.0] 선택 범위 텍스트 추출 완료. 길이: ${textChunk.length}`);
      setSelectedTableText(textChunk);
    }
  };

  // 모달 아웃풋 데이터를 편집 창 커서 영역에 체결하는 핸들러
  const handleInsertTable = (tableOutput) => {
    console.log("[Editor v7.0] 모달 데이터 최종 수신 - 본문 병합 가동");
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

  // 키 다운 선행 처리 리스너
  const handleKeyDown = (e) => {
    console.log("Editor 내부 키 이벤트 스캔:", e.key);
    const isAutocompleteHandled = handleAutocompleteKeyDown(e);
    if (isAutocompleteHandled) return;

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
            <button onClick={() => { prepareModalState('Folder Tree'); setIsFolderTreeModalOpen(true); }} title="폴더 트리 생성"><FolderTree size={18} /></button>
            <button onClick={() => { prepareModalState('Diagram'); setIsDiagramModalOpen(true); }} title="다이어그램 작성기"><Workflow size={18} /></button>
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
      <FolderTreeModal isOpen={isFolderTreeModalOpen} onClose={() => setIsFolderTreeModalOpen(false)} onInsert={handleInsertTable} />
      <DiagramModal isOpen={isDiagramModalOpen} onClose={() => setIsDiagramModalOpen(false)} onInsert={handleInsertTable} initialDiagramMarkdown={selectedTableText} />
    </div>
  );
}

export default Editor;