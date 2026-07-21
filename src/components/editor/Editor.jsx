// src/components/editor/Editor.jsx v9.0
/*
 * 파일 설명: 실행 취소(Ctrl+Z) 기록 보존을 위해 네이티브 execCommand API를 도입하고, 단축키(Ctrl+B, Ctrl+Q 등) 및 각주 자동 넘버링 로직이 추가된 에디터 메인 컴포넌트입니다.
 * (v9.0 수정사항): 실시간 문서 개요(Outline) 스캔 훅 및 우측 플로팅 미니맵 UI가 통합되었습니다.
 */
import { useRef, useState, useEffect } from 'react';
import { Table, FileCode2, FolderTree, Workflow, Library, ListTree } from 'lucide-react';
import TableModal from '../table/TableModal';
import HtmlTableModal from '../table/HtmlTableModal';
import FolderTreeModal from '../tree/FolderTreeModal';
import DiagramModal from '../diagram/DiagramModal';
import DetailsModal from './toolbar/DetailsModal';
import TemplateModal from './toolbar/TemplateModal';
import MathModal from './toolbar/MathModal';
import CommitGuideModal from './toolbar/CommitGuideModal'; // 커밋 가이드 임포트
import OutlineMinimap from './OutlineMinimap';
import { HeadingGroup, FormatGroup, ListGroup, MediaGroup, GithubGroup } from './toolbar/ToolbarGroups';
import { GitCommit } from 'lucide-react'; // 아이콘 임포트 추가
import AutocompletePopup from './AutocompletePopup';
import { useImageUpload } from '../../hooks/editor/useImageUpload';
import { useAutocomplete } from '../../hooks/editor/useAutocomplete';
import { useOutline } from '../../hooks/editor/useOutline'; // 신규 아웃라인 훅 임포트
import './Editor.css';

function Editor({ markdown, setMarkdown }) {
  const textareaRef = useRef(null);
  const toolbarRef = useRef(null); // 툴바 DOM 접근 및 스크롤 제어용 참조
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isHtmlTableModalOpen, setIsHtmlTableModalOpen] = useState(false);
  const [isFolderTreeModalOpen, setIsFolderTreeModalOpen] = useState(false);
  const [isDiagramModalOpen, setIsDiagramModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const [isCommitGuideOpen, setIsCommitGuideOpen] = useState(false);
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  
  const [selectedTableText, setSelectedTableText] = useState('');
  const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 });
  const [openDropdown, setOpenDropdown] = useState(null);

  /* * 추가 기능: 툴바 영역 내 마우스 휠 상하 조작을 좌우 스크롤로 변환 */
  useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    const handleWheel = (e) => {
      // 이미 가로 방향 스크롤(트랙패드 좌우 스와이프 또는 Shift+스크롤)이 발생 중인 경우 
      // 기본 브라우저 동작을 막지 않고 통과시킵니다.
      if (e.deltaY === 0 || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return;
      }

      // 일반적인 상하 마우스 휠인 경우에만 화면 상하 스크롤을 막고 가로 스크롤로 치환합니다.
      e.preventDefault();
      toolbar.scrollLeft += e.deltaY;
    };

    toolbar.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      toolbar.removeEventListener('wheel', handleWheel);
    };
  }, []);

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
      console.log("[Editor] 각주 삽입 매크로 실행: 인라인 마커 삽입 및 최하단 정의부 자동 생성");
      const regex = /\[\^(\d+)\]/g;
      let maxNum = 0;
      let match;
      
      // 1. 기존 markdown 텍스트를 스캔하여 가장 높은 각주 번호를 찾습니다.
      while ((match = regex.exec(markdown)) !== null) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
      const nextNum = maxNum + 1;
      const inlineMarker = `[^${nextNum}]`;
      const bottomDefinition = `[^${nextNum}]: `;

      // 2. 현재 커서 위치에 인라인 마커(예: [^1])를 삽입합니다.
      insertTextNatively(textarea, start, end, inlineMarker);

      // 3. 문서 최하단으로 커서 이동 후 각주 정의부(예: [^1]: )를 추가합니다.
      // 첫 번째 삽입으로 인해 전체 텍스트 길이가 변경되었으므로 DOM의 최신 value를 참조합니다.
      const currentVal = textarea.value;
      const textLength = currentVal.length;
      
      // 문서 끝이 개행으로 끝나지 않았다면 개행을 더 추가하여 이전 문단과 겹치지 않게 보호합니다.
      const prependedNewline = currentVal.endsWith('\n') ? '\n' : '\n\n';
      const appendText = prependedNewline + bottomDefinition;
      
      // 최하단에 텍스트를 주입합니다. 커서는 자연스럽게 추가된 텍스트의 끝으로 이동합니다.
      insertTextNatively(textarea, textLength, textLength, appendText);
      
      // 로직 종료: 포커스가 최하단 각주 정의부에 맞춰지므로 사용자는 바로 내용을 작성할 수 있습니다.
      return;
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
      
      {/* 툴바 영역 (마우스 휠 스크롤 이벤트를 받기 위해 ref 연결) */}
      <div className="editor-toolbar-wrapper" ref={toolbarRef}>
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
            <button onClick={() => setIsOutlineOpen(!isOutlineOpen)} className={isOutlineOpen ? 'active-btn' : ''} title="문서 개요 (미니맵) 켜기/끄기"><ListTree size={18} /></button>
            <button onClick={() => { setIsTemplateModalOpen(true); }} title="템플릿 보관함"><Library size={18} /></button>
            <button onClick={() => { setIsCommitGuideOpen(true); }} title="Git 커밋 가이드"><GitCommit size={18} /></button> {/* 버튼 추가 */}
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
      <CommitGuideModal isOpen={isCommitGuideOpen} onClose={() => setIsCommitGuideOpen(false)} onInsert={handleInsertTable} /> {/* 가이드 마운트 */}
      
    </div>
  );
}

export default Editor;