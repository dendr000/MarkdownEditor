// src/components/editor/toolbar/sqlBuilder/DmlSidebar.jsx v1.0
/*
 * 파일 위치: src/components/editor/toolbar/sqlBuilder/DmlSidebar.jsx
 * 파일 설명: DML 워크스페이스 좌측에 위치하여, 캔버스로 드래그 앤 드롭할 수 있는 가상 테이블 목록을 제공합니다.
 * 연결 위치: src/components/editor/toolbar/sqlBuilder/DmlWorkspacePanel.jsx
 */
import React from 'react';
import { Database, GripVertical } from 'lucide-react';

function DdlSidebar() {
  console.log("[DmlSidebar v1.0] DML 사이드바 렌더링 시작");

  // 시각적 테스트를 위한 가상(Dummy) 테이블 및 컬럼 명세
  const dummyTables = [
    { name: 'users', columns: ['id', 'username', 'email', 'created_at'] },
    { name: 'orders', columns: ['order_id', 'user_id', 'total_amount', 'status'] },
    { name: 'products', columns: ['product_id', 'name', 'price', 'stock'] }
  ];

  // 드래그 시작 시 테이블 데이터를 JSON 형태로 DataTransfer에 저장합니다.
  const onDragStart = (event, tableData) => {
    console.log(`[DmlSidebar v1.0] 드래그 시작 - 대상 테이블: ${tableData.name}`);
    event.dataTransfer.setData('application/reactflow', JSON.stringify(tableData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div style={{ width: '220px', backgroundColor: '#ffffff', borderRight: '1px solid #d0d7de', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px', backgroundColor: '#f6f8fa', borderBottom: '1px solid #d0d7de', fontSize: '13px', fontWeight: 'bold', color: '#24292f', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Database size={16} /> 테이블 목록
      </div>
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flex: 1 }}>
        <div style={{ fontSize: '11px', color: '#57606a', marginBottom: '8px' }}>
          * 테이블을 우측 캔버스로 드래그하세요.
        </div>
        
        {dummyTables.map((table) => (
          <div 
            key={table.name}
            draggable
            onDragStart={(e) => onDragStart(e, table)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '6px', cursor: 'grab', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'border-color 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#0969da'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = '#d0d7de'}
          >
            <GripVertical size={14} style={{ color: '#8c959f' }} />
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#24292f' }}>{table.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DdlSidebar;