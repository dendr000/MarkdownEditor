// src/components/editor/Editor.jsx v3.0
import { useRef, useState } from 'react';
import { Table, FileCode2 } from 'lucide-react';
import TableModal from '../table/TableModal';
import HtmlTableModal from '../table/HtmlTableModal';
import { HeadingGroup, FormatGroup, ListGroup, MediaGroup, GithubGroup } from './toolbar/ToolbarGroups';
import './Editor.css'; 

function Editor({ markdown, setMarkdown }) {
  const textareaRef = useRef(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isHtmlTableModalOpen, setIsHtmlTableModalOpen] = useState(false);
  const [selectedTableText, setSelectedTableText] = useState('');
  const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 });
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleFormat = (prefix, suffix = '', isBlock = false) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);
    const beforeText = markdown.substring(0, start);
    const afterText = markdown.substring(end);

    let newText = '';
    let newCursorPos = 0;

    if (isBlock) {
      const defaultPlaceholder = '내용을 입력하세요';
      newText = beforeText + prefix + (selectedText || defaultPlaceholder) + suffix + afterText;
      newCursorPos = start + prefix.length + (selectedText ? selectedText.length : defaultPlaceholder.length);
    } else {
      newText = beforeText + prefix + selectedText + suffix + afterText;
      newCursorPos = start + prefix.length + selectedText.length;
    }
    
    setMarkdown(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, newCursorPos);
    }, 0);
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
    const textarea = textareaRef.current;
    const { start, end } = selectionRange;
    setMarkdown(markdown.substring(0, start) + tableOutput + markdown.substring(end));
    setTimeout(() => {
      textarea.focus();
      const newPos = start + tableOutput.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  return (
    <div className="editor-container">
      <div className="editor-toolbar-wrapper">
        <div className="editor-toolbar">
          <HeadingGroup handleFormat={handleFormat} />
          <div className="toolbar-divider" />
          
          <FormatGroup handleFormat={handleFormat} />
          <div className="toolbar-divider" />
          
          <ListGroup handleFormat={handleFormat} />
          <div className="toolbar-divider" />
          
          <MediaGroup handleFormat={handleFormat} />
          <div className="toolbar-divider" />
          
          <GithubGroup handleFormat={handleFormat} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} />
          <div className="toolbar-divider" />

          <div className="toolbar-group">
            <button onClick={() => { prepareModalState('MD Table'); setIsTableModalOpen(true); }} title="마크다운 표 삽입"><Table size={18} /></button>
            <button onClick={() => { prepareModalState('HTML Table'); setIsHtmlTableModalOpen(true); }} title="고급 HTML 표 삽입"><FileCode2 size={18} /></button>
          </div>
        </div>
      </div>
      
      <textarea
        ref={textareaRef}
        className="editor-textarea"
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
        placeholder="여기에 마크다운을 작성하세요..."
        spellCheck="false"
      />

      <TableModal isOpen={isTableModalOpen} onClose={() => setIsTableModalOpen(false)} onInsert={handleInsertTable} initialTableMarkdown={selectedTableText} />
      <HtmlTableModal isOpen={isHtmlTableModalOpen} onClose={() => setIsHtmlTableModalOpen(false)} onInsert={handleInsertTable} initialTableHtml={selectedTableText} />
    </div>
  );
}

export default Editor;