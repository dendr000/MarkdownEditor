// src/routes/api.js v1.1
/*
 * 파일 설명: Express 라우터를 사용하여 API 엔드포인트를 정의하는 파일입니다.
 * (v1.1 수정사항): 폴더 뷰어 생성 시 파일명에 마크다운 링크 문법을 적용하여 프론트엔드 라우팅 기능을 활성화했습니다.
 */
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { 
  DATA_DIR, 
  workspaceConfig, 
  getSafePath, 
  buildTree, 
  updateWorkspaceConfig 
} from '../controllers/fileController.js';

const router = express.Router();

router.get('/workspace', (req, res) => {
  console.log(`[GET /api/workspace] 요청 수신. 반환 값: ${DATA_DIR}`);
  res.json({ path: DATA_DIR, history: workspaceConfig.history || [] });
});

router.post('/workspace', async (req, res) => {
  const { newPath } = req.body;
  console.log(`[POST /api/workspace] 경로 변경 요청 - 타겟: ${newPath}`);
  try {
    const result = await updateWorkspaceConfig(newPath);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error(`[POST /api/workspace] 변경 에러:`, error);
    res.status(400).json({ error: error.message || '유효하지 않은 경로입니다.' });
  }
});

router.get('/tree', async (req, res) => {
  console.log(`[GET /api/tree] 스캔 요청 수신 (기준 경로: ${DATA_DIR})`);
  try {
    const tree = await buildTree(DATA_DIR);
    res.json(tree);
  } catch (error) {
    console.error('[GET /api/tree] 에러 발생:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/file', async (req, res) => {
  const { target } = req.query;
  console.log(`[GET /api/file] 조회 요청 - 타겟: ${target}`);
  try {
    const safePath = getSafePath(target);
    const stats = await fs.stat(safePath);
    
    if (stats.isDirectory()) {
      const files = await fs.readdir(safePath);
      let md = `> **📁 폴더 뷰어 (읽기 전용)**: \`${target || 'root'}\`\n\n`;
      md += `| Type | Name | Format |\n| :---: | --- | --- |\n`;
      
      const items = [];
      for (const f of files) {
        if (f.startsWith('.')) continue; 
        try {
          const childStats = await fs.stat(path.join(safePath, f));
          items.push({ name: f, isDir: childStats.isDirectory() });
        } catch (e) {}
      }
      
      items.sort((a, b) => {
        if (a.isDir === b.isDir) return a.name.localeCompare(b.name);
        return a.isDir ? -1 : 1;
      });

      for (const item of items) {
        const icon = item.isDir ? '📁' : '📄';
        const typeText = item.isDir ? 'Folder' : 'File';
        
        // 프론트엔드의 상대 경로 로직(resolvePath)과 완벽히 호환되도록 마크다운 표준 상대 경로(./경로)를 사용합니다.
        // target(현재 폴더)을 기준으로 하위 항목을 가리키므로 항상 ./ 접두사를 붙입니다.
        const link = `[**${item.name}**](./${item.name})`;
        
        md += `| ${icon} | ${link} | ${typeText} |\n`;
      }
      
      return res.send(md);
    }

    const content = await fs.readFile(safePath, 'utf8');
    res.send(content);
  } catch (error) {
    console.error(`[GET /api/file] 읽기 에러:`, error.message);
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: '해당 파일이 존재하지 않습니다.' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

router.get('/raw', (req, res) => {
  const { target } = req.query;
  console.log(`[GET /api/raw] 바이너리 스트리밍 요청 - 타겟: ${target}`);
  try {
    const safePath = getSafePath(target);
    res.sendFile(safePath, (err) => {
      if (err && !res.headersSent) res.status(err.status || 500).json({ error: '파일을 전송할 수 없습니다.' });
    });
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
});

router.post('/file', async (req, res) => {
  const { target, isFolder } = req.body;
  console.log(`[POST /api/file] 생성 요청 - 타겟: ${target}, 폴더여부: ${isFolder}`);
  try {
    const safePath = getSafePath(target);
    if (isFolder) {
      await fs.mkdir(safePath, { recursive: true });
    } else {
      await fs.writeFile(safePath, '', 'utf8');
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/file', async (req, res) => {
  const { target, content } = req.body;
  console.log(`[PUT /api/file] 덮어쓰기 요청 - 타겟: ${target}`);
  try {
    const safePath = getSafePath(target);
    
    try {
      const stats = await fs.stat(safePath);
      if (stats.isDirectory()) {
        return res.status(400).json({ error: '폴더(디렉토리)는 텍스트로 덮어쓸 수 없습니다.' });
      }
    } catch (e) {}

    await fs.writeFile(safePath, content, 'utf8');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/file', async (req, res) => {
  const { target } = req.body;
  console.log(`[DELETE /api/file] 삭제 요청 - 타겟: ${target}`);
  try {
    const safePath = getSafePath(target);
    const stats = await fs.stat(safePath);
    if (stats.isDirectory()) {
      await fs.rm(safePath, { recursive: true, force: true });
    } else {
      await fs.unlink(safePath);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/file', async (req, res) => {
  const { oldTarget, newTarget } = req.body;
  console.log(`[PATCH /api/file] 이름 변경 요청 - 기존: ${oldTarget}, 변경: ${newTarget}`);
  try {
    const oldSafePath = getSafePath(oldTarget);
    const newSafePath = getSafePath(newTarget);
    await fs.rename(oldSafePath, newSafePath);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;