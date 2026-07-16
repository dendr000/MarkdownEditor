// src/components/tree/FolderTreeModal.jsx v1.0
/*
 * 파일 설명: 사용자가 직관적으로 폴더와 파일 구조를 추가, 이동, 들여쓰기하며 ASCII 기호 트리로 변환해 본문에 삽입할 수 있는 폴더 트리 작성기 모달 컴포넌트입니다.
 * 연결 위치: src/components/editor/Editor.jsx 내부에서 임포트되어 렌더링됩니다.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Folder, File, Plus, Trash2, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import './FolderTreeModal.css';

function FolderTreeModal({ isOpen, onClose, onInsert }) {
  console.log("FolderTreeModal 컴포넌트(v1.0) 렌더링 시작. 모달 오픈 상태:", isOpen);

  // 모달이 닫혀있는 상태라면 아무것도 렌더링하지 않고 즉시 차단합니다.
  if (!isOpen) return null;

  // 가상 폴더 트리 노드 리스트를 관리하기 위한 컴포넌트 로컬 상태 정의
  const [nodes, setNodes] = useState([
    { id: 'initial-root', name: 'project', type: 'folder', depth: 0 },
    { id: 'initial-src', name: 'src', type: 'folder', depth: 1 },
    { id: 'initial-app', name: 'App.jsx', type: 'file', depth: 2 },
    { id: 'initial-package', name: 'package.json', type: 'file', depth: 1 }
  ]);

  // 실시간 생성된 ASCII 텍스트 결과값을 저장하기 위한 상태 선언
  const [previewText, setPreviewText] = useState('');

  // 들여쓰기 한계 규칙을 준수하도록 유효 깊이 범위를 스캔하고 정상 범위로 복원해 주는 정규화 함수
  const normalizeDepths = (nodeList) => {
    console.log("[FolderTreeModal] 노드 깊이 정규화 연산 시도");
    if (nodeList.length === 0) return [];
    
    const normalized = [...nodeList];
    // 최상단 루트 노드의 깊이는 강제로 무조건 0 레벨로 고정 처리합니다.
    normalized[0].depth = 0;

    // 인근 부모 요소의 최대 깊이를 초과하는 들여쓰기 단계를 1씩 순차 정정합니다.
    for (let i = 1; i < normalized.length; i++) {
      if (normalized[i].depth > normalized[i - 1].depth + 1) {
        console.log(`[FolderTreeModal] 깊이 유효 범위 초과 감지. 인덱스 ${i}의 깊이를 ${normalized[i - 1].depth + 1}로 자동 하향 조정합니다.`);
        normalized[i].depth = normalized[i - 1].depth + 1;
      }
    }
    return normalized;
  };

  // 노드 리스트의 계층 구조를 분석하여 최종 ASCII 트리 텍스트를 구성하는 전용 파서 알고리즘
  const generateTreeText = (nodeList) => {
    console.log("[FolderTreeModal] ASCII 트리 텍스트 변환 파싱 연산 실행");
    let result = '';
    
    for (let i = 0; i < nodeList.length; i++) {
      const node = nodeList[i];
      
      // 최상단 깊이 0 레벨은 수평 기호 없이 이름만 단독 개행 처리합니다.
      if (node.depth === 0) {
        result += node.name + '\n';
        continue;
      }
      
      let prefix = '';
      // 이전 조상들의 하위 가지들이 연속되어 내려오는지 여부를 판별하여 수직 가이드 선을 긋습니다.
      for (let d = 1; d < node.depth; d++) {
        let hasActiveSibling = false;
        // 현재 노드 이후로 동일 깊이의 부모 레벨 자매 노드가 뒤이어 나오는지 스캔합니다.
        for (let j = i + 1; j < nodeList.length; j++) {
          if (nodeList[j].depth < d) {
            break; // 상위 단계로 깊이가 감소하면 탐색 대상 부모 영역이 종결된 것으로 취급합니다.
          }
          if (nodeList[j].depth === d) {
            hasActiveSibling = true;
            break;
          }
        }
        prefix += hasActiveSibling ? '│   ' : '    ';
      }
      
      // 현재 탐색 노드가 속한 계층 그룹의 마지막 자식 요소인지 검증합니다.
      let isLastChild = true;
      for (let j = i + 1; j < nodeList.length; j++) {
        if (nodeList[j].depth < node.depth) {
          break; // 상위 레벨로 이관되면 탐색 범위를 즉시 중단합니다.
        }
        if (nodeList[j].depth === node.depth) {
          isLastChild = false;
          break;
        }
      }
      
      const connector = isLastChild ? '└── ' : '├── ';
      result += prefix + connector + node.name + '\n';
    }
    return result;
  };

  // 노드 배열의 상태 변화가 감지될 때마다 아스키 텍스트 미리보기 결과를 실시간 갱신합니다.
  useEffect(() => {
    console.log("[FolderTreeModal] nodes 상태 변경 감지 - 트리 프리뷰 데이터 동기화");
    const text = generateTreeText(nodes);
    setPreviewText(text);
  }, [nodes]);

  // 새로운 파일/폴더 요소를 노드 리스트 중간 또는 마지막에 추가하는 공통 핸들러
  const handleAddNode = (index) => {
    console.log("[FolderTreeModal] 노드 추가 요청 접수 - 기준 타겟 인덱스:", index);
    const parentDepth = index >= 0 ? nodes[index].depth : 0;
    const newNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: 'new_item',
      type: 'file',
      depth: parentDepth
    };

    const updated = [...nodes];
    updated.splice(index + 1, 0, newNode);
    
    const finalized = normalizeDepths(updated);
    setNodes(finalized);
  };

  // 특정 위치의 노드 항목을 목록에서 안전하게 제외하는 핸들러
  const handleDeleteNode = (index) => {
    console.log("[FolderTreeModal] 노드 삭제 요청 접수 - 인덱스:", index);
    if (nodes.length <= 1) {
      console.log("[FolderTreeModal] 최하 1개 노드 유지 조건으로 삭제 연산을 차단합니다.");
      return;
    }
    const updated = nodes.filter((_, idx) => idx !== index);
    const finalized = normalizeDepths(updated);
    setNodes(finalized);
  };

  // 개별 노드의 깊이를 1단계 우측으로 들여쓰기하는 연산 핸들러 (Tab 대체 동작)
  const handleIndent = (index) => {
    console.log("[FolderTreeModal] 들여쓰기(Indent) 연산 요청 - 인덱스:", index);
    if (index === 0) return; // 최상단 노드는 들여쓰기를 전면 차단합니다.

    const updated = [...nodes];
    const maxPossibleDepth = updated[index - 1].depth + 1;
    if (updated[index].depth < maxPossibleDepth) {
      updated[index].depth += 1;
      const finalized = normalizeDepths(updated);
      setNodes(finalized);
    }
  };

  // 개별 노드의 깊이를 1단계 좌측으로 내어쓰기하는 연산 핸들러 (Shift+Tab 대체 동작)
  const handleOutdent = (index) => {
    console.log("[FolderTreeModal] 내어쓰기(Outdent) 연산 요청 - 인덱스:", index);
    if (updatedNodeDepthIsZero(index)) return;

    const updated = [...nodes];
    updated[index].depth = Math.max(0, updated[index].depth - 1);
    const finalized = normalizeDepths(updated);
    setNodes(finalized);
  };

  const updatedNodeDepthIsZero = (index) => {
    return nodes[index].depth === 0;
  };

  // 특정 행 노드를 목록 내 상단으로 1칸 위로 맞바꾸는 이동 연산 핸들러
  const handleMoveUp = (index) => {
    console.log("[FolderTreeModal] 노드 위로 이동 요청 - 인덱스:", index);
    if (index === 0) return;

    const updated = [...nodes];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;

    const finalized = normalizeDepths(updated);
    setNodes(finalized);
  };

  // 특정 행 노드를 목록 내 하단으로 1칸 아래로 맞바꾸는 이동 연산 핸들러
  const handleMoveDown = (index) => {
    console.log("[FolderTreeModal] 노드 아래로 이동 요청 - 인덱스:", index);
    if (index === nodes.length - 1) return;

    const updated = [...nodes];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;

    const finalized = normalizeDepths(updated);
    setNodes(finalized);
  };

  // 특정 노드의 폴더 ↔ 파일 아이콘 유형을 교차 스위칭하는 핸들러
  const handleToggleType = (index) => {
    console.log("[FolderTreeModal] 노드 타입 토글 요청 - 인덱스:", index);
    const updated = [...nodes];
    updated[index].type = updated[index].type === 'folder' ? 'file' : 'folder';
    setNodes(updated);
  };

  // 인풋박스 내 텍스트 이름 입력 값을 실시간 상태에 연동하는 체결 핸들러
  const handleNameChange = (index, value) => {
    console.log(`[FolderTreeModal] 노드 이름 수정 - 인덱스: ${index}, 새이름: ${value}`);
    const updated = [...nodes];
    updated[index].name = value;
    setNodes(updated);
  };

  // 마크다운 백틱 코드 블록 형식으로 래핑하여 에디터 커서 본문에 최종 삽입하는 결제 연동부
  const handleInsertSubmit = () => {
    console.log("[FolderTreeModal] 최종 ASCII 트리 텍스트 빌드 및 에디터 본문 삽입 절차 진입");
    const formattedCodeBlock = `\`\`\`text\n${previewText}\`\`\`\n`;
    onInsert(formattedCodeBlock);
    onClose();
  };

  return (
    <div className="folder-tree-modal-backdrop" onClick={onClose}>
      <div className="folder-tree-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="folder-tree-modal-header">
          <h3>폴더 트리 작성기 (v1.0)</h3>
          <button className="close-x-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="folder-tree-modal-body">
          {/* 좌측 패널: 시각적 트리 계층 제어 편집 패널 */}
          <div className="editor-panel">
            <div className="panel-title-label">트리 구조 편집</div>
            <div className="nodes-list-container">
              {nodes.map((node, idx) => (
                <div 
                  key={node.id} 
                  className="node-item-row"
                  style={{ paddingLeft: `${node.depth * 16}px` }}
                >
                  <div className="node-drag-and-type-controls">
                    <button 
                      className="type-toggle-btn" 
                      onClick={() => handleToggleType(idx)} 
                      title={node.type === 'folder' ? '파일로 전환' : '폴더로 전환'}
                    >
                      {node.type === 'folder' ? (
                        <Folder size={16} className="node-icon folder-type" />
                      ) : (
                        <File size={16} className="node-icon file-type" />
                      )}
                    </button>
                  </div>

                  <input
                    type="text"
                    className="node-name-input"
                    value={node.name}
                    onChange={(e) => handleNameChange(idx, e.target.value)}
                    placeholder="이름 입력"
                  />

                  <div className="node-action-btn-group">
                    <button onClick={() => handleIndent(idx)} disabled={idx === 0} title="들여쓰기"><ChevronRight size={14} /></button>
                    <button onClick={() => handleOutdent(idx)} disabled={node.depth === 0} title="내어쓰기"><ChevronLeft size={14} /></button>
                    <button onClick={() => handleMoveUp(idx)} disabled={idx === 0} title="위로 이동"><ArrowUp size={14} /></button>
                    <button onClick={() => handleMoveDown(idx)} disabled={idx === nodes.length - 1} title="아래로 이동"><ArrowDown size={14} /></button>
                    <button onClick={() => handleAddNode(idx)} title="하단에 항목 추가"><Plus size={14} /></button>
                    <button 
                      className="delete-item-btn" 
                      onClick={() => handleDeleteNode(idx)} 
                      disabled={nodes.length <= 1} 
                      title="삭제"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="add-root-node-btn" onClick={() => handleAddNode(nodes.length - 1)}>
              <Plus size={16} style={{ marginRight: '4px' }} /> 최종 하단에 노드 추가
            </button>
          </div>

          {/* 우측 패널: 실시간 생성 텍스트 실시간 프리뷰 */}
          <div className="preview-panel">
            <div className="panel-title-label">출력 마크다운 프리뷰</div>
            <pre className="ascii-tree-preview-box">
              {previewText}
            </pre>
          </div>
        </div>

        <div className="folder-tree-modal-footer">
          <button className="cancel-btn" onClick={onClose}>취소</button>
          <button className="submit-btn" onClick={handleInsertSubmit}>에디터에 삽입</button>
        </div>
      </div>
    </div>
  );
}

export default FolderTreeModal;