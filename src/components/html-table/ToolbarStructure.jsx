/* src/components/html-table/ToolbarStructure.jsx v2.0 */
/*
 * 파일 설명: 셀 병합/분할 및 특정 위치(위,아래,좌,우) 행/열 삽입 및 삭제를 제어하는 정밀 툴바 컴포넌트
 * 연결 위치: src/components/HtmlTableModal.jsx 내에서 렌더링됨
 */
import { 
  ArrowUpToLine, ArrowDownToLine, ArrowLeftToLine, ArrowRightToLine, 
  Trash2, Combine, SplitSquareHorizontal 
} from 'lucide-react';

function ToolbarStructure({ 
  grid, focusedCell, 
  insertRowAbove, insertRowBelow, insertColLeft, insertColRight, 
  deleteFocusedRow, deleteFocusedCol,
  mergeRight, mergeDown, unmerge 
}) {
  console.log("ToolbarStructure(정밀 제어 툴바 v2.0) 렌더링 됨");

  const activeCell = focusedCell ? grid[focusedCell.r][focusedCell.c] : null;
  // 포커스된 셀이 없으면 모든 정밀 제어 버튼을 비활성화하여 오작동 방지
  const hasFocus = !!activeCell;
  const isMerged = activeCell ? (activeCell.rowSpan > 1 || activeCell.colSpan > 1) : false;

  return (
    <div className="table-modal-controls">
      {/* 1. 정밀 삽입/삭제 컨트롤 그룹 */}
      <div className="control-group">
        <span className="control-label">삽입/삭제:</span>
        <button onClick={insertRowAbove} disabled={!hasFocus} title="현재 칸 위에 행 삽입">
          <ArrowUpToLine size={16} />
        </button>
        <button onClick={insertRowBelow} disabled={!hasFocus} title="현재 칸 아래에 행 삽입">
          <ArrowDownToLine size={16} />
        </button>
        <button onClick={insertColLeft} disabled={!hasFocus} title="현재 칸 좌측에 열 삽입">
          <ArrowLeftToLine size={16} />
        </button>
        <button onClick={insertColRight} disabled={!hasFocus} title="현재 칸 우측에 열 삽입">
          <ArrowRightToLine size={16} />
        </button>
        <div className="toolbar-divider"></div>
        <button onClick={deleteFocusedRow} disabled={!hasFocus} title="현재 행 전체 삭제" className="btn-danger">
          <Trash2 size={16} /> 행
        </button>
        <button onClick={deleteFocusedCol} disabled={!hasFocus} title="현재 열 전체 삭제" className="btn-danger">
          <Trash2 size={16} /> 열
        </button>
      </div>

      {/* 2. 병합 조작 컨트롤 그룹 */}
      <div className="control-group alignment-controls">
        <span className="control-label">병합:</span>
        <button onClick={mergeRight} disabled={!hasFocus} title="오른쪽 칸과 병합">
          <Combine size={16} className="rotate-icon-90" /> 우측
        </button>
        <button onClick={mergeDown} disabled={!hasFocus} title="아래쪽 칸과 병합">
          <Combine size={16} /> 하단
        </button>
        <button onClick={unmerge} disabled={!isMerged} title="병합 해제 및 셀 분할">
          <SplitSquareHorizontal size={16} /> 분할
        </button>
      </div>
    </div>
  );
}

export default ToolbarStructure;