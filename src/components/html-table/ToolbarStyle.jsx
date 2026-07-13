// src/components/html-table/ToolbarStyle.jsx v2.0
/*
 * 파일 설명: 배치가 개선된 텍스트 서식, 정렬 및 색상 변경 툴바
 * 연결 위치: src/components/HtmlTableModal.jsx 내부 상단 툴바 영역
 */
import { 
  Bold, Italic, Strikethrough, Eraser, Baseline, PaintBucket,
  AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';
import { PRESET_COLORS } from '../../utils/colorPresets';

function ToolbarStyle({ 
  grid, focusedCell, selectionArea, toggleFormat, applyColor, clearFormatting, handleAlignChange
}) {
  console.log("ToolbarStyle 렌더링");

  const activeCell = focusedCell ? grid[focusedCell.r][focusedCell.c] : null;
  const hasActiveArea = !!activeCell || !!selectionArea;

  return (
    <div className="toolbar-row">
      {/* 1. 정렬 조작 */}
      <div className="control-group">
        <span className="control-label">정렬:</span>
        <button onClick={() => { console.log("좌측 정렬 클릭"); handleAlignChange('left'); }} disabled={!hasActiveArea} className={activeCell?.align === 'left' ? 'active' : ''}>
          <AlignLeft size={16} />
        </button>
        <button onClick={() => { console.log("중앙 정렬 클릭"); handleAlignChange('center'); }} disabled={!hasActiveArea} className={activeCell?.align === 'center' ? 'active' : ''}>
          <AlignCenter size={16} />
        </button>
        <button onClick={() => { console.log("우측 정렬 클릭"); handleAlignChange('right'); }} disabled={!hasActiveArea} className={activeCell?.align === 'right' ? 'active' : ''}>
          <AlignRight size={16} />
        </button>
      </div>

      <div className="toolbar-divider"></div>

      {/* 2. 텍스트 서식 조작 */}
      <div className="control-group">
        <span className="control-label">서식:</span>
        <button onClick={() => { console.log("볼드 토글"); toggleFormat('bold'); }} disabled={!hasActiveArea} className={activeCell?.bold ? 'active' : ''}>
          <Bold size={16} />
        </button>
        <button onClick={() => { console.log("이탤릭 토글"); toggleFormat('italic'); }} disabled={!hasActiveArea} className={activeCell?.italic ? 'active' : ''}>
          <Italic size={16} />
        </button>
        <button onClick={() => { console.log("취소선 토글"); toggleFormat('strike'); }} disabled={!hasActiveArea} className={activeCell?.strike ? 'active' : ''}>
          <Strikethrough size={16} />
        </button>
        <button onClick={() => { console.log("서식 초기화 클릭"); clearFormatting(); }} disabled={!hasActiveArea} title="서식 초기화">
          <Eraser size={16} />
        </button>
      </div>

      <div className="toolbar-divider"></div>

      {/* 3. 색상 조작 */}
      <div className="control-group">
        <span className="control-label"><Baseline size={14} />글자색:</span>
        <select 
          disabled={!hasActiveArea} 
          value={activeCell?.color || 'inherit'} 
          onChange={(e) => { console.log("글자색 변경:", e.target.value); applyColor('color', e.target.value); }} 
          className="color-select"
        >
          {PRESET_COLORS.text.map(color => <option key={`text-${color.value}`} value={color.value}>{color.label}</option>)}
        </select>
      </div>
      <div className="control-group">
        <span className="control-label"><PaintBucket size={14} />배경색:</span>
        <select 
          disabled={!hasActiveArea} 
          value={activeCell?.bgColor || 'transparent'} 
          onChange={(e) => { console.log("배경색 변경:", e.target.value); applyColor('bgColor', e.target.value); }} 
          className="color-select"
        >
          {PRESET_COLORS.bg.map(color => <option key={`bg-${color.value}`} value={color.value}>{color.label}</option>)}
        </select>
      </div>
    </div>
  );
}

export default ToolbarStyle;