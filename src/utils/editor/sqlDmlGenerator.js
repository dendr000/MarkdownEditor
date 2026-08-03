// src/utils/editor/sqlDmlGenerator.js v1.0
/*
 * 파일 위치: src/utils/editor/sqlDmlGenerator.js
 * 파일 설명: React Flow의 노드(테이블), 엣지(연결선), 필터 패널의 상태 데이터를 취합하여
 * 실시간으로 실행 가능한 DML(SELECT, JOIN) 쿼리 문자열로 컴파일하는 유틸리티입니다.
 * 연결 위치: src/components/editor/toolbar/sqlBuilder/DmlWorkspacePanel.jsx
 */

export const generateSelectQuery = (nodes, edges, filters) => {
  console.log("[sqlDmlGenerator v1.0] SELECT 쿼리 컴파일 시작", { nodeCount: nodes.length, edgeCount: edges.length, filters });

  if (!nodes || nodes.length === 0) {
    console.log("[sqlDmlGenerator v1.0] 배치된 테이블 노드가 없어 기본 안내 구문을 반환합니다.");
    return "-- 좌측 패널에서 테이블을 캔버스로 드래그하세요.\nSELECT * FROM ...";
  }

  // 1. 기준 테이블 (가장 먼저 캔버스에 배치된 노드) 추출
  const primaryNode = nodes[0];
  const primaryTable = primaryNode.data.tableName;
  
  let sql = `SELECT *\nFROM ${primaryTable}`;

  // 2. 엣지(연결선) 데이터를 기반으로 JOIN 구문 생성
  if (edges && edges.length > 0) {
    edges.forEach((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);

      if (sourceNode && targetNode) {
        const sourceTable = sourceNode.data.tableName;
        const targetTable = targetNode.data.tableName;
        // React Flow 커스텀 핸들(Handle)의 id를 컬럼명으로 사용
        const sourceColumn = edge.sourceHandle; 
        const targetColumn = edge.targetHandle;

        sql += `\nINNER JOIN ${targetTable} ON ${sourceTable}.${sourceColumn} = ${targetTable}.${targetColumn}`;
        console.log(`[sqlDmlGenerator v1.0] JOIN 구문 추가: ${targetTable} ON ${sourceTable}.${sourceColumn} = ${targetTable}.${targetColumn}`);
      }
    });
  }

  // 3. WHERE 조건문 조립
  if (filters.where && filters.where.length > 0) {
    const whereClauses = filters.where
      .filter((w) => w.column && w.operator && w.value)
      .map((w, idx) => {
        const prefix = idx === 0 ? 'WHERE' : '  AND';
        // 숫자가 아닌 값은 홑따옴표 처리 (단순화된 예시 로직)
        const isNumeric = !isNaN(w.value) && w.value.trim() !== '';
        const formattedValue = isNumeric ? w.value : `'${w.value}'`;
        return `${prefix} ${w.column} ${w.operator} ${formattedValue}`;
      });
    
    if (whereClauses.length > 0) {
      sql += `\n${whereClauses.join('\n')}`;
    }
  }

  // 4. GROUP BY 조건문 조립
  if (filters.groupBy && filters.groupBy.length > 0) {
    const validGroupBys = filters.groupBy.filter((g) => g.column).map((g) => g.column);
    if (validGroupBys.length > 0) {
      sql += `\nGROUP BY ${validGroupBys.join(', ')}`;
    }
  }

  // 5. ORDER BY 조건문 조립
  if (filters.orderBy && filters.orderBy.length > 0) {
    const validOrderBys = filters.orderBy
      .filter((o) => o.column)
      .map((o) => `${o.column} ${o.direction}`);
    if (validOrderBys.length > 0) {
      sql += `\nORDER BY ${validOrderBys.join(', ')}`;
    }
  }

  sql += ';';
  console.log("[sqlDmlGenerator v1.0] SELECT 쿼리 컴파일 완료");
  return sql;
};