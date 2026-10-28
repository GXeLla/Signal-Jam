const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=process.env.TEMP||root;
(async()=>{
 const browser=await chromium.launch({channel:'chrome'});
 try{
  for(const [stamp,event,theme,width] of [
   ['2026-10-28T12:00:00','halloween','classic',390],
   ['2026-10-28T12:00:00','halloween','aurora-frost',390],
   ['2026-12-31T12:00:00','newyear','classic',390],
   ['2026-12-31T12:00:00','newyear','aurora-frost',390],
   ['2027-01-08T12:00:00',null,'aurora-frost',390],
   ['2026-10-28T12:00:00','halloween','classic',1440],
   ['2026-12-31T12:00:00','newyear','classic',1440],
  ]){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route('https://signal.test/**',route=>{const name=new URL(route.request().url()).pathname.slice(1)||'index.html';return route.fulfill({body:fs.readFileSync(path.join(root,name)),contentType:name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':name.endsWith('.webp')?'image/webp':'text/html'})});
   await page.addInitScript(({stamp,theme})=>{
    const RealDate=Date,fixed=new RealDate(stamp).getTime();
    window.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[fixed]))}static now(){return fixed}};
    localStorage.setItem('nightshift.v1',JSON.stringify({tutorialSeen:true,unlocked:100,coins:10000,ownedThemes:['classic','aurora-frost','ember'],theme,ownedMines:['classic','tnt'],mineSkin:'tnt',ownedFlags:['classic','alloy'],flagSkin:'alloy',prefs:{sound:false,quality:'high'}}));
   },{stamp,theme});
   await page.goto('https://signal.test/');await page.locator('#loadingScreen').waitFor({state:'hidden'});
   const base=await page.evaluate(()=>({event:document.body.dataset.event||null,accent:getComputedStyle(document.body).getPropertyValue('--cyan').trim(),theme:[...document.body.classList].filter(x=>x.startsWith('theme-'))}));
   assert.equal(base.event,event);assert.deepEqual(base.theme,['theme-'+theme]);
   if(theme==='aurora-frost')assert.equal(base.accent,'#9deaff');
   if(theme==='classic'&&event==='halloween')assert.equal(base.accent,'#ffab50');
   if(theme==='classic'&&event==='newyear')assert.equal(base.accent,'#efc96d');
   if(event){assert.equal(await page.locator('#seasonDecor').evaluate(e=>getComputedStyle(e).pointerEvents),'none');assert.equal(await page.locator('.season-motion').first().evaluate(e=>getComputedStyle(e).animationName),'none')}
   const check=async label=>{
    const bad=await page.evaluate(()=>[...document.querySelectorAll('button,input')].filter(e=>e.getClientRects().length&&!e.closest('#board')).filter(e=>{const r=e.getBoundingClientRect();return r.left< -1||r.right>innerWidth+1}).map(e=>e.id||e.textContent));
    assert.deepEqual(bad,[],label+' horizontal clipping');assert.equal(await page.locator('body').getAttribute('data-event'),event);
   };
   await check('menu');await page.screenshot({path:path.join(out,`season-${event||'off'}-${theme}-${width}.png`),fullPage:true});
   await page.locator('#playBtn').click();await check('difficulty');await page.locator('[data-profile="easy"]').click();await check('game');
   await page.locator('#board .cell[data-index="0"]').click({button:'right'});
   const icon=page.locator('#board .cell[data-index="0"] img');await icon.waitFor();assert.match(await icon.getAttribute('src'),/flag-steel/);
   await page.screenshot({path:path.join(out,`season-game-${event||'off'}-${theme}-${width}.png`),fullPage:true});
   await page.locator('#leaveBtn').click();await page.locator('#playCareerBtn').click();await check('career');await page.locator('#careerScreen [data-back-menu]').click();
   await page.locator('#mainShopBtn').click();await check('shop');
   await page.getByRole('button',{name:'THEMES',exact:true}).click();
   const frost=page.locator('.store-item[data-item-id="aurora-frost"]');assert.match(await frost.textContent(),/Aurora Frost/);
   if(theme==='classic'){
    await frost.getByRole('button',{name:/owned/}).click();
    assert.equal(await page.locator('body').getAttribute('data-event'),event);
    assert(await page.locator('body').evaluate(e=>e.classList.contains('theme-aurora-frost')&&!e.classList.contains('theme-classic')));
    assert.equal(await page.locator('body').evaluate(e=>getComputedStyle(e).getPropertyValue('--cyan').trim()),'#9deaff');
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('nightshift.v1')));assert.equal(saved.mineSkin,'tnt');assert.equal(saved.flagSkin,'alloy');
    await page.locator('.store-item[data-item-id="ember"]').getByRole('button',{name:/owned/}).click();
    assert.equal(await page.locator('body').evaluate(e=>getComputedStyle(e).getPropertyValue('--cyan').trim()),'#ff9b61');
    assert(!(await page.locator('body').evaluate(e=>e.classList.contains('theme-aurora-frost'))));
   }
   await page.locator('#shopBackBtn').click();await page.locator('#optionsBtn').click();await check('settings');
   if(event){await page.locator('#qualityBtn').click();assert.equal(await page.locator('.season-motion').first().evaluate(e=>getComputedStyle(e).display),'none')}
   assert.deepEqual(errors,[]);console.log('PASS',stamp,event,theme,width);await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
