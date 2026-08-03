// src/components/editor/toolbar/SqlQueryBuilderModal.jsx v1.0
/*
 * 파일 위치: src/components/editor/toolbar/SqlQueryBuilderModal.jsx
 * 파일 설명: 시각적 SQL 쿼리 빌더의 최상위 대형 모달 컨테이너입니다. DDL, DML, DCL 모드 간의 탭 상태 관리를 수행하며 각 작업 패널을 전환합니다.
 * 연결 위치: src/components/editor/Editor.jsx 내부에 마운트됩니다.
 */
import React, { useState, useEffect } from 'react';
import { X, TableProperties, Network, ShieldCheck } from 'lucide-react';
import DdlGridPanel from './sqlBuilder/ddl/DdlGridPanel'; // ddl 하단 폴더로 경로 변경
import DmlWorkspacePanel from './sqlBuilder/dml/DmlWorkspacePanel'; 
import DclMatrixPanel from './sqlBuilder/dcl/DclMatrixPanel';

function SqlQueryBuilderModal({ isOpen, onClose }) {
  // 현재 활성화된 쿼리 빌더 모드 상태 (DDL, DML, DCL)
  const [currentMode, setCurrentMode] = useState('DDL');
  // 부드러운 패널 전환을 위한 페이드 인/아웃 상태
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 모달이 열릴 때 상태 초기화 및 로그 기록
  useEffect(() => {
    if (isOpen) {
      console.log("[SqlQueryBuilderModal v1.0] 시각적 SQL 쿼리 빌더 모달 활성화");
      setCurrentMode('DDL');
      setIsTransitioning(false);
    }
  }, [isOpen]);

  // 탭 변경 시 부드러운 화면 전환(페이드) 효과를 처리하는 함수
  const handleTabChange = (mode) => {
    if (mode === currentMode) return;
    
    console.log(`[SqlQueryBuilderModal v1.0] 쿼리 빌더 모드 전환 요청: ${currentMode} -> ${mode}`);
    setIsTransitioning(true);
    
    // 150ms 후 실제 모드 상태를 변경하여 CSS 페이드 아웃/인 애니메이션 싱크를 맞춥니다.
    setTimeout(() => {
      setCurrentMode(mode);
      setIsTransitioning(false);
      console.log(`[SqlQueryBuilderModal v1.0] 쿼리 빌더 모드 전환 완료: ${mode}`);
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={() => {
        console.log("[SqlQueryBuilderModal v1.0] 모달 외부 클릭으로 인한 닫기 요청");
        onClose();
      }} 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        position: 'fixed', 
        top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.6)', 
        zIndex: 4000 
      }}
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          width: '90vw', 
          height: '90vh', 
          backgroundColor: '#ffffff', 
          borderRadius: '12px', 
          display: 'flex', 
          flexDirection: 'column', 
          boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
          overflow: 'hidden'
        }}
      >
        {/* 상단 헤더 영역 */}
        <div 
          className="modal-header" 
          style={{ 
            padding: '16px 24px', 
            borderBottom: '1px solid #d0d7de', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            backgroundColor: '#f6f8fa'
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', color: '#24292f', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TableProperties size={20} style={{ color: '#0969da' }} />
            시각적 SQL 쿼리 빌더 (Visual Query Builder)
          </h2>
          <button 
            onClick={() => {
              console.log("[SqlQueryBuilderModal v1.0] 닫기 버튼 클릭");
              onClose();
            }} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#57606a', padding: '4px' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* 본문 영역 (사이드바 + 메인 패널) */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* 좌측 탭 사이드바 */}
          <div style={{ 
            width: '240px', 
            backgroundColor: '#ffffff', 
            borderRight: '1px solid #d0d7de', 
            display: 'flex', 
            flexDirection: 'column',
            padding: '16px 0'
          }}>
            <div style={{ padding: '0 16px 12px 16px', fontSize: '12px', fontWeight: 'bold', color: '#57606a', letterSpacing: '0.5px' }}>
              작업 모드 선택 (STATEMENT TYPE)
            </div>
            
            <button 
              onClick={() => handleTabChange('DDL')}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', 
                padding: '12px 24px', margin: '0 8px', borderRadius: '6px',
                backgroundColor: currentMode === 'DDL' ? '#f0f3f6' : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                color: currentMode === 'DDL' ? '#0969da' : '#24292f',
                fontWeight: currentMode === 'DDL' ? 'bold' : 'normal',
                transition: 'background-color 0.2s'
              }}
            >
              <TableProperties size={18} />
              <span>DDL (스키마 정의)<br/><small style={{ fontWeight: 'normal', color: '#57606a', fontSize: '11px' }}>CREATE, ALTER, DROP</small></span>
            </button>
            
            <button 
              onClick={() => handleTabChange('DML')}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', 
                padding: '12px 24px', margin: '4px 8px 0', borderRadius: '6px',
                backgroundColor: currentMode === 'DML' ? '#f0f3f6' : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                color: currentMode === 'DML' ? '#2da44e' : '#24292f',
                fontWeight: currentMode === 'DML' ? 'bold' : 'normal',
                transition: 'background-color 0.2s'
              }}
            >
              <Network size={18} />
              <span>DML (데이터 조작)<br/><small style={{ fontWeight: 'normal', color: '#57606a', fontSize: '11px' }}>SELECT, INSERT, JOIN</small></span>
            </button>

            <button 
              onClick={() => handleTabChange('DCL')}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '12px', 
                padding: '12px 24px', margin: '4px 8px 0', borderRadius: '6px',
                backgroundColor: currentMode === 'DCL' ? '#f0f3f6' : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                color: currentMode === 'DCL' ? '#8250df' : '#24292f',
                fontWeight: currentMode === 'DCL' ? 'bold' : 'normal',
                transition: 'background-color 0.2s'
              }}
            >
              <ShieldCheck size={18} />
              <span>DCL (권한 제어)<br/><small style={{ fontWeight: 'normal', color: '#57606a', fontSize: '11px' }}>GRANT, REVOKE</small></span>
            </button>
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
            {/* DDL 모드 패널 (스프레드시트 컨테이너 마운트 완료) */}
            {currentMode === 'DDL' && (
              <DdlGridPanel />
            )}

            {/* DML 모드 패널 (React Flow 기반 시각적 조인 워크스페이스 마운트 완료) */}
            {currentMode === 'DML' && (
              <DmlWorkspacePanel />
            )}

            {/* DCL 모드 패널 (권한 제어용 GRANT/REVOKE 매트릭스 마운트 완료) */}
            {currentMode === 'DCL' && (
              <DclMatrixPanel />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default SqlQueryBuilderModal;