// src/components/editor/toolbar/sqlBuilder/dml/DmlGridRow.jsx v1.0
/*
 * 파일 위치: src/components/editor/toolbar/sqlBuilder/dml/DmlGridRow.jsx
 * 파일 설명: DML 그리드의 개별 행(컬럼 선택, 별칭, 조건) 상태를 제어하는 UI 컴포넌트입니다.
 */
import React from 'react';
import { Trash2 } from 'lucide-react';

function DmlGridRow({ index, column, onChange, onDelete, queryType }) {
  const cellStyle = { padding: '8px', borderRight: '1px solid #d0d7de', display: 'flex', alignItems: 'center' };
  const inputStyle = { width: '100%', padding: '6px', border: '1px solid #d0d7de', borderRadius: '4px', fontSize: '13px', outline: 'none' };
  const checkboxStyle = { cursor: 'pointer', width: '16px', height: '16px', margin: '0 auto' };

  // INSERT/DELETE 쿼리 타입일 때 불필요한 입력칸을 비활성화 처리하는 UI 로직
  const isAliasDisabled = queryType !== 'SELECT';
  const isOperatorDisabled = queryType === 'INSERT';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '40px 60px 200px 150px 100px minmax(150px, 1fr) 50px', minWidth: '800px', backgroundColor: index % 2 === 0 ? '#ffffff' : '#fcfcfc', borderBottom: '1px solid #e1e4e8' }}>
      
      <div style={{ ...cellStyle, justifyContent: 'center', backgroundColor: '#f6f8fa', color: '#57606a', fontWeight: 'bold' }}>
        {index + 1}
      </div>

      <div style={cellStyle}>
        <input type="checkbox" checked={column.output} onChange={(e) => onChange(index, 'output', e.target.checked)} style={checkboxStyle} title="체크 시 쿼리 대상 컬럼으로 포함" />
      </div>
      
      <div style={cellStyle}>
        <input type="text" value={column.name} onChange={(e) => onChange(index, 'name', e.target.value)} style={inputStyle} placeholder="컬럼명 (예: user_id)" />
      </div>

      <div style={cellStyle}>
        <input type="text" value={column.alias} onChange={(e) => onChange(index, 'alias', e.target.value)} style={{ ...inputStyle, backgroundColor: isAliasDisabled ? '#f3f4f6' : '#fff' }} placeholder="별칭 (AS)" disabled={isAliasDisabled} />
      </div>
      
      <div style={cellStyle}>
        <select value={column.operator} onChange={(e) => onChange(index, 'operator', e.target.value)} style={{ ...inputStyle, cursor: 'pointer', backgroundColor: isOperatorDisabled ? '#f3f4f6' : '#fff' }} disabled={isOperatorDisabled}>
          <option value="">(선택 안함)</option>
          <option value="=">=</option>
          <option value=">">&gt;</option>
          <option value="<">&lt;</option>
          <option value=">=">&gt;=</option>
          <option value="<=">&lt;=</option>
          <option value="LIKE">LIKE</option>
          <option value="IN">IN</option>
          <option value="IS NULL">IS NULL</option>
          <option value="IS NOT NULL">IS NOT NULL</option>
        </select>
      </div>

      <div style={cellStyle}>
        <input type="text" value={column.filterValue} onChange={(e) => onChange(index, 'filterValue', e.target.value)} style={inputStyle} placeholder={queryType === 'UPDATE' ? '변경값 또는 조건값' : '조건 값 (예: 100, \'active\')'} />
      </div>
      
      <div style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button onClick={() => onDelete(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cf222e', padding: '4px' }} title="항목 삭제">
          <Trash2 size={16} />
        </button>
      </div>
      
    </div>
  );
}

export default DmlGridRow;