// src/components/preview/SqlFlowViewer.jsx v1.0
/*
 * 파일 위치: src/components/preview/SqlFlowViewer.jsx
 * 파일 설명: SQL 쿼리(SELECT, WITH, CREATE VIEW 등)의 데이터 흐름(Data Lineage)을 분석하여 노드 기반 다이어그램으로 시각화하는 컴포넌트입니다.
 * 기능: AST 파서의 크래시 위험을 방지하기 위해 정규식 기반 커스텀 파서를 사용하여 CTE(WITH) 블록과 물리 테이블 간의 의존성을 추출하고, reactflow를 통해 렌더링합니다.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, { Background, Controls, MarkerType, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import 'reactflow/dist/style.css';

function SqlFlowViewer({ sql }) {
  console.log("[SqlFlowViewer v1.0] SQL 데이터 흐름 다이어그램 렌더링 시작");

  // 정규식을 이용하여 안전하게 테이블 및 CTE 의존성을 추출하는 커스텀 로직
  const { initialNodes, initialEdges } = useMemo(() => {
    console.log("[SqlFlowViewer v1.0] 커스텀 정규식 기반 리니지(Lineage) 분석 시작");
    const nodes = [];
    const edges = [];
    const nodeMap = new Map();

    // 노드 중복 생성을 방지하며 맵에 등록하는 헬퍼 함수
    const addNode = (id, label, type, col) => {
      if (!nodeMap.has(id)) {
        nodeMap.set(id, { id, label, type, col });
        console.log(`[SqlFlowViewer v1.0] 노드 등록: ${id} (${type})`);
      }
    };

    // 엣지(연결선) 생성 헬퍼 함수
    const addEdge = (source, target) => {
      const edgeId = `e-${source}-${target}`;
      // 중복 엣지 방지
      if (!edges.some(e => e.id === edgeId)) {
        edges.push({
          id: edgeId,
          source,
          target,
          animated: true,
          style: { stroke: '#0969da', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#0969da' }
        });
        console.log(`[SqlFlowViewer v1.0] 엣지 연결: ${source} -> ${target}`);
      }
    };

    // 1. 최종 타겟(View 이름 또는 최종 Select) 추출
    let targetId = 'FINAL_RESULT';
    const viewMatch = sql.match(/CREATE\s+(?:OR\s+REPLACE\s+)?VIEW\s+([A-Za-z0-9_]+)/i);
    if (viewMatch) {
      targetId = viewMatch[1].toUpperCase();
    }
    addNode(targetId, `🎯 [VIEW/RESULT]\n${targetId}`, 'output', 3);

    // 2. CTE(WITH 절) 블록 추출 및 위치(Index) 기록
    const cteBlocks = [];
    const cteRegex = /([A-Za-z0-9_]+)\s+AS\s*\(/gi;
    let match;
    while ((match = cteRegex.exec(sql)) !== null) {
      cteBlocks.push({ name: match[1].toUpperCase(), index: match.index });
    }

    // 메인 SELECT 문의 시작 위치 추론 (마지막 CTE 종료 시점 이후)
    const mainSelectMatch = sql.match(/\)\s*(?:,\s*)?SELECT/i);
    const mainSelectIndex = mainSelectMatch ? mainSelectMatch.index : sql.length;

    // 3. FROM / JOIN 절에서 사용된 테이블 추출 및 관계 맵핑
    const tableRegex = /(?:FROM|JOIN)\s+([A-Za-z0-9_]+)/gi;
    while ((match = tableRegex.exec(sql)) !== null) {
      const tableName = match[1].toUpperCase();
      
      // SELECT 키워드가 잘못 잡힌 경우 스킵
      if (tableName === 'SELECT') continue;

      // 해당 테이블이 물리 테이블인지, 아니면 CTE 자체를 참조한 것인지 판별
      if (cteBlocks.some(c => c.name === tableName)) {
        // 메인 쿼리 등에서 CTE를 호출한 경우 최종 타겟으로 연결
        addEdge(tableName, targetId); 
      } else {
        // 물리 테이블 노드 생성
        addNode(tableName, `💾 [TABLE]\n${tableName}`, 'input', 1);
        
        // 이 물리 테이블이 어느 CTE 블록 안에서 호출되었는지 위치 기반으로 추론
        let closestCte = null;
        for (let i = cteBlocks.length - 1; i >= 0; i--) {
          if (match.index > cteBlocks[i].index) {
            closestCte = cteBlocks[i].name;
            break;
          }
        }

        // 메인 쿼리 영역에서 호출되었다면 타겟으로, 특정 CTE 안이면 해당 CTE로 연결
        if (match.index > mainSelectIndex) {
          addEdge(tableName, targetId);
        } else if (closestCte) {
          addEdge(tableName, closestCte);
        } else {
          addEdge(tableName, targetId);
        }
      }
    }

    // CTE 노드 생성 및 최종 타겟으로의 기본 연결 보장
    cteBlocks.forEach(cte => {
      addNode(cte.name, `⚙️ [CTE]\n${cte.name}`, 'default', 2);
      addEdge(cte.name, targetId);
    });

    // 4. 노드 자동 배치(Auto Layout) 연산
    let yPos = { 1: 50, 2: 50, 3: 200 }; // 각 컬럼별 시작 Y 좌표
    const xPos = { 1: 50, 2: 350, 3: 650 }; // 1: Input, 2: CTE, 3: Output

    Array.from(nodeMap.values()).forEach(n => {
      nodes.push({
        id: n.id,
        type: n.type,
        position: { x: xPos[n.col], y: yPos[n.col] },
        data: { label: n.label },
        style: {
          border: '1px solid #d0d7de',
          borderRadius: '8px',
          padding: '12px',
          backgroundColor: n.type === 'input' ? '#f0fdf4' : n.type === 'output' ? '#eff6ff' : '#ffffff',
          fontWeight: '600',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          width: 150
        }
      });
      yPos[n.col] += 100; // 다음 노드를 위해 Y축 간격 증가
    });

    console.log("[SqlFlowViewer v1.0] 분석 완료, 노드/엣지 데이터 생성 성공");
    return { initialNodes: nodes, initialEdges: edges };
  }, [sql]);

  // React Flow 상태 관리
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  // SQL이 변경될 때마다 노드 상태 동기화
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges]);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '600px', backgroundColor: '#f6f8fa' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#d0d7de" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}

export default SqlFlowViewer;