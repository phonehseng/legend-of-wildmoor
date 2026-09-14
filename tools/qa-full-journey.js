(() => {
  const travel=window.__journey?.travel||[];
  const move=pos=>{travel.push({from:P.pos.clone(),to:V3(pos.x,pos.y,pos.z)});P.pos.copy(pos);P.vel.set(0,0,0);P.swim=false;P.swimVol=null;P.gehDive=null;P.climb=null;P.grounded=true;visY=P.pos.y;lastSafePos.copy(P.pos);updateCurrentRoom();};
  const check=(value,name)=>{if(!value)throw Error(name);return name;};
  const act=()=>{const was=paused;paused=false;P.interactCd=0;interact();paused=was;};
  const talk=person=>{move(person.pos || person);act();};
  const tick=(seconds,fn=update)=>{const was=paused;paused=false;for(let i=0;i<Math.ceil(seconds/.05);i++){if(fn===update)time+=.05;fn(.05,.05);}paused=was;};
  const collect=id=>{const item=pickups.find(p=>p.id===id);check(item,'pickup exists '+id);move(item.mesh.position);for(let i=0;i<15&&!item.taken;i++)act();check(item.taken,'pickup taken '+id);return item.label;};
  const herb=()=>{const item=herbs.find(h=>!h.taken);check(item,'unused herb exists');move(item.pos);for(let i=0;i<15&&!item.taken;i++)act();check(item.taken,'herb taken');};
  const fight=e=>{let swings=0;while(e.alive&&swings<250){if(P.hp<2)herb();move(e.pos.clone().add(V3(0,0,2)));P.heading=Math.PI;attackPressed();tick(1);swings++;if(death)throw Error('player died fighting '+e.kind);}check(!e.alive,'defeated '+e.kind);return swings;};
  window.__journey={move,check,act,talk,tick,collect,herb,fight,travel};
  return {ready:true};
})()
