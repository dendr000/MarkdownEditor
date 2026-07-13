/* src/components/HtmlTableModal.jsx v6.0 */
/*
 * 파일 설명: 모든 기능(다중 삽입, Ctrl 다중 선택, 스크롤 고정)이 결합된 HTML 표 최종 메인 컨테이너
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
    grid, caption, updateCaption, insertCount, setInsertCount,
    focusedCell, setFocusedCell, initGrid, handleCellChange, handleAlignChange, 
    insertRowAbove, insertRowBelow, insertColLeft, insertColRight, 
    deleteFocusedRow, deleteFocusedCol, mergeRight, mergeDown, unmerge,
    toggleFormat, applyColor, clearFormatting, clearSelectedContents, pasteToSelectedCells,
    selectedCellKeys, setSelectedCellKeys, undo, redo, canUndo, canRedo
  } = useTableGrid();

  useEffect(() => {
    if (isOpen) initGrid(initialTableHtml);
  }, [isOpen, initialTableHtml, initGrid]);

  if (!isOpen || grid.length === 0) return null;

  const handleApply = () => {
    const htmlOutput = generateHtmlFromGrid(grid, caption);
    onInsert(htmlOutput);
    onClose();
  };

  return (
    <div className="table-modal-overlay" onClick={() => onClose()}>
      <div className="table-modal html-modal-extra-wide" onClick={(e) => e.stopPropagation()}>
        <h3>고급 HTML 표 편집기</h3>
        
        {/* 상단에 툴바 및 캡션 입력창 배치 (이 영역은 스크롤 시에도 위쪽에 고정됨) */}
        <div className="table-modal-controls-container">
          <ToolbarStructure 
            grid={grid} focusedCell={focusedCell} selectedCellKeys={selectedCellKeys}
            insertCount={insertCount} setInsertCount={setInsertCount}
            insertRowAbove={insertRowAbove} insertRowBelow={insertRowBelow}
            insertColLeft={insertColLeft} insertColRight={insertColRight}
            deleteFocusedRow={deleteFocusedRow} deleteFocusedCol={deleteFocusedCol}
            mergeRight={mergeRight} mergeDown={mergeDown} unmerge={unmerge}
            undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo}
          />
          <ToolbarStyle 
            grid={grid} focusedCell={focusedCell} selectedCellKeys={selectedCellKeys}
            toggleFormat={toggleFormat} applyColor={applyColor} clearFormatting={clearFormatting} handleAlignChange={handleAlignChange}
          />
        </div>

        <div className="caption-input-wrapper">
          <input 
            type="text" 
            placeholder="표 제목(Caption)을 입력하세요 (선택 사항)" 
            value={caption} 
            onChange={(e) => updateCaption(e.target.value)} 
          />
        </div>

        {/* 이 그리드 컨테이너 내부에만 스크롤바가 생기도록 CSS(overflow) 구조 변경됨 */}
        <HtmlTableGrid 
          grid={grid} focusedCell={focusedCell} setFocusedCell={setFocusedCell} handleCellChange={handleCellChange}
          selectedCellKeys={selectedCellKeys} setSelectedCellKeys={setSelectedCellKeys} 
          clearSelectedContents={clearSelectedContents} pasteToSelectedCells={pasteToSelectedCells}
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