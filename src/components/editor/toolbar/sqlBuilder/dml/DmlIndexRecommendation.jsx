// src/components/editor/toolbar/sqlBuilder/dml/DmlIndexRecommendation.jsx v1.0
/*
 * 파일 위치: src/components/editor/toolbar/sqlBuilder/dml/DmlIndexRecommendation.jsx
 * 파일 설명: SQL 쿼리 조건 및 조인 기반의 스마트 인덱스(Index) 추천 결과를 표시하는 패널입니다.
 * 연결 위치: src/components/editor/toolbar/sqlBuilder/dml/DmlWorkspacePanel.jsx
 */
import React from 'react';
import { Lightbulb } from 'lucide-react';

function DmlIndexRecommendation({ recommendations }) {
  return (
    <div style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #d0d7de', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '8px 16px', backgroundColor: '#fcfcfc', borderBottom: '1px solid #d0d7de', fontSize: '12px', fontWeight: 'bold', color: '#24292f', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Lightbulb size={16} color="#d4a72c" />
        <span>스마트 인덱스 추천 (Auto Indexing)</span>
      </div>
      <div style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {recommendations.length === 0 ? (
          <div style={{ fontSize: '12px', color: '#8c959f', textAlign: 'center', marginTop: '20px' }}>
            추천할 인덱스가 없습니다.<br/>조인(JOIN)이나 조건절을 추가해 보세요.
          </div>
        ) : (
          recommendations.map((rec, idx) => (
            <div key={idx} style={{ padding: '8px', backgroundColor: '#f6f8fa', border: '1px dashed #d0d7de', borderRadius: '6px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontWeight: 'bold', color: '#0969da' }}>💡 {rec.reason}</span>
              <code style={{ color: '#24292f', backgroundColor: '#ffffff', padding: '4px', borderRadius: '4px', border: '1px solid #e1e4e8', fontFamily: 'ui-monospace, monospace' }}>
                {rec.script}
              </code>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DmlIndexRecommendation;