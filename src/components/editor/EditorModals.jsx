// src/components/editor/EditorModals.jsx v1.1
/*
 * 파일 위치: src/components/editor/EditorModals.jsx
 * 파일 설명: 메인 에디터에서 호출되는 모든 팝업 및 모달 컴포넌트들을 논리적으로 그룹화하여 렌더링합니다.
 * 연결 위치: src/components/editor/Editor.jsx
 */
import React from 'react';
import TableModal from '../table/TableModal';
import HtmlTableModal from '../table/HtmlTableModal';
import FolderTreeModal from '../tree/FolderTreeModal';
import DiagramModal from '../diagram/DiagramModal';
import DetailsModal from './toolbar/DetailsModal';
import TemplateModal from './toolbar/TemplateModal';
import MathModal from './toolbar/MathModal';
import CommitGuideModal from './toolbar/CommitGuideModal';
import FindReplaceModal from './toolbar/FindReplaceModal';
import AutocompletePopup from './AutocompletePopup';
import MockDataModal from './toolbar/MockDataModal';
import SqlQueryBuilderModal from './toolbar/SqlQueryBuilderModal';

function EditorModals({ 
  markdown, state, actions,
  suggestState, currentSuggestList, handleSelectSuggest,
  isQueryBuilderModalOpen, setIsQueryBuilderModalOpen 
}) {
  return (
    <>
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
      
      {/* 시각적 SQL 쿼리 빌더 대형 모달 마운트 (데이터 삽입 및 역설계 연동) */}
      <SqlQueryBuilderModal 
        isOpen={isQueryBuilderModalOpen} 
        onClose={() => setIsQueryBuilderModalOpen(false)} 
        initialValue={state.selectedTableText} 
        onInsert={actions.handleInsertTable}
        fileExt={state.fileExt} // 현재 작업 중인 파일의 확장자 전달
      />
      
      {/* 더미 데이터 생성기 모달 마운트 */}
      <MockDataModal isOpen={state.isMockModalOpen} onClose={() => actions.setIsMockModalOpen(false)} markdown={markdown} onInsert={actions.handleInsertTable} />
    </>
  );
}

export default EditorModals;