// src/components/preview/DiffViewer.jsx v1.0
/*
 * 파일 위치: src/components/preview/DiffViewer.jsx
 * 파일 설명: 현재 작업 중인 코드와 탐색기 내의 다른 파일을 좌우로 분할하여 변경점(Diff)을 시각적으로 보여주는 뷰어입니다.
 * 연결 위치: src/App.jsx (viewMode === 'diff' 일 때 렌더링)
 */
import React, { useState, useEffect } from 'react';
import { GitCompare, FileOutput } from 'lucide-react';
import { fetchTreeData, fetchFileContent } from '../../api/fileApi';
import { computeLineDiff } from '../../utils/editor/diffUtils';

function DiffViewer({ currentMarkdown, currentFile }) {
  const [fileList, setFileList] = useState([]);
  const [targetFile, setTargetFile] = useState('');
  const [targetContent, setTargetContent] = useState('');
  const [diffResult, setDiffResult] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 워크스페이스 내의 모든 파일 목록을 재귀적으로 추출합니다.
  const extractFiles = (node, path = '') => {
    let files = [];
    if (node.isFolder) {
      node.children.forEach(child => {
        files = [...files, ...extractFiles(child, path ? `${path}/${node.name}` : node.name)];
      });
    } else {
      files.push(node.path);
    }
    return files;
  };

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const tree = await fetchTreeData();
        const extracted = extractFiles(tree);
        // 현재 열려있는 파일은 비교 대상 목록에서 제외
        setFileList(extracted.filter(f => f !== currentFile));
      } catch (error) {
        console.error("[DiffViewer v1.0] 파일 목록 로드 실패:", error);
      }
    };
    loadFiles();
  }, [currentFile]);

  // 대상 파일이 선택되면 내용을 불러옵니다.
  const handleTargetChange = async (e) => {
    const selectedPath = e.target.value;
    setTargetFile(selectedPath);
    if (!selectedPath) {
      setTargetContent('');
      return;
    }
    
    setIsLoading(true);
    try {
      const content = await fetchFileContent(selectedPath);
      // 바이너리(ArrayBuffer)가 아닌 텍스트 데이터만 허용
      if (typeof content === 'string') {
        setTargetContent(content);
      } else {
        setTargetContent('바이너리 파일은 비교할 수 없습니다.');
      }
    } catch (error) {
      setTargetContent(`에러 발생: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 내용이 변경될 때마다 Diff를 재연산합니다.
  useEffect(() => {
    if (targetFile) {
      const diff = computeLineDiff(targetContent, currentMarkdown);
      setDiffResult(diff);
    } else {
      setDiffResult([]);
    }
  }, [targetContent, currentMarkdown, targetFile]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', flex: 1, backgroundColor: 'var(--bg-main, #ffffff)', overflow: 'hidden' }}>
      
      {/* 뷰어 상단 컨트롤 바 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: '1px solid var(--border-color, #d0d7de)', backgroundColor: 'var(--explorer-bg, #f6f8fa)' }}>
        <GitCompare size={20} color="#57606a" />
        <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--text-main, #24292f)' }}>분할 비교 뷰어 (Diff)</h3>
        
        <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--border-color, #d0d7de)', margin: '0 8px' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <FileOutput size={16} color="#0969da" />
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main, #24292f)' }}>비교 원본:</span>
          <select 
            value={targetFile} 
            onChange={handleTargetChange}
            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color, #d0d7de)', fontSize: '13px', minWidth: '200px', backgroundColor: 'var(--bg-main, #ffffff)', color: 'var(--text-main, #24292f)', outline: 'none' }}
          >
            <option value="">대상을 선택하세요...</option>
            {fileList.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          {isLoading && <span style={{ fontSize: '12px', color: '#8c959f' }}>로딩 중...</span>}
        </div>
      </div>

      {/* 좌우 분할 패널 */}
      <div style={{ display: 'flex', flex: 1, overflowY: 'auto' }}>
        
        {/* 좌측 패널 (원본/삭제된 항목) */}
        <div style={{ flex: 1, borderRight: '1px solid var(--border-color, #d0d7de)', overflowX: 'auto', backgroundColor: 'var(--bg-main, #ffffff)' }}>
          <div style={{ padding: '8px 16px', backgroundColor: '#f6f8fa', borderBottom: '1px solid #d0d7de', fontSize: '12px', fontWeight: 'bold', color: '#57606a', position: 'sticky', top: 0, zIndex: 1 }}>
            {targetFile || '선택된 파일 없음'} (Original)
          </div>
          <div style={{ padding: '16px', fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Consolas, monospace', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre' }}>
            {!targetFile ? (
              <span style={{ color: '#8c959f' }}>위 드롭다운에서 비교할 원본 파일을 선택해 주세요.</span>
            ) : (
              diffResult.map((line, idx) => {
                const isRemoved = line.type === 'removed';
                const isAdded = line.type === 'added';
                return (
                  <div key={`left-${idx}`} style={{ 
                    display: 'flex',
                    backgroundColor: isRemoved ? 'rgba(255, 129, 130, 0.2)' : 'transparent',
                    textDecoration: isRemoved ? 'line-through' : 'none',
                    color: isRemoved ? '#cf222e' : 'var(--text-main, #24292f)',
                    minHeight: '1.6em' // 우측 패널 추가 항목과의 줄 높이 동기화
                  }}>
                    <span style={{ width: '24px', flexShrink: 0, userSelect: 'none', color: '#8c959f', textAlign: 'right', paddingRight: '8px' }}>
                      {isAdded ? '' : '-'}
                    </span>
                    <span>{isAdded ? '' : line.oldLine}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 우측 패널 (현재 파일/추가된 항목) */}
        <div style={{ flex: 1, overflowX: 'auto', backgroundColor: 'var(--bg-main, #ffffff)' }}>
          <div style={{ padding: '8px 16px', backgroundColor: '#f6f8fa', borderBottom: '1px solid #d0d7de', fontSize: '12px', fontWeight: 'bold', color: '#57606a', position: 'sticky', top: 0, zIndex: 1 }}>
            {currentFile || 'Current Edit'} (Modified)
          </div>
          <div style={{ padding: '16px', fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Consolas, monospace', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre' }}>
            {!targetFile ? (
              <span style={{ color: '#8c959f' }}>대상을 선택하면 현재 파일과의 변경점이 표시됩니다.</span>
            ) : (
              diffResult.map((line, idx) => {
                const isRemoved = line.type === 'removed';
                const isAdded = line.type === 'added';
                return (
                  <div key={`right-${idx}`} style={{ 
                    display: 'flex',
                    backgroundColor: isAdded ? 'rgba(46, 160, 67, 0.2)' : 'transparent',
                    color: isAdded ? '#1a7f37' : 'var(--text-main, #24292f)',
                    minHeight: '1.6em' // 좌측 패널 삭제 항목과의 줄 높이 동기화
                  }}>
                    <span style={{ width: '24px', flexShrink: 0, userSelect: 'none', color: '#8c959f', textAlign: 'right', paddingRight: '8px' }}>
                      {isRemoved ? '' : '+'}
                    </span>
                    <span>{isRemoved ? '' : line.newLine}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default DiffViewer;