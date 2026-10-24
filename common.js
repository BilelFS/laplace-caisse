/* La Place — code partagé caisse + tableau de bord */
'use strict';

/* ---------- utilitaires ---------- */
function $(id){return document.getElementById(id)}
function each(list,fn){Array.prototype.forEach.call(list,fn)}
function fmt(m){return (m/1000).toFixed(3).replace('.',',')}
function fmtShort(m){var v=m/1000;return (Math.round(v*10)/10).toString().replace('.',',')}
function parseDT(v){v=String(v==null?'':v).replace(',','.').trim();if(v===''||v==='.')return NaN;if(!/^\d*\.?\d*$/.test(v))return NaN;var n=parseFloat(v);return isNaN(n)?NaN:Math.round(n*1000)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
function pad2(n){return (n<10?'0':'')+n}
function hm(ts){var d=new Date(ts);return pad2(d.getHours())+':'+pad2(d.getMinutes())}
function dstr(ts){var d=new Date(ts);return pad2(d.getDate())+'/'+pad2(d.getMonth()+1)+'/'+d.getFullYear()}
function svcLabel(t){return t==='matin'?'☀️ Matin':'🌙 Soir'}
function clone(o){return JSON.parse(JSON.stringify(o))}
function toast(msg,ms){var t=$('toast');if(!t)return;t.textContent=msg;t.style.display='block';clearTimeout(toast._t);toast._t=setTimeout(function(){t.style.display='none'},ms||2600)}
function lsGet(k){try{var v=localStorage.getItem(k);return v?JSON.parse(v):null}catch(e){return null}}
function lsSet(k,v){try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,JSON.stringify(v))}catch(e){}}

