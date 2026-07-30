// src/components/preview/SqlViewer.jsx v1.0
/*
 * 파일 설명: SQL 텍스트 파일(.sql)이 선택되었을 때, CREATE TABLE 구문을 분석(Parsing)하여 시각화된 테이블 형태로 렌더링하는 전용 뷰어입니다.
 * 연결 위치: src/App.jsx
 */
import React, { useMemo } from 'react';
import { Database, Table, Key } from 'lucide-react';
import SqlFlowViewer from './SqlFlowViewer';
import SqlErdViewer from './SqlErdViewer';

function SqlViewer({ sql, selectedFile }) {
  console.log("[SqlViewer v1.4] SQL 구문 분석 및 시각화 렌더링 시작 (파일명 프롭스 추가)");

  const parsedTables = useMemo(() => {
    if (!sql) return [];

    const tables = [];
    let isDbml = false;

    console.log("[SqlViewer v1.3] DBML 및 SQL DDL 혼합 구문 분석 시작");

    // 1. DBML 문법 파싱 (Table ... { ... })
    const dbmlTableRegex = /Table\s+([^\s{]+)\s*\{([^}]+)\}/gi;
    let match;

    while ((match = dbmlTableRegex.exec(sql)) !== null) {
      isDbml = true;
      const tableName = match[1].replace(/[`"']/g, '');
      const columnsRaw = match[2];

      const columns = columnsRaw.split('\n').map(line => {
        const cleanLine = line.replace(/\/\/.*$/, '').trim(); // // 주석 제거
        if (!cleanLine) return null;

        // DBML 속성 (예: [pk, increment])을 포함한 일반 컬럼 파싱
        const parts = cleanLine.match(/^([a-zA-Z0-9_]+)\s+([a-zA-Z0-9_()]+)(?:\s+(.*))?$/);
        if (parts) {
          return { isConstraint: false, name: parts[1], type: parts[2], extra: parts[3] || '' };
        }
        // 컬럼 형식이 아닌 메타데이터나 내부 설정인 경우
        return { isConstraint: true, text: cleanLine };
      }).filter(Boolean);

      tables.push({ name: tableName, columns });
    }

    // 2. DBML 관계선(Ref) 파싱 및 SqlErdViewer 호환용 가상 외래키(FOREIGN KEY) 주입
    if (isDbml) {
      const refRegex = /Ref:\s*([^\s.]+)\.([^\s\-><]+)\s*[-<>|]+\s*([^\s.]+)\.([^\s]+)/gi;
      let refMatch;
      while ((refMatch = refRegex.exec(sql)) !== null) {
        const sourceTable = refMatch[1].replace(/[`"']/g, '');
        const sourceCol = refMatch[2];
        const targetTable = refMatch[3].replace(/[`"']/g, '');
        const targetCol = refMatch[4];

        const table = tables.find(t => t.name === sourceTable);
        if (table) {
          table.columns.push({
            isConstraint: true,
            text: `FOREIGN KEY (${sourceCol}) REFERENCES ${targetTable}(${targetCol})`
          });
          console.log(`[SqlViewer v1.3] DBML Ref 변환 성공: ${sourceTable} -> ${targetTable}`);
        }
      }
    }

    // 3. DBML 구문이 아닐 경우 기존 표준 SQL (CREATE TABLE) 파싱 폴백
    if (!isDbml) {
      const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([^\s(]+)\s*\(([\s\S]*?)\)\s*(?:;|ENGINE|DEFAULT|CHARACTER|PARTITION|$)/gi;

      while ((match = createTableRegex.exec(sql)) !== null) {
        const tableName = match[1].replace(/[`"']/g, '');
        const columnsRaw = match[2];

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
          const cleanStr = colStr.replace(/--.*$/m, '').trim();
          if (!cleanStr) return null;

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
            <p>현재 스크립트에서 <code>CREATE TABLE</code> (표준 SQL) 또는 <code>Table</code> (DBML) 구문을 찾을 수 없거나 분석할 수 없습니다.</p>
            <p style={{ fontSize: '12px', marginTop: '8px' }}>스키마 생성문 외의 쿼리는 좌측 에디터에서 텍스트로 확인해 주세요.</p>
          </div>
        )
      ) : (
        // 파싱된 CREATE TABLE 배열 데이터를 통째로 SqlErdViewer로 넘겨 시각화합니다. (선택된 파일 경로 전달)
        <SqlErdViewer parsedTables={parsedTables} selectedFile={selectedFile} />
      )}
    </div>
  );
}

export default SqlViewer;