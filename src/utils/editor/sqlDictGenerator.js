// src/utils/editor/sqlDictGenerator.js v1.0
/*
 * 파일 위치: src/utils/editor/sqlDictGenerator.js
 * 파일 설명: 파싱된 SQL 테이블 데이터를 바탕으로 깔끔한 마크다운(.md) 형태의 테이블 명세서(Data Dictionary) 문자열을 자동 생성하는 유틸리티입니다.
 * 연결 위치: src/components/preview/SqlViewer.jsx
 */

export const generateTableDictionary = (parsedTables, sourceFileName) => {
  console.log(`[sqlDictGenerator v1.0] 마크다운 명세서 변환 시작 (대상 테이블 수: ${parsedTables.length})`);
  
  let md = `> **📁 데이터베이스 테이블 명세서 (Data Dictionary)**\n`;
  md += `> 원본 스키마 파일: \`${sourceFileName || '알 수 없음'}\`\n\n`;
  md += `---\n\n`;

  if (!parsedTables || parsedTables.length === 0) {
    return md + `분석된 테이블 정보가 없습니다.`;
  }

  parsedTables.forEach((table, index) => {
    md += `### ${index + 1}. 테이블: \`${table.name}\`\n\n`;
    md += `| 컬럼명 (Column) | 데이터 타입 (Type) | 속성 및 설명 (Extra) |\n`;
    md += `|---|---|---|\n`;

    const constraints = [];

    // 컬럼 및 제약 조건 분류 렌더링
    table.columns.forEach(col => {
      if (col.isConstraint) {
        constraints.push(col.text);
      } else {
        // 파싱된 속성이 없을 경우 빈 대시(-)로 처리
        const extraText = col.extra ? col.extra.trim() : '-';
        md += `| **${col.name}** | \`${col.type}\` | ${extraText} |\n`;
      }
    });

    md += `\n`;

    // 외래 키, 기본 키 등 테이블 레벨 제약 조건이 존재할 경우 하단에 별도 리스트로 출력
    if (constraints.length > 0) {
      md += `**[제약 조건 (Constraints)]**\n`;
      constraints.forEach(c => {
        md += `- \`${c}\`\n`;
      });
      md += `\n`;
    }
    
    md += `---\n\n`;
  });

  console.log("[sqlDictGenerator v1.0] 마크다운 명세서 변환 완료");
  return md;
};