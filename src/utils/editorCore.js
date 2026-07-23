// src/utils/editorCore.js v1.0
/*
 * 파일 설명: 에디터(Textarea) 내부의 텍스트 조작, 커서 연산, 들여쓰기(Tab) 제어를 담당하는 코어 유틸리티입니다.
 * Editor.jsx의 파일 비대화를 막기 위해 DOM 조작 로직을 분리했습니다.
 */

// 실행 취소(Ctrl+Z) 스택을 보존하며 텍스트를 삽입하는 네이티브 주입기
export const insertTextNatively = (textarea, start, end, replacement) => {
  textarea.focus();
  textarea.setSelectionRange(start, end);
  const success = document.execCommand('insertText', false, replacement);
  if (!success) {
    textarea.setRangeText(replacement, start, end, 'end');
    textarea.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
  }
};

// VSC 스타일의 Tab 들여쓰기 및 Shift+Tab 내어쓰기 알고리즘
export const processTabIndentation = (textarea, e) => {
  e.preventDefault();
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const currentVal = textarea.value;

  // 단일 커서 상태에서 일반 Tab 입력 시: 커서 위치에 스페이스 2개 삽입
  if (!e.shiftKey && start === end) {
    console.log("[editorCore v1.0] 단일 커서 Tab 들여쓰기 실행");
    insertTextNatively(textarea, start, end, '  ');
    return;
  }

  // 드래그된 영역 또는 현재 커서가 속한 전체 줄의 시작과 끝 인덱스 계산
  const lineStart = currentVal.lastIndexOf('\n', start - 1) + 1;
  let lineEnd = currentVal.indexOf('\n', end);
  if (lineEnd === -1) lineEnd = currentVal.length;

  const selectedLinesText = currentVal.substring(lineStart, lineEnd);
  const lines = selectedLinesText.split('\n');

  if (e.shiftKey) {
    // Shift + Tab: 다중 줄 내어쓰기 (최대 2개의 스페이스 공백 제거)
    console.log("[editorCore v1.0] 다중 줄 내어쓰기(Shift+Tab) 연산 실행");
    const newLines = lines.map(line => {
      if (line.startsWith('  ')) return line.substring(2);
      if (line.startsWith(' ')) return line.substring(1);
      if (line.startsWith('\t')) return line.substring(1);
      return line;
    });
    const replacement = newLines.join('\n');
    insertTextNatively(textarea, lineStart, lineEnd, replacement);
    // 연산 후 변경된 전체 블록을 다시 드래그 상태로 유지
    textarea.setSelectionRange(lineStart, lineStart + replacement.length);
  } else {
    // Tab: 다중 줄 들여쓰기 (스페이스 2개 추가)
    console.log("[editorCore v1.0] 다중 줄 들여쓰기(Tab) 연산 실행");
    const newLines = lines.map(line => '  ' + line);
    const replacement = newLines.join('\n');
    insertTextNatively(textarea, lineStart, lineEnd, replacement);
    textarea.setSelectionRange(lineStart, lineStart + replacement.length);
  }
};