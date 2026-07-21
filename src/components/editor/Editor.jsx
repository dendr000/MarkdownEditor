// src/components/editor/Editor.jsx v9.0
/*
 * 파일 설명: 실행 취소(Ctrl+Z) 기록 보존을 위해 네이티브 execCommand API를 도입하고, 단축키(Ctrl+B, Ctrl+Q 등) 및 각주 자동 넘버링 로직이 추가된 에디터 메인 컴포넌트입니다.
 * (v9.0 수정사항): 실시간 문서 개요(Outline) 스캔 훅 및 우측 플로팅 미니맵 UI가 통합되었습니다.
 */
import { useRef, useState } from 'react';
import { Table, FileCode2, FolderTree, Workflow, Library, ListTree } from 'lucide-react';
import TableModal from '../table/TableModal';
import HtmlTableModal from '../table/HtmlTableModal';
import FolderTreeModal from '../tree/FolderTreeModal';
import DiagramModal from '../diagram/DiagramModal';
import DetailsModal from './toolbar/DetailsModal';
import TemplateModal from './toolbar/TemplateModal';
import MathModal from './toolbar/MathModal';
import OutlineMinimap from './OutlineMinimap';
import { HeadingGroup, FormatGroup, ListGroup, MediaGroup, GithubGroup } from './toolbar/ToolbarGroups';
import AutocompletePopup from './AutocompletePopup';
import { useImageUpload } from '../../hooks/editor/useImageUpload';
import { useAutocomplete } from '../../hooks/editor/useAutocomplete';
import { useOutline } from '../../hooks/editor/useOutline'; // 신규 아웃라인 훅 임포트
import './Editor.css';

