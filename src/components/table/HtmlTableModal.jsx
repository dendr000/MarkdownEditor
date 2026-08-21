// src/components/table/HtmlTableModal.jsx v6.2
/*
 * 파일 위치: src/components/table/HtmlTableModal.jsx
 * 기능 요약: 모든 고급 기능(다중 삽입, Ctrl 다중 선택, 스크롤 고정, 캡션 등)이 결합된 HTML 표 최종 메인 컨테이너입니다. (배포를 위해 콘솔 로그 출력 기능이 제거되었습니다.)
 * 연결 위치: src/components/editor/Editor.jsx 내부에서 호출되며 도메인 분리 아키텍처에 맞춰 임포트 경로가 수정되었습니다.
 */
import { useEffect } from 'react';
import { useTableGrid } from '../../hooks/table/useTableGrid';
import { generateHtmlFromGrid } from '../../utils/htmlTableParser';
import ToolbarStructure from './html-table/ToolbarStructure';
import ToolbarStyle from './html-table/ToolbarStyle';
import HtmlTableGrid from './html-table/HtmlTableGrid';
import '../common/Modal.css'; // 공통 모달 뼈대 CSS 연결
import './HtmlTable.css'; // 표 도메인 특화 CSS 연결

function HtmlTableModal({ isOpen, onClose, onInsert, initialTableHtml }) {
  const { 
    grid, caption, updateCaption, insertCount, setInsertCount,
    focusedCell, setFocusedCell, initGrid, handleCellChange, handleAlignChange, 
    insertRowAbove, insertRowBelow, insertColLeft, insertColRight, 
    deleteFocusedRow, deleteFocusedCol, mergeRight, mergeDown, unmerge,
    toggleFormat, applyColor, clearFormatting, clearSelectedContents, pasteToSelectedCells,
    selectedCellKeys, setSelectedCellKeys, undo, redo, canUndo, canRedo
  } = useTableGrid();

  // 모달이 열릴 때마다 초기 HTML 파싱 및 그리드 상태 초기화
  useEffect(() => {
    if (isOpen) {
      initGrid(initialTableHtml);
    }
  }, [isOpen, initialTableHtml, initGrid]);

  if (!isOpen || grid.length === 0) {
    return null;
  }

  // 최종 표 데이터를 HTML 태그 문자열로 변환하여 에디터 본문에 삽입
  const handleApply = () => {
    const htmlOutput = generateHtmlFromGrid(grid, caption);
    onInsert(htmlOutput);
    onClose();
  };

  return (
    <div className="table-modal-overlay" onClick={() => { onClose(); }}>
      <div className="table-modal html-modal-extra-wide" onClick={(e) => e.stopPropagation()}>
        <h3>고급 HTML 표 편집기</h3>
        
        {/* 상단 툴바 컨테이너 (스크롤 시에도 모달 최상단에 고정됨) */}
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

        {/* 캡션(표 제목) 입력 텍스트 박스 영역 */}
        <div className="caption-input-wrapper">
          <input 
            type="text" 
            placeholder="표 제목(Caption)을 입력하세요 (선택 사항)" 
            value={caption} 
            onChange={(e) => {
              updateCaption(e.target.value);
            }} 
          />
        </div>

        {/* 편집기 내부 그리드 컨테이너 (overflow 속성을 통해 내부 스크롤이 발생함) */}
        <HtmlTableGrid 
          grid={grid} focusedCell={focusedCell} setFocusedCell={setFocusedCell} handleCellChange={handleCellChange}
          selectedCellKeys={selectedCellKeys} setSelectedCellKeys={setSelectedCellKeys} 
          clearSelectedContents={clearSelectedContents} pasteToSelectedCells={pasteToSelectedCells}
        />

        {/* 모달 하단 취소/확인 버튼 액션 영역 */}
        <div className="table-modal-actions">
          <button className="btn-cancel" onClick={() => { onClose(); }}>취소</button>
          <button className="btn-apply" onClick={handleApply}>표 생성/수정 완료</button>
        </div>
      </div>
    </div>
  );
}

export default HtmlTableModal;