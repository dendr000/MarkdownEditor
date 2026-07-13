// src/components/HtmlTableModal.jsx v4.0
/*
 * 파일 설명: 다중 선택 및 히스토리 제어, 깔끔한 레이아웃이 반영된 HTML 표 최종 메인 컨테이너
 * 연결 위치: src/components/Editor.jsx 내에서 호출됨
 */
import { useEffect } from 'react';
import { useTableGrid } from '../hooks/table/useTableGrid';
import { generateHtmlFromGrid } from '../utils/htmlTableParser';
import ToolbarStructure from './html-table/ToolbarStructure';
import ToolbarStyle from './html-table/ToolbarStyle';
import HtmlTableGrid from './html-table/HtmlTableGrid';
import './TableModal.css'; 
import './html-table/HtmlTable.css'; 

function HtmlTableModal({ isOpen, onClose, onInsert, initialTableHtml }) {
  console.log("HtmlTableModal(v4.0) 렌더링 시작");
  
  const { 
    grid, focusedCell, setFocusedCell, initGrid, handleCellChange, handleAlignChange, 
    insertRowAbove, insertRowBelow, insertColLeft, insertColRight, 
    deleteFocusedRow, deleteFocusedCol, mergeRight, mergeDown, unmerge,
    toggleFormat, applyColor, clearFormatting,
    selectionArea, setSelectionArea, undo, redo, canUndo, canRedo
  } = useTableGrid();

  useEffect(() => {
    if (isOpen) {
      console.log("모달 열림, 초기 그리드 세팅");
      initGrid(initialTableHtml);
    }
  }, [isOpen, initialTableHtml, initGrid]);

  if (!isOpen || grid.length === 0) {
    console.log("모달이 닫혀 있거나 그리드가 없어 렌더링 중단");
    return null;
  }

  const handleApply = () => {
    console.log("적용 버튼 클릭 - HTML 태그 생성 시작");
    const htmlOutput = generateHtmlFromGrid(grid);
    console.log("생성 완료, 부모 컴포넌트로 전달");
    onInsert(htmlOutput);
    onClose();
  };

  return (
    <div className="table-modal-overlay" onClick={() => { console.log("오버레이 클릭 - 닫기"); onClose(); }}>
      <div className="table-modal html-modal-wide" onClick={(e) => { e.stopPropagation(); }}>
        <h3>고급 HTML 표 편집기</h3>
        
        <div className="table-modal-controls-container">
          <ToolbarStructure 
            grid={grid} focusedCell={focusedCell} selectionArea={selectionArea}
            insertRowAbove={insertRowAbove} insertRowBelow={insertRowBelow}
            insertColLeft={insertColLeft} insertColRight={insertColRight}
            deleteFocusedRow={deleteFocusedRow} deleteFocusedCol={deleteFocusedCol}
            mergeRight={mergeRight} mergeDown={mergeDown} unmerge={unmerge}
            undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo}
          />
          <ToolbarStyle 
            grid={grid} focusedCell={focusedCell} selectionArea={selectionArea}
            toggleFormat={toggleFormat} applyColor={applyColor} clearFormatting={clearFormatting} handleAlignChange={handleAlignChange}
          />
        </div>

        <HtmlTableGrid 
          grid={grid} focusedCell={focusedCell} setFocusedCell={setFocusedCell} handleCellChange={handleCellChange}
          selectionArea={selectionArea} setSelectionArea={setSelectionArea}
        />

        <div className="table-modal-actions">
          <button className="btn-cancel" onClick={() => { console.log("취소 버튼 클릭"); onClose(); }}>취소</button>
          <button className="btn-apply" onClick={handleApply}>표 생성/수정 완료</button>
        </div>
      </div>
    </div>
  );
}

export default HtmlTableModal;