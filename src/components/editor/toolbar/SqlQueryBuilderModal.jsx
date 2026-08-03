// src/components/editor/toolbar/SqlQueryBuilderModal.jsx v1.2
/*
 * 파일 위치: src/components/editor/toolbar/SqlQueryBuilderModal.jsx
 * 파일 설명: 시각적 SQL 쿼리 빌더의 최상위 모달 컨트롤러입니다.
 * (v1.2 수정사항): 에디터로부터 initialValue와 onInsert 프롭스를 정상 수신하여 하위 패널로 전달하는 파이프라인을 복구했습니다.
 * 연결 위치: src/components/editor/Editor.jsx
 */
import React, { useState, useEffect } from 'react';
import { X, TableProperties, Network, ShieldCheck } from 'lucide-react';
import DdlGridPanel from './sqlBuilder/ddl/DdlGridPanel'; 
import DmlWorkspacePanel from './sqlBuilder/dml/DmlWorkspacePanel'; 
import DclMatrixPanel from './sqlBuilder/dcl/DclMatrixPanel'; 

// initialValue(드래그된 텍스트)와 onInsert(에디터 삽입 함수), fileExt(파일 확장자) 프롭스 수신
function SqlQueryBuilderModal({ isOpen, onClose, initialValue, onInsert, fileExt }) {
  const [currentMode, setCurrentMode] = useState('DDL');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 모달이 열릴 때 에디터에서 드래그된 텍스트(initialValue)의 종류를 분석하여 탭을 자동 전환합니다.
  useEffect(() => {
    if (isOpen && initialValue) {
      console.log("[SqlQueryBuilderModal v1.2] 에디터 선택 텍스트 감지, 자동 탭 라우팅 실행");
      const upperText = initialValue.toUpperCase();
      if (upperText.includes('CREATE TABLE') || upperText.includes('ALTER TABLE')) {
        setCurrentMode('DDL');
      } else if (upperText.includes('SELECT') || upperText.includes('JOIN')) {
        setCurrentMode('DML');
      } else if (upperText.includes('GRANT') || upperText.includes('REVOKE')) {
        setCurrentMode('DCL');
      }
    }
  }, [isOpen, initialValue]);

  // 모드 변경 시 부드러운 페이드 효과를 위한 핸들러
  const handleModeChange = (mode) => {
    if (mode === currentMode) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentMode(mode);
      setIsTransitioning(false);
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <div className="diagram-modal-backdrop" onClick={onClose} style={{ zIndex: 3000 }}>
      <div className="diagram-modal-content" style={{ width: '1100px', height: '750px', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
        
        {/* 모달 상단 헤더 영역 */}
        <div className="diagram-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #d0d7de', backgroundColor: '#f6f8fa' }}>
          <div className="header-title-section" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TableProperties size={20} style={{ color: '#0969da' }} />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#24292f' }}>시각적 SQL 쿼리 빌더 (Visual Query Builder)</h3>
          </div>
          <button className="close-x-btn" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#57606a' }}>
            <X size={20} />
          </button>
        </div>

        {/* 모달 바디 영역 (좌측 메뉴 + 우측 메인 패널) */}
        <div className="diagram-modal-body" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* 좌측 사이드바 (모드 선택 메뉴) */}
          <div style={{ width: '220px', borderRight: '1px solid #d0d7de', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
            <div style={{ padding: '16px', fontSize: '12px', fontWeight: 'bold', color: '#57606a', borderBottom: '1px solid #d0d7de' }}>작업 모드 선택 (STATEMENT TYPE)</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', padding: '8px' }}>
              <button 
                onClick={() => handleModeChange('DDL')}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: currentMode === 'DDL' ? '#f0f3f6' : 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', color: currentMode === 'DDL' ? '#0969da' : '#24292f' }}
              >
                <TableProperties size={18} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold' }}>DDL (스키마 정의)</div>
                  <div style={{ fontSize: '11px', color: '#57606a', marginTop: '2px' }}>CREATE, ALTER, DROP</div>
                </div>
              </button>

              <button 
                onClick={() => handleModeChange('DML')}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: currentMode === 'DML' ? '#f0f3f6' : 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', color: currentMode === 'DML' ? '#0969da' : '#24292f' }}
              >
                <Network size={18} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold' }}>DML (데이터 조작)</div>
                  <div style={{ fontSize: '11px', color: '#57606a', marginTop: '2px' }}>SELECT, INSERT, JOIN</div>
                </div>
              </button>

              <button 
                onClick={() => handleModeChange('DCL')}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: currentMode === 'DCL' ? '#f0f3f6' : 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', textAlign: 'left', color: currentMode === 'DCL' ? '#0969da' : '#24292f' }}
              >
                <ShieldCheck size={18} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold' }}>DCL (권한 제어)</div>
                  <div style={{ fontSize: '11px', color: '#57606a', marginTop: '2px' }}>GRANT, REVOKE</div>
                </div>
              </button>
            </div>
          </div>

          {/* 우측 메인 작업 패널 */}
          <div style={{ 
            flex: 1, 
            backgroundColor: '#f6f8fa', 
            padding: '24px', 
            overflowY: 'auto',
            opacity: isTransitioning ? 0 : 1,
            transition: 'opacity 0.15s ease-in-out',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* 각 패널에 initialValue와 삽입 후 모달을 닫는 래퍼 함수를 전달합니다. */}
            
            {/* DDL 모드 패널 */}
            {currentMode === 'DDL' && (
              <DdlGridPanel 
                initialValue={initialValue} 
                onInsert={(code) => { if (onInsert) { onInsert(code); onClose(); } }} 
              />
            )}

            {/* DML 모드 패널 */}
            {currentMode === 'DML' && (
              <DmlWorkspacePanel 
                onInsert={(code) => { if (onInsert) { onInsert(code); onClose(); } }} 
              />
            )}

            {/* DCL 모드 패널 */}
            {currentMode === 'DCL' && (
              <DclMatrixPanel 
                onInsert={(code) => { if (onInsert) { onInsert(code); onClose(); } }} 
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default SqlQueryBuilderModal;