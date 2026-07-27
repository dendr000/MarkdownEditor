// src/components/Header.jsx v2.7
/*
 * 파일 위치: src/components/Header.jsx
 * 연결 위치: src/App.jsx 내부에서 최상단 네비게이션 바로 렌더링됨
 * 기능 요약: 앱 상단의 헤더 컴포넌트로, 뷰 모드 제어, 스크롤/탐색기 설정, 복사 기능 및 브레드크럼(경로) 네비게이션을 제공합니다.
 * (v2.7 수정사항): 어두운 헤더 배경색과 동일하게 설정되어 보이지 않던 브레드크럼 텍스트 색상을 흰색(#ffffff)과 밝은 회색(#8c959f)으로 수정했습니다.
 */
import React, { useState } from 'react';
import { PanelLeft, Columns, PanelRight, FolderTree, Settings, Server, Database } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';
import './Header.css';

function Header({ 
  markdown, viewMode, setViewMode, isExplorerOpen, setIsExplorerOpen, 
  selectedFile, isSyncScroll, setIsSyncScroll, isExplorerAutoClose, 
  setIsExplorerAutoClose, onBreadcrumbClick, storageMode, onStorageModeChange 
}) {
  const [copied, setCopied] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleCopy = async () => {
    console.log("[Header v2.7] 전체 마크다운 복사 이벤트 호출");
    const success = await copyToClipboard(markdown);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="header">
      {/* 좌측: 탐색기 토글, 깃허브 로고 및 브레드크럼 경로 */}
      <div className="header-left">
        <button 
          className={`header-icon-btn ${isExplorerOpen ? 'active' : ''}`}
          onClick={() => {
            console.log(`[Header v2.7] 탐색기 토글 클릭 (현재 상태: ${isExplorerOpen})`);
            setIsExplorerOpen(!isExplorerOpen);
          }}
          title="파일 탐색기 열기/닫기"
        >
          <FolderTree size={18} />
        </button>
        <svg height="24" viewBox="0 0 16 16" width="24" fill="currentColor" style={{ marginLeft: '8px' }}>
          <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
        </svg>
        
        {selectedFile && (
          <div className="header-file-path" style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap' }}>
            {selectedFile.split('/').map((part, index, arr) => {
              const path = arr.slice(0, index + 1).join('/');
              const isLast = index === arr.length - 1;
              return (
                <React.Fragment key={path}>
                  <span 
                    onClick={() => {
                      console.log(`[Header v2.7] 브레드크럼 클릭 감지: 타겟 경로 = ${path}`);
                      if (onBreadcrumbClick) onBreadcrumbClick(path);
                    }}
                    style={{ 
                      cursor: 'pointer', 
                      color: isLast ? '#ffffff' : '#8c959f', // [핵심 수정] 어두운 배경에 맞게 텍스트 색상 변경
                      fontWeight: isLast ? '600' : 'normal',
                      transition: 'color 0.2s' 
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.textDecoration = 'underline';
                      e.target.style.color = '#58a6ff'; // [수정] 호버 색상도 어두운 배경에 잘 보이는 밝은 파란색으로 변경
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.textDecoration = 'none';
                      e.target.style.color = isLast ? '#ffffff' : '#8c959f'; // [핵심 수정] 마우스 아웃 시 색상 복구
                    }}
                    title={`'${path}' 위치로 이동`}
                  >
                    {part}
                  </span>
                  {!isLast && <span style={{ margin: '0 4px', color: '#8c959f', userSelect: 'none' }}>/</span>}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
      
      {/* 중앙: 뷰 모드 컨트롤 */}
      <div className="header-center">
        <div className="view-mode-group">
          <button 
            className={`view-btn ${viewMode === 'preview' ? 'active' : ''}`} 
            onClick={() => {
              console.log("[Header v2.7] 뷰 모드 변경: preview");
              setViewMode('preview');
            }} 
            title="실시간 뷰어 단독 보기"
          >
            <PanelLeft size={16} />
          </button>
          <button 
            className={`view-btn ${viewMode === 'split' ? 'active' : ''}`} 
            onClick={() => {
              console.log("[Header v2.7] 뷰 모드 변경: split");
              setViewMode('split');
            }} 
            title="양면 분할 보기"
          >
            <Columns size={16} />
          </button>
          <button 
            className={`view-btn ${viewMode === 'editor' ? 'active' : ''}`} 
            onClick={() => {
              console.log("[Header v2.7] 뷰 모드 변경: editor");
              setViewMode('editor');
            }} 
            title="에디터 단독 보기"
          >
            <PanelRight size={16} />
          </button>
        </div>
      </div>
      
      {/* 우측: 스토리지 전환, 복사 버튼 및 설정 드롭다운 */}
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        
        {/* 스토리지 모드 스위치 (SVG 아이콘 단독) */}
        {onStorageModeChange && (
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#161b22', borderRadius: '6px', padding: '3px', border: '1px solid #30363d', marginRight: '4px' }}>
            <button
              onClick={() => onStorageModeChange('SERVER')}
              style={{
                padding: '4px 6px', border: 'none', borderRadius: '4px', cursor: 'pointer',
                backgroundColor: storageMode === 'SERVER' ? '#2da44e' : 'transparent',
                color: storageMode === 'SERVER' ? '#ffffff' : '#8c959f',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
              }}
              title="로컬 PC 연동 모드: 실제 디스크의 파일 시스템과 동기화합니다."
            >
              <Server size={15} />
            </button>
            <button
              onClick={() => onStorageModeChange('BROWSER')}
              style={{
                padding: '4px 6px', border: 'none', borderRadius: '4px', cursor: 'pointer',
                backgroundColor: storageMode === 'BROWSER' ? '#0969da' : 'transparent',
                color: storageMode === 'BROWSER' ? '#ffffff' : '#8c959f',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
              }}
              title="브라우저 DB 모드: 로컬 서버 통신 없이 브라우저 내장 가상 파일 시스템(VFS)을 사용합니다."
            >
              <Database size={15} />
            </button>
          </div>
        )}

        <button className="copy-btn" onClick={handleCopy} title="전체 마크다운 복사">
          {copied ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2da44e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          )}
        </button>

        {/* 설정 메뉴 그룹 */}
        <div style={{ position: 'relative' }} onMouseLeave={() => {
          if (isSettingsOpen) {
            console.log("[Header v2.7] 마우스 아웃: 설정 메뉴 닫힘");
            setIsSettingsOpen(false);
          }
        }}>
          <button 
            className={`view-btn ${isSettingsOpen ? 'active' : ''}`} 
            onClick={() => {
              console.log(`[Header v2.7] 설정 메뉴 토글 클릭 (현재 상태: ${isSettingsOpen})`);
              setIsSettingsOpen(!isSettingsOpen);
            }} 
            title="에디터 환경 설정"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Settings size={16} />
          </button>
          
          {isSettingsOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              paddingTop: '4px',
              zIndex: 1000,
              minWidth: '200px'
            }}>
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d0d7de',
                borderRadius: '6px',
                boxShadow: '0 8px 24px rgba(140,149,159,0.2)',
                padding: '8px 12px'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#24292f', cursor: 'pointer', marginBottom: '8px' }}>
                  <input 
                    type="checkbox" 
                    checked={isSyncScroll} 
                    onChange={(e) => {
                      console.log(`[Header v2.7] 양면 스크롤 동기화 설정 변경: ${e.target.checked}`);
                      setIsSyncScroll(e.target.checked);
                    }} 
                    style={{ cursor: 'pointer' }}
                  />
                  양면 스크롤 동기화
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#24292f', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={isExplorerAutoClose} 
                    onChange={(e) => {
                      console.log(`[Header v2.7] 외부 클릭 시 탐색기 닫기 설정 변경: ${e.target.checked}`);
                      setIsExplorerAutoClose(e.target.checked);
                    }} 
                    style={{ cursor: 'pointer' }}
                  />
                  외부 클릭 시 탐색기 닫기
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;