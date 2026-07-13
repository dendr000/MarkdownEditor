/* src/components/html-table/HtmlTableGrid.jsx v6.0 */
/*
 * 파일 설명: Ctrl 키를 이용한 비연속 다중 셀 선택 및 복사/붙여넣기/잘라내기를 지원하는 그리드 렌더링 컴포넌트
 */
import { useState, useEffect } from 'react';

function HtmlTableGrid({ 
  grid, focusedCell, setFocusedCell, handleCellChange, 
  selectedCellKeys, setSelectedCellKeys, clearSelectedContents, pasteToSelectedCells 
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

  const handleMouseDown = (e, rIndex, cIndex) => {
    setIsDragging(true);
    const isCtrlPressed = e.ctrlKey || e.metaKey;
    const cellKey = `${rIndex},${cIndex}`;
    
    if (isCtrlPressed) {
      // Ctrl 클릭 시 기존 선택 영역 보존
      setDragStart({ r: rIndex, c: cIndex, initialKeys: [...selectedCellKeys] });
      setSelectedCellKeys(Array.from(new Set([...selectedCellKeys, cellKey])));
    } else {
      // 일반 클릭 시 선택 영역 초기화
      setDragStart({ r: rIndex, c: cIndex, initialKeys: [] });
      setSelectedCellKeys([cellKey]);
    }
    setFocusedCell({ r: rIndex, c: cIndex });
  };

  const handleMouseEnter = (e, rIndex, cIndex) => {
    if (isDragging && dragStart) {
      const minR = Math.min(dragStart.r, rIndex);
      const maxR = Math.max(dragStart.r, rIndex);
      const minC = Math.min(dragStart.c, cIndex);
      const maxC = Math.max(dragStart.c, cIndex);
      
      const currentBoxKeys = [];
      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          currentBoxKeys.push(`${r},${c}`);
        }
      }
      
      const isCtrlPressed = e.ctrlKey || e.metaKey;
      if (isCtrlPressed) {
        // Ctrl 누르고 드래그 시 드래그 시작 전 상태와 현재 박스를 합침
        setSelectedCellKeys(Array.from(new Set([...dragStart.initialKeys, ...currentBoxKeys])));
      } else {
        setSelectedCellKeys(currentBoxKeys);
      }
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedCellKeys.length > 1) {
      e.preventDefault();
      clearSelectedContents();
    }
  };

  return (
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

                const cellKey = `${rIndex},${cIndex}`;
                // 셀이 selectedCellKeys 배열에 존재하면 파란색 하이라이트 클래스 적용
                const isSelected = selectedCellKeys.includes(cellKey);

                return (
                  <td 
                    key={`grid-cell-${rIndex}-${cIndex}`} 
                    rowSpan={cell.rowSpan} 
                    colSpan={cell.colSpan}
                    className={isSelected ? 'cell-selected' : ''}
                    style={{ backgroundColor: cellStyle.backgroundColor }}
                    onMouseDown={(e) => handleMouseDown(e, rIndex, cIndex)}
                    onMouseEnter={(e) => handleMouseEnter(e, rIndex, cIndex)}
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
                          // 단일 포커스 시 다중 선택 배열 갱신
                          setSelectedCellKeys([cellKey]); 
                        }
                      }}
                      onChange={(e) => handleCellChange(rIndex, cIndex, e.target.value)}
                      // [다중 셀 붙여넣기 이벤트]
                      onPaste={(e) => {
                        if (selectedCellKeys.length > 1) {
                          e.preventDefault(); // 인풋창 1개에 들어가는 기본 동작 방지
                          const text = e.clipboardData.getData('text');
                          pasteToSelectedCells(text);
                        }
                      }}
                      // [다중 셀 잘라내기 이벤트]
                      onCut={(e) => {
                        if (selectedCellKeys.length > 1) {
                          e.preventDefault();
                          // 기준이 되는 셀의 텍스트를 복사한 뒤 전체 내용을 비움
                          e.clipboardData.setData('text/plain', cell.text);
                          clearSelectedContents();
                        }
                      }}
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