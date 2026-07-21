// src/components/editor/toolbar/MathModal.jsx v1.0
/*
 * 파일 설명: LaTeX 문법을 모르는 사용자를 위해 자주 쓰이는 수학 수식 기호들을 버튼(프리셋) 형태로 제공하고, 입력된 수식을 KaTeX 엔진으로 실시간 렌더링하여 보여주는 GUI 모달 컴포넌트입니다.
 * 연결 위치: src/components/editor/Editor.jsx 내부
 */
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const MATH_PRESETS = [
  { label: '분수', snippet: '\\frac{a}{b}' },
  { label: '제곱근', snippet: '\\sqrt{x}' },
  { label: '시그마', snippet: '\\sum_{i=1}^{n}' },
  { label: '인테그랄', snippet: '\\int_{a}^{b}' },
  { label: '극한', snippet: '\\lim_{x \\to \\infty}' },
  { label: '행렬(2x2)', snippet: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
  { label: '±', snippet: '\\pm' },
  { label: '∞', snippet: '\\infty' },
  { label: 'π', snippet: '\\pi' },
  { label: 'θ', snippet: '\\theta' },
  { label: '≠', snippet: '\\neq' },
  { label: '≈', snippet: '\\approx' }
];

function MathModal({ isOpen, onClose, onInsert }) {
  const [latexInput, setLatexInput] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      console.log("[MathModal v1.0] 수식 작성기 모달 활성화 - 상태 초기화");
      setLatexInput('');
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePresetClick = (snippet) => {
    console.log(`[MathModal v1.0] 프리셋 기호 삽입: ${snippet}`);
    if (!inputRef.current) return;
    
    const textarea = inputRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newText = latexInput.substring(0, start) + snippet + latexInput.substring(end);
    setLatexInput(newText);
    
    setTimeout(() => {
      textarea.focus();
      const newPos = start + snippet.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleInsertSubmit = () => {
    console.log("[MathModal v1.0] 수식 블록 에디터 본문 삽입");
    if (!latexInput.trim()) {
      onClose();
      return;
    }
    const formattedBlock = `\n$$\n${latexInput}\n$$\n`;
    onInsert(formattedBlock);
    onClose();
  };

  return (
    <div className="diagram-modal-backdrop" onClick={onClose} style={{ zIndex: 3000 }}>
      <div className="diagram-modal-content" style={{ width: '800px', height: '550px' }} onClick={(e) => e.stopPropagation()}>
        
        <div className="diagram-modal-header">
          <div className="header-title-section">
            <h3>수식 (LaTeX) 작성기 v1.0</h3>
          </div>
          <button className="close-x-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="diagram-modal-body" style={{ display: 'flex', height: 'calc(100% - 120px)' }}>
          
          <div className="diagram-editor-panel" style={{ width: '50%', padding: '20px', borderRight: '1px solid #d0d7de', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div className="panel-title-label" style={{ marginBottom: '8px', fontWeight: 'bold', color: '#57606a', fontSize: '12px' }}>자주 쓰는 기호</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {MATH_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePresetClick(preset.snippet)}
                    style={{ padding: '6px 10px', backgroundColor: '#f6f8fa', border: '1px solid #d0d7de', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', color: '#24292f' }}
                    title={preset.snippet}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="panel-title-label" style={{ marginBottom: '8px', fontWeight: 'bold', color: '#57606a', fontSize: '12px' }}>LaTeX 수식 입력</div>
              <textarea 
                ref={inputRef}
                value={latexInput}
                onChange={(e) => setLatexInput(e.target.value)}
                placeholder="예: c = \pm\sqrt{a^2 + b^2}"
                style={{ width: '100%', flex: 1, padding: '12px', border: '1px solid #d0d7de', borderRadius: '6px', fontSize: '14px', outline: 'none', resize: 'none', fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}
              />
            </div>
          </div>

          <div className="diagram-preview-panel" style={{ width: '50%', padding: '20px', display: 'flex', flexDirection: 'column', backgroundColor: '#f6f8fa' }}>
            <div className="panel-title-label" style={{ marginBottom: '16px', fontWeight: 'bold', color: '#57606a', fontSize: '12px' }}>실시간 미리보기</div>
            <div style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #d0d7de', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
              {latexInput.trim() ? (
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {`$$ ${latexInput} $$`}
                </ReactMarkdown>
              ) : (
                <span style={{ color: '#8c959f', fontSize: '13px' }}>수식을 입력하면 이곳에 렌더링됩니다.</span>
              )}
            </div>
          </div>

        </div>

        <div className="diagram-modal-footer" style={{ padding: '16px 20px', borderTop: '1px solid #d0d7de', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#f6f8fa' }}>
          <button className="cancel-btn" onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #d0d7de', borderRadius: '6px', backgroundColor: '#ffffff', cursor: 'pointer' }}>취소</button>
          <button className="submit-btn" onClick={handleInsertSubmit} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', backgroundColor: '#2da44e', color: '#ffffff', fontWeight: '600', cursor: 'pointer' }}>에디터에 삽입</button>
        </div>
      </div>
    </div>
  );
}

export default MathModal;