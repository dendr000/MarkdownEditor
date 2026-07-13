/* src/components/html-table/HtmlTableGrid.jsx v5.0 */
/*
 * 파일 설명: 다중 선택 및 키보드(Delete) 일괄 삭제 이벤트를 감지하는 표 그리드
 */
import { useState, useEffect } from 'react';

function HtmlTableGrid({ 
  grid, focusedCell, setFocusedCell, handleCellChange, 
  selectionArea, setSelectionArea, clearSelectedContents 
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  useEffect(() => {
    const handleMouseUpGlobal = () => {
      if (isDragging) setIsDragging(false);
    };
    window.addEventListener('mouseup', handleMouseUpGlobal);
    return () => window.removeEventListener('mouseup', handleMouseUpGlobal);
  }, [isDragging]);

  const handleMouseDown = (rIndex, cIndex) => {
    setIsDragging(true);
    setDragStart({ r: rIndex, c: cIndex });
    setFocusedCell({ r: rIndex, c: cIndex });
    setSelectionArea({ minR: rIndex, maxR: rIndex, minC: cIndex, maxC: cIndex });
  };

  const handleMouseEnter = (rIndex, cIndex) => {
    if (isDragging && dragStart) {
      setSelectionArea({
        minR: Math.min(dragStart.r, rIndex),
        maxR: Math.max(dragStart.r, rIndex),
        minC: Math.min(dragStart.c, cIndex),
        maxC: Math.max(dragStart.c, cIndex),
      });
    }
  };

  // 엑셀처럼 Delete/Backspace 키를 누르면 선택 영역 내용 일괄 삭제
  const handleKeyDown = (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectionArea) {
      // 인풋 박스 내에서 텍스트를 수정 중일 때는(단일 포커스) 기본 동작 허용
      // 다중 영역이 선택된 상태에서 그리드 래퍼에 포커스가 있을 때만 발동
      e.preventDefault();
      clearSelectedContents();
    }
  };

  return (
    // tabIndex를 부여하여 키보드 이벤트를 감지할 수 있도록 함
    <div className="table-modal-grid-container" tabIndex={0} onKeyDown={handleKeyDown}>
      <table className="table-modal-grid">
        <tbody onMouseLeave={() => { if(isDragging) setIsDragging(false); }}>
          {grid.map((row, rIndex) => (
            <tr key={`grid-row-${rIndex}`}>
              {row.map((cell, cIndex) => {
                if (cell.isHidden) return null;

                const cellStyle = {
                  textAlign: cell.align,
                  fontWeight: cell.bold ? 'bold' : 'normal',
                  fontStyle: cell.italic ? 'italic' : 'normal',
                  textDecoration: cell.strike ? 'line-through' : 'none',
                  color: cell.color !== 'inherit' ? cell.color : 'inherit',
                  backgroundColor: cell.bgColor !== 'transparent' ? cell.bgColor : 'transparent'
                };

                const isSelected = selectionArea && 
                  rIndex >= selectionArea.minR && rIndex <= selectionArea.maxR &&
                  cIndex >= selectionArea.minC && cIndex <= selectionArea.maxC;

                return (
                  <td 
                    key={`grid-cell-${rIndex}-${cIndex}`} 
                    rowSpan={cell.rowSpan} 
                    colSpan={cell.colSpan}
                    className={isSelected ? 'cell-selected' : ''}
                    style={{ backgroundColor: cellStyle.backgroundColor }}
                    onMouseDown={() => handleMouseDown(rIndex, cIndex)}
                    onMouseEnter={() => handleMouseEnter(rIndex, cIndex)}
                  >
                    <input
                      type="text"
                      value={cell.text}
                      style={{ 
                        ...cellStyle, 
                        pointerEvents: isDragging ? 'none' : 'auto' 
                      }}
                      onFocus={() => {
                        if (!isDragging) {
                          setFocusedCell({ r: rIndex, c: cIndex });
                          setSelectionArea(null); // 단일 클릭 시 다중 선택 영역 초기화
                        }
                      }}
                      onChange={(e) => handleCellChange(rIndex, cIndex, e.target.value)}
                      placeholder={rIndex === 0 ? "헤더" : "내용"}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HtmlTableGrid;