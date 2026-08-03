// src/components/editor/toolbar/sqlBuilder/dml/DmlFilterPanel.jsx v1.1
/*
 * 파일 위치: src/components/editor/toolbar/sqlBuilder/dml/DmlFilterPanel.jsx
 * 파일 설명: DML 쿼리의 WHERE, GROUP BY, ORDER BY 조건을 제어하는 우측 사이드 패널입니다.
 * dml 하위 폴더로 이동 조치되었습니다.
 * 연결 위치: src/components/editor/toolbar/sqlBuilder/dml/DmlWorkspacePanel.jsx
 */
import React from 'react';
import { Plus, Trash2, Filter } from 'lucide-react';

function DmlFilterPanel({ filters, setFilters }) {
  console.log("[DmlFilterPanel v1.1] DML 필터 패널 렌더링");

  // 배열 상태 업데이트 헬퍼
  const updateArray = (key, index, field, value) => {
    const newArr = [...filters[key]];
    newArr[index][field] = value;
    setFilters({ ...filters, [key]: newArr });
  };

  const addArrayItem = (key, defaultItem) => {
    setFilters({ ...filters, [key]: [...filters[key], defaultItem] });
  };

  const removeArrayItem = (key, index) => {
    const newArr = [...filters[key]];
    newArr.splice(index, 1);
    setFilters({ ...filters, [key]: newArr });
  };

  const inputStyle = { padding: '6px', border: '1px solid #d0d7de', borderRadius: '4px', fontSize: '12px', flex: 1, outline: 'none' };
  const labelStyle = { fontSize: '12px', fontWeight: 'bold', color: '#57606a', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };

  return (
    <div style={{ width: '320px', backgroundColor: '#ffffff', borderLeft: '1px solid #d0d7de', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px', backgroundColor: '#f6f8fa', borderBottom: '1px solid #d0d7de', fontSize: '13px', fontWeight: 'bold', color: '#24292f', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Filter size={16} /> 쿼리 필터 및 정렬
      </div>
      
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto', flex: 1 }}>
        
        {/* WHERE 조건부 */}
        <div>
          <div style={labelStyle}>
            <span>WHERE 조건</span>
            <button onClick={() => addArrayItem('where', { column: '', operator: '=', value: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0969da' }} title="조건 추가"><Plus size={16} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filters.where.length === 0 && <span style={{ fontSize: '11px', color: '#8c959f' }}>조건이 없습니다.</span>}
            {filters.where.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <input type="text" placeholder="컬럼명" value={item.column} onChange={(e) => updateArray('where', idx, 'column', e.target.value)} style={inputStyle} />
                <select value={item.operator} onChange={(e) => updateArray('where', idx, 'operator', e.target.value)} style={{ ...inputStyle, flex: 'none', width: '60px' }}>
                  <option value="=">=</option>
                  <option value=">">&gt;</option>
                  <option value="<">&lt;</option>
                  <option value="LIKE">LIKE</option>
                  <option value="IN">IN</option>
                </select>
                <input type="text" placeholder="값" value={item.value} onChange={(e) => updateArray('where', idx, 'value', e.target.value)} style={inputStyle} />
                <button onClick={() => removeArrayItem('where', idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cf222e', padding: '4px' }}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* GROUP BY 조건부 */}
        <div>
          <div style={labelStyle}>
            <span>GROUP BY 그룹화</span>
            <button onClick={() => addArrayItem('groupBy', { column: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0969da' }} title="조건 추가"><Plus size={16} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filters.groupBy.length === 0 && <span style={{ fontSize: '11px', color: '#8c959f' }}>조건이 없습니다.</span>}
            {filters.groupBy.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <input type="text" placeholder="컬럼명 (예: category_id)" value={item.column} onChange={(e) => updateArray('groupBy', idx, 'column', e.target.value)} style={inputStyle} />
                <button onClick={() => removeArrayItem('groupBy', idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cf222e', padding: '4px' }}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* ORDER BY 조건부 */}
        <div>
          <div style={labelStyle}>
            <span>ORDER BY 정렬</span>
            <button onClick={() => addArrayItem('orderBy', { column: '', direction: 'ASC' })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0969da' }} title="조건 추가"><Plus size={16} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filters.orderBy.length === 0 && <span style={{ fontSize: '11px', color: '#8c959f' }}>조건이 없습니다.</span>}
            {filters.orderBy.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <input type="text" placeholder="컬럼명" value={item.column} onChange={(e) => updateArray('orderBy', idx, 'column', e.target.value)} style={inputStyle} />
                <select value={item.direction} onChange={(e) => updateArray('orderBy', idx, 'direction', e.target.value)} style={{ ...inputStyle, flex: 'none', width: '70px' }}>
                  <option value="ASC">ASC</option>
                  <option value="DESC">DESC</option>
                </select>
                <button onClick={() => removeArrayItem('orderBy', idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cf222e', padding: '4px' }}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default DmlFilterPanel;