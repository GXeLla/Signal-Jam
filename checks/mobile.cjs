// Browser-only development check; the game itself has no dependencies.
const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');

(async () => {
  const browser = await chromium.launch({channel: process.env.BROWSER_CHANNEL || 'chrome'});
  try {
    for (const [width, height] of [[320,568],[390,844],[430,932],[844,390],[768,1024],[1024,768],[1440,900]]) {
      if(process.env.TEST_WIDTH && width!==Number(process.env.TEST_WIDTH)) continue;
      const context = await browser.newContext({viewport:{width,height}, hasTouch:true, isMobile:width<900});
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.route('https://signal.test/**', async route => {
        const name = new URL(route.request().url()).pathname.slice(1) || 'index.html';
        let body = fs.readFileSync(path.join(root,name));
        if (name==='game.js') body = body.toString().replace("  $('#soundValue').textContent", "  window.testGame={getBoard:()=>board,startGame,actReveal,showHelp,beginTutorial};\n  $('#soundValue').textContent");
        await route.fulfill({body, contentType:name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.webp')?'image/webp':name.endsWith('.png')?'image/png':'text/html'});
      });
      await page.addInitScript(() => localStorage.setItem('nightshift.v1',JSON.stringify({tutorialSeen:true,unlocked:100,coins:10000,prefs:{sound:false}})));
      await page.goto('https://signal.test/');
      await page.locator('#loadingScreen').waitFor({state:'hidden'});
      const bounds = async label => {
        const bad = await page.evaluate(() => [...document.querySelectorAll('button,input,.failed-card,.tutorial-card')]
          .filter(e=>e.getClientRects().length&&!e.closest('#board'))
          .filter(e=>{const r=e.getBoundingClientRect();return r.left < -1 || r.right > innerWidth+1})
          .map(e=>e.id||e.textContent.trim()));
        assert.deepEqual(bad,[],`${width} ${label}: clipped controls`);
      };
      await bounds('menu');
      await page.locator('#optionsBtn').tap(); await bounds('options');
      await page.locator('#qualityBtn').tap();
      assert(await page.locator('body').evaluate(e=>e.classList.contains('low-quality')));
      await page.locator('#soundBtn').tap();
      await page.locator('#optionsScreen [data-back-menu]').tap();
      await page.locator('#mainShopBtn').tap();
      for(let i=0;i<4;i++) {
        await page.locator('.store-tabs button').nth(i).tap(); await bounds('shop');
        if(i===2||i===3){
          assert.equal(await page.locator('.store-item').count(),i===2?18:11);
          await page.waitForFunction(()=>[...document.querySelectorAll('.store-item img')].every(e=>e.complete&&e.naturalWidth===256));
          if(width===390||width===1440)await page.screenshot({path:path.join(process.env.TEMP||root,`signal-jam-shop-${i}-${width}.png`),fullPage:true});
          if(width===390){
            for(let j=1;j<(i===2?18:11);j++){
              await page.locator('.store-item').nth(j).getByRole('button',{name:/Preview/}).tap();
              await page.waitForFunction(()=>{const e=document.querySelector('.cosmetic-detail-art img');return e?.complete&&e.naturalWidth===256});
              await bounds('premium preview');
              assert(await page.locator('.preview-stage').evaluate(e=>e.scrollWidth<=e.clientWidth+1),'Preview must not clip the sample board');
              if(j===1) await page.screenshot({path:path.join(process.env.TEMP||root,`signal-jam-premium-${i}.png`),fullPage:true});
              await page.locator('#shopPreviewClose').tap();
            }
            await page.locator('.store-item').nth(1).getByRole('button',{name:/Buy/}).tap();
            const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('nightshift.v1')));
            assert.equal(i===2?saved.mineSkin:saved.flagSkin,i===2?'orbit':'ember');
          }
        }
        await page.locator('.store-item button').filter({hasText:'PREVIEW'}).first().tap();
        await bounds('preview'); await page.locator('#shopPreviewClose').tap();
      }
      await page.locator('#shopBackBtn').tap();
      await page.locator('#playCareerBtn').tap(); await bounds('career');
      await page.locator('#levelGrid button').first().tap();
      const cell = index => page.locator(`#board .cell[data-index="${index}"]`);
      const hold = async (index, action='hold') => {
        const target=cell(index); await target.scrollIntoViewIfNeeded();
        await target.dispatchEvent('pointerdown',{pointerType:'touch',pointerId:1,isPrimary:true,clientX:100,clientY:100});
        if(action==='move') await target.dispatchEvent('pointermove',{pointerType:'touch',pointerId:1,clientX:125,clientY:100});
        if(action==='cancel') await target.dispatchEvent('pointercancel',{pointerType:'touch',pointerId:1});
        await page.waitForTimeout(510);
        await target.dispatchEvent('contextmenu',{pointerType:'touch'});
        await target.dispatchEvent('pointerup',{pointerType:'touch',pointerId:1});
        await target.dispatchEvent('click',{detail:1});
      };
      await hold(0); assert.equal(await cell(0).getAttribute('class'),'cell flagged');
      await hold(0); assert.equal(await cell(0).getAttribute('class'),'cell');
      await hold(1,'move'); assert.equal(await cell(1).getAttribute('class'),'cell');
      await hold(2,'cancel'); assert.equal(await cell(2).getAttribute('class'),'cell');
      if(width===390) {
        await cell(4).scrollIntoViewIfNeeded();
        const r=await cell(4).boundingBox(), cdp=await context.newCDPSession(page);
        for(let i=0;i<2;i++) {
          await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+r.width/2,y:r.y+r.height/2}]});
          await page.waitForTimeout(520);
          await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
          await page.waitForTimeout(100);
          assert.equal(await cell(4).getAttribute('class'),i===0?'cell flagged':'cell','Native touch hold must flag/unflag without revealing');
        }
        await cdp.detach();
      }
      if(await page.locator('#touchFlag').isVisible()) {await page.locator('#touchFlag').tap();await cell(3).tap()}
      else await cell(3).click({button:'right'});
      assert.match(await cell(3).getAttribute('class'),/flagged/);
      await page.locator('#pauseBtn').tap(); await bounds('pause');
      await page.locator('#resumeBtn').tap(); await cell(0).tap();
      assert.match(await cell(0).getAttribute('class'),/revealed/);
      await cell(0).focus(); await page.keyboard.press('p');
      assert(await page.locator('#pauseMask').isVisible(),'P must pause once when a cell has focus');
      await page.keyboard.press('p'); assert(!(await page.locator('#pauseMask').isVisible()));
      await page.evaluate(()=>{const b=testGame.getBoard();for(const c of b.cells) if(!c.mine&&!c.revealed){if(c.flag)document.querySelector(`[data-index="${c.i}"]`).dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}));testGame.actReveal(c.i)}});
      await page.locator('.win-overlay').waitFor(); await bounds('win');
      if(width===390||width===1440) await page.screenshot({path:path.join(process.env.TEMP||root,`signal-jam-win-${width}.png`)});
      assert.equal(await page.locator('.end-overlay').evaluate(e=>getComputedStyle(e).position),'absolute');
      await page.getByRole('button',{name:'NEXT LEVEL',exact:true}).tap();
      await page.evaluate(()=>{const b=testGame.getBoard();testGame.actReveal(0);if(b.status==='playing')testGame.actReveal(b.cells.find(c=>c.mine).i)});
      await page.locator('.boom-overlay').waitFor(); await bounds('loss');
      await page.getByRole('button',{name:'RESTART',exact:true}).last().tap();
      await page.locator('#leaveBtn').tap(); await page.locator('#playBtn').tap();
      for(const difficulty of ['easy','medium','hard']) {
        await page.locator(`[data-profile="${difficulty}"]`).tap(); await bounds(difficulty);
        await page.setViewportSize({width:height,height:width});
        await page.waitForTimeout(60); await page.setViewportSize({width,height}); await page.waitForTimeout(60);
        const geometry=await page.locator('#board').evaluate(e=>({width:e.getBoundingClientRect().width,expected:Number(e.style.getPropertyValue('--cols'))*(parseInt(e.style.getPropertyValue('--cell'))+3)-3}));
        assert.equal(geometry.width,geometry.expected,'Board width must follow rotation');
        await page.locator('#leaveBtn').tap(); await page.locator('#playBtn').tap();
      }
      const dragField = async () => {
        await page.locator('#boardWrap').scrollIntoViewIfNeeded();
        const r=await page.locator('#boardWrap').boundingBox();
        const x=Math.min(width-20,r.x+r.width/2),y=Math.max(20,Math.min(height-30,r.y+r.height/2));
        const before=await page.evaluate(()=>({page:scrollY,x:boardWrap.scrollLeft,y:boardWrap.scrollTop}));
        const cdp=await context.newCDPSession(page);
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
        for(let i=1;i<=8;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-i*8,y:y-i*8}]});await page.waitForTimeout(20)}
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(350);
        const after=await page.evaluate(()=>({page:scrollY,x:boardWrap.scrollLeft,y:boardWrap.scrollTop}));
        assert.equal(after.page,before.page,'Grid dragging must not scroll the page');
        await cdp.detach(); return {before,after};
      };
      if(width===390) {
        await page.evaluate(()=>testGame.startGame('career',10));
        const count=await page.locator('#board .revealed').count();
        const {before,after}=await dragField(); assert.equal(before.x,after.x); assert.equal(before.y,after.y);
        assert.equal(await page.locator('#board .revealed').count(),count);
        assert.equal(await page.locator('#board .flagged').count(),0);
        await page.locator('#leaveBtn').tap(); await page.locator('#playBtn').tap();
      }
      await page.locator('#customCols').fill('1000');await page.locator('#customRows').fill('100');
      await page.locator('#customStartBtn').tap();await bounds('custom');
      assert(await page.locator('#board .cell').count()<5000);
      if(width===390){const {after}=await dragField();assert(after.x>0&&after.y>0,'Large grid should pan internally')}
      await page.locator('#boardWrap').evaluate(e=>{e.scrollLeft=e.scrollWidth;e.scrollTop=e.scrollHeight});
      await page.waitForTimeout(100);assert(await page.locator('#board .cell').count()>0);
      if(width===390) await dragField();
      await page.locator('#pauseBtn').tap();
      const pauseGeometry=await page.locator('#resumeBtn').evaluate(e=>{const r=e.getBoundingClientRect(),b=boardWrap.getBoundingClientRect();return r.left>=b.left&&r.right<=b.right&&r.top>=b.top&&r.bottom<=b.bottom});
      assert(pauseGeometry,'Resume must be inside the visible viewport on a scrolled large board');
      await page.locator('#resumeBtn').tap();
      await page.evaluate(()=>testGame.showHelp());await bounds('guide');await page.locator('#dialogClose').tap();
      await page.evaluate(()=>testGame.beginTutorial(true));await bounds('tutorial');
      for(let i=0;i<3;i++){await page.locator('#continueTutorial:enabled').waitFor();await page.locator('#continueTutorial').tap()}
      await page.locator('#tutorialOverlay').waitFor({state:'hidden'});
      assert.deepEqual(errors,[], 'No browser errors');
      await page.screenshot({path:path.join(process.env.TEMP||root,`signal-jam-${width}.png`)});
      console.log(`PASS ${width}x${height}: menus, touch, results, rotation, boards, guide, tutorial`);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
