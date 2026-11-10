const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
function closeNav(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');nav.querySelectorAll('details[open]').forEach(x=>x.open=false)}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open)});
nav.querySelectorAll('details').forEach(drop=>drop.addEventListener('toggle',()=>{if(drop.open)nav.querySelectorAll('details').forEach(other=>{if(other!==drop)other.open=false})}));
nav.addEventListener('click',event=>{if(event.target.closest('a'))closeNav()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){const open=nav.querySelector('details[open]');if(open){open.open=false;open.querySelector('summary').focus()}else if(menu.getAttribute('aria-expanded')==='true'){closeNav();menu.focus()}}});
document.addEventListener('click',event=>{if(!nav.contains(event.target)&&!menu.contains(event.target))nav.querySelectorAll('details[open]').forEach(x=>x.open=false)});
const search=document.querySelector('#service-search');
if(search){const cards=[...document.querySelectorAll('.service-entry')],status=document.querySelector('#search-status'),empty=document.querySelector('.no-results');search.addEventListener('input',()=>{const query=search.value.trim().toLocaleLowerCase('id');let count=0;cards.forEach(card=>{const matched=(card.textContent+' '+card.dataset.search).toLocaleLowerCase('id').includes(query);card.hidden=!matched;if(matched)count++});empty.hidden=count!==0;status.textContent=query?`${count} layanan ditemukan.`:''})}
const form=document.querySelector('#complaint-form');
if(form){form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;const data=new FormData(form);document.querySelector('#prepared').value=`Nama: ${data.get('name')}\nTopik: ${data.get('topic')}\n\nKeluhan/aspirasi:\n${data.get('message')}`;document.querySelector('#result').hidden=false;document.querySelector('#copy-status').textContent='Teks belum dikirim. Salin dan sampaikan melalui kanal resmi.';document.querySelector('#prepared').focus()});document.querySelector('#copy-button').addEventListener('click',async()=>{const text=document.querySelector('#prepared'),status=document.querySelector('#copy-status');try{await navigator.clipboard.writeText(text.value);status.textContent='Teks disalin. Silakan sampaikan melalui kanal resmi.'}catch(error){text.focus();text.select();status.textContent='Salin teks yang dipilih secara manual.'}})}
// Direction-aware entrance and exit animations. Content is visible by default.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const surfaces = '.hero-copy, .page-hero .wrap, .shortcut-intro, .shortcut-grid a, .section-head, .split > *, .feature-card, .stat-card, .board-card, .app-banner, .service-search, .service-entry, .empty-panel, .mini, .faq-wrap > *, .contact-card, .map-notice, .footer-grid > div';
const details = 'h2, h3, p, .eyebrow, .icon, .number, .stat-card strong, .stat-card small, .badge, .card-link, label, input, select, textarea, button, a:not(.feature-card), .faq-list summary';
const revealTargets = new Set(document.querySelectorAll(surfaces));
document.querySelectorAll('main section:not(.hero):not(.page-hero), .footer').forEach(section => {
  section.querySelectorAll(details).forEach(el => revealTargets.add(el));
});
if (!motionPreference.matches && 'requestAnimationFrame' in window) {
  const items = [...revealTargets].map(el => ({el, rect: el.getBoundingClientRect(), surface: el.matches(surfaces)}));
  let lastY = window.scrollY, direction = 0, scheduled = false, enabled = true;
  const viewportHeight = () => window.innerHeight || document.documentElement.clientHeight;
  // Read positions before writing classes to avoid repeated layout calculations.
  items.forEach(item => {
    const {el, rect, surface} = item, parent = el.parentElement;
    const group = '.shortcut-grid a, .feature-card, .stat-card, .board-card, .service-entry, .mini, .contact-card';
    const siblings = [...parent.children].filter(child => child.matches(group));
    const index = Math.max(0, siblings.indexOf(el));
    const split = parent.matches('.split, .faq-wrap');
    const sign = split ? ([...parent.children].indexOf(el) % 2 ? 1 : -1) : (index % 2 ? 1 : -1);
    const sideways = surface && (split || el.matches('.feature-card, .board-card, .contact-card, .mini'));
    const order = surface ? index : [...parent.children].indexOf(el);
    el.style.setProperty('--reveal-x', sideways ? `${sign * (innerWidth <= 760 ? 12 : 22)}px` : '0px');
    el.style.setProperty('--reveal-delay', `${Math.min(Math.max(order, 0), 3) * (surface ? 90 : 55)}ms`);
    item.state = rect.width === 0 || rect.height === 0 || (rect.bottom > 0 && rect.top < viewportHeight()) ? 'shown' : (rect.bottom <= 0 ? 'above' : 'below');
    el.classList.add('motion-item');
    if (item.state === 'shown') el.classList.add('motion-visible');
    else if (item.state === 'above') el.classList.add('motion-above');
  });
  function setState(item, state) {
    if (item.state === state) return;
    item.state = state;
    item.el.classList.toggle('motion-visible', state === 'shown');
    item.el.classList.toggle('motion-above', state === 'above');
    item.el.classList.toggle('motion-exiting', state !== 'shown');
  }
  function update() {
    scheduled = false;
    if (!enabled) return;
    const h = viewportHeight();
    const readings = items.map(item => ({item, rect: item.el.getBoundingClientRect()}));
    readings.forEach(({item, rect}) => {
      const el = item.el;
      if (!rect.height || !rect.width) return;
      if (el.contains(document.activeElement)) { setState(item, 'shown'); return; }
      if (item.state === 'shown') {
        // Exit begins while a small part is still visible, not after it vanishes.
        if (direction > 0 && rect.bottom < h * .23) setState(item, 'above');
        else if (direction < 0 && rect.top > h * .77) setState(item, 'below');
      } else if (rect.bottom <= 0) {
        setState(item, 'above');
      } else if (rect.top >= h) {
        setState(item, 'below');
      } else if (item.state === 'above' && direction < 0 && rect.bottom > h * .26) {
        setState(item, 'shown');
      } else if (item.state === 'below' && direction > 0 && rect.top < h * .74) {
        setState(item, 'shown');
      }
    });
  }
  function schedule() {
    const now = window.scrollY;
    if (now !== lastY) direction = now > lastY ? 1 : -1;
    lastY = now;
    if (!scheduled && enabled) { scheduled = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule, {passive:true});
  document.addEventListener('focusin', event => {
    items.forEach(item => { if (item.el.contains(event.target)) setState(item, 'shown'); });
  });
  motionPreference.addEventListener?.('change', event => {
    if (event.matches) {
      enabled = false;
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      items.forEach(({el}) => {
        el.classList.remove('motion-item','motion-visible','motion-above','motion-exiting');
        el.style.removeProperty('--reveal-x');
        el.style.removeProperty('--reveal-delay');
      });
    }
  });
}
