// src/components/HtmlTableModal.jsx v1.2
/*
 * 파일 설명: 분리된 컴포넌트들을 하나로 조립하여 HTML 표의 상태와 뷰를 관리하고, 부모(Editor)로 결과를 반환하는 메인 컨테이너
 * 연결 위치: src/components/Editor.jsx 에 삽입되어 모달 팝업 역할을 수행함
 */
import { useEffect } from 'react';
import { useHtmlTable } from '../hooks/useHtmlTable';
import { generateHtmlFromGrid } from '../utils/htmlTableParser';
import HtmlTableControls from './html-table/HtmlTableControls';
import HtmlTableGrid from './html-table/HtmlTableGrid';
// 스타일 파일은 위치 변동 없이 기존 Editor.css를 공용으로 사용
import './Editor.css'; 

function HtmlTableModal({ isOpen, onClose, onInsert, initialTableHtml }) {
  console.log("HtmlTableModal(v1.2 메인 래퍼) 렌더링. isOpen:", isOpen);

  // 로직이 분리된 커스텀 훅에서 상태와 메서드를 가져옴
  const { 
    grid, focusedCell, setFocusedCell, initGrid, handleCellChange, handleAlignChange, 
    addRow, removeRow, addCol, removeCol, mergeRight, mergeDown, unmerge 
  } = useHtmlTable();

  // 모달이 열릴 때 초기 HTML 텍스트를 파싱하여 그리드 구조 세팅
  useEffect(() => {
    if (isOpen) {
      initGrid(initialTableHtml);
    }
  }, [isOpen, initialTableHtml, initGrid]);

  if (!isOpen || grid.length === 0) return null;

  // 적용 버튼 클릭 시 최종적으로 파싱하여 부모로 전달
  const handleApply = () => {
    console.log("적용 버튼 클릭 - HTML 태그 생성 시작");
    const htmlOutput = generateHtmlFromGrid(grid);
    console.log("생성된 HTML 태그 파싱 성공:\n", htmlOutput);
    onInsert(htmlOutput);
    onClose();
  };

  return (
    <div className="table-modal-overlay" onClick={() => { console.log("오버레이 클릭 - 닫기"); onClose(); }}>
      <div className="table-modal" onClick={(e) => { e.stopPropagation(); }}>
        <h3>고급 HTML 표 삽입 (정렬 및 병합 지원)</h3>
        
        {/* 분리된 상단 툴바 컴포넌트 삽입 */}
        <HtmlTableControls 
          grid={grid}
          focusedCell={focusedCell}
          addRow={addRow} removeRow={removeRow}
          addCol={addCol} removeCol={removeCol}
          handleAlignChange={handleAlignChange}
          mergeRight={mergeRight} mergeDown={mergeDown} unmerge={unmerge}
        />

        {/* 분리된 그리드 인풋 영역 컴포넌트 삽입 */}
        <HtmlTableGrid 
          grid={grid}
          setFocusedCell={setFocusedCell}
          handleCellChange={handleCellChange}
        />

        <div className="table-modal-actions">
          <button className="btn-cancel" onClick={() => { console.log("취소 클릭 - 닫기"); onClose(); }}>취소</button>
          <button className="btn-apply" onClick={handleApply}>표 적용</button>
        </div>
      </div>
    </div>
  );
}

export default HtmlTableModal;