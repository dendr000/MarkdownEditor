// src/components/editor/toolbar/sqlBuilder/dml/DmlPreview.jsx v1.0
/*
 * 파일 위치: src/components/editor/toolbar/sqlBuilder/dml/DmlPreview.jsx
 * 파일 설명: 워크스페이스에서 조립된 DML 쿼리를 실시간으로 렌더링하고, 에디터에 삽입하는 뷰어입니다.
 * 연결 위치: src/components/editor/toolbar/sqlBuilder/dml/DmlWorkspacePanel.jsx
 */
import React from 'react';
import { Check } from 'lucide-react';

function DmlPreview({ highlightedSql, compiledSql, onInsert }) {
  console.log("[DmlPreview v1.0] 하단 실시간 DML 컴파일 뷰어 업데이트");

  return (
    <div style={{ flex: 2, backgroundColor: '#24292f', borderRadius: '8px', border: '1px solid #d0d7de', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '8px 16px', backgroundColor: '#32383f', borderBottom: '1px solid #1b1f24', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>DML 쿼리 컴파일 뷰어 (Live Preview)</span>
        <button 
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onInsert) onInsert(`\n\`\`\`sql\n${compiledSql}\n\`\`\`\n`);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#2da44e', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
        >
          <Check size={14} /> 에디터에 삽입
        </button>
      </div>
      <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
        <pre style={{ margin: 0, padding: 0, backgroundColor: 'transparent', color: '#e6edf3', fontSize: '13px', fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          <code dangerouslySetInnerHTML={{ __html: highlightedSql }} style={{ display: 'block', whiteSpace: 'pre-wrap' }} />
        </pre>
      </div>
    </div>
  );
}

export default DmlPreview;