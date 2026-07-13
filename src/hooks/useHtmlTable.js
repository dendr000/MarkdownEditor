// src/hooks/useHtmlTable.js v1.0
/*
 * 파일 설명: HTML 표의 데이터(텍스트, 정렬) 및 구조(병합, 분할, 행/열 추가 삭제) 상태를 관리하는 커스텀 훅
 * 연결 위치: src/components/HtmlTableModal.jsx 내에서 호출되어 사용됨
 */
import { useState, useCallback } from 'react';
import { parseHtmlToGrid } from '../utils/htmlTableParser';

export const useHtmlTable = () => {
  console.log("useHtmlTable 훅 초기화");
  
  const [grid, setGrid] = useState([]);
  const [focusedCell, setFocusedCell] = useState(null);

  // 초기 표 세팅 (문자열 파싱 또는 3x3 기본값)
  const initGrid = useCallback((initialHtml) => {
    console.log("initGrid 실행 - 초기 HTML 검사");
    if (initialHtml && initialHtml.includes('<table')) {
      const parsedGrid = parseHtmlToGrid(initialHtml);
      if (parsedGrid) {
        setGrid(parsedGrid);
        setFocusedCell(null);
        return;
      }
    }
    console.log("파싱 가능한 HTML이 없어 기본 3x3 표로 초기화");
    setGrid(
      Array.from({ length: 3 }, (_, r) =>
        Array.from({ length: 3 }, () => ({
          text: '', align: r === 0 ? 'center' : 'left', rowSpan: 1, colSpan: 1, isHidden: false
        }))
      )
    );
    setFocusedCell(null);
  }, []);

  const handleCellChange = (r, c, value) => {
    console.log(`텍스트 변경 - 위치: [${r}, ${c}], 내용: ${value}`);
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

  const addRow = () => {
    console.log("행 추가");
    setGrid(prev => {
      const colsCount = prev[0].length;
      const newRow = Array.from({ length: colsCount }, () => ({
        text: '', align: 'left', rowSpan: 1, colSpan: 1, isHidden: false
      }));
      return [...prev, newRow];
    });
  };

  const removeRow = () => {
    console.log("행 삭제");
    setGrid(prev => {
      if (prev.length <= 1) return prev;
      const newGrid = prev.map(row => row.map(cell => ({ ...cell })));
      const lastRowIdx = newGrid.length - 1;

      // 마지막 행을 삭제할 때, 위에서 병합되어 내려온 셀이 있다면 span 값을 줄여서 찌그러짐 방지
      for (let r = 0; r < lastRowIdx; r++) {
        for (let c = 0; c < newGrid[r].length; c++) {
          const cell = newGrid[r][c];
          if (!cell.isHidden && cell.rowSpan > 1 && r + cell.rowSpan - 1 >= lastRowIdx) {
            cell.rowSpan -= 1;
          }
        }
      }
      newGrid.pop();
      setFocusedCell(null);
      return newGrid;
    });
  };

  const addCol = () => {
    console.log("열 추가");
    setGrid(prev => {
      return prev.map((row, rIndex) => [
        ...row,
        { text: '', align: rIndex === 0 ? 'center' : 'left', rowSpan: 1, colSpan: 1, isHidden: false }
      ]);
    });
  };

  const removeCol = () => {
    console.log("열 삭제");
    setGrid(prev => {
      if (prev[0].length <= 1) return prev;
      const newGrid = prev.map(row => row.map(cell => ({ ...cell })));
      const lastColIdx = newGrid[0].length - 1;

      // 마지막 열을 삭제할 때, 왼쪽에서 병합되어 넘어온 셀이 있다면 span 값을 줄임
      for (let r = 0; r < newGrid.length; r++) {
        for (let c = 0; c < lastColIdx; c++) {
          const cell = newGrid[r][c];
          if (!cell.isHidden && cell.colSpan > 1 && c + cell.colSpan - 1 >= lastColIdx) {
            cell.colSpan -= 1;
          }
        }
      }
      newGrid.forEach(row => row.pop());
      setFocusedCell(null);
      return newGrid;
    });
  };

  // 우측 셀과 병합
  const mergeRight = () => {
    if (!focusedCell) return;
    const { r, c } = focusedCell;
    console.log(`우측 병합 시도 - 기준: [${r}, ${c}]`);
    
    setGrid(prev => {
      const newGrid = prev.map(row => row.map(cell => ({ ...cell })));
      const current = newGrid[r][c];
      const targetC = c + current.colSpan;

      if (targetC < newGrid[0].length) {
        const target = newGrid[r][targetC];
        // 목표 셀이 숨겨져있지 않고 행 병합 상태(rowSpan)가 동일할 때만 우측 병합 허용
        if (!target.isHidden && target.rowSpan === current.rowSpan) {
          current.colSpan += target.colSpan;
          // 타겟 셀 영역을 숨김 처리
          for (let rr = 0; rr < target.rowSpan; rr++) {
            for (let cc = 0; cc < target.colSpan; cc++) {
              newGrid[r + rr][targetC + cc].isHidden = true;
              newGrid[r + rr][targetC + cc].text = ''; // 내용 삭제
            }
          }
          console.log("우측 병합 완료");
        } else {
          console.log("우측 병합 불가: 높이가 다르거나 이미 병합된 셀입니다.");
        }
      }
      return newGrid;
    });
  };

  // 하단 셀과 병합
  const mergeDown = () => {
    if (!focusedCell) return;
    const { r, c } = focusedCell;
    console.log(`하단 병합 시도 - 기준: [${r}, ${c}]`);

    setGrid(prev => {
      const newGrid = prev.map(row => row.map(cell => ({ ...cell })));
      const current = newGrid[r][c];
      const targetR = r + current.rowSpan;

      if (targetR < newGrid.length) {
        const target = newGrid[targetR][c];
        // 목표 셀이 숨겨져있지 않고 열 병합 상태(colSpan)가 동일할 때만 하단 병합 허용
        if (!target.isHidden && target.colSpan === current.colSpan) {
          current.rowSpan += target.rowSpan;
          // 타겟 셀 영역을 숨김 처리
          for (let rr = 0; rr < target.rowSpan; rr++) {
            for (let cc = 0; cc < target.colSpan; cc++) {
              newGrid[targetR + rr][c + cc].isHidden = true;
              newGrid[targetR + rr][c + cc].text = '';
            }
          }
          console.log("하단 병합 완료");
        } else {
          console.log("하단 병합 불가: 너비가 다르거나 이미 병합된 셀입니다.");
        }
      }
      return newGrid;
    });
  };

  // 병합 해제 (단일 셀로 원상복구)
  const unmerge = () => {
    if (!focusedCell) return;
    const { r, c } = focusedCell;
    console.log(`병합 해제 시도 - 기준: [${r}, ${c}]`);

    setGrid(prev => {
      const newGrid = prev.map(row => row.map(cell => ({ ...cell })));
      const current = newGrid[r][c];

      if (current.rowSpan > 1 || current.colSpan > 1) {
        // 숨겨져 있던 종속 셀들의 isHidden 속성을 해제
        for (let rr = 0; rr < current.rowSpan; rr++) {
          for (let cc = 0; cc < current.colSpan; cc++) {
            if (rr === 0 && cc === 0) continue;
            newGrid[r + rr][c + cc].isHidden = false;
          }
        }
        current.rowSpan = 1;
        current.colSpan = 1;
        console.log("병합 해제 완료");
      }
      return newGrid;
    });
  };

  return {
    grid,
    focusedCell,
    setFocusedCell,
    initGrid,
    handleCellChange,
    handleAlignChange,
    addRow,
    removeRow,
    addCol,
    removeCol,
    mergeRight,
    mergeDown,
    unmerge
  };
};