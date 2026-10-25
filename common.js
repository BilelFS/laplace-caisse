/* La Place — code partagé caisse + tableau de bord (nécessite i18n.js avant) */
'use strict';

/* ---------- utilitaires ---------- */
function $(id){return document.getElementById(id)}
function each(list,fn){Array.prototype.forEach.call(list,fn)}
function fmt(m){return (m/1000).toFixed(3).replace('.',',')}
function fmtD(m){return fmt(m)+' '+t('DT')}
function fmtShort(m){var v=m/1000;return (Math.round(v*10)/10).toString().replace('.',',')}
function parseDT(v){v=String(v==null?'':v).replace(',','.').trim();if(v===''||v==='.')return NaN;if(!/^\d*\.?\d*$/.test(v))return NaN;var n=parseFloat(v);return isNaN(n)?NaN:Math.round(n*1000)}
function parseQty(v){v=String(v==null?'':v).replace(',','.').trim();if(!/^\d*\.?\d*$/.test(v)||v===''||v==='.')return NaN;return Math.round(parseFloat(v)*1000)/1000}
function fmtQ(q){q=Math.round((q||0)*1000)/1000;return String(q).replace('.',',')}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
function pad2(n){return (n<10?'0':'')+n}
function hm(ts){var d=new Date(ts);return pad2(d.getHours())+':'+pad2(d.getMinutes())}
function dstr(ts){var d=new Date(ts);return pad2(d.getDate())+'/'+pad2(d.getMonth()+1)+'/'+d.getFullYear()}
function svcLabel(tp){return tp==='matin'?t('☀️ Matin'):t('🌙 Soir')}
function clone(o){return JSON.parse(JSON.stringify(o))}
function toast(msg,ms){var el=$('toast');if(!el)return;el.textContent=msg;el.style.display='block';clearTimeout(toast._t);toast._t=setTimeout(function(){el.style.display='none'},ms||2600)}
function lsGet(k){try{var v=localStorage.getItem(k);return v?JSON.parse(v):null}catch(e){return null}}
function lsSet(k,v){try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
/* nom affiché selon la langue (l'autre langue en petit) */
function nm(it){return LANG==='ar'&&it.ar?it.ar:(it.name||it.fr||'')}
function nm2(it){return LANG==='ar'?(it.ar?(it.name||it.fr||''):''):(it.ar||'')}
function cnm(c){return LANG==='ar'&&c.ar?c.ar:c.fr}
function cnm2(c){return LANG==='ar'?(c.ar?c.fr:''):(c.ar||'')}

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
  ov.innerHTML='<div class="md '+(o.cls||'')+'">'+(o.title!=null?'<div class="mh"><h2>'+o.title+'</h2>'+(o.locked?'':'<button class="mx" data-x aria-label="'+t('Fermer')+'">✕</button>')+'</div>':'')+
    '<div class="mb">'+(o.body||'')+'</div>'+(o.foot?'<div class="mf">'+o.foot+'</div>':'')+'</div>';
  document.body.appendChild(ov);
  function close(){if(ov.parentNode)ov.parentNode.removeChild(ov);if(o.onClose)o.onClose()}
  if(!o.locked){ov.addEventListener('click',function(e){if(e.target===ov)close()});var x=ov.querySelector('[data-x]');if(x)x.onclick=close}
  ov.close=close;ov.q=function(s){return ov.querySelector(s)};ov.qa=function(s){return ov.querySelectorAll(s)};return ov}
