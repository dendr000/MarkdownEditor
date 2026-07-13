/* src/components/html-table/ToolbarStructure.jsx v3.0 */
/*
 * 파일 설명: Undo/Redo 기능 추가 및 배치가 개선된 표 구조 제어 툴바
 * 연결 위치: src/components/HtmlTableModal.jsx
 */
import { 
  ArrowUpToLine, ArrowDownToLine, ArrowLeftToLine, ArrowRightToLine, 
  Trash2, Combine, SplitSquareHorizontal, Undo2, Redo2 
} from 'lucide-react';

function ToolbarStructure({ 
  grid, focusedCell, selectionArea,
  insertRowAbove, insertRowBelow, insertColLeft, insertColRight, 
  deleteFocusedRow, deleteFocusedCol,
  mergeRight, mergeDown, unmerge,
  undo, redo, canUndo, canRedo
}) {
  console.log("ToolbarStructure 렌더링");

  const activeCell = focusedCell ? grid[focusedCell.r][focusedCell.c] : null;
  // 단일 포커스나 다중 선택 중 하나라도 있으면 동작 활성화
  const hasActiveArea = !!activeCell || !!selectionArea;
  const isMerged = activeCell ? (activeCell.rowSpan > 1 || activeCell.colSpan > 1) : false;

  return (
    <div className="toolbar-row">
      {/* 1. 히스토리 제어 그룹 */}
      <div className="control-group">
        <button onClick={undo} disabled={!canUndo} title="실행 취소">
          <Undo2 size={16} />
        </button>
        <button onClick={redo} disabled={!canRedo} title="다시 실행">
          <Redo2 size={16} />
        </button>
      </div>
      
      <div className="toolbar-divider"></div>

      {/* 2. 삽입/삭제 컨트롤 그룹 */}
      <div className="control-group">
        <span className="control-label">구조:</span>
        <button onClick={insertRowAbove} disabled={!hasActiveArea} title="행 삽입 (위)">
          <ArrowUpToLine size={16} />
        </button>
        <button onClick={insertRowBelow} disabled={!hasActiveArea} title="행 삽입 (아래)">
          <ArrowDownToLine size={16} />
        </button>
        <button onClick={insertColLeft} disabled={!hasActiveArea} title="열 삽입 (좌)">
          <ArrowLeftToLine size={16} />
        </button>
        <button onClick={insertColRight} disabled={!hasActiveArea} title="열 삽입 (우)">
          <ArrowRightToLine size={16} />
        </button>
        <button onClick={deleteFocusedRow} disabled={!hasActiveArea} title="행 삭제" className="btn-danger">
          <Trash2 size={16} /> 행
        </button>
        <button onClick={deleteFocusedCol} disabled={!hasActiveArea} title="열 삭제" className="btn-danger">
          <Trash2 size={16} /> 열
        </button>
      </div>

      {/* 3. 병합 조작 (다중 선택 상태에서는 비활성화 하거나 단일 셀 기준 처리) */}
      <div className="control-group">
        <span className="control-label">병합:</span>
        <button onClick={mergeRight} disabled={!activeCell} title="오른쪽 칸과 병합">
          <Combine size={16} className="rotate-icon-90" />
        </button>
        <button onClick={mergeDown} disabled={!activeCell} title="아래쪽 칸과 병합">
          <Combine size={16} />
        </button>
        <button onClick={unmerge} disabled={!isMerged} title="병합 해제">
          <SplitSquareHorizontal size={16} />
        </button>
      </div>
    </div>
  );
}

export default ToolbarStructure;