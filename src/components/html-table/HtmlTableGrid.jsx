// src/components/html-table/HtmlTableGrid.jsx v3.0
/*
 * 파일 설명: 배열 상태를 기반으로 시각적인 인풋 표를 렌더링하며, 각 셀에 적용된 서식(색상, 굵기 등)을 실시간으로 표시하는 컴포넌트
 * 연결 위치: src/components/HtmlTableModal.jsx
 */

function HtmlTableGrid({ grid, setFocusedCell, handleCellChange }) {
  console.log("HtmlTableGrid(v3.0) 렌더링 시작");

  return (
    <div className="table-modal-grid-container">
      <table className="table-modal-grid">
        <tbody>
          {grid.map((row, rIndex) => (
            <tr key={`grid-row-${rIndex}`}>
              {row.map((cell, cIndex) => {
                if (cell.isHidden) return null;

                // 셀 상태를 인풋창의 CSS로 변환
                const cellStyle = {
                  textAlign: cell.align,
                  fontWeight: cell.bold ? 'bold' : 'normal',
                  fontStyle: cell.italic ? 'italic' : 'normal',
                  textDecoration: cell.strike ? 'line-through' : 'none',
                  color: cell.color !== 'inherit' ? cell.color : 'inherit',
                  backgroundColor: cell.bgColor !== 'transparent' ? cell.bgColor : 'transparent'
                };

                return (
                  <td 
                    key={`grid-cell-${rIndex}-${cIndex}`} 
                    rowSpan={cell.rowSpan} 
                    colSpan={cell.colSpan}
                    style={{ backgroundColor: cellStyle.backgroundColor }} // td에도 배경색을 주어 빈 공간 칠함
                  >
                    <input
                      type="text"
                      value={cell.text}
                      style={cellStyle}
                      onFocus={() => {
                        console.log(`[${rIndex}, ${cIndex}] 셀 포커스 감지`);
                        setFocusedCell({ r: rIndex, c: cIndex });
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