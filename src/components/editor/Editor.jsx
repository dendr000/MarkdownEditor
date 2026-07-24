// src/components/editor/Editor.jsx v9.5
/*
 * 파일 설명: 마크다운 텍스트 편집 및 매크로 기능을 제공하는 에디터 메인 컴포넌트입니다.
 * (v9.5 수정사항): 파일 크기(250줄 제약) 최적화를 위해 코어 DOM 연산을 editorCore.js로 분리하였으며,
 * 확장자 감지 테마 변경 및 다중 줄 Tab 들여쓰기 로직이 적용되었습니다.
 */
import { useState, useEffect } from 'react';
import { Table, FileCode2, FolderTree, Workflow, Library, GitCommit } from 'lucide-react';
import TableModal from '../table/TableModal';
import HtmlTableModal from '../table/HtmlTableModal';
import FolderTreeModal from '../tree/FolderTreeModal';
import DiagramModal from '../diagram/DiagramModal';
import DetailsModal from './toolbar/DetailsModal';
import TemplateModal from './toolbar/TemplateModal';
import MathModal from './toolbar/MathModal';
import CommitGuideModal from './toolbar/CommitGuideModal';
import FindReplaceModal from './toolbar/FindReplaceModal';
import { HeadingGroup, FormatGroup, ListGroup, MediaGroup, GithubGroup } from './toolbar/ToolbarGroups';
import AutocompletePopup from './AutocompletePopup';
import { useImageUpload } from '../../hooks/editor/useImageUpload';
import { useAutocomplete } from '../../hooks/editor/useAutocomplete';
import { saveFileContent } from '../../api/fileApi';
import { insertTextNatively, processTabIndentation } from '../../utils/editorCore'; // [신규] 코어 연산 유틸
import './Editor.css';

