// src/components/editor/toolbar/sqlBuilder/dml/DmlWorkspacePanel.jsx v2.0
/*
 * 파일 위치: src/components/editor/toolbar/sqlBuilder/dml/DmlWorkspacePanel.jsx
 * 파일 설명: 시각적 SQL 쿼리 빌더의 DML(SELECT/JOIN) 모드 전용 메인 패널입니다.
 * 하위 폴더 분할에 맞추어 Sidebar, Canvas, Filter, Preview, Recommendation 컴포넌트를 조율합니다.
 * 연결 위치: src/components/editor/toolbar/SqlQueryBuilderModal.jsx
 */
import React, { useState, useCallback, useMemo, useRef } from 'react';
import ReactFlow, { addEdge, applyNodeChanges, applyEdgeChanges, Background, Controls, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css'; 
import { generateSelectQuery } from '../../../../../utils/editor/sqlDmlGenerator';
import { highlightCode } from '../../../../../utils/editor/syntaxHighlighter';
import { recommendIndexes } from '../../../../../utils/editor/sqlIndexRecommender';

// 분할된 하위 모듈 임포트
import DmlSidebar from './DmlSidebar';
import DmlTableNode from './DmlTableNode';
import DmlFilterPanel from './DmlFilterPanel';
import DmlPreview from './DmlPreview';
import DmlIndexRecommendation from './DmlIndexRecommendation';

// 커스텀 노드 타입 매핑
const nodeTypes = {
  tableNode: DmlTableNode
};

function DmlWorkspaceContent({ onInsert }) {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  
  // 쿼리 필터 상태
  const [filters, setFilters] = useState({
    where: [],
    groupBy: [],
    orderBy: []
  });

  // 노드 및 엣지 이벤트 감지
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection) => {
      console.log("[DmlWorkspacePanel v2.0] 테이블 간 FK 조인 연결 감지", connection);
      setEdges((eds) => addEdge({ ...connection, type: 'smoothstep', animated: true, style: { stroke: '#0969da', strokeWidth: 2 } }, eds));
    },
    []
  );

  // 드래그 앤 드롭 캔버스 처리
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      console.log("[DmlWorkspacePanel v2.0] 캔버스에 테이블 노드 드롭 감지");

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const tableDataStr = event.dataTransfer.getData('application/reactflow');
      
      if (!tableDataStr) return;
      const tableData = JSON.parse(tableDataStr);

      const position = {
        x: event.clientX - reactFlowBounds.left - 100, 
        y: event.clientY - reactFlowBounds.top - 20,
      };

      const newNode = {
        id: `node_${Date.now()}`,
        type: 'tableNode',
        position,
        data: { tableName: tableData.name, columns: tableData.columns },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    []
  );

  // 실시간 SQL 컴파일 및 추천 인덱스 연산
  const compiledSql = useMemo(() => {
    return generateSelectQuery(nodes, edges, filters);
  }, [nodes, edges, filters]);

  const highlightedSql = useMemo(() => {
    return highlightCode(compiledSql, 'sql');
  }, [compiledSql]);

  const indexRecommendations = useMemo(() => {
    return recommendIndexes(nodes, edges, filters);
  }, [nodes, edges, filters]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      
      {/* 워크스페이스 상단 (사이드바 + 캔버스 + 필터) */}
      <div style={{ flex: 1, display: 'flex', border: '1px solid #d0d7de', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
        
        <DmlSidebar />

        <div ref={reactFlowWrapper} style={{ flex: 1, position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background color="#d0d7de" gap={16} />
            <Controls />
          </ReactFlow>
        </div>

        <DmlFilterPanel filters={filters} setFilters={setFilters} />
      </div>

      {/* 하단 패널 분할 컨테이너 (좌측: SQL 뷰어, 우측: 인덱스 추천기) */}
      <div style={{ display: 'flex', gap: '16px', height: '180px', minWidth: 0, flexShrink: 0 }}>
        
        <DmlPreview 
          highlightedSql={highlightedSql} 
          compiledSql={compiledSql} 
          onInsert={onInsert} 
        />

        <DmlIndexRecommendation 
          recommendations={indexRecommendations} 
        />
        
      </div>
    </div>
  );
}

// React Flow Context 공급자를 최상단 래퍼로 적용
function DmlWorkspacePanel({ onInsert }) {
  return (
    <ReactFlowProvider>
      <DmlWorkspaceContent onInsert={onInsert} />
    </ReactFlowProvider>
  );
}

export default DmlWorkspacePanel;