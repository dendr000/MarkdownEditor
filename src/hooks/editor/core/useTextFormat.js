// C:\dev\MarkdownEditor\src\hooks\editor\core\useTextFormat.js
/*
 * 파일 위치: src/hooks/editor/core/useTextFormat.js
 * 파일 설명: useEditor에서 분리됨. 마크다운 포맷팅, 데이터 삽입, 찾기/바꾸기 등 DOM에 텍스트를 실질적으로 치환/삽입하는 역할을 전담합니다.
 */
import { insertTextNatively } from '../../../utils/editorCore';

export const useTextFormat = (markdown, textareaRef, setSelectionRange, setSelectedTableText) => {
  const handleFormat = (originalPrefix, suffix = '', isBlock = false) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);

    if (originalPrefix === '[^1]') {
      const regex = /\[\^(\d+)\]/g;
      let maxNum = 0, match;
      while ((match = regex.exec(markdown)) !== null) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
      const nextNum = maxNum + 1;
      insertTextNatively(textarea, start, end, `[^${nextNum}]`);
      const currentVal = textarea.value;
      const appendText = (currentVal.endsWith('\n') ? '\n' : '\n\n') + `[^${nextNum}]: `;
      insertTextNatively(textarea, currentVal.length, currentVal.length, appendText);
      return;
    }

    let replacement = '';
    let newCursorOffset = 0;
    if (isBlock) {
      const defaultPlaceholder = '내용을 입력하세요';
      replacement = originalPrefix + (selectedText || defaultPlaceholder) + suffix;
      newCursorOffset = originalPrefix.length + (selectedText ? selectedText.length : defaultPlaceholder.length);
    } else {
      replacement = originalPrefix + selectedText + suffix;
      newCursorOffset = originalPrefix.length + selectedText.length;
    }
    insertTextNatively(textarea, start, end, replacement);
    setTimeout(() => textarea.setSelectionRange(start + originalPrefix.length, start + newCursorOffset), 0);
  };

  const prepareModalState = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      setSelectionRange({ start, end });
      setSelectedTableText(start !== end ? markdown.substring(start, end) : '');
    }
  };

  const handleInsertTable = (tableOutput, currentSelectionRange) => {
    if (!textareaRef.current || !selectedFile || isReadOnly) return;
    insertTextNatively(textareaRef.current, currentSelectionRange.start, currentSelectionRange.end, tableOutput);
  };

  const handleReplaceAll = (findStr, replaceStr, inSelectionOnly, searchRange) => {
    if (!textareaRef.current || !findStr || !selectedFile || isReadOnly) return;
    const textarea = textareaRef.current;
    const currentVal = textarea.value;
    const parsedFind = findStr.replace(/\\n/g, '\n');
    const parsedReplace = replaceStr.replace(/\\n/g, '\n');
    
    let newVal;
    if (inSelectionOnly && searchRange && searchRange.end > searchRange.start) {
      const beforeSelection = currentVal.substring(0, searchRange.start);
      const selectedText = currentVal.substring(searchRange.start, searchRange.end);
      const afterSelection = currentVal.substring(searchRange.end);
      const replacedSelection = selectedText.split(parsedFind).join(parsedReplace);
      newVal = beforeSelection + replacedSelection + afterSelection;
    } else {
      newVal = currentVal.split(parsedFind).join(parsedReplace);
    }
    if (currentVal !== newVal) {
      insertTextNatively(textarea, 0, currentVal.length, newVal);
    }
  };

  return { handleFormat, prepareModalState, handleInsertTable, handleReplaceAll };
};