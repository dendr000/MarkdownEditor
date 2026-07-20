// src/utils/diagramParser.js v1.2
/*
 * 파일 설명: 다이어그램의 GUI 상태 ↔ 마크다운 텍스트 간의 상호 변환을 담당하는 유틸리티 파일입니다. GeoJSON 및 STL 문자열 합성 로직이 복구되었습니다.
 * 연결 위치: src/components/diagram/DiagramModal.jsx
 */

// 1. 노드 토큰 역분석 (순서도용)
export const parseNodeToken = (token) => {
  console.log("[diagramParser] 노드 토큰 역분석 시도:", token);
  if (!token) return null;
  
  const idMatch = token.match(/^([a-zA-Z0-9_\-]+)/);
  if (!idMatch) return null;
  
  const id = idMatch[1];
  let shape = '[]';
  let text = '';
  let desc = '';

  if (token.includes('{{')) shape = '{{}}';
  else if (token.includes('(((')) shape = '((()))';
  else if (token.includes('((')) shape = '(())';
  else if (token.includes('[(')) shape = '[()]';
  else if (token.includes('()')) shape = '()';
  else if (token.includes('}')) shape = '{}';
  else if (token.includes('>')) shape = '>]';
  else if (token.includes('[/') && token.includes('/]')) shape = '[//]';
  else if (token.includes('[\\') && token.includes('\\]')) shape = '[\\\\]';
  else if (token.includes('[/') && token.includes('\\]')) shape = '[/\\\\]';
  else if (token.includes('[\\') && token.includes('/]')) shape = '[\\\\/]';
  else shape = '[]';

  let innerContent = '';
  const quoteMatch = token.match(/"([\s\S]*?)"/);
  
  if (quoteMatch) {
    innerContent = quoteMatch[1];
  } else {
    const bracketMatch = token.match(/[\[\(\{>]+([^\]\)\}]+)[\]\)}]+/);
    if (bracketMatch) innerContent = bracketMatch[1];
  }

  if (innerContent) {
    const mdMatch = innerContent.match(/^`\*\*([\s\S]*?)\*\*<br\/>([\s\S]*?)`$/);
    const htmlMatch = innerContent.match(/^<b>([\s\S]*?)<\/b><br\/>\s*<small>([\s\S]*?)<\/small>$/);
    
    if (mdMatch) {
      text = mdMatch[1].trim();
      desc = mdMatch[2].replace(/&nbsp;/g, '').trim();
    } else if (htmlMatch) {
      text = htmlMatch[1].trim();
      desc = htmlMatch[2].replace(/&nbsp;/g, '').trim();
    } else {
      text = innerContent.replace(/`/g, '').trim();
    }
  }

  if (!text) text = id;
  console.log(`[diagramParser] 파싱 결과 -> ID: ${id}, 텍스트: ${text}, 보조설명: ${desc}`);
  return { id, shape, text, desc };
};

// 2. 텍스트 -> GUI 상태 역환원 (역파싱 엔진)
export const parseMarkdownToState = (markdown) => {
  const cleanText = markdown.replace(/```mermaid/g, '').replace(/```/g, '').trim();
  const lines = cleanText.split('\n');

  const flowHeader = cleanText.match(/(?:graph|flowchart)\s+(TD|BT|LR|RL);?/i);
  if (flowHeader) {
    const arrowRegex = /(-->|--->|---|-.->|-.-|==>|--o|--x|~~~)/;
    const steps = [];
    lines.forEach((line, idx) => {
      if (!line.trim() || line.match(/(?:graph|flowchart|style)/i)) return;
      const segments = line.split(arrowRegex);
      if (segments.length >= 3) {
        const fromPart = segments[0].trim();
        const arrowType = segments[1].trim();
        let rest = segments.slice(2).join('').trim();
        let arrowText = '';
        const arrowTextMatch = rest.match(/^\|([\s\S]*?)\|/);
        if (arrowTextMatch) {
          arrowText = arrowTextMatch[1].trim();
          rest = rest.replace(/^\|[\s\S]*?\|/, '').trim();
        }
        const f = parseNodeToken(fromPart);
        const t = parseNodeToken(rest);
        if (f && t) steps.push({ id: `f-${idx}-${Math.random()}`, from: f.id, fromShape: f.shape, fromText: f.text || f.id, fromDesc: f.desc, arrow: arrowType, arrowText, to: t.id, toShape: t.shape, toText: t.text || t.id, toDesc: t.desc });
      }
    });
    return { type: 'mermaid_flow', data: { orientation: flowHeader[1].toUpperCase(), steps } };
  }

  if (cleanText.match(/^pie/i)) {
    const titleMatch = cleanText.match(/title\s+([\s\S]*?)\n/i);
    const items = [];
    lines.forEach(line => {
      const m = line.match(/"([\s\S]*?)"\s*:\s*([0-9.]+)/);
      if (m) items.push({ id: `p-${Math.random()}`, label: m[1].trim(), value: parseFloat(m[2]) });
    });
    return { type: 'mermaid_pie', data: { title: titleMatch ? titleMatch[1].trim() : '', items } };
  }

  if (cleanText.match(/^sequenceDiagram/i)) {
    const participants = [];
    const messages = [];
    lines.forEach((line, idx) => {
      const pMatch = line.trim().match(/^(participant|actor)\s+([a-zA-Z0-9_\-]+)(?:\s+as\s+([\s\S]*))?/i);
      if (pMatch) {
        participants.push({ id: `sp-${idx}`, type: pMatch[1].toLowerCase(), name: pMatch[2].trim(), alias: pMatch[3] ? pMatch[3].trim() : '' });
      } else {
        const mMatch = line.trim().match(/^([a-zA-Z0-9_\-]+)\s*(->|-->|->>|-->>|-x|--x|-\)|--\))(\+?)([a-zA-Z0-9_\-]+)\s*:\s*([\s\S]*)$/);
        if (mMatch) messages.push({ id: `sm-${idx}`, from: mMatch[1].trim(), arrow: mMatch[2].trim(), isActivate: mMatch[3] === '+', to: mMatch[4].trim(), text: mMatch[5].trim() });
      }
    });
    return { type: 'mermaid_seq', data: { participants, messages } };
  }

  return { type: 'raw', data: cleanText };
};

// 3. GUI 상태 -> 텍스트 조립 (코드 제너레이터)
export const buildStateToMarkdown = (type, state) => {
  const getShapeSyntax = (id, text, desc, shape) => {
    let content = text || id;
    if (desc) content = `"\`**${text}**<br/>${desc}\`"`;
    else if (text && (text.includes(' ') || text.includes('<') || text.includes('>'))) content = `"\`${text}\`"`;
    switch(shape) {
      case '()': return `${id}(${content})`;
      case '[()]': return `${id}[(${content})]`;
      case '(())': return `${id}((${content}))`;
      case '{}': return `${id}{${content}}`;
      default: return `${id}[${content}]`;
    }
  };

  if (type === 'mermaid_pie') {
    let code = `pie title ${state.pieTitle}\n`;
    state.pieItems.forEach(i => code += `    "${i.label}" : ${i.value}\n`);
    return code.trim();
  }
  
  if (type === 'mermaid_flow') {
    let code = `graph ${state.flowOrientation};\n`;
    state.flowSteps.forEach(s => {
      const f = getShapeSyntax(s.from, s.fromText, s.fromDesc, s.fromShape);
      const t = getShapeSyntax(s.to, s.toText, s.toDesc, s.toShape);
      code += `    ${f} ${s.arrowText ? `${s.arrow}|${s.arrowText}|` : s.arrow} ${t}\n`;
    });
    return code.trim();
  }
  
  if (type === 'mermaid_seq') {
    let code = `sequenceDiagram\n    autonumber\n`;
    state.seqParticipants.forEach(p => code += `    ${p.type} ${p.name}${p.alias ? ` as ${p.alias}` : ''}\n`);
    state.seqMessages.forEach(m => {
      if (m.from && m.to) code += `    ${m.from}${m.arrow}${m.isActivate ? '+' : ''}${m.to} : ${m.text}\n`;
    });
    return code.trim();
  }

  // [복구] GeoJSON 문자열 생성 로직
  if (type === 'geojson') {
    const geoObj = {
      type: "FeatureCollection",
      features: state.geoFeatures.map(f => ({
        type: "Feature",
        properties: { name: f.name },
        geometry: { type: "Point", coordinates: [parseFloat(f.lng || 0), parseFloat(f.lat || 0)] }
      }))
    };
    return JSON.stringify(geoObj, null, 2);
  }

  // [복구] 3D STL 문자열 생성 로직
  if (type === 'stl') {
    const w = parseFloat(state.boxWidth) / 2 || 0.5;
    const h = parseFloat(state.boxHeight) / 2 || 0.5;
    const d = parseFloat(state.boxDepth) / 2 || 0.5;
    return `solid custom_box
  facet normal 0.0 0.0 1.0
    outer loop
      vertex ${-w} ${-h} ${d}
      vertex ${w} ${-h} ${d}
      vertex ${w} ${h} ${d}
    endloop
  endfacet
  facet normal 0.0 0.0 1.0
    outer loop
      vertex ${-w} ${-h} ${d}
      vertex ${w} ${h} ${d}
      vertex ${-w} ${h} ${d}
    endloop
  endfacet
  facet normal 0.0 0.0 -1.0
    outer loop
      vertex ${-w} ${-h} ${-d}
      vertex ${-w} ${h} ${-d}
      vertex ${w} ${h} ${-d}
    endloop
  endfacet
  facet normal 0.0 0.0 -1.0
    outer loop
      vertex ${-w} ${-h} ${-d}
      vertex ${w} ${h} ${-d}
      vertex ${w} ${-h} ${-d}
    endloop
  endfacet
  facet normal 1.0 0.0 0.0
    outer loop
      vertex ${w} ${-h} ${-d}
      vertex ${w} ${h} ${-d}
      vertex ${w} ${h} ${d}
    endloop
  endfacet
  facet normal 1.0 0.0 0.0
    outer loop
      vertex ${w} ${-h} ${-d}
      vertex ${w} ${h} ${d}
      vertex ${w} ${-h} ${d}
    endloop
  endfacet
  facet normal -1.0 0.0 0.0
    outer loop
      vertex ${-w} ${-h} ${-d}
      vertex ${-w} ${-h} ${d}
      vertex ${-w} ${h} ${d}
    endloop
  endfacet
  facet normal -1.0 0.0 0.0
    outer loop
      vertex ${-w} ${-h} ${-d}
      vertex ${-w} ${h} ${d}
      vertex ${-w} ${h} ${-d}
    endloop
  endfacet
  facet normal 0.0 1.0 0.0
    outer loop
      vertex ${-w} ${h} ${-d}
      vertex ${-w} ${h} ${d}
      vertex ${w} ${h} ${d}
    endloop
  endfacet
  facet normal 0.0 1.0 0.0
    outer loop
      vertex ${-w} ${h} ${-d}
      vertex ${w} ${h} ${d}
      vertex ${w} ${h} ${-d}
    endloop
  endfacet
  facet normal 0.0 -1.0 0.0
    outer loop
      vertex ${-w} ${-h} ${-d}
      vertex ${w} ${-h} ${-d}
      vertex ${w} ${-h} ${d}
    endloop
  endfacet
  facet normal 0.0 -1.0 0.0
    outer loop
      vertex ${-w} ${-h} ${-d}
      vertex ${w} ${-h} ${d}
      vertex ${-w} ${-h} ${d}
    endloop
  endfacet
endsolid`;
  }

  return '';
};