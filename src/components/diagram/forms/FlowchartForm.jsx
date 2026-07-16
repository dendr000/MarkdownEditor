// src/components/diagram/forms/FlowchartForm.jsx v5.0
/*
 * 파일 설명: 순서도(Flowchart) GUI 폼 컴포넌트입니다. 상단 컨트롤 바(새 흐름 추가 버튼 포함)를 Sticky로 고정하여 스크롤 피로도를 줄였습니다.
 * 연결 위치: src/components/diagram/DiagramModal.jsx
 */
import React from 'react';
import { Plus, Trash2, ArrowDown } from 'lucide-react';

const ShapeIconViewer = ({ shape }) => {
  const getSvgPath = () => {
    switch(shape) {
      case '()': return <rect width="18" height="12" x="3" y="6" rx="6" stroke="currentColor" fill="none" strokeWidth="1.5" />;
      case '[()]': return <><path d="M4 8c0-2 16-2 16 0v8c0 2-16 2-16 0V8z" stroke="currentColor" fill="none" strokeWidth="1.5"/><ellipse cx="12" cy="8" rx="8" ry="2" stroke="currentColor" fill="none" strokeWidth="1.5"/></>;
      case '(())': return <circle cx="12" cy="12" r="7" stroke="currentColor" fill="none" strokeWidth="1.5" />;
      case '>]': return <path d="M4 5h12l4 7-4 7H4V5z" stroke="currentColor" fill="none" strokeWidth="1.5" />;
      case '{}': return <polygon points="12,4 20,12 12,20 4,12" stroke="currentColor" fill="none" strokeWidth="1.5" />;
      case '{{}}': return <polygon points="8,4 16,4 20,12 16,20 8,20 4,12" stroke="currentColor" fill="none" strokeWidth="1.5" />;
      case '[//]': return <polygon points="6,20 18,20 22,4 10,4" stroke="currentColor" fill="none" strokeWidth="1.5" />;
      case '[\\\\]': return <polygon points="10,20 22,20 18,4 6,4" stroke="currentColor" fill="none" strokeWidth="1.5" />;
      case '[/\\\\]': return <polygon points="6,20 18,20 22,4 2,4" stroke="currentColor" fill="none" strokeWidth="1.5" />;
      case '[\\\\/]': return <polygon points="2,20 22,20 18,4 6,4" stroke="currentColor" fill="none" strokeWidth="1.5" />;
      case '((()))': return <><circle cx="12" cy="12" r="7" stroke="currentColor" fill="none" strokeWidth="1.5" /><circle cx="12" cy="12" r="4" stroke="currentColor" fill="none" strokeWidth="1.5" /></>;
      case '[]':
      default: return <rect width="18" height="12" x="3" y="6" rx="2" stroke="currentColor" fill="none" strokeWidth="1.5" />;
    }
  };

  return (
    <div className="shape-icon-viewer" title="현재 선택된 도형 모양">
      <svg width="24" height="24" viewBox="0 0 24 24">
        {getSvgPath()}
      </svg>
    </div>
  );
};

