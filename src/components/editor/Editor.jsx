// src/components/editor/Editor.jsx v14.0
/*
 * 파일 위치: src/components/editor/Editor.jsx
 * 기능 요약: 마크다운 텍스트 편집 및 매크로 기능을 제공하는 메인 에디터입니다.
 * (v14.0 수정사항): 다크 테마 렌더링 유지 및 코드 복잡도 완화를 위해 ToolbarArea, Workspace, Modals 하위 컴포넌트로 전면 분리 개편됨.
 */
import React, { useState } from 'react';
// 1. Core Hooks
import { useEditor } from '../../hooks/editor/core/useEditor';
import { useImageUpload } from '../../hooks/editor/core/useImageUpload';
// 2. Typing & Formatting Manager Hook
import { useTypingManager } from '../../hooks/editor/typing/useTypingManager';
// 3. UI & Overlay Hooks
import { useAutocomplete } from '../../hooks/editor/ui/useAutocomplete';
import { useColorPicker } from '../../hooks/editor/ui/useColorPicker';

import EditorToolbarArea from './EditorToolbarArea';
import EditorWorkspace from './EditorWorkspace';
import EditorModals from './EditorModals';

import './Editor.css';
import './EditorToolbar.css';
import './EditorCodeMode.css';

function Editor({ markdown, setMarkdown, selectedFile, textareaRef }) {
  // 전역 검색 및 시각적 SQL 쿼리 빌더 모달 개폐 상태
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isQueryBuilderModalOpen, setIsQueryBuilderModalOpen] = useState(false); 
  
  console.log("[Editor v14.1] 단일 에디터 렌더링 시작 (타이핑 매니저 통합 완료)");
  
  // Custom Hooks 선언 (상태 및 에디터 로직)
  const { isDragActive, handleDragOver, handleDragLeave, handleDrop, handlePaste } = useImageUpload(markdown, setMarkdown, textareaRef);
  const { suggestState, currentSuggestList, handleSelectSuggest, handleAutocompleteChange, handleAutocompleteKeyDown } = useAutocomplete(markdown, setMarkdown, textareaRef, selectedFile);
  const { state, actions } = useEditor(markdown, setMarkdown, selectedFile, textareaRef, handleAutocompleteKeyDown);
  const { handleColorChange } = useColorPicker(markdown, setMarkdown, textareaRef);
  const { handleTypingEvents } = useTypingManager(markdown, setMarkdown, selectedFile, textareaRef);

  return (
    <div className="editor-container" style={{ position: 'relative' }}>
      
      {/* 1. 상단 툴바 및 아이콘 그룹 렌더링 영역 */}
      <EditorToolbarArea 
        state={state} 
        actions={actions} 
        setIsGlobalSearchOpen={setIsGlobalSearchOpen} 
        setIsQueryBuilderModalOpen={setIsQueryBuilderModalOpen} 
      />
      
      {/* 2. 텍스트 입력부(Workspace) 및 오버레이 렌더링 영역 */}
      <EditorWorkspace 
        markdown={markdown}
        setMarkdown={setMarkdown}
        selectedFile={selectedFile}
        textareaRef={textareaRef}
        state={state}
        actions={actions}
        isDragActive={isDragActive}
        handleDragOver={handleDragOver}
        handleDragLeave={handleDragLeave}
        handleDrop={handleDrop}
        handlePaste={handlePaste}
        handleAutocompleteChange={handleAutocompleteChange}
        handleTypingEvents={handleTypingEvents}
        handleColorChange={handleColorChange}
      />

      {/* 3. 에디터 팝업 및 모달 렌더링 영역 */}
      <EditorModals 
        markdown={markdown}
        state={state}
        actions={actions}
        suggestState={suggestState}
        currentSuggestList={currentSuggestList}
        handleSelectSuggest={handleSelectSuggest}
        isGlobalSearchOpen={isGlobalSearchOpen}
        setIsGlobalSearchOpen={setIsGlobalSearchOpen}
        isQueryBuilderModalOpen={isQueryBuilderModalOpen}
        setIsQueryBuilderModalOpen={setIsQueryBuilderModalOpen}
      />
      
    </div>
  );
}

export default Editor;