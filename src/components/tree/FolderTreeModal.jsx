// src/components/tree/FolderTreeModal.jsx v2.1
/*
 * 파일 설명: 사용자가 입력한 노드 데이터를 기반으로 폴더 트리 구조를 마크다운 텍스트로 생성하는 모달 컴포넌트입니다.
 * (v2.1 수정사항): 미리보기 컨테이너가 중앙 정렬 속성을 상속받아 트리가 붕괴되어 보이는 시각적 버그를 해결하기 위해 textAlign: 'left' 및 whiteSpace: 'pre' 속성을 강제 적용했습니다.
 * 연결 위치: src/components/editor/Editor.jsx 내부
 */
import React, { useState, useEffect } from 'react';
import { Folder, FileText, ChevronRight, ChevronLeft, ArrowUp, ArrowDown, Plus, Trash2 } from 'lucide-react';

function FolderTreeModal({ isOpen, onClose, onInsert }) {
  console.log("[FolderTreeModal v2.1] 모달 컴포넌트 렌더링 활성화 - 좌측 정렬 패치 적용됨");

  // 초기 트리 데이터 상태 구성
  const [nodes, setNodes] = useState([
    { id: 'node-1', name: 'project', isFolder: true, depth: 0 },
    { id: 'node-2', name: 'src', isFolder: true, depth: 1 },
    { id: 'node-3', name: 'App.jsx', isFolder: false, depth: 2 },
    { id: 'node-4', name: 'package.json', isFolder: false, depth: 1 }
  ]);

  const [previewText, setPreviewText] = useState('');

  // 트리 데이터를 표준 유니코드 텍스트로 변환하는 핵심 렌더링 엔진
  const generateTreeString = (currentNodes) => {
    console.log("[FolderTreeModal v2.1] 폴더 트리 문자열 변환 알고리즘 가동");
    let result = '';

    for (let i = 0; i < currentNodes.length; i++) {
      const node = currentNodes[i];
      
      // 최상위 루트 노드는 기호 없이 이름만 출력
      if (node.depth === 0) {
        result += node.name + '\n';
        continue;
      }

      let prefix = '';
      
      // 1. 현재 노드의 깊이 이전까지의 들여쓰기 공백 및 부모 형제 연결선(│) 연산
      for (let j = 1; j < node.depth; j++) {
        let hasSibling = false;
        // 현재 깊이(j)와 동일한 깊이를 가진 형제 노드가 아래에 존재하는지 스캔
        for (let k = i + 1; k < currentNodes.length; k++) {
          if (currentNodes[k].depth === j) {
            hasSibling = true;
            break;
          }
          // 부모 레벨로 돌아가면 탐색 중단
          if (currentNodes[k].depth < j) {
            break;
          }
        }
        prefix += hasSibling ? '│   ' : '    ';
      }

      // 2. 현재 노드가 해당 깊이의 마지막 노드인지(└──) 중간 노드인지(├──) 판별
      let isLast = true;
      for (let k = i + 1; k < currentNodes.length; k++) {
        if (currentNodes[k].depth === node.depth) {
          isLast = false;
          break;
        }
        if (currentNodes[k].depth < node.depth) {
          break;
        }
      }
      
      prefix += isLast ? '└── ' : '├── ';
      result += prefix + node.name + '\n';
    }

    console.log("[FolderTreeModal v2.1] 문자열 변환 완료");
    return result.trimEnd();
  };

  // 노드 데이터가 변경될 때마다 미리보기 텍스트 동기화
  useEffect(() => {
    if (isOpen) {
      setPreviewText(generateTreeString(nodes));
    }
  }, [nodes, isOpen]);

  // 상호작용 핸들러: 노드 이름 변경
  const handleNameChange = (id, newName) => {
    console.log(`[FolderTreeModal v2.1] 노드 이름 변경 - ID: ${id}, 값: ${newName}`);
    setNodes(nodes.map(node => node.id === id ? { ...node, name: newName } : node));
  };

  // 상호작용 핸들러: 폴더/파일 타입 토글
  const handleTypeToggle = (id) => {
    console.log(`[FolderTreeModal v2.1] 노드 타입(폴더/파일) 토글 - ID: ${id}`);
    setNodes(nodes.map(node => node.id === id ? { ...node, isFolder: !node.isFolder } : node));
  };

  // 상호작용 핸들러: 깊이 증가 (우측 이동)
  const handleDepthIncrease = (idx) => {
    console.log(`[FolderTreeModal v2.1] 노드 깊이 증가 요청 - 인덱스: ${idx}`);
    if (idx === 0) return; // 첫 번째 노드는 깊이 증가 불가
    const newNodes = [...nodes];
    const prevDepth = newNodes[idx - 1].depth;
    // 이전 노드의 깊이 + 1 까지만 증가 허용
    if (newNodes[idx].depth <= prevDepth) {
      newNodes[idx].depth += 1;
      setNodes(newNodes);
    }
  };

  // 상호작용 핸들러: 깊이 감소 (좌측 이동)
  const handleDepthDecrease = (idx) => {
    console.log(`[FolderTreeModal v2.1] 노드 깊이 감소 요청 - 인덱스: ${idx}`);
    const newNodes = [...nodes];
    if (newNodes[idx].depth > 0) {
      newNodes[idx].depth -= 1;
      setNodes(newNodes);
    }
  };

  // 상호작용 핸들러: 위로 이동
  const handleMoveUp = (idx) => {
    console.log(`[FolderTreeModal v2.1] 노드 상단 이동 요청 - 인덱스: ${idx}`);
    if (idx === 0) return;
    const newNodes = [...nodes];
    const temp = newNodes[idx - 1];
    newNodes[idx - 1] = newNodes[idx];
    newNodes[idx] = temp;
    setNodes(newNodes);
  };

  // 상호작용 핸들러: 아래로 이동
  const handleMoveDown = (idx) => {
    console.log(`[FolderTreeModal v2.1] 노드 하단 이동 요청 - 인덱스: ${idx}`);
    if (idx === nodes.length - 1) return;
    const newNodes = [...nodes];
    const temp = newNodes[idx + 1];
    newNodes[idx + 1] = newNodes[idx];
    newNodes[idx] = temp;
    setNodes(newNodes);
  };

  // 상호작용 핸들러: 특정 위치 바로 아래에 새 노드 추가
  const handleAddNodeBelow = (idx) => {
    console.log(`[FolderTreeModal v2.1] 신규 노드 중간 삽입 - 인덱스: ${idx}`);
    const currentDepth = nodes[idx].depth;
    const newNode = {
      id: `node-${Date.now()}`,
      name: 'new_item',
      isFolder: false,
      depth: currentDepth
    };
    const newNodes = [...nodes];
    newNodes.splice(idx + 1, 0, newNode);
    setNodes(newNodes);
  };

  // 상호작용 핸들러: 최하단에 새 노드 추가
  const handleAddNodeAtBottom = () => {
    console.log("[FolderTreeModal v2.1] 최하단 신규 노드 추가");
    const lastDepth = nodes.length > 0 ? nodes[nodes.length - 1].depth : 0;
    setNodes([...nodes, {
      id: `node-${Date.now()}`,
      name: 'new_item',
      isFolder: false,
      depth: lastDepth
    }]);
  };

  // 상호작용 핸들러: 노드 삭제
  const handleRemoveNode = (id) => {
    console.log(`[FolderTreeModal v2.1] 노드 삭제 - ID: ${id}`);
    setNodes(nodes.filter(node => node.id !== id));
  };

  // 최종 삽입 이벤트
  const handleInsertSubmit = () => {
    console.log("[FolderTreeModal v2.1] 에디터 본문 삽입 이벤트 발송");
    const formattedCodeBlock = `\n\`\`\`text\n${previewText}\n\`\`\`\n`;
    onInsert(formattedCodeBlock);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="diagram-modal-backdrop" onClick={onClose} style={{ zIndex: 3000 }}>
      <div className="diagram-modal-content" style={{ width: '1000px', height: '650px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* 모달 헤더 */}
        <div className="diagram-modal-header">
          <div className="header-title-section">
            <h3>폴더 트리 작성기 (v2.1)</h3>
          </div>
          <button className="close-x-btn" onClick={onClose}>&times;</button>
        </div>

        {/* 모달 본문 분할 컨테이너 */}
        <div className="diagram-modal-body" style={{ display: 'flex', height: 'calc(100% - 120px)' }}>
          
          {/* 좌측: 트리 구조 편집 패널 */}
          <div className="diagram-editor-panel" style={{ width: '50%', padding: '20px', borderRight: '1px solid #d0d7de', overflowY: 'auto' }}>
            <div className="panel-title-label" style={{ marginBottom: '16px', fontWeight: 'bold', color: '#57606a', fontSize: '12px' }}>트리 구조 편집</div>
            
            <div className="gui-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {nodes.map((node, idx) => (
                <div key={node.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: `${node.depth * 20}px`, transition: 'margin 0.2s ease' }}>
                  
                  {/* 아이콘 및 타입 토글 버튼 */}
                  <button 
                    onClick={() => handleTypeToggle(node.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: node.isFolder ? '#0969da' : '#57606a' }}
                    title="클릭하여 폴더/파일 전환"
                  >
                    {node.isFolder ? <Folder size={16} fill="#0969da" stroke="#0969da" fillOpacity="0.2" /> : <FileText size={16} />}
                  </button>

                  {/* 노드 이름 입력 칸 */}
                  <input 
                    type="text" 
                    value={node.name}
                    onChange={(e) => handleNameChange(node.id, e.target.value)}
                    style={{ flex: 1, padding: '6px 10px', border: '1px solid #d0d7de', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
                  />

                  {/* 제어 버튼 그룹 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: '#f6f8fa', borderRadius: '6px', padding: '2px' }}>
                    <button onClick={() => handleDepthDecrease(idx)} disabled={node.depth === 0} style={{ background: 'none', border: 'none', cursor: node.depth === 0 ? 'not-allowed' : 'pointer', padding: '4px', color: node.depth === 0 ? '#d0d7de' : '#57606a' }}><ChevronLeft size={14} /></button>
                    <button onClick={() => handleDepthIncrease(idx)} disabled={idx === 0} style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', padding: '4px', color: idx === 0 ? '#d0d7de' : '#57606a' }}><ChevronRight size={14} /></button>
                    <div style={{ width: '1px', height: '12px', backgroundColor: '#d0d7de', margin: '0 4px' }} />
                    <button onClick={() => handleMoveUp(idx)} disabled={idx === 0} style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', padding: '4px', color: idx === 0 ? '#d0d7de' : '#57606a' }}><ArrowUp size={14} /></button>
                    <button onClick={() => handleMoveDown(idx)} disabled={idx === nodes.length - 1} style={{ background: 'none', border: 'none', cursor: idx === nodes.length - 1 ? 'not-allowed' : 'pointer', padding: '4px', color: idx === nodes.length - 1 ? '#d0d7de' : '#57606a' }}><ArrowDown size={14} /></button>
                    <div style={{ width: '1px', height: '12px', backgroundColor: '#d0d7de', margin: '0 4px' }} />
                    <button onClick={() => handleAddNodeBelow(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#0969da' }}><Plus size={14} /></button>
                    <button onClick={() => handleRemoveNode(node.id)} disabled={nodes.length <= 1} style={{ background: 'none', border: 'none', cursor: nodes.length <= 1 ? 'not-allowed' : 'pointer', padding: '4px', color: nodes.length <= 1 ? '#d0d7de' : '#cf222e' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={handleAddNodeAtBottom}
              style={{ width: '100%', marginTop: '16px', padding: '10px', backgroundColor: '#f6f8fa', border: '1px dashed #d0d7de', borderRadius: '6px', color: '#0969da', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
            >
              + 최종 하단에 노드 추가
            </button>
          </div>

          {/* 우측: 실시간 마크다운 프리뷰 패널 */}
          <div className="diagram-preview-panel" style={{ width: '50%', padding: '20px', backgroundColor: '#f6f8fa', display: 'flex', flexDirection: 'column' }}>
            <div className="panel-title-label" style={{ marginBottom: '16px', fontWeight: 'bold', color: '#57606a', fontSize: '12px' }}>출력 마크다운 프리뷰</div>
            
            <div className="preview-render-wrapper" style={{ flex: 1, backgroundColor: '#1e1e1e', borderRadius: '8px', padding: '16px', overflow: 'auto' }}>
              {/* 핵심 수정 지점: textAlign: 'left' 추가 및 줄바꿈 파괴 방지를 위해 whiteSpace를 'pre'로 변경 */}
              <pre style={{ 
                margin: 0, 
                color: '#d4d4d4', 
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace', 
                fontSize: '14px',
                lineHeight: '1.5',
                whiteSpace: 'pre',
                textAlign: 'left'
              }}>
                {previewText}
              </pre>
            </div>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="diagram-modal-footer" style={{ padding: '16px 20px', borderTop: '1px solid #d0d7de', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#f6f8fa' }}>
          <button className="cancel-btn" onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #d0d7de', borderRadius: '6px', backgroundColor: '#ffffff', cursor: 'pointer' }}>취소</button>
          <button className="submit-btn" onClick={handleInsertSubmit} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', backgroundColor: '#2da44e', color: '#ffffff', fontWeight: '600', cursor: 'pointer' }}>에디터에 삽입</button>
        </div>
      </div>
    </div>
  );
}

export default FolderTreeModal;