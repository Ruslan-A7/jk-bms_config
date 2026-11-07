import { calculate } from './model.js';
import { settings,groups } from './settings.js';
import { en,sourceText } from './i18n.js';
const $=id=>document.getElementById(id);
const originals=new Map([...document.querySelectorAll('[data-i18n]')].map(el=>[el,el.innerHTML]));
const read=key=>{try{return localStorage.getItem(key)}catch{return null}};
const save=(key,value)=>{try{localStorage.setItem(key,value)}catch{/* Storage may be blocked. */}};
let lang=read('jk-language')==='en'?'en':'uk';
let theme=read('jk-theme')==='light'?'light':'dark';
let device='bms';
let installPrompt=null;
const t=(uk,enText)=>lang==='uk'?uk:enText;
function setTheme(){document.documentElement.dataset.theme=theme;$('theme').textContent=theme==='dark'?'☼':'☾';$('theme').setAttribute('aria-label',t('Змінити тему','Change theme'));document.querySelector('meta[name=theme-color]').content=theme==='dark'?'#101b18':'#f2f5ed'}
function localize(){
 document.documentElement.lang=lang;
 for(const [el,uk] of originals)el.innerHTML=lang==='uk'?uk:en[el.dataset.i18n];
 $('language').textContent=lang==='uk'?'EN':'UA';$('language').setAttribute('aria-label',t('Switch to English','Перемкнути на українську'));
 $('search').placeholder=t('Знайти параметр…','Find a setting…');$('search').setAttribute('aria-label',t('Пошук параметра','Search settings'));
 document.querySelector('.results').setAttribute('aria-label',t('Рекомендації','Recommendations'));
 document.querySelector('.tabs').setAttribute('aria-label',t('Пристрій','Device'));
 $('sourcesText').innerHTML=sourceText[lang];setTheme();render();
}
function render(){
 const c=calculate({series:Number($('series').value),lower:Number($('lower').value),upper:Number($('upper').value)});
 $('lowerValue').value=c.lower+'%';$('upperValue').value=c.upper+'%';
 $('lower').setAttribute('aria-valuetext',c.lower+'%');$('upper').setAttribute('aria-valuetext',c.upper+'%');
 const number=new Intl.NumberFormat(lang==='uk'?'uk-UA':'en-GB',{maximumFractionDigits:2});
 $('energy').textContent=number.format(c.energy)+t(' кВт·год',' kWh');$('voltage').textContent=number.format(c.nominal)+' V';$('window').textContent=`${c.lower}–${c.upper}%`;
 $('socFill').style.width=(c.upper-c.lower)+'%';$('socFill').style.marginLeft=c.lower+'%';$('socCaption').textContent=`${c.upper-c.lower}% · ${number.format(c.ah)} Ah`;
 $('configurationStatus').textContent=`${c.series}S1P · EVE MB31 · 314 Ah`;
 $('incompatible').hidden=c.compatible;$('incompatible').textContent=t('Ця збірка несумісна з обраним 24-вольтовим інвертором. Показано лише BMS. Для AXIOMA 4200 виберіть 8S.','This pack is incompatible with the selected 24 V inverter. Only BMS settings are shown. Select 8S for AXIOMA 4200.');
 const all=settings(c,lang);$('bmsCount').textContent=all.bms.length;$('inverterCount').textContent=all.inverter.length;
 const query=$('search').value.trim().toLocaleLowerCase();
 const rows=all[device].filter(r=>[r.uk,r.en,r.advice,r.enAdvice].join(' ').toLocaleLowerCase().includes(query));
 const root=$('settings');root.replaceChildren();root.setAttribute('aria-labelledby','tab-'+device);
 if(!rows.length){const p=document.createElement('p');p.textContent=t('Немає параметрів для цього вибору.','No settings for this selection.');root.append(p)}
 for(const key of [...new Set(rows.map(r=>r.group))]){
  const section=document.createElement('section');section.className='settings-group';const heading=document.createElement('h3');heading.textContent=groups[key][lang==='uk'?0:1];section.append(heading);
  const table=document.createElement('table');table.className='settings-table';const caption=document.createElement('caption');caption.textContent=heading.textContent;caption.hidden=true;table.append(caption);
  const thead=document.createElement('thead');const tr=document.createElement('tr');for(const text of [t('Параметр','Parameter'),t('Значення','Value'),t('Пояснення та рекомендації','Explanation and advice')]){const th=document.createElement('th');th.scope='col';th.textContent=text;tr.append(th)}thead.append(tr);table.append(thead);
  const tbody=document.createElement('tbody');
  for(const r of rows.filter(r=>r.group===key)){
   const tr=document.createElement('tr'),title=document.createElement('td'),value=document.createElement('td'),description=document.createElement('td');title.textContent=lang==='uk'?r.uk:r.en;
   if(lang==='uk'){const sub=document.createElement('span');sub.className='english';sub.lang='en';sub.textContent=r.en;title.append(sub)}
   value.textContent=r.value;const source=document.createElement('span');source.className='row-source';source.textContent=r.source;value.append(source);description.textContent=lang==='uk'?r.advice:r.enAdvice;tr.append(title,value,description);tbody.append(tr);
  }table.append(tbody);section.append(table);root.append(section);
 }
 document.querySelectorAll('[data-preset]').forEach(el=>el.classList.toggle('active',el.dataset.preset===`${c.lower},${c.upper}`));
}
for(const id of ['series','lower','upper'])$(id).addEventListener('input',render);
$('search').addEventListener('input',render);
document.querySelectorAll('[data-preset]').forEach(el=>el.addEventListener('click',()=>{[$('lower').value,$('upper').value]=el.dataset.preset.split(',');render()}));
function selectTab(el){device=el.dataset.device;document.querySelectorAll('[data-device]').forEach(b=>{b.setAttribute('aria-selected',String(b===el));b.tabIndex=b===el?0:-1});render()}
document.querySelectorAll('[data-device]').forEach(el=>{el.addEventListener('click',()=>selectTab(el));el.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const other=e.key==='Home'?$('tab-bms'):e.key==='End'?$('tab-inverter'):$(device==='bms'?'tab-inverter':'tab-bms');selectTab(other);other.focus()}})});
$('language').addEventListener('click',()=>{lang=lang==='uk'?'en':'uk';save('jk-language',lang);localize()});
$('theme').addEventListener('click',()=>{theme=theme==='dark'?'light':'dark';save('jk-theme',theme);setTheme()});
$('print').addEventListener('click',()=>window.print());
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;$('install').hidden=false});
$('install').addEventListener('click',async()=>{if(!installPrompt)return;await installPrompt.prompt();installPrompt=null;$('install').hidden=true});
window.addEventListener('appinstalled',()=>{$('install').hidden=true;installPrompt=null});
localize();
if('serviceWorker' in navigator && ['https:','http:'].includes(location.protocol))navigator.serviceWorker.register('./sw.js').catch(()=>{/* App stays usable online if offline caching is unavailable. */});