function Editor({ markdown, setMarkdown, selectedFile, textareaRef }) {
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

  const { isDragActive, handleDragOver, handleDragLeave, handleDrop, handlePaste } = useImageUpload(markdown, setMarkdown, textareaRef);
  const { suggestState, currentSuggestList, handleSelectSuggest, handleAutocompleteChange, handleAutocompleteKeyDown } = useAutocomplete(markdown, setMarkdown, textareaRef);

  // 파일 확장자 추출 및 읽기 전용 모드 판별 로직 [버전 9.6]
  const getFileExtension = () => {
    if (!selectedFile) return 'md';
    const parts = selectedFile.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : 'md';
  };
  const fileExt = getFileExtension();
  const isReadOnly = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'xlsx', 'csv'].includes(fileExt);

  // 5초 지연(Debounce) 자동 저장 로직 [버전 9.6]
  useEffect(() => {
    if (!selectedFile || isReadOnly) {
      if (isReadOnly) console.log(`[Editor v9.6] 읽기 전용 파일 감지: '${selectedFile}' 자동 저장 차단`);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        await saveFileContent(selectedFile, markdown);
        console.log(`[Editor v9.6] 5초 무입력 감지: '${selectedFile}' 자동 저장 완료`);
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

  const handleReplaceAll = (findStr, replaceStr, inSelectionOnly, selectionRange) => {
    if (!textareaRef.current || !findStr) return;
    const textarea = textareaRef.current;
    const currentVal = textarea.value;
    const parsedFind = findStr.replace(/\\n/g, '\n');
    const parsedReplace = replaceStr.replace(/\\n/g, '\n');
    
    let newVal;
    if (inSelectionOnly && selectionRange && selectionRange.end > selectionRange.start) {
      const beforeSelection = currentVal.substring(0, selectionRange.start);
      const selectedText = currentVal.substring(selectionRange.start, selectionRange.end);
      const afterSelection = currentVal.substring(selectionRange.end);
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
        if (selectedFile && !isReadOnly) saveFileContent(selectedFile, markdown).then(() => console.log(`[Editor v9.6] 수동 저장 완료: ${selectedFile}`));
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

    if (handleAutocompleteKeyDown(e)) return;

    // [신규] VSC 스타일 Tab 제어 로직 바인딩
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

  return (
    <div className="editor-container" style={{ position: 'relative' }}>
      <div className="editor-toolbar-wrapper">
        <div className="editor-toolbar">
          <HeadingGroup handleFormat={handleFormat} />
          <div className="toolbar-divider" />
          <FormatGroup handleFormat={handleFormat} onOpenMathModal={() => setIsMathModalOpen(true)} />
          <div className="toolbar-divider" />
          <ListGroup handleFormat={handleFormat} />
          <div className="toolbar-divider" />
          <MediaGroup handleFormat={handleFormat} />
          <div className="toolbar-divider" />
          <GithubGroup handleFormat={handleFormat} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} onOpenDetailsModal={() => { prepareModalState('Details'); setIsDetailsModalOpen(true); }} />
          <div className="toolbar-divider" />
          <div className="toolbar-group">
            <button onClick={() => setIsTemplateModalOpen(true)} title="템플릿 보관함"><Library size={18} /></button>
            <button onClick={() => setIsCommitGuideOpen(true)} title="Git 커밋 가이드"><GitCommit size={18} /></button>
            <button onClick={() => { prepareModalState('MD Table'); setIsTableModalOpen(true); }} title="마크다운 표 삽입"><Table size={18} /></button>
            <button onClick={() => { prepareModalState('HTML Table'); setIsHtmlTableModalOpen(true); }} title="고급 HTML 표 삽입"><FileCode2 size={18} /></button>
            <button onClick={() => { prepareModalState('Folder Tree'); setIsFolderTreeModalOpen(true); }} title="폴더 트리 생성"><FolderTree size={18} /></button>
            <button onClick={() => { prepareModalState('Diagram'); setIsDiagramModalOpen(true); }} title="다이어그램 작성기"><Workflow size={18} /></button>
          </div>
        </div>
      </div>
      
      <textarea
        ref={textareaRef}
        // [신규] 추출된 확장자(ext-html 등)를 클래스로 주입
        className={`editor-textarea ext-${fileExt} ${isDragActive ? 'drag-active' : ''}`}
        value={markdown}
        onChange={(e) => {
          setMarkdown(e.target.value);
          handleAutocompleteChange(e.target.value, e.target.selectionStart);
        }}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        placeholder={selectedFile ? (isReadOnly ? "이미지 및 엑셀 파일은 에디터에서 직접 수정할 수 없습니다." : "여기에 마크다운을 작성하세요...") : "좌측 탐색기에서 파일을 선택해 주세요."}
        spellCheck="false"
        disabled={!selectedFile || isReadOnly}
      />

      <AutocompletePopup suggestState={suggestState} currentSuggestList={currentSuggestList} onSelect={handleSelectSuggest} />
      <TableModal isOpen={isTableModalOpen} onClose={() => setIsTableModalOpen(false)} onInsert={handleInsertTable} initialTableMarkdown={selectedTableText} />
      <HtmlTableModal isOpen={isHtmlTableModalOpen} onClose={() => setIsHtmlTableModalOpen(false)} onInsert={handleInsertTable} initialTableHtml={selectedTableText} />
      <FolderTreeModal isOpen={isFolderTreeModalOpen} onClose={() => setIsFolderTreeModalOpen(false)} onInsert={handleInsertTable} />
      <DiagramModal isOpen={isDiagramModalOpen} onClose={() => setIsDiagramModalOpen(false)} onInsert={handleInsertTable} initialDiagramMarkdown={selectedTableText} />
      <DetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} onInsert={handleInsertTable} initialContent={selectedTableText} />
      <TemplateModal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} onInsert={handleInsertTable} />
      <MathModal isOpen={isMathModalOpen} onClose={() => setIsMathModalOpen(false)} onInsert={handleInsertTable} />
      <CommitGuideModal isOpen={isCommitGuideOpen} onClose={() => setIsCommitGuideOpen(false)} onInsert={handleInsertTable} />
      <FindReplaceModal isOpen={isFindReplaceOpen} onClose={() => setIsFindReplaceOpen(false)} onReplaceAll={handleReplaceAll} markdown={markdown} selectionRange={replaceSelectionRange} />
    </div>
  );
}

export default Editor;