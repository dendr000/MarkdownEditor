// src/utils/editor/sqlDmlReverseParser.js v1.0
/*
 * 파일 위치: src/utils/editor/sqlDmlReverseParser.js
 * 파일 설명: 순수 텍스트 형태의 DML(SELECT, INSERT, UPDATE, DELETE) 쿼리를 파싱하여
 * 시각적 쿼리 빌더(DmlGridPanel)의 그리드 상태(columns, targetTable 등)로 변환하는 역설계 모듈입니다.
 */

export const parseDmlSql = (sqlText) => {
  const originalSql = sqlText.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  const cleanSql = originalSql.toUpperCase();

  let queryType = 'SELECT';
  let targetTable = '';
  const columns = [];
  let advancedWhere = '';
  let advancedClauses = '';

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

  const splitByComma = (str) => {
    const result = [];
    let current = '';
    let parens = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === '(') parens++;
      if (char === ')') parens--;
      if (char === ',' && parens === 0) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    if (current) result.push(current);
    return result.map(s => s.trim()).filter(Boolean);
  };

  const splitByAnd = (str) => {
    const result = [];
    let current = '';
    let parens = 0;
    let skipNextAnd = false;
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === '(') parens++;
      if (char === ')') parens--;
      
      if (parens === 0 && str.substring(i, i + 8).toUpperCase() === ' BETWEEN') {
        skipNextAnd = true;
      }
      
      if (parens === 0 && str.substring(i, i + 4).toUpperCase() === ' AND') {
        if (i + 4 >= str.length || /\s/.test(str[i + 4])) {
          if (skipNextAnd) {
            skipNextAnd = false; 
          } else {
            result.push(current);
            current = '';
            i += 3; 
            continue;
          }
        }
      }
      current += char;
    }
    if (current) result.push(current);
    return result.map(s => s.trim()).filter(Boolean);
  };

  if (cleanSql.startsWith('SELECT')) {
    queryType = 'SELECT';
    
    const fromMatch = originalSql.match(/FROM\s+([\s\S]+?)(?=\s+WHERE|\s+GROUP BY|\s+HAVING|\s+ORDER BY|\s+LIMIT|;|$)/i);
    if (fromMatch) {
      targetTable = fromMatch[1].trim();
    }

    const selectPart = originalSql.substring(6, fromMatch ? fromMatch.index : originalSql.length).trim();
    if (selectPart === '*') {
      addColumn('*');
    } else {
      const selectItems = splitByComma(selectPart);
      selectItems.forEach(item => {
        const asMatch = item.match(/^(.+?)\s+AS\s+(.+)$/i);
        if (asMatch) {
          addColumn(asMatch[1], true, asMatch[2]);
        } else {
          addColumn(item);
        }
      });
    }

    const whereRegex = /WHERE\s+([\s\S]+?)(?=\s+GROUP BY|\s+HAVING|\s+ORDER BY|\s+LIMIT|;|$)/i;
    const whereMatch = originalSql.match(whereRegex);
    if (whereMatch) {
      const conditions = splitByAnd(whereMatch[1]);
      const unparsedWheres = [];
      
      conditions.forEach(cond => {
        const opMatch = cond.match(/^(.+?)\s*(=|>|<|>=|<=|LIKE|IN|IS\s+NULL|IS\s+NOT\s+NULL)\s*(.*)$/i);
        if (opMatch && !cond.toUpperCase().includes('BETWEEN')) {
          const colName = opMatch[1].trim();
          const operator = opMatch[2].trim().toUpperCase();
          const val = opMatch[3].trim();
          
          const existing = columns.find(c => c.name === colName);
          if (existing) {
            existing.operator = operator;
            existing.filterValue = val;
          } else {
            addColumn(colName, false, '', operator, val);
          }
        } else {
          unparsedWheres.push(cond);
        }
      });
      
      if (unparsedWheres.length > 0) {
        advancedWhere = unparsedWheres.join('\n  AND ');
      }
    }

    const advancedMatch = originalSql.match(/(?:GROUP BY|HAVING|ORDER BY|LIMIT)\s+[\s\S]+/i);
    if (advancedMatch) {
      let adv = advancedMatch[0].trim();
      if (adv.endsWith(';')) adv = adv.slice(0, -1);
      advancedClauses = adv;
    }

  } else if (cleanSql.startsWith('INSERT')) {
    queryType = 'INSERT';
    const insertMatch = originalSql.match(/INTO\s+([a-zA-Z0-9_]+)\s*\((.*?)\)\s*VALUES\s*\((.*?)\)/i);
    if (insertMatch) {
      targetTable = insertMatch[1].trim();
      const cols = splitByComma(insertMatch[2]);
      const vals = splitByComma(insertMatch[3]);
      cols.forEach((col, idx) => {
        addColumn(col, true, '', '', vals[idx] || '');
      });
    }

  } else if (cleanSql.startsWith('UPDATE')) {
    queryType = 'UPDATE';
    const updateMatch = cleanSql.match(/UPDATE\s+([A-Z0-9_]+)/i);
    if (updateMatch) targetTable = updateMatch[1].trim();

    const setMatch = originalSql.match(/SET\s+([\s\S]+?)(?:\s+WHERE|;|$)/i);
    if (setMatch) {
      const setItems = splitByComma(setMatch[1]);
      setItems.forEach(item => {
        const kv = item.split('=');
        if (kv.length === 2) {
          addColumn(kv[0].trim(), true, '', '', kv[1].trim());
        }
      });
    }

    const whereMatch = originalSql.match(/WHERE\s+([\s\S]+?)(?:;|$)/i);
    if (whereMatch) {
      const conditions = splitByAnd(whereMatch[1]);
      const unparsedWheres = [];
      conditions.forEach(cond => {
        const opMatch = cond.match(/^(.+?)\s*(=|>|<|>=|<=|LIKE|IN|IS\s+NULL|IS\s+NOT\s+NULL)\s*(.*)$/i);
        if (opMatch && !cond.toUpperCase().includes('BETWEEN')) {
          addColumn(opMatch[1].trim(), false, '', opMatch[2].trim().toUpperCase(), opMatch[3].trim());
        } else {
          unparsedWheres.push(cond);
        }
      });
      if (unparsedWheres.length > 0) advancedWhere = unparsedWheres.join('\n  AND ');
    }

  } else if (cleanSql.startsWith('DELETE')) {
    queryType = 'DELETE';
    const deleteMatch = cleanSql.match(/FROM\s+([A-Z0-9_]+)/i);
    if (deleteMatch) targetTable = deleteMatch[1].trim();

    const whereMatch = originalSql.match(/WHERE\s+([\s\S]+?)(?:;|$)/i);
    if (whereMatch) {
      const conditions = splitByAnd(whereMatch[1]);
      const unparsedWheres = [];
      conditions.forEach(cond => {
        const opMatch = cond.match(/^(.+?)\s*(=|>|<|>=|<=|LIKE|IN|IS\s+NULL|IS\s+NOT\s+NULL)\s*(.*)$/i);
        if (opMatch && !cond.toUpperCase().includes('BETWEEN')) {
          addColumn(opMatch[1].trim(), false, '', opMatch[2].trim().toUpperCase(), opMatch[3].trim());
        } else {
          unparsedWheres.push(cond);
        }
      });
      if (unparsedWheres.length > 0) advancedWhere = unparsedWheres.join('\n  AND ');
    }
  }

  if (columns.length === 0) {
    addColumn('*');
  }

  return { queryType, targetTable, columns, advancedWhere, advancedClauses };
};