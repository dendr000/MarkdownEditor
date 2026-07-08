// src/components/Editor.jsx
import './Editor.css';

function Editor({ markdown, setMarkdown }) {
  return (
    <div className="editor-container">
      <textarea
        className="editor-textarea"
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
        placeholder="여기에 마크다운을 작성하세요..."
        spellCheck="false"
      />
    </div>
  );
}

export default Editor;