// src/components/html-table/HtmlTableGrid.jsx v1.0
/*
 * 파일 설명: 배열 상태를 기반으로 시각적인 인풋 표를 렌더링하는 컴포넌트
 * 연결 위치: src/components/HtmlTableModal.jsx 내에서 렌더링됨
 */

function HtmlTableGrid({ grid, setFocusedCell, handleCellChange }) {
  console.log("HtmlTableGrid 렌더링 시작");

  return (
    <div className="table-modal-grid-container">
      <table className="table-modal-grid">
        <tbody>
          {grid.map((row, rIndex) => (
            <tr key={`grid-row-${rIndex}`}>
              {row.map((cell, cIndex) => {
                // 병합 처리가 되어 구조적으로 숨겨져야 하는 칸은 렌더링을 완전히 스킵함
                if (cell.isHidden) return null;

                return (
                  <td 
                    key={`grid-cell-${rIndex}-${cIndex}`} 
                    rowSpan={cell.rowSpan} 
                    colSpan={cell.colSpan}
                  >
                    <input
                      type="text"
                      value={cell.text}
                      style={{ textAlign: cell.align }}
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