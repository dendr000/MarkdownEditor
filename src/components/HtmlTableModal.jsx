// src/components/HtmlTableModal.jsx v3.0
/*
 * 파일 설명: 정밀 구조 제어 및 셀 서식 제어 컴포넌트를 모두 포함하는 최종 HTML 표 모달 컨테이너
 * 연결 위치: src/components/Editor.jsx
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
  console.log("HtmlTableModal(v3.0 아키텍처) 렌더링. isOpen:", isOpen);

  const { 
    grid, focusedCell, setFocusedCell, initGrid, handleCellChange, handleAlignChange, 
    insertRowAbove, insertRowBelow, insertColLeft, insertColRight, 
    deleteFocusedRow, deleteFocusedCol, mergeRight, mergeDown, unmerge,
    toggleFormat, applyColor, clearFormatting
  } = useTableGrid();

  useEffect(() => {
    if (isOpen) {
      initGrid(initialTableHtml);
    }
  }, [isOpen, initialTableHtml, initGrid]);

  if (!isOpen || grid.length === 0) return null;

  const handleApply = () => {
    console.log("적용 버튼 클릭 - HTML 생성 시작");
    const htmlOutput = generateHtmlFromGrid(grid);
    onInsert(htmlOutput);
    onClose();
  };

  return (
    <div className="table-modal-overlay" onClick={() => onClose()}>
      <div className="table-modal" onClick={(e) => e.stopPropagation()}>
        <h3>고급 HTML 표 삽입</h3>
        
        <ToolbarStructure 
          grid={grid} focusedCell={focusedCell}
          insertRowAbove={insertRowAbove} insertRowBelow={insertRowBelow}
          insertColLeft={insertColLeft} insertColRight={insertColRight}
          deleteFocusedRow={deleteFocusedRow} deleteFocusedCol={deleteFocusedCol}
          mergeRight={mergeRight} mergeDown={mergeDown} unmerge={unmerge}
        />

        {/* 새롭게 추가된 서식 제어 툴바 */}
        <ToolbarStyle 
          grid={grid} focusedCell={focusedCell}
          toggleFormat={toggleFormat} applyColor={applyColor} clearFormatting={clearFormatting}
        />

        <HtmlTableGrid 
          grid={grid} setFocusedCell={setFocusedCell} handleCellChange={handleCellChange}
        />

        <div className="table-modal-actions">
          <button className="btn-cancel" onClick={() => onClose()}>취소</button>
          <button className="btn-apply" onClick={handleApply}>표 적용</button>
        </div>
      </div>
    </div>
  );
}

export default HtmlTableModal;