// src/hooks/editor/useEditor.js v2.0
/*
 * 파일 위치: src/hooks/editor/useEditor.js
 * 파일 설명: Editor.jsx의 비즈니스 로직(저장, 포맷팅, 키보드 이벤트) 및 모달 상태를 관리하는 커스텀 훅입니다.
 * (v2.0 수정사항): 코드 파일 전용 우회 로직을 모두 제거하고 원래의 마크다운 기반 로직으로 완전 롤백했습니다.
 */
import { useState, useEffect } from 'react';
import { saveFileContent } from '../../api/fileApi';
import { insertTextNatively, processTabIndentation } from '../../utils/editorCore';

export const useEditor = (markdown, setMarkdown, selectedFile, textareaRef, handleAutocompleteKeyDown) => {
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isHtmlTableModalOpen, setIsHtmlTableModalOpen] = useState(false);
  const [isFolderTreeModalOpen, setIsFolderTreeModalOpen] = useState(false);
  const [isDiagramModalOpen, setIsDiagramModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const [isCommitGuideOpen, setIsCommitGuideOpen] = useState(false);
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  
  const [replaceSelectionRange, setReplaceSelectionRange] = useState({ start: 0, end: 0 });
  const [selectedTableText, setSelectedTableText] = useState('');
  const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 });
  const [openDropdown, setOpenDropdown] = useState(null);

  const getFileExtension = () => {
    if (!selectedFile) return 'md';
    const parts = selectedFile.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : 'md';
  };
  
  const fileExt = getFileExtension();
  const isMediaFile = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'xlsx', 'csv', 'pdf', 'pptx', 'ppt', 'docx', 'doc', 'zip', 'tar', 'gz', 'rar', '7z', 'exe'].includes(fileExt);
  const isGeneratedView = markdown && markdown.includes('(읽기 전용)');
  const isReadOnly = isMediaFile || isGeneratedView;

  useEffect(() => {
    if (!selectedFile || isReadOnly) {
      if (isReadOnly) console.log(`[useEditor v2.0] 읽기 전용 뷰어 상태 감지: '${selectedFile}' 자동 저장 차단`);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        await saveFileContent(selectedFile, markdown);
        console.log(`[useEditor v2.0] 5초 무입력 감지: '${selectedFile}' 자동 저장 완료`);
      } catch (e) {
        console.error('자동 저장 실패', e);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [markdown, selectedFile, isReadOnly]);

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

  const prepareModalState = (modalType) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      setSelectionRange({ start, end });
      setSelectedTableText(start !== end ? markdown.substring(start, end) : '');
    }
  };

  const handleInsertTable = (tableOutput) => {
    if (!textareaRef.current) return;
    insertTextNatively(textareaRef.current, selectionRange.start, selectionRange.end, tableOutput);
  };

  const handleReplaceAll = (findStr, replaceStr, inSelectionOnly, searchRange) => {
    if (!textareaRef.current || !findStr) return;
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

  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      const key = e.key.toLowerCase();
      
      if (key === 's') {
        e.preventDefault();
        if (selectedFile && !isReadOnly) saveFileContent(selectedFile, markdown).then(() => console.log(`[useEditor v2.0] 수동 저장 완료: ${selectedFile}`));
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

    if (handleAutocompleteKeyDown && handleAutocompleteKeyDown(e)) return;

    if (e.key === 'Tab') {
      if (!textareaRef.current) return;
      processTabIndentation(textareaRef.current, e);
      return;
    }

    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      if (textareaRef.current) insertTextNatively(textareaRef.current, textareaRef.current.selectionStart, textareaRef.current.selectionStart, '<br>\n');
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
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

  return {
    state: {
      fileExt,
      isReadOnly,
      isTableModalOpen,
      isHtmlTableModalOpen,
      isFolderTreeModalOpen,
      isDiagramModalOpen,
      isDetailsModalOpen,
      isTemplateModalOpen,
      isMathModalOpen,
      isCommitGuideOpen,
      isFindReplaceOpen,
      replaceSelectionRange,
      selectedTableText,
      openDropdown
    },
    actions: {
      setIsTableModalOpen,
      setIsHtmlTableModalOpen,
      setIsFolderTreeModalOpen,
      setIsDiagramModalOpen,
      setIsDetailsModalOpen,
      setIsTemplateModalOpen,
      setIsMathModalOpen,
      setIsCommitGuideOpen,
      setIsFindReplaceOpen,
      setOpenDropdown,
      handleFormat,
      prepareModalState,
      handleInsertTable,
      handleReplaceAll,
      handleKeyDown
    }
  };
};