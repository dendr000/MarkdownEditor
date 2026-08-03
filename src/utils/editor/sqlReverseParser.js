// src/utils/editor/sqlReverseParser.js v1.0
/*
 * 파일 위치: src/utils/editor/sqlReverseParser.js
 * 파일 설명: 사용자가 입력한 날것의 CREATE TABLE SQL 문자열을 정규식으로 분석(파싱)하여,
 * DDL 그리드 UI에서 사용하는 상태 객체 배열로 역변환(리버스 엔지니어링)하는 유틸리티입니다.
 * 연결 위치: src/components/editor/toolbar/sqlBuilder/DdlGridPanel.jsx
 */

export const parseCreateTableSql = (sql) => {
  console.log("[sqlReverseParser v1.0] SQL 역설계 파싱 시작");
  
  // 1. 테이블 이름 추출
  const tableMatch = sql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`'"]?([a-zA-Z0-9_]+)[`'"]?/i);
  const tableName = tableMatch ? tableMatch[1] : 'parsed_table';

  // 2. 괄호 내부의 컬럼 정의부 블록 추출
  const bodyMatch = sql.match(/\(([\s\S]*)\)/);
  if (!bodyMatch) {
    console.warn("[sqlReverseParser v1.0] 괄호로 둘러싸인 컬럼 정의부를 찾을 수 없습니다.");
    return { tableName, columns: [] };
  }

  const body = bodyMatch[1];
  // 쉼표로 분리하되 데이터 타입 괄호 안의 쉼표는 무시합니다 (예: DECIMAL(10,2))
  const lines = body.split(/,(?![^\(\)]*\))/).map(l => l.trim()).filter(l => l.length > 0);

  const columns = [];
  const primaryKeys = [];

  lines.forEach((line) => {
    // 하단에 별도로 선언된 PRIMARY KEY (col1, col2) 형태 파싱
    const pkMatch = line.match(/PRIMARY\s+KEY\s*\((.*?)\)/i);
    if (pkMatch) {
      const keys = pkMatch[1].split(',').map(k => k.trim().replace(/[`'"]/g, ''));
      primaryKeys.push(...keys);
      return;
    }

    // 다른 테이블 제약조건이나 인덱스 선언은 그리드에 담을 수 없으므로 무시
    if (line.match(/^(CONSTRAINT|UNIQUE\s+KEY|FOREIGN\s+KEY|KEY)\b/i)) return;

    // 일반 컬럼 정의 파싱
    // 예: id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '식별자'
    const parts = line.split(/\s+/);
    if (parts.length < 2) return;

    const name = parts[0].replace(/[`'"]/g, '');
    let typeInfo = parts[1].toUpperCase();
    let length = '';
    
    // 타입과 괄호(길이) 분리
    const typeMatch = typeInfo.match(/^([A-Z]+)(?:\((.*?)\))?$/);
    let type = typeInfo;
    if (typeMatch) {
      type = typeMatch[1];
      length = typeMatch[2] || '';
    }

    const upperLine = line.toUpperCase();
    const pk = upperLine.includes('PRIMARY KEY');
    const nn = upperLine.includes('NOT NULL') || pk;
    const uq = upperLine.includes('UNIQUE');
    const ai = upperLine.includes('AUTO_INCREMENT');
    
    let comment = '';
    const commentMatch = line.match(/COMMENT\s+'([^']+)'/i);
    if (commentMatch) {
      comment = commentMatch[1];
    }

    columns.push({
      id: `parsed_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name, type, length, pk, nn, uq, ai, comment
    });
  });

  // 별도 선언된 복합 PK들을 컬럼 속성에 병합
  primaryKeys.forEach(pkName => {
    const col = columns.find(c => c.name === pkName);
    if (col) {
      col.pk = true;
      col.nn = true;
    }
  });

  console.log("[sqlReverseParser v1.0] SQL 역설계 파싱 완료", { tableName, columnCount: columns.length });
  return { tableName, columns };
};