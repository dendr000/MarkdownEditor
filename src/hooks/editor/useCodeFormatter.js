// src/hooks/editor/useCodeFormatter.js v1.0
/*
 * 파일 위치: src/hooks/editor/useCodeFormatter.js
 * 파일 설명: Shift + Alt + F 단축키를 감지하여 현재 언어에 맞는 코드 포매팅을 실행하는 커스텀 훅입니다.
 * 연결 위치: src/components/editor/Editor.jsx
 */
import { useCallback } from 'react';
import { getLanguage } from '../../utils/editor/codeDictionary';
import { formatCode } from '../../utils/editor/codeFormatter';

export function useCodeFormatter(markdown, setMarkdown, selectedFile, textareaRef) {
  const handleFormatCode = useCallback((e) => {
    // Shift + Alt + F (macOS의 경우 Shift + Option + F) 단축키 감지
    if (e.shiftKey && e.altKey && e.key.toLowerCase() === 'f') {
      e.preventDefault();

      const textarea = textareaRef.current;
      if (!textarea) return false;

      const lang = getLanguage(selectedFile);
      if (lang === 'text' || lang === 'markdown') {
        console.log(`[useCodeFormatter v1.0] ${lang} 모드에서는 코드 포매터를 지원하지 않습니다.`);
        return true;
      }

      console.log(`[useCodeFormatter v1.0] ${lang} 코드 포매팅 시작`);
      const formattedCode = formatCode(textarea.value, lang);

      // 코드가 변경되었을 때만 상태를 업데이트하여 불필요한 렌더링 방지
      if (formattedCode !== textarea.value) {
        textarea.value = formattedCode;
        setMarkdown(formattedCode);
        console.log(`[useCodeFormatter v1.0] 포매팅 완료 및 에디터 상태 업데이트`);
      } else {
        console.log(`[useCodeFormatter v1.0] 이미 정렬되어 있거나 변경 사항이 없습니다.`);
      }

      return true; // 이벤트 처리 완료
    }
    return false;
  }, [selectedFile, setMarkdown, textareaRef]);

  return { handleFormatCode };
}