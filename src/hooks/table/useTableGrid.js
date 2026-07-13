/* src/hooks/table/useTableGrid.js v4.0 */
/*
 * 파일 설명: 표의 데이터, 구조, 서식 상태뿐만 아니라 다중 선택(Drag) 영역과 실행 취소(History) 로직까지 총괄하는 훅
 * 연결 위치: src/components/HtmlTableModal.jsx
 */
import { useState, useCallback } from 'react';
import { parseHtmlToGrid } from '../../utils/htmlTableParser';

export const useTableGrid = () => {
  console.log("useTableGrid 훅(v4.0) 초기화 시작 - History 및 Selection 기능 포함");
  
  const [grid, setGridState] = useState([]);
  const [focusedCell, setFocusedCell] = useState(null);
  
  // 다중 셀 선택 영역 상태: { minR, maxR, minC, maxC }
  const [selectionArea, setSelectionArea] = useState(null);
  
  // 실행 취소/다시 실행을 위한 히스토리 스택
  const [history, setHistory] = useState({ past: [], future: [] });

  // 상태를 업데이트하면서 과거(past) 스택에 현재 상태를 저장하는 래퍼 함수
  const setGrid = useCallback((action) => {
    setGridState(prev => {
      const nextGrid = typeof action === 'function' ? action(prev) : action;
      // 깊은 복사를 통해 이전 상태를 히스토리에 저장
      const snapshot = prev.map(row => row.map(cell => ({ ...cell })));
      setHistory(h => ({ past: [...h.past, snapshot], future: [] }));
      return nextGrid;
    });
  }, []);

  const undo = () => {
    setGridState(prev => {
      if (history.past.length === 0) return prev;
      const previousGrid = history.past[history.past.length - 1];
      setHistory(h => ({
        past: h.past.slice(0, -1),
        future: [prev, ...h.future]
      }));
      return previousGrid;
    });
  };

  const redo = () => {
    setGridState(prev => {
      if (history.future.length === 0) return prev;
      const nextGrid = history.future[0];
      setHistory(h => ({
        past: [...h.past, prev],
        future: h.future.slice(1)
      }));
      return nextGrid;
    });
  };

  const initGrid = useCallback((initialHtml) => {
    console.log("initGrid 실행");
    if (initialHtml && initialHtml.includes('<table')) {
      const parsedGrid = parseHtmlToGrid(initialHtml);
      if (parsedGrid) {
        setGridState(parsedGrid);
        setHistory({ past: [], future: [] });
        setFocusedCell(null);
        setSelectionArea(null);
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
    setHistory({ past: [], future: [] });
    setFocusedCell(null);
    setSelectionArea(null);
  }, []);

  // 텍스트 입력은 타자마다 히스토리가 쌓이면 불편하므로 setGridState로 직접 변경 (입력 완료 시점에만 히스토리 저장 고려 가능)
  const handleCellChange = (r, c, value) => {
    setGridState(prev => {
      const newGrid = prev.map(row => [...row]);
      newGrid[r][c] = { ...newGrid[r][c], text: value };
      return newGrid;
    });
  };

  // 선택된 단일 셀 또는 다중 영역의 모든 셀에 콜백을 적용하는 유틸리티 함수
  const applyToSelection = (callback) => {
    if (!focusedCell && !selectionArea) return;
    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      if (selectionArea) {
        for (let r = selectionArea.minR; r <= selectionArea.maxR; r++) {
          for (let c = selectionArea.minC; c <= selectionArea.maxC; c++) {
            if (!newGrid[r][c].isHidden) callback(newGrid[r][c]);
          }
        }
      } else if (focusedCell) {
        callback(newGrid[focusedCell.r][focusedCell.c]);
      }
      return newGrid;
    });
  };

  const handleAlignChange = (align) => {
    console.log(`정렬 일괄 변경: ${align}`);
    applyToSelection(cell => { cell.align = align; });
  };

  const toggleFormat = (formatType) => {
    console.log(`서식 일괄 토글: ${formatType}`);
    applyToSelection(cell => { cell[formatType] = !cell[formatType]; });
  };

  const applyColor = (colorType, colorValue) => {
    console.log(`색상 일괄 적용: ${colorType} = ${colorValue}`);
    applyToSelection(cell => { cell[colorType] = colorValue; });
  };

  const clearFormatting = () => {
    console.log(`서식 일괄 초기화`);
    applyToSelection(cell => {
      cell.bold = false; cell.italic = false; cell.strike = false;
      cell.color = ''; cell.bgColor = '';
    });
  };

  // 구조 변경 로직 (행/열 추가, 삭제)
  const insertRowAt = (targetRIndex) => {
    setGrid(prev => {
      const cols = prev[0].length;
      const newRow = [];
      const newGrid = prev.map(row => row.map(c => ({ ...c })));

      for (let c = 0; c < cols; c++) {
        let spanningCellFound = false;
        for (let checkR = targetRIndex - 1; checkR >= 0; checkR--) {
          const cell = newGrid[checkR][c];
          if (!cell.isHidden && cell.rowSpan > (targetRIndex - checkR)) {
            cell.rowSpan += 1;
            newRow.push({ text: '', align: cell.align, rowSpan: 1, colSpan: 1, isHidden: true, bold: false, italic: false, strike: false, color: '', bgColor: '' });
            spanningCellFound = true;
            break;
          }
        }
        if (!spanningCellFound) {
          newRow.push({ text: '', align: 'left', rowSpan: 1, colSpan: 1, isHidden: false, bold: false, italic: false, strike: false, color: '', bgColor: '' });
        }
      }
      newGrid.splice(targetRIndex, 0, newRow);
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
      setFocusedCell(null);
      setSelectionArea(null);
      return newGrid;
    });
  };

  const insertColAt = (targetCIndex) => {
    setGrid(prev => {
      const newGrid = prev.map(row => row.map(c => ({ ...c })));
      for (let r = 0; r < newGrid.length; r++) {
        let spanningCellFound = false;
        for (let checkC = targetCIndex - 1; checkC >= 0; checkC--) {
          const cell = newGrid[r][checkC];
          if (!cell.isHidden && cell.colSpan > (targetCIndex - checkC)) {
            cell.colSpan += 1;
            newGrid[r].splice(targetCIndex, 0, { text: '', align: cell.align, rowSpan: 1, colSpan: 1, isHidden: true, bold: false, italic: false, strike: false, color: '', bgColor: '' });
            spanningCellFound = true;
            break;
          }
        }
        if (!spanningCellFound) {
          newGrid[r].splice(targetCIndex, 0, { text: '', align: r === 0 ? 'center' : 'left', rowSpan: 1, colSpan: 1, isHidden: false, bold: false, italic: false, strike: false, color: '', bgColor: '' });
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
      setFocusedCell(null);
      setSelectionArea(null);
      return newGrid;
    });
  };

  const insertRowAbove = () => focusedCell ? insertRowAt(focusedCell.r) : null;
  const insertRowBelow = () => focusedCell ? insertRowAt(focusedCell.r + 1) : null;
  const insertColLeft = () => focusedCell ? insertColAt(focusedCell.c) : null;
  const insertColRight = () => focusedCell ? insertColAt(focusedCell.c + 1) : null;
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
    grid, focusedCell, setFocusedCell, initGrid, handleCellChange, handleAlignChange,
    insertRowAbove, insertRowBelow, insertColLeft, insertColRight, deleteFocusedRow, deleteFocusedCol,
    mergeRight, mergeDown, unmerge,
    toggleFormat, applyColor, clearFormatting,
    selectionArea, setSelectionArea,
    undo, redo, canUndo: history.past.length > 0, canRedo: history.future.length > 0
  };
};