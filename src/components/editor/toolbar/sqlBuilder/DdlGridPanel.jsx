// src/components/editor/toolbar/sqlBuilder/DdlGridPanel.jsx v1.0
/*
 * 파일 위치: src/components/editor/toolbar/sqlBuilder/DdlGridPanel.jsx
 * 파일 설명: 시각적 SQL 쿼리 빌더의 DDL(CREATE/ALTER) 모드 전용 메인 패널입니다.
 * 테이블명 및 Naming Convention 설정, 스프레드시트 형태의 컬럼 그리드 렌더링, 실시간 SQL 컴파일 뷰어를 통합 관리합니다.
 * 연결 위치: src/components/editor/toolbar/SqlQueryBuilderModal.jsx 내부에서 마운트됨
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, ArrowRightLeft, Table2 } from 'lucide-react';
import DdlGridRow from './DdlGridRow';
import { generateCreateTableSql } from '../../../../utils/editor/sqlGenerator';
import { highlightCode } from '../../../../utils/editor/syntaxHighlighter';

function DdlGridPanel() {
  const [tableName, setTableName] = useState('new_table');
  const [namingConvention, setNamingConvention] = useState('snake'); // 'snake' or 'camel'
  
  // 그리드 초기 상태 설정 (기본적으로 ID 컬럼 하나를 세팅해 둡니다)
  const [columns, setColumns] = useState([
    { id: Date.now().toString(), name: 'id', type: 'BIGINT', length: '', pk: true, nn: true, uq: false, ai: true, comment: '고유 식별자' }
  ]);

  console.log("[DdlGridPanel v1.0] DDL 그리드 패널 렌더링", { tableName, columnCount: columns.length });

  // CamelCase를 Snake_case로 변환 (예: myColumnName -> my_column_name)
  const toSnakeCase = (str) => {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
  };

  // Snake_case를 CamelCase로 변환 (예: my_column_name -> myColumnName)
  const toCamelCase = (str) => {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
  };

  // Naming Convention 토글 및 기존 컬럼명 일괄 변경 핸들러
  const toggleNamingConvention = () => {
    const newConvention = namingConvention === 'snake' ? 'camel' : 'snake';
    console.log(`[DdlGridPanel v1.0] 네이밍 규칙 전환: ${namingConvention} -> ${newConvention}`);
    setNamingConvention(newConvention);

    setColumns(prevColumns => prevColumns.map(col => {
      if (!col.name) return col;
      return {
        ...col,
        name: newConvention === 'snake' ? toSnakeCase(col.name) : toCamelCase(col.name)
      };
    }));
  };

  // 새로운 빈 행(Row) 추가 핸들러
  const handleAddColumn = () => {
    console.log("[DdlGridPanel v1.0] 신규 컬럼 행 추가");
    setColumns([
      ...columns,
      { id: Date.now().toString(), name: '', type: 'VARCHAR', length: '255', pk: false, nn: false, uq: false, ai: false, comment: '' }
    ]);
  };

  // 행(Row) 데이터 변경 핸들러
  const handleColumnChange = (index, field, value) => {
    const updatedColumns = [...columns];
    let finalValue = value;

    // 컬럼명 변경 시 현재 설정된 네이밍 규칙(Naming Convention)을 강제로 적용하여 자동 변환
    if (field === 'name') {
      finalValue = namingConvention === 'snake' ? toSnakeCase(value) : toCamelCase(value);
    }

    updatedColumns[index][field] = finalValue;
    setColumns(updatedColumns);
  };

  // 행(Row) 삭제 핸들러
  const handleDeleteColumn = (index) => {
    console.log(`[DdlGridPanel v1.0] 인덱스 ${index} 컬럼 삭제 완료`);
    const updatedColumns = [...columns];
    updatedColumns.splice(index, 1);
    setColumns(updatedColumns);
  };

  // 실시간 SQL 컴파일 (메모이제이션을 통한 성능 최적화)
  const compiledSql = useMemo(() => {
    return generateCreateTableSql(tableName, columns);
  }, [tableName, columns]);

  // 실시간 구문 강조 렌더링
  const highlightedSql = useMemo(() => {
    return highlightCode(compiledSql, 'sql');
  }, [compiledSql]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      
      {/* 상단 컨트롤 바 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #d0d7de' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Table2 size={20} style={{ color: '#57606a' }} />
          <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#24292f' }}>테이블 이름:</label>
          <input 
            type="text" 
            value={tableName}
            onChange={(e) => {
              const val = e.target.value;
              setTableName(namingConvention === 'snake' ? toSnakeCase(val) : toCamelCase(val));
            }}
            placeholder="table_name"
            style={{ padding: '8px 12px', border: '1px solid #d0d7de', borderRadius: '6px', fontSize: '14px', outline: 'none', width: '250px' }}
          />
        </div>
        
        <button 
          onClick={toggleNamingConvention}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: '#f6f8fa', border: '1px solid #d0d7de', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#24292f' }}
          title="컬럼명 일괄 자동 변환 적용"
        >
          <ArrowRightLeft size={16} style={{ color: '#0969da' }} />
          {namingConvention === 'snake' ? 'Snake_case 적용 중' : 'CamelCase 적용 중'}
        </button>
      </div>

      {/* 스프레드시트 그리드 영역 */}
      <div style={{ flex: 1, backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* 그리드 헤더 */}
        <div style={{ display: 'grid', gridTemplateColumns: '40px 200px 150px 100px 60px 60px 60px 60px 1fr 50px', backgroundColor: '#f3f4f6', borderBottom: '1px solid #d0d7de', fontSize: '12px', fontWeight: 'bold', color: '#57606a' }}>
          <div style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #d0d7de' }}>No</div>
          <div style={{ padding: '8px', borderRight: '1px solid #d0d7de' }}>컬럼명 (Column)</div>
          <div style={{ padding: '8px', borderRight: '1px solid #d0d7de' }}>타입 (Type)</div>
          <div style={{ padding: '8px', borderRight: '1px solid #d0d7de' }}>길이 (Length)</div>
          <div style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #d0d7de' }} title="Primary Key">PK</div>
          <div style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #d0d7de' }} title="Not Null">NN</div>
          <div style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #d0d7de' }} title="Unique">UQ</div>
          <div style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #d0d7de' }} title="Auto Increment">AI</div>
          <div style={{ padding: '8px', borderRight: '1px solid #d0d7de' }}>주석 (Comment)</div>
          <div style={{ padding: '8px', textAlign: 'center' }}>삭제</div>
        </div>

        {/* 그리드 바디 (리스트) */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {columns.map((col, index) => (
            <DdlGridRow 
              key={col.id} 
              index={index} 
              column={col} 
              onChange={handleColumnChange} 
              onDelete={handleDeleteColumn} 
            />
          ))}
          
          {/* 행 추가 버튼 영역 */}
          <div style={{ padding: '12px', borderBottom: '1px solid #e1e4e8', backgroundColor: '#fcfcfc', display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={handleAddColumn}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 16px', backgroundColor: 'transparent', border: '1px dashed #0969da', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#0969da', width: '100%', justifyContent: 'center' }}
            >
              <Plus size={16} /> 컬럼 추가
            </button>
          </div>
        </div>
      </div>

      {/* 하단 실시간 SQL 컴파일 뷰어 패널 */}
      <div style={{ height: '220px', backgroundColor: '#24292f', borderRadius: '8px', border: '1px solid #d0d7de', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '8px 16px', backgroundColor: '#32383f', borderBottom: '1px solid #1b1f24', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>실시간 SQL 컴파일 뷰어 (Live Preview)</span>
        </div>
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
          <pre style={{ margin: 0, padding: 0, backgroundColor: 'transparent', color: '#e6edf3', fontSize: '13px', fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace', lineHeight: '1.6' }}>
            <code dangerouslySetInnerHTML={{ __html: highlightedSql }} />
          </pre>
        </div>
      </div>

    </div>
  );
}

export default DdlGridPanel;