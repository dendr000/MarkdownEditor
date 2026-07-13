// src/components/HtmlTableModal.jsx v1.1
/*
 * 파일 설명: 칸(Cell) 단위로 정렬(좌/중/우)을 개별 지정하여 HTML <table> 태그 형태의 표를 생성하고 수정하는 모달 컴포넌트입니다.
 * 연결 위치: src/components/Editor.jsx 파일에서 렌더링되며, Editor.css의 모달 스타일 속성을 공유하여 사용합니다.
 */
import { useState, useEffect } from 'react';

function HtmlTableModal({ isOpen, onClose, onInsert, initialTableHtml }) {
  console.log("HtmlTableModal 컴포넌트(v1.1) 렌더링 시작. isOpen 상태:", isOpen);

  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  
  // 표 데이터 구조를 객체 배열로 변경: { text: 문자열, align: 정렬 속성 }
  // 첫 번째 행(헤더)은 기본 'center', 나머지는 'left'로 초기화
  const [tableData, setTableData] = useState(
    Array.from({ length: 3 }, (_, r) => 
      Array(3).fill(null).map(() => ({ text: '', align: r === 0 ? 'center' : 'left' }))
    )
  );

  // 현재 사용자가 클릭하여 입력 중인 칸의 위치를 추적하는 State
  const [focusedCell, setFocusedCell] = useState(null);

  // 모달이 열릴 때 전달받은 텍스트가 HTML <table> 형식일 경우 데이터와 정렬 상태 파싱
  useEffect(() => {
    if (isOpen) {
      console.log("HTML 표 모달 열림 감지. 전달받은 텍스트 파싱 시도:\n", initialTableHtml);
      
      if (initialTableHtml && initialTableHtml.includes('<table')) {
        try {
          // 정규표현식을 이용하여 <tr> 안의 <th> 또는 <td> 태그 및 속성을 추출
          const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
          const cellRegex = /<t[hd]([^>]*)>([\s\S]*?)<\/t[hd]>/gi;
          
          let trMatch;
          const parsedData = [];
          
          while ((trMatch = trRegex.exec(initialTableHtml)) !== null) {
            const rowContent = trMatch[1];
            const rowData = [];
            let cellMatch;
            
            while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
              const attrs = cellMatch[1].toLowerCase();
              const text = cellMatch[2].trim();
              
              // 태그 속성에서 정렬 정보 추출 (기본값 left)
              let align = 'left';
              if (attrs.includes('center')) align = 'center';
              else if (attrs.includes('right')) align = 'right';

              rowData.push({ text, align });
            }
            if (rowData.length > 0) {
              parsedData.push(rowData);
            }
          }

          if (parsedData.length > 0) {
            const rowCount = parsedData.length;
            const colCount = Math.max(...parsedData.map(r => r.length));

            const normalizedData = parsedData.map((row, rIndex) => {
              const newRow = [...row];
              while(newRow.length < colCount) {
                // 파싱 중 빈 셀이 발생하면 해당 행의 성격에 맞게 기본 정렬 부여
                newRow.push({ text: '', align: rIndex === 0 ? 'center' : 'left' });
              }
              return newRow;
            });

            console.log(`기존 HTML 표 데이터 파싱 성공 - 행: ${rowCount}, 열: ${colCount}`);
            setRows(rowCount);
            setCols(colCount);
            setTableData(normalizedData);
            setFocusedCell(null); // 파싱 직후에는 포커스 초기화
          } else {
            console.log("유효한 행 데이터를 추출하지 못함. 기본 3x3 표로 초기화");
            resetToDefault();
          }
        } catch (error) {
          console.error("HTML 파싱 중 오류 발생. 기본 3x3 표로 초기화", error);
          resetToDefault();
        }
      } else {
        console.log("초기 텍스트가 HTML 형태가 아니거나 없음. 기본 3x3 표로 초기화");
        resetToDefault();
      }
    }
  }, [isOpen, initialTableHtml]);

  // 기본 3x3 표 상태로 리셋하는 헬퍼 함수
  const resetToDefault = () => {
    setRows(3);
    setCols(3);
    setTableData(
      Array.from({ length: 3 }, (_, r) => 
        Array(3).fill(null).map(() => ({ text: '', align: r === 0 ? 'center' : 'left' }))
      )
    );
    setFocusedCell(null);
  };

  if (!isOpen) {
    return null;
  }

  const handleAddRow = () => {
    console.log("HTML 행 추가 버튼 클릭됨");
    setRows(rows + 1);
    // 새 행 추가 시 기본적으로 'left' 정렬 객체 삽입
    setTableData([...tableData, Array(cols).fill(null).map(() => ({ text: '', align: 'left' }))]);
  };

  const handleRemoveRow = () => {
    console.log("HTML 행 삭제 버튼 클릭됨");
    if (rows > 1) {
      setRows(rows - 1);
      setTableData(tableData.slice(0, -1));
      setFocusedCell(null); // 삭제로 인해 포커스 인덱스가 꼬일 수 있으므로 해제
    }
  };

  const handleAddCol = () => {
    console.log("HTML 열 추가 버튼 클릭됨");
    setCols(cols + 1);
    // 각 행을 순회하며 우측 끝에 새 객체 삽입. 헤더(0번 행)는 'center', 본문은 'left'
    const newData = tableData.map((row, rIndex) => [
      ...row, 
      { text: '', align: rIndex === 0 ? 'center' : 'left' }
    ]);
    setTableData(newData);
  };

  const handleRemoveCol = () => {
    console.log("HTML 열 삭제 버튼 클릭됨");
    if (cols > 1) {
      setCols(cols - 1);
      const newData = tableData.map(row => row.slice(0, -1));
      setTableData(newData);
      setFocusedCell(null);
    }
  };

  // 텍스트 내용 변경 처리
  const handleCellChange = (rowIndex, colIndex, value) => {
    console.log(`HTML 셀 텍스트 변경. 위치: [${rowIndex}, ${colIndex}], 값: ${value}`);
    const newData = [...tableData];
    newData[rowIndex] = [...newData[rowIndex]];
    newData[rowIndex][colIndex] = { ...newData[rowIndex][colIndex], text: value };
    setTableData(newData);
  };

  // 툴바의 정렬 버튼을 눌렀을 때 현재 포커스된 칸의 정렬 속성 변경 처리
  const handleAlignChange = (alignment) => {
    if (!focusedCell) {
      console.log("포커스된 칸이 없어 정렬을 변경할 수 없습니다.");
      return;
    }
    const { row, col } = focusedCell;
    console.log(`HTML 셀 정렬 변경. 위치: [${row}, ${col}], 정렬: ${alignment}`);
    const newData = [...tableData];
    newData[row] = [...newData[row]];
    newData[row][col] = { ...newData[row][col], align: alignment };
    setTableData(newData);
  };

  // 표 생성 적용 버튼 클릭 시 HTML 태그 형태로 변환하여 반환
  const handleApply = () => {
    console.log("HTML 표 모달 적용 버튼 클릭됨. HTML 생성 시작");
    
    let htmlOutput = '\n<table>\n  <thead>\n    <tr>\n';
    
    // 첫 번째 행은 헤더(th)
    tableData[0].forEach(cell => {
      htmlOutput += `      <th align="${cell.align}">${cell.text}</th>\n`;
    });
    
    htmlOutput += '    </tr>\n  </thead>\n  <tbody>\n';
    
    // 두 번째 행부터는 내용(td)
    for (let i = 1; i < tableData.length; i++) {
      htmlOutput += '    <tr>\n';
      tableData[i].forEach(cell => {
        htmlOutput += `      <td align="${cell.align}">${cell.text}</td>\n`;
      });
      htmlOutput += '    </tr>\n';
    }
    
    htmlOutput += '  </tbody>\n</table>\n';
    
    console.log("최종 생성된 HTML 표 문자열:\n", htmlOutput);
    onInsert(htmlOutput);
    onClose();
  };

  return (
    <div className="table-modal-overlay" onClick={() => { console.log("HTML 오버레이 닫기 요청"); onClose(); }}>
      <div className="table-modal" onClick={(e) => { e.stopPropagation(); }}>
        <h3>HTML 표 삽입 (칸별 개별 정렬 지원)</h3>
        
        <div className="table-modal-controls">
          <div className="control-group">
            <span>행(Row): {rows}</span>
            <button onClick={handleAddRow} title="행 추가">+</button>
            <button onClick={handleRemoveRow} title="행 삭제">-</button>
          </div>
          <div className="control-group">
            <span>열(Col): {cols}</span>
            <button onClick={handleAddCol} title="열 추가">+</button>
            <button onClick={handleRemoveCol} title="열 삭제">-</button>
          </div>
          {/* 특정 칸을 클릭했을 때 활성화되는 정렬 제어 툴바 */}
          <div className="control-group alignment-controls">
            <span>칸 정렬:</span>
            <button 
              onClick={() => handleAlignChange('left')} 
              title="왼쪽 정렬" 
              className={focusedCell && tableData[focusedCell.row][focusedCell.col].align === 'left' ? 'active' : ''}
            >좌</button>
            <button 
              onClick={() => handleAlignChange('center')} 
              title="가운데 정렬" 
              className={focusedCell && tableData[focusedCell.row][focusedCell.col].align === 'center' ? 'active' : ''}
            >중</button>
            <button 
              onClick={() => handleAlignChange('right')} 
              title="오른쪽 정렬" 
              className={focusedCell && tableData[focusedCell.row][focusedCell.col].align === 'right' ? 'active' : ''}
            >우</button>
          </div>
        </div>

        <div className="table-modal-grid-container">
          <table className="table-modal-grid">
            <tbody>
              {tableData.map((row, rowIndex) => (
                <tr key={`html-row-${rowIndex}`}>
                  {row.map((cell, colIndex) => (
                    <td key={`html-cell-${rowIndex}-${colIndex}`}>
                      <input
                        type="text"
                        value={cell.text}
                        style={{ textAlign: cell.align }} // 시각적으로 현재 칸의 정렬 상태 반영
                        onFocus={() => {
                          console.log(`[${rowIndex}, ${colIndex}] 셀 포커스 됨`);
                          setFocusedCell({ row: rowIndex, col: colIndex });
                        }}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        placeholder={rowIndex === 0 ? "헤더" : "내용"}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-modal-actions">
          <button className="btn-cancel" onClick={() => { console.log("HTML 모달 닫기 요청"); onClose(); }}>취소</button>
          <button className="btn-apply" onClick={handleApply}>표 적용</button>
        </div>
      </div>
    </div>
  );
}

export default HtmlTableModal;