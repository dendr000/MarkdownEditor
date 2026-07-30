// src/components/preview/SqlViewer.jsx v1.0
/*
 * 파일 설명: SQL 텍스트 파일(.sql)이 선택되었을 때, CREATE TABLE 구문을 분석(Parsing)하여 시각화된 테이블 형태로 렌더링하는 전용 뷰어입니다.
 * 연결 위치: src/App.jsx
 */
import React, { useMemo } from 'react';
import { Database, Table, Key } from 'lucide-react';
import SqlFlowViewer from './SqlFlowViewer';
import SqlErdViewer from './SqlErdViewer';

function SqlViewer({ sql }) {
  console.log("[SqlViewer v1.2] SQL 구문 분석 및 시각화 렌더링 시작 (ERD 연동 포함)");

  const parsedTables = useMemo(() => {
    if (!sql) return [];
    
    const tables = [];
    // CREATE TABLE 블록을 대소문자 구분 없이 추출하는 정규식
    const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([^\s(]+)\s*\(([\s\S]*?)\)\s*(?:;|ENGINE|DEFAULT|CHARACTER|PARTITION|$)/gi;
    let match;

    while ((match = createTableRegex.exec(sql)) !== null) {
      const tableName = match[1].replace(/[`"']/g, '');
      const columnsRaw = match[2];

      // 괄호 깊이를 추적하여 안전하게 콤마(,) 기준으로 컬럼을 분리합니다. (예: VARCHAR(255,0) 보호)
      const colsStrArray = [];
      let current = '';
      let depth = 0;
      for (let i = 0; i < columnsRaw.length; i++) {
        const char = columnsRaw[i];
        if (char === '(') depth++;
        else if (char === ')') depth--;
        else if (char === ',' && depth === 0) {
          colsStrArray.push(current.trim());
          current = '';
          continue;
        }
        current += char;
      }
      if (current.trim()) colsStrArray.push(current.trim());

      const columns = colsStrArray.map(colStr => {
        // 주석 제거 및 공백 정규화
        const cleanStr = colStr.replace(/--.*$/m, '').trim();
        if (!cleanStr) return null;

        // 테이블 레벨 제약 조건 감지 (PRIMARY KEY, FOREIGN KEY, CONSTRAINT 등)
        if (/^(PRIMARY KEY|CONSTRAINT|FOREIGN KEY|UNIQUE|KEY)/i.test(cleanStr)) {
          return { isConstraint: true, text: cleanStr };
        }

        const parts = cleanStr.split(/\s+/);
        const colName = (parts[0] || '').replace(/[`"']/g, '');
        const colType = (parts[1] || '').toUpperCase();
        const colExtra = parts.slice(2).join(' ');

        return { isConstraint: false, name: colName, type: colType, extra: colExtra };
      }).filter(Boolean);

      tables.push({ name: tableName, columns });
    }
    
    return tables;
  }, [sql]);

  return (
    <div style={{ padding: '24px', backgroundColor: '#f6f8fa', minHeight: '100%', overflowY: 'auto' }}>
      <div 
        className="safe-area-header"
        style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid #d0d7de' }}
      >
        <Database size={24} color="#0969da" />
        <h2 style={{ margin: 0, fontSize: '20px', color: '#24292f' }}>SQL 테이블 시각화 뷰어</h2>
      </div>

      {parsedTables.length === 0 ? (
        // 정규식을 통해 SELECT, WITH, VIEW 등의 키워드가 있는지 검사하여 데이터 조회/흐름 쿼리인지 판별
        /(SELECT|WITH|VIEW)\s+/i.test(sql) ? (
          <div style={{ width: '100%', height: 'calc(100vh - 150px)', border: '1px solid #d0d7de', borderRadius: '8px', overflow: 'hidden' }}>
            <SqlFlowViewer sql={sql} />
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#57606a', marginTop: '40px' }}>
            <p>현재 스크립트에서 <code>CREATE TABLE</code> 구문을 찾을 수 없거나 분석할 수 없습니다.</p>
            <p style={{ fontSize: '12px', marginTop: '8px' }}>데이터베이스 생성문 외의 쿼리는 좌측 에디터에서 텍스트로 확인해 주세요.</p>
          </div>
        )
      ) : (
        // 파싱된 CREATE TABLE 배열 데이터를 통째로 SqlErdViewer로 넘겨 시각화합니다.
        <SqlErdViewer parsedTables={parsedTables} />
      )}
    </div>
  );
}

export default SqlViewer;