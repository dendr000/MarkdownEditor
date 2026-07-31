// src/hooks/editor/useAutocomplete.js v2.0
/*
 * 파일 위치: src/hooks/editor/useAutocomplete.js
 * 파일 설명: 마크다운 가상 자동완성(@, #, :) 및 프로그래밍 언어의 예약어 자동완성을 통합 관리하는 훅입니다.
 */
import { useState } from 'react';
import { getLanguage, KEYWORD_DICT } from '../../utils/editor/codeDictionary';

const MOCK_AUTOCOMPLETE_DATA = {
  '@': [
    { id: 'octocat', name: 'octocat', desc: 'GitHub 마스코트' },
    { id: 'torvalds', name: 'torvalds', desc: '리눅스 토발즈' },
    { id: 'gaearon', name: 'gaearon', desc: '리액트 코어 개발자' },
    { id: 'dan_abramov', desc: 'React 댄 아브라모프' },
    { id: 'charlie', name: 'charlie', desc: '프론트엔드 리드 엔지니어' }
  ],
  '#': [
    { id: '101', name: 'UI Bug', desc: '모바일 헤더 메뉴 툴바 영역 겹침 현상 해결' },
    { id: '102', name: 'Table Export', desc: 'HTML 표 데이터를 CSV 파일로 즉시 출력 기능' },
    { id: '103', name: 'Auth Issue', desc: '세션 만료 경고 창 백그라운드 스크롤 차단' },
    { id: '104', name: 'Dark Theme', desc: '전역 CSS 변수 테마 분기 가동 정책' }
  ],
  ':': [
    { id: '1', name: '+1', char: '👍' },
    { id: '2', name: '-1', char: '👎' },
    { id: '3', name: 'smile', char: '😄' },
    { id: '4', name: 'tada', char: '🎉' },
    { id: '5', name: 'rocket', char: '🚀' },
    { id: '6', name: 'eyes', char: '👀' },
    { id: '7', name: 'heart', char: '❤️' }
  ]
};

// selectedFile 인자를 추가하여 파일 확장자를 식별합니다.
export const useAutocomplete = (markdown, setMarkdown, textareaRef, selectedFile) => {
  const [suggestState, setSuggestState] = useState({
    isOpen: false,
    type: 'markdown', // 'markdown' 또는 'code'
    trigger: '',
    query: '',
    index: 0,
    cursorPosition: 0
  });

  // 현재 언어 컨텍스트와 타입에 따라 필터링된 리스트를 반환합니다.
  const currentSuggestList = (() => {
    if (!suggestState.isOpen) return [];
    
    if (suggestState.type === 'markdown') {
      return (MOCK_AUTOCOMPLETE_DATA[suggestState.trigger] || []).filter(item =>
        (item.name || item.id || '').toLowerCase().includes(suggestState.query.toLowerCase())
      );
    } else {
      const lang = getLanguage(selectedFile);
      const dict = KEYWORD_DICT[lang] || [];
      return dict.filter(item =>
        (item.name || item.id).toLowerCase().includes(suggestState.query.toLowerCase())
      );
    }
  })();

  const handleSelectSuggest = (item) => {
    console.log("[useAutocomplete v2.0] 자동완성 항목 선택 완료:", item);
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursor = textarea.selectionStart;
    const textBeforeCursor = markdown.substring(0, cursor);
    const textAfterCursor = markdown.substring(cursor);

    let insertVal = '';
    let queryLength = 0;

    // 마크다운과 코드의 치환 텍스트 길이를 다르게 계산합니다.
    if (suggestState.type === 'markdown') {
      queryLength = suggestState.trigger.length + suggestState.query.length;
      if (suggestState.trigger === '@') insertVal = `@${item.name || item.id} `;
      else if (suggestState.trigger === '#') insertVal = `#${item.id} `;
      else if (suggestState.trigger === ':') insertVal = `:${item.name}: `;
    } else {
      queryLength = suggestState.query.length;
      insertVal = item.name || item.id;
    }

    const lastTriggerIndex = cursor - queryLength;
    if (lastTriggerIndex < 0) return;

    const newText = markdown.substring(0, lastTriggerIndex) + insertVal + textAfterCursor;
    setMarkdown(newText);

    setSuggestState({ isOpen: false, type: 'markdown', trigger: '', query: '', index: 0, cursorPosition: 0 });

    setTimeout(() => {
      textarea.focus();
      const nextCursorPos = lastTriggerIndex + insertVal.length;
      textarea.setSelectionRange(nextCursorPos, nextCursorPos);
    }, 0);
  };

  const handleAutocompleteChange = (val, cursor) => {
    const textBeforeCursor = val.substring(0, cursor);
    const lang = getLanguage(selectedFile);

    if (lang === 'markdown') {
      // 1. 마크다운 트리거 검사
      const mdMatch = textBeforeCursor.match(/(?:^|\s)([@#:])([a-zA-Z0-9_\-+가-힣]*)$/);
      if (mdMatch) {
        setSuggestState({
          isOpen: true, type: 'markdown', trigger: mdMatch[1], query: mdMatch[2], index: 0, cursorPosition: cursor
        });
        return;
      }
    } else {
      // 2. 개발 언어 키워드 트리거 검사 (공백이나 줄바꿈 뒤에 영문/@ 시작)
      const codeMatch = textBeforeCursor.match(/(?:^|[\s(])([@a-zA-Z_][a-zA-Z0-9_]*)$/);
      // 최소 2글자 이상 입력했을 때만 팝업을 엽니다.
      if (codeMatch && codeMatch[1].length >= 2) {
        // 사전에 해당 텍스트를 포함하는 키워드가 1개 이상 존재할 때만 팝업을 엽니다.
        const dict = KEYWORD_DICT[lang] || [];
        const hasMatch = dict.some(item => (item.name || item.id).toLowerCase().includes(codeMatch[1].toLowerCase()));
        
        if (hasMatch) {
          setSuggestState({
            isOpen: true, type: 'code', trigger: '', query: codeMatch[1], index: 0, cursorPosition: cursor
          });
          return;
        }
      }
    }

    // 조건에 맞지 않으면 닫기
    setSuggestState(prev => prev.isOpen ? { ...prev, isOpen: false } : prev);
  };

  const handleAutocompleteKeyDown = (e) => {
    if (!suggestState.isOpen) return false;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSuggestState(prev => ({ ...prev, index: prev.index + 1 >= currentSuggestList.length ? 0 : prev.index + 1 }));
      return true;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSuggestState(prev => ({ ...prev, index: prev.index - 1 < 0 ? currentSuggestList.length - 1 : prev.index - 1 }));
      return true;
    }
    if (e.key === 'Enter' || e.key === 'Tab') { // 코드 작성 편의를 위해 Tab 키 추가
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