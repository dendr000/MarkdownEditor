// src/components/tree/FolderTreeModal.jsx v3.0
/*
 * 파일 설명: 사용자가 입력한 노드 데이터를 기반으로 폴더 트리 구조를 마크다운 텍스트로 생성하는 메인 모달 컴포넌트입니다.
 * (v3.0 수정사항): 파일 크기 비대화 해결을 위해 변환 알고리즘과 개별 아이템 UI를 외부 파일로 분리했습니다.
 * 또한 '+' 버튼 클릭 시 원본 노드의 폴더/파일 상태를 상속받아 새 노드를 생성합니다.
 * 연결 위치: src/components/editor/Editor.jsx 내부
 */
import React, { useState, useEffect } from 'react';
import { generateTreeString } from '../../utils/treeGenerator';
import TreeNodeItem from './TreeNodeItem';

function FolderTreeModal({ isOpen, onClose, onInsert }) {
  console.log("[FolderTreeModal v3.0] 모달 컴포넌트 렌더링 - 모듈 분리 및 상태 계승 패치 적용됨");

  const [nodes, setNodes] = useState([
    { id: 'node-1', name: 'project', isFolder: true, depth: 0 },
    { id: 'node-2', name: 'src', isFolder: true, depth: 1 },
    { id: 'node-3', name: 'App.jsx', isFolder: false, depth: 2 },
    { id: 'node-4', name: 'package.json', isFolder: false, depth: 1 }
  ]);

  const [previewText, setPreviewText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPreviewText(generateTreeString(nodes));
    }
  }, [nodes, isOpen]);

  const handleNameChange = (id, newName) => {
    console.log(`[FolderTreeModal v3.0] 노드 이름 변경 - ID: ${id}, 값: ${newName}`);
    setNodes(nodes.map(node => node.id === id ? { ...node, name: newName } : node));
  };

  const handleTypeToggle = (id) => {
    console.log(`[FolderTreeModal v3.0] 노드 타입 토글 - ID: ${id}`);
    setNodes(nodes.map(node => node.id === id ? { ...node, isFolder: !node.isFolder } : node));
  };

  const handleDepthIncrease = (idx) => {
    console.log(`[FolderTreeModal v3.0] 노드 깊이 증가 - 인덱스: ${idx}`);
    if (idx === 0) return;
    const newNodes = [...nodes];
    const prevDepth = newNodes[idx - 1].depth;
    if (newNodes[idx].depth <= prevDepth) {
      newNodes[idx].depth += 1;
      setNodes(newNodes);
    }
  };

  const handleDepthDecrease = (idx) => {
    console.log(`[FolderTreeModal v3.0] 노드 깊이 감소 - 인덱스: ${idx}`);
    const newNodes = [...nodes];
    if (newNodes[idx].depth > 0) {
      newNodes[idx].depth -= 1;
      setNodes(newNodes);
    }
  };

  const handleMoveUp = (idx) => {
    console.log(`[FolderTreeModal v3.0] 노드 상단 이동 - 인덱스: ${idx}`);
    if (idx === 0) return;
    const newNodes = [...nodes];
    const temp = newNodes[idx - 1];
    newNodes[idx - 1] = newNodes[idx];
    newNodes[idx] = temp;
    setNodes(newNodes);
  };

  const handleMoveDown = (idx) => {
    console.log(`[FolderTreeModal v3.0] 노드 하단 이동 - 인덱스: ${idx}`);
    if (idx === nodes.length - 1) return;
    const newNodes = [...nodes];
    const temp = newNodes[idx + 1];
    newNodes[idx + 1] = newNodes[idx];
    newNodes[idx] = temp;
    setNodes(newNodes);
  };

  // 특정 위치 바로 아래에 새 노드 추가 (아이콘 상태 상속)
  const handleAddNodeBelow = (idx) => {
    console.log(`[FolderTreeModal v3.0] 신규 노드 중간 삽입 - 상속된 상태 적용 (인덱스: ${idx})`);
    const currentDepth = nodes[idx].depth;
    const currentIsFolder = nodes[idx].isFolder; // 클릭한 부모의 isFolder 상태 추출
    
    const newNode = {
      id: `node-${Date.now()}`,
      name: 'new_item',
      isFolder: currentIsFolder, // 상속받은 속성을 새 노드에 적용
      depth: currentDepth
    };
    
    const newNodes = [...nodes];
    newNodes.splice(idx + 1, 0, newNode);
    setNodes(newNodes);
  };

  const handleAddNodeAtBottom = () => {
    console.log("[FolderTreeModal v3.0] 최하단 신규 노드 추가");
    const lastNode = nodes.length > 0 ? nodes[nodes.length - 1] : { depth: 0, isFolder: false };
    
    setNodes([...nodes, {
      id: `node-${Date.now()}`,
      name: 'new_item',
      isFolder: lastNode.isFolder, // 마지막 노드의 상태 상속
      depth: lastNode.depth
    }]);
  };

  const handleRemoveNode = (id) => {
    console.log(`[FolderTreeModal v3.0] 노드 삭제 - ID: ${id}`);
    setNodes(nodes.filter(node => node.id !== id));
  };

  const handleInsertSubmit = () => {
    console.log("[FolderTreeModal v3.0] 에디터 본문 삽입 이벤트 발송");
    const formattedCodeBlock = `\n\`\`\`text\n${previewText}\n\`\`\`\n`;
    onInsert(formattedCodeBlock);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="diagram-modal-backdrop" onClick={onClose} style={{ zIndex: 3000 }}>
      <div className="diagram-modal-content" style={{ width: '1000px', height: '650px' }} onClick={(e) => e.stopPropagation()}>
        
        <div className="diagram-modal-header">
          <div className="header-title-section">
            <h3>폴더 트리 작성기 (v3.0)</h3>
          </div>
          <button className="close-x-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="diagram-modal-body" style={{ display: 'flex', height: 'calc(100% - 120px)' }}>
          
          <div className="diagram-editor-panel" style={{ width: '50%', padding: '20px', borderRight: '1px solid #d0d7de', overflowY: 'auto' }}>
            <div className="panel-title-label" style={{ marginBottom: '16px', fontWeight: 'bold', color: '#57606a', fontSize: '12px' }}>트리 구조 편집</div>
            
            <div className="gui-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {nodes.map((node, idx) => (
                <TreeNodeItem 
                  key={node.id}
                  node={node}
                  idx={idx}
                  totalCount={nodes.length}
                  onTypeToggle={handleTypeToggle}
                  onNameChange={handleNameChange}
                  onDepthDecrease={handleDepthDecrease}
                  onDepthIncrease={handleDepthIncrease}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onAddBelow={handleAddNodeBelow}
                  onRemove={handleRemoveNode}
                />
              ))}
            </div>

            <button 
              onClick={handleAddNodeAtBottom}
              style={{ width: '100%', marginTop: '16px', padding: '10px', backgroundColor: '#f6f8fa', border: '1px dashed #d0d7de', borderRadius: '6px', color: '#0969da', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
            >
              + 최종 하단에 노드 추가
            </button>
          </div>

          <div className="diagram-preview-panel" style={{ width: '50%', padding: '20px', backgroundColor: '#f6f8fa', display: 'flex', flexDirection: 'column' }}>
            <div className="panel-title-label" style={{ marginBottom: '16px', fontWeight: 'bold', color: '#57606a', fontSize: '12px' }}>출력 마크다운 프리뷰</div>
            
            <div className="preview-render-wrapper" style={{ flex: 1, backgroundColor: '#1e1e1e', borderRadius: '8px', padding: '16px', overflow: 'auto' }}>
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

        <div className="diagram-modal-footer" style={{ padding: '16px 20px', borderTop: '1px solid #d0d7de', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#f6f8fa' }}>
          <button className="cancel-btn" onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #d0d7de', borderRadius: '6px', backgroundColor: '#ffffff', cursor: 'pointer' }}>취소</button>
          <button className="submit-btn" onClick={handleInsertSubmit} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', backgroundColor: '#2da44e', color: '#ffffff', fontWeight: '600', cursor: 'pointer' }}>에디터에 삽입</button>
        </div>
      </div>
    </div>
  );
}

export default FolderTreeModal;