// src/components/editor/EditorWorkspace.jsx v1.0
/*
 * 파일 위치: src/components/editor/EditorWorkspace.jsx
 * 파일 설명: 텍스트 입력부(textarea)와 구문 강조, 색상 픽커 오버레이를 통합 렌더링하고 스크롤을 동기화합니다.
 * 연결 위치: src/components/editor/Editor.jsx
 */
import React, { useRef } from 'react';
import CodeOverlay from './CodeOverlay';
import ColorPickerOverlay from './ColorPickerOverlay';

function EditorWorkspace({ 
  markdown, setMarkdown, selectedFile, textareaRef, state, actions,
  isDragActive, handleDragOver, handleDragLeave, handleDrop, handlePaste,
  handleAutocompleteChange, handleFormatCode, handleToggleComment, 
  handleSnippetAndReplace, handleAutoTyping, handleColorChange 
}) {
  const overlayRef = useRef(null);
  const lineNumRef = useRef(null);
  const colorPickerRef = useRef(null);

  const isCodeMode = state.fileExt && !['md', 'txt'].includes(state.fileExt.toLowerCase());

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
  );
}

export default EditorWorkspace;