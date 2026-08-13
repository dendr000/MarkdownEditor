// C:\dev\MarkdownEditor\src\hooks\editor\useAutocomplete.js
/*
 * 파일 위치: src/hooks/editor/useAutocomplete.js
 * 파일 설명: 프로그래밍 언어(SQL, Java 등)의 예약어 자동완성 및 커서 좌표(Mirror Div) 추적을 통합 관리하는 훅입니다.
 * (v4.1 수정사항): Java 어노테이션(@) 감지 정규식 복구 및 사전 연동 최적화 완료.
 */
import { useState } from 'react';
import { getLanguage, KEYWORD_DICT } from '../../utils/editor/codeDictionary';

const getCaretCoordinates = (element, position) => {
  const div = document.createElement('div');
  const style = window.getComputedStyle(element);

  const properties = [
    'direction', 'boxSizing', 'width', 'height', 'overflowX', 'overflowY',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
    'borderStyle', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'fontSizeAdjust',
    'lineHeight', 'fontFamily', 'textAlign', 'textTransform', 'textIndent',
    'textDecoration', 'letterSpacing', 'wordSpacing', 'tabSize', 'MozTabSize'
  ];

  properties.forEach(prop => div.style[prop] = style[prop]);

  div.style.position = 'absolute';
  div.style.top = '0';
  div.style.left = '-9999px'; 
  div.style.whiteSpace = 'pre-wrap';
  div.style.wordWrap = 'break-word';

  div.textContent = element.value.substring(0, position);

  const span = document.createElement('span');
  span.textContent = element.value.substring(position) || '.';
  div.appendChild(span);
  document.body.appendChild(div);

  const coordinates = {
    top: span.offsetTop - element.scrollTop,
    left: span.offsetLeft - element.scrollLeft
  };

  document.body.removeChild(div);
  return coordinates;
};

export const useAutocomplete = (markdown, setMarkdown, textareaRef, selectedFile) => {
  const [suggestState, setSuggestState] = useState({
    isOpen: false,
    query: '',
    index: 0,
    cursorPosition: 0,
    top: 0, 
    left: 0 
  });

  const currentSuggestList = (() => {
    if (!suggestState.isOpen) return [];
    const lang = getLanguage(selectedFile);
    const dict = KEYWORD_DICT[lang] || [];

    return dict.filter(item =>
      (item.name || item.id).toLowerCase().includes(suggestState.query.toLowerCase())
    );
  })();

  const handleSelectSuggest = (item) => {
    console.log("[useAutocomplete v4.1] 코드 예약어 선택 완료:", item);
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursor = textarea.selectionStart;
    const textBeforeCursor = markdown.substring(0, cursor);
    const textAfterCursor = markdown.substring(cursor);

    const queryLength = suggestState.query.length;
    const insertVal = item.name || item.id;
    const lastTriggerIndex = cursor - queryLength;

    if (lastTriggerIndex < 0) return;

    const newText = markdown.substring(0, lastTriggerIndex) + insertVal + textAfterCursor;
    setMarkdown(newText);

    setSuggestState({ isOpen: false, query: '', index: 0, cursorPosition: 0, top: 0, left: 0 });

    setTimeout(() => {
      textarea.focus();
      const nextCursorPos = lastTriggerIndex + insertVal.length;
      textarea.setSelectionRange(nextCursorPos, nextCursorPos);
    }, 0);
  };

  const handleAutocompleteChange = (val, cursor) => {
    const textBeforeCursor = val.substring(0, cursor);
    const lang = getLanguage(selectedFile);

    if (lang === 'markdown' || lang === 'text') {
      setSuggestState(prev => prev.isOpen ? { ...prev, isOpen: false } : prev);
      return;
    }

    // [핵심 수정] 자바 특수문자 어노테이션(@Autowired 등)까지 감지할 수 있도록 [@a-zA-Z_]로 정규식 방어 범위 확장
    const codeMatch = textBeforeCursor.match(/(?:^|[\s(])([@a-zA-Z_][a-zA-Z0-9_]*)$/);
    
    if (codeMatch && codeMatch[1].length >= 2) {
      const dict = KEYWORD_DICT[lang] || [];
      const hasMatch = dict.some(item => (item.name || item.id).toLowerCase().includes(codeMatch[1].toLowerCase()));
      
      if (hasMatch) {
        const coords = getCaretCoordinates(textareaRef.current, cursor);
        const rect = textareaRef.current.getBoundingClientRect();

        setSuggestState({
          isOpen: true, 
          query: codeMatch[1], 
          index: 0, 
          cursorPosition: cursor,
          top: rect.top + coords.top + 24, 
          left: rect.left + coords.left
        });
        return;
      }
    }

    setSuggestState(prev => prev.isOpen ? { ...prev, isOpen: false } : prev);
  };

  const handleAutocompleteKeyDown = (e) => {
    if (!suggestState.isOpen) return false;

    if (e.key === 'ArrowDown') {
      if (e.shiftKey) { setSuggestState(prev => ({ ...prev, isOpen: false })); return false; }
      e.preventDefault();
      setSuggestState(prev => ({ ...prev, index: prev.index + 1 >= currentSuggestList.length ? 0 : prev.index + 1 }));
      return true;
    }
    if (e.key === 'ArrowUp') {
      if (e.shiftKey) { setSuggestState(prev => ({ ...prev, isOpen: false })); return false; }
      e.preventDefault();
      setSuggestState(prev => ({ ...prev, index: prev.index - 1 < 0 ? currentSuggestList.length - 1 : prev.index - 1 }));
      return true;
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      setSuggestState(prev => ({ ...prev, isOpen: false })); 
      return false;
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      if (currentSuggestList[suggestState.index]) {
        handleSelectSuggest(currentSuggestList[suggestState.index]);
      }
      return true;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setSuggestState(prev => ({ ...prev, isOpen: false }));
      return true;
    }
    return false;
  };

  return { suggestState, currentSuggestList, handleSelectSuggest, handleAutocompleteChange, handleAutocompleteKeyDown };
};