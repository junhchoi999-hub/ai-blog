#!/usr/bin/env node
// 블로그용 이미지를 직접 만들어 PNG로 저장한다. (저작권 문제 없는 자체 제작 이미지)
//
// 대표 이미지 (1200x630, 검색·SNS 미리보기에도 사용):
//   node tools/make-image.js cover --title "글 제목" --category "프롬프트" --out assets/images/슬러그/cover.png
//
// 핵심 정리 카드 (본문 삽입용, 항목은 | 로 구분, 3~6개):
//   node tools/make-image.js card --title "프롬프트 원칙 5가지" --items "상황을 알려 준다|형태를 정한다|예시를 보여 준다" --out assets/images/슬러그/summary.png
//
// 단계 흐름도 (본문 삽입용, 단계는 | 로 구분, 3~5개):
//   node tools/make-image.js steps --title "수식 검증 순서" --items "직접 계산과 비교|경계 조건 확인|수식 설명 듣기" --out assets/images/슬러그/steps.png

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const [mode, ...rest] = process.argv.slice(2);
const args = {};
for (let i = 0; i < rest.length; i += 2) args[rest[i].replace(/^--/, '')] = rest[i + 1];

const SITE = 'AI 써먹기';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const items = (args.items || '').split('|').map((s) => s.trim()).filter(Boolean);

const base = `
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; font-family: "Pretendard", "Noto Sans CJK KR", "Noto Sans KR", "Apple SD Gothic Neo", sans-serif;
         color: #1f2328; word-break: keep-all; }
  .brand { font-size: 26px; font-weight: 800; color: #1a5fb4; }
`;

const templates = {
  cover: () => `
    <style>${base}
      #shot { width: 1200px; height: 630px; padding: 72px 80px; background: #fbfaf7;
              border-left: 24px solid #1a5fb4; display: flex; flex-direction: column; justify-content: space-between; }
      .cat { font-size: 30px; font-weight: 700; color: #1a5fb4; margin-bottom: 28px; }
      h1 { font-size: ${args.title.length > 34 ? 58 : 68}px; line-height: 1.3; font-weight: 800; letter-spacing: -0.02em; }
    </style>
    <div id="shot">
      <div><p class="cat">${esc(args.category || '')}</p><h1>${esc(args.title)}</h1></div>
      <p class="brand">${SITE}</p>
    </div>`,
  card: () => `
    <style>${base}
      #shot { width: 1200px; padding: 64px 72px; background: #fbfaf7; }
      h1 { font-size: 46px; font-weight: 800; margin-bottom: 36px; letter-spacing: -0.01em; }
      ul { padding: 0; }
      li { list-style: none; display: flex; align-items: center; gap: 24px; background: #fff;
           border: 2px solid #e4e1da; border-radius: 16px; padding: 24px 28px; margin-bottom: 16px;
           font-size: 32px; font-weight: 600; line-height: 1.4; }
      .n { flex: none; width: 56px; height: 56px; border-radius: 50%; background: #1a5fb4; color: #fff;
           display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 800; }
      .brand { margin-top: 28px; text-align: right; }
    </style>
    <div id="shot">
      <h1>${esc(args.title)}</h1>
      <ul>${items.map((t, i) => `<li><span class="n">${i + 1}</span><span>${esc(t)}</span></li>`).join('')}</ul>
      <p class="brand">${SITE}</p>
    </div>`,
  steps: () => `
    <style>${base}
      #shot { width: 1200px; padding: 64px 56px; background: #fbfaf7; }
      h1 { font-size: 44px; font-weight: 800; margin-bottom: 40px; text-align: center; }
      .row { display: flex; align-items: stretch; justify-content: center; }
      .step { flex: 1; background: #fff; border: 2px solid #1a5fb4; border-radius: 16px; padding: 28px 20px; text-align: center; }
      .step b { display: block; color: #1a5fb4; font-size: 24px; margin-bottom: 12px; }
      .step span { font-size: 28px; font-weight: 600; line-height: 1.4; }
      .arrow { flex: none; width: 48px; display: flex; align-items: center; justify-content: center; font-size: 36px; color: #1a5fb4; font-weight: 800; }
      .brand { margin-top: 32px; text-align: right; }
    </style>
    <div id="shot">
      <h1>${esc(args.title)}</h1>
      <div class="row">${items.map((t, i) => `${i ? '<div class="arrow">→</div>' : ''}<div class="step"><b>${i + 1}단계</b><span>${esc(t)}</span></div>`).join('')}</div>
      <p class="brand">${SITE}</p>
    </div>`,
};

(async () => {
  if (!templates[mode] || !args.title || !args.out) {
    console.error('사용법은 이 파일 맨 위의 주석을 참고하세요.');
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(`<!doctype html><meta charset="utf-8"><body>${templates[mode]()}</body>`);
  const el = await page.$('#shot');
  const box = await el.boundingBox();
  await el.screenshot({ path: args.out });
  await browser.close();
  console.log(`${args.out} (${Math.round(box.width)}x${Math.round(box.height)})`);
})();