/* ---------- menu ---------- */
var COLORS = ['#a0703c','#3f9a5a','#e08a1e','#2e7fd1','#c9a227','#8e5bd1','#d4a843','#d1495b','#2aa198','#7f8c8d'];
var ICON_CHOICES = ['☕','🥛','🍵','🫖','🌿','🍫','🍋','🍓','🍊','🍎','🍏','🍌','🍉','🍍','🥭','🍹','🧃','🥤','💧','🧊','🍺','🥐','🥖','🍰','🧁','🍩','🍪','🥮','🥞','🧇','🍕','🥪','🌯','🍔','🍟','🥗','🍳','🧀','💨','🌙','☀️','🌤️','⭐','🎁','🌰','🍯','🍨','🍦'];
var DEFAULT_MENU = [
  {id:'cafe',fr:'Café',ar:'قهوة',ic:'☕',col:'#a0703c',items:[
    {id:'espresso',name:'Espresso',ar:'إسبريسو',price:2500,ic:'☕'},{id:'alonge',name:'Alongé',ar:'ألونجي',price:2500,ic:'☕'},
    {id:'double',name:'Double espresso',ar:'إسبريسو دوبل',price:2800,ic:'☕'},{id:'cappuccino',name:'Cappuccino',ar:'كابوسان',price:2800,ic:'☕'},
    {id:'americano',name:'Americano',ar:'أمريكانو',price:2700,ic:'☕'},{id:'direct',name:'Café direct',ar:'قهوة ديراكت',price:3000,ic:'🥛'},
    {id:'creme',name:'Café crème',ar:'قهوة كريمة',price:3000,ic:'🥛'},{id:'macchiato',name:'Macchiato',ar:'ماكياتو',price:2800,ic:'☕'}]},
  {id:'chaud',fr:'Boissons chaudes',ar:'مشروبات ساخنة',ic:'🍵',col:'#3f9a5a',items:[
    {id:'the_menthe',name:'Thé à la menthe',ar:'تاي بالنعناع',price:2000,ic:'🌿'},{id:'the_amandes',name:'Thé aux amandes',ar:'تاي باللوز',price:3000,ic:'🍵'},
    {id:'the_pignons',name:'Thé aux pignons',ar:'تاي بالبندق',price:3000,ic:'🍵'},{id:'qahwa',name:'Qahwa arbi',ar:'قهوة عربي',price:2500,ic:'🫖'},
    {id:'chocolat',name:'Chocolat chaud',ar:'شوكولا ساخنة',price:3500,ic:'🍫'}]},
  {id:'jus',fr:'Jus frais',ar:'عصير طازج',ic:'🍹',col:'#e08a1e',items:[
    {id:'citronnade',name:'Citronnade',ar:'ليموناضة',price:2500,ic:'🍋'},{id:'fraise',name:'Fraise',ar:'فراولة',price:3000,ic:'🍓'},
    {id:'orange',name:'Orange',ar:'برتقال',price:2500,ic:'🍊'},{id:'mojito',name:'Mojito',ar:'موخيتو',price:2500,ic:'🌿'},
    {id:'cocktail',name:'Cocktail',ar:'كوكتيل',price:3000,ic:'🍹'},{id:'jus_autre',name:'Jus autre',ar:'أخرى',price:3000,ic:'🧃'}]},
  {id:'froid',fr:'Boissons froides',ar:'مشروبات باردة',ic:'🥤',col:'#2e7fd1',items:[
    {id:'jus_bouteille',name:'Jus en bouteille',ar:'عصير قارورة',price:3000,ic:'🧃'},{id:'coca',name:'Coca',ar:'كوكا',price:2500,ic:'🥤'},
    {id:'fanta',name:'Fanta',ar:'فانتا',price:2500,ic:'🥤'},{id:'sprite',name:'Sprite',ar:'سبرايت',price:2500,ic:'🥤'},
    {id:'eau05',name:'Eau 0,5 L',ar:'ماء 0.5 ل',price:1500,ic:'💧'},{id:'eau15',name:'Eau 1,5 L',ar:'ماء 1.5 ل',price:2000,ic:'💧'}]},
  {id:'patis',fr:'Pâtisserie',ar:'مخبوزات',ic:'🥐',col:'#c9a227',items:[
    {id:'croissant',name:'Croissant',ar:'كرواسون',price:1700,ic:'🥐'},{id:'painchoc',name:'Pain au chocolat',ar:'كرواسون بالشوكولاتة',price:2000,ic:'🍫'},
    {id:'cake',name:'Cake',ar:'كيك',price:1500,ic:'🍰'},{id:'libanaise',name:'Libanaise',ar:'لبنانية',price:1700,ic:'🥮'}]},
  {id:'chicha',fr:'Chicha',ar:'شيشة',ic:'💨',col:'#8e5bd1',items:[
    {id:'chicha_classique',name:'Chicha classique',ar:'عادية',price:5500,ic:'💨'},{id:'chicha_parfumee',name:'Chicha pomme/menthe',ar:'معطرة',price:6500,ic:'🍏'},
    {id:'chicha_speciale',name:'Chicha spéciale',ar:'خاصة',price:7000,ic:'🍓'}]},
  {id:'offres',fr:'Offres',ar:'عروض',ic:'⭐',col:'#d4a843',items:[
    {id:'of_matin',name:'Offre matin',ar:'كرواسون + إسبريسو',price:3500,ic:'☀️',from:7,to:11,detail:'Croissant + Espresso'},
    {id:'of_midi',name:'Offre midi',ar:'بان شوكولا + عصير',price:4000,ic:'🌤️',from:11,to:17,detail:'Pain au chocolat + Jus'},
    {id:'of_speciale',name:'Offre spéciale',ar:'كابوسان + بان شوكولا + عصير',price:6500,ic:'⭐',from:17,to:2,detail:'Cappuccino + Pain choc + Jus'},
    {id:'night_the',name:'Night chicha + thé',ar:'شيشة + تاي',price:7500,ic:'🌙',from:17,to:2,detail:'Chicha + Thé menthe'},
    {id:'night_boisson',name:'Night chicha + boisson',ar:'شيشة + مشروب',price:8000,ic:'🌙',from:17,to:2,detail:'Chicha + Coca/Fanta/Sprite'},
    {id:'supp_amandes',name:'Supplément amandes',ar:'لوز',price:1000,ic:'🌰'},{id:'supp_pignons',name:'Supplément pignons',ar:'بندق',price:1500,ic:'🌰'}]}
];
/* Ancien format (V1/V2 : tableaux) -> objets. Les heures "jusqu'à 26h" deviennent 2h. */
function migrateMenu(menu){
  if(!menu||!menu.length)return clone(DEFAULT_MENU);
  return menu.map(function(c){var def=null;DEFAULT_MENU.forEach(function(d){if(d.id===c.id)def=d});
    var cat={id:c.id,fr:c.fr,ar:c.ar||'',ic:c.ic||'•',col:c.col||(def?def.col:COLORS[0]),items:[]};
    cat.items=(c.items||[]).map(function(it){
      if(Array.isArray(it)){var o={id:it[0],name:it[1],ar:it[2]||'',price:it[3]};var di=null;
        if(def)def.items.forEach(function(x){if(x.id===it[0])di=x});
        o.ic=di?di.ic:cat.ic;if(it.length>=6){o.from=it[4];o.to=it[5]%24}if(di&&di.detail)o.detail=di.detail;return o}
      return it});
    return cat})}
