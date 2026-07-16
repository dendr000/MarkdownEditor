// src/hooks/editor/useAutocomplete.js v1.0
/*
 * 파일 설명: GitHub 스타일 가상 자동완성(@유저, #이슈, :이모지)의 데이터 매핑 및 키보드 조작, 텍스트 삽입 로직을 관리하는 훅입니다.
 * 연결 위치: src/components/editor/Editor.jsx
 */
import { useState } from 'react';

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

export const useAutocomplete = (markdown, setMarkdown, textareaRef) => {
  const [suggestState, setSuggestState] = useState({
    isOpen: false,
    trigger: '',
    query: '',
    index: 0,
    cursorPosition: 0
  });

  const currentSuggestList = (MOCK_AUTOCOMPLETE_DATA[suggestState.trigger] || []).filter(item =>
    (item.name || item.id || '').toLowerCase().includes(suggestState.query.toLowerCase())
  );

  const handleSelectSuggest = (item) => {
    console.log("[useAutocomplete] 자동완성 항목 선택 완료:", item);
    const textarea = textareaRef.current;
    if (!textarea) {
      console.log("[useAutocomplete] 에러: textarea 인스턴스를 찾을 수 없습니다.");
      return;
    }

    const cursor = textarea.selectionStart;
    const textBeforeCursor = markdown.substring(0, cursor);
    const textAfterCursor = markdown.substring(cursor);

    const lastTriggerIndex = textBeforeCursor.lastIndexOf(suggestState.trigger + suggestState.query);
    if (lastTriggerIndex === -1) {
      console.log("[useAutocomplete] 경고: 텍스트 내에서 검색 위치 역추적 실패");
      return;
    }

    let insertVal = '';
    if (suggestState.trigger === '@') {
      insertVal = `@${item.name || item.id} `;
    } else if (suggestState.trigger === '#') {
      insertVal = `#${item.id} `;
    } else if (suggestState.trigger === ':') {
      insertVal = `:${item.name}: `;
    }

    const newText = markdown.substring(0, lastTriggerIndex) + insertVal + textAfterCursor;
    setMarkdown(newText);

    setSuggestState({ isOpen: false, trigger: '', query: '', index: 0, cursorPosition: 0 });

    setTimeout(() => {
      console.log("[useAutocomplete] 텍스트 갱신 후 커서 위치 동기화 완료");
      textarea.focus();
      const nextCursorPos = lastTriggerIndex + insertVal.length;
      textarea.setSelectionRange(nextCursorPos, nextCursorPos);
    }, 0);
  };

  const handleAutocompleteChange = (val, cursor) => {
    const textBeforeCursor = val.substring(0, cursor);
    const match = textBeforeCursor.match(/(?:^|\s)([@#:])([a-zA-Z0-9_\-+가-힣]*)$/);
    
    if (match) {
      console.log(`[useAutocomplete] 트리거 감지: ${match[1]}, 검색어: ${match[2]}`);
      setSuggestState({
        isOpen: true,
        trigger: match[1],
        query: match[2],
        index: 0,
        cursorPosition: cursor
      });
    } else {
      setSuggestState(prev => prev.isOpen ? { ...prev, isOpen: false } : prev);
    }
  };

  const handleAutocompleteKeyDown = (e) => {
    if (!suggestState.isOpen) return false;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      console.log("[useAutocomplete] 방향키 하향 조작");
      setSuggestState(prev => ({
        ...prev,
        index: prev.index + 1 >= currentSuggestList.length ? 0 : prev.index + 1
      }));
      return true;
    }
    
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      console.log("[useAutocomplete] 방향키 상향 조작");
      setSuggestState(prev => ({
        ...prev,
        index: prev.index - 1 < 0 ? currentSuggestList.length - 1 : prev.index - 1
      }));
      return true;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      console.log("[useAutocomplete] 엔터 키 수신 - 선택 실행");
      if (currentSuggestList[suggestState.index]) {
        handleSelectSuggest(currentSuggestList[suggestState.index]);
      }
      return true;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      console.log("[useAutocomplete] ESC 키 수신 - 팝업 닫기");
      setSuggestState(prev => ({ ...prev, isOpen: false }));
      return true;
    }

    return false;
  };

  return { suggestState, currentSuggestList, handleSelectSuggest, handleAutocompleteChange, handleAutocompleteKeyDown };
};