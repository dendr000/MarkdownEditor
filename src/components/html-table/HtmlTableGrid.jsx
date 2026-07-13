/* src/components/html-table/HtmlTableGrid.jsx v4.0 */
/*
 * 파일 설명: 드래그 앤 드롭을 통한 다중 셀 선택 영역(selectionArea) 연산 및 서식이 적용된 표 인풋 렌더링
 * 연결 위치: src/components/HtmlTableModal.jsx
 */
import { useState, useEffect } from 'react';

function HtmlTableGrid({ 
  grid, focusedCell, setFocusedCell, handleCellChange, 
  selectionArea, setSelectionArea 
}) {
  console.log("HtmlTableGrid(v4.0 다중 선택 지원) 렌더링");

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);

  // 브라우저 밖으로 마우스가 나갈 때를 대비한 글로벌 이벤트 리스너
  useEffect(() => {
    const handleMouseUpGlobal = () => {
      if (isDragging) setIsDragging(false);
    };
    window.addEventListener('mouseup', handleMouseUpGlobal);
    return () => window.removeEventListener('mouseup', handleMouseUpGlobal);
  }, [isDragging]);

  const handleMouseDown = (rIndex, cIndex) => {
    console.log(`드래그 시작: [${rIndex}, ${cIndex}]`);
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

  return (
    <div className="table-modal-grid-container">
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

                // 현재 렌더링 중인 셀이 다중 선택 영역 내에 있는지 검사
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
                        // 드래그 중일 때는 인풋의 자체 드래그 이벤트를 무시하게 하여 셀 선택이 매끄럽게 되도록 함
                        pointerEvents: isDragging ? 'none' : 'auto' 
                      }}
                      onFocus={() => {
                        if (!isDragging) setFocusedCell({ r: rIndex, c: cIndex });
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