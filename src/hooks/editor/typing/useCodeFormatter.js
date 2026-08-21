// src/hooks/editor/typing/useCodeFormatter.js v1.2
/*
 * 파일 위치: src/hooks/editor/typing/useCodeFormatter.js
 * 기능 요약: Shift + Alt + F 단축키를 감지하여 현재 언어에 맞는 코드 포매팅을 실행하는 커스텀 훅입니다. (배포를 위해 콘솔 로그 출력 기능이 제거되었습니다.)
 * 연결 위치: src/components/editor/Editor.jsx
 */
import { useCallback } from 'react';
import { getLanguage } from '../../../utils/editor/codeDictionary';
import { formatCode } from '../../../utils/editor/codeFormatter';
import { insertTextNatively } from '../../../utils/editorCore';

export function useCodeFormatter(markdown, setMarkdown, selectedFile, textareaRef) {
  const handleFormatCode = useCallback((e) => {
    // Shift + Alt + F (macOS의 경우 Shift + Option + F) 단축키 감지
    if (e.shiftKey && e.altKey && e.key.toLowerCase() === 'f') {
      e.preventDefault();

      const textarea = textareaRef.current;
      if (!textarea) return false;

      const lang = getLanguage(selectedFile);
      if (lang === 'text' || lang === 'markdown') {
        return true;
      }

      const formattedCode = formatCode(textarea.value, lang);

      // 코드가 변경되었을 때만 상태를 업데이트하여 불필요한 렌더링 방지
      if (formattedCode !== textarea.value) {
        // textarea.value 직접 할당은 브라우저의 Undo 스택을 파괴하므로, 네이티브 삽입 유틸리티를 사용합니다.
        insertTextNatively(textarea, 0, textarea.value.length, formattedCode);
      }

      return true; // 이벤트 처리 완료
    }
    return false;
  }, [selectedFile, textareaRef]);

  return { handleFormatCode };
}