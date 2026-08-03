// src/components/editor/ColorPickerOverlay.jsx v1.0
/*
 * 파일 위치: src/components/editor/ColorPickerOverlay.jsx
 * 파일 설명: CSS/SCSS 파일 편집 시, 텍스트 내의 Hex 색상 코드를 추적하여 옆에 클릭 가능한 네이티브 색상 팔레트(Color Picker) 박스를 렌더링하는 오버레이입니다.
 * 연결 위치: src/components/editor/Editor.jsx
 */
import React, { useMemo } from 'react';

// 3자리 또는 8자리 등 다양한 포맷의 Hex 코드를 네이티브 input[type="color"]가 렌더링할 수 있는 6자리 표준으로 정규화합니다.
const normalizeHex = (hex) => {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  } else if (cleanHex.length === 8) {
    cleanHex = cleanHex.substring(0, 6);
  } else if (cleanHex.length === 4) {
    cleanHex = cleanHex.substring(0, 3).split('').map(c => c + c).join('');
  }
  return `#${cleanHex}`;
};

function ColorPickerOverlay({ markdown, language, colorPickerRef, onColorChange }) {
  // CSS나 SCSS 파일이 아니면 렌더링을 완전히 생략하여 성능을 보존합니다.
  if (!['css', 'scss'].includes(language?.toLowerCase())) {
    return null;
  }

  // 정규식을 사용해 Hex 색상 코드와 일반 텍스트 토큰을 분리합니다.
  const parsedElements = useMemo(() => {
    // 3, 4, 6, 8자리 Hex 코드 감지 정규식
    const hexRegex = /(#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{4}\b|#[0-9a-fA-F]{3}\b)/gi;
    const parts = markdown.split(hexRegex);
    
    let currentOffset = 0;
    
    return parts.map((part, index) => {
      const isColor = /^(#[0-9a-fA-F]{3,8})$/i.test(part);
      const offset = currentOffset;
      currentOffset += part.length;

      if (isColor) {
        const normalizedHex = normalizeHex(part);
        return (
          <span key={`${index}-${part}`} style={{ position: 'relative' }}>
            <input
              type="color"
              className="color-picker-swatch"
              value={normalizedHex}
              onChange={(e) => onColorChange(e.target.value, offset, part.length)}
              title="색상 팔레트 열기"
            />
            {part}
          </span>
        );
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  }, [markdown, onColorChange]);

  return (
    <div className="color-picker-overlay-container" ref={colorPickerRef}>
      {parsedElements}
    </div>
  );
}

export default ColorPickerOverlay;