// src/components/editor/toolbar/sqlBuilder/DmlWorkspacePanel.jsx v1.0
/*
 * 파일 위치: src/components/editor/toolbar/sqlBuilder/DmlWorkspacePanel.jsx
 * 파일 설명: 시각적 SQL 쿼리 빌더의 DML(SELECT/JOIN) 모드 전용 메인 패널입니다.
 * React Flow 캔버스를 기반으로 테이블 노드 조인, 사이드바, 필터 패널, 하단 뷰어를 통합 관리합니다.
 * 연결 위치: src/components/editor/toolbar/SqlQueryBuilderModal.jsx
 */
import React, { useState, useCallback, useMemo, useRef } from 'react';
import ReactFlow, { addEdge, applyNodeChanges, applyEdgeChanges, Background, Controls, ReactFlowProvider } from 'reactflow';
import { Lightbulb } from 'lucide-react'; // 스마트 추천 아이콘 임포트
import 'reactflow/dist/style.css'; // React Flow 필수 코어 스타일
import DmlSidebar from './DmlSidebar';
import DmlTableNode from './DmlTableNode';
import DmlFilterPanel from './DmlFilterPanel';
import { generateSelectQuery } from '../../../../utils/editor/sqlDmlGenerator';
import { highlightCode } from '../../../../utils/editor/syntaxHighlighter';
import { recommendIndexes } from '../../../../utils/editor/sqlIndexRecommender'; // 인덱스 추천기 임포트

// 커스텀 노드 타입 매핑
const nodeTypes = {
  tableNode: DmlTableNode
};

function DmlWorkspaceContent() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  
  // 쿼리 필터 상태
  const [filters, setFilters] = useState({
    where: [],
    groupBy: [],
    orderBy: []
  });

  // 노드 위치 이동 감지
  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  // 엣지 삭제/변경 감지
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // 노드 핸들 간의 연결(조인) 감지 시 선 추가 (기본 동작: INNER JOIN 시각화)
  const onConnect = useCallback(
    (connection) => {
      console.log("[DmlWorkspacePanel v1.0] 테이블 간 FK 조인 연결 감지", connection);
      setEdges((eds) => addEdge({ ...connection, type: 'smoothstep', animated: true, style: { stroke: '#0969da', strokeWidth: 2 } }, eds));
    },
    []
  );

  // 사이드바에서 캔버스로 드래그해 올 때 허용 표시
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // 캔버스에 드롭했을 때 노드 생성
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      console.log("[DmlWorkspacePanel v1.0] 캔버스에 테이블 노드 드롭 감지");

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const tableDataStr = event.dataTransfer.getData('application/reactflow');
      
      if (!tableDataStr) return;
      const tableData = JSON.parse(tableDataStr);

      const position = {
        x: event.clientX - reactFlowBounds.left - 100, // 마우스 포인터를 노드 중앙 근처로 보정
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

  // 실시간 SQL 쿼리 문자열 컴파일 (메모이제이션)
  const compiledSql = useMemo(() => {
    return generateSelectQuery(nodes, edges, filters);
  }, [nodes, edges, filters]);

  // 실시간 구문 강조 적용
  const highlightedSql = useMemo(() => {
    return highlightCode(compiledSql, 'sql');
  }, [compiledSql]);

  // 실시간 인덱스 추천 분석 실행
  const indexRecommendations = useMemo(() => {
    return recommendIndexes(nodes, edges, filters);
  }, [nodes, edges, filters]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      
      {/* 워크스페이스 상단 (사이드바 + 캔버스 + 필터) */}
      <div style={{ flex: 1, display: 'flex', border: '1px solid #d0d7de', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
        
        <DmlSidebar />

        {/* 중앙 React Flow 캔버스 */}
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
        
        {/* 좌측 실시간 SQL 컴파일 뷰어 패널 */}
        <div style={{ flex: 2, backgroundColor: '#24292f', borderRadius: '8px', border: '1px solid #d0d7de', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '8px 16px', backgroundColor: '#32383f', borderBottom: '1px solid #1b1f24', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>DML 쿼리 컴파일 뷰어 (Live Preview)</span>
          </div>
          <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
            <pre style={{ margin: 0, padding: 0, backgroundColor: 'transparent', color: '#e6edf3', fontSize: '13px', fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace', lineHeight: '1.6' }}>
              <code dangerouslySetInnerHTML={{ __html: highlightedSql }} style={{ whiteSpace: 'pre' }} />
            </pre>
          </div>
        </div>

        {/* 우측 스마트 인덱스 추천 패널 */}
        <div style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #d0d7de', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '8px 16px', backgroundColor: '#fcfcfc', borderBottom: '1px solid #d0d7de', fontSize: '12px', fontWeight: 'bold', color: '#24292f', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lightbulb size={16} color="#d4a72c" />
            <span>스마트 인덱스 추천 (Auto Indexing)</span>
          </div>
          <div style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {indexRecommendations.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#8c959f', textAlign: 'center', marginTop: '20px' }}>
                추천할 인덱스가 없습니다.<br/>조인(JOIN)이나 조건절을 추가해 보세요.
              </div>
            ) : (
              indexRecommendations.map((rec, idx) => (
                <div key={idx} style={{ padding: '8px', backgroundColor: '#f6f8fa', border: '1px dashed #d0d7de', borderRadius: '6px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontWeight: 'bold', color: '#0969da' }}>💡 {rec.reason}</span>
                  <code style={{ color: '#24292f', backgroundColor: '#ffffff', padding: '4px', borderRadius: '4px', border: '1px solid #e1e4e8', fontFamily: 'ui-monospace, monospace' }}>
                    {rec.script}
                  </code>
                </div>
              ))
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}

// React Flow Context 공급자를 최상단 래퍼로 적용
function DmlWorkspacePanel() {
  return (
    <ReactFlowProvider>
      <DmlWorkspaceContent />
    </ReactFlowProvider>
  );
}

export default DmlWorkspacePanel;