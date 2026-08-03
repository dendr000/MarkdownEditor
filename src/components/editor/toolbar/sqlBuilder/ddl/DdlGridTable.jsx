// src/components/editor/toolbar/sqlBuilder/ddl/DdlGridTable.jsx v1.0
/*
 * 파일 위치: src/components/editor/toolbar/sqlBuilder/ddl/DdlGridTable.jsx
 * 파일 설명: 테이블 컬럼을 정의하는 핵심 스프레드시트 뷰입니다. 가로 스크롤 동기화 헤더 및 
 * 리스트 목록(DdlGridRow)을 렌더링하고 관리합니다.
 * 연결 위치: src/components/editor/toolbar/sqlBuilder/ddl/DdlGridPanel.jsx
 */
import React from 'react';
import { Plus } from 'lucide-react';
import DdlGridRow from './DdlGridRow';

function DdlGridTable({ columns, handleColumnChange, handleDeleteColumn, handleAddColumn }) {
  console.log("[DdlGridTable v1.0] 그리드 테이블 리스트 렌더링", { count: columns.length });

  return (
    <div style={{ flex: 1, backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '8px', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      
      {/* 고정 위치 헤더 */}
      <div style={{ display: 'grid', gridTemplateColumns: '40px 200px 150px 100px 60px 60px 60px 60px minmax(150px, 1fr) 50px', minWidth: '950px', backgroundColor: '#f3f4f6', borderBottom: '1px solid #d0d7de', fontSize: '12px', fontWeight: 'bold', color: '#57606a', position: 'sticky', top: 0, zIndex: 10 }}>
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

      <div style={{ display: 'flex', flexDirection: 'column', minWidth: '950px' }}>
        {columns.map((col, index) => (
          <DdlGridRow 
            key={col.id} 
            index={index} 
            column={col} 
            onChange={handleColumnChange} 
            onDelete={handleDeleteColumn} 
          />
        ))}
        
        {/* 하단 컬럼 추가 버튼 영역 */}
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
  );
}

export default DdlGridTable;