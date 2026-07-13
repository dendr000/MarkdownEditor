// src/components/TableModal.jsx v2.0
/*
 * 파일 설명: 마크다운 에디터 내에서 표(Table)를 시각적으로 구성하고 수정하는 모달 컴포넌트입니다.
 * 서식 툴바(Bold, Italic, Strike)와 정렬 변경 기능이 내장되어 마크다운 문법과 연동됩니다.
 * 연결 위치: src/components/Editor.jsx 파일에서 렌더링됨
 */
import { useState, useEffect } from 'react';
import { Bold, Italic, Strikethrough, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { parseMdToGrid, generateMdFromGrid } from '../utils/tableConverter';
import './TableModal.css';

function TableModal({ isOpen, onClose, onInsert, initialTableMarkdown }) {
  console.log("TableModal(MD 표 모달 v2.0) 렌더링 시작");

  const [grid, setGrid] = useState([]);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [focusedCell, setFocusedCell] = useState(null);

  // 모달 오픈 시 초기 텍스트 파싱
  useEffect(() => {
    if (isOpen) {
      const parsedGrid = parseMdToGrid(initialTableMarkdown);
      if (parsedGrid) {
        setGrid(parsedGrid);
        setRows(parsedGrid.length);
        setCols(parsedGrid[0].length);
      } else {
        // 유효한 파싱 데이터가 없으면 기본 3x3 표 세팅
        setGrid(
          Array.from({ length: 3 }, (_, r) =>
            Array.from({ length: 3 }, () => ({
              text: '', align: r === 0 ? 'center' : 'left', rowSpan: 1, colSpan: 1, isHidden: false,
              bold: false, italic: false, strike: false, color: '', bgColor: ''
            }))
          )
        );
        setRows(3);
        setCols(3);
      }
      setFocusedCell(null);
    }
  }, [isOpen, initialTableMarkdown]);

  if (!isOpen || grid.length === 0) return null;

  // 행/열 추가 삭제 로직 (마크다운은 병합이 없으므로 단순 배열 조작)
  const handleAddRow = () => {
    setRows(rows + 1);
    setGrid(prev => [
      ...prev, 
      Array.from({ length: cols }, () => ({
        text: '', align: 'left', rowSpan: 1, colSpan: 1, isHidden: false,
        bold: false, italic: false, strike: false, color: '', bgColor: ''
      }))
    ]);
  };

  const handleRemoveRow = () => {
    if (rows > 1) {
      setRows(rows - 1);
      setGrid(prev => prev.slice(0, -1));
      setFocusedCell(null);
    }
  };

  const handleAddCol = () => {
    setCols(cols + 1);
    setGrid(prev => prev.map((row, rIndex) => [
      ...row,
      {
        text: '', align: rIndex === 0 ? 'center' : 'left', rowSpan: 1, colSpan: 1, isHidden: false,
        bold: false, italic: false, strike: false, color: '', bgColor: ''
      }
    ]));
  };

  const handleRemoveCol = () => {
    if (cols > 1) {
      setCols(cols - 1);
      setGrid(prev => prev.map(row => row.slice(0, -1)));
      setFocusedCell(null);
    }
  };

  // 텍스트 입력 처리
  const handleCellChange = (rIndex, cIndex, value) => {
    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      newGrid[rIndex][cIndex] = { ...newGrid[rIndex][cIndex], text: value };
      return newGrid;
    });
  };

  // 서식 토글 기능 (현재 포커스된 셀 기준)
  const toggleFormat = (formatType) => {
    if (!focusedCell) return;
    const { r, c } = focusedCell;
    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      newGrid[r][c] = { ...newGrid[r][c], [formatType]: !newGrid[r][c][formatType] };
      return newGrid;
    });
  };

  // 정렬 변경 기능 (마크다운은 열 전체가 기준이므로, 포커스된 셀이 속한 열의 모든 셀의 정렬을 바꿈)
  const handleAlignChange = (alignment) => {
    if (!focusedCell) return;
    const { c } = focusedCell;
    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      for (let r = 0; r < newGrid.length; r++) {
        newGrid[r][c] = { ...newGrid[r][c], align: alignment };
      }
      return newGrid;
    });
  };

  const handleApply = () => {
    console.log("MD 표 생성 적용 버튼 클릭됨");
    const mdOutput = generateMdFromGrid(grid);
    onInsert(mdOutput);
    onClose();
  };

  const activeCell = focusedCell ? grid[focusedCell.r][focusedCell.c] : null;
  const hasFocus = !!activeCell;

  return (
    <div className="table-modal-overlay" onClick={() => onClose()}>
      <div className="table-modal" onClick={(e) => e.stopPropagation()}>
        <h3>마크다운 표 삽입</h3>
        
        <div className="table-modal-controls-container">
          <div className="toolbar-row">
            <div className="toolbar-left">
              {/* 구조(행/열) 제어 */}
              <div className="control-group">
                <span className="control-label">행/열:</span>
                <button onClick={handleAddRow} title="행 추가">+ 행</button>
                <button onClick={handleRemoveRow} title="행 삭제">- 행</button>
                <button onClick={handleAddCol} title="열 추가">+ 열</button>
                <button onClick={handleRemoveCol} title="열 삭제">- 열</button>
              </div>

              <div className="toolbar-divider"></div>

              {/* 정렬 제어 (열 전체 적용) */}
              <div className="control-group">
                <span className="control-label">정렬:</span>
                <button onClick={() => handleAlignChange('left')} disabled={!hasFocus} className={activeCell?.align === 'left' ? 'active' : ''} title="왼쪽 정렬 (현재 열)">
                  <AlignLeft size={16} />
                </button>
                <button onClick={() => handleAlignChange('center')} disabled={!hasFocus} className={activeCell?.align === 'center' ? 'active' : ''} title="가운데 정렬 (현재 열)">
                  <AlignCenter size={16} />
                </button>
                <button onClick={() => handleAlignChange('right')} disabled={!hasFocus} className={activeCell?.align === 'right' ? 'active' : ''} title="오른쪽 정렬 (현재 열)">
                  <AlignRight size={16} />
                </button>
              </div>

              <div className="toolbar-divider"></div>

              {/* 텍스트 서식 제어 */}
              <div className="control-group">
                <span className="control-label">서식:</span>
                <button onClick={() => toggleFormat('bold')} disabled={!hasFocus} className={activeCell?.bold ? 'active' : ''} title="굵게">
                  <Bold size={16} />
                </button>
                <button onClick={() => toggleFormat('italic')} disabled={!hasFocus} className={activeCell?.italic ? 'active' : ''} title="기울임">
                  <Italic size={16} />
                </button>
                <button onClick={() => toggleFormat('strike')} disabled={!hasFocus} className={activeCell?.strike ? 'active' : ''} title="취소선">
                  <Strikethrough size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="table-modal-grid-container">
          <table className="table-modal-grid">
            <tbody>
              {grid.map((row, rIndex) => (
                <tr key={`md-row-${rIndex}`}>
                  {row.map((cell, cIndex) => {
                    const cellStyle = {
                      textAlign: cell.align,
                      fontWeight: cell.bold ? 'bold' : 'normal',
                      fontStyle: cell.italic ? 'italic' : 'normal',
                      textDecoration: cell.strike ? 'line-through' : 'none'
                    };

                    return (
                      <td key={`md-cell-${rIndex}-${cIndex}`}>
                        <input
                          type="text"
                          value={cell.text}
                          style={cellStyle}
                          onFocus={() => setFocusedCell({ r: rIndex, c: cIndex })}
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

        <div className="table-modal-actions">
          <button className="btn-cancel" onClick={() => onClose()}>취소</button>
          <button className="btn-apply" onClick={handleApply}>표 적용</button>
        </div>
      </div>
    </div>
  );
}

export default TableModal;