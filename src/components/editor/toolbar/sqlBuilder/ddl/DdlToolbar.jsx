// src/components/editor/toolbar/sqlBuilder/ddl/DdlToolbar.jsx v1.0
/*
 * 파일 위치: src/components/editor/toolbar/sqlBuilder/ddl/DdlToolbar.jsx
 * 파일 설명: DDL 그리드 패널의 상단 제어 바입니다. 테이블 이름 설정, 네이밍 규칙 전환,
 * SQL 파싱 영역 토글 및 다양한 포맷(JPA, DBML, Migration 등)으로의 코드 추출(Export)을 담당합니다.
 * 연결 위치: src/components/editor/toolbar/sqlBuilder/ddl/DdlGridPanel.jsx
 */
import React from 'react';
import { ArrowRightLeft, Table2, Import, Code2, Database, HardDrive, Layers, Server, FileDiff } from 'lucide-react';

function DdlToolbar({
  tableName,
  onTableNameChange,
  namingConvention,
  toggleNamingConvention,
  showImportArea,
  setShowImportArea,
  handleExport
}) {
  console.log("[DdlToolbar v1.0] 툴바 컴포넌트 렌더링");

  const handleNameChange = (e) => {
    onTableNameChange(e.target.value);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d0d7de' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <Table2 size={20} style={{ color: '#57606a' }} />
        <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#24292f', whiteSpace: 'nowrap' }}>테이블 이름:</label>
        <input 
          type="text" 
          value={tableName}
          onChange={handleNameChange}
          placeholder="table_name"
          style={{ padding: '8px 12px', border: '1px solid #d0d7de', borderRadius: '6px', fontSize: '14px', outline: 'none', width: '200px' }}
        />
      </div>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
        <button 
          onClick={() => setShowImportArea(!showImportArea)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#24292f' }}
          title="기존 SQL 구문으로 그리드 복원하기"
        >
          <Import size={14} /> SQL 파싱
        </button>
        
        <div style={{ width: '1px', height: '20px', backgroundColor: '#d0d7de', margin: '0 2px' }} />

        <button onClick={() => handleExport('JPA Entity')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#2da44e' }} title="Java JPA Entity 코드 복사">
          <Code2 size={14} /> Entity
        </button>
        <button onClick={() => handleExport('Repository')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#0969da' }} title="Spring Data JPA Repository 인터페이스 복사">
          <HardDrive size={14} /> Repo
        </button>
        <button onClick={() => handleExport('Service')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#bf3989' }} title="비즈니스 로직(Service) 클래스 복사">
          <Layers size={14} /> Service
        </button>
        <button onClick={() => handleExport('Controller')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#cf222e' }} title="REST API 엔드포인트(Controller) 클래스 복사">
          <Server size={14} /> API
        </button>

        <div style={{ width: '1px', height: '20px', backgroundColor: '#d0d7de', margin: '0 2px' }} />
        
        <button onClick={() => handleExport('DBML')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#8250df' }} title="DBML 다이어그램 명세로 복사">
          <Database size={14} /> DBML
        </button>
        <button onClick={() => handleExport('Migration')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#e34c26' }} title="원본 스키마와의 변경점(Diff)을 ALTER TABLE 스크립트로 추출">
          <FileDiff size={14} /> Migration
        </button>

        <div style={{ width: '1px', height: '20px', backgroundColor: '#d0d7de', margin: '0 4px' }} />

        <button onClick={toggleNamingConvention} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#f6f8fa', border: '1px solid #d0d7de', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#0969da' }} title="컬럼명 일괄 자동 변환 적용">
          <ArrowRightLeft size={14} />
          {namingConvention === 'snake' ? 'Snake 적용 중' : 'Camel 적용 중'}
        </button>
      </div>
    </div>
  );
}

export default DdlToolbar;