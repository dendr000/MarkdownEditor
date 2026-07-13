/* src/components/HtmlTableModal.jsx v5.0 */
/*
 * 파일 설명: 캡션 기능 추가 및 키보드 일괄 삭제가 포함된 완성형 표 에디터 팝업
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
  const { 
    grid, caption, updateCaption,
    focusedCell, setFocusedCell, initGrid, handleCellChange, handleAlignChange, 
    insertRowAbove, insertRowBelow, insertColLeft, insertColRight, 
    deleteFocusedRow, deleteFocusedCol, mergeRight, mergeDown, unmerge,
    toggleFormat, applyColor, clearFormatting, clearSelectedContents,
    selectionArea, setSelectionArea, undo, redo, canUndo, canRedo
  } = useTableGrid();

  useEffect(() => {
    if (isOpen) initGrid(initialTableHtml);
  }, [isOpen, initialTableHtml, initGrid]);

  if (!isOpen || grid.length === 0) return null;

  const handleApply = () => {
    // 생성기 쪽에 캡션 인자도 함께 넘겨줌
    const htmlOutput = generateHtmlFromGrid(grid, caption);
    onInsert(htmlOutput);
    onClose();
  };

  return (
    <div className="table-modal-overlay" onClick={() => onClose()}>
      {/* 툴바가 가로로 충분히 펼쳐지도록 extra-wide 클래스 적용 */}
      <div className="table-modal html-modal-extra-wide" onClick={(e) => e.stopPropagation()}>
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

        {/* 캡션(표 제목) 입력 영역 */}
        <div className="caption-input-wrapper">
          <input 
            type="text" 
            placeholder="표 제목(Caption)을 입력하세요 (선택 사항)" 
            value={caption} 
            onChange={(e) => updateCaption(e.target.value)} 
          />
        </div>

        <HtmlTableGrid 
          grid={grid} focusedCell={focusedCell} setFocusedCell={setFocusedCell} handleCellChange={handleCellChange}
          selectionArea={selectionArea} setSelectionArea={setSelectionArea} clearSelectedContents={clearSelectedContents}
        />

        <div className="table-modal-actions">
          <button className="btn-cancel" onClick={() => onClose()}>취소</button>
          <button className="btn-apply" onClick={handleApply}>표 생성/수정 완료</button>
        </div>
      </div>
    </div>
  );
}

export default HtmlTableModal;