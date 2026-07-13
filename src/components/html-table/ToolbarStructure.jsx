/* src/components/html-table/ToolbarStructure.jsx v6.0 */
/*
 * 파일 설명: 삽입할 개수(N개)를 지정할 수 있는 입력창이 추가된 구조 제어 툴바
 */
import { 
  ArrowUpToLine, ArrowDownToLine, ArrowLeftToLine, ArrowRightToLine, 
  Trash2, Combine, SplitSquareHorizontal, Undo2, Redo2 
} from 'lucide-react';

function ToolbarStructure({ 
  grid, focusedCell, selectedCellKeys,
  insertCount, setInsertCount,
  insertRowAbove, insertRowBelow, insertColLeft, insertColRight, 
  deleteFocusedRow, deleteFocusedCol,
  mergeRight, mergeDown, unmerge,
  undo, redo, canUndo, canRedo
}) {
  const activeCell = focusedCell ? grid[focusedCell.r][focusedCell.c] : null;
  const hasActiveArea = !!activeCell || selectedCellKeys.length > 0;
  const isMerged = activeCell ? (activeCell.rowSpan > 1 || activeCell.colSpan > 1) : false;

  return (
    <div className="toolbar-row">
      <div className="toolbar-left">
        <div className="control-group">
          <span className="control-label">구조:</span>
          {/* 다중 삽입 개수 지정 인풋 */}
          <input 
            type="number" 
            min="1" max="50" 
            value={insertCount} 
            onChange={(e) => setInsertCount(Number(e.target.value))} 
            className="insert-count-input" 
            title="한 번에 삽입할 행/열의 개수"
          />
          <button onClick={insertRowAbove} disabled={!hasActiveArea} title="위로 행 삽입">
            <ArrowUpToLine size={16} />
          </button>
          <button onClick={insertRowBelow} disabled={!hasActiveArea} title="아래로 행 삽입">
            <ArrowDownToLine size={16} />
          </button>
          <button onClick={insertColLeft} disabled={!hasActiveArea} title="좌측으로 열 삽입">
            <ArrowLeftToLine size={16} />
          </button>
          <button onClick={insertColRight} disabled={!hasActiveArea} title="우측으로 열 삽입">
            <ArrowRightToLine size={16} />
          </button>
          
          <div className="toolbar-divider"></div>
          
          <button onClick={deleteFocusedRow} disabled={!hasActiveArea} title="행 삭제" className="btn-danger">
            <Trash2 size={16} /> 행
          </button>
          <button onClick={deleteFocusedCol} disabled={!hasActiveArea} title="열 삭제" className="btn-danger">
            <Trash2 size={16} /> 열
          </button>
        </div>
      </div>

      <div className="toolbar-right">
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
        
        <div className="toolbar-divider"></div>

        <div className="control-group">
          <button onClick={undo} disabled={!canUndo} title="실행 취소">
            <Undo2 size={16} />
          </button>
          <button onClick={redo} disabled={!canRedo} title="다시 실행">
            <Redo2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ToolbarStructure;