// src/components/diagram/DiagramModal.jsx v6.0
/*
 * 파일 설명: 순서도 다이어그램 업그레이드 및 시퀀스 다이어그램 GUI 지원 기능이 반영된 통합 메인 모달입니다.
 * 연결 위치: src/components/editor/Editor.jsx 내부
 */
import React, { useState, useEffect } from 'react';
import { Edit2, Layout } from 'lucide-react';
import MermaidBlock from '../preview/MermaidBlock';
import GeoJsonBlock from '../preview/GeoJsonBlock';
import StlBlock from '../preview/StlBlock';
import PieChartForm from './forms/PieChartForm';
import FlowchartForm from './forms/FlowchartForm';
import SequenceForm from './forms/SequenceForm';
import GeoJsonForm from './forms/GeoJsonForm';
import StlForm from './forms/StlForm';
import './DiagramModal.css';

function DiagramModal({ isOpen, onClose, onInsert }) {
  console.log("DiagramModal 컴포넌트(v6.0) 렌더링 활성화 - 시퀀스 다이어그램 및 순서도 구조 고도화");

  if (!isOpen) return null;

  const [editMode, setEditMode] = useState('gui');
  const [diagramType, setDiagramType] = useState('mermaid_flow');
  const [rawCode, setRawCode] = useState('');
  const [activeNodeId, setActiveNodeId] = useState(null);

  // A. 원형 차트 데이터
  const [pieTitle, setPieTitle] = useState('프로젝트 언어 비중');
  const [pieItems, setPieItems] = useState([
    { id: 'pie-1', label: 'JavaScript', value: 65 },
    { id: 'pie-2', label: 'CSS', value: 20 },
    { id: 'pie-3', label: 'HTML', value: 15 }
  ]);

  // B. 순서도 데이터 (모양 및 화살표 텍스트 추가 지원)
  const [flowOrientation, setFlowOrientation] = useState('TD');
  const [flowSteps, setFlowSteps] = useState([
    { id: 'flow-1', from: 'A', fromShape: '[]', fromText: '시작', arrow: '-->', arrowText: '', to: 'B', toShape: '{}', toText: '조건 판별' },
    { id: 'flow-2', from: 'B', fromShape: '{}', fromText: '조건 판별', arrow: '-->', arrowText: 'Yes', to: 'C', toShape: '()', toText: '성공' },
    { id: 'flow-3', from: 'B', fromShape: '{}', fromText: '조건 판별', arrow: '-->', arrowText: 'No', to: 'D', toShape: '()', toText: '실패' }
  ]);

  // C. 시퀀스 다이어그램 데이터 (신규)
  const [seqParticipants, setSeqParticipants] = useState([
    { id: 'seq-p1', type: 'actor', name: 'User', alias: '사용자' },
    { id: 'seq-p2', type: 'participant', name: 'Server', alias: 'API 서버' }
  ]);
  const [seqMessages, setSeqMessages] = useState([
    { id: 'seq-m1', from: 'User', arrow: '->>', to: 'Server', text: '데이터 요청', isActivate: true },
    { id: 'seq-m2', from: 'Server', arrow: '-->>', to: 'User', text: 'JSON 응답', isActivate: false }
  ]);

  // D. 지도 데이터
  const [geoFeatures, setGeoFeatures] = useState([
    { id: 'geo-1', name: 'Seoul', lat: 37.5665, lng: 126.9780 }
  ]);

  // E. 3D 박스 데이터
  const [boxWidth, setBoxWidth] = useState(1.0);
  const [boxHeight, setBoxHeight] = useState(1.0);
  const [boxDepth, setBoxDepth] = useState(1.0);

  // STL 텍스트 제너레이터
  const generateBoxSTL = (wVal, hVal, dVal) => {
    const w = parseFloat(wVal) / 2, h = parseFloat(hVal) / 2, d = parseFloat(dVal) / 2;
    return `solid custom_box\n  facet normal 0.0 0.0 1.0\n    outer loop\n      vertex ${-w} ${-h} ${d}\n      vertex ${w} ${-h} ${d}\n      vertex ${w} ${h} ${d}\n    endloop\n  endfacet\n  facet normal 0.0 0.0 1.0\n    outer loop\n      vertex ${-w} ${-h} ${d}\n      vertex ${w} ${h} ${d}\n      vertex ${-w} ${h} ${d}\n    endloop\n  endfacet\n  facet normal 0.0 0.0 -1.0\n    outer loop\n      vertex ${-w} ${-h} ${-d}\n      vertex ${-w} ${h} ${-d}\n      vertex ${w} ${h} ${-d}\n    endloop\n  endfacet\n  facet normal 0.0 0.0 -1.0\n    outer loop\n      vertex ${-w} ${-h} ${-d}\n      vertex ${w} ${h} ${-d}\n      vertex ${w} ${-h} ${-d}\n    endloop\n  endfacet\n  facet normal 1.0 0.0 0.0\n    outer loop\n      vertex ${w} ${-h} ${-d}\n      vertex ${w} ${h} ${-d}\n      vertex ${w} ${h} ${d}\n    endloop\n  endfacet\n  facet normal 1.0 0.0 0.0\n    outer loop\n      vertex ${w} ${-h} ${-d}\n      vertex ${w} ${h} ${d}\n      vertex ${w} ${-h} ${d}\n    endloop\n  endfacet\n  facet normal -1.0 0.0 0.0\n    outer loop\n      vertex ${-w} ${-h} ${-d}\n      vertex ${-w} ${-h} ${d}\n      vertex ${-w} ${h} ${d}\n    endloop\n  endfacet\n  facet normal -1.0 0.0 0.0\n    outer loop\n      vertex ${-w} ${-h} ${-d}\n      vertex ${-w} ${h} ${d}\n      vertex ${-w} ${h} ${-d}\n    endloop\n  endfacet\n  facet normal 0.0 1.0 0.0\n    outer loop\n      vertex ${-w} ${h} ${-d}\n      vertex ${-w} ${h} ${d}\n      vertex ${w} ${h} ${d}\n    endloop\n  endfacet\n  facet normal 0.0 1.0 0.0\n    outer loop\n      vertex ${-w} ${h} ${-d}\n      vertex ${w} ${h} ${d}\n      vertex ${w} ${h} ${-d}\n    endloop\n  endfacet\n  facet normal 0.0 -1.0 0.0\n    outer loop\n      vertex ${-w} ${-h} ${-d}\n      vertex ${w} ${-h} ${-d}\n      vertex ${w} ${-h} ${d}\n    endloop\n  endfacet\n  facet normal 0.0 -1.0 0.0\n    outer loop\n      vertex ${-w} ${-h} ${-d}\n      vertex ${w} ${-h} ${d}\n      vertex ${-w} ${-h} ${d}\n    endloop\n  endfacet\nendsolid`;
  };

  // 노드 도형 변환 파서 함수
  const getShapeSyntax = (id, text, shape) => {
    if (!text) return id;
    switch(shape) {
      case '()': return `${id}(${text})`;
      case '[()]': return `${id}[(${text})]`;
      case '(())': return `${id}((${text}))`;
      case '>]': return `${id}>${text}]`;
      case '{}': return `${id}{${text}}`;
      case '{{}}': return `${id}{{${text}}}`;
      case '[//]': return `${id}[/${text}/]`;
      case '[\\\\]': return `${id}[\\${text}\\]`;
      case '[/\\\\]': return `${id}[/${text}\\]`;
      case '[\\\\/]': return `${id}[\\${text}/]`;
      case '((()))': return `${id}((({text})))`;
      case '[]':
      default: return `${id}[${text}]`;
    }
  };

  // 실시간 마크다운 코드 빌더
  const buildCurrentCode = () => {
    console.log("[코드 조립기] 실시간 마크다운 빌드. 타입:", diagramType);
    
    if (diagramType === 'mermaid_pie') {
      let code = `pie title ${pieTitle}\n`;
      pieItems.forEach(item => { code += `    "${item.label}" : ${item.value}\n`; });
      return code.trim();
    }
    
    if (diagramType === 'mermaid_flow') {
      let code = `graph ${flowOrientation};\n`;
      flowSteps.forEach(step => { 
        const fromNode = getShapeSyntax(step.from, step.fromText, step.fromShape);
        const toNode = getShapeSyntax(step.to, step.toText, step.toShape);
        const arrowStr = step.arrowText ? `${step.arrow}|${step.arrowText}|` : step.arrow;
        code += `    ${fromNode} ${arrowStr} ${toNode}\n`; 
      });
      return code.trim();
    }

    if (diagramType === 'mermaid_seq') {
      let code = `sequenceDiagram\n    autonumber\n`;
      seqParticipants.forEach(p => {
        code += `    ${p.type} ${p.name}${p.alias ? ` as ${p.alias}` : ''}\n`;
      });
      code += `\n`;
      seqMessages.forEach(msg => {
        if (!msg.from || !msg.to) return;
        const act = msg.isActivate ? '+' : '';
        code += `    ${msg.from}${msg.arrow}${act}${msg.to} : ${msg.text}\n`;
      });
      return code.trim();
    }

    if (diagramType === 'geojson') {
      const geoObj = {
        type: "FeatureCollection",
        features: geoFeatures.map(f => ({
          type: "Feature", properties: { name: f.name }, geometry: { type: "Point", coordinates: [parseFloat(f.lng || 0), parseFloat(f.lat || 0)] }
        }))
      };
      return JSON.stringify(geoObj, null, 2);
    }

    if (diagramType === 'stl') return generateBoxSTL(boxWidth, boxHeight, boxDepth);
    return '';
  };

  const activeCode = editMode === 'gui' ? buildCurrentCode() : rawCode;

  useEffect(() => {
    if (editMode === 'raw') setRawCode(buildCurrentCode());
    setActiveNodeId(null);
  }, [editMode, diagramType]);

  const handleInsertSubmit = () => {
    console.log("[DiagramModal] 최종 컴파일 코드 삽입");
    const isMermaid = diagramType.startsWith('mermaid_');
    const outputLang = isMermaid ? 'mermaid' : diagramType;
    const formattedCodeBlock = `\n\`\`\`${outputLang}\n${activeCode}\n\`\`\`\n`;
    onInsert(formattedCodeBlock);
    onClose();
  };

  const renderPreview = () => {
    if (!activeCode.trim()) return <div className="preview-placeholder">데이터를 구성하면 미리보기가 실행됩니다.</div>;
    try {
      if (diagramType.startsWith('mermaid_')) {
        return <MermaidBlock chart={activeCode} onNodeClick={(id) => setActiveNodeId(id)} />;
      }
      if (diagramType === 'geojson') return <GeoJsonBlock dataString={activeCode} isTopoJson={false} />;
      if (diagramType === 'stl') return <StlBlock stlString={activeCode} />;
    } catch (err) {
      console.error("[DiagramModal Preview] 내부 렌더링 오류:", err);
    }
    return null;
  };

  return (
    <div className="diagram-modal-backdrop" onClick={onClose}>
      <div className="diagram-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="diagram-modal-header">
          <div className="header-title-section">
            <h3>다이어그램 & 시각화 빌더 (v6.0)</h3>
            <div className="mode-toggle-group">
              <button className={`mode-tab-btn ${editMode === 'gui' ? 'active' : ''}`} onClick={() => setEditMode('gui')}><Layout size={14} style={{ marginRight: '4px' }} /> GUI 빌더</button>
              <button className={`mode-tab-btn ${editMode === 'raw' ? 'active' : ''}`} onClick={() => setEditMode('raw')}><Edit2 size={14} style={{ marginRight: '4px' }} /> 직접 편집 (코드)</button>
            </div>
          </div>
          <button className="close-x-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="diagram-modal-body">
          <div className="diagram-editor-panel">
            <div className="panel-title-label">시각화 포맷 선택</div>
            <select className="template-select" value={diagramType} onChange={(e) => setDiagramType(e.target.value)}>
              <optgroup label="Mermaid 다이어그램">
                <option value="mermaid_flow">순서도 (Flowchart)</option>
                <option value="mermaid_seq">시퀀스 (Sequence Diagram)</option>
                <option value="mermaid_pie">원형 차트 (Pie Chart)</option>
              </optgroup>
              <optgroup label="고급 시각화 렌더러">
                <option value="geojson">대화형 지도 (GeoJSON)</option>
                <option value="stl">3D 상자 모델 (STL Box)</option>
              </optgroup>
            </select>
            <div className="panel-divider" />

            {editMode === 'gui' ? (
              <div className="gui-fields-scroller">
                {diagramType === 'mermaid_pie' && (
                  <PieChartForm 
                    pieTitle={pieTitle} setPieTitle={setPieTitle} pieItems={pieItems}
                    handleAddPieItem={() => setPieItems(prev => [...prev, { id: `pie-${Date.now()}`, label: 'New Label', value: 10 }])}
                    handleRemovePieItem={(id) => setPieItems(prev => prev.filter(item => item.id !== id))}
                    handleUpdatePieItem={(id, field, value) => setPieItems(prev => prev.map(item => item.id === id ? { ...item, [field]: field === 'value' ? parseFloat(value) || 0 : value } : item))}
                  />
                )}
                {diagramType === 'mermaid_flow' && (
                  <FlowchartForm 
                    flowOrientation={flowOrientation} setFlowOrientation={setFlowOrientation} flowSteps={flowSteps} activeNodeId={activeNodeId}
                    handleAddFlowStep={() => setFlowSteps(prev => [...prev, { id: `flow-${Date.now()}`, from: 'X', fromShape: '[]', fromText: 'Node', arrow: '-->', arrowText: '', to: 'Y', toShape: '[]', toText: 'Target' }])}
                    handleRemoveFlowStep={(id) => setFlowSteps(prev => prev.filter(step => step.id !== id))}
                    handleUpdateFlowStep={(id, field, value) => setFlowSteps(prev => prev.map(step => step.id === id ? { ...step, [field]: value } : step))}
                  />
                )}
                {diagramType === 'mermaid_seq' && (
                  <SequenceForm 
                    seqParticipants={seqParticipants} setSeqParticipants={setSeqParticipants}
                    handleAddSeqParticipant={() => setSeqParticipants(prev => [...prev, { id: `seq-p-${Date.now()}`, type: 'participant', name: `P_${prev.length+1}`, alias: '' }])}
                    handleRemoveSeqParticipant={(id) => setSeqParticipants(prev => prev.filter(p => p.id !== id))}
                    handleUpdateSeqParticipant={(id, field, value) => setSeqParticipants(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))}
                    seqMessages={seqMessages} setSeqMessages={setSeqMessages}
                    handleAddSeqMessage={() => setSeqMessages(prev => [...prev, { id: `seq-m-${Date.now()}`, from: '', arrow: '->>', to: '', text: 'New Message', isActivate: false }])}
                    handleRemoveSeqMessage={(id) => setSeqMessages(prev => prev.filter(m => m.id !== id))}
                    handleUpdateSeqMessage={(id, field, value) => setSeqMessages(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m))}
                  />
                )}
                {diagramType === 'geojson' && (
                  <GeoJsonForm 
                    geoFeatures={geoFeatures}
                    handleAddGeoFeature={() => setGeoFeatures(prev => [...prev, { id: `geo-${Date.now()}`, name: 'New Point', lat: 37.5, lng: 127.0 }])}
                    handleRemoveGeoFeature={(id) => setGeoFeatures(prev => prev.filter(f => f.id !== id))}
                    handleUpdateGeoFeature={(id, field, value) => setGeoFeatures(prev => prev.map(f => f.id === id ? { ...f, [field]: field === 'name' ? value : parseFloat(value) || 0 } : f))}
                  />
                )}
                {diagramType === 'stl' && (
                  <StlForm boxWidth={boxWidth} setBoxWidth={setBoxWidth} boxHeight={boxHeight} setBoxHeight={setBoxHeight} boxDepth={boxDepth} setBoxDepth={setBoxDepth} />
                )}
              </div>
            ) : (
              <textarea className="diagram-raw-textarea" value={rawCode} onChange={(e) => setRawCode(e.target.value)} spellCheck="false" placeholder="코드를 직접 작성하세요..." />
            )}
          </div>

          <div className="diagram-preview-panel">
            <div className="panel-title-label">실시간 미리보기 {activeNodeId && <span style={{ color: '#0969da', marginLeft: '8px', textTransform: 'none' }}>(활성 노드: {activeNodeId})</span>}</div>
            <div className="preview-render-wrapper">{renderPreview()}</div>
          </div>
        </div>

        <div className="diagram-modal-footer">
          <button className="cancel-btn" onClick={onClose}>취소</button>
          <button className="submit-btn" onClick={handleInsertSubmit}>에디터에 삽입</button>
        </div>
      </div>
    </div>
  );
}

export default DiagramModal;