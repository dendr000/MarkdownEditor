// src/components/diagram/DiagramModal.jsx v11.0
/*
 * 파일 설명: 분리된 유틸리티(diagramParser)를 사용하여 파싱 로직을 외주화하고, UI 관리만 담당하는 경량화된 다이어그램 모달 컴포넌트입니다. GeoJSON 및 STL 상태 렌더링 누락 에러가 수정되었습니다.
 * 연결 위치: src/components/editor/Editor.jsx 내부
 */
import React, { useState, useEffect } from 'react';
import { Edit2, Layout } from 'lucide-react';
import { parseMarkdownToState, buildStateToMarkdown } from '../../utils/diagramParser';
import MermaidBlock from '../preview/MermaidBlock';
import GeoJsonBlock from '../preview/GeoJsonBlock';
import StlBlock from '../preview/StlBlock';
import PieChartForm from './forms/PieChartForm';
import FlowchartForm from './forms/FlowchartForm';
import SequenceForm from './forms/SequenceForm';
import GeoJsonForm from './forms/GeoJsonForm';
import StlForm from './forms/StlForm';
import './DiagramModal.css';

function DiagramModal({ isOpen, onClose, onInsert, initialDiagramMarkdown = '' }) {
  console.log("[DiagramModal v11.0] 모달 마운트 개시");
  const [editMode, setEditMode] = useState('gui');
  const [diagramType, setDiagramType] = useState('mermaid_flow');
  const [rawCode, setRawCode] = useState('');
  const [activeNodeId, setActiveNodeId] = useState(null);

  // GUI 데이터 상태 통합 관리
  const [pieTitle, setPieTitle] = useState('프로젝트 언어 비중');
  const [pieItems, setPieItems] = useState([{ id: 'p1', label: 'JS', value: 70 }]);
  const [flowOrientation, setFlowOrientation] = useState('LR');
  const [flowSteps, setFlowSteps] = useState([{ id: 'f1', from: 'A', fromShape: '[]', fromText: '시작', fromDesc: '', arrow: '-->', arrowText: '', to: 'B', toShape: '[]', toText: '종료', toDesc: '' }]);
  const [seqParticipants, setSeqParticipants] = useState([{ id: 'sp1', type: 'actor', name: 'User', alias: '' }]);
  const [seqMessages, setSeqMessages] = useState([{ id: 'sm1', from: 'User', arrow: '->>', to: 'User', text: 'Self', isActivate: false }]);
  const [geoFeatures, setGeoFeatures] = useState([{ id: 'g1', name: 'Seoul', lat: 37.5, lng: 127.0 }]);
  
  // [복구] STL 폼 전용 상태 변수
  const [boxWidth, setBoxWidth] = useState(1.0);
  const [boxHeight, setBoxHeight] = useState(1.0);
  const [boxDepth, setBoxDepth] = useState(1.0);

  // 역파싱 실행
  useEffect(() => {
    if (!isOpen || !initialDiagramMarkdown.trim()) return;
    const { type, data } = parseMarkdownToState(initialDiagramMarkdown);
    if (type === 'raw') { 
      setEditMode('raw'); 
      setRawCode(data); 
    } else {
      setDiagramType(type);
      if (type === 'mermaid_flow') { setFlowOrientation(data.orientation); setFlowSteps(data.steps); }
      if (type === 'mermaid_pie') { setPieTitle(data.title); setPieItems(data.items); }
      if (type === 'mermaid_seq') { setSeqParticipants(data.participants); setSeqMessages(data.messages); }
    }
  }, [isOpen, initialDiagramMarkdown]);

  // 실시간 텍스트 빌더 - STL과 GeoJSON 데이터까지 함께 묶어 전달
  const activeCode = editMode === 'gui' 
    ? buildStateToMarkdown(diagramType, { 
        pieTitle, pieItems, 
        flowOrientation, flowSteps, 
        seqParticipants, seqMessages, 
        geoFeatures, 
        boxWidth, boxHeight, boxDepth 
      }) 
    : rawCode;

  const handleInsertSubmit = () => {
    const lang = diagramType.startsWith('mermaid') ? 'mermaid' : diagramType;
    onInsert(`\n\`\`\`${lang}\n${activeCode}\n\`\`\`\n`);
    onClose();
  };

  const handleUpdateFlowStep = (id, field, value) => {
    setFlowSteps(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (idx === -1) return prev;
      const updated = [...prev];
      if (field === 'from' || field === 'to') {
        const existing = updated.find(s => s.from === value || s.to === value);
        updated[idx] = { ...updated[idx], [field]: value };
        if (existing) {
          const prefix = field; const src = existing.from === value ? 'from' : 'to';
          updated[idx][`${prefix}Shape`] = existing[`${src}Shape`];
          updated[idx][`${prefix}Text`] = existing[`${src}Text`];
          updated[idx][`${prefix}Desc`] = existing[`${src}Desc`];
        }
      } else if (field.startsWith('from') || field.startsWith('to')) {
        const targetId = field.startsWith('from') ? updated[idx].from : updated[idx].to;
        const base = field.replace(/from|to/, '');
        return updated.map(s => {
          const ns = { ...s };
          if (ns.from === targetId) ns[`from${base}`] = value;
          if (ns.to === targetId) ns[`to${base}`] = value;
          return ns;
        });
      } else { updated[idx][field] = value; }
      return updated;
    });
  };

  if (!isOpen) return null;

  const renderPreview = () => {
    if (!activeCode.trim()) return <div className="preview-placeholder">데이터를 구성하면 미리보기가 실행됩니다.</div>;
    try {
      if (diagramType.startsWith('mermaid')) {
        return <MermaidBlock chart={activeCode} onNodeClick={setActiveNodeId} />;
      }
      if (diagramType === 'geojson') return <GeoJsonBlock dataString={activeCode} />;
      if (diagramType === 'stl') return <StlBlock stlString={activeCode} />;
    } catch (err) {
      console.error("[DiagramModal Preview] 렌더링 오류:", err);
    }
    return null;
  };

  return (
    <div className="diagram-modal-backdrop" onClick={onClose}>
      <div className="diagram-modal-content" onClick={e => e.stopPropagation()}>
        <div className="diagram-modal-header">
          <div className="header-title-section">
            <h3>다이어그램 빌더 v11.0</h3>
            <div className="mode-toggle-group">
              <button className={`mode-tab-btn ${editMode === 'gui' ? 'active' : ''}`} onClick={() => setEditMode('gui')}><Layout size={14} /> GUI</button>
              <button className={`mode-tab-btn ${editMode === 'raw' ? 'active' : ''}`} onClick={() => setEditMode('raw')}><Edit2 size={14} /> 코드</button>
            </div>
          </div>
          <button className="close-x-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="diagram-modal-body">
          <div className="diagram-editor-panel">
            <select className="template-select" value={diagramType} onChange={e => setDiagramType(e.target.value)}>
              <optgroup label="Mermaid"><option value="mermaid_flow">순서도</option><option value="mermaid_seq">시퀀스</option><option value="mermaid_pie">원형차트</option></optgroup>
              <optgroup label="고급"><option value="geojson">지도</option><option value="stl">3D상자</option></optgroup>
            </select>
            <div className="panel-divider" />
            <div className="gui-fields-scroller">
              {editMode === 'gui' ? (
                <>
                  {diagramType === 'mermaid_pie' && <PieChartForm pieTitle={pieTitle} setPieTitle={setPieTitle} pieItems={pieItems} handleAddPieItem={() => setPieItems([...pieItems, { id: Date.now(), label: 'New', value: 10 }])} handleRemovePieItem={id => setPieItems(pieItems.filter(i => i.id !== id))} handleUpdatePieItem={(id, f, v) => setPieItems(pieItems.map(i => i.id === id ? { ...i, [f]: f === 'value' ? parseFloat(v) : v } : i))} />}
                  {diagramType === 'mermaid_flow' && <FlowchartForm flowOrientation={flowOrientation} setFlowOrientation={setFlowOrientation} flowSteps={flowSteps} activeNodeId={activeNodeId} handleAddFlowStep={() => setFlowSteps([...flowSteps, { id: Date.now(), from: '', fromShape: '[]', fromText: '', fromDesc: '', arrow: '-->', arrowText: '', to: '', toShape: '[]', toText: '', toDesc: '' }])} handleRemoveFlowStep={id => setFlowSteps(flowSteps.filter(s => s.id !== id))} handleUpdateFlowStep={handleUpdateFlowStep} />}
                  {diagramType === 'mermaid_seq' && <SequenceForm seqParticipants={seqParticipants} setSeqParticipants={setSeqParticipants} handleAddSeqParticipant={() => setSeqParticipants([...seqParticipants, { id: Date.now(), type: 'participant', name: `P${seqParticipants.length}`, alias: '' }])} handleRemoveSeqParticipant={id => setSeqParticipants(seqParticipants.filter(p => p.id !== id))} handleUpdateSeqParticipant={(id, f, v) => setSeqParticipants(seqParticipants.map(p => p.id === id ? { ...p, [f]: v } : p))} seqMessages={seqMessages} setSeqMessages={setSeqMessages} handleAddSeqMessage={() => setSeqMessages([...seqMessages, { id: Date.now(), from: '', arrow: '->>', to: '', text: 'Msg', isActivate: false }])} handleRemoveSeqMessage={id => setSeqMessages(seqMessages.filter(m => m.id !== id))} handleUpdateSeqMessage={(id, f, v) => setSeqMessages(seqMessages.map(m => m.id === id ? { ...m, [f]: v } : m))} />}
                  {diagramType === 'geojson' && <GeoJsonForm geoFeatures={geoFeatures} handleAddGeoFeature={() => setGeoFeatures([...geoFeatures, { id: Date.now(), name: 'New Point', lat: 37.5, lng: 127.0 }])} handleRemoveGeoFeature={id => setGeoFeatures(geoFeatures.filter(f => f.id !== id))} handleUpdateGeoFeature={(id, f, v) => setGeoFeatures(geoFeatures.map(feature => feature.id === id ? { ...feature, [f]: f === 'name' ? v : parseFloat(v) || 0 } : feature))} />}
                  {diagramType === 'stl' && <StlForm boxWidth={boxWidth} setBoxWidth={setBoxWidth} boxHeight={boxHeight} setBoxHeight={setBoxHeight} boxDepth={boxDepth} setBoxDepth={setBoxDepth} />}
                </>
              ) : <textarea className="diagram-raw-textarea" value={rawCode} onChange={e => setRawCode(e.target.value)} />}
            </div>
          </div>
          <div className="diagram-preview-panel">
            <div className="preview-render-wrapper">
              {renderPreview()}
            </div>
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