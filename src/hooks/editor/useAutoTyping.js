// src/hooks/editor/useAutoTyping.js v1.0
/*
 * 파일 위치: src/hooks/editor/useAutoTyping.js
 * 파일 설명: 괄호/따옴표 자동 쌍 맞추기, HTML 태그 자동 닫기 등 키보드 타이핑 어시스트를 제공하는 커스텀 훅입니다.
 * 연결 위치: src/components/editor/Editor.jsx
 */
import { useCallback } from 'react';
import { getLanguage } from '../../utils/editor/codeDictionary';

// 닫는 태그를 생성하지 않는 HTML 단일(빈) 태그 목록입니다.
const VOID_ELEMENTS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

export function useAutoTyping(markdown, setMarkdown, selectedFile, textareaRef) {
  const handleAutoTyping = useCallback((e) => {
    const textarea = textareaRef.current;
    if (!textarea) return false;

    const cursorPos = textarea.selectionStart;
    const textBefore = textarea.value.substring(0, cursorPos);
    const textAfter = textarea.value.substring(cursorPos);
    const lang = getLanguage(selectedFile);

    // 1. 닫는 기호 스킵 (Step-over)
    // 닫는 기호를 입력했을 때, 커서 바로 뒤에 동일한 문자가 있다면 문자를 중복 삽입하지 않고 커서만 넘깁니다.
    const closingChars = [')', '}', ']', '"', "'"];
    if (closingChars.includes(e.key) && textAfter[0] === e.key) {
      e.preventDefault();
      textarea.setSelectionRange(cursorPos + 1, cursorPos + 1);
      return true;
    }

    // 2. 괄호 및 따옴표 자동 쌍 맞추기
    const pairs = { '(': ')', '{': '}', '[': ']', '"': '"' };

    // JSON 파일 교정: 작은따옴표를 큰따옴표 쌍으로 강제 치환
    if (e.key === "'" && lang === 'json') {
      e.preventDefault();
      const newValue = textBefore + '""' + textAfter;
      textarea.value = newValue;
      setMarkdown(newValue);
      setTimeout(() => textarea.setSelectionRange(cursorPos + 1, cursorPos + 1), 0);
      return true;
    } 
    // 일반 작은따옴표
    else if (e.key === "'") {
      e.preventDefault();
      const newValue = textBefore + "''" + textAfter;
      textarea.value = newValue;
      setMarkdown(newValue);
      setTimeout(() => textarea.setSelectionRange(cursorPos + 1, cursorPos + 1), 0);
      return true;
    }
    // 그 외 괄호/큰따옴표
    else if (pairs[e.key]) {
      e.preventDefault();
      const newValue = textBefore + e.key + pairs[e.key] + textAfter;
      textarea.value = newValue;
      setMarkdown(newValue);
      setTimeout(() => textarea.setSelectionRange(cursorPos + 1, cursorPos + 1), 0);
      return true;
    }

    // 3. HTML/XML 태그 자동 닫기 ('>' 입력 시)
    if (e.key === '>') {
      const tagMatch = textBefore.match(/<([a-zA-Z][a-zA-Z0-9-]*)[^>]*$/);
      if (tagMatch) {
        const tagName = tagMatch[1].toLowerCase();
        
        // 단일 태그가 아닐 경우에만 닫는 태그를 자동 생성합니다.
        if (!VOID_ELEMENTS.has(tagName)) {
          e.preventDefault();
          const insertVal = `></${tagName}>`;
          const newValue = textBefore + insertVal + textAfter;
          
          textarea.value = newValue;
          setMarkdown(newValue);
          // 커서를 여는 태그와 닫는 태그 사이로 이동시킵니다.
          setTimeout(() => textarea.setSelectionRange(cursorPos + 1, cursorPos + 1), 0);
          return true;
        }
      }
    }

    // 4. 태그 사이(><)에서 Enter 입력 시 줄바꿈 및 자동 들여쓰기
    if (e.key === 'Enter' && textBefore.endsWith('>') && textAfter.startsWith('</')) {
      e.preventDefault();
      
      const lineStart = textBefore.lastIndexOf('\n') + 1;
      const currentLine = textBefore.substring(lineStart);
      const indentMatch = currentLine.match(/^(\s*)/);
      const indent = indentMatch ? indentMatch[1] : '';
      
      // 태그 내부를 한 칸(스페이스 2개) 들여쓰기 한 형태로 치환합니다.
      const insertVal = `\n${indent}  \n${indent}`;
      const newValue = textBefore + insertVal + textAfter;
      
      textarea.value = newValue;
      setMarkdown(newValue);
      setTimeout(() => textarea.setSelectionRange(cursorPos + indent.length + 3, cursorPos + indent.length + 3), 0);
      return true;
    }

    return false;
  }, [selectedFile, setMarkdown, textareaRef]);

  return { handleAutoTyping };
}