// src/components/explorer/ExplorerTreeNode.jsx v2.0
/*
 * 파일 설명: 탐색기의 개별 폴더/파일 노드를 렌더링하는 메인 컴포넌트입니다.
 * (v2.0 수정사항): 파일 라인 수 200줄 초과 방지를 위해 유틸리티(상대 경로 연산)와 하위 UI(툴팁, 액션 버튼)를 분리 모듈화했습니다.
 * 연결 위치: src/components/explorer/FileExplorer.jsx 내부
 */
import React, { useState, useEffect, useRef } from 'react';
import { Folder, FolderOpen, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { createFileOrFolder, deleteFileOrFolder, renameTarget } from '../../api/fileApi';
import { getRelativePath } from '../../utils/pathUtils';
import NodeTooltip from './NodeTooltip';
import NodeActions from './NodeActions';

function ExplorerTreeNode({ node, onSelect, onRefresh, selectedFile, activeTooltipNode, onTooltipOpen, onTooltipClose }) {
  console.log(`[ExplorerTreeNode v2.0] 노드 렌더링 - 경로: ${node.path}`);
  const [isOpen, setIsOpen] = useState(false);
  const nodeRef = useRef(null);

  useEffect(() => {
    if (node.isFolder && selectedFile && selectedFile.startsWith(node.path + '/')) {
      setIsOpen(true);
    }
  }, [selectedFile, node.path, node.isFolder]);

  const isSelected = selectedFile === node.path;

  useEffect(() => {
    if (isSelected && nodeRef.current) {
      nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isSelected]);

  const relativePath = (selectedFile && node.path !== selectedFile) 
    ? getRelativePath(selectedFile, node.path) 
    : '';
  
  const isTooltipVisible = activeTooltipNode === node.path && relativePath !== '';

  const handleAdd = async (isFolder) => {
    const name = window.prompt(`새 ${isFolder ? '폴더' : '파일'} 이름을 입력하세요.\n(파일은 .md 또는 .txt 확장자 권장)`);
    if (!name) return;
    const ext = !isFolder && !name.includes('.') ? '.md' : '';
    const newPath = node.path ? `${node.path}/${name}${ext}` : `${name}${ext}`;
    console.log(`[ExplorerTreeNode v2.0] 신규 생성 요청 - 경로: ${newPath}`);
    await createFileOrFolder(newPath, isFolder);
    setIsOpen(true);
    onRefresh();
  };

  const handleDelete = async () => {
    if (window.confirm(`'${node.name}'을(를) 정말 삭제하시겠습니까?`)) {
      console.log(`[ExplorerTreeNode v2.0] 삭제 요청 - 경로: ${node.path}`);
      await deleteFileOrFolder(node.path);
      onRefresh();
    }
  };

  const handleRename = async () => {
    const newName = window.prompt('새 이름을 입력하세요:', node.name);
    if (!newName || newName === node.name) return;
    const basePath = node.path.substring(0, node.path.lastIndexOf('/'));
    const newPath = basePath ? `${basePath}/${newName}` : newName;
    console.log(`[ExplorerTreeNode v2.0] 이름 변경 요청 - 기존: ${node.path}, 변경: ${newPath}`);
    await renameTarget(node.path, newPath);
    onRefresh();
  };

  return (
    <div style={{ marginLeft: node.path ? '12px' : '0' }}>
      <div 
        ref={nodeRef}
        style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          padding: '4px 6px', borderRadius: '4px', cursor: 'pointer', transition: 'background 0.1s',
          position: 'relative', zIndex: isTooltipVisible ? 50 : 1,
          backgroundColor: isSelected ? 'var(--border-color, #d0d7de)' : 'transparent',
          fontWeight: isSelected ? '600' : 'normal'
        }}
        onMouseEnter={(e) => { 
          e.currentTarget.style.backgroundColor = isSelected ? 'var(--border-color, #d0d7de)' : 'rgba(140, 149, 159, 0.15)'; 
          if (relativePath) onTooltipOpen(node.path); 
        }}
        onMouseLeave={(e) => { 
          e.currentTarget.style.backgroundColor = isSelected ? 'var(--border-color, #d0d7de)' : 'transparent'; 
          if (relativePath) onTooltipClose();
        }}
      >
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, overflow: 'hidden' }}
          onClick={() => {
            if (node.isFolder) { setIsOpen(!isOpen); onSelect(node.path || ''); } 
            else { onSelect(node.path); }
          }}
          onMouseDown={(e) => { if (e.button === 1) e.preventDefault(); }}
          onMouseUp={(e) => {
            if (e.button === 1) {
              e.preventDefault();
              window.open(`${window.location.pathname}?file=${encodeURIComponent(node.path || '')}`, '_blank');
            }
          }}
        >
          {node.isFolder ? (
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted, #57606a)' }}>
              <div 
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                style={{ display: 'flex', alignItems: 'center', padding: '2px', marginLeft: '-2px', borderRadius: '4px' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-color, #d0d7de)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title="폴더 열기/닫기"
              >
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
              {isOpen ? <FolderOpen size={14} color="#0969da" style={{ marginLeft: '2px' }} /> : <Folder size={14} color="#0969da" style={{ marginLeft: '2px' }} />}
            </div>
          ) : (
            <FileText size={14} color="var(--text-muted, #57606a)" style={{ marginLeft: '18px' }} />
          )}
          <span style={{ fontSize: '13px', color: 'var(--text-main, #24292f)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {node.name}
          </span>
        </div>

        {isTooltipVisible && (
          <NodeTooltip 
            relativePath={relativePath} 
            nodePath={node.path} 
            onTooltipOpen={onTooltipOpen} 
            onTooltipClose={onTooltipClose} 
          />
        )}

        {node.path && (
          <NodeActions 
            isFolder={node.isFolder} 
            onAdd={handleAdd} 
            onRename={handleRename} 
            onDelete={handleDelete} 
          />
        )}
      </div>
      
      {isOpen && node.children && (
        <div>
          {node.children.map(child => (
            <ExplorerTreeNode 
              key={child.path} 
              node={child} 
              onSelect={onSelect} 
              onRefresh={onRefresh} 
              selectedFile={selectedFile}
              activeTooltipNode={activeTooltipNode}
              onTooltipOpen={onTooltipOpen}
              onTooltipClose={onTooltipClose}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ExplorerTreeNode;