// src/hooks/editor/ui/useColorPicker.js v1.1
/*
 * 파일 위치: src/hooks/editor/ui/useColorPicker.js
 * 기능 요약: CSS/SCSS 파일에서 Hex 색상 코드를 클릭하여 변경할 때, 에디터의 텍스트와 상태를 즉시 업데이트하는 훅입니다. (배포를 위해 콘솔 로그 출력 기능이 제거되었습니다.)
 * 연결 위치: src/components/editor/Editor.jsx
 */
import { useCallback } from 'react';

export function useColorPicker(markdown, setMarkdown, textareaRef) {
  const handleColorChange = useCallback((newColor, offset, length) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // 현재 텍스트에서 색상 코드가 있던 위치를 새 색상 코드(6자리 Hex)로 치환합니다.
    const textBefore = textarea.value.substring(0, offset);
    const textAfter = textarea.value.substring(offset + length);
    const newValue = textBefore + newColor + textAfter;

    // React 상태 동기화 및 DOM 즉각 반영
    textarea.value = newValue;
    setMarkdown(newValue);
  }, [setMarkdown, textareaRef]);

  return { handleColorChange };
}