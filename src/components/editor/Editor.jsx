// src/components/editor/Editor.jsx v9.8
/*
 * 파일 설명: 마크다운 텍스트 편집 및 매크로 기능을 제공하는 에디터 메인 컴포넌트입니다.
 * (v9.8 수정사항): 비즈니스 로직을 useEditor.js로 분리하여 컴포넌트 크기를 축소했으며, 툴바 가로 스크롤 이벤트를 복구했습니다.
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
import './Editor.css';

function Editor({ markdown, setMarkdown, selectedFile, textareaRef }) {
  const toolbarRef = useRef(null); // [복구] 툴바 가로 스크롤 제어용 Ref

  const { isDragActive, handleDragOver, handleDragLeave, handleDrop, handlePaste } = useImageUpload(markdown, setMarkdown, textareaRef);
  const { suggestState, currentSuggestList, handleSelectSuggest, handleAutocompleteChange, handleAutocompleteKeyDown } = useAutocomplete(markdown, setMarkdown, textareaRef);
  
  // 분리된 비즈니스 로직 훅 호출
  const { state, actions } = useEditor(markdown, setMarkdown, selectedFile, textareaRef, handleAutocompleteKeyDown);

  // [복구] 툴바 영역 마우스 휠 가로 스크롤 변환 로직
  useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault(); // 브라우저 전체 세로 스크롤 방지
        toolbar.scrollLeft += e.deltaY;
      }
    };

    toolbar.addEventListener('wheel', handleWheel, { passive: false });
    return () => toolbar.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className="editor-container" style={{ position: 'relative' }}>
      {/* 가로 스크롤 이벤트를 감지하기 위해 실제 스크롤 영역을 담당하는 wrapper 요소에 ref를 연결합니다. */}
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
          <div className="toolbar-group">
            <button onClick={() => actions.setIsTemplateModalOpen(true)} title="템플릿 보관함"><Library size={18} /></button>
            <button onClick={() => actions.setIsCommitGuideOpen(true)} title="Git 커밋 가이드"><GitCommit size={18} /></button>
            <button onClick={() => { actions.prepareModalState('MD Table'); actions.setIsTableModalOpen(true); }} title="마크다운 표 삽입"><Table size={18} /></button>
            <button onClick={() => { actions.prepareModalState('HTML Table'); actions.setIsHtmlTableModalOpen(true); }} title="고급 HTML 표 삽입"><FileCode2 size={18} /></button>
            <button onClick={() => { actions.prepareModalState('Folder Tree'); actions.setIsFolderTreeModalOpen(true); }} title="폴더 트리 생성"><FolderTree size={18} /></button>
            <button onClick={() => { actions.prepareModalState('Diagram'); actions.setIsDiagramModalOpen(true); }} title="다이어그램 작성기"><Workflow size={18} /></button>
          </div>
        </div>
      </div>
      
      <textarea
        ref={textareaRef}
        className={`editor-textarea ext-${state.fileExt} ${isDragActive ? 'drag-active' : ''}`}
        value={markdown}
        onChange={(e) => {
          setMarkdown(e.target.value);
          handleAutocompleteChange(e.target.value, e.target.selectionStart);
        }}
        onKeyDown={actions.handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        placeholder={selectedFile ? (state.isReadOnly ? "읽기 전용 뷰어 상태이므로 에디터에서 직접 수정할 수 없습니다." : "여기에 마크다운을 작성하세요...") : "좌측 탐색기에서 파일을 선택해 주세요."}
        spellCheck="false"
        disabled={!selectedFile || state.isReadOnly}
      />

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
    </div>
  );
}

export default Editor;