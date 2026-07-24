// src/components/editor/Editor.jsx v12.0
/*
 * 파일 위치: src/components/editor/Editor.jsx
 * 기능 요약: 마크다운 텍스트 편집 및 매크로 기능을 제공하는 메인 에디터입니다.
 * (v12.0 수정사항): CodeEditor 분리 아키텍처 폐기로 인해 단일 에디터 구조로 롤백했습니다.
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
  console.log("[Editor v12.0] 단일 에디터 렌더링 시작 (롤백 적용)");
  const toolbarRef = useRef(null);

  const { isDragActive, handleDragOver, handleDragLeave, handleDrop, handlePaste } = useImageUpload(markdown, setMarkdown, textareaRef);
  const { suggestState, currentSuggestList, handleSelectSuggest, handleAutocompleteChange, handleAutocompleteKeyDown } = useAutocomplete(markdown, setMarkdown, textareaRef);
  
  const { state, actions } = useEditor(markdown, setMarkdown, selectedFile, textareaRef, handleAutocompleteKeyDown);

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