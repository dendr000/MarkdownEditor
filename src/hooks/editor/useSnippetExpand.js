// src/hooks/editor/useSnippetExpand.js v1.0
/*
 * 파일 위치: src/hooks/editor/useSnippetExpand.js
 * 파일 설명: Ctrl + Space 입력 시 단축어를 스니펫으로 전개하고, 스페이스/엔터 입력 시 예약어를 치환하는 커스텀 훅입니다.
 * 연결 위치: src/components/editor/Editor.jsx
 */
import { useCallback } from 'react';
import { getLanguage, SNIPPET_DICT, REPLACE_DICT } from '../../utils/editor/codeDictionary';

export function useSnippetExpand(markdown, setMarkdown, selectedFile, textareaRef) {
  const handleSnippetAndReplace = useCallback((e) => {
    const textarea = textareaRef.current;
    if (!textarea) return false;

    const lang = getLanguage(selectedFile);
    
    // 1. 스니펫 전개 로직 (Ctrl + Space)
    if ((e.ctrlKey || e.metaKey) && e.key === ' ') {
      const snippets = SNIPPET_DICT[lang];
      if (!snippets) return false;

      const cursorPos = textarea.selectionStart;
      const textBefore = textarea.value.substring(0, cursorPos);
      const textAfter = textarea.value.substring(cursorPos);

      // 커서 바로 앞의 영단어를 추출합니다.
      const match = textBefore.match(/([a-zA-Z]+)$/);
      if (match) {
        const word = match[1];
        if (snippets[word]) {
          e.preventDefault(); // 기본 띄어쓰기 차단
          console.log(`[useSnippetExpand v1.0] 스니펫 전개 실행: ${word} -> ${snippets[word]}`);

          const snippet = snippets[word];
          // '|' 기호를 기준으로 커서가 배치될 상대적 위치를 계산합니다.
          const cursorOffset = snippet.indexOf('|');
          const cleanSnippet = snippet.replace('|', '');

          const newTextBefore = textBefore.substring(0, textBefore.length - word.length) + cleanSnippet;
          const newValue = newTextBefore + textAfter;

          textarea.value = newValue;
          // '|'가 존재했다면 그 위치로, 없다면 스니펫 끝으로 커서를 이동시킵니다.
          const newCursorPos = cursorOffset !== -1 
            ? textBefore.length - word.length + cursorOffset 
            : newTextBefore.length;
            
          textarea.value = newValue;
          setMarkdown(newValue);
          
          // React 상태 업데이트 후 커서가 맨 뒤로 밀리는 현상 방지
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newCursorPos, newCursorPos);
          }, 0);
          
          return true;
        }
      }
    }

    // 2. 자동 치환 로직 (Space 또는 Enter)
    if (e.key === ' ' || e.key === 'Enter') {
      const replaces = REPLACE_DICT[lang];
      if (!replaces) return false;

      const cursorPos = textarea.selectionStart;
      const textBefore = textarea.value.substring(0, cursorPos);
      const textAfter = textarea.value.substring(cursorPos);

      // 커서 바로 앞의 공백이 아닌 문자열 덩어리를 추출합니다 (예: ==, class=, select)
      const match = textBefore.match(/([^\s]+)$/);
      if (match) {
        const word = match[1];
        const lowerWord = word.toLowerCase();

        // 사전에 등록된 치환어인지 확인 (대소문자 구분 없이 매칭)
        if (replaces[word] || replaces[lowerWord]) {
          e.preventDefault();
          
          const replacement = replaces[word] || replaces[lowerWord];
          console.log(`[useSnippetExpand v1.0] 예약어 자동 치환 실행: ${word} -> ${replacement}`);

          const newTextBefore = textBefore.substring(0, textBefore.length - word.length) + replacement;
          const insertChar = e.key === 'Enter' ? '\n' : ' ';
          const newValue = newTextBefore + insertChar + textAfter;

          textarea.value = newValue;
          setMarkdown(newValue);
          
          const newCursorPos = newTextBefore.length + insertChar.length;
          
          // React 상태 업데이트 후 커서 밀림 방지
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(newCursorPos, newCursorPos);
          }, 0);
          
          return true;
        }
      }
    }

    return false;
  }, [selectedFile, setMarkdown, textareaRef]);

  return { handleSnippetAndReplace };
}