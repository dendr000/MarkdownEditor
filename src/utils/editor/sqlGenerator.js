// src/utils/editor/sqlGenerator.js v1.0
/*
 * 파일 위치: src/utils/editor/sqlGenerator.js
 * 파일 설명: 시각적 SQL 쿼리 빌더의 UI 상태 데이터(테이블, 컬럼 목록)를 파싱하여,
 * 실시간으로 실행 가능한 완전한 CREATE TABLE 구문(SQL 문자열)으로 컴파일하는 유틸리티입니다.
 * 연결 위치: src/components/editor/toolbar/sqlBuilder/DdlGridPanel.jsx
 */

export const generateCreateTableSql = (tableName, columns) => {
  console.log("[sqlGenerator v1.0] CREATE TABLE SQL 컴파일 시작", { tableName, columnsCount: columns.length });
  
  if (!tableName || tableName.trim() === '') {
    console.log("[sqlGenerator v1.0] 테이블 이름이 비어있어 기본 구문을 반환합니다.");
    return '-- 테이블 이름을 입력하세요.\nCREATE TABLE ...';
  }

  if (!columns || columns.length === 0) {
    console.log("[sqlGenerator v1.0] 정의된 컬럼이 없어 빈 테이블 구문을 반환합니다.");
    return `CREATE TABLE ${tableName} (\n  -- 컬럼을 추가하세요.\n);`;
  }

  let sql = `CREATE TABLE ${tableName} (\n`;
  const columnLines = [];
  const primaryKeys = [];

  columns.forEach((col) => {
    // 컬럼명이 비어있으면 생략
    if (!col.name || col.name.trim() === '') return;

    let line = `  ${col.name} ${col.type}`;
    
    // VARCHAR, DECIMAL 등 길이/정밀도가 필요한 타입 처리
    if (col.length && col.length.trim() !== '') {
      line += `(${col.length})`;
    }

    // UNSIGNED, AUTO_INCREMENT 등 옵션 처리 (주로 INT 계열)
    if (col.type.includes('INT') && col.ai) {
      line += ` AUTO_INCREMENT`;
    }

    // 제약조건 (Constraints) 처리
    if (col.nn) line += ` NOT NULL`;
    if (col.uq) line += ` UNIQUE`;

    // 주석 (Comment) 처리
    if (col.comment && col.comment.trim() !== '') {
      line += ` COMMENT '${col.comment}'`;
    }

    columnLines.push(line);

    // PK 수집
    if (col.pk) {
      primaryKeys.push(col.name);
    }
  });

  // 수집된 라인들을 쉼표로 연결
  let body = columnLines.join(',\n');

  // Primary Key 별도 선언부 추가 (가독성 및 복합키 지원 목적)
  if (primaryKeys.length > 0) {
    body += `,\n  PRIMARY KEY (${primaryKeys.join(', ')})`;
  }

  sql += body + '\n);';
  
  console.log("[sqlGenerator v1.0] CREATE TABLE SQL 컴파일 완료");
  return sql;
};