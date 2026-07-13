// src/hooks/table/useTableGrid.js v3.0
/*
 * 파일 설명: HTML 표의 데이터 구조(병합, 분할, 삽입, 삭제) 및 셀의 서식(스타일, 색상) 상태를 관리하는 커스텀 훅
 * 연결 위치: src/components/HtmlTableModal.jsx
 */
import { useState, useCallback } from 'react';
import { parseHtmlToGrid } from '../../utils/htmlTableParser';

export const useTableGrid = () => {
  console.log("useTableGrid 훅(v3.0) 초기화 시작");
  
  const [grid, setGrid] = useState([]);
  const [focusedCell, setFocusedCell] = useState(null);

  const initGrid = useCallback((initialHtml) => {
    console.log("initGrid 실행");
    if (initialHtml && initialHtml.includes('<table')) {
      const parsedGrid = parseHtmlToGrid(initialHtml);
      if (parsedGrid) {
        setGrid(parsedGrid);
        setFocusedCell(null);
        return;
      }
    }
    setGrid(
      Array.from({ length: 3 }, (_, r) =>
        Array.from({ length: 3 }, () => ({
          text: '', align: r === 0 ? 'center' : 'left', rowSpan: 1, colSpan: 1, isHidden: false,
          bold: false, italic: false, strike: false, color: '', bgColor: ''
        }))
      )
    );
    setFocusedCell(null);
  }, []);

  const handleCellChange = (r, c, value) => {
    console.log(`텍스트 변경 - 위치: [${r}, ${c}]`);
    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      newGrid[r][c] = { ...newGrid[r][c], text: value };
      return newGrid;
    });
  };

  const handleAlignChange = (align) => {
    if (!focusedCell) return;
    const { r, c } = focusedCell;
    console.log(`정렬 변경 - 위치: [${r}, ${c}], 방향: ${align}`);
    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      newGrid[r][c] = { ...newGrid[r][c], align };
      return newGrid;
    });
  };

  // [신규] 서식 토글 (bold, italic, strike)
  const toggleFormat = (formatType) => {
    if (!focusedCell) return;
    const { r, c } = focusedCell;
    console.log(`서식 변경 - 위치: [${r}, ${c}], 타입: ${formatType}`);
    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      newGrid[r][c] = { ...newGrid[r][c], [formatType]: !newGrid[r][c][formatType] };
      return newGrid;
    });
  };

  // [신규] 색상 적용 (color, bgColor)
  const applyColor = (colorType, colorValue) => {
    if (!focusedCell) return;
    const { r, c } = focusedCell;
    console.log(`색상 적용 - 위치: [${r}, ${c}], 타입: ${colorType}, 값: ${colorValue}`);
    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      newGrid[r][c] = { ...newGrid[r][c], [colorType]: colorValue };
      return newGrid;
    });
  };

  // 서식 초기화
  const clearFormatting = () => {
    if (!focusedCell) return;
    const { r, c } = focusedCell;
    console.log(`서식 초기화 - 위치: [${r}, ${c}]`);
    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      newGrid[r][c] = { 
        ...newGrid[r][c], 
        bold: false, italic: false, strike: false, color: '', bgColor: '' 
      };
      return newGrid;
    });
  };

  const insertRowAt = (targetRIndex) => {
    console.log(`행 삽입: ${targetRIndex}`);
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
      if (focusedCell && focusedCell.r >= targetRIndex) {
        setFocusedCell({ r: focusedCell.r + 1, c: focusedCell.c });
      }
      return newGrid;
    });
  };

  const removeRowAt = (targetRIndex) => {
    console.log(`행 삭제: ${targetRIndex}`);
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
      return newGrid;
    });
  };

  const insertColAt = (targetCIndex) => {
    console.log(`열 삽입: ${targetCIndex}`);
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
      if (focusedCell && focusedCell.c >= targetCIndex) {
        setFocusedCell({ r: focusedCell.r, c: focusedCell.c + 1 });
      }
      return newGrid;
    });
  };

  const removeColAt = (targetCIndex) => {
    console.log(`열 삭제: ${targetCIndex}`);
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
    toggleFormat, applyColor, clearFormatting // 신규 추출
  };
};