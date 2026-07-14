// src/components/table/html-table/ToolbarStyle.jsx v1.3
/*
 * 파일 설명: HTML 표 내부의 텍스트 서식(굵게, 기울임, 취소선), 정렬, 글자색 및 배경색을 제어하는 스타일 툴바 컴포넌트입니다.
 * 깃허브 경고 문구가 정상적인 문서 흐름에 포함되어 회색 박스 영역을 스스로 늘리도록 전체 래퍼 구조가 변경되었습니다.
 */
import { Bold, Italic, Strikethrough, AlignLeft, AlignCenter, AlignRight, Eraser } from 'lucide-react';

function ToolbarStyle({ grid, focusedCell, selectedCellKeys, toggleFormat, applyColor, clearFormatting, handleAlignChange }) {
  console.log("ToolbarStyle 컴포넌트(v1.3) 렌더링 시작 - 경고 문구 레이아웃 안전 배치 적용");

  const activeCell = focusedCell ? grid[focusedCell.r][focusedCell.c] : null;
  const hasFocus = !!activeCell || selectedCellKeys.size > 0;

  return (
    <div className="toolbar-style-container" style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '4px' }}>
      <div className="toolbar-row">
        <div className="toolbar-left">
          <div className="control-group">
            <span className="control-label">정렬:</span>
            <button onClick={() => { console.log("왼쪽 정렬 버튼 클릭"); handleAlignChange('left'); }} disabled={!hasFocus} className={activeCell?.align === 'left' ? 'active' : ''} title="왼쪽 정렬">
              <AlignLeft size={16} />
            </button>
            <button onClick={() => { console.log("가운데 정렬 버튼 클릭"); handleAlignChange('center'); }} disabled={!hasFocus} className={activeCell?.align === 'center' ? 'active' : ''} title="가운데 정렬">
              <AlignCenter size={16} />
            </button>
            <button onClick={() => { console.log("오른쪽 정렬 버튼 클릭"); handleAlignChange('right'); }} disabled={!hasFocus} className={activeCell?.align === 'right' ? 'active' : ''} title="오른쪽 정렬">
              <AlignRight size={16} />
            </button>
          </div>

          <div className="toolbar-divider"></div>

          <div className="control-group">
            <span className="control-label">서식:</span>
            <button onClick={() => { console.log("굵게 버튼 클릭"); toggleFormat('bold'); }} disabled={!hasFocus} className={activeCell?.bold ? 'active' : ''} title="굵게">
              <Bold size={16} />
            </button>
            <button onClick={() => { console.log("기울임 버튼 클릭"); toggleFormat('italic'); }} disabled={!hasFocus} className={activeCell?.italic ? 'active' : ''} title="기울임">
              <Italic size={16} />
            </button>
            <button onClick={() => { console.log("취소선 버튼 클릭"); toggleFormat('strike'); }} disabled={!hasFocus} className={activeCell?.strike ? 'active' : ''} title="취소선">
              <Strikethrough size={16} />
            </button>
            <button onClick={() => { console.log("서식 지우기 버튼 클릭"); clearFormatting(); }} disabled={!hasFocus} title="모든 서식 지우기">
              <Eraser size={16} />
            </button>
          </div>
        </div>

        <div className="toolbar-right">
          <div className="control-group">
            <span className="control-label">글자색:</span>
            <select
              className="color-select"
              value={activeCell?.color || 'inherit'}
              onChange={(e) => { console.log("글자색 옵션 변경:", e.target.value); applyColor('color', e.target.value); }}
              disabled={!hasFocus}
            >
              <option value="inherit">기본(검정)</option>
              <option value="#cf222e">빨간색</option>
              <option value="#0969da">파란색</option>
              <option value="#1a7f37">초록색</option>
              <option value="#9a6700">노란색</option>
              <option value="#8250df">보라색</option>
              <option value="#57606a">회색</option>
            </select>

            <span className="control-label">배경색:</span>
            <select
              className="color-select"
              value={activeCell?.bgColor || 'transparent'}
              onChange={(e) => { console.log("배경색 옵션 변경:", e.target.value); applyColor('bgColor', e.target.value); }}
              disabled={!hasFocus}
            >
              <option value="transparent">투명</option>
              <option value="#ffebe9">빨간색(연함)</option>
              <option value="#ddf4ff">파란색(연함)</option>
              <option value="#dafbe1">초록색(연함)</option>
              <option value="#fff8c5">노란색(연함)</option>
              <option value="#fbefff">보라색(연함)</option>
              <option value="#f6f8fa">회색(연함)</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="github-color-warning">
        * 깃허브 정책상 인라인 글자색/배경색은 반영되지 않습니다.
      </div>
    </div>
  );
}

export default ToolbarStyle;