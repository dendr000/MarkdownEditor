// src/utils/editor/sqlDmlReverseParser.js v1.0
/*
 * 파일 위치: src/utils/editor/sqlDmlReverseParser.js
 * 파일 설명: 순수 텍스트 형태의 DML(SELECT, INSERT, UPDATE, DELETE) 쿼리를 파싱하여
 * 시각적 쿼리 빌더(DmlGridPanel)의 그리드 상태(columns, targetTable 등)로 변환하는 역설계 모듈입니다.
 */

export const parseDmlSql = (sqlText) => {
  const cleanSql = sqlText.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim().toUpperCase();
  const originalSql = sqlText.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();

  let queryType = 'SELECT';
  let targetTable = '';
  const columns = [];

  const addColumn = (name, output = true, alias = '', operator = '', filterValue = '') => {
    columns.push({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      alias: alias.trim(),
      output,
      operator: operator.trim(),
      filterValue: filterValue.trim()
    });
  };

  if (cleanSql.startsWith('SELECT')) {
    queryType = 'SELECT';
    
    // 테이블명 추출
    const fromMatch = cleanSql.match(/FROM\s+([A-Z0-9_]+)/i);
    if (fromMatch) targetTable = fromMatch[1].toLowerCase();

    // SELECT 컬럼 추출
    let selectPart = '';
    const fromIndex = cleanSql.indexOf('FROM');
    if (fromIndex !== -1) {
      selectPart = originalSql.substring(6, fromIndex).trim();
    } else {
      selectPart = originalSql.substring(6).trim();
    }

    if (selectPart === '*') {
      addColumn('*');
    } else {
      const selectItems = selectPart.split(',').map(s => s.trim());
      selectItems.forEach(item => {
        const asMatch = item.match(/(.+?)\s+AS\s+(.+)/i);
        if (asMatch) {
          addColumn(asMatch[1], true, asMatch[2]);
        } else {
          addColumn(item);
        }
      });
    }

    // WHERE 조건 파싱 및 매핑
    const whereMatch = originalSql.match(/WHERE\s+(.+?)(?:GROUP BY|ORDER BY|;|$)/i);
    if (whereMatch) {
      const conditions = whereMatch[1].split(/\s+AND\s+/i);
      conditions.forEach(cond => {
        const opMatch = cond.match(/(.+?)\s*(=|>|<|>=|<=|LIKE|IN|IS\s+NULL|IS\s+NOT\s+NULL)\s*(.*)/i);
        if (opMatch) {
          const colName = opMatch[1].trim();
          const operator = opMatch[2].trim().toUpperCase();
          const val = opMatch[3].trim();
          
          // 이미 출력 컬럼으로 등록된 경우 조건 업데이트, 없으면 새 조건 컬럼 추가 (출력 false)
          const existingCol = columns.find(c => c.name.toLowerCase() === colName.toLowerCase());
          if (existingCol) {
            existingCol.operator = operator;
            existingCol.filterValue = val;
          } else {
            addColumn(colName, false, '', operator, val);
          }
        }
      });
    }

  } else if (cleanSql.startsWith('INSERT')) {
    queryType = 'INSERT';
    const insertMatch = originalSql.match(/INTO\s+([a-zA-Z0-9_]+)\s*\((.*?)\)\s*VALUES\s*\((.*?)\)/i);
    if (insertMatch) {
      targetTable = insertMatch[1].toLowerCase();
      const cols = insertMatch[2].split(',').map(s => s.trim());
      const vals = insertMatch[3].split(',').map(s => s.trim());
      
      cols.forEach((col, idx) => {
        addColumn(col, true, '', '', vals[idx] || '');
      });
    }

  } else if (cleanSql.startsWith('UPDATE')) {
    queryType = 'UPDATE';
    const updateMatch = cleanSql.match(/UPDATE\s+([A-Z0-9_]+)/i);
    if (updateMatch) targetTable = updateMatch[1].toLowerCase();

    const setMatch = originalSql.match(/SET\s+(.+?)(?:\s+WHERE|;|$)/i);
    if (setMatch) {
      const setItems = setMatch[1].split(',').map(s => s.trim());
      setItems.forEach(item => {
        const kv = item.split('=');
        if (kv.length === 2) {
          addColumn(kv[0].trim(), true, '', '', kv[1].trim());
        }
      });
    }

    const whereMatch = originalSql.match(/WHERE\s+(.+?)(?:;|$)/i);
    if (whereMatch) {
      const conditions = whereMatch[1].split(/\s+AND\s+/i);
      conditions.forEach(cond => {
        const opMatch = cond.match(/(.+?)\s*(=|>|<|>=|<=|LIKE|IN|IS\s+NULL|IS\s+NOT\s+NULL)\s*(.*)/i);
        if (opMatch) {
          addColumn(opMatch[1].trim(), false, '', opMatch[2].trim().toUpperCase(), opMatch[3].trim());
        }
      });
    }

  } else if (cleanSql.startsWith('DELETE')) {
    queryType = 'DELETE';
    const deleteMatch = cleanSql.match(/FROM\s+([A-Z0-9_]+)/i);
    if (deleteMatch) targetTable = deleteMatch[1].toLowerCase();

    const whereMatch = originalSql.match(/WHERE\s+(.+?)(?:;|$)/i);
    if (whereMatch) {
      const conditions = whereMatch[1].split(/\s+AND\s+/i);
      conditions.forEach(cond => {
        const opMatch = cond.match(/(.+?)\s*(=|>|<|>=|<=|LIKE|IN|IS\s+NULL|IS\s+NOT\s+NULL)\s*(.*)/i);
        if (opMatch) {
          addColumn(opMatch[1].trim(), false, '', opMatch[2].trim().toUpperCase(), opMatch[3].trim());
        }
      });
    }
  }

  // 매칭된 정보가 하나도 없으면 기본값 보장
  if (columns.length === 0) {
    addColumn('*');
  }

  return { queryType, targetTable, columns };
};