// src/components/editor/Editor.jsx v13.0
/*
 * 파일 위치: src/components/editor/Editor.jsx
 * 기능 요약: 마크다운 텍스트 편집 및 매크로 기능을 제공하는 메인 에디터입니다.
 * (v13.0 수정사항): 다크 테마(CSS 변수) 렌더링 로그 추가 및 컨테이너 스타일 구조 유지.
 */
import { useRef, useEffect } from 'react';
import { Table, FileCode2, FolderTree, Workflow, Library, GitCommit } from 'lucide-react';
import TableModal from '../table/TableModal';
import HtmlTableModal from '../table/HtmlTableModal';
import FolderTreeModal from '../tree/FolderTreeModal';
import DiagramModal from '../diagram/DiagramModal';
import DetailsModal from './toolbar/DetailsModal';
import TemplateModal from './toolbar/TemplateModal';
import MathModal from './toolbar/MathModal';
import CommitGuideModal from './toolbar/CommitGuideModal';
import FindReplaceModal from './toolbar/FindReplaceModal';
import { HeadingGroup, FormatGroup, ListGroup, MediaGroup, GithubGroup } from './toolbar/ToolbarGroups';
import AutocompletePopup from './AutocompletePopup';
import { useImageUpload } from '../../hooks/editor/useImageUpload';
import { useAutocomplete } from '../../hooks/editor/useAutocomplete';
import { useEditor } from '../../hooks/editor/useEditor';
import { useCommentToggle } from '../../hooks/editor/useCommentToggle';
import { useSnippetExpand } from '../../hooks/editor/useSnippetExpand';
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useAutoTyping } from '../../hooks/editor/useAutoTyping';
import { useCodeFormatter } from '../../hooks/editor/useCodeFormatter';
import { useColorPicker } from '../../hooks/editor/useColorPicker';
import CodeOverlay from './CodeOverlay';
import ColorPickerOverlay from './ColorPickerOverlay';
import GlobalSearchModal from './toolbar/GlobalSearchModal';
import MockDataModal from './toolbar/MockDataModal';
import SqlQueryBuilderModal from './toolbar/SqlQueryBuilderModal'; // 시각적 SQL 쿼리 빌더 모달 임포트
import { DatabaseGroup } from './toolbar/ToolbarGroups';
import './Editor.css';
import './EditorToolbar.css';
import './EditorCodeMode.css';

