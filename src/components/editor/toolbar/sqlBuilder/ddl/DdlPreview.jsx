// src/components/editor/toolbar/sqlBuilder/ddl/DdlPreview.jsx v1.0
/*
 * 파일 위치: src/components/editor/toolbar/sqlBuilder/ddl/DdlPreview.jsx
 * 파일 설명: 조립된 DDL 쿼리를 실시간으로 구문 강조(Syntax Highlighting)하여 보여주고,
 * 이를 에디터 본문에 즉시 삽입하는 하단 뷰어 패널입니다.
 * 연결 위치: src/components/editor/toolbar/sqlBuilder/ddl/DdlGridPanel.jsx
 */
import React from 'react';
import { Check } from 'lucide-react';

function DdlPreview({ highlightedSql, compiledSql, onInsert }) {
  console.log("[DdlPreview v1.0] 하단 실시간 컴파일 뷰어 업데이트");

  return (
    <div style={{ height: '220px', backgroundColor: '#24292f', borderRadius: '8px', border: '1px solid #d0d7de', display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, flexShrink: 0 }}>
      <div style={{ padding: '8px 16px', backgroundColor: '#32383f', borderBottom: '1px solid #1b1f24', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>실시간 SQL 컴파일 뷰어 (Live Preview)</span>
        <button 
          onClick={() => onInsert && onInsert(`\n\`\`\`sql\n${compiledSql}\n\`\`\`\n`)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#2da44e', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
          title="현재 컴파일된 SQL을 에디터 작업뷰에 삽입합니다."
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

export default DdlPreview;