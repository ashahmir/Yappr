const { chromium, expect } = require('@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
async function main(){
 const b=await chromium.launch({channel:'chrome',headless:true});
 try {
 const p=await b.newPage({viewport:{width:393,height:699},deviceScaleFactor:2}); p.setDefaultNavigationTimeout(180000); const errors=[];p.on('pageerror',e=>errors.push(e.message));
 const origin=process.env.HOME_PREVIEW_URL||'http://localhost:8081';
 const ready=async()=>{await p.evaluate(()=>Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,10000))]));await p.waitForFunction(()=>[...document.images].filter(i=>i.checkVisibility()).every(i=>i.complete));await p.waitForTimeout(400)};
 await fs.mkdir('artifacts/explore',{recursive:true});
 await p.goto(origin+'/explore',{waitUntil:'domcontentloaded',timeout:180000});await p.getByTestId('explore-grid').waitFor({timeout:120000});console.log('Explore loaded');await ready();
 for(const [width,height] of [[393,699],[360,640],[412,915],[768,1024]]){
  await p.setViewportSize({width,height});await ready();assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:`artifacts/explore/explore-${width}.png`});
 }
 await p.setViewportSize({width:393,height:699});
 await p.getByRole('button',{name:'Food',exact:true}).click();await expect(p.getByTestId('post-slow-morning')).toBeVisible();await expect(p.getByTestId('post-jamie-santorini')).toHaveCount(0);
 await p.getByRole('button',{name:'For you',exact:true}).click();
 await p.getByRole('textbox').fill('no-such-place');await expect(p.getByText('No posts found')).toBeVisible();await p.getByRole('button',{name:'Clear search'}).click();
 await p.getByRole('button',{name:'Filter posts'}).click();await p.getByRole('radio',{name:'Videos'}).click();await expect(p.getByTestId('post-skate-day')).toBeVisible();await expect(p.getByTestId('post-jamie-santorini')).toHaveCount(0);
 await p.getByRole('button',{name:'Filter posts'}).click();await p.getByRole('radio',{name:'All posts'}).click();
 await p.getByTestId('post-jamie-santorini').click();await p.getByTestId('post-detail').waitFor();await ready();await p.screenshot({path:'artifacts/explore/detail-393.png'});
 await p.getByTestId('detail-like').click();await expect(p.getByTestId('detail-like')).toHaveAttribute('aria-label','Like post, 11999 likes');
 await p.getByRole('button',{name:'Follow Jamie Chen',exact:true}).click();await expect(p.getByRole('button',{name:'Unfollow Jamie Chen',exact:true})).toBeVisible();
 await p.getByRole('button',{name:'Save post',exact:true}).click();await expect(p.getByRole('button',{name:'Unsave post',exact:true})).toBeVisible();
 await p.getByRole('button',{name:'Back to feed'}).click();await expect(p.getByTestId('explore-grid')).toBeVisible();
 await p.getByTestId('post-jamie-santorini').click();await expect(p.getByTestId('detail-like')).toHaveAttribute('aria-label','Like post, 11999 likes');await p.getByTestId('detail-like').click();
 for(const [width,height] of [[360,640],[412,915],[768,1024]]){await p.setViewportSize({width,height});await ready();assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:`artifacts/explore/detail-${width}.png`});}
 console.log('Checking Home');await p.goto(origin+'/home-preview',{waitUntil:'domcontentloaded'});await p.getByTestId('home-feed').waitFor();await p.getByRole('button',{name:/^View Jamie.s photo$/}).click();await expect(p.getByTestId('post-detail')).toBeVisible();await expect(p.getByTestId('post-detail').getByText('Jamie Chen',{exact:true})).toBeVisible();
 await p.goto(origin+'/post/missing',{waitUntil:'domcontentloaded'});await expect(p.getByText('Post not found')).toBeVisible();
 console.log('Checking guards');for(const route of ['home','account','profile']){await p.goto(origin+'/'+route,{waitUntil:'domcontentloaded'});await expect(p.getByRole('button',{name:'Continue with Google'})).toBeVisible({timeout:30000});}
 assert.deepEqual(errors,[]);console.log('PASS: four viewport screenshots; search, category/media filtering, empty state, detail routing from Explore/Home, shared likes, follow/save, missing post, protected routes, no browser runtime errors.');
 }finally{await b.close()}
}
main().catch(e=>{console.error(e);process.exitCode=1});

