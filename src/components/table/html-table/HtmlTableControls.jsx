// src/components/html-table/HtmlTableControls.jsx v1.0
/*
 * 파일 설명: HTML 표 모달 상단에 위치하여 행/열 추가, 정렬 변경, 병합 및 분할 기능을 트리거하는 툴바 컴포넌트
 * 연결 위치: src/components/HtmlTableModal.jsx 내에서 렌더링됨
 */

function HtmlTableControls({ 
  grid, focusedCell, addRow, removeRow, addCol, removeCol, 
  handleAlignChange, mergeRight, mergeDown, unmerge 
}) {
  console.log("HtmlTableControls 렌더링 됨");

  // 현재 포커스된 셀의 정보를 가져와 버튼의 활성화/비활성화(disabled) 상태 및 하이라이트 여부를 결정
  const activeCell = focusedCell ? grid[focusedCell.r][focusedCell.c] : null;
  const hasFocus = !!activeCell;
  const isMerged = activeCell ? (activeCell.rowSpan > 1 || activeCell.colSpan > 1) : false;

  return (
    <div className="table-modal-controls">
      {/* 1. 기본 행/열 조작 */}
      <div className="control-group">
        <span>행/열:</span>
        <button onClick={addRow} title="아래에 행 추가">+ 행</button>
        <button onClick={removeRow} title="마지막 행 삭제">- 행</button>
        <button onClick={addCol} title="우측에 열 추가">+ 열</button>
        <button onClick={removeCol} title="마지막 열 삭제">- 열</button>
      </div>

      {/* 2. 병합 조작 (포커스가 있어야 작동) */}
      <div className="control-group alignment-controls">
        <span>병합:</span>
        <button onClick={mergeRight} disabled={!hasFocus} title="오른쪽 칸과 병합">▶ 우측</button>
        <button onClick={mergeDown} disabled={!hasFocus} title="아래쪽 칸과 병합">▼ 하단</button>
        <button onClick={unmerge} disabled={!isMerged} title="병합 해제 및 셀 분할">▤ 분할</button>
      </div>

      {/* 3. 정렬 조작 (포커스가 있어야 작동) */}
      <div className="control-group alignment-controls">
        <span>정렬:</span>
        <button 
          onClick={() => handleAlignChange('left')} 
          disabled={!hasFocus}
          className={activeCell?.align === 'left' ? 'active' : ''}
        >좌</button>
        <button 
          onClick={() => handleAlignChange('center')} 
          disabled={!hasFocus}
          className={activeCell?.align === 'center' ? 'active' : ''}
        >중</button>
        <button 
          onClick={() => handleAlignChange('right')} 
          disabled={!hasFocus}
          className={activeCell?.align === 'right' ? 'active' : ''}
        >우</button>
      </div>
    </div>
  );
}

export default HtmlTableControls;