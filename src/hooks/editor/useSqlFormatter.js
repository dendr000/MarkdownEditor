// src/hooks/editor/useSqlFormatter.js v1.0
/*
 * 파일 위치: src/hooks/editor/useSqlFormatter.js
 * 파일 설명: SQL 파일(.sql) 편집 시, 예약어를 감지하여 스페이스바나 엔터 입력 시 자동으로 대문자로 치환해 주는 커스텀 훅입니다.
 * 연결 위치: src/components/editor/Editor.jsx
 * 기능: 정규식과 Set 객체를 사용하여 에디터 성능 저하 없이 가볍고 빠른 자동 포매팅을 지원합니다.
 */
import { useCallback } from 'react';

// SQL 예약어 목록 (조회 속도 최적화를 위해 Set 사용)
const SQL_KEYWORDS = new Set([
  'select', 'from', 'where', 'and', 'or', 'insert', 'into', 'update', 'set', 'delete',
  'create', 'table', 'view', 'alter', 'drop', 'int', 'varchar', 'bigint', 'datetime',
  'text', 'boolean', 'not', 'null', 'primary', 'key', 'foreign', 'references', 'default',
  'as', 'join', 'inner', 'left', 'right', 'outer', 'on', 'group', 'by', 'order', 'having',
  'limit', 'with', 'case', 'when', 'then', 'else', 'end', 'is', 'in', 'exists', 'like'
]);

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

      // 3. 커서 바로 앞의 영단어 추출
      const match = textBefore.match(/([a-zA-Z_]+)$/);

      if (match) {
        const lastWord = match[1];

        // 4. 추출한 단어가 SQL 예약어인지 검사
        if (SQL_KEYWORDS.has(lastWord.toLowerCase())) {
          e.preventDefault(); // 스페이스/엔터 기본 동작 차단

          // 5. 대문자로 치환 및 입력한 키(스페이스/엔터) 덧붙임
          const newTextBefore = textBefore.substring(0, textBefore.length - lastWord.length) + lastWord.toUpperCase();
          const insertChar = e.key === 'Enter' ? '\n' : ' ';
          const newValue = newTextBefore + insertChar + textAfter;

          // 6. textarea 값 즉시 업데이트 및 커서 위치 재조정 (커서가 튀는 현상 방지)
          textarea.value = newValue;
          const newCursorPos = newTextBefore.length + insertChar.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);

          // 7. React 상태 동기화
          setMarkdown(newValue);
          console.log(`[useSqlFormatter v1.0] SQL 예약어 자동 치환 완료: ${lastWord.toUpperCase()}`);
          
          return true; // 커스텀 포매팅 로직이 처리되었음을 반환
        }
      }
    }
    return false; // 예약어 치환 조건에 맞지 않으면 false 반환
  }, [selectedFile, setMarkdown, textareaRef]);

  return { handleSqlFormatKeyDown };
}