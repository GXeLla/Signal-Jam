// Split generated transparent production atlases into individual game assets.
const sharp=require('sharp'),fs=require('node:fs/promises'),path=require('node:path');
const source=process.argv[2];
if(!source)throw new Error('Pass the generated image directory.');
const output=path.resolve(__dirname,'../assets/cosmetics');
const groups=[
  {file:'exec-a0e8ab84-1b03-4c4c-84d1-31d4c261945b.png',cols:4,ys:[0,374,712,1086],ids:['reactor','tnt','lava','clockwork','pumpkin','frost','spider','corsair','porcelain','slime','sushi']},
  {file:'exec-8e76b585-a1f7-46ee-98ee-733604e101a8.png',cols:3,ids:['stone','dynamite','powder-keg','pressure','acorn','cracked-ceramic']},
  {file:'exec-a491061a-49c8-4cce-b54d-edd6cb548448.png',cols:5,ids:['flag-lava','flag-steel','flag-angler','flag-slime','flag-moon','flag-porcelain','flag-checkered','flag-cross','flag-pirate','flag-silk']},
];
(async()=>{
  await fs.mkdir(output,{recursive:true});
  for(const group of groups){
    const filename=path.join(source,group.file),meta=await sharp(filename).metadata();
    if(!meta.hasAlpha)throw new Error('Atlas must have transparency.');
    for(const [i,id] of group.ids.entries()){
      const row=Math.floor(i/group.cols),col=i%group.cols;
      const left=Math.round(col*meta.width/group.cols),right=Math.round((col+1)*meta.width/group.cols);
      const top=group.ys?group.ys[row]:Math.round(row*meta.height/2),bottom=group.ys?group.ys[row+1]:Math.round((row+1)*meta.height/2);
      const {data,info}=await sharp(filename).extract({left,top,width:right-left,height:bottom-top}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
      let x0=info.width,y0=info.height,x1=0,y1=0;
      for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>12){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
      if(x0>x1)throw new Error('Empty icon: '+id);
      const image=await sharp(data,{raw:info}).extract({left:x0,top:y0,width:x1-x0+1,height:y1-y0+1}).resize(232,232,{fit:'contain',background:'#00000000'}).extend({top:12,bottom:12,left:12,right:12,background:'#00000000'}).png().toBuffer();
      await fs.writeFile(path.join(output,id+'.png'),image);
      await sharp(image).webp({quality:92,alphaQuality:100,effort:6}).toFile(path.join(output,id+'.webp'));
      console.log(id);
    }
  }
})().catch(e=>{console.error(e);process.exitCode=1});
