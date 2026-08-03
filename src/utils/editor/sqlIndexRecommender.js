// src/utils/editor/sqlIndexRecommender.js v1.0
/*
 * 파일 위치: src/utils/editor/sqlIndexRecommender.js
 * 파일 설명: DML 워크스페이스에서 조립된 조인(JOIN), 조건(WHERE), 정렬(ORDER BY) 데이터를 분석하여
 * 데이터베이스 조회 성능 최적화에 필요한 CREATE INDEX 스크립트를 자동 추천하는 유틸리티입니다.
 * 연결 위치: src/components/editor/toolbar/sqlBuilder/DmlWorkspacePanel.jsx
 */

export const recommendIndexes = (nodes, edges, filters) => {
  console.log("[sqlIndexRecommender v1.0] 인덱스 추천 분석 시작", { edgesCount: edges.length, filters });
  
  const recommendations = [];
  const indexSet = new Set(); // 중복 방지용 Set (형식: table.column)

  // 1. JOIN 조건 (Edges) 분석: 양쪽 테이블의 컬럼 모두 인덱스 권장 대상입니다.
  edges.forEach((edge) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    if (sourceNode && targetNode) {
      const sourceTable = sourceNode.data.tableName;
      const targetTable = targetNode.data.tableName;
      const sourceColumn = edge.sourceHandle;
      const targetColumn = edge.targetHandle;

      const sourceKey = `${sourceTable}.${sourceColumn}`;
      const targetKey = `${targetTable}.${targetColumn}`;

      if (!indexSet.has(sourceKey)) {
        indexSet.add(sourceKey);
        recommendations.push({
          table: sourceTable,
          column: sourceColumn,
          reason: 'JOIN 연결 조건으로 사용됨 (외래 키/참조 키)',
          script: `CREATE INDEX idx_${sourceTable}_${sourceColumn} ON ${sourceTable} (${sourceColumn});`
        });
      }

      if (!indexSet.has(targetKey)) {
        indexSet.add(targetKey);
        recommendations.push({
          table: targetTable,
          column: targetColumn,
          reason: 'JOIN 연결 조건으로 사용됨 (외래 키/참조 키)',
          script: `CREATE INDEX idx_${targetTable}_${targetColumn} ON ${targetTable} (${targetColumn});`
        });
      }
    }
  });

  // 필터에 테이블명이 누락된 경우를 대비해 캔버스의 첫 번째 테이블을 기준(Primary)으로 삼습니다.
  const primaryTable = nodes.length > 0 ? nodes[0].data.tableName : 'unknown_table';

  // 2. WHERE 조건 분석
  filters.where.forEach(w => {
    if (!w.column || w.column.trim() === '') return;
    const table = w.column.includes('.') ? w.column.split('.')[0] : primaryTable;
    const col = w.column.includes('.') ? w.column.split('.')[1] : w.column;
    const key = `${table}.${col}`;

    if (!indexSet.has(key)) {
      indexSet.add(key);
      recommendations.push({
        table: table,
        column: col,
        reason: `WHERE 조건(${w.operator}) 필터링에 사용됨`,
        script: `CREATE INDEX idx_${table}_${col} ON ${table} (${col});`
      });
    }
  });

  // 3. GROUP BY 조건 분석
  filters.groupBy.forEach(g => {
    if (!g.column || g.column.trim() === '') return;
    const table = g.column.includes('.') ? g.column.split('.')[0] : primaryTable;
    const col = g.column.includes('.') ? g.column.split('.')[1] : g.column;
    const key = `${table}.${col}`;

    if (!indexSet.has(key)) {
      indexSet.add(key);
      recommendations.push({
        table: table,
        column: col,
        reason: 'GROUP BY 그룹화에 사용됨',
        script: `CREATE INDEX idx_${table}_${col} ON ${table} (${col});`
      });
    }
  });

  // 4. ORDER BY 조건 분석
  filters.orderBy.forEach(o => {
    if (!o.column || o.column.trim() === '') return;
    const table = o.column.includes('.') ? o.column.split('.')[0] : primaryTable;
    const col = o.column.includes('.') ? o.column.split('.')[1] : o.column;
    const key = `${table}.${col}`;

    if (!indexSet.has(key)) {
      indexSet.add(key);
      recommendations.push({
        table: table,
        column: col,
        reason: `ORDER BY 정렬(${o.direction})에 사용됨`,
        script: `CREATE INDEX idx_${table}_${col} ON ${table} (${col});`
      });
    }
  });

  console.log(`[sqlIndexRecommender v1.0] 인덱스 추천 도출 완료: 총 ${recommendations.length}건`);
  return recommendations;
};