// src/components/Header.jsx v6.3
/*
 * 파일 위치: src/components/Header.jsx
 * 연결 위치: src/App.jsx 내부에서 최상단 네비게이션 바로 렌더링됨
 * 기능 요약: 앱 상단의 헤더 컴포넌트로, 뷰 모드 제어, 스크롤 설정 및 테마 스위치 팝업 등을 제공합니다. (배포를 위해 콘솔 로그 출력 기능이 제거되었습니다.)
 * (v6.3 수정사항): 고스트 클릭 통과 토글 스위치가 설정 팝업에 추가되었습니다.
 */
import React, { useState } from 'react';
import { PanelLeft, Columns, PanelRight, Settings } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';
import './Header.css';

function Header({ 
  markdown, viewMode, setViewMode, isExplorerOpen, setIsExplorerOpen, 
  selectedFile, isSyncScroll, setIsSyncScroll, isExplorerAutoClose, 
  setIsExplorerAutoClose, onBreadcrumbClick, theme, setTheme,
  explorerOpacity, setExplorerOpacity, isGhostModeClickThrough, setIsGhostModeClickThrough
}) {
  const [copied, setCopied] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(markdown);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="24" height="24" style={{ marginLeft: '0' }}>
          <rect x="15" y="15" width="70" height="70" rx="12" fill="#ffffff" stroke="#d0d7de" strokeWidth="6" />
          <rect x="15" y="15" width="25" height="70" rx="12" fill="#24292f" />
          <circle cx="27" cy="30" r="4" fill="#ffffff" />
          <circle cx="27" cy="50" r="4" fill="#ffffff" />
          <circle cx="27" cy="70" r="4" fill="#ffffff" />
          <path d="M 50 35 L 60 45 L 75 30" stroke="#0969da" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <line x1="50" y1="60" x2="75" y2="60" stroke="#8c959f" strokeWidth="6" strokeLinecap="round" />
          <line x1="50" y1="70" x2="65" y2="70" stroke="#8c959f" strokeWidth="6" strokeLinecap="round" />
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
                      if (onBreadcrumbClick) onBreadcrumbClick(path);
                    }}
                    style={{ 
                      cursor: 'pointer', 
                      color: isLast ? '#ffffff' : '#8c959f', 
                      fontWeight: isLast ? '600' : 'normal',
                      transition: 'color 0.2s' 
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.textDecoration = 'underline';
                      e.target.style.color = '#58a6ff'; 
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.textDecoration = 'none';
                      e.target.style.color = isLast ? '#ffffff' : '#8c959f'; 
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
      
      <div className="header-center">
        <div className="view-mode-group">
          <button className={`view-btn ${viewMode === 'preview' ? 'active' : ''}`} onClick={() => { setViewMode('preview'); }} title="실시간 뷰어 단독 보기"><PanelLeft size={16} /></button>
          <button className={`view-btn ${viewMode === 'split' ? 'active' : ''}`} onClick={() => { setViewMode('split'); }} title="양면 분할 보기"><Columns size={16} /></button>
          <button className={`view-btn ${viewMode === 'editor' ? 'active' : ''}`} onClick={() => { setViewMode('editor'); }} title="에디터 단독 보기"><PanelRight size={16} /></button>
        </div>
      </div>
      
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button className="copy-btn" onClick={handleCopy} title="전체 마크다운 복사">
          {copied ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2da44e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>}
        </button>

        <div style={{ position: 'relative' }} onMouseLeave={() => { if (isSettingsOpen) { setIsSettingsOpen(false); } }}>
          <button className={`view-btn ${isSettingsOpen ? 'active' : ''}`} onClick={() => { setIsSettingsOpen(!isSettingsOpen); }} title="에디터 환경 설정" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Settings size={16} /></button>
          
          {isSettingsOpen && (
            <div style={{ position: 'absolute', top: '100%', right: 0, paddingTop: '4px', zIndex: 1000, minWidth: '240px' }}>
              <div style={{ backgroundColor: 'var(--bg-main, #ffffff)', border: '1px solid var(--border-color, #d0d7de)', borderRadius: '6px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', padding: '12px' }}>
                
                <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color, #d0d7de)' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main, #24292f)', marginBottom: '8px' }}>
                    <span>탐색기 배경 투명도</span>
                    <span style={{ color: '#0969da' }}>{Math.round(explorerOpacity * 100)}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="1.0" 
                    step="0.1" 
                    value={explorerOpacity} 
                    onChange={(e) => setExplorerOpacity(parseFloat(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', marginBottom: '12px' }}
                  />
                  
                  {/* [신규] 고스트 클릭 통과 토글 옵션 (투명도가 100%일 때는 비활성화) */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: explorerOpacity < 1 ? 'var(--text-main, #24292f)' : 'var(--text-muted, #8c959f)', cursor: explorerOpacity < 1 ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' }}>
                    <input 
                      type="checkbox" 
                      checked={isGhostModeClickThrough} 
                      onChange={(e) => setIsGhostModeClickThrough(e.target.checked)} 
                      disabled={explorerOpacity === 1}
                      style={{ cursor: explorerOpacity < 1 ? 'pointer' : 'not-allowed' }} 
                    />
                    투명 모드 시 클릭 통과 (Ghost Click)
                  </label>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-main, #24292f)', cursor: 'pointer', marginBottom: '12px', whiteSpace: 'nowrap' }}>
                  <input type="checkbox" checked={theme === 'dark'} onChange={(e) => {
                    const newTheme = e.target.checked ? 'dark' : 'light';
                    setTheme(newTheme);
                  }} style={{ cursor: 'pointer' }} />
                  다크 테마 (Dark Mode)
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-main, #24292f)', cursor: 'pointer', marginBottom: '12px', whiteSpace: 'nowrap' }}>
                  <input type="checkbox" checked={isSyncScroll} onChange={(e) => { setIsSyncScroll(e.target.checked); }} style={{ cursor: 'pointer' }} />
                  양면 스크롤 동기화
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-main, #24292f)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <input type="checkbox" checked={isExplorerAutoClose} onChange={(e) => { setIsExplorerAutoClose(e.target.checked); }} style={{ cursor: 'pointer' }} />
                  외부 클릭 시 탐색기 자동 닫기
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