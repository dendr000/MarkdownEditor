// src/hooks/editor/typing/useSqlFormatter.js
/*
 * 파일 위치: src/hooks/editor/useSqlFormatter.js
 * 파일 설명: SQL 파일(.sql) 편집 시, 예약어를 감지하여 스페이스바나 엔터 입력 시 자동으로 대문자로 치환해 주는 커스텀 훅입니다.
 * 연결 위치: src/components/editor/Editor.jsx
 * 기능: 단일 단어뿐만 아니라 'PRIMARY KEY', 'NOT NULL'과 같은 최대 3개 조합의 복합 키워드를 인식하여 안전하게 치환합니다.
 */
import { useCallback } from 'react';
import { SQL_UPPERCASE_KEYWORDS } from '../../../utils/editor/codeDictionary';

export function useSqlFormatter(markdown, setMarkdown, selectedFile, textareaRef) {
  const handleSqlFormatKeyDown = useCallback((e) => {
    // 1. 현재 파일이 sql 확장자일 때만 자동 치환 실행
    const isSqlFile = selectedFile && selectedFile.toLowerCase().endsWith('.sql');
    if (!isSqlFile) return false;

    // 2. 스페이스바 또는 엔터 키 입력 감지
    if (e.key === ' ' || e.key === 'Enter') {
      const textarea = textareaRef.current;
      if (!textarea) return false;

      const cursorPos = textarea.selectionStart;
      const textBefore = textarea.value.substring(0, cursorPos);
      const textAfter = textarea.value.substring(cursorPos);

      // 3. 커서 바로 앞의 최대 3개 단어 추출 (공백 포함)
      // 정규식: 마지막에 위치한 (알파벳/언더스코어 연속) 단어 조합을 최대 3세트까지 캡처
      const match = textBefore.match(/([a-zA-Z_]+(?:\s+[a-zA-Z_]+){0,2})$/);

      if (match) {
        const phrase = match[1];
        const words = phrase.trim().split(/\s+/);

        let matchedKeyword = null;
        let matchedLength = 0;

        // 최대 3개 단어부터 1개 단어까지 역순으로 묶어 사전에 매칭되는지 검사
        for (let i = words.length; i > 0; i--) {
          const targetWords = words.slice(-i);
          const targetStr = targetWords.join(' ');

          // 사전에 존재하는 키워드일 경우
          if (SQL_UPPERCASE_KEYWORDS.has(targetStr.toLowerCase())) {
            // 사용자가 입력한 원래의 텍스트 간격(다중 스페이스 등)을 그대로 보존하면서 길이를 계산하기 위한 정규식
            const escapedWords = targetWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
            const regexStr = escapedWords.join('\\s+') + '$';
            const exactMatch = phrase.match(new RegExp(regexStr, 'i'));

            if (exactMatch) {
              matchedLength = exactMatch[0].length;
              matchedKeyword = exactMatch[0]; // 원본 텍스트 형태(원래 간격 포함) 유지
              break; // 가장 긴 단어 조합이 매칭되면 하위 루프 즉시 중단
            }
          }
        }

        if (matchedLength > 0 && matchedKeyword) {
          e.preventDefault(); // 스페이스/엔터 기본 동작 차단

          // 4. 대문자로 치환 및 사용자가 방금 누른 키(스페이스/엔터)를 뒤에 덧붙임
          const newTextBefore = textBefore.substring(0, textBefore.length - matchedLength) + matchedKeyword.toUpperCase();
          const insertChar = e.key === 'Enter' ? '\n' : ' ';
          const newValue = newTextBefore + insertChar + textAfter;

          // 5. textarea 값 즉시 업데이트 및 커서 위치 재조정 (커서가 튀는 현상 방지)
          textarea.value = newValue;
          const newCursorPos = newTextBefore.length + insertChar.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);

          // 6. React 상태 동기화
          setMarkdown(newValue);
          console.log(`[useSqlFormatter v1.1] SQL 예약어 자동 치환 완료: ${matchedKeyword.toUpperCase()}`);
          
          return true; // 커스텀 포매팅 로직이 낚아채서 처리했음을 반환
        }
      }
    }
    return false;
  }, [selectedFile, setMarkdown, textareaRef]);

  return { handleSqlFormatKeyDown };
}