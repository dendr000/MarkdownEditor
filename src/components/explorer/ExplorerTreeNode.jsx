// src/components/explorer/ExplorerTreeNode.jsx v1.2
/*
 * 파일 설명: 탐색기의 개별 폴더/파일 노드를 렌더링하는 컴포넌트입니다.
 * (v1.2 수정사항): 툴팁과 항목 사이의 데드존(Dead Zone)을 투명 패딩으로 메우고, 활성화된 노드의 z-index를 올려 마우스 호버가 끊기는 현상을 해결했습니다.
 * 연결 위치: src/components/explorer/FileExplorer.jsx 내부
 */
import React, { useState } from 'react';
import { Folder, FolderOpen, FileText, FilePlus, FolderPlus, Trash2, Edit2, ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';
import { createFileOrFolder, deleteFileOrFolder, renameTarget } from '../../api/fileApi';

// 상대 경로 계산 유틸리티
const getRelativePath = (currentPath, targetPath) => {
  if (!currentPath || !targetPath) return '';
  const currentParts = currentPath.split('/');
  currentParts.pop(); 
  const targetParts = targetPath.split('/');

  let commonLength = 0;
  while (commonLength < currentParts.length && commonLength < targetParts.length && currentParts[commonLength] === targetParts[commonLength]) {
    commonLength++;
  }

  const upCount = currentParts.length - commonLength;
  const upString = upCount > 0 ? '../'.repeat(upCount) : './';
  const downString = targetParts.slice(commonLength).join('/');

  return upString + downString;
};

function ExplorerTreeNode({ node, onSelect, onRefresh, selectedFile, activeTooltipNode, onTooltipOpen, onTooltipClose }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const relativePath = (!node.isFolder && selectedFile && node.path !== selectedFile) 
    ? getRelativePath(selectedFile, node.path) 
    : '';
  
  // 부모 상태 구독: 현재 노드와 활성화된 노드 ID가 일치할 때만 툴팁 표시
  const isTooltipVisible = activeTooltipNode === node.path && relativePath !== '';

  const handleCopy = (e) => {
    e.stopPropagation();
    if (relativePath) {
      navigator.clipboard.writeText(relativePath).then(() => {
        console.log(`[ExplorerTreeNode v1.2] 상대 경로 복사 완료: ${relativePath}`);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  const handleAdd = async (isFolder) => {
    const name = window.prompt(`새 ${isFolder ? '폴더' : '파일'} 이름을 입력하세요.\n(파일은 .md 또는 .txt 확장자 권장)`);
    if (!name) return;
    const ext = !isFolder && !name.includes('.') ? '.md' : '';
    const newPath = node.path ? `${node.path}/${name}${ext}` : `${name}${ext}`;
    console.log(`[ExplorerTreeNode v1.2] 신규 ${isFolder ? '폴더' : '파일'} 생성 요청 - 경로: ${newPath}`);
    await createFileOrFolder(newPath, isFolder);
    setIsOpen(true);
    onRefresh();
  };

  const handleDelete = async () => {
    if (window.confirm(`'${node.name}'을(를) 정말 삭제하시겠습니까?`)) {
      console.log(`[ExplorerTreeNode v1.2] 삭제 요청 - 경로: ${node.path}`);
      await deleteFileOrFolder(node.path);
      onRefresh();
    }
  };

  const handleRename = async () => {
    const newName = window.prompt('새 이름을 입력하세요:', node.name);
    if (!newName || newName === node.name) return;
    const basePath = node.path.substring(0, node.path.lastIndexOf('/'));
    const newPath = basePath ? `${basePath}/${newName}` : newName;
    console.log(`[ExplorerTreeNode v1.2] 이름 변경 요청 - 기존: ${node.path}, 변경: ${newPath}`);
    await renameTarget(node.path, newPath);
    onRefresh();
  };

  return (
    <div style={{ marginLeft: node.path ? '12px' : '0' }}>
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '4px 6px', 
          borderRadius: '4px', 
          cursor: 'pointer', 
          transition: 'background 0.1s',
          position: 'relative',
          // [신규] 툴팁이 활성화된 행의 z-index를 높여 아래 파일에 툴팁이 가려지는 현상 방지
          zIndex: isTooltipVisible ? 50 : 1 
        }}
        onMouseEnter={(e) => { 
          e.currentTarget.style.backgroundColor = '#e1e4e8'; 
          if (relativePath) onTooltipOpen(node.path); 
        }}
        onMouseLeave={(e) => { 
          e.currentTarget.style.backgroundColor = 'transparent'; 
          if (relativePath) onTooltipClose();
        }}
      >
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, overflow: 'hidden' }}
          onClick={() => {
            if (node.isFolder) {
              setIsOpen(!isOpen);
              onSelect(node.path || ''); 
            } else {
              onSelect(node.path);
            }
          }}
        >
          {node.isFolder ? (
            <div style={{ display: 'flex', alignItems: 'center', color: '#57606a' }}>
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              {isOpen ? <FolderOpen size={14} color="#0969da" style={{ marginLeft: '4px' }} /> : <Folder size={14} color="#0969da" style={{ marginLeft: '4px' }} />}
            </div>
          ) : (
            <FileText size={14} color="#57606a" style={{ marginLeft: '18px' }} />
          )}
          <span style={{ fontSize: '13px', color: '#24292f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {node.name}
          </span>
        </div>

        {isTooltipVisible && (
          // [신규] 마우스 이동 시 데드존(Dead Zone)을 막기 위해 겉 래퍼(Wrapper)에 투명한 paddingTop을 적용하여 다리를 놓음
          <div 
            style={{
              position: 'absolute',
              top: '100%',
              left: '10%',
              paddingTop: '4px', 
              zIndex: 1000
            }}
            onMouseEnter={() => onTooltipOpen(node.path)} 
            onMouseLeave={onTooltipClose}
            onClick={(e) => e.stopPropagation()} 
          >
            <div style={{
              backgroundColor: '#24292f',
              color: '#ffffff',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              border: '1px solid #57606a'
            }}>
              <span>{relativePath}</span>
              <button 
                onClick={handleCopy}
                title="상대 경로 복사"
                style={{
                  background: 'none',
                  border: 'none',
                  color: isCopied ? '#2da44e' : '#8c959f',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s'
                }}
              >
                {isCopied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        )}

        {node.path && (
          <div style={{ display: 'flex', gap: '4px', opacity: 0.7 }}>
            {node.isFolder && (
              <>
                <FilePlus size={14} color="#2da44e" onClick={(e) => { e.stopPropagation(); handleAdd(false); }} title="파일 추가" />
                <FolderPlus size={14} color="#0969da" onClick={(e) => { e.stopPropagation(); handleAdd(true); }} title="폴더 추가" />
              </>
            )}
            <Edit2 size={14} color="#57606a" onClick={(e) => { e.stopPropagation(); handleRename(); }} title="이름 변경" />
            <Trash2 size={14} color="#cf222e" onClick={(e) => { e.stopPropagation(); handleDelete(); }} title="삭제" />
          </div>
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