function Editor({ markdown, setMarkdown }) {
  const textareaRef = useRef(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isHtmlTableModalOpen, setIsHtmlTableModalOpen] = useState(false);
  const [isFolderTreeModalOpen, setIsFolderTreeModalOpen] = useState(false);
  const [isDiagramModalOpen, setIsDiagramModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const [isOutlineOpen, setIsOutlineOpen] = useState(false); // 미니맵 토글 상태 추가
  
  const [selectedTableText, setSelectedTableText] = useState('');
  const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 });
  const [openDropdown, setOpenDropdown] = useState(null);

  const { isDragActive, handleDragOver, handleDragLeave, handleDrop, handlePaste } = useImageUpload(markdown, setMarkdown, textareaRef);
  const { suggestState, currentSuggestList, handleSelectSuggest, handleAutocompleteChange, handleAutocompleteKeyDown } = useAutocomplete(markdown, setMarkdown, textareaRef);
  
  // 마크다운 변경 시 실시간으로 헤더를 스캔하여 목차 데이터로 변환
  const outlineData = useOutline(markdown);

  const insertTextNatively = (textarea, start, end, replacement) => {
    textarea.focus();
    textarea.setSelectionRange(start, end);
    const success = document.execCommand('insertText', false, replacement);
    if (!success) {
      textarea.setRangeText(replacement, start, end, 'end');
      textarea.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    }
  };

  const handleFormat = (originalPrefix, suffix = '', isBlock = false) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);

    let prefix = originalPrefix;
    let actualSuffix = suffix;

    if (prefix === '[^1]') {
      const regex = /\[\^(\d+)\]/g;
      let maxNum = 0;
      let match;
      while ((match = regex.exec(markdown)) !== null) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
      const nextNum = maxNum + 1;
      prefix = `[^${nextNum}]`;
      if (suffix.includes('[^1]:')) {
        actualSuffix = suffix.replace('[^1]', `[^${nextNum}]`);
      }
    }

    let replacement = '';
    let newCursorOffset = 0;

    if (isBlock) {
      const defaultPlaceholder = '내용을 입력하세요';
      replacement = prefix + (selectedText || defaultPlaceholder) + actualSuffix;
      newCursorOffset = prefix.length + (selectedText ? selectedText.length : defaultPlaceholder.length);
    } else {
      replacement = prefix + selectedText + actualSuffix;
      newCursorOffset = prefix.length + selectedText.length;
    }

    insertTextNatively(textarea, start, end, replacement);

    setTimeout(() => {
      textarea.setSelectionRange(start + prefix.length, start + newCursorOffset);
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
    insertTextNatively(textarea, start, end, tableOutput);
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      const key = e.key.toLowerCase();
      if (key === 'b') { e.preventDefault(); handleFormat('**', '**'); return; }
      if (key === 'i') { e.preventDefault(); handleFormat('*', '*'); return; }
      if (key === 'q') { e.preventDefault(); handleFormat('[^1]', ''); return; }
      if (key === 'k') { e.preventDefault(); handleFormat('[', '](url)'); return; }
    }

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
          insertTextNatively(textarea, lineStartIdx, start, '\n');
        } else {
          const injection = prefix === '>' ? '\n> ' : '\n- ';
          insertTextNatively(textarea, start, start, injection);
        }
      }
    }
  };

  return (
    <div className="editor-container" style={{ position: 'relative' }}>
      
      {/* 툴바 영역 */}
      <div className="editor-toolbar-wrapper">
        <div className="editor-toolbar">
          <HeadingGroup handleFormat={handleFormat} />
          <div className="toolbar-divider" />
          <FormatGroup handleFormat={handleFormat} onOpenMathModal={() => setIsMathModalOpen(true)} />
          <div className="toolbar-divider" />
          <ListGroup handleFormat={handleFormat} />
          <div className="toolbar-divider" />
          <MediaGroup handleFormat={handleFormat} />
          <div className="toolbar-divider" />
          <GithubGroup 
            handleFormat={handleFormat} 
            openDropdown={openDropdown} 
            setOpenDropdown={setOpenDropdown} 
            onOpenDetailsModal={() => {
              prepareModalState('Details');
              setIsDetailsModalOpen(true);
            }} 
          />
          <div className="toolbar-divider" />
          <div className="toolbar-group">
            {/* 아웃라인 미니맵 토글 버튼 */}
            <button onClick={() => setIsOutlineOpen(!isOutlineOpen)} className={isOutlineOpen ? 'active-btn' : ''} title="문서 개요 (미니맵) 켜기/끄기"><ListTree size={18} /></button>
            <button onClick={() => { setIsTemplateModalOpen(true); }} title="템플릿 보관함"><Library size={18} /></button>
            <button onClick={() => { prepareModalState('MD Table'); setIsTableModalOpen(true); }} title="마크다운 표 삽입"><Table size={18} /></button>
            <button onClick={() => { prepareModalState('HTML Table'); setIsHtmlTableModalOpen(true); }} title="고급 HTML 표 삽입"><FileCode2 size={18} /></button>
            <button onClick={() => { prepareModalState('Folder Tree'); setIsFolderTreeModalOpen(true); }} title="폴더 트리 생성"><FolderTree size={18} /></button>
            <button onClick={() => { prepareModalState('Diagram'); setIsDiagramModalOpen(true); }} title="다이어그램 작성기"><Workflow size={18} /></button>
          </div>
        </div>
      </div>
      
      {/* 마크다운 입력 영역 */}
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

      {/* 우측 상단 플로팅 미니맵 마운트 */}
      <OutlineMinimap 
        outline={outlineData} 
        textareaRef={textareaRef} 
        isOpen={isOutlineOpen} 
        onClose={() => setIsOutlineOpen(false)} 
      />

      {/* 모달 렌더링 영역 */}
      <TableModal isOpen={isTableModalOpen} onClose={() => setIsTableModalOpen(false)} onInsert={handleInsertTable} initialTableMarkdown={selectedTableText} />
      <HtmlTableModal isOpen={isHtmlTableModalOpen} onClose={() => setIsHtmlTableModalOpen(false)} onInsert={handleInsertTable} initialTableHtml={selectedTableText} />
      <FolderTreeModal isOpen={isFolderTreeModalOpen} onClose={() => setIsFolderTreeModalOpen(false)} onInsert={handleInsertTable} />
      <DiagramModal isOpen={isDiagramModalOpen} onClose={() => setIsDiagramModalOpen(false)} onInsert={handleInsertTable} initialDiagramMarkdown={selectedTableText} />
      <DetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} onInsert={handleInsertTable} initialContent={selectedTableText} />
      <TemplateModal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} onInsert={handleInsertTable} />
      <MathModal isOpen={isMathModalOpen} onClose={() => setIsMathModalOpen(false)} onInsert={handleInsertTable} />
      
    </div>
  );
}

export default Editor;