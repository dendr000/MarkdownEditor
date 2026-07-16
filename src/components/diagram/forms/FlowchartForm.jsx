// src/components/diagram/forms/FlowchartForm.jsx v1.0
/*
 * 파일 설명: 순서도(Flowchart) 전용 GUI 입력 폼 컴포넌트입니다. 미리보기에서 활성화(클릭)된 노드를 감지하여 시각적으로 하이라이트 처리합니다.
 * 연결 위치: src/components/diagram/DiagramModal.jsx
 */
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

function FlowchartForm({ flowOrientation, setFlowOrientation, flowSteps, handleAddFlowStep, handleRemoveFlowStep, handleUpdateFlowStep, activeNodeId }) {
  console.log("FlowchartForm 컴포넌트 렌더링. 활성 노드 ID:", activeNodeId);
  return (
    <div className="gui-form-group">
      <label className="gui-label">진행 방향</label>
      <select 
        className="template-select" 
        value={flowOrientation} 
        onChange={(e) => { console.log("순서도 진행 방향 변경:", e.target.value); setFlowOrientation(e.target.value); }}
      >
        <option value="TD">위에서 아래로 (Top-Down)</option>
        <option value="LR">왼쪽에서 오른쪽으로 (Left-Right)</option>
      </select>

      <div className="fields-header-row" style={{ marginTop: '16px' }}>
        <span className="sub-title-label">연결 단계 목록</span>
        <button className="add-row-action-btn" onClick={handleAddFlowStep}>
          <Plus size={12} /> 추가
        </button>
      </div>

      <div className="gui-items-list">
        {flowSteps.map((step) => {
          // 현재 렌더링 중인 카드의 출발지(from) 또는 목적지(to)가 미리보기에서 클릭한 노드 ID와 일치하면 하이라이트 클래스를 부여합니다.
          const isHighlighted = step.from === activeNodeId || step.to === activeNodeId;
          return (
            <div key={step.id} className={`gui-flow-step-card ${isHighlighted ? 'highlighted' : ''}`}>
              <div className="flow-card-row">
                <input 
                  type="text" 
                  className="gui-input-text inline-input font-mono" 
                  value={step.from} 
                  placeholder="ID"
                  onChange={(e) => handleUpdateFlowStep(step.id, 'from', e.target.value)} 
                />
                <input 
                  type="text" 
                  className="gui-input-text inline-input" 
                  value={step.fromText} 
                  placeholder="표시명"
                  onChange={(e) => handleUpdateFlowStep(step.id, 'fromText', e.target.value)} 
                />
              </div>
              <div className="flow-card-arrow-row">
                <select 
                  className="template-select arrow-select" 
                  value={step.arrow}
                  onChange={(e) => handleUpdateFlowStep(step.id, 'arrow', e.target.value)}
                >
                  <option value="-->">일반 화살표 (--&gt;)</option>
                  <option value="---">연결선 (---)</option>
                  <option value="-..->">점선 화살표 (-..-&gt;)</option>
                </select>
              </div>
              <div className="flow-card-row">
                <input 
                  type="text" 
                  className="gui-input-text inline-input font-mono" 
                  value={step.to} 
                  placeholder="ID"
                  onChange={(e) => handleUpdateFlowStep(step.id, 'to', e.target.value)} 
                />
                <input 
                  type="text" 
                  className="gui-input-text inline-input" 
                  value={step.toText} 
                  placeholder="표시명"
                  onChange={(e) => handleUpdateFlowStep(step.id, 'toText', e.target.value)} 
                />
                <button 
                  className="gui-delete-row-btn"
                  onClick={() => handleRemoveFlowStep(step.id)}
                  disabled={flowSteps.length <= 1}
                  title="단계 삭제"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FlowchartForm;