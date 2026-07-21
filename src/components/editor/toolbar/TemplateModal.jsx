// src/components/editor/toolbar/TemplateModal.jsx v2.0
/*
 * 파일 설명: 로컬 스토리지에 저장된 마크다운 템플릿 목록을 조회하고, 에디터에 삽입하거나 새로운 템플릿을 생성/수정/삭제할 수 있는 종합 관리 모달 UI입니다.
 * (v2.0 수정사항): 미리보기 정렬 버그 패치(textAlign: 'left'), 사용자의 커스텀 템플릿 CRUD 로직 탑재.
 * 연결 위치: src/components/editor/Editor.jsx 내부
 */
import React, { useState, useEffect } from 'react';
import { getTemplates, saveTemplate, updateTemplate, deleteTemplate } from '../../../utils/localDb';
import { Trash2, Plus, FileText, Save, Edit2, CornerDownLeft } from 'lucide-react';

function TemplateModal({ isOpen, onClose, onInsert }) {
  const [templates, setTemplates] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // 모달 상태: 조회(false) / 생성(isCreating: true) / 수정(isEditing: true)
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // 템플릿 입력 폼 전용 상태
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // 1. 모달 열릴 때 초기 데이터 로드 및 상태 리셋
  useEffect(() => {
    if (isOpen) {
      console.log("[TemplateModal v2.0] 모달 활성화 - 로컬 스토리지 DB 스캔");
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    const loaded = getTemplates();
    setTemplates(loaded);
    setSelectedIndex(0);
    setIsCreating(false);
    setIsEditing(false);
    setEditTitle('');
    setEditContent('');
  };

  if (!isOpen) return null;

  // 2. 상호작용 핸들러 그룹
  const handleSelect = (idx) => {
    setSelectedIndex(idx);
    setIsCreating(false);
    setIsEditing(false);
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setIsEditing(false);
    setEditTitle('');
    setEditContent('');
  };

  const handleStartEdit = () => {
    const activeTemplate = templates[selectedIndex];
    if (!activeTemplate?.isCustom) return; // 기본 템플릿은 수정 불가 가드

    setIsEditing(true);
    setIsCreating(false);
    setEditTitle(activeTemplate.title);
    setEditContent(activeTemplate.content);
  };

  const handleSaveSubmit = () => {
    if (!editContent.trim()) {
      alert("내용을 입력해 주세요.");
      return;
    }

    let updated;
    if (isCreating) {
      console.log("[TemplateModal v2.0] 신규 커스텀 템플릿 저장");
      updated = saveTemplate(editTitle, editContent);
    } else if (isEditing) {
      console.log("[TemplateModal v2.0] 기존 커스텀 템플릿 수정");
      updated = updateTemplate(templates[selectedIndex].id, editTitle, editContent);
    }

    setTemplates(updated);
    setIsCreating(false);
    setIsEditing(false);
    // 방금 조작한 템플릿으로 포커스
    const newIdx = isCreating ? updated.length - 1 : selectedIndex;
    setSelectedIndex(newIdx);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation(); // 리스트 클릭 이벤트 방지
    if (window.confirm("이 템플릿을 삭제하시겠습니까? 다시 복구할 수 없습니다.")) {
      console.log(`[TemplateModal v2.0] 템플릿 삭제 수행 - ID: ${id}`);
      const updated = deleteTemplate(id);
      setTemplates(updated);
      setSelectedIndex(0); // 0번째로 안전하게 강제 이동
      setIsEditing(false);
    }
  };

  const handleInsertSubmit = () => {
    // 편집 중이거나 생성 중일 때는 삽입 불가
    if (isCreating || isEditing || templates.length === 0) return;
    console.log("[TemplateModal v2.0] 선택된 템플릿 에디터 본문 삽입");
    const activeTemplate = templates[selectedIndex];
    // 템플릿 내용 앞뒤로 줄바꿈을 추가하여 기존 문단과 겹치지 않게 보호
    onInsert(`\n${activeTemplate.content}\n`);
    onClose();
  };

  const activeTemplate = templates[selectedIndex];
  const isFormMode = isCreating || isEditing;

  return (
    <div className="diagram-modal-backdrop" onClick={onClose} style={{ zIndex: 3000 }}>
      <div className="diagram-modal-content" style={{ width: '900px', height: '600px' }} onClick={(e) => e.stopPropagation()}>
        
        <div className="diagram-modal-header">
          <div className="header-title-section">
            <h3>템플릿 보관함 v2.0</h3>
          </div>
          <button className="close-x-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="diagram-modal-body" style={{ display: 'flex', height: 'calc(100% - 120px)' }}>
          
          {/* 좌측: 템플릿 목록 패널 */}
          <div className="diagram-editor-panel" style={{ width: '35%', padding: '20px', borderRight: '1px solid #d0d7de', overflowY: 'auto', backgroundColor: '#f6f8fa' }}>
            <div className="panel-title-label" style={{ marginBottom: '16px', fontWeight: 'bold', color: '#57606a', fontSize: '12px' }}>저장된 템플릿</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {templates.map((tpl, idx) => (
                <div 
                  key={tpl.id} 
                  onClick={() => handleSelect(idx)}
                  style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    padding: '12px', backgroundColor: (!isFormMode && selectedIndex === idx) ? '#e9f3fd' : '#ffffff', 
                    border: `1px solid ${(!isFormMode && selectedIndex === idx) ? '#0969da' : '#d0d7de'}`, 
                    borderRadius: '6px', cursor: 'pointer', transition: 'all 0.1s' 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <FileText size={16} color={(!isFormMode && selectedIndex === idx) ? '#0969da' : '#57606a'} />
                    <span style={{ fontSize: '13px', fontWeight: (!isFormMode && selectedIndex === idx) ? '600' : '400', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {tpl.title}
                    </span>
                  </div>
                  {/* 사용자가 추가한 커스텀 템플릿만 삭제 아이콘 표시 */}
                  {tpl.isCustom && (
                    <button onClick={(e) => handleDelete(e, tpl.id)} style={{ background: 'none', border: 'none', color: '#cf222e', cursor: 'pointer', padding: '4px' }} title="삭제">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button 
              onClick={handleStartCreate}
              style={{ width: '100%', marginTop: '16px', padding: '12px', backgroundColor: '#ffffff', border: '1px dashed #d0d7de', borderRadius: '6px', color: '#0969da', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Plus size={16} /> 새 커스텀 템플릿
            </button>
          </div>

          {/* 우측: 내용 프리뷰 또는 편집 폼 패널 */}
          <div className="diagram-preview-panel" style={{ width: '65%', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            {isFormMode ? (
              // 생성 또는 수정 모드 (입력 폼)
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="panel-title-label" style={{ fontWeight: 'bold', color: isCreating ? '#2da44e' : '#0969da', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isCreating ? <Plus size={16} /> : <Edit2 size={16} />}
                    <span>{isCreating ? '새 템플릿 만들기' : `템플릿 수정: ${editTitle}`}</span>
                  </div>
                  <button onClick={() => { setIsEditing(false); setIsCreating(false); }} style={{ background: 'none', border: 'none', color: '#57606a', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}>
                    취소
                  </button>
                </div>
                <input 
                  type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="템플릿 제목을 입력하세요"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d0d7de', borderRadius: '6px', fontSize: '14px', outline: 'none' }}
                />
                <textarea 
                  value={editContent} onChange={(e) => setEditContent(e.target.value)} placeholder="저장할 마크다운 내용을 작성하세요..."
                  style={{ width: '100%', flex: 1, padding: '12px', border: '1px solid #d0d7de', borderRadius: '6px', fontSize: '14px', outline: 'none', resize: 'none', fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}
                />
                <button 
                  onClick={handleSaveSubmit}
                  style={{ alignSelf: 'flex-end', padding: '10px 20px', backgroundColor: isCreating ? '#2da44e' : '#0969da', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Save size={16} /> {isCreating ? '저장 후 목록에 추가' : '수정 사항 저장'}
                </button>
              </div>
            ) : (
              // 내용 확인 및 삽입 모드 (프리뷰)
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="panel-title-label" style={{ fontWeight: 'bold', color: '#57606a', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{activeTemplate?.title}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {!activeTemplate?.isCustom && <span style={{ fontSize: '11px', backgroundColor: '#ddf4ff', color: '#0969da', padding: '2px 8px', borderRadius: '12px', fontWeight: 'normal' }}>기본 제공</span>}
                    {activeTemplate?.isCustom && (
                      <button onClick={handleStartEdit} style={{ background: 'none', border: 'none', color: '#0969da', cursor: 'pointer', fontSize: '12px', padding: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Edit2 size={13} /> 내용 수정
                      </button>
                    )}
                  </div>
                </div>
                {/* [핵심 패치] whiteSpace: 'pre' 및 textAlign: 'left' 강제 적용 */}
                <pre style={{ flex: 1, margin: 0, backgroundColor: '#f6f8fa', padding: '16px', borderRadius: '8px', border: '1px solid #d0d7de', overflowY: 'auto', color: '#24292f', fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre', textAlign: 'left' }}>
                  {activeTemplate?.content}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div className="diagram-modal-footer" style={{ padding: '16px 20px', borderTop: '1px solid #d0d7de', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#f6f8fa' }}>
          <button className="cancel-btn" onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #d0d7de', borderRadius: '6px', backgroundColor: '#ffffff', cursor: 'pointer' }}>닫기</button>
          {!isFormMode && templates.length > 0 && (
            <button className="submit-btn" onClick={handleInsertSubmit} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', backgroundColor: '#0969da', color: '#ffffff', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CornerDownLeft size={16} /> 에디터에 삽입
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TemplateModal;