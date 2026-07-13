// src/components/TableModal.jsx v1.1
/*
 * 파일 설명: 마크다운 에디터 내에서 표(Table)를 시각적으로 구성, 수정하고 마크다운 문법으로 변환하여 삽입하는 모달 컴포넌트입니다.
 * 연결 위치: src/components/Editor.jsx 파일에서 렌더링되며, 기존 작성된 표 마크다운(initialTableMarkdown)을 전달받아 파싱 후 수정할 수 있습니다.
 */
import { useState, useEffect } from 'react';

function TableModal({ isOpen, onClose, onInsert, initialTableMarkdown }) {
  console.log("TableModal 컴포넌트(v1.1) 렌더링 시작. isOpen 상태:", isOpen);

  // 표의 행(Row) 개수 상태 관리 (기본값 3)
  const [rows, setRows] = useState(3);
  // 표의 열(Column) 개수 상태 관리 (기본값 3)
  const [cols, setCols] = useState(3);
  // 표의 실제 입력 데이터 2차원 배열 상태 관리 (기본 3x3 빈 문자열 배열로 초기화)
  const [tableData, setTableData] = useState(
    Array.from({ length: 3 }, () => Array(3).fill(''))
  );

  // 모달이 열릴 때마다 전달받은 드래그 영역 텍스트를 검사하여 마크다운 표 양식일 경우 데이터를 추출하여 세팅
  useEffect(() => {
    if (isOpen) {
      console.log("모달 열림 감지. 전달받은 초기 마크다운 파싱 시도:\n", initialTableMarkdown);
      
      // 전달된 텍스트가 존재하고 단순 공백이 아닐 경우 파싱 진행
      if (initialTableMarkdown && initialTableMarkdown.trim() !== '') {
        // 줄바꿈을 기준으로 문자열을 분리하고 양끝 공백 제거 후 빈 줄은 걸러냄
        const lines = initialTableMarkdown.split('\n').map(line => line.trim()).filter(line => line !== '');
        
        // 마크다운 표 문법에서 헤더 아래 들어가는 구분선 (예: |---|---|) 을 걸러내어 순수 데이터 행만 추출
        const dataLines = lines.filter(line => {
          // 파이프(|), 붙임표(-), 콜론(:), 공백으로만 이루어져 있고 붙임표(-)를 포함하는 줄은 구분선으로 간주
          const isSeparator = /^[|\s\-:]+$/.test(line) && line.includes('-');
          return !isSeparator;
        });

        // 파싱된 데이터 행이 1줄 이상 존재할 경우 표 재구성
        if (dataLines.length > 0) {
          const parsedData = dataLines.map(line => {
            let cleanLine = line;
            // 양 끝에 장식용으로 붙은 파이프(|) 문자를 제거
            if (cleanLine.startsWith('|')) cleanLine = cleanLine.substring(1);
            if (cleanLine.endsWith('|')) cleanLine = cleanLine.substring(0, cleanLine.length - 1);
            
            // 파이프 문자를 기준으로 각 셀의 데이터를 나누고 양옆 공백 제거
            return cleanLine.split('|').map(cell => cell.trim());
          });

          const rowCount = parsedData.length;
          // 불규칙하게 작성된 표일 수 있으므로 배열 중 가장 긴 열의 개수를 파악하여 기준 열 개수로 설정
          const colCount = Math.max(...parsedData.map(r => r.length));

          // 모든 행이 최대 열 개수와 동일한 길이의 배열을 가지도록 정규화 (부족한 셀은 빈 문자열로 채움)
          const normalizedData = parsedData.map(row => {
            const newRow = [...row];
            while(newRow.length < colCount) {
              newRow.push('');
            }
            return newRow;
          });

          console.log(`기존 표 데이터 파싱 성공 - 행: ${rowCount}, 열: ${colCount}`);
          setRows(rowCount);
          setCols(colCount);
          setTableData(normalizedData);
        } else {
          // 형태가 불분명하거나 표 형태가 아닌 텍스트를 드래그한 경우 기본 3x3 표 세팅
          console.log("드래그된 텍스트에서 유효한 표 데이터를 찾지 못함. 기본 3x3 표로 초기화");
          setRows(3);
          setCols(3);
          setTableData(Array.from({ length: 3 }, () => Array(3).fill('')));
        }
      } else {
        // 드래그된 텍스트 없이 버튼을 누른 경우 기본 3x3 표 세팅
        console.log("초기 전달된 마크다운이 없음. 기본 3x3 표로 초기화");
        setRows(3);
        setCols(3);
        setTableData(Array.from({ length: 3 }, () => Array(3).fill('')));
      }
    }
  }, [isOpen, initialTableMarkdown]); // 모달이 열리는 시점 또는 초기 텍스트가 바뀔 때마다 실행

  // 모달이 열려있지 않으면 렌더링을 차단하고 null 반환
  if (!isOpen) {
    console.log("TableModal isOpen이 false이므로 렌더링 중단 및 null 반환");
    return null;
  }

  // 행 추가 기능을 수행하는 함수
  const handleAddRow = () => {
    console.log("행 추가 버튼 클릭됨. 현재 행 개수:", rows);
    setRows(rows + 1);
    // 기존 테이블 데이터 배열의 끝에 현재 열(cols) 개수만큼의 빈 문자열 배열을 추가
    setTableData([...tableData, Array(cols).fill('')]);
    console.log("행 추가 처리 완료. 변경된 행 개수:", rows + 1);
  };

  // 행 삭제 기능을 수행하는 함수
  const handleRemoveRow = () => {
    console.log("행 삭제 버튼 클릭됨. 현재 행 개수:", rows);
    if (rows > 1) {
      setRows(rows - 1);
      // 기존 테이블 데이터 배열의 마지막 요소를 제거 (slice를 이용해 끝부분 제외)
      setTableData(tableData.slice(0, -1));
      console.log("행 삭제 처리 완료. 변경된 행 개수:", rows - 1);
    } else {
      console.log("행 개수가 1개 이하이므로 삭제 동작 취소");
    }
  };

  // 열 추가 기능을 수행하는 함수
  const handleAddCol = () => {
    console.log("열 추가 버튼 클릭됨. 현재 열 개수:", cols);
    setCols(cols + 1);
    // 각 행(row)을 순회하며 배열 끝에 빈 문자열('') 요소를 하나씩 덧붙임
    const newData = tableData.map(row => [...row, '']);
    setTableData(newData);
    console.log("열 추가 처리 완료. 변경된 열 개수:", cols + 1);
  };

  // 열 삭제 기능을 수행하는 함수
  const handleRemoveCol = () => {
    console.log("열 삭제 버튼 클릭됨. 현재 열 개수:", cols);
    if (cols > 1) {
      setCols(cols - 1);
      // 각 행(row)을 순회하며 배열의 마지막 요소를 잘라내고 반환
      const newData = tableData.map(row => row.slice(0, -1));
      setTableData(newData);
      console.log("열 삭제 처리 완료. 변경된 열 개수:", cols - 1);
    } else {
      console.log("열 개수가 1개 이하이므로 삭제 동작 취소");
    }
  };

  // 각 셀의 인풋 데이터가 변경될 때 호출되는 핸들러
  const handleCellChange = (rowIndex, colIndex, value) => {
    console.log(`셀 데이터 변경 감지. 위치: [${rowIndex}, ${colIndex}], 입력된 값: ${value}`);
    // 상태의 불변성을 유지하기 위해 기존 2차원 배열을 복사
    const newData = [...tableData];
    // 배열 복제 과정에서 내부 배열의 참조가 유지될 수 있으므로, 변경할 행을 새로 복사하여 할당
    newData[rowIndex] = [...newData[rowIndex]];
    newData[rowIndex][colIndex] = value;
    setTableData(newData);
  };

  // 표 생성 적용 버튼 클릭 시 마크다운 문법으로 변환하여 부모에 전달하는 함수
  const handleApply = () => {
    console.log("표 모달 적용 버튼 클릭됨. 마크다운 변환 프로세스 시작");
    
    // 최종 결과물인 마크다운 문자열을 담을 변수 선언 (가독성을 위해 첫 줄 띄움)
    let markdownTable = '\n';
    
    tableData.forEach((row, rowIndex) => {
      // 각 셀 데이터들을 ' | ' 로 연결하고, 양 끝에 '|' 를 붙여 마크다운 표의 한 행을 완성
      const rowString = '| ' + row.join(' | ') + ' |';
      markdownTable += rowString + '\n';
      console.log(`${rowIndex}번째 행 마크다운 생성 됨:`, rowString);

      // 첫 번째 행(헤더 부분) 바로 다음 줄에는 마크다운 표 문법의 구분선(---)을 반드시 추가해야 함
      if (rowIndex === 0) {
        // 현재 열(cols)의 개수만큼 ' --- '를 채운 배열을 만들고 '|'로 결합
        const separator = '|' + Array(cols).fill(' --- ').join('|') + '|';
        markdownTable += separator + '\n';
        console.log("헤더 구분선 마크다운 생성 됨:", separator);
      }
    });

    // 표 생성이 완료된 후 한 줄을 띄워 다른 문단과 겹치지 않게 방지
    markdownTable += '\n';
    console.log("최종 생성된 마크다운 표 문자열 전체 형태:\n", markdownTable);
    
    // 부모 컴포넌트(Editor.jsx)로 변환된 마크다운 문자열 전달 실행
    onInsert(markdownTable);
    console.log("부모 컴포넌트에 표 마크다운 전달 로직 호출 완료, 모달 창 닫기 요청");
    onClose(); // 처리가 끝난 뒤 모달 창 닫기
  };

  return (
    <div className="table-modal-overlay" onClick={() => { console.log("오버레이 백그라운드 클릭 감지됨. 모달 닫기 요청"); onClose(); }}>
      {/* 모달 내부 클릭 시 이벤트가 오버레이로 전파(Propagation)되어 창이 닫히는 현상을 방지 
      */}
      <div className="table-modal" onClick={(e) => { console.log("모달 내부 창 클릭됨 (이벤트 전파 차단됨)"); e.stopPropagation(); }}>
        <h3>표 삽입</h3>
        
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
        </div>

        <div className="table-modal-grid-container">
          <table className="table-modal-grid">
            <tbody>
              {/* tableData의 상태 배열 구조를 화면의 실제 표와 인풋 박스로 매핑하여 렌더링 */}
              {tableData.map((row, rowIndex) => {
                console.log(`${rowIndex}번째 행 렌더링 시작`);
                return (
                  <tr key={`row-${rowIndex}`}>
                    {row.map((cell, colIndex) => {
                      console.log(` -> ${rowIndex}행 ${colIndex}열 셀 렌더링`);
                      return (
                        <td key={`cell-${rowIndex}-${colIndex}`}>
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                            placeholder={rowIndex === 0 ? "헤더" : "내용"}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="table-modal-actions">
          <button className="btn-cancel" onClick={() => { console.log("모달 취소 버튼 클릭됨. 모달 창 닫기 요청"); onClose(); }}>취소</button>
          <button className="btn-apply" onClick={handleApply}>표 적용</button>
        </div>
      </div>
    </div>
  );
}

export default TableModal;