function FlowchartForm({ flowOrientation, setFlowOrientation, flowSteps, handleAddFlowStep, handleRemoveFlowStep, handleUpdateFlowStep, activeNodeId }) {
  
  const SHAPE_OPTIONS = [
    { val: '[]', label: '사각형' },
    { val: '()', label: '둥근 사각형' },
    { val: '[()]', label: '원기둥 (DB)' },
    { val: '(())', label: '원형' },
    { val: '>]', label: '비대칭 깃발' },
    { val: '{}', label: '마름모 (분기)' },
    { val: '{{}}', label: '육각형' },
    { val: '[//]', label: '평행사변형 (우)' },
    { val: '[\\\\]', label: '평행사변형 (좌)' },
    { val: '[/\\\\]', label: '사다리꼴 (상)' },
    { val: '[\\\\/]', label: '사다리꼴 (하)' },
    { val: '((()))', label: '겹원형' }
  ];

  return (
    <div className="gui-form-group">
      
      {/* 상단 고정 제어부 */}
      <div className="flowchart-sticky-header">
        <label className="gui-label">전체 진행 방향 (Orientation)</label>
        <select 
          className="template-select" 
          value={flowOrientation} 
          onChange={(e) => setFlowOrientation(e.target.value)}
        >
          <option value="TD">위에서 아래로 (Top-Down)</option>
          <option value="BT">아래에서 위로 (Bottom-Top)</option>
          <option value="LR">왼쪽에서 오른쪽으로 (Left-Right)</option>
          <option value="RL">오른쪽에서 왼쪽으로 (Right-Left)</option>
        </select>

        <div className="fields-header-row" style={{ marginTop: '16px', marginBottom: '4px' }}>
          <span className="sub-title-label">연결 흐름 제어 (Nodes & Edges)</span>
          <button className="add-row-action-btn" onClick={handleAddFlowStep}>
            <Plus size={14} style={{ marginRight: '4px' }} /> 새 흐름 추가
          </button>
        </div>
      </div>

      {/* 개별 연결 단계 목록 (스크롤 영역) */}
      <div className="gui-items-list">
        {flowSteps.map((step) => {
          const isHighlighted = step.from === activeNodeId || step.to === activeNodeId;
          
          return (
            <div key={step.id} className={`gui-flow-step-card ${isHighlighted ? 'highlighted' : ''}`}>
              
              {/* 1단: 출발 노드 (From) */}
              <div className="flow-node-box">
                <div className="flow-node-box-header">
                  <span className="node-badge from-badge">출발</span>
                  <input 
                    type="text" 
                    className="gui-input-text font-mono" 
                    style={{ width: '80px', padding: '4px 8px' }}
                    value={step.from} 
                    placeholder="ID (A)"
                    onChange={(e) => handleUpdateFlowStep(step.id, 'from', e.target.value.replace(/\s+/g, '_'))} 
                  />
                  <div className="shape-select-wrapper">
                    <ShapeIconViewer shape={step.fromShape} />
                    <select 
                      className="template-select" 
                      style={{ width: '130px' }}
                      value={step.fromShape}
                      onChange={(e) => handleUpdateFlowStep(step.id, 'fromShape', e.target.value)}
                    >
                      {SHAPE_OPTIONS.map(opt => <option key={opt.val} value={opt.val}>{opt.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flow-node-box-body">
                  <input 
                    type="text" 
                    className="gui-input-text" 
                    value={step.fromText} 
                    placeholder="노드 제목 (강조)"
                    onChange={(e) => handleUpdateFlowStep(step.id, 'fromText', e.target.value)} 
                  />
                  <input 
                    type="text" 
                    className="gui-input-text sub-desc-input" 
                    value={step.fromDesc} 
                    placeholder="보조 텍스트 설명 (선택 사항)"
                    onChange={(e) => handleUpdateFlowStep(step.id, 'fromDesc', e.target.value)} 
                  />
                </div>
              </div>

              {/* 2단: 화살표 (Arrow) */}
              <div className="flow-arrow-box">
                <ArrowDown size={16} className="arrow-icon-decorator" />
                <select 
                  className="template-select arrow-select" 
                  style={{ width: '160px' }}
                  value={step.arrow}
                  onChange={(e) => handleUpdateFlowStep(step.id, 'arrow', e.target.value)}
                >
                  <option value="-->">일반 화살표 (--&gt;)</option>
                  <option value="--->">긴 화살표 (---&gt;)</option>
                  <option value="---">실선 연결 (---)</option>
                  <option value="-.->">점선 화살표 (-.-&gt;)</option>
                  <option value="-.-">점선 연결 (-.-)</option>
                  <option value="==>">굵은 화살표 (==&gt;)</option>
                  <option value="--o">원형 끝 (--o)</option>
                  <option value="--x">X 표 끝 (--x)</option>
                  <option value="~~~">투명선 (~~~)</option>
                </select>
                <input 
                  type="text" 
                  className="gui-input-text inline-input" 
                  value={step.arrowText} 
                  placeholder="화살표 텍스트 (선택)"
                  onChange={(e) => handleUpdateFlowStep(step.id, 'arrowText', e.target.value)} 
                />
              </div>

              {/* 3단: 도착 노드 (To) */}
              <div className="flow-node-box">
                <div className="flow-node-box-header">
                  <span className="node-badge to-badge">도착</span>
                  <input 
                    type="text" 
                    className="gui-input-text font-mono" 
                    style={{ width: '80px', padding: '4px 8px' }}
                    value={step.to} 
                    placeholder="ID (B)"
                    onChange={(e) => handleUpdateFlowStep(step.id, 'to', e.target.value.replace(/\s+/g, '_'))} 
                  />
                  <div className="shape-select-wrapper">
                    <ShapeIconViewer shape={step.toShape} />
                    <select 
                      className="template-select" 
                      style={{ width: '130px' }}
                      value={step.toShape}
                      onChange={(e) => handleUpdateFlowStep(step.id, 'toShape', e.target.value)}
                    >
                      {SHAPE_OPTIONS.map(opt => <option key={opt.val} value={opt.val}>{opt.label}</option>)}
                    </select>
                  </div>
                  
                  <button 
                    className="gui-delete-row-btn"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => handleRemoveFlowStep(step.id)}
                    disabled={flowSteps.length <= 1}
                    title="이 연결 흐름 삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flow-node-box-body">
                  <input 
                    type="text" 
                    className="gui-input-text" 
                    value={step.toText} 
                    placeholder="노드 제목 (강조)"
                    onChange={(e) => handleUpdateFlowStep(step.id, 'toText', e.target.value)} 
                  />
                  <input 
                    type="text" 
                    className="gui-input-text sub-desc-input" 
                    value={step.toDesc} 
                    placeholder="보조 텍스트 설명 (선택 사항)"
                    onChange={(e) => handleUpdateFlowStep(step.id, 'toDesc', e.target.value)} 
                  />
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FlowchartForm;