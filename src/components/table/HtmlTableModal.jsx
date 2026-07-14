// src/components/table/HtmlTableModal.jsx v6.1
/*
 * 파일 설명: 모든 고급 기능(다중 삽입, Ctrl 다중 선택, 스크롤 고정, 캡션 등)이 결합된 HTML 표 최종 메인 컨테이너입니다.
 * 연결 위치: src/components/editor/Editor.jsx 내부에서 호출되며 도메인 분리 아키텍처에 맞춰 임포트 경로가 수정되었습니다.
 */
import { useEffect } from 'react';
import { useTableGrid } from '../../hooks/table/useTableGrid';
import { generateHtmlFromGrid } from '../../utils/htmlTableParser';
import ToolbarStructure from './html-table/ToolbarStructure';
import ToolbarStyle from './html-table/ToolbarStyle';
import HtmlTableGrid from './html-table/HtmlTableGrid';
import '../common/Modal.css'; // 공통 모달 뼈대 CSS 연결
import './HtmlTable.css'; // 표 도메인 특화 CSS 연결

function HtmlTableModal({ isOpen, onClose, onInsert, initialTableHtml }) {
  console.log("HtmlTableModal(v6.1 도메인 격리 아키텍처) 렌더링 시작");

  const { 
    grid, caption, updateCaption, insertCount, setInsertCount,
    focusedCell, setFocusedCell, initGrid, handleCellChange, handleAlignChange, 
    insertRowAbove, insertRowBelow, insertColLeft, insertColRight, 
    deleteFocusedRow, deleteFocusedCol, mergeRight, mergeDown, unmerge,
    toggleFormat, applyColor, clearFormatting, clearSelectedContents, pasteToSelectedCells,
    selectedCellKeys, setSelectedCellKeys, undo, redo, canUndo, canRedo
  } = useTableGrid();

  // 모달이 열릴 때마다 초기 HTML 파싱 및 그리드 상태 초기화
  useEffect(() => {
    if (isOpen) {
      console.log("HTML 모달 오픈 감지 - 전달받은 초기 HTML 데이터 파싱 프로세스 가동");
      initGrid(initialTableHtml);
    }
  }, [isOpen, initialTableHtml, initGrid]);

  if (!isOpen || grid.length === 0) {
    console.log("모달 닫힘 상태이거나 그리드 데이터가 존재하지 않아 렌더링을 중단합니다.");
    return null;
  }

  // 최종 표 데이터를 HTML 태그 문자열로 변환하여 에디터 본문에 삽입
  const handleApply = () => {
    console.log("표 생성/수정 완료 버튼 클릭됨 - HTML 변환 유틸리티 호출");
    const htmlOutput = generateHtmlFromGrid(grid, caption);
    console.log("최종 HTML 코드 생성 완료. 에디터 본문으로 데이터 주입을 시도합니다.");
    onInsert(htmlOutput);
    onClose();
  };

  return (
    <div className="table-modal-overlay" onClick={() => { console.log("모달 오버레이 클릭 - 닫기 액션 실행"); onClose(); }}>
      <div className="table-modal html-modal-extra-wide" onClick={(e) => e.stopPropagation()}>
        <h3>고급 HTML 표 편집기</h3>
        
        {/* 상단 툴바 컨테이너 (스크롤 시에도 모달 최상단에 고정됨) */}
        <div className="table-modal-controls-container">
          <ToolbarStructure 
            grid={grid} focusedCell={focusedCell} selectedCellKeys={selectedCellKeys}
            insertCount={insertCount} setInsertCount={setInsertCount}
            insertRowAbove={insertRowAbove} insertRowBelow={insertRowBelow}
            insertColLeft={insertColLeft} insertColRight={insertColRight}
            deleteFocusedRow={deleteFocusedRow} deleteFocusedCol={deleteFocusedCol}
            mergeRight={mergeRight} mergeDown={mergeDown} unmerge={unmerge}
            undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo}
          />
          <ToolbarStyle 
            grid={grid} focusedCell={focusedCell} selectedCellKeys={selectedCellKeys}
            toggleFormat={toggleFormat} applyColor={applyColor} clearFormatting={clearFormatting} handleAlignChange={handleAlignChange}
          />
        </div>

        {/* 캡션(표 제목) 입력 텍스트 박스 영역 */}
        <div className="caption-input-wrapper">
          <input 
            type="text" 
            placeholder="표 제목(Caption)을 입력하세요 (선택 사항)" 
            value={caption} 
            onChange={(e) => {
              console.log("캡션 내용 변경 감지:", e.target.value);
              updateCaption(e.target.value);
            }} 
          />
        </div>

        {/* 편집기 내부 그리드 컨테이너 (overflow 속성을 통해 내부 스크롤이 발생함) */}
        <HtmlTableGrid 
          grid={grid} focusedCell={focusedCell} setFocusedCell={setFocusedCell} handleCellChange={handleCellChange}
          selectedCellKeys={selectedCellKeys} setSelectedCellKeys={setSelectedCellKeys} 
          clearSelectedContents={clearSelectedContents} pasteToSelectedCells={pasteToSelectedCells}
        />

        {/* 모달 하단 취소/확인 버튼 액션 영역 */}
        <div className="table-modal-actions">
          <button className="btn-cancel" onClick={() => { console.log("취소 버튼 클릭"); onClose(); }}>취소</button>
          <button className="btn-apply" onClick={handleApply}>표 생성/수정 완료</button>
        </div>
      </div>
    </div>
  );
}

export default HtmlTableModal;