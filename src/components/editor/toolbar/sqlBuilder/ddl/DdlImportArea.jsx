// src/components/editor/toolbar/sqlBuilder/ddl/DdlImportArea.jsx v1.0
/*
 * 파일 위치: src/components/editor/toolbar/sqlBuilder/ddl/DdlImportArea.jsx
 * 파일 설명: 기존 CREATE TABLE 구문을 입력받아 리버스 엔지니어링(역설계) 파싱을 수행하기 위한 확장 입력 텍스트 영역입니다.
 * 연결 위치: src/components/editor/toolbar/sqlBuilder/ddl/DdlGridPanel.jsx
 */
import React from 'react';

function DdlImportArea({ showImportArea, setShowImportArea, importSqlText, setImportSqlText, handleApplyImport }) {
  if (!showImportArea) return null;

  console.log("[DdlImportArea v1.0] 역설계 입력 영역 활성화");

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', backgroundColor: '#f6f8fa', borderRadius: '8px', border: '1px solid #d0d7de' }}>
      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#57606a' }}>기존 CREATE TABLE 구문을 붙여넣으면 그리드 상태가 자동으로 채워집니다.</div>
      <textarea 
        value={importSqlText} 
        onChange={(e) => setImportSqlText(e.target.value)}
        placeholder="CREATE TABLE ..."
        style={{ width: '100%', height: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #d0d7de', fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: '12px', resize: 'vertical' }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button onClick={() => setShowImportArea(false)} style={{ padding: '6px 12px', backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>취소</button>
        <button onClick={handleApplyImport} style={{ padding: '6px 12px', backgroundColor: '#0969da', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>파싱 적용하기</button>
      </div>
    </div>
  );
}

export default DdlImportArea;