function confirmBox(msg,okLabel,cb,danger){
  var m=modal({title:t('Confirmation'),cls:'sm',body:'<p style="font-size:18px;line-height:1.5;margin:4px 0">'+msg+'</p>',
    foot:'<button class="btn" data-n>'+t('Non')+'</button><button class="btn main '+(danger?'red':'gold')+'" data-y>'+okLabel+'</button>'});
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
function langButton(){return '<button class="hbtn lang" data-lang aria-label="Langue / اللغة">'+(LANG==='ar'?'FR':'ع')+'</button>'}

/* ---------- éditeur de menu (caisse + tableau de bord) ---------- */
function MenuEditor(host,menu,onSave){
  var M=clone(menu),sel=M[0]?M[0].id:null,dirty=false;
  function cat(){return M.filter(function(c){return c.id===sel})[0]}
  function mark(){dirty=true;host.dispatchEvent(new Event('menuchange'))}
  function render(){var c=cat();
    host.innerHTML='<div class="me"><div class="me-cats"><div class="row" style="margin-bottom:6px"><b class="grow">'+t('Catégories')+'</b><button class="hbtn" data-addcat>＋ '+t('Catégorie')+'</button></div>'+
      M.map(function(k,i){return '<div class="me-cat'+(k.id===sel?' sel':'')+'" data-cat="'+k.id+'" style="--c:'+k.col+'"><span class="ic">'+k.ic+'</span><span class="t">'+esc(cnm(k))+' <span class="muted small">('+k.items.length+')</span></span>'+
        (k.id===sel?'<button class="ib" data-cu="'+i+'" '+(i?'':'disabled')+' aria-label="'+t('Monter')+'">▲</button><button class="ib" data-cd="'+i+'" '+(i<M.length-1?'':'disabled')+' aria-label="'+t('Descendre')+'">▼</button><button class="ib" data-ce aria-label="'+t('Modifier')+'">✎</button>':'')+'</div>'}).join('')+
      '</div><div class="me-items">'+(c?'<div class="row" style="margin-bottom:6px"><b class="grow">'+c.ic+' '+esc(cnm(c))+'</b><button class="hbtn" data-additem>＋ '+t('Article')+'</button></div>'+
      (c.items.length?c.items.map(function(it,i){var hours=it.from!=null?'<span> · '+it.from+'h–'+it.to+'h</span>':'';
        return '<div class="me-it'+(it.off?' off':'')+'"><span class="ic">'+(it.ic||c.ic)+'</span><div class="t"><b>'+esc(nm(it))+'</b><span>'+esc(nm2(it))+hours+(it.off?' · '+t('masqué'):'')+'</span></div><span class="p">'+fmt(it.price)+'</span>'+
          '<button class="ib" data-iu="'+i+'" '+(i?'':'disabled')+' aria-label="'+t('Monter')+'">▲</button><button class="ib" data-id="'+i+'" '+(i<c.items.length-1?'':'disabled')+' aria-label="'+t('Descendre')+'">▼</button>'+
          '<button class="ib" data-ie="'+i+'" aria-label="'+t('Modifier')+'">✎</button></div>'}).join(''):'<div class="muted" style="padding:20px 0">'+t('Aucun article. Touchez « ＋ Article ».')+'</div>'):'<div class="muted">'+t('Créez une catégorie.')+'</div>')+'</div></div>';
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
    var m=modal({title:isNew?t('Nouvelle catégorie'):t('Modifier la catégorie'),body:
      '<div class="fgrid"><div><label class="f">'+t('Nom (français)')+'</label><input class="inp" id="cf" dir="ltr" maxlength="30"></div><div><label class="f">'+t('Nom (arabe)')+'</label><input class="inp" id="ca" dir="rtl" maxlength="30"></div></div>'+
      '<label class="f">'+t('Couleur')+'</label><div class="swatches">'+COLORS.map(function(x){return '<button type="button" data-col="'+x+'" style="background:'+x+'" class="'+(x===col?'sel':'')+'" aria-label="'+x+'"></button>'}).join('')+'</div>'+
      '<label class="f">'+t('Icône')+'</label>'+iconPicker(ic),
      foot:(isNew?'':'<button class="btn red" data-del>🗑 '+t('Supprimer')+'</button>')+'<button class="btn" data-cc>'+t('Annuler')+'</button><button class="btn gold main" data-ok>'+t('Enregistrer')+'</button>'});
    m.q('#cf').value=c?c.fr:'';m.q('#ca').value=c?c.ar:'';
    bindPicker(m,function(v){ic=v});
    each(m.qa('[data-col]'),function(b){b.onclick=function(){each(m.qa('[data-col]'),function(x){x.className=''});b.className='sel';col=b.dataset.col}});
    m.q('[data-cc]').onclick=m.close;
    if(!isNew)m.q('[data-del]').onclick=function(){confirmBox(t('Supprimer la catégorie « {n} » et ses {k} articles ?',{n:esc(cnm(c)),k:c.items.length})+'<br><span class="muted small">'+t('Les ventes passées restent dans les rapports.')+'</span>',t('Supprimer'),function(){
      M=M.filter(function(x){return x!==c});sel=M[0]?M[0].id:null;mark();m.close();render()},true)};
    m.q('[data-ok]').onclick=function(){var fr=m.q('#cf').value.trim(),ar=m.q('#ca').value.trim();if(!fr&&!ar){m.q('#cf').focus();return toast(t('Donnez un nom'))}
      if(isNew){c={id:'c_'+uid(),items:[]};M.push(c);sel=c.id}
      c.fr=fr||ar;c.ar=ar;c.ic=ic;c.col=col;mark();m.close();render()};
    if(isNew)setTimeout(function(){m.q(LANG==='ar'?'#ca':'#cf').focus()},50)}
  function editItem(it){var c=cat(),isNew=!it,ic=it?(it.ic||c.ic):c.ic;
    var m=modal({title:isNew?t('Nouvel article')+' · '+esc(cnm(c)):t('Modifier l\'article'),cls:'wide',body:
      '<div class="fgrid"><div><label class="f">'+t('Nom (français, sur le ticket)')+'</label><input class="inp" id="in" dir="ltr" maxlength="32"></div>'+
      '<div><label class="f">'+t('Nom (arabe)')+'</label><input class="inp" id="ia" dir="rtl" maxlength="40"></div>'+
      '<div><label class="f">'+t('Prix (DT)')+'</label><input class="inp num" id="ip" inputmode="decimal" placeholder="2,500"></div>'+
      '<div><label class="f">'+t('Catégorie')+'</label><select class="inp" id="ic">'+M.map(function(k){return '<option value="'+k.id+'">'+k.ic+' '+esc(cnm(k))+'</option>'}).join('')+'</select></div></div>'+
      '<div class="tgl" style="margin-top:8px"><label class="tgl"><input type="checkbox" id="io"> '+t('Disponible à la vente')+'</label></div>'+
      '<div class="tgl"><label class="tgl"><input type="checkbox" id="ih"> '+t('Offre à heures fixes')+'</label></div>'+
      '<div class="fgrid" id="hrs"><div><label class="f">'+t('De (heure)')+'</label><select class="inp" id="if">'+hourOpts()+'</select></div><div><label class="f">'+t('À (heure)')+'</label><select class="inp" id="it">'+hourOpts()+'</select></div>'+
      '<div style="grid-column:1/-1"><label class="f">'+t('Détail imprimé sur le ticket')+'</label><input class="inp" id="id" dir="ltr" maxlength="44" placeholder="Croissant + Espresso"></div></div>'+
      '<label class="f">'+t('Icône')+'</label>'+iconPicker(ic),
      foot:(isNew?'':'<button class="btn red" data-del>🗑</button>')+'<button class="btn" data-cc>'+t('Annuler')+'</button><button class="btn gold main" data-ok>'+t('Enregistrer')+'</button>'});
    function hourOpts(){var s='';for(var h=0;h<24;h++)s+='<option value="'+h+'">'+pad2(h)+'h</option>';return s}
    m.q('#in').value=it?it.name:'';m.q('#ia').value=it?(it.ar||''):'';m.q('#ip').value=it?fmt(it.price):'';m.q('#ic').value=c.id;
    m.q('#io').checked=!it||!it.off;var timed=!!(it&&it.from!=null);m.q('#ih').checked=timed;
    m.q('#if').value=String(it&&it.from!=null?it.from:7);m.q('#it').value=String(it&&it.to!=null?it.to:11);m.q('#id').value=it&&it.detail?it.detail:'';
    function sh(){m.q('#hrs').style.display=m.q('#ih').checked?'':'none'}sh();m.q('#ih').onchange=sh;
    bindPicker(m,function(v){ic=v});m.q('[data-cc]').onclick=m.close;
    if(!isNew)m.q('[data-del]').onclick=function(){confirmBox(t('Supprimer « {n} » ?',{n:esc(nm(it))})+'<br><span class="muted small">'+t('Astuce : décochez « Disponible » pour le masquer sans le supprimer.')+'</span>',t('Supprimer'),function(){
      c.items=c.items.filter(function(x){return x!==it});mark();m.close();render()},true)};
    m.q('[data-ok]').onclick=function(){var name=m.q('#in').value.trim(),ar=m.q('#ia').value.trim(),price=parseDT(m.q('#ip').value);
      if(!name){m.q('#in').focus();return toast(t('Donnez un nom en français (il est imprimé sur le ticket)'),3500)}
      if(isNaN(price)||price<0||price>999000){m.q('#ip').focus();return toast(t('Prix invalide (ex. 2,500)'))}
      var o=it||{id:'p_'+uid()};o.name=name;o.ar=ar;o.price=price;o.ic=ic;
      if(m.q('#io').checked)delete o.off;else o.off=true;
      if(m.q('#ih').checked){o.from=+m.q('#if').value;o.to=+m.q('#it').value;o.detail=m.q('#id').value.trim()}else{delete o.from;delete o.to;delete o.detail}
      var target=m.q('#ic').value;
      if(isNew){M.filter(function(k){return k.id===target})[0].items.push(o)}
      else if(target!==c.id){c.items=c.items.filter(function(x){return x!==o});M.filter(function(k){return k.id===target})[0].items.push(o)}
      sel=target;mark();m.close();render()};
    if(isNew)setTimeout(function(){m.q('#in').focus()},50)}
  render();
  return {get:function(){return clone(M)},dirty:function(){return dirty},save:function(){dirty=false;return onSave(clone(M))}}}

/* ---------- dépenses : achats du jour, avances, charges ---------- */
var EXP_TYPES={achat:'🛒 Achat',avance:'👤 Avance',charge:'🧾 Charge'};
function expLabel(tp){return t(EXP_TYPES[tp]||tp)}
var CHARGE_CHIPS=['Électricité','Eau','Gaz','Loyer','Internet','Salaire','Entretien','Autre'];
var ACHAT_CHIPS=['Lait','Sucre','Pain','Fruits','Glaçons','Gobelets','Produits ménagers'];
/* opts : {types:[...], stockItems:[...], names:[...], fromDrawer:bool, onSave:function(exp,m)} */
function expenseModal(opts){var type=opts.types[0],amount='',stockId=null,items=opts.stockItems||[];
  var m=modal({title:'💸 '+t('Nouvelle dépense'),cls:'wide',body:
    '<div class="row">'+opts.types.map(function(tp){return '<button class="chip grow" data-et="'+tp+'">'+expLabel(tp)+'</button>'}).join('')+'</div>'+
    '<div class="cols"><div>'+
      '<div data-sec="achat"><label class="f">'+t('Quoi ? (touchez un produit ou écrivez)')+'</label><input class="inp" data-lb maxlength="40">'+
        '<div class="echips" data-sk>'+(items.length?items.map(function(s){return '<button type="button" class="echip" data-sid="'+s.id+'">📦 '+esc(nm(s))+'</button>'}).join(''):'')+
        ACHAT_CHIPS.filter(function(x){var l=t(x).toLowerCase();return !items.some(function(s){return [s.name,s.ar].concat([nm(s)]).some(function(n){return (n||'').toLowerCase()===l||(n||'').toLowerCase()===x.toLowerCase()})})}).map(function(x){return '<button type="button" class="echip" data-lbl="'+esc(t(x))+'">'+esc(t(x))+'</button>'}).join('')+'</div>'+
        '<div data-qtyrow style="display:none"><label class="f" data-qtyl></label><input class="inp num" data-qty inputmode="decimal" placeholder="0"></div></div>'+
      '<div data-sec="avance"><label class="f">'+t('Pour qui ? (nom de l\'employé)')+'</label><input class="inp" data-ps maxlength="30">'+
        '<div class="echips">'+(opts.names||[]).map(function(x){return '<button type="button" class="echip" data-pn="'+esc(x)+'">'+esc(x)+'</button>'}).join('')+'</div></div>'+
      '<div data-sec="charge"><label class="f">'+t('Quelle charge ?')+'</label><input class="inp" data-cl maxlength="40">'+
        '<div class="echips">'+CHARGE_CHIPS.map(function(x){return '<button type="button" class="echip" data-cn="'+esc(t(x))+'">'+esc(t(x))+'</button>'}).join('')+'</div></div>'+
      (opts.fromDrawer?'<div class="warn" style="margin-top:12px">'+t('L\'argent est pris dans le tiroir : il sera déduit du montant attendu à la clôture.')+'</div>':'')+
    '</div><div><div class="muted">'+t('Montant')+'</div><div class="disp" data-ad>0 '+t('DT')+'</div><div data-kp></div></div></div>',
    foot:'<button class="btn" data-cc>'+t('Annuler')+'</button><button class="btn gold main" data-ok>✓ '+t('Enregistrer la dépense')+'</button>'});
  function selType(){each(m.qa('[data-et]'),function(b){b.className='chip grow'+(b.dataset.et===type?' sel':'')});each(m.qa('[data-sec]'),function(s){s.style.display=s.dataset.sec===type?'':'none'})}
  function selStock(id){stockId=id;var it=items.filter(function(s){return s.id===id})[0];
    each(m.qa('[data-sid]'),function(b){b.classList.toggle('sel',b.dataset.sid===id)});
    m.q('[data-qtyrow]').style.display=it?'':'none';if(it){m.q('[data-qtyl]').textContent=t('Quantité achetée ({u}) — ajoutée au stock',{u:t(it.unit)});m.q('[data-lb]').value=nm(it)}}
  each(m.qa('[data-et]'),function(b){b.onclick=function(){type=b.dataset.et;selType()}});selType();
  each(m.qa('[data-sid]'),function(b){b.onclick=function(){selStock(stockId===b.dataset.sid?null:b.dataset.sid)}});
  each(m.qa('[data-lbl]'),function(b){b.onclick=function(){selStock(null);m.q('[data-lb]').value=b.dataset.lbl}});
  m.q('[data-lb]').oninput=function(){if(stockId){var it=items.filter(function(s){return s.id===stockId})[0];if(it&&this.value!==nm(it))selStock(null)}};
  each(m.qa('[data-pn]'),function(b){b.onclick=function(){m.q('[data-ps]').value=b.dataset.pn}});
  each(m.qa('[data-cn]'),function(b){b.onclick=function(){m.q('[data-cl]').value=b.dataset.cn}});
  keypad(m.q('[data-kp]'),{decimal:true,onChange:function(v){amount=v;m.q('[data-ad]').textContent=(v||'0')+' '+t('DT')}});
  m.q('[data-cc]').onclick=m.close;
  m.q('[data-ok]').onclick=function(){var a=parseDT(amount);
    var e={id:uid(),ts:Date.now(),type:type,amount:a,fromDrawer:!!opts.fromDrawer,label:'',person:'',stockId:null,qty:null,cancelled:false};
    if(type==='achat'){e.label=m.q('[data-lb]').value.trim();if(stockId){var q=parseQty(m.q('[data-qty]').value);if(isNaN(q)||q<=0){m.q('[data-qty]').focus();return toast(t('Indiquez la quantité achetée'))}e.stockId=stockId;e.qty=q}}
    else if(type==='avance'){e.person=m.q('[data-ps]').value.trim();e.label=t('Avance');if(!e.person){m.q('[data-ps]').focus();return toast(t('Indiquez le nom de l\'employé'))}}
    else e.label=m.q('[data-cl]').value.trim();
    if(type!=='avance'&&!e.label){return toast(t('Indiquez ce qui a été acheté ou payé'))}
    if(isNaN(a)||a<=0)return toast(t('Tapez le montant'));
    this.disabled=true;opts.onSave(e,m)};
  return m}
function expenseLine(e){return (e.type==='avance'?esc(e.person):esc(e.label))+(e.qty?' <span class="muted">· '+fmtQ(e.qty)+'</span>':'')}

/* ---------- stock simple : articles + mouvements (achat, entrée, sortie, inventaire) ---------- */
var UNITS=['kg','g','L','pièce','paquet','carton','boîte','bouteille'];
function stockLevels(items,moves){var lv={},last={};items.forEach(function(i){lv[i.id]=0});
  moves.filter(function(mv){return !mv.cancelled}).slice().sort(function(a,b){return a.ts-b.ts}).forEach(function(mv){if(!(mv.itemId in lv))return;
    if(mv.kind==='inventaire')lv[mv.itemId]=mv.qty;else if(mv.kind==='sortie')lv[mv.itemId]-=mv.qty;else lv[mv.itemId]+=mv.qty;
    lv[mv.itemId]=Math.round(lv[mv.itemId]*1000)/1000;last[mv.itemId]=mv.ts});
  return {lv:lv,last:last}}
function isLow(it,lv){return it.min>0&&(lv[it.id]||0)<=it.min}
var MOVE_KINDS={achat:'🛒 Achat',entree:'➕ Entrée',sortie:'➖ Sortie',inventaire:'📋 Inventaire'};
function stockHtml(items,levels){if(!items.length)return '<div class="empty">'+t('Aucun produit en stock. Touchez « ＋ Produit » pour commencer (café, lait, sucre, gobelets…).')+'</div>';
  var low=items.filter(function(i){return isLow(i,levels.lv)});
  return (low.length?'<div class="warn">⚠️ '+t('Stock bas')+' : '+low.map(function(i){return esc(nm(i))}).join(', ')+'</div>':'')+
    items.map(function(it,i){var q=levels.lv[it.id]||0,lo=isLow(it,levels.lv);
    return '<div class="st'+(lo?' low':'')+'"><div class="t"><b>'+esc(nm(it))+'</b><span>'+(it.min>0?t('Alerte sous {q}',{q:fmtQ(it.min)+' '+t(it.unit)}):'')+(levels.last[it.id]?' · '+dstr(levels.last[it.id]).slice(0,5)+' '+hm(levels.last[it.id]):'')+'</span></div>'+
      '<span class="q">'+fmtQ(q)+' <small>'+esc(t(it.unit))+'</small></span>'+
      '<div class="sa"><button class="ib" data-sin="'+i+'" aria-label="'+t('Entrée')+'">＋</button><button class="ib" data-sout="'+i+'" aria-label="'+t('Sortie')+'">－</button>'+
      '<button class="ib" data-sinv="'+i+'" aria-label="'+t('Inventaire')+'">📋</button><button class="ib" data-sed="'+i+'" aria-label="'+t('Modifier')+'">✎</button></div></div>'}).join('')}
function stockItemModal(it,onSave,onDelete){var isNew=!it;
  var m=modal({title:isNew?t('Nouveau produit en stock'):t('Modifier le produit'),cls:'sm',body:
    '<label class="f">'+t('Nom (français)')+'</label><input class="inp" data-sn dir="ltr" maxlength="30" placeholder="Café en grains">'+
    '<label class="f">'+t('Nom (arabe)')+'</label><input class="inp" data-sa dir="rtl" maxlength="30">'+
    '<div class="fgrid"><div><label class="f">'+t('Unité')+'</label><select class="inp" data-su>'+UNITS.map(function(u){return '<option value="'+u+'">'+esc(t(u))+'</option>'}).join('')+'</select></div>'+
    '<div><label class="f">'+t('Alerte quand il reste moins de')+'</label><input class="inp num" data-sm inputmode="decimal" placeholder="0"></div></div>',
    foot:(isNew?'':'<button class="btn red" data-del>🗑</button>')+'<button class="btn" data-cc>'+t('Annuler')+'</button><button class="btn gold main" data-ok>'+t('Enregistrer')+'</button>'});
  m.q('[data-sn]').value=it?it.name:'';m.q('[data-sa]').value=it?(it.ar||''):'';m.q('[data-su]').value=it?it.unit:'kg';m.q('[data-sm]').value=it&&it.min?fmtQ(it.min):'';
  m.q('[data-cc]').onclick=m.close;
  if(!isNew)m.q('[data-del]').onclick=function(){confirmBox(t('Supprimer « {n} » du stock ?',{n:esc(nm(it))}),t('Supprimer'),function(){m.close();onDelete(it)},true)};
  m.q('[data-ok]').onclick=function(){var n=m.q('[data-sn]').value.trim(),a=m.q('[data-sa]').value.trim(),mn=m.q('[data-sm]').value.trim()?parseQty(m.q('[data-sm]').value):0;
    if(!n&&!a)return toast(t('Donnez un nom'));if(isNaN(mn)||mn<0)return toast(t('Quantité invalide'));
    var o=it?clone(it):{id:'s_'+uid()};o.name=n||a;o.ar=a;o.unit=m.q('[data-su]').value;o.min=mn;m.close();onSave(o)};
  setTimeout(function(){m.q(LANG==='ar'?'[data-sa]':'[data-sn]').focus()},50)}
function stockMoveModal(it,cur,kind,onSave){
  var lbl={entree:t('Quantité ajoutée'),sortie:t('Quantité retirée (perte, casse, consommation)'),inventaire:t('Quantité comptée maintenant')}[kind];
  var m=modal({title:t(MOVE_KINDS[kind])+' · '+esc(nm(it)),cls:'sm',body:'<div class="muted">'+t('Stock actuel')+' : <b>'+fmtQ(cur)+' '+esc(t(it.unit))+'</b></div>'+
    '<label class="f">'+lbl+' ('+esc(t(it.unit))+')</label><input class="inp num" data-q inputmode="decimal" placeholder="0">'+
    '<label class="f">'+t('Note (facultatif)')+'</label><input class="inp" data-nt maxlength="60">',
    foot:'<button class="btn" data-cc>'+t('Annuler')+'</button><button class="btn gold main" data-ok>'+t('Enregistrer')+'</button>'});
  m.q('[data-cc]').onclick=m.close;
  m.q('[data-ok]').onclick=function(){var q=parseQty(m.q('[data-q]').value);if(isNaN(q)||q<0||(kind!=='inventaire'&&q===0))return toast(t('Quantité invalide'));
    m.close();onSave({id:uid(),ts:Date.now(),itemId:it.id,kind:kind,qty:q,note:m.q('[data-nt]').value.trim(),expenseId:null})};
  setTimeout(function(){m.q('[data-q]').focus()},50)}

/* ---------- nuage (Supabase REST, sans dépendance) ---------- */
var Cloud = {
  cfg:function(){return window.LP_CONFIG||{}},
  configured:function(){var c=this.cfg();return !!(c.supabaseUrl&&c.anonKey)},
  req:function(method,path,body,token,extra){var c=this.cfg(),h={'apikey':c.anonKey,'Content-Type':'application/json'};
    if(token)h.Authorization='Bearer '+token;if(extra)Object.keys(extra).forEach(function(k){h[k]=extra[k]});
    var ctl=window.AbortController?new AbortController():null,tm=ctl?setTimeout(function(){ctl.abort()},20000):null;
    return fetch(c.supabaseUrl.replace(/\/$/,'')+path,{method:method,headers:h,body:body==null?undefined:JSON.stringify(body),signal:ctl?ctl.signal:undefined})
      .then(function(r){if(tm)clearTimeout(tm);return r.text().then(function(tx){var j=null;try{j=tx?JSON.parse(tx):null}catch(e){}
        if(!r.ok){var err=new Error((j&&(j.error_description||j.msg||j.message||j.error))||('HTTP '+r.status));err.status=r.status;throw err}return j})},
        function(e){if(tm)clearTimeout(tm);var err=new Error(e&&e.name==='AbortError'?t('Délai dépassé'):t('Pas de connexion'));err.offline=true;throw err})},
  session:function(j){return {access:j.access_token,refresh:j.refresh_token,exp:Date.now()+((j.expires_in||3600)-60)*1000,email:j.user&&j.user.email}},
  login:function(email,pw){var self=this;return this.req('POST','/auth/v1/token?grant_type=password',{email:email,password:pw}).then(function(j){return self.session(j)})},
  refresh:function(a){var self=this;return this.req('POST','/auth/v1/token?grant_type=refresh_token',{refresh_token:a.refresh}).then(function(j){var s=self.session(j);if(!s.email)s.email=a.email;return s})},
  /* renvoie un jeton valide ; store(a) persiste la session renouvelée */
  token:function(a,store){if(!a)return Promise.reject(Object.assign(new Error(t('Non connecté')),{status:401}));
    if(Date.now()<a.exp)return Promise.resolve(a.access);
    return this.refresh(a).then(function(s){store(s);return s.access},function(e){if(e.status)store(null);throw e})},
  upsert:function(tok,table,rows,key){if(!rows.length)return Promise.resolve();
    return this.req('POST','/rest/v1/'+table+'?on_conflict='+(key||'id'),rows,tok,{'Prefer':'resolution=merge-duplicates,return=minimal'})},
  del:function(tok,table,query){return this.req('DELETE','/rest/v1/'+table+'?'+query,null,tok,{'Prefer':'return=minimal'})},
  selectAll:function(tok,table,query){var self=this,out=[],page=1000;
    function next(off){return self.req('GET','/rest/v1/'+table+'?select=*'+(query?'&'+query:'')+'&limit='+page+'&offset='+off,null,tok).then(function(rows){
      out=out.concat(rows||[]);return rows&&rows.length===page?next(off+page):out})}
    return next(0)},
  getConfig:function(tok,key){return this.selectAll(tok,'config','key=eq.'+key).then(function(r){return r[0]||null})},
  setConfig:function(tok,key,value,ts){return this.upsert(tok,'config',[{key:key,value:value,updated_at:ts}],'key')}
};
function saleToRow(s){return {id:s.id,sale_no:s.no,ts:s.ts,service_id:s.serviceId,service_type:s.serviceType,items:s.items,total:s.total,received:s.received,change:s.change,cancelled:!!s.cancelled,cancelled_at:s.cancelledAt||null}}
function rowToSale(r){return {id:r.id,no:r.sale_no,ts:+r.ts,serviceId:r.service_id,serviceType:r.service_type,items:r.items||[],total:r.total,received:r.received,change:r.change,cancelled:!!r.cancelled,cancelledAt:r.cancelled_at?+r.cancelled_at:null}}
function serviceToRow(s){return {id:s.id,type:s.type,opened_at:s.openedAt,closed_at:s.closedAt||null,cash_float:s.float,counted:s.counted==null?null:s.counted,expected:s.expected==null?null:s.expected,drawer_opens:s.drawerOpens||0}}
function rowToService(r){return {id:r.id,type:r.type,openedAt:+r.opened_at,closedAt:r.closed_at?+r.closed_at:null,float:r.cash_float||0,counted:r.counted,expected:r.expected,drawerOpens:r.drawer_opens||0}}
function expenseToRow(e){return {id:e.id,ts:e.ts,type:e.type,label:e.label||'',amount:e.amount,from_drawer:!!e.fromDrawer,service_id:e.serviceId||null,service_type:e.serviceType||null,person:e.person||null,stock_id:e.stockId||null,qty:e.qty==null?null:e.qty,cancelled:!!e.cancelled,cancelled_at:e.cancelledAt||null,source:e.source||'caisse'}}
function rowToExpense(r){return {id:r.id,ts:+r.ts,type:r.type,label:r.label||'',amount:r.amount,fromDrawer:!!r.from_drawer,serviceId:r.service_id,serviceType:r.service_type,person:r.person||'',stockId:r.stock_id,qty:r.qty==null?null:+r.qty,cancelled:!!r.cancelled,cancelledAt:r.cancelled_at?+r.cancelled_at:null,source:r.source}}
function moveToRow(m){return {id:m.id,ts:m.ts,item_id:m.itemId,kind:m.kind,qty:m.qty,expense_id:m.expenseId||null,note:m.note||null,cancelled:!!m.cancelled,source:m.source||'caisse'}}
function rowToMove(r){return {id:r.id,ts:+r.ts,itemId:r.item_id,kind:r.kind,qty:+r.qty,expenseId:r.expense_id,note:r.note||'',cancelled:!!r.cancelled,source:r.source}}

/* ---------- calculs de rapport ---------- */
function summarize(svc,sales,exps){var ok=sales.filter(function(s){return !s.cancelled}),cx=sales.filter(function(s){return s.cancelled});
  var prods={};ok.forEach(function(s){s.items.forEach(function(i){var p=prods[i.id]||(prods[i.id]={id:i.id,name:i.name,qty:0,amt:0});p.qty+=i.qty;p.amt+=i.qty*i.price})});
  var list=Object.keys(prods).map(function(k){return prods[k]}).sort(function(a,b){return b.amt-a.amt});
  var ca=ok.reduce(function(tt,s){return tt+s.total},0);
  var dex=(exps||[]).filter(function(e){return e.fromDrawer&&!e.cancelled});
  var achats=dex.filter(function(e){return e.type!=='avance'}).reduce(function(tt,e){return tt+e.amount},0);
  var avances=dex.filter(function(e){return e.type==='avance'}).reduce(function(tt,e){return tt+e.amount},0);
  return {svc:svc,count:ok.length,ca:ca,cxCount:cx.length,cxAmt:cx.reduce(function(tt,s){return tt+s.total},0),list:list,exps:dex,achats:achats,avances:avances,
    expected:(svc?svc.float:0)+ca-achats-avances}}
function ecart(r){return r.svc.counted==null?null:r.svc.counted-r.expected}
