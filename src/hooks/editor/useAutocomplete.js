// C:\dev\MarkdownEditor\src\hooks\editor\useAutocomplete.js
/*
 * 파일 위치: src/hooks/editor/useAutocomplete.js
 * 파일 설명: 프로그래밍 언어(SQL, Java 등)의 예약어 자동완성 및 커서 좌표(Mirror Div) 추적을 통합 관리하는 훅입니다.
 * (v4.0 수정사항): Shift 다중 선택 드래그 시 Arrow Key가 먹히지 않던 버그 해결 및 사전 동적 병합 로직 제거(사전 파일로 이관).
 */
import { useState } from 'react';
import { getLanguage, KEYWORD_DICT } from '../../utils/editor/codeDictionary';

// [핵심 로직] Textarea 내부의 텍스트 커서(Caret) X, Y 픽셀 좌표를 추출하는 Mirror Div 알고리즘
const getCaretCoordinates = (element, position) => {
  const div = document.createElement('div');
  const style = window.getComputedStyle(element);

  // Textarea와 완벽하게 동일한 글꼴 및 박스 모델 환경을 복제합니다.
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
  div.style.left = '-9999px'; // 화면 밖으로 숨김
  div.style.whiteSpace = 'pre-wrap';
  div.style.wordWrap = 'break-word';

  // 커서 위치 전까지의 텍스트를 채웁니다.
  div.textContent = element.value.substring(0, position);

  // 커서 위치를 마킹하기 위한 span 태그 생성
  const span = document.createElement('span');
  span.textContent = element.value.substring(position) || '.';
  div.appendChild(span);
  document.body.appendChild(div);

  // 스크롤 위치를 보정한 최종 좌표 계산
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

  // 현재 언어 컨텍스트에 따라 필터링된 자동완성 리스트를 반환합니다.
  const currentSuggestList = (() => {
    if (!suggestState.isOpen) return [];
    
    const lang = getLanguage(selectedFile);
    const dict = KEYWORD_DICT[lang] || [];

    return dict.filter(item =>
      (item.name || item.id).toLowerCase().includes(suggestState.query.toLowerCase())
    );
  })();

  const handleSelectSuggest = (item) => {
    console.log("[useAutocomplete v4.0] 코드 예약어 선택 완료:", item);
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

    // 마크다운(.md)이나 일반 텍스트는 예약어 추천을 띄우지 않습니다.
    if (lang === 'markdown' || lang === 'text') {
      setSuggestState(prev => prev.isOpen ? { ...prev, isOpen: false } : prev);
      return;
    }

    // 개발 언어 키워드 트리거 검사 (공백이나 줄바꿈 뒤 영문 시작)
    const codeMatch = textBeforeCursor.match(/(?:^|[\s(])([a-zA-Z_][a-zA-Z0-9_]*)$/);
    
    // 최소 2글자 이상 입력했을 때만 추천을 시작합니다.
    if (codeMatch && codeMatch[1].length >= 2) {
      const dict = KEYWORD_DICT[lang] || [];
      const hasMatch = dict.some(item => (item.name || item.id).toLowerCase().includes(codeMatch[1].toLowerCase()));
      
      if (hasMatch) {
        // 커서의 브라우저상 절대 좌표(Viewport) 계산
        const coords = getCaretCoordinates(textareaRef.current, cursor);
        const rect = textareaRef.current.getBoundingClientRect();

        setSuggestState({
          isOpen: true, 
          query: codeMatch[1], 
          index: 0, 
          cursorPosition: cursor,
          top: rect.top + coords.top + 24, // 커서 바로 아래(약 24px 폰트/줄간격)에 팝업 위치
          left: rect.left + coords.left
        });
        return;
      }
    }

    // 조건에 맞지 않으면 즉시 팝업을 닫습니다.
    setSuggestState(prev => prev.isOpen ? { ...prev, isOpen: false } : prev);
  };

  const handleAutocompleteKeyDown = (e) => {
    if (!suggestState.isOpen) return false;

    // [핵심 수정] 방향키 입력 시 Shift 키가 눌려있다면 텍스트 드래그(선택)를 위해 팝업을 닫고 브라우저 기본 동작을 허용합니다.
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