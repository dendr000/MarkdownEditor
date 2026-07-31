// src/hooks/editor/useCommentToggle.js v1.0
/*
 * 파일 위치: src/hooks/editor/useCommentToggle.js
 * 파일 설명: Ctrl + / 단축키 입력 시 현재 파일의 확장자에 맞는 주석 기호를 삽입하거나 제거하는 커스텀 훅입니다.
 * 연결 위치: src/components/editor/Editor.jsx
 */
import { useCallback } from 'react';
import { getLanguage, COMMENT_DICT } from '../../utils/editor/codeDictionary';

export function useCommentToggle(markdown, setMarkdown, selectedFile, textareaRef) {
  const handleToggleComment = useCallback((e) => {
    // Ctrl + / 단축키 감지 (macOS의 경우 Cmd + / 포함)
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      
      const textarea = textareaRef.current;
      if (!textarea) {
        console.warn("[useCommentToggle v1.0] textarea 참조를 찾을 수 없습니다.");
        return false;
      }

      console.log("[useCommentToggle v1.0] 주석 토글 단축키(Ctrl+/) 감지됨");
      
      const lang = getLanguage(selectedFile);
      const dict = COMMENT_DICT[lang];
      
      if (!dict) {
        console.log(`[useCommentToggle v1.0] ${lang} 언어에 대한 주석 규칙이 없어 토글을 생략합니다.`);
        return true; 
      }

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;

      // 선택 영역을 포함하는 전체 줄의 시작과 끝 인덱스를 계산합니다.
      const lineStart = text.lastIndexOf('\n', start - 1) + 1;
      let lineEnd = text.indexOf('\n', end);
      if (lineEnd === -1) lineEnd = text.length;

      const selectedLinesText = text.substring(lineStart, lineEnd);
      let newText = '';
      let newCursorPos = start;

      // 단일 줄 주석 (JS, SQL 등) 처리 로직
      if (dict.type === 'single') {
        const lines = selectedLinesText.split('\n');
        // 모든 줄이 이미 주석 처리되어 있는지 판별합니다.
        const allCommented = lines.every(line => line.trim().startsWith(dict.symbol.trim()));

        const newLines = lines.map(line => {
          if (allCommented) {
            // 주석 해제: 기호 제거
            return line.replace(dict.symbol, '');
          } else {
            // 주석 추가: 기호 삽입
            return dict.symbol + line;
          }
        });

        const replacedLines = newLines.join('\n');
        newText = text.substring(0, lineStart) + replacedLines + text.substring(lineEnd);
        
        // 커서 위치 보정
        const diff = replacedLines.length - selectedLinesText.length;
        newCursorPos = end + diff;
        console.log(`[useCommentToggle v1.0] 단일 줄 주석 처리 완료. 상태: ${allCommented ? '해제' : '적용'}`);
      } 
      // 다중 줄 주석 (HTML, CSS, 마크다운 등) 처리 로직
      else if (dict.type === 'multi') {
        const hasStart = selectedLinesText.startsWith(dict.start);
        const hasEnd = selectedLinesText.endsWith(dict.end);

        if (hasStart && hasEnd) {
          // 주석 해제: 앞뒤 기호 제거
          const innerText = selectedLinesText.substring(dict.start.length, selectedLinesText.length - dict.end.length);
          newText = text.substring(0, lineStart) + innerText + text.substring(lineEnd);
          newCursorPos = end - dict.start.length - dict.end.length;
          console.log("[useCommentToggle v1.0] 다중 줄 주석 해제 완료");
        } else {
          // 주석 추가: 앞뒤 기호 래핑
          const wrappedText = dict.start + selectedLinesText + dict.end;
          newText = text.substring(0, lineStart) + wrappedText + text.substring(lineEnd);
          newCursorPos = end + dict.start.length + dict.end.length;
          console.log("[useCommentToggle v1.0] 다중 줄 주석 적용 완료");
        }
      }

      // 상태 동기화 및 DOM 값 즉시 업데이트
      textarea.value = newText;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      setMarkdown(newText);
      
      return true; // 이벤트 처리 완료 반환
    }
    return false;
  }, [selectedFile, setMarkdown, textareaRef]);

  return { handleToggleComment };
}