function Editor({ markdown, setMarkdown, selectedFile, textareaRef }) {
  // 전역 검색 및 시각적 SQL 쿼리 빌더 모달 개폐 상태
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isQueryBuilderModalOpen, setIsQueryBuilderModalOpen] = useState(false); // [신규] 쿼리 빌더 모달 상태 추가
  
  console.log("[Editor v13.7] 단일 에디터 렌더링 시작 (시각적 SQL 쿼리 빌더 모달 마운트 연동)");
  const toolbarRef = useRef(null);
  
  // 오버레이 컨테이너 스크롤 동기화를 위한 참조
  const overlayRef = useRef(null);
  const lineNumRef = useRef(null);
  const colorPickerRef = useRef(null);

  const { isDragActive, handleDragOver, handleDragLeave, handleDrop, handlePaste } = useImageUpload(markdown, setMarkdown, textareaRef);
  const { suggestState, currentSuggestList, handleSelectSuggest, handleAutocompleteChange, handleAutocompleteKeyDown } = useAutocomplete(markdown, setMarkdown, textareaRef, selectedFile);
  
  const { state, actions } = useEditor(markdown, setMarkdown, selectedFile, textareaRef, handleAutocompleteKeyDown);
  
  const { handleToggleComment } = useCommentToggle(markdown, setMarkdown, selectedFile, textareaRef);
  const { handleSnippetAndReplace } = useSnippetExpand(markdown, setMarkdown, selectedFile, textareaRef);
  const { handleAutoTyping } = useAutoTyping(markdown, setMarkdown, selectedFile, textareaRef);
  const { handleFormatCode } = useCodeFormatter(markdown, setMarkdown, selectedFile, textareaRef);
  const { handleColorChange } = useColorPicker(markdown, setMarkdown, textareaRef);

  useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault(); 
        toolbar.scrollLeft += e.deltaY;
      }
    };

    toolbar.addEventListener('wheel', handleWheel, { passive: false });
    return () => toolbar.removeEventListener('wheel', handleWheel);
  }, []);

  // 마크다운과 텍스트를 제외한 언어만 코드 모드로 취급합니다.
  const isCodeMode = state.fileExt && !['md', 'txt'].includes(state.fileExt.toLowerCase());

  // textarea와 오버레이 레이어들의 스크롤 위치를 1:1로 동기화합니다.
  const handleScroll = (e) => {
    if (overlayRef.current) {
      overlayRef.current.scrollTop = e.target.scrollTop;
      overlayRef.current.scrollLeft = e.target.scrollLeft;
    }
    if (lineNumRef.current) {
      lineNumRef.current.scrollTop = e.target.scrollTop;
    }
    if (colorPickerRef.current) {
      colorPickerRef.current.scrollTop = e.target.scrollTop;
      colorPickerRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  return (
    <div className="editor-container" style={{ position: 'relative' }}>
      <div className="editor-toolbar-wrapper" ref={toolbarRef}>
        <div className="editor-toolbar">
          <HeadingGroup handleFormat={actions.handleFormat} />
          <div className="toolbar-divider" />
          <FormatGroup handleFormat={actions.handleFormat} onOpenMathModal={() => actions.setIsMathModalOpen(true)} />
          <div className="toolbar-divider" />
          <ListGroup handleFormat={actions.handleFormat} />
          <div className="toolbar-divider" />
          <MediaGroup handleFormat={actions.handleFormat} />
          <div className="toolbar-divider" />
          <GithubGroup handleFormat={actions.handleFormat} openDropdown={state.openDropdown} setOpenDropdown={actions.setOpenDropdown} onOpenDetailsModal={() => { actions.prepareModalState('Details'); actions.setIsDetailsModalOpen(true); }} />
          <div className="toolbar-divider" />
          {/* DB 툴링 버튼 마운트 (더미 데이터 생성기 및 쿼리 빌더) */}
          <DatabaseGroup 
            onOpenMockModal={() => actions.setIsMockModalOpen(true)} 
            onOpenQueryBuilderModal={() => {
              // useEditor 내부에 'SQL' 키가 정의되어 있지 않아 텍스트 캡처가 무시되는 문제를 해결하기 위해,
              // 동작이 확실히 보장된 기존 모달 키('Diagram')를 빌려 텍스트 스냅샷을 강제로 캡처합니다.
              actions.prepareModalState('Diagram'); 
              setIsQueryBuilderModalOpen(true);
            }}
          />
          <div className="toolbar-divider" />
          <div className="toolbar-group">
            <button onClick={() => setIsGlobalSearchOpen(true)} title="전역 검색 및 치환"><Search size={18} /></button>
            <button onClick={() => actions.setIsTemplateModalOpen(true)} title="템플릿 보관함"><Library size={18} /></button>
            <button onClick={() => actions.setIsCommitGuideOpen(true)} title="Git 커밋 가이드"><GitCommit size={18} /></button>
            <button onClick={() => { actions.prepareModalState('MD Table'); actions.setIsTableModalOpen(true); }} title="마크다운 표 삽입"><Table size={18} /></button>
            <button onClick={() => { actions.prepareModalState('HTML Table'); actions.setIsHtmlTableModalOpen(true); }} title="고급 HTML 표 삽입"><FileCode2 size={18} /></button>
            <button onClick={() => { actions.prepareModalState('Folder Tree'); actions.setIsFolderTreeModalOpen(true); }} title="폴더 트리 생성"><FolderTree size={18} /></button>
            <button onClick={() => { actions.prepareModalState('Diagram'); actions.setIsDiagramModalOpen(true); }} title="다이어그램 작성기"><Workflow size={18} /></button>
          </div>
        </div>
      </div> 
      
      {/* 텍스트 영역과 오버레이가 완벽히 포개어지는 래퍼 컨테이너 */}
      <div className="editor-workspace-wrapper">
        {isCodeMode && (
          <>
            <CodeOverlay
              markdown={markdown}
              language={state.fileExt}
              overlayRef={overlayRef}
              lineNumRef={lineNumRef}
            />
            <ColorPickerOverlay
              markdown={markdown}
              language={state.fileExt}
              colorPickerRef={colorPickerRef}
              onColorChange={handleColorChange}
            />
          </>
        )}
        <textarea
          ref={textareaRef}
          className={`editor-textarea ext-${state.fileExt} ${isDragActive ? 'drag-active' : ''} ${isCodeMode ? 'code-mode' : ''}`}
          value={markdown}
          onChange={(e) => {
            setMarkdown(e.target.value);
            handleAutocompleteChange(e.target.value, e.target.selectionStart);
          }}
          onKeyDown={(e) => {
            if (handleFormatCode(e)) return;
            if (handleToggleComment(e)) return;
            if (handleSnippetAndReplace(e)) return;
            if (handleAutoTyping(e)) return;
            actions.handleKeyDown(e);
          }}
          onScroll={isCodeMode ? handleScroll : undefined}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
          placeholder={selectedFile ? (state.isReadOnly ? "읽기 전용 뷰어 상태이므로 에디터에서 직접 수정할 수 없습니다." : "여기에 텍스트를 작성하세요...") : "좌측 탐색기에서 파일을 선택해 주세요."}
          spellCheck="false"
          disabled={!selectedFile || state.isReadOnly}
        />
      </div>

      <AutocompletePopup suggestState={suggestState} currentSuggestList={currentSuggestList} onSelect={handleSelectSuggest} />
      <TableModal isOpen={state.isTableModalOpen} onClose={() => actions.setIsTableModalOpen(false)} onInsert={actions.handleInsertTable} initialTableMarkdown={state.selectedTableText} />
      <HtmlTableModal isOpen={state.isHtmlTableModalOpen} onClose={() => actions.setIsHtmlTableModalOpen(false)} onInsert={actions.handleInsertTable} initialTableHtml={state.selectedTableText} />
      <FolderTreeModal isOpen={state.isFolderTreeModalOpen} onClose={() => actions.setIsFolderTreeModalOpen(false)} onInsert={actions.handleInsertTable} />
      <DiagramModal isOpen={state.isDiagramModalOpen} onClose={() => actions.setIsDiagramModalOpen(false)} onInsert={actions.handleInsertTable} initialDiagramMarkdown={state.selectedTableText} />
      <DetailsModal isOpen={state.isDetailsModalOpen} onClose={() => actions.setIsDetailsModalOpen(false)} onInsert={actions.handleInsertTable} initialContent={state.selectedTableText} />
      <TemplateModal isOpen={state.isTemplateModalOpen} onClose={() => actions.setIsTemplateModalOpen(false)} onInsert={actions.handleInsertTable} />
      <MathModal isOpen={state.isMathModalOpen} onClose={() => actions.setIsMathModalOpen(false)} onInsert={actions.handleInsertTable} />
      <CommitGuideModal isOpen={state.isCommitGuideOpen} onClose={() => actions.setIsCommitGuideOpen(false)} onInsert={actions.handleInsertTable} />
      <FindReplaceModal isOpen={state.isFindReplaceOpen} onClose={() => actions.setIsFindReplaceOpen(false)} onReplaceAll={actions.handleReplaceAll} markdown={markdown} selectionRange={state.replaceSelectionRange} />
      
      {/* 전역 검색 모달 마운트 */}
      <GlobalSearchModal isOpen={isGlobalSearchOpen} onClose={() => setIsGlobalSearchOpen(false)} />
      
      {/* [신규] 시각적 SQL 쿼리 빌더 대형 모달 마운트 */}
      {/* [수정] 데이터 삽입(onInsert) 및 선택 텍스트(initialValue) 프롭스 연결 */}
      <SqlQueryBuilderModal  isOpen={isQueryBuilderModalOpen} 
        onClose={() => setIsQueryBuilderModalOpen(false)} 
        initialValue={state.selectedTableText} // 드래그된 텍스트 전달
        onInsert={actions.handleInsertTable}   // 텍스트 삽입 함수 전달
      />
      
      {/* 더미 데이터 생성기 모달 마운트 */}
      <MockDataModal isOpen={state.isMockModalOpen} onClose={() => actions.setIsMockModalOpen(false)} markdown={markdown} onInsert={actions.handleInsertTable} />
    </div>
  );
}

export default Editor;