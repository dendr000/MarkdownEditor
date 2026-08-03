// src/components/editor/toolbar/sqlBuilder/DdlGridRow.jsx v1.0
/*
 * 파일 위치: src/components/editor/toolbar/sqlBuilder/DdlGridRow.jsx
 * 파일 설명: DDL 스프레드시트 패널에서 단일 컬럼을 제어하는 행(Row) 컴포넌트입니다.
 * 데이터 타입 선택에 따라 괄호(길이) 입력칸이 동적으로 나타나며, PK/NN 등의 제약조건을 토글합니다.
 * 연결 위치: src/components/editor/toolbar/sqlBuilder/DdlGridPanel.jsx 내부 리스트에서 렌더링됨
 */
import React from 'react';
import { Trash2 } from 'lucide-react';

function DdlGridRow({ index, column, onChange, onDelete }) {
  // 길이나 정밀도(괄호) 입력이 필요한 데이터 타입 목록 정의
  const needsLength = ['VARCHAR', 'CHAR', 'DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE'].includes(column.type);

  // 컬럼 데이터 변경 핸들러
  const handleChange = (field, value) => {
    console.log(`[DdlGridRow v1.0] 인덱스 ${index} 컬럼 변경 - 필드: ${field}, 값: ${value}`);
    onChange(index, field, value);
  };

  const cellStyle = {
    padding: '8px',
    borderBottom: '1px solid #d0d7de',
    borderRight: '1px solid #d0d7de',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  const inputStyle = {
    width: '100%',
    padding: '6px 8px',
    border: '1px solid #d0d7de',
    borderRadius: '4px',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const checkboxStyle = {
    cursor: 'pointer',
    width: '14px',
    height: '14px'
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '40px 200px 150px 100px 60px 60px 60px 60px 1fr 50px', backgroundColor: '#ffffff' }}>
      {/* 인덱스 번호 */}
      <div style={{ ...cellStyle, justifyContent: 'center', backgroundColor: '#f6f8fa', color: '#57606a', fontWeight: 'bold' }}>
        {index + 1}
      </div>
      
      {/* 컬럼명 입력 */}
      <div style={cellStyle}>
        <input 
          type="text" 
          value={column.name} 
          onChange={(e) => handleChange('name', e.target.value)} 
          placeholder="컬럼명 (예: user_id)"
          style={inputStyle}
        />
      </div>

      {/* 데이터 타입 드롭다운 */}
      <div style={cellStyle}>
        <select 
          value={column.type} 
          onChange={(e) => handleChange('type', e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="INT">INT</option>
          <option value="BIGINT">BIGINT</option>
          <option value="VARCHAR">VARCHAR</option>
          <option value="CHAR">CHAR</option>
          <option value="TEXT">TEXT</option>
          <option value="DATETIME">DATETIME</option>
          <option value="DATE">DATE</option>
          <option value="BOOLEAN">BOOLEAN</option>
          <option value="DECIMAL">DECIMAL</option>
          <option value="JSON">JSON</option>
        </select>
      </div>

      {/* 길이(Length) 동적 입력란 */}
      <div style={cellStyle}>
        {needsLength ? (
          <input 
            type="text" 
            value={column.length} 
            onChange={(e) => handleChange('length', e.target.value)} 
            placeholder="길이 (예: 255)"
            style={inputStyle}
          />
        ) : (
          <span style={{ color: '#8c959f', fontSize: '12px', width: '100%', textAlign: 'center' }}>-</span>
        )}
      </div>

      {/* PK (기본키) */}
      <div style={{ ...cellStyle, justifyContent: 'center' }}>
        <input type="checkbox" checked={column.pk} onChange={(e) => handleChange('pk', e.target.checked)} style={checkboxStyle} title="Primary Key" />
      </div>

      {/* NN (Not Null) */}
      <div style={{ ...cellStyle, justifyContent: 'center' }}>
        <input type="checkbox" checked={column.nn} onChange={(e) => handleChange('nn', e.target.checked)} style={checkboxStyle} title="Not Null" />
      </div>

      {/* UQ (Unique) */}
      <div style={{ ...cellStyle, justifyContent: 'center' }}>
        <input type="checkbox" checked={column.uq} onChange={(e) => handleChange('uq', e.target.checked)} style={checkboxStyle} title="Unique" />
      </div>

      {/* AI (Auto Increment) */}
      <div style={{ ...cellStyle, justifyContent: 'center' }}>
        <input type="checkbox" checked={column.ai} onChange={(e) => handleChange('ai', e.target.checked)} disabled={!column.type.includes('INT')} style={{ ...checkboxStyle, cursor: column.type.includes('INT') ? 'pointer' : 'not-allowed' }} title="Auto Increment (INT 전용)" />
      </div>

      {/* 코멘트 (주석) */}
      <div style={cellStyle}>
        <input 
          type="text" 
          value={column.comment} 
          onChange={(e) => handleChange('comment', e.target.value)} 
          placeholder="컬럼 설명..."
          style={inputStyle}
        />
      </div>

      {/* 삭제 버튼 */}
      <div style={{ ...cellStyle, justifyContent: 'center', borderRight: 'none' }}>
        <button 
          onClick={() => {
            console.log(`[DdlGridRow v1.0] 행 삭제 버튼 클릭 - 인덱스: ${index}`);
            onDelete(index);
          }} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cf222e', padding: '4px', display: 'flex', alignItems: 'center' }}
          title="해당 컬럼 삭제"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default DdlGridRow;