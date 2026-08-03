// src/components/editor/toolbar/GlobalSearchModal.jsx v1.0
/*
 * 파일 위치: src/components/editor/toolbar/GlobalSearchModal.jsx
 * 파일 설명: 워크스페이스 내의 모든 파일을 대상으로 문자열을 검색하고 일괄 변경할 수 있는 전역 검색 UI 모달입니다.
 * 연결 위치: src/components/editor/Editor.jsx
 */
import React, { useState } from 'react';
import { X, Search, FileCode, CheckSquare, Square, Regex, ReplaceAll } from 'lucide-react';
import { globalSearch, globalReplace } from '../../../api/fileApi';

function GlobalSearchModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [useRegex, setUseRegex] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setErrorMsg('');
    setResults([]);
    try {
      console.log("[GlobalSearchModal v1.0] 전역 검색 실행");
      const res = await globalSearch(searchQuery, useRegex, matchCase);
      setResults(res.results || []);
      if (res.results.length === 0) {
        setErrorMsg('검색 결과가 없습니다.');
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplaceAll = async () => {
    if (!searchQuery.trim()) return;
    if (!window.confirm('경고: 일괄 치환은 되돌릴 수 없습니다.\n워크스페이스의 모든 일치 항목을 정말 치환하시겠습니까?')) return;
    
    setIsLoading(true);
    setErrorMsg('');
    try {
      console.log("[GlobalSearchModal v1.0] 전역 일괄 치환 실행");
      const res = await globalReplace(searchQuery, replaceQuery, useRegex, matchCase);
      alert(`성공: 총 ${res.results.length}개의 파일이 치환 및 갱신되었습니다.`);
      setResults([]); // 치환 완료 후 목록 초기화
      onClose(); // 완료 후 모달 닫기
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const CheckboxToggle = ({ label, checked, setChecked, icon: Icon }) => (
    <div 
      style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', userSelect: 'none', fontSize: '13px', color: checked ? '#0969da' : '#57606a' }} 
      onClick={() => setChecked(!checked)}
    >
      {checked ? <CheckSquare size={16} /> : <Square size={16} />}
      <Icon size={14} />
      <span>{label}</span>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '600px', maxHeight: '80vh', backgroundColor: '#ffffff', borderRadius: '8px', display: 'flex', flexDirection: 'column', boxShadow: '0 12px 28px rgba(0,0,0,0.2)' }}>
        
        <div className="modal-header" style={{ padding: '16px', borderBottom: '1px solid #d0d7de', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '16px', color: '#24292f', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={18} /> 전역 검색 및 치환 (Global Search)
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#57606a' }}><X size={20} /></button>
        </div>

        <div className="modal-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="검색할 문자열 또는 정규식..." 
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #d0d7de', borderRadius: '6px', fontSize: '14px', outline: 'none' }} 
              />
              <button onClick={handleSearch} disabled={isLoading} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 16px', backgroundColor: '#0969da', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                <Search size={16} /> 검색
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                value={replaceQuery} 
                onChange={(e) => setReplaceQuery(e.target.value)} 
                placeholder="치환할 문자열 (비워두면 삭제)..." 
                style={{ flex: 1, padding: '8px 12px', border: '1px solid #d0d7de', borderRadius: '6px', fontSize: '14px', outline: 'none' }} 
              />
              <button onClick={handleReplaceAll} disabled={isLoading || results.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 16px', backgroundColor: results.length === 0 ? '#8c959f' : '#cf222e', color: 'white', border: 'none', borderRadius: '6px', cursor: results.length === 0 ? 'not-allowed' : 'pointer', fontWeight: '600' }}>
                <ReplaceAll size={16} /> 일괄 치환
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
            <CheckboxToggle label="정규식(Regex) 사용" checked={useRegex} setChecked={setUseRegex} icon={Regex} />
            <CheckboxToggle label="대소문자 구분" checked={matchCase} setChecked={setMatchCase} icon={FileCode} />
          </div>

          {errorMsg && <div style={{ padding: '12px', backgroundColor: '#ffebe9', color: '#cf222e', borderRadius: '6px', fontSize: '13px' }}>{errorMsg}</div>}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f6f8fa', borderTop: '1px solid #d0d7de', padding: '0 16px' }}>
          {isLoading && <div style={{ padding: '24px', textAlign: 'center', color: '#57606a' }}>스캔 중입니다...</div>}
          
          {!isLoading && results.length > 0 && (
            <div style={{ padding: '16px 0' }}>
              <div style={{ marginBottom: '12px', fontSize: '13px', fontWeight: '600', color: '#57606a' }}>
                총 {results.length}개의 파일에서 일치 항목 발견
              </div>
              
              {results.map((fileRes, i) => (
                <div key={i} style={{ marginBottom: '16px', backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ padding: '8px 12px', backgroundColor: '#f3f4f6', borderBottom: '1px solid #d0d7de', fontSize: '13px', fontWeight: '600', color: '#24292f' }}>
                    📄 {fileRes.path}
                  </div>
                  <div style={{ padding: '8px 0', maxHeight: '150px', overflowY: 'auto' }}>
                    {fileRes.matches.map((match, j) => (
                      <div key={j} style={{ display: 'flex', gap: '12px', padding: '4px 12px', fontSize: '12px', fontFamily: 'monospace' }}>
                        <span style={{ color: '#8c959f', userSelect: 'none', width: '30px', textAlign: 'right' }}>{match.lineIndex}</span>
                        <span style={{ color: '#24292f', wordBreak: 'break-all' }}>{match.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default GlobalSearchModal;