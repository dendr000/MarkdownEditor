// C:\dev\MarkdownEditor\src\hooks\editor\core\useKeyMap.js
/*
 * 파일 위치: src/hooks/editor/core/useKeyMap.js
 * 파일 설명: useEditor에서 분리됨. 사용자의 키보드 입력(단축키, 줄바꿈 등)을 가장 먼저 감지하여 각 기능들로 연결해 주는 라우터 역할을 합니다.
 */
import { saveFileContent } from '../../../api/fileApi';
import { insertTextNatively, processTabIndentation } from '../../../utils/editorCore';

export const useKeyMap = (
  markdown, 
  selectedFile, 
  textareaRef, 
  fileExt, 
  isReadOnly, 
  handleAutocompleteKeyDown, 
  handleFormat, 
  setReplaceSelectionRange, 
  setIsFindReplaceOpen
) => {
  const handleKeyDown = (e) => {
    // 1. 단축키(Ctrl / Cmd) 감지
    if (e.ctrlKey || e.metaKey) {
      const key = e.key.toLowerCase();
      
      if (key === 's') {
        e.preventDefault();
        if (selectedFile && !isReadOnly) saveFileContent(selectedFile, markdown).then(() => console.log(`[useKeyMap v1.0] 수동 저장 완료: ${selectedFile}`));
        return;
      }
      if (e.shiftKey && key === 'f') {
        e.preventDefault();
        if (textareaRef.current) setReplaceSelectionRange({ start: textareaRef.current.selectionStart, end: textareaRef.current.selectionEnd });
        setIsFindReplaceOpen(true);
        return;
      }
      
      if (key === 'b') { e.preventDefault(); handleFormat('**', '**'); return; }
      if (key === 'i') { e.preventDefault(); handleFormat('*', '*'); return; }
      if (key === 'q') { e.preventDefault(); handleFormat('[^1]', ''); return; }
      if (key === 'k') { e.preventDefault(); handleFormat('[', '](url)'); return; }
    }

    // 2. 예약어 자동완성(Arrow, Enter, Esc) 팝업 우선순위 가로채기
    if (handleAutocompleteKeyDown && handleAutocompleteKeyDown(e)) return;

    // 3. Tab 들여쓰기 감지
    if (e.key === 'Tab') {
      if (!textareaRef.current) return;
      processTabIndentation(textareaRef.current, e);
      return;
    }

    // 4. Enter 줄바꿈 감지
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      if (textareaRef.current) insertTextNatively(textareaRef.current, textareaRef.current.selectionStart, textareaRef.current.selectionStart, '<br>\n');
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      
      const isCodeMode = fileExt && !['md', 'txt'].includes(fileExt.toLowerCase());
      if (isCodeMode) {
        e.preventDefault();
        insertTextNatively(textarea, start, start, '\n');
        return;
      }

      const currentLine = markdown.substring(0, start).split('\n').pop();
      const match = currentLine.match(/^([>-])\s*(.*)/);

      if (match) {
        e.preventDefault();
        if (match[2].trim() === '') {
          insertTextNatively(textarea, start - currentLine.length, start, '\n');
        } else {
          insertTextNatively(textarea, start, start, match[1] === '>' ? '\n> ' : '\n- ');
        }
      } else {
        e.preventDefault();
        insertTextNatively(textarea, start, start, '  \n');
      }
    }
  };

  return { handleKeyDown };
};