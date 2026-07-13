// src/components/html-table/ToolbarStyle.jsx v3.0
/*
 * 파일 설명: 텍스트 서식/정렬은 좌측에, 색상 조작은 우측에 고정되도록 분할된 서식 툴바 컴포넌트
 * 연결 위치: src/components/HtmlTableModal.jsx
 */
import { 
  Bold, Italic, Strikethrough, Eraser, Baseline, PaintBucket,
  AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';
import { PRESET_COLORS } from '../../utils/colorPresets';

function ToolbarStyle({ 
  grid, focusedCell, selectionArea, toggleFormat, applyColor, clearFormatting, handleAlignChange
}) {
  const activeCell = focusedCell ? grid[focusedCell.r][focusedCell.c] : null;
  const hasActiveArea = !!activeCell || !!selectionArea;

  return (
    <div className="toolbar-row">
      {/* 좌측 영역: 정렬 및 기본 텍스트 서식 */}
      <div className="toolbar-left">
        <div className="control-group">
          <span className="control-label">정렬:</span>
          <button onClick={() => handleAlignChange('left')} disabled={!hasActiveArea} className={activeCell?.align === 'left' ? 'active' : ''}>
            <AlignLeft size={16} />
          </button>
          <button onClick={() => handleAlignChange('center')} disabled={!hasActiveArea} className={activeCell?.align === 'center' ? 'active' : ''}>
            <AlignCenter size={16} />
          </button>
          <button onClick={() => handleAlignChange('right')} disabled={!hasActiveArea} className={activeCell?.align === 'right' ? 'active' : ''}>
            <AlignRight size={16} />
          </button>
        </div>

        <div className="toolbar-divider"></div>

        <div className="control-group">
          <span className="control-label">서식:</span>
          <button onClick={() => toggleFormat('bold')} disabled={!hasActiveArea} className={activeCell?.bold ? 'active' : ''}>
            <Bold size={16} />
          </button>
          <button onClick={() => toggleFormat('italic')} disabled={!hasActiveArea} className={activeCell?.italic ? 'active' : ''}>
            <Italic size={16} />
          </button>
          <button onClick={() => toggleFormat('strike')} disabled={!hasActiveArea} className={activeCell?.strike ? 'active' : ''}>
            <Strikethrough size={16} />
          </button>
          <button onClick={clearFormatting} disabled={!hasActiveArea} title="서식 초기화">
            <Eraser size={16} />
          </button>
        </div>
      </div>

      {/* 우측 영역: 색상 조작 */}
      <div className="toolbar-right">
        <div className="control-group">
          <span className="control-label"><Baseline size={14} />글자색:</span>
          <select disabled={!hasActiveArea} value={activeCell?.color || 'inherit'} onChange={(e) => applyColor('color', e.target.value)} className="color-select">
            {PRESET_COLORS.text.map(color => <option key={`text-${color.value}`} value={color.value}>{color.label}</option>)}
          </select>
        </div>
        <div className="control-group">
          <span className="control-label"><PaintBucket size={14} />배경색:</span>
          <select disabled={!hasActiveArea} value={activeCell?.bgColor || 'transparent'} onChange={(e) => applyColor('bgColor', e.target.value)} className="color-select">
            {PRESET_COLORS.bg.map(color => <option key={`bg-${color.value}`} value={color.value}>{color.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

export default ToolbarStyle;