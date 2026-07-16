// src/components/diagram/forms/FlowchartForm.jsx v3.0
/*
 * 파일 설명: 순서도(Flowchart) GUI 입력 폼 컴포넌트입니다.
 * 모달 크기 확장에 맞춰 사용자가 연결 흐름을 한눈에 파악할 수 있도록 [출발] -> [연결] -> [도착]의 3단 시각적 블록 레이아웃으로 전면 개편되었습니다.
 * 연결 위치: src/components/diagram/DiagramModal.jsx
 */
import React from 'react';
import { Plus, Trash2, ArrowDown } from 'lucide-react';

function FlowchartForm({ flowOrientation, setFlowOrientation, flowSteps, handleAddFlowStep, handleRemoveFlowStep, handleUpdateFlowStep, activeNodeId }) {
  console.log("FlowchartForm 컴포넌트(v3.0) 렌더링. 활성 노드 ID:", activeNodeId);

  // 다각형 형태별 라벨링 매핑 데이터 (12종 지원)
  const SHAPE_OPTIONS = [
    { val: '[]', label: '[ ] 사각형' },
    { val: '()', label: '( ) 둥근 사각형' },
    { val: '[()]', label: '[( )] 원기둥 (DB)' },
    { val: '(())', label: '(( )) 원형' },
    { val: '>]', label: '> ] 비대칭 깃발' },
    { val: '{}', label: '{ } 마름모 (분기)' },
    { val: '{{}}', label: '{{ }} 육각형' },
    { val: '[//]', label: '[/ /] 평행사변형 우측' },
    { val: '[\\\\]', label: '[\\ \\] 평행사변형 좌측' },
    { val: '[/\\\\]', label: '[/ \\] 사다리꼴 상단' },
    { val: '[\\\\/]', label: '[\\ /] 사다리꼴 하단' },
    { val: '((()))', label: '((( ))) 겹원형' }
  ];

  return (
    <div className="gui-form-group">
      <label className="gui-label">전체 진행 방향 (Orientation)</label>
      <select 
        className="template-select" 
        value={flowOrientation} 
        onChange={(e) => { 
          console.log("순서도 진행 방향 변경 이벤트 발생:", e.target.value); 
          setFlowOrientation(e.target.value); 
        }}
      >
        <option value="TD">위에서 아래로 (Top-Down)</option>
        <option value="BT">아래에서 위로 (Bottom-Top)</option>
        <option value="LR">왼쪽에서 오른쪽으로 (Left-Right)</option>
        <option value="RL">오른쪽에서 왼쪽으로 (Right-Left)</option>
      </select>

      <div className="fields-header-row" style={{ marginTop: '20px', marginBottom: '12px' }}>
        <span className="sub-title-label">연결 흐름 제어 (Nodes & Edges)</span>
        <button className="add-row-action-btn" onClick={() => {
          console.log("순서도 신규 연결 흐름 추가 버튼 클릭");
          handleAddFlowStep();
        }}>
          <Plus size={14} style={{ marginRight: '4px' }} /> 새 흐름 추가
        </button>
      </div>

      <div className="gui-items-list">
        {flowSteps.map((step) => {
          // 실시간 뷰어에서 특정 노드를 클릭했을 때 폼을 하이라이트 처리하기 위한 논리 판별
          const isHighlighted = step.from === activeNodeId || step.to === activeNodeId;
          
          return (
            <div key={step.id} className={`gui-flow-step-card ${isHighlighted ? 'highlighted' : ''}`}>
              
              {/* 1단: 출발 노드 (From) 영역 */}
              <div className="flow-node-box">
                <span className="node-badge from-badge">출발</span>
                <input 
                  type="text" 
                  className="gui-input-text font-mono" 
                  style={{ width: '90px' }}
                  value={step.from} 
                  placeholder="ID (예: A)"
                  onChange={(e) => {
                    console.log(`출발 노드 ID 변경 [${step.id}]:`, e.target.value);
                    handleUpdateFlowStep(step.id, 'from', e.target.value.replace(/\s+/g, '_'));
                  }} 
                />
                <select 
                  className="template-select" 
                  style={{ width: '150px' }}
                  value={step.fromShape}
                  onChange={(e) => {
                    console.log(`출발 노드 도형 변경 [${step.id}]:`, e.target.value);
                    handleUpdateFlowStep(step.id, 'fromShape', e.target.value);
                  }}
                >
                  {SHAPE_OPTIONS.map(opt => <option key={opt.val} value={opt.val}>{opt.label}</option>)}
                </select>
                <input 
                  type="text" 
                  className="gui-input-text inline-input" 
                  value={step.fromText} 
                  placeholder="노드 안에 표시될 텍스트"
                  onChange={(e) => {
                    console.log(`출발 노드 텍스트 변경 [${step.id}]:`, e.target.value);
                    handleUpdateFlowStep(step.id, 'fromText', e.target.value);
                  }} 
                />
              </div>

              {/* 2단: 화살표 및 연결선 (Arrow) 영역 */}
              <div className="flow-arrow-box">
                <ArrowDown size={16} className="arrow-icon-decorator" />
                <select 
                  className="template-select arrow-select" 
                  style={{ width: '160px' }}
                  value={step.arrow}
                  onChange={(e) => {
                    console.log(`화살표 타입 변경 [${step.id}]:`, e.target.value);
                    handleUpdateFlowStep(step.id, 'arrow', e.target.value);
                  }}
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
                  placeholder="화살표 중앙 텍스트 (생략 가능)"
                  onChange={(e) => {
                    console.log(`화살표 텍스트 변경 [${step.id}]:`, e.target.value);
                    handleUpdateFlowStep(step.id, 'arrowText', e.target.value);
                  }} 
                />
              </div>

              {/* 3단: 도착 노드 (To) 영역 */}
              <div className="flow-node-box">
                <span className="node-badge to-badge">도착</span>
                <input 
                  type="text" 
                  className="gui-input-text font-mono" 
                  style={{ width: '90px' }}
                  value={step.to} 
                  placeholder="ID (예: B)"
                  onChange={(e) => {
                    console.log(`도착 노드 ID 변경 [${step.id}]:`, e.target.value);
                    handleUpdateFlowStep(step.id, 'to', e.target.value.replace(/\s+/g, '_'));
                  }} 
                />
                <select 
                  className="template-select" 
                  style={{ width: '150px' }}
                  value={step.toShape}
                  onChange={(e) => {
                    console.log(`도착 노드 도형 변경 [${step.id}]:`, e.target.value);
                    handleUpdateFlowStep(step.id, 'toShape', e.target.value);
                  }}
                >
                  {SHAPE_OPTIONS.map(opt => <option key={opt.val} value={opt.val}>{opt.label}</option>)}
                </select>
                <input 
                  type="text" 
                  className="gui-input-text inline-input" 
                  value={step.toText} 
                  placeholder="노드 안에 표시될 텍스트"
                  onChange={(e) => {
                    console.log(`도착 노드 텍스트 변경 [${step.id}]:`, e.target.value);
                    handleUpdateFlowStep(step.id, 'toText', e.target.value);
                  }} 
                />
                
                {/* 행 삭제 버튼 */}
                <button 
                  className="gui-delete-row-btn"
                  style={{ marginLeft: '4px' }}
                  onClick={() => {
                    console.log(`흐름 단계 삭제 요청 [${step.id}]`);
                    handleRemoveFlowStep(step.id);
                  }}
                  disabled={flowSteps.length <= 1}
                  title="이 연결 흐름 삭제"
                >
                  <Trash2 size={16} />
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