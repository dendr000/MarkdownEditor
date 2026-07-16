// src/components/diagram/forms/SequenceForm.jsx v1.0
/*
 * 파일 설명: 시퀀스 다이어그램(Sequence Diagram) 전용 GUI 입력 폼 컴포넌트입니다.
 * 참여자(Actor/Participant) 선언과 메시지 송수신(화살표, 텍스트, 활성화) 규격을 지원합니다.
 * 연결 위치: src/components/diagram/DiagramModal.jsx
 */
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

function SequenceForm({ 
  seqParticipants, setSeqParticipants, handleAddSeqParticipant, handleRemoveSeqParticipant, handleUpdateSeqParticipant,
  seqMessages, setSeqMessages, handleAddSeqMessage, handleRemoveSeqMessage, handleUpdateSeqMessage 
}) {
  console.log("SequenceForm 컴포넌트 렌더링 - 시퀀스 다이어그램 폼 마운트");

  // 현재 선언된 참여자들의 이름 목록 (메시지 발신/수신자 선택용)
  const participantNames = seqParticipants.map(p => p.name).filter(name => name.trim() !== '');

  return (
    <div className="gui-form-group">
      
      {/* 1. 참여자(Participants) 설정 영역 */}
      <div className="fields-header-row">
        <span className="sub-title-label">참여자 (Participants / Actors)</span>
        <button className="add-row-action-btn" onClick={handleAddSeqParticipant}>
          <Plus size={12} /> 추가
        </button>
      </div>

      <div className="gui-items-list" style={{ marginBottom: '24px' }}>
        {seqParticipants.map((p) => (
          <div key={p.id} className="gui-item-row" style={{ backgroundColor: '#f6f8fa', padding: '8px', borderRadius: '6px', border: '1px solid #d0d7de' }}>
            <select 
              className="template-select" 
              style={{ width: '120px' }}
              value={p.type}
              onChange={(e) => handleUpdateSeqParticipant(p.id, 'type', e.target.value)}
            >
              <option value="participant">Participant</option>
              <option value="actor">Actor (사람)</option>
            </select>
            <input 
              type="text" 
              className="gui-input-text inline-input" 
              value={p.name} 
              placeholder="식별용 ID (예: A)"
              onChange={(e) => handleUpdateSeqParticipant(p.id, 'name', e.target.value.replace(/\s+/g, '_'))} 
            />
            <span className="input-separator">as</span>
            <input 
              type="text" 
              className="gui-input-text inline-input" 
              value={p.alias} 
              placeholder="출력 별칭 (선택)"
              onChange={(e) => handleUpdateSeqParticipant(p.id, 'alias', e.target.value)} 
            />
            <button 
              className="gui-delete-row-btn"
              onClick={() => handleRemoveSeqParticipant(p.id)}
              disabled={seqParticipants.length <= 1}
              title="참여자 삭제"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* 2. 메시지(Messages) 설정 영역 */}
      <div className="fields-header-row">
        <span className="sub-title-label">메시지 흐름 (Messages)</span>
        <button className="add-row-action-btn" onClick={handleAddSeqMessage}>
          <Plus size={12} /> 추가
        </button>
      </div>

      <div className="gui-items-list">
        {seqMessages.map((msg) => (
          <div key={msg.id} className="gui-flow-step-card">
            
            {/* 발신자 및 수신자 화살표 설정 */}
            <div className="flow-card-row">
              <select 
                className="template-select inline-input" 
                value={msg.from}
                onChange={(e) => handleUpdateSeqMessage(msg.id, 'from', e.target.value)}
              >
                <option value="">발신자 선택</option>
                {participantNames.map(name => <option key={name} value={name}>{name}</option>)}
              </select>

              <select 
                className="template-select" 
                style={{ width: '180px', textAlign: 'center' }}
                value={msg.arrow}
                onChange={(e) => handleUpdateSeqMessage(msg.id, 'arrow', e.target.value)}
              >
                <option value="->">실선 (-&gt;)</option>
                <option value="-->">점선 (--&gt;)</option>
                <option value="->>">실선+채운화살촉 (-&gt;&gt;)</option>
                <option value="-->>">점선+채운화살촉 (--&gt;&gt;)</option>
                <option value="-x">실선+X (-x)</option>
                <option value="--x">점선+X (--x)</option>
                <option value="-)">실선+비동기 (-))</option>
                <option value="--)">점선+비동기 (--))</option>
              </select>

              <select 
                className="template-select inline-input" 
                value={msg.to}
                onChange={(e) => handleUpdateSeqMessage(msg.id, 'to', e.target.value)}
              >
                <option value="">수신자 선택</option>
                {participantNames.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>

            {/* 메시지 텍스트 및 활성화 옵션 */}
            <div className="flow-card-row" style={{ alignItems: 'center', marginTop: '4px' }}>
              <input 
                type="text" 
                className="gui-input-text inline-input" 
                value={msg.text} 
                placeholder="전달할 메시지 텍스트"
                onChange={(e) => handleUpdateSeqMessage(msg.id, 'text', e.target.value)} 
              />
              
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#57606a', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <input 
                  type="checkbox" 
                  checked={msg.isActivate}
                  onChange={(e) => handleUpdateSeqMessage(msg.id, 'isActivate', e.target.checked)}
                  style={{ marginRight: '4px' }}
                />
                수신자 활성화(+)
              </label>

              <button 
                className="gui-delete-row-btn"
                onClick={() => handleRemoveSeqMessage(msg.id)}
                disabled={seqMessages.length <= 1}
                title="메시지 삭제"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default SequenceForm;