function itemActiveNow(it,date){if(it.from==null||it.to==null)return null;var h=(date||new Date()).getHours();
  return it.from<=it.to?(h>=it.from&&h<it.to):(h>=it.from||h<it.to)}
function allItems(menu){var out=[];menu.forEach(function(c){c.items.forEach(function(i){out.push({cat:c,it:i})})});return out}
function findIn(menu,id){var r=null;menu.forEach(function(c){c.items.forEach(function(i){if(i.id===id)r={cat:c,it:i}})});return r}

/* ---------- modales ---------- */
function modal(o){
  var ov=document.createElement('div');ov.className='ov';
  ov.innerHTML='<div class="md '+(o.cls||'')+'">'+(o.title!=null?'<div class="mh"><h2>'+o.title+'</h2>'+(o.locked?'':'<button class="mx" data-x aria-label="Fermer">✕</button>')+'</div>':'')+
    '<div class="mb">'+(o.body||'')+'</div>'+(o.foot?'<div class="mf">'+o.foot+'</div>':'')+'</div>';
  document.body.appendChild(ov);
  function close(){if(ov.parentNode)ov.parentNode.removeChild(ov);if(o.onClose)o.onClose()}
  if(!o.locked){ov.addEventListener('click',function(e){if(e.target===ov)close()});var x=ov.querySelector('[data-x]');if(x)x.onclick=close}
  ov.close=close;ov.q=function(s){return ov.querySelector(s)};ov.qa=function(s){return ov.querySelectorAll(s)};return ov}
function confirmBox(msg,okLabel,cb,danger){
  var m=modal({title:'Confirmation',cls:'sm',body:'<p style="font-size:18px;line-height:1.5;margin:4px 0">'+msg+'</p>',
    foot:'<button class="btn" data-n>Non</button><button class="btn main '+(danger?'red':'gold')+'" data-y>'+okLabel+'</button>'});
  m.q('[data-n]').onclick=m.close;m.q('[data-y]').onclick=function(){m.close();cb()}}
function keypad(el,opt){var v='';opt=opt||{};
  var keys=['1','2','3','4','5','6','7','8','9',opt.decimal?',':'C','0','⌫'];
  el.className='kp';el.innerHTML=keys.map(function(k){return '<button type="button" data-k="'+k+'">'+k+'</button>'}).join('');
  el.addEventListener('click',function(e){var b=e.target.closest('[data-k]');if(!b)return;var k=b.dataset.k;
    if(k==='⌫')v=v.slice(0,-1);else if(k==='C')v='';
    else if(k===','){if(v.indexOf(',')<0)v=(v||'0')+','}
    else{if(opt.max&&v.length>=opt.max)return;var p=v.split(',');if(p.length>1&&p[1].length>=3)return;if(p.length===1&&p[0].length>=5)return;v=(v==='0'?'':v)+k}
    if(opt.onChange)opt.onChange(v)});
  return {set:function(x){v=x;if(opt.onChange)opt.onChange(v)},get:function(){return v}}}

/* ---------- éditeur de menu (caisse + tableau de bord) ---------- */
function MenuEditor(host,menu,onSave){
  var M=clone(menu),sel=M[0]?M[0].id:null,dirty=false;
  function cat(){return M.filter(function(c){return c.id===sel})[0]}
  function mark(){dirty=true;host.dispatchEvent(new Event('menuchange'))}
  function render(){var c=cat();
    host.innerHTML='<div class="me"><div class="me-cats"><div class="row" style="margin-bottom:6px"><b class="grow">Catégories</b><button class="hbtn" data-addcat>＋ Catégorie</button></div>'+
      M.map(function(k,i){return '<div class="me-cat'+(k.id===sel?' sel':'')+'" data-cat="'+k.id+'" style="border-left-color:'+k.col+'"><span class="ic">'+k.ic+'</span><span class="t">'+esc(k.fr)+' <span class="muted small">('+k.items.length+')</span></span>'+
        (k.id===sel?'<button class="ib" data-cu="'+i+'" '+(i?'':'disabled')+' aria-label="Monter">▲</button><button class="ib" data-cd="'+i+'" '+(i<M.length-1?'':'disabled')+' aria-label="Descendre">▼</button><button class="ib" data-ce aria-label="Modifier">✎</button>':'')+'</div>'}).join('')+
      '</div><div class="me-items">'+(c?'<div class="row" style="margin-bottom:6px"><b class="grow">'+c.ic+' '+esc(c.fr)+'</b><button class="hbtn" data-additem>＋ Article</button></div>'+
      (c.items.length?c.items.map(function(it,i){var hours=it.from!=null?'<span> · '+it.from+'h–'+it.to+'h</span>':'';
        return '<div class="me-it'+(it.off?' off':'')+'"><span class="ic">'+(it.ic||c.ic)+'</span><div class="t"><b>'+esc(it.name)+'</b><span>'+esc(it.ar||'')+hours+(it.off?' · masqué':'')+'</span></div><span class="p">'+fmt(it.price)+'</span>'+
          '<button class="ib" data-iu="'+i+'" '+(i?'':'disabled')+' aria-label="Monter">▲</button><button class="ib" data-id="'+i+'" '+(i<c.items.length-1?'':'disabled')+' aria-label="Descendre">▼</button>'+
          '<button class="ib" data-ie="'+i+'" aria-label="Modifier">✎</button></div>'}).join(''):'<div class="muted" style="padding:20px 0">Aucun article. Touchez « ＋ Article ».</div>'):'<div class="muted">Créez une catégorie.</div>')+'</div></div>';
  }
  host.addEventListener('click',function(e){var b=e.target.closest('button,[data-cat]');if(!b)return;var c=cat(),d=b.dataset;
    if(d.addcat!=null)return editCat(null);
    if(d.additem!=null)return editItem(null);
    if(d.ce!=null)return editCat(c);
    if(d.cu!=null){var i=+d.cu;M.splice(i-1,0,M.splice(i,1)[0]);mark();return render()}
    if(d.cd!=null){var j=+d.cd;M.splice(j+1,0,M.splice(j,1)[0]);mark();return render()}
    if(d.iu!=null){var k=+d.iu;c.items.splice(k-1,0,c.items.splice(k,1)[0]);mark();return render()}
    if(d.id!=null&&b.tagName==='BUTTON'){var l=+d.id;c.items.splice(l+1,0,c.items.splice(l,1)[0]);mark();return render()}
    if(d.ie!=null)return editItem(c.items[+d.ie]);
    if(d.cat!=null&&b.tagName!=='BUTTON'){sel=d.cat;render()}});
  function iconPicker(cur){return '<div class="icons">'+ICON_CHOICES.map(function(ic){return '<button type="button" data-ic="'+ic+'" class="'+(ic===cur?'sel':'')+'">'+ic+'</button>'}).join('')+'</div>'}
  function bindPicker(m,cb){each(m.qa('[data-ic]'),function(b){b.onclick=function(){each(m.qa('[data-ic]'),function(x){x.className=''});b.className='sel';cb(b.dataset.ic)}})}
  function editCat(c){var isNew=!c,ic=c?c.ic:'☕',col=c?c.col:COLORS[M.length%COLORS.length];
    var m=modal({title:isNew?'Nouvelle catégorie':'Modifier la catégorie',body:
      '<div class="fgrid"><div><label class="f">Nom (français)</label><input class="inp" id="cf" maxlength="30"></div><div><label class="f">Nom (arabe)</label><input class="inp" id="ca" dir="rtl" maxlength="30"></div></div>'+
      '<label class="f">Couleur</label><div class="swatches">'+COLORS.map(function(x){return '<button type="button" data-col="'+x+'" style="background:'+x+'" class="'+(x===col?'sel':'')+'" aria-label="'+x+'"></button>'}).join('')+'</div>'+
      '<label class="f">Icône</label>'+iconPicker(ic),
      foot:(isNew?'':'<button class="btn red" data-del>🗑 Supprimer</button>')+'<button class="btn" data-cc>Annuler</button><button class="btn gold main" data-ok>Enregistrer</button>'});
    m.q('#cf').value=c?c.fr:'';m.q('#ca').value=c?c.ar:'';
    bindPicker(m,function(v){ic=v});
    each(m.qa('[data-col]'),function(b){b.onclick=function(){each(m.qa('[data-col]'),function(x){x.className=''});b.className='sel';col=b.dataset.col}});
    m.q('[data-cc]').onclick=m.close;
    if(!isNew)m.q('[data-del]').onclick=function(){confirmBox('Supprimer la catégorie « '+esc(c.fr)+' »'+(c.items.length?' et ses '+c.items.length+' articles':'')+' ?<br><span class="muted small">Les ventes passées restent dans les rapports.</span>','Supprimer',function(){
      M=M.filter(function(x){return x!==c});sel=M[0]?M[0].id:null;mark();m.close();render()},true)};
    m.q('[data-ok]').onclick=function(){var fr=m.q('#cf').value.trim();if(!fr){m.q('#cf').focus();return toast('Donnez un nom')}
      if(isNew){c={id:'c_'+uid(),items:[]};M.push(c);sel=c.id}
      c.fr=fr;c.ar=m.q('#ca').value.trim();c.ic=ic;c.col=col;mark();m.close();render()};
    if(isNew)setTimeout(function(){m.q('#cf').focus()},50)}
  function editItem(it){var c=cat(),isNew=!it,ic=it?(it.ic||c.ic):c.ic;
    var m=modal({title:isNew?'Nouvel article · '+esc(c.fr):'Modifier l\'article',cls:'wide',body:
      '<div class="fgrid"><div><label class="f">Nom (français, sur le ticket)</label><input class="inp" id="in" maxlength="32"></div>'+
      '<div><label class="f">Nom (arabe)</label><input class="inp" id="ia" dir="rtl" maxlength="40"></div>'+
      '<div><label class="f">Prix (DT)</label><input class="inp" id="ip" inputmode="decimal" placeholder="2,500"></div>'+
      '<div><label class="f">Catégorie</label><select class="inp" id="ic">'+M.map(function(k){return '<option value="'+k.id+'">'+k.ic+' '+esc(k.fr)+'</option>'}).join('')+'</select></div></div>'+
      '<div class="tgl" style="margin-top:8px"><label class="tgl"><input type="checkbox" id="io"> Disponible à la vente</label></div>'+
      '<div class="tgl"><label class="tgl"><input type="checkbox" id="ih"> Offre à heures fixes</label></div>'+
      '<div class="fgrid" id="hrs"><div><label class="f">De (heure)</label><select class="inp" id="if">'+hourOpts()+'</select></div><div><label class="f">À (heure)</label><select class="inp" id="it">'+hourOpts()+'</select></div>'+
      '<div style="grid-column:1/-1"><label class="f">Détail imprimé sur le ticket</label><input class="inp" id="id" maxlength="44" placeholder="ex. Croissant + Espresso"></div></div>'+
      '<label class="f">Icône</label>'+iconPicker(ic),
      foot:(isNew?'':'<button class="btn red" data-del>🗑</button>')+'<button class="btn" data-cc>Annuler</button><button class="btn gold main" data-ok>Enregistrer</button>'});
    function hourOpts(){var s='';for(var h=0;h<24;h++)s+='<option value="'+h+'">'+pad2(h)+'h</option>';return s}
    m.q('#in').value=it?it.name:'';m.q('#ia').value=it?(it.ar||''):'';m.q('#ip').value=it?fmt(it.price):'';m.q('#ic').value=c.id;
    m.q('#io').checked=!it||!it.off;var timed=!!(it&&it.from!=null);m.q('#ih').checked=timed;
    m.q('#if').value=String(it&&it.from!=null?it.from:7);m.q('#it').value=String(it&&it.to!=null?it.to:11);m.q('#id').value=it&&it.detail?it.detail:'';
    function sh(){m.q('#hrs').style.display=m.q('#ih').checked?'':'none'}sh();m.q('#ih').onchange=sh;
    bindPicker(m,function(v){ic=v});m.q('[data-cc]').onclick=m.close;
    if(!isNew)m.q('[data-del]').onclick=function(){confirmBox('Supprimer « '+esc(it.name)+' » ?<br><span class="muted small">Astuce : décochez « Disponible » pour le masquer sans le supprimer.</span>','Supprimer',function(){
      c.items=c.items.filter(function(x){return x!==it});mark();m.close();render()},true)};
    m.q('[data-ok]').onclick=function(){var name=m.q('#in').value.trim(),price=parseDT(m.q('#ip').value);
      if(!name){m.q('#in').focus();return toast('Donnez un nom')}
      if(isNaN(price)||price<0||price>999000){m.q('#ip').focus();return toast('Prix invalide (ex. 2,500)')}
      var o=it||{id:'p_'+uid()};o.name=name;o.ar=m.q('#ia').value.trim();o.price=price;o.ic=ic;
      if(m.q('#io').checked)delete o.off;else o.off=true;
      if(m.q('#ih').checked){o.from=+m.q('#if').value;o.to=+m.q('#it').value;o.detail=m.q('#id').value.trim()}else{delete o.from;delete o.to;delete o.detail}
      var target=m.q('#ic').value;
      if(isNew){M.filter(function(k){return k.id===target})[0].items.push(o)}
      else if(target!==c.id){c.items=c.items.filter(function(x){return x!==o});M.filter(function(k){return k.id===target})[0].items.push(o)}
      sel=target;mark();m.close();render()};
    if(isNew)setTimeout(function(){m.q('#in').focus()},50)}
  render();
  return {get:function(){return clone(M)},dirty:function(){return dirty},save:function(){dirty=false;return onSave(clone(M))}}}

/* ---------- nuage (Supabase REST, sans dépendance) ---------- */
var Cloud = {
  cfg:function(){return window.LP_CONFIG||{}},
  configured:function(){var c=this.cfg();return !!(c.supabaseUrl&&c.anonKey)},
  req:function(method,path,body,token,extra){var c=this.cfg(),h={'apikey':c.anonKey,'Content-Type':'application/json'};
    if(token)h.Authorization='Bearer '+token;if(extra)Object.keys(extra).forEach(function(k){h[k]=extra[k]});
    var ctl=window.AbortController?new AbortController():null,tm=ctl?setTimeout(function(){ctl.abort()},20000):null;
    return fetch(c.supabaseUrl.replace(/\/$/,'')+path,{method:method,headers:h,body:body==null?undefined:JSON.stringify(body),signal:ctl?ctl.signal:undefined})
      .then(function(r){if(tm)clearTimeout(tm);return r.text().then(function(t){var j=null;try{j=t?JSON.parse(t):null}catch(e){}
        if(!r.ok){var err=new Error((j&&(j.error_description||j.msg||j.message||j.error))||('HTTP '+r.status));err.status=r.status;throw err}return j})},
        function(e){if(tm)clearTimeout(tm);var err=new Error(e&&e.name==='AbortError'?'Délai dépassé':'Pas de connexion');err.offline=true;throw err})},
  session:function(j){return {access:j.access_token,refresh:j.refresh_token,exp:Date.now()+((j.expires_in||3600)-60)*1000,email:j.user&&j.user.email}},
  login:function(email,pw){var self=this;return this.req('POST','/auth/v1/token?grant_type=password',{email:email,password:pw}).then(function(j){return self.session(j)})},
  refresh:function(a){var self=this;return this.req('POST','/auth/v1/token?grant_type=refresh_token',{refresh_token:a.refresh}).then(function(j){var s=self.session(j);if(!s.email)s.email=a.email;return s})},
  /* renvoie un jeton valide ; store(a) persiste la session renouvelée */
  token:function(a,store){if(!a)return Promise.reject(Object.assign(new Error('Non connecté'),{status:401}));
    if(Date.now()<a.exp)return Promise.resolve(a.access);
    return this.refresh(a).then(function(s){store(s);return s.access},function(e){if(e.status)store(null);throw e})},
  upsert:function(tok,table,rows,key){if(!rows.length)return Promise.resolve();
    return this.req('POST','/rest/v1/'+table+'?on_conflict='+(key||'id'),rows,tok,{'Prefer':'resolution=merge-duplicates,return=minimal'})},
  selectAll:function(tok,table,query){var self=this,out=[],page=1000;
    function next(off){return self.req('GET','/rest/v1/'+table+'?select=*'+(query?'&'+query:'')+'&limit='+page+'&offset='+off,null,tok).then(function(rows){
      out=out.concat(rows||[]);return rows&&rows.length===page?next(off+page):out})}
    return next(0)}
};
function saleToRow(s){return {id:s.id,sale_no:s.no,ts:s.ts,service_id:s.serviceId,service_type:s.serviceType,items:s.items,total:s.total,received:s.received,change:s.change,cancelled:!!s.cancelled,cancelled_at:s.cancelledAt||null}}
function rowToSale(r){return {id:r.id,no:r.sale_no,ts:+r.ts,serviceId:r.service_id,serviceType:r.service_type,items:r.items||[],total:r.total,received:r.received,change:r.change,cancelled:!!r.cancelled,cancelledAt:r.cancelled_at?+r.cancelled_at:null}}
function serviceToRow(s){return {id:s.id,type:s.type,opened_at:s.openedAt,closed_at:s.closedAt||null,cash_float:s.float,counted:s.counted==null?null:s.counted,expected:s.expected==null?null:s.expected,drawer_opens:s.drawerOpens||0}}
function rowToService(r){return {id:r.id,type:r.type,openedAt:+r.opened_at,closedAt:r.closed_at?+r.closed_at:null,float:r.cash_float||0,counted:r.counted,expected:r.expected,drawerOpens:r.drawer_opens||0}}

/* ---------- calculs de rapport ---------- */
function summarize(svc,sales){var ok=sales.filter(function(s){return !s.cancelled}),cx=sales.filter(function(s){return s.cancelled});
  var prods={};ok.forEach(function(s){s.items.forEach(function(i){var p=prods[i.id]||(prods[i.id]={id:i.id,name:i.name,qty:0,amt:0});p.qty+=i.qty;p.amt+=i.qty*i.price})});
  var list=Object.keys(prods).map(function(k){return prods[k]}).sort(function(a,b){return b.amt-a.amt});
  var ca=ok.reduce(function(t,s){return t+s.total},0);
  return {svc:svc,count:ok.length,ca:ca,cxCount:cx.length,cxAmt:cx.reduce(function(t,s){return t+s.total},0),list:list,expected:(svc?svc.float:0)+ca}}
function ecart(r){return r.svc.counted==null?null:r.svc.counted-r.expected}
