// src/components/editor/toolbar/sqlBuilder/dml/DmlGridPanel.jsx v2.1
/*
 * 파일 위치: src/components/editor/toolbar/sqlBuilder/dml/DmlGridPanel.jsx
 * 파일 설명: 직관성이 떨어지던 기존 React Flow 캔버스를 폐기하고, 
 * DDL과 동일한 스프레드시트(Grid) 형태의 DML(SELECT, INSERT, UPDATE, DELETE) 쿼리 빌더로 전면 개편했습니다.
 * (v2.1 수정사항): DML 쿼리 역설계(SQL 파싱) 기능을 추가 탑재했습니다.
 */
import React, { useState, useMemo } from 'react';
import { Plus, Database, Check, Import } from 'lucide-react';
import DmlGridRow from './DmlGridRow';
import { highlightCode } from '../../../../../utils/editor/syntaxHighlighter';
import { parseDmlSql } from '../../../../../utils/editor/sqlDmlReverseParser';

function DmlGridPanel({ onInsert, fileExt }) {
  const [queryType, setQueryType] = useState('SELECT');
  const [targetTable, setTargetTable] = useState('users');
  const [showImportArea, setShowImportArea] = useState(false);
  const [importSqlText, setImportSqlText] = useState('');
  
  // 고급 쿼리 설정 상태
  const [advancedWhere, setAdvancedWhere] = useState('');
  const [advancedClauses, setAdvancedClauses] = useState('');
  
  const initialColumns = [
    { id: Date.now().toString(), name: '*', alias: '', output: true, operator: '', filterValue: '' }
  ];
  const [columns, setColumns] = useState(initialColumns);

  const handleAddColumn = () => {
    setColumns([
      ...columns,
      { id: Date.now().toString(), name: '', alias: '', output: true, operator: '', filterValue: '' }
    ]);
  };

  const handleColumnChange = (index, field, value) => {
    const updatedColumns = [...columns];
    updatedColumns[index][field] = value;
    setColumns(updatedColumns);
  };

  const handleDeleteColumn = (index) => {
    const updatedColumns = [...columns];
    updatedColumns.splice(index, 1);
    setColumns(updatedColumns);
  };

  const handleApplyImport = () => {
    if (!importSqlText.trim()) return;
    console.log("[DmlGridPanel v2.2] DML 역설계 파싱 적용 시작");
    
    const parsedData = parseDmlSql(importSqlText);
    
    setQueryType(parsedData.queryType);
    if (parsedData.targetTable) setTargetTable(parsedData.targetTable);
    setColumns(parsedData.columns);
    setAdvancedWhere(parsedData.advancedWhere || '');
    setAdvancedClauses(parsedData.advancedClauses || '');
    
    setShowImportArea(false);
    setImportSqlText('');
  };

  const compiledSql = useMemo(() => {
    if (!targetTable) return '-- 대상 테이블 이름을 입력하세요.';
    
    const validCols = columns.filter(c => c.name.trim() !== '');
    if (validCols.length === 0) return `-- 대상 컬럼이 없습니다.\n${queryType} * FROM ${targetTable};`;

    let sql = '';
    if (queryType === 'SELECT') {
      const selectCols = validCols.filter(c => c.output).map(c => {
        if (c.alias.trim()) return `${c.name} AS ${c.alias}`;
        return c.name;
      });
      const selectStr = selectCols.length > 0 ? selectCols.join(',\n  ') : '*';
      
      const whereCols = validCols.filter(c => c.operator && c.filterValue.trim() !== '');
      let whereStr = whereCols.map(c => `${c.name} ${c.operator} ${c.filterValue}`).join('\n  AND ');
      
      if (advancedWhere) {
        whereStr = whereStr ? `${whereStr}\n  AND ${advancedWhere}` : advancedWhere;
      }

      sql = `SELECT \n  ${selectStr}\nFROM \n  ${targetTable}`;
      if (whereStr) sql += `\nWHERE \n  ${whereStr}`;
      if (advancedClauses) sql += `\n${advancedClauses}`;
      sql += ';';
      
    } else if (queryType === 'INSERT') {
      const insertCols = validCols.filter(c => c.output).map(c => c.name).join(',\n  ');
      const insertVals = validCols.filter(c => c.output).map(c => c.filterValue || 'NULL').join(',\n  ');
      sql = `INSERT INTO ${targetTable} (\n  ${insertCols}\n)\nVALUES (\n  ${insertVals}\n);`;
      
    } else if (queryType === 'UPDATE') {
      const setStr = validCols.filter(c => c.output && c.filterValue).map(c => `${c.name} = ${c.filterValue}`).join(',\n  ');
      const whereCols = validCols.filter(c => !c.output && c.operator && c.filterValue);
      let whereStr = whereCols.map(c => `${c.name} ${c.operator} ${c.filterValue}`).join('\n  AND ');
      
      if (advancedWhere) {
        whereStr = whereStr ? `${whereStr}\n  AND ${advancedWhere}` : advancedWhere;
      }
      
      sql = `UPDATE ${targetTable}\nSET \n  ${setStr || '/* 변경할 값을 필터 값에 입력하세요 */'}`;
      if (whereStr) sql += `\nWHERE \n  ${whereStr}`;
      sql += ';';
      
    } else if (queryType === 'DELETE') {
      const whereCols = validCols.filter(c => c.operator && c.filterValue.trim() !== '');
      let whereStr = whereCols.map(c => `${c.name} ${c.operator} ${c.filterValue}`).join('\n  AND ');
      
      if (advancedWhere) {
        whereStr = whereStr ? `${whereStr}\n  AND ${advancedWhere}` : advancedWhere;
      }
      
      sql = `DELETE FROM ${targetTable}`;
      if (whereStr) sql += `\nWHERE \n  ${whereStr}`;
      sql += ';';
    }
    return sql;
  }, [queryType, targetTable, columns, advancedWhere, advancedClauses]);

  const highlightedSql = useMemo(() => highlightCode(compiledSql, 'sql'), [compiledSql]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', minWidth: 0 }}>
      
      {/* 상단 툴바 및 파싱 스위치 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d0d7de' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Database size={20} style={{ color: '#57606a' }} />
          <select value={queryType} onChange={(e) => setQueryType(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #d0d7de', borderRadius: '6px', fontSize: '14px', outline: 'none', fontWeight: 'bold', height: '40px' }}>
            <option value="SELECT">SELECT</option>
            <option value="INSERT">INSERT</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>
          <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#24292f', marginLeft: '8px' }}>대상 테이블:</label>
          <textarea 
            value={targetTable}
            onChange={(e) => setTargetTable(e.target.value)}
            placeholder="table_name (JOIN 구문 등 포함 가능)"
            style={{ padding: '8px 12px', border: '1px solid #d0d7de', borderRadius: '6px', fontSize: '13px', outline: 'none', width: '380px', height: '40px', resize: 'vertical', fontFamily: 'ui-monospace, monospace' }}
          />
        </div>
        
        <button 
          onClick={() => setShowImportArea(!showImportArea)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#24292f', height: '40px' }}
          title="기존 DML 구문으로 그리드 복원하기"
        >
          <Import size={14} /> SQL 파싱
        </button>
      </div>

      {/* SQL Import(리버스 엔지니어링) 확장 입력부 */}
      {showImportArea && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', backgroundColor: '#f6f8fa', borderRadius: '8px', border: '1px solid #d0d7de' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#57606a' }}>기존 DML (SELECT, INSERT, UPDATE, DELETE) 구문을 붙여넣으면 그리드 상태가 자동으로 채워집니다.</div>
          <textarea 
            value={importSqlText} 
            onChange={(e) => setImportSqlText(e.target.value)}
            placeholder="복잡한 JOIN, 서브쿼리, GROUP BY가 포함된 SQL도 입력 가능합니다."
            style={{ width: '100%', height: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #d0d7de', fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: '12px', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button onClick={() => setShowImportArea(false)} style={{ padding: '6px 12px', backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>취소</button>
            <button onClick={handleApplyImport} style={{ padding: '6px 12px', backgroundColor: '#0969da', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>파싱 적용하기</button>
          </div>
        </div>
      )}

      {/* 그리드 영역 */}
      <div style={{ flex: 1, backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '8px', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '40px 60px 200px 150px 100px minmax(150px, 1fr) 50px', minWidth: '800px', backgroundColor: '#f3f4f6', borderBottom: '1px solid #d0d7de', fontSize: '12px', fontWeight: 'bold', color: '#57606a', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #d0d7de' }}>No</div>
          <div style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #d0d7de' }} title="SELECT 결과에 포함 (INSERT/UPDATE 시 대상 컬럼)">출력</div>
          <div style={{ padding: '8px', borderRight: '1px solid #d0d7de' }}>컬럼명 또는 함수 (Column)</div>
          <div style={{ padding: '8px', borderRight: '1px solid #d0d7de' }}>별칭 (Alias)</div>
          <div style={{ padding: '8px', borderRight: '1px solid #d0d7de' }}>조건 연산자</div>
          <div style={{ padding: '8px', borderRight: '1px solid #d0d7de' }}>조건 값 / 입력 값</div>
          <div style={{ padding: '8px', textAlign: 'center' }}>삭제</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '800px' }}>
          {columns.map((col, index) => (
            <DmlGridRow key={col.id} index={index} column={col} onChange={handleColumnChange} onDelete={handleDeleteColumn} queryType={queryType} />
          ))}
          
          <div style={{ padding: '12px', borderBottom: '1px solid #e1e4e8', backgroundColor: '#fcfcfc', display: 'flex', justifyContent: 'center' }}>
            <button onClick={handleAddColumn} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 16px', backgroundColor: 'transparent', border: '1px dashed #0969da', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#0969da', width: '100%', justifyContent: 'center' }}>
              <Plus size={16} /> 조건 / 컬럼 추가
            </button>
          </div>
        </div>
      </div>

      {/* 고급 설정 영역 (서브쿼리, GROUP BY 등 보존용) */}
      <div style={{ display: 'flex', gap: '16px', padding: '12px 16px', backgroundColor: '#f6f8fa', border: '1px solid #d0d7de', borderRadius: '8px', flexShrink: 0 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#57606a' }}>추가 WHERE 조건 (서브쿼리 등 복합 조건)</label>
          <textarea 
            value={advancedWhere}
            onChange={(e) => setAdvancedWhere(e.target.value)}
            placeholder="예: EXISTS (SELECT 1 FROM order_items oi WHERE ...)"
            style={{ padding: '8px', border: '1px solid #d0d7de', borderRadius: '4px', fontSize: '12px', fontFamily: 'ui-monospace, SFMono-Regular, monospace', resize: 'vertical', minHeight: '50px', outline: 'none' }}
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#57606a' }}>추가 구문 (GROUP BY, HAVING, ORDER BY, LIMIT)</label>
          <textarea 
            value={advancedClauses}
            onChange={(e) => setAdvancedClauses(e.target.value)}
            placeholder="예: GROUP BY o.order_id HAVING SUM(oi.quantity) > 1 ORDER BY o.ordered_at DESC"
            style={{ padding: '8px', border: '1px solid #d0d7de', borderRadius: '4px', fontSize: '12px', fontFamily: 'ui-monospace, SFMono-Regular, monospace', resize: 'vertical', minHeight: '50px', outline: 'none' }}
          />
        </div>
      </div>

      {/* 하단 프리뷰 */}
      <div style={{ height: '200px', backgroundColor: '#24292f', borderRadius: '8px', border: '1px solid #d0d7de', display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, flexShrink: 0 }}>
        <div style={{ padding: '8px 16px', backgroundColor: '#32383f', borderBottom: '1px solid #1b1f24', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>실시간 DML 컴파일 뷰어</span>
          <button 
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!onInsert) return;
              const isMarkdown = !fileExt || ['md', 'txt', 'mdx'].includes(fileExt.toLowerCase());
              const finalCode = isMarkdown ? `\n\`\`\`sql\n${compiledSql}\n\`\`\`\n` : `\n${compiledSql}\n`;
              onInsert(finalCode);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#2da44e', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
          >
            <Check size={14} /> 에디터에 삽입
          </button>
        </div>
        <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
          <pre style={{ margin: 0, padding: 0, backgroundColor: 'transparent', color: '#e6edf3', fontSize: '13px', fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'normal', overflowWrap: 'anywhere' }}>
            <code dangerouslySetInnerHTML={{ __html: highlightedSql }} style={{ display: 'block', whiteSpace: 'pre-wrap' }} />
          </pre>
        </div>
      </div>

    </div>
  );
}

export default DmlGridPanel;