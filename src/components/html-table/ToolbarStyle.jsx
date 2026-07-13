// src/components/html-table/ToolbarStyle.jsx v1.0
/*
 * 파일 설명: 선택된 셀의 텍스트 굵기, 기울임, 취소선 및 글자/배경 색상을 제어하는 서식 전용 툴바 컴포넌트
 * 연결 위치: src/components/HtmlTableModal.jsx 내에서 ToolbarStructure 아래에 렌더링됨
 */
import { 
  Bold, Italic, Strikethrough, Eraser, Baseline, PaintBucket
} from 'lucide-react';
import { PRESET_COLORS } from '../../utils/colorPresets';

function ToolbarStyle({ 
  grid, focusedCell, toggleFormat, applyColor, clearFormatting
}) {
  console.log("ToolbarStyle(서식 제어 툴바 v1.0) 렌더링 됨");

  const activeCell = focusedCell ? grid[focusedCell.r][focusedCell.c] : null;
  const hasFocus = !!activeCell;

  return (
    <div className="table-modal-controls style-toolbar">
      {/* 1. 텍스트 서식 조작 */}
      <div className="control-group alignment-controls">
        <span className="control-label">서식:</span>
        <button 
          onClick={() => toggleFormat('bold')} 
          disabled={!hasFocus} 
          title="굵게"
          className={activeCell?.bold ? 'active' : ''}
        >
          <Bold size={16} />
        </button>
        <button 
          onClick={() => toggleFormat('italic')} 
          disabled={!hasFocus} 
          title="기울임"
          className={activeCell?.italic ? 'active' : ''}
        >
          <Italic size={16} />
        </button>
        <button 
          onClick={() => toggleFormat('strike')} 
          disabled={!hasFocus} 
          title="취소선"
          className={activeCell?.strike ? 'active' : ''}
        >
          <Strikethrough size={16} />
        </button>
        <div className="toolbar-divider"></div>
        <button onClick={clearFormatting} disabled={!hasFocus} title="모든 서식 초기화">
          <Eraser size={16} /> 초기화
        </button>
      </div>

      {/* 2. 글자 색상 조작 (네이티브 select 박스 활용) */}
      <div className="control-group">
        <span className="control-label"><Baseline size={16} /> 글자색:</span>
        <select 
          disabled={!hasFocus}
          value={activeCell?.color || 'inherit'}
          onChange={(e) => {
            console.log("글자색 변경 선택됨:", e.target.value);
            applyColor('color', e.target.value);
          }}
          className="color-select"
        >
          {PRESET_COLORS.text.map(color => (
            <option key={`text-${color.value}`} value={color.value}>{color.label}</option>
          ))}
        </select>
      </div>

      {/* 3. 배경 색상 조작 */}
      <div className="control-group">
        <span className="control-label"><PaintBucket size={16} /> 배경색:</span>
        <select 
          disabled={!hasFocus}
          value={activeCell?.bgColor || 'transparent'}
          onChange={(e) => {
            console.log("배경색 변경 선택됨:", e.target.value);
            applyColor('bgColor', e.target.value);
          }}
          className="color-select"
        >
          {PRESET_COLORS.bg.map(color => (
            <option key={`bg-${color.value}`} value={color.value}>{color.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default ToolbarStyle;