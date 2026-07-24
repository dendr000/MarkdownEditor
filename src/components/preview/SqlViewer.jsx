// src/components/preview/SqlViewer.jsx v1.0
/*
 * 파일 설명: SQL 텍스트 파일(.sql)이 선택되었을 때, CREATE TABLE 구문을 분석(Parsing)하여 시각화된 테이블 형태로 렌더링하는 전용 뷰어입니다.
 * 연결 위치: src/App.jsx
 */
import React, { useMemo } from 'react';
import { Database, Table, Key } from 'lucide-react';

function SqlViewer({ sql }) {
  console.log("[SqlViewer v1.0] SQL 구문 분석 및 시각화 렌더링 시작");

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid #d0d7de' }}>
        <Database size={24} color="#0969da" />
        <h2 style={{ margin: 0, fontSize: '20px', color: '#24292f' }}>SQL 테이블 시각화 뷰어</h2>
      </div>

      {parsedTables.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#57606a', marginTop: '40px' }}>
          <p>현재 스크립트에서 <code>CREATE TABLE</code> 구문을 찾을 수 없거나 분석할 수 없습니다.</p>
          <p style={{ fontSize: '12px', marginTop: '8px' }}>데이터베이스 생성문 외의 쿼리는 좌측 에디터에서 텍스트로 확인해 주세요.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {parsedTables.map((table, idx) => (
            <div key={idx} style={{ backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ backgroundColor: '#f3f4f6', padding: '12px 16px', borderBottom: '1px solid #d0d7de', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Table size={18} color="#2da44e" />
                <h3 style={{ margin: 0, fontSize: '16px', color: '#24292f', fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {table.name}
                </h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#fafbfc', borderBottom: '1px solid #d0d7de' }}>
                      <th style={{ padding: '10px 16px', color: '#57606a', fontWeight: '600', width: '25%' }}>컬럼명 (Name)</th>
                      <th style={{ padding: '10px 16px', color: '#57606a', fontWeight: '600', width: '25%' }}>타입 (Type)</th>
                      <th style={{ padding: '10px 16px', color: '#57606a', fontWeight: '600', width: '50%' }}>추가 속성 / 제약 (Extra)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.columns.map((col, cIdx) => (
                      <tr key={cIdx} style={{ borderBottom: '1px solid #eaeef2' }}>
                        {col.isConstraint ? (
                          <td colSpan="3" style={{ padding: '8px 16px', backgroundColor: '#fff8c5', color: '#9a6700', fontFamily: 'monospace' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Key size={14} />
                              {col.text}
                            </div>
                          </td>
                        ) : (
                          <>
                            <td style={{ padding: '8px 16px', color: '#24292f', fontWeight: 'bold', fontFamily: 'monospace' }}>{col.name}</td>
                            <td style={{ padding: '8px 16px', color: '#0969da', fontFamily: 'monospace' }}>{col.type}</td>
                            <td style={{ padding: '8px 16px', color: '#57606a', fontFamily: 'monospace' }}>{col.extra}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SqlViewer;