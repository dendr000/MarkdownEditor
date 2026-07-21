// src/components/editor/toolbar/DetailsModal.jsx v1.0
/*
 * 파일 설명: 사용자가 제목(Summary)과 숨길 내용(Details)을 쉽게 입력할 수 있도록 돕는 접기/펼치기 GUI 팝업입니다.
 * 에디터에서 드래그한 텍스트를 초기 내용으로 받아오는 연동 로직이 포함되어 있습니다.
 * 연결 위치: src/components/editor/Editor.jsx 내부
 */
import React, { useState, useEffect } from 'react';

function DetailsModal({ isOpen, onClose, onInsert, initialContent = '' }) {
  const [summary, setSummary] = useState('클릭하여 펼치기');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      console.log("[DetailsModal v1.0] 팝업 활성화 - 초기 상태 세팅");
      setSummary('클릭하여 펼치기');
      // 에디터 본문에서 드래그한 텍스트가 있다면 본문에 자동 주입합니다.
      setContent(initialContent || '여기에 숨겨진 내용을 작성합니다.');
    }
  }, [isOpen, initialContent]);

  if (!isOpen) return null;

  const handleInsertSubmit = () => {
    console.log("[DetailsModal v1.0] 접기/펼치기 HTML 렌더링 후 에디터 삽입");
    const formattedBlock = `\n<details>\n<summary>${summary}</summary>\n\n${content}\n\n</details>\n`;
    onInsert(formattedBlock);
    onClose();
  };

  return (
    <div className="diagram-modal-backdrop" onClick={onClose} style={{ zIndex: 3000 }}>
      <div className="diagram-modal-content" style={{ width: '500px', height: 'auto', minHeight: '350px' }} onClick={(e) => e.stopPropagation()}>
        <div className="diagram-modal-header">
          <div className="header-title-section">
            <h3>접기/펼치기 (Details) 생성기 v1.0</h3>
          </div>
          <button className="close-x-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="diagram-modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="gui-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#57606a' }}>
              요약 제목 (Summary)
            </label>
            <input 
              type="text" 
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="예: 클릭해서 정답 보기"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d0d7de', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label className="gui-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '12px', color: '#57606a' }}>
              숨길 내용 (마크다운 지원)
            </label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="숨길 내용을 입력하세요..."
              style={{ width: '100%', flex: 1, minHeight: '120px', padding: '12px', border: '1px solid #d0d7de', borderRadius: '6px', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
            />
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

export default DetailsModal;