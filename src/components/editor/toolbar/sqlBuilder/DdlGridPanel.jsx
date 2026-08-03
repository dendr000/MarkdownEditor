// src/components/editor/toolbar/sqlBuilder/DdlGridPanel.jsx v1.0
/*
 * 파일 위치: src/components/editor/toolbar/sqlBuilder/DdlGridPanel.jsx
 * 파일 설명: 시각적 SQL 쿼리 빌더의 DDL(CREATE/ALTER) 모드 전용 메인 패널입니다.
 * 테이블명 및 Naming Convention 설정, 스프레드시트 형태의 컬럼 그리드 렌더링, 실시간 SQL 컴파일 뷰어를 통합 관리합니다.
 * 연결 위치: src/components/editor/toolbar/SqlQueryBuilderModal.jsx 내부에서 마운트됨
 */
import React, { useState, useEffect, useMemo } from 'react';
// 마이그레이션 아이콘 추가 임포트 (FileDiff)
import { Plus, ArrowRightLeft, Table2, Import, Code2, Database, HardDrive, Layers, Server, FileDiff } from 'lucide-react';
import DdlGridRow from './DdlGridRow';
import { generateCreateTableSql } from '../../../../utils/editor/sqlGenerator';
import { highlightCode } from '../../../../utils/editor/syntaxHighlighter';
import { parseCreateTableSql } from '../../../../utils/editor/sqlReverseParser';
// 마이그레이션 스크립트 생성기 임포트 추가
import { generateMigrationScript } from '../../../../utils/editor/sqlMigrationGenerator';
import { generateJpaEntity, generateDbml, generateJpaRepository, generateJpaService, generateJpaController } from '../../../../utils/editor/sqlExportUtils';
import { copyToClipboard } from '../../../../utils/clipboard';

function DdlGridPanel() {
  const [tableName, setTableName] = useState('new_table');
  const [showImportArea, setShowImportArea] = useState(false);
  const [importSqlText, setImportSqlText] = useState('');
  const [namingConvention, setNamingConvention] = useState('snake'); // 'snake' or 'camel'
  
  // 그리드 초기 상태 설정
  const initialColumns = [
    { id: Date.now().toString(), name: 'id', type: 'BIGINT', length: '', pk: true, nn: true, uq: false, ai: true, comment: '고유 식별자' }
  ];
  const [columns, setColumns] = useState(initialColumns);
  
  // 마이그레이션(ALTER TABLE) Diff 추적을 위한 스냅샷 상태 저장
  const [originalTableName, setOriginalTableName] = useState('new_table');
  const [originalColumns, setOriginalColumns] = useState(JSON.parse(JSON.stringify(initialColumns)));

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

  // 역설계(Import SQL) 적용 핸들러 및 스냅샷 갱신
  const handleApplyImport = () => {
    if (!importSqlText.trim()) return;
    const parsedData = parseCreateTableSql(importSqlText);
    setTableName(parsedData.tableName);
    setOriginalTableName(parsedData.tableName); // 마이그레이션 기준점 갱신
    
    // 빈 컬럼 방지: 파싱된 컬럼이 없으면 기본값 유지
    const newCols = parsedData.columns.length > 0 ? parsedData.columns : columns;
    setColumns(newCols);
    setOriginalColumns(JSON.parse(JSON.stringify(newCols))); // 깊은 복사로 스냅샷 갱신
    
    setShowImportArea(false);
    setImportSqlText('');
  };

  // 확장 코드(Export) 복사 핸들러 - 마이그레이션 분기 처리 추가
  const handleExport = async (type) => {
    console.log(`[DdlGridPanel v1.2] ${type} 코드 클립보드 내보내기 실행`);
    let text = '';
    switch (type) {
      case 'Migration': text = generateMigrationScript(originalTableName, tableName, originalColumns, columns); break;
      case 'JPA Entity': text = generateJpaEntity(tableName, columns); break;
      case 'Repository': text = generateJpaRepository(tableName, columns); break;
      case 'Service': text = generateJpaService(tableName); break;
      case 'Controller': text = generateJpaController(tableName); break;
      case 'DBML': text = generateDbml(tableName, columns); break;
      default: return;
    }
    
    const success = await copyToClipboard(text);
    if (success) alert(`${type} 코드가 클립보드에 복사되었습니다.`);
  };

  return (
    // 전체 컨테이너에 min-width: 0 적용하여 flex 자식 요소의 오버플로우 방지
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', minWidth: 0 }}>
      
      {/* 상단 툴바 및 컨트롤 바 (flex-wrap 적용하여 버튼 줄바꿈 허용) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #d0d7de' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <Table2 size={20} style={{ color: '#57606a' }} />
          <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#24292f', whiteSpace: 'nowrap' }}>테이블 이름:</label>
          <input 
            type="text" 
            value={tableName}
            onChange={(e) => {
              const val = e.target.value;
              setTableName(namingConvention === 'snake' ? toSnakeCase(val) : toCamelCase(val));
            }}
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

          {/* 백엔드 코드 제너레이터 버튼 그룹 */}
          <button 
            onClick={() => handleExport('JPA Entity')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#2da44e' }}
            title="Java JPA Entity 코드 복사"
          >
            <Code2 size={14} /> Entity
          </button>
          <button 
            onClick={() => handleExport('Repository')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#0969da' }}
            title="Spring Data JPA Repository 인터페이스 복사"
          >
            <HardDrive size={14} /> Repo
          </button>
          <button 
            onClick={() => handleExport('Service')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#bf3989' }}
            title="비즈니스 로직(Service) 클래스 복사"
          >
            <Layers size={14} /> Service
          </button>
          <button 
            onClick={() => handleExport('Controller')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#cf222e' }}
            title="REST API 엔드포인트(Controller) 클래스 복사"
          >
            <Server size={14} /> API
          </button>

          <div style={{ width: '1px', height: '20px', backgroundColor: '#d0d7de', margin: '0 2px' }} />
          
          <button 
            onClick={() => handleExport('DBML')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#8250df' }}
            title="DBML 다이어그램 명세로 복사"
          >
            <Database size={14} /> DBML
          </button>
          <button 
            onClick={() => handleExport('Migration')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#e34c26' }}
            title="원본 스키마와의 변경점(Diff)을 ALTER TABLE 스크립트로 추출"
          >
            <FileDiff size={14} /> Migration
          </button>

          <div style={{ width: '1px', height: '20px', backgroundColor: '#d0d7de', margin: '0 4px' }} />

          <button 
            onClick={toggleNamingConvention}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', backgroundColor: '#f6f8fa', border: '1px solid #d0d7de', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#0969da' }}
            title="컬럼명 일괄 자동 변환 적용"
          >
            <ArrowRightLeft size={14} />
            {namingConvention === 'snake' ? 'Snake 적용 중' : 'Camel 적용 중'}
          </button>
        </div>
      </div>

      {/* SQL Import(리버스 엔지니어링) 확장 입력부 */}
      {showImportArea && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', backgroundColor: '#f6f8fa', borderRadius: '8px', border: '1px solid #d0d7de' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#57606a' }}>기존 CREATE TABLE 구문을 붙여넣으면 그리드 상태가 자동으로 채워집니다.</div>
          <textarea 
            value={importSqlText} 
            onChange={(e) => setImportSqlText(e.target.value)}
            placeholder="CREATE TABLE ..."
            style={{ width: '100%', height: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #d0d7de', fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: '12px', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button onClick={() => setShowImportArea(false)} style={{ padding: '6px 12px', backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>취소</button>
            <button onClick={handleApplyImport} style={{ padding: '6px 12px', backgroundColor: '#0969da', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>파싱 적용하기</button>
          </div>
        </div>
      )}

      {/* 스프레드시트 그리드 영역 */}
      {/* 전체 그리드를 감싸는 단일 overflow-x 컨테이너를 배치하여 헤더와 바디의 가로 스크롤을 동기화합니다. */}
      <div style={{ flex: 1, backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '8px', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        
        {/* 그리드 헤더 (고정 픽셀 규격을 Row 컴포넌트와 동일하게 맞춤) */}
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

        {/* 그리드 바디 (리스트) */}
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
      {/* minWidth: 0 속성으로 하단 코드 뷰어의 텍스트 오버플로우를 제어합니다. */}
      <div style={{ height: '220px', backgroundColor: '#24292f', borderRadius: '8px', border: '1px solid #d0d7de', display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, flexShrink: 0 }}>
        <div style={{ padding: '8px 16px', backgroundColor: '#32383f', borderBottom: '1px solid #1b1f24', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>실시간 SQL 컴파일 뷰어 (Live Preview)</span>
        </div>
        <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
          <pre style={{ margin: 0, padding: 0, backgroundColor: 'transparent', color: '#e6edf3', fontSize: '13px', fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace', lineHeight: '1.6' }}>
            <code dangerouslySetInnerHTML={{ __html: highlightedSql }} style={{ whiteSpace: 'pre' }} />
          </pre>
        </div>
      </div>

    </div>
  );
}

export default DdlGridPanel;