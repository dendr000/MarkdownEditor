/* src/hooks/table/useTableGrid.js v6.0 */
/*
 * 파일 설명: 다중 삽입(count), 다중 비연속 셀 선택(selectedCellKeys), 일괄 붙여넣기 및 히스토리 관리를 모두 통제하는 상태 관리 훅
 */
import { useState, useCallback } from 'react';
import { parseHtmlToGrid } from '../../utils/htmlTableParser';

export const useTableGrid = () => {
  console.log("useTableGrid 훅(v6.0) 초기화 - Ctrl 다중 선택 및 다중 삽입 지원");
  
  const [grid, setGridState] = useState([]);
  const [caption, setCaptionState] = useState('');
  const [focusedCell, setFocusedCell] = useState(null);
  
  // Ctrl 키를 이용한 다중 선택 및 드래그 영역을 모두 저장하는 배열 (형태: ["0,0", "0,1", "2,3"])
  const [selectedCellKeys, setSelectedCellKeys] = useState([]);
  
  // 삽입할 행/열의 개수를 관리하는 State (기본값 1)
  const [insertCount, setInsertCount] = useState(1);
  
  const [history, setHistory] = useState({ past: [], future: [] });

  const setGrid = useCallback((action) => {
    setGridState(prev => {
      const nextGrid = typeof action === 'function' ? action(prev) : action;
      const snapshot = prev.map(row => row.map(cell => ({ ...cell })));
      setHistory(h => ({ past: [...h.past, { grid: snapshot, caption }], future: [] }));
      return nextGrid;
    });
  }, [caption]);

  const updateCaption = (newCaption) => {
    setHistory(h => {
      const snapshot = grid.map(row => row.map(cell => ({ ...cell })));
      return { past: [...h.past, { grid: snapshot, caption }], future: [] };
    });
    setCaptionState(newCaption);
  };

  const undo = () => {
    if (history.past.length === 0) return;
    const previous = history.past[history.past.length - 1];
    setHistory(h => ({
      past: h.past.slice(0, -1),
      future: [{ grid, caption }, ...h.future]
    }));
    setGridState(previous.grid);
    setCaptionState(previous.caption);
  };

  const redo = () => {
    if (history.future.length === 0) return;
    const next = history.future[0];
    setHistory(h => ({
      past: [...h.past, { grid, caption }],
      future: h.future.slice(1)
    }));
    setGridState(next.grid);
    setCaptionState(next.caption);
  };

  const initGrid = useCallback((initialHtml) => {
    if (initialHtml && initialHtml.includes('<table')) {
      const parsed = parseHtmlToGrid(initialHtml);
      if (parsed && parsed.grid) {
        setGridState(parsed.grid);
        setCaptionState(parsed.caption || '');
        setHistory({ past: [], future: [] });
        setFocusedCell(null);
        setSelectedCellKeys([]);
        return;
      }
    }
    setGridState(
      Array.from({ length: 3 }, (_, r) =>
        Array.from({ length: 3 }, () => ({
          text: '', align: r === 0 ? 'center' : 'left', rowSpan: 1, colSpan: 1, isHidden: false,
          bold: false, italic: false, strike: false, color: '', bgColor: ''
        }))
      )
    );
    setCaptionState('');
    setHistory({ past: [], future: [] });
    setFocusedCell(null);
    setSelectedCellKeys([]);
  }, []);

  const handleCellChange = (r, c, value) => {
    setGridState(prev => {
      const newGrid = prev.map(row => [...row]);
      newGrid[r][c] = { ...newGrid[r][c], text: value };
      return newGrid;
    });
  };

  // 선택된 배열의 모든 셀에 함수를 적용하는 유틸리티
  const applyToSelection = (callback) => {
    if (!focusedCell && selectedCellKeys.length === 0) return;
    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      if (selectedCellKeys.length > 0) {
        selectedCellKeys.forEach(key => {
          const [r, c] = key.split(',').map(Number);
          if (newGrid[r] && newGrid[r][c] && !newGrid[r][c].isHidden) {
            callback(newGrid[r][c]);
          }
        });
      } else if (focusedCell) {
        callback(newGrid[focusedCell.r][focusedCell.c]);
      }
      return newGrid;
    });
  };

  const handleAlignChange = (align) => applyToSelection(cell => { cell.align = align; });
  const applyColor = (colorType, colorValue) => applyToSelection(cell => { cell[colorType] = colorValue; });
  const clearFormatting = () => applyToSelection(cell => {
    cell.bold = false; cell.italic = false; cell.strike = false; cell.color = ''; cell.bgColor = '';
  });
  const clearSelectedContents = () => applyToSelection(cell => { cell.text = ''; });

  // 함수 설명: 선택된 단일 셀 혹은 다중 선택 영역(selectedCellKeys) 내 모든 셀의 특정 텍스트 서식(bold, italic, strike) 상태를 반전(Toggle)시킵니다.
  // 변경 사항: selectedCellKeys의 배열 검증 방식을 length로 변경하고 데이터 분할 기준 식별자를 콤마(,) 기호로 수정하여 그리드 컴포넌트와 연동 성능을 확보했습니다.
  const toggleFormat = (formatType) => {
    console.log(`[useTableGrid v6.1] toggleFormat 함수 진입 - 토글 대상 서식 종류: ${formatType}`);
    
    setGrid(prev => {
      console.log("[useTableGrid v6.1] 서식 변경을 위해 기존 상태 그리드 데이터 복제본 생성 시작");
      // 데이터 원본의 불변성을 보장하기 위해 2차원 배열의 행 단위를 얕은 복사 처리합니다.
      const newGrid = prev.map(row => [...row]);
      
      // selectedCellKeys가 배열 형식이므로 length 속성을 검증하여 비연속 다중 드래그 셀 선택 영역 유무를 확인합니다.
      if (selectedCellKeys && selectedCellKeys.length > 0) {
        console.log(`[useTableGrid v6.1] 다중 선택 타겟 검명 감지 성공. 대상 셀 개수: ${selectedCellKeys.length}개`);
        
        selectedCellKeys.forEach(key => {
          // HtmlTableGrid 컴포넌트의 데이터 조합 방식인 "행,열" 형태를 콤마 기준으로 분리하여 인덱스를 추출합니다.
          const [r, c] = key.split(',').map(Number);
          
          // 연산 과정 중 잘못된 인덱스 접근으로 인한 스크립트 에러를 방지하기 위해 상위 행렬 노드의 존재 유무를 검증합니다.
          if (newGrid[r] && newGrid[r][c]) {
            console.log(`[useTableGrid v6.1] 다중 셀 서식 일괄 업데이트 처리 중 - 매핑 좌표: [${r}, ${c}]`);
            const currentStatus = !!newGrid[r][c][formatType];
            newGrid[r][c] = { 
              ...newGrid[r][c], 
              [formatType]: !currentStatus 
            };
          }
        });
      } 
      // 다중 선택 영역이 설정되지 않은 경우 현재 입력 포커스가 머물러 있는 단일 타겟 셀을 제어합니다.
      else if (focusedCell) {
        const { r, c } = focusedCell;
        console.log(`[useTableGrid v6.1] 단일 활성 포커스 셀 대상 서식 변경 처리 가동 - 매핑 좌표: [${r}, ${c}]`);
        
        if (newGrid[r] && newGrid[r][c]) {
          const currentStatus = !!newGrid[r][c][formatType];
          newGrid[r][c] = { 
            ...newGrid[r][c], 
            [formatType]: !currentStatus 
          };
          console.log(`[useTableGrid v6.1] 단일 셀 서식 변경 완료 - 변경 후 상태: ${!currentStatus}`);
        }
      } else {
        console.log("[useTableGrid v6.1] 경고: 활성화된 셀 포커스 또는 다중 드래그 영역 데이터가 확인되지 않아 서식 연산을 취소합니다.");
      }
      
      console.log("[useTableGrid v6.1] 서식 토글 연산 완료 - 갱신된 신규 그리드 행렬 배열 반환");
      return newGrid;
    });
  };

  // [신규 기능] 다중 선택 영역에 텍스트 일괄 붙여넣기
  const pasteToSelectedCells = (text) => {
    applyToSelection(cell => { cell.text = text; });
  };

  // 다중 행 삽입 로직 (insertCount 만큼 반복)
  const insertRowAt = (targetRIndex, count = 1) => {
    setGrid(prev => {
      let newGrid = prev.map(row => row.map(c => ({ ...c })));
      for (let step = 0; step < count; step++) {
        const currentTargetRIndex = targetRIndex + step;
        const cols = newGrid[0].length;
        const newRow = [];
        
        for (let c = 0; c < cols; c++) {
          let spanningCellFound = false;
          for (let checkR = currentTargetRIndex - 1; checkR >= 0; checkR--) {
            const cell = newGrid[checkR][c];
            if (!cell.isHidden && cell.rowSpan > (currentTargetRIndex - checkR)) {
              cell.rowSpan += 1;
              newRow.push({ text: '', align: cell.align, rowSpan: 1, colSpan: 1, isHidden: true, bold: false, italic: false, strike: false, color: '', bgColor: '' });
              spanningCellFound = true;
              break;
            }
          }
          if (!spanningCellFound) newRow.push({ text: '', align: 'left', rowSpan: 1, colSpan: 1, isHidden: false, bold: false, italic: false, strike: false, color: '', bgColor: '' });
        }
        newGrid.splice(currentTargetRIndex, 0, newRow);
      }
      return newGrid;
    });
  };

  const removeRowAt = (targetRIndex) => {
    setGrid(prev => {
      if (prev.length <= 1) return prev;
      const newGrid = prev.map(row => row.map(c => ({ ...c })));
      const cols = newGrid[0].length;
      for (let c = 0; c < cols; c++) {
        const cell = newGrid[targetRIndex][c];
        if (!cell.isHidden && cell.rowSpan > 1) {
          const nextRowCell = newGrid[targetRIndex + 1][c];
          Object.assign(nextRowCell, { ...cell, isHidden: false, rowSpan: cell.rowSpan - 1 });
        } else if (cell.isHidden) {
          for (let checkR = targetRIndex - 1; checkR >= 0; checkR--) {
            const upCell = newGrid[checkR][c];
            if (!upCell.isHidden && upCell.rowSpan > (targetRIndex - checkR)) {
              upCell.rowSpan -= 1;
              break;
            }
          }
        }
      }
      newGrid.splice(targetRIndex, 1);
      setFocusedCell(null); setSelectedCellKeys([]);
      return newGrid;
    });
  };

  // 다중 열 삽입 로직 (insertCount 만큼 반복)
  const insertColAt = (targetCIndex, count = 1) => {
    setGrid(prev => {
      let newGrid = prev.map(row => row.map(c => ({ ...c })));
      for (let step = 0; step < count; step++) {
        const currentTargetCIndex = targetCIndex + step;
        for (let r = 0; r < newGrid.length; r++) {
          let spanningCellFound = false;
          for (let checkC = currentTargetCIndex - 1; checkC >= 0; checkC--) {
            const cell = newGrid[r][checkC];
            if (!cell.isHidden && cell.colSpan > (currentTargetCIndex - checkC)) {
              cell.colSpan += 1;
              newGrid[r].splice(currentTargetCIndex, 0, { text: '', align: cell.align, rowSpan: 1, colSpan: 1, isHidden: true, bold: false, italic: false, strike: false, color: '', bgColor: '' });
              spanningCellFound = true;
              break;
            }
          }
          if (!spanningCellFound) newGrid[r].splice(currentTargetCIndex, 0, { text: '', align: r === 0 ? 'center' : 'left', rowSpan: 1, colSpan: 1, isHidden: false, bold: false, italic: false, strike: false, color: '', bgColor: '' });
        }
      }
      return newGrid;
    });
  };

  const removeColAt = (targetCIndex) => {
    setGrid(prev => {
      if (prev[0].length <= 1) return prev;
      const newGrid = prev.map(row => row.map(c => ({ ...c })));
      for (let r = 0; r < newGrid.length; r++) {
        const cell = newGrid[r][targetCIndex];
        if (!cell.isHidden && cell.colSpan > 1) {
          const nextColCell = newGrid[r][targetCIndex + 1];
          Object.assign(nextColCell, { ...cell, isHidden: false, colSpan: cell.colSpan - 1 });
        } else if (cell.isHidden) {
          for (let checkC = targetCIndex - 1; checkC >= 0; checkC--) {
            const leftCell = newGrid[r][checkC];
            if (!leftCell.isHidden && leftCell.colSpan > (targetCIndex - checkC)) {
              leftCell.colSpan -= 1;
              break;
            }
          }
        }
      }
      newGrid.forEach(row => row.splice(targetCIndex, 1));
      setFocusedCell(null); setSelectedCellKeys([]);
      return newGrid;
    });
  };

  const insertRowAbove = () => focusedCell ? insertRowAt(focusedCell.r, insertCount) : null;
  const insertRowBelow = () => focusedCell ? insertRowAt(focusedCell.r + 1, insertCount) : null;
  const insertColLeft = () => focusedCell ? insertColAt(focusedCell.c, insertCount) : null;
  const insertColRight = () => focusedCell ? insertColAt(focusedCell.c + 1, insertCount) : null;
  const deleteFocusedRow = () => focusedCell ? removeRowAt(focusedCell.r) : null;
  const deleteFocusedCol = () => focusedCell ? removeColAt(focusedCell.c) : null;

  const mergeRight = () => {
    if (!focusedCell) return;
    const { r, c } = focusedCell;
    setGrid(prev => {
      const newGrid = prev.map(row => row.map(cell => ({ ...cell })));
      const current = newGrid[r][c];
      const targetC = c + current.colSpan;
      if (targetC < newGrid[0].length) {
        const target = newGrid[r][targetC];
        if (!target.isHidden && target.rowSpan === current.rowSpan) {
          current.colSpan += target.colSpan;
          for (let rr = 0; rr < target.rowSpan; rr++) {
            for (let cc = 0; cc < target.colSpan; cc++) {
              newGrid[r + rr][targetC + cc].isHidden = true;
              newGrid[r + rr][targetC + cc].text = ''; 
            }
          }
        }
      }
      return newGrid;
    });
  };

  const mergeDown = () => {
    if (!focusedCell) return;
    const { r, c } = focusedCell;
    setGrid(prev => {
      const newGrid = prev.map(row => row.map(cell => ({ ...cell })));
      const current = newGrid[r][c];
      const targetR = r + current.rowSpan;
      if (targetR < newGrid.length) {
        const target = newGrid[targetR][c];
        if (!target.isHidden && target.colSpan === current.colSpan) {
          current.rowSpan += target.rowSpan;
          for (let rr = 0; rr < target.rowSpan; rr++) {
            for (let cc = 0; cc < target.colSpan; cc++) {
              newGrid[targetR + rr][c + cc].isHidden = true;
              newGrid[targetR + rr][c + cc].text = '';
            }
          }
        }
      }
      return newGrid;
    });
  };

  const unmerge = () => {
    if (!focusedCell) return;
    const { r, c } = focusedCell;
    setGrid(prev => {
      const newGrid = prev.map(row => row.map(cell => ({ ...cell })));
      const current = newGrid[r][c];
      if (current.rowSpan > 1 || current.colSpan > 1) {
        for (let rr = 0; rr < current.rowSpan; rr++) {
          for (let cc = 0; cc < current.colSpan; cc++) {
            if (rr === 0 && cc === 0) continue;
            newGrid[r + rr][c + cc].isHidden = false;
          }
        }
        current.rowSpan = 1;
        current.colSpan = 1;
      }
      return newGrid;
    });
  };

  return {
    grid, caption, updateCaption,
    insertCount, setInsertCount, // 다중 삽입 상태 전달
    focusedCell, setFocusedCell, initGrid, handleCellChange, handleAlignChange,
    insertRowAbove, insertRowBelow, insertColLeft, insertColRight, deleteFocusedRow, deleteFocusedCol,
    mergeRight, mergeDown, unmerge,
    toggleFormat, applyColor, clearFormatting, clearSelectedContents, pasteToSelectedCells,
    selectedCellKeys, setSelectedCellKeys, // 새로운 배열 형태의 선택 영역 전달
    undo, redo, canUndo: history.past.length > 0, canRedo: history.future.length > 0
  };
};