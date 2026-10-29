// MAKIA · demo web — intro, carta con la taza que se arma, cordillera, tolva, tienda de café, ticket por la ventanilla.
import { initKit } from '../kit/kit.js?v=3';
import { esc } from '../kit/core/util.js?v=3';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const html = document.documentElement;
const desktop = matchMedia('(min-width: 1024px)');
const hoverFino = matchMedia('(hover: hover) and (pointer: fine)');
const calma = matchMedia('(prefers-reduced-motion: reduce)').matches;

// =========================================================
// INTRO: el toldo baja, se arma el logo, cae la gota y sube la persiana
// =========================================================
(function intro() {
  const el = $('.intro');
  const fin = () => { html.classList.add('listo'); };
  if (!html.classList.contains('con-intro') || !el) { fin(); return; }
  const t0 = performance.now();
  const minimo = innerWidth < 900 ? 1180 : 1480;          // celu ≤ 1,8 s en total · desktop ≈ 2,1 s
  const heroImg = $('.ventana__foto img');
  const espera = Promise.all([
    document.fonts?.ready || Promise.resolve(),
    heroImg && !heroImg.complete ? new Promise(r => { heroImg.addEventListener('load', r, { once: true }); heroImg.addEventListener('error', r, { once: true }); }) : Promise.resolve(),
  ]);
  const tope = new Promise(r => setTimeout(r, 2600));
  Promise.race([espera, tope]).then(() => {
    const falta = Math.max(0, minimo - (performance.now() - t0));
    setTimeout(() => {
      el.classList.add('is-fin');
      html.classList.remove('con-intro');            // libera el scroll
      setTimeout(fin, 180);
      setTimeout(() => el.remove(), 700);
    }, falta);
  });
})();

// =========================================================
// ENTRADAS AL HACER SCROLL
// =========================================================
const io = 'IntersectionObserver' in window ? new IntersectionObserver((ents) => {
  ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } });
}, { threshold: .18, rootMargin: '0px 0px -6% 0px' }) : null;
function observar(root = document) { $$('[data-r]:not(.visto), .cordi:not(.visto)', root).forEach(el => io ? io.observe(el) : el.classList.add('visto')); }
observar();

// =========================================================
// MENÚ DEL CELU y links activos
// =========================================================
const menuBtn = $('.top__menu'), menu = $('#menu-m');
const ICO_MENU = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
const ICO_X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
function menuAbrir(si) {
  menu.hidden = !si; menuBtn.setAttribute('aria-expanded', si); menuBtn.innerHTML = si ? ICO_X : ICO_MENU;
  menuBtn.setAttribute('aria-label', si ? 'Cerrar menú' : 'Abrir menú');
  html.classList.toggle('menu-abierto', si); document.body.style.overflow = si ? 'hidden' : '';
}
menuBtn?.addEventListener('click', () => menuAbrir(menu.hidden));
menu?.addEventListener('click', (e) => { if (e.target.closest('a')) menuAbrir(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) menuAbrir(false); });
const navAncha = matchMedia('(min-width: 1180px)'); navAncha.addEventListener?.('change', () => { if (navAncha.matches) menuAbrir(false); });

const navLinks = $$('.nav a');
if (io) {
  const vis = new IntersectionObserver((ents) => ents.forEach(e => {
    if (!e.isIntersecting) return;
    navLinks.forEach(a => a.classList.toggle('is-on', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['como', 'carta', 'almuerzos', 'grano', 'donde'].forEach(id => { const s = document.getElementById(id); if (s) vis.observe(s); });
}

// =========================================================
// LA TAZA: cada bebida se arma por capas (su carta de café, interactiva)
// =========================================================
const CAPAS = { espresso: 'Espresso', agua: 'Agua', leche: 'Leche emulsionada', espuma: 'Espuma', chocolate: 'Chocolate', crema: 'Crema y canela', filtrado: 'Café de filtro' };
function tazaMini(capas) {
  return `<span class="taza-cap" aria-hidden="true">${capas.map(([c, h]) => `<span class="c-${esc(c)}" style="height:${Math.round(h * .9)}%"></span>`).join('')}</span>`;
}
let tazaActual = null, tazaT = 0;
function llenarTaza(p) {
  if (!p || !p.capas || tazaActual === p.id) return;
  tazaActual = p.id;
  $$('.taza').forEach(t => { t.classList.remove('is-llena'); t.classList.add('is-vacia'); });
  clearTimeout(tazaT);
  tazaT = setTimeout(() => {
    $$('.taza').forEach(t => {
      $('.taza__liq', t).innerHTML = p.capas.map(([c, h]) => `<span class="c-${esc(c)}" style="height:${h}%"></span>`).join('');
      t.classList.remove('is-vacia'); void t.offsetWidth; t.classList.add('is-llena');
    });
    $$('.taza__nombre').forEach(n => { n.textContent = p.nombre; });
    $$('.taza__capas').forEach(ul => { ul.innerHTML = p.capas.slice().reverse().map(([c]) => `<li><i class="c-${esc(c)}"></i>${esc(CAPAS[c] || c)}</li>`).join(''); });
    $$('.taza__capas-t').forEach(s => { s.textContent = p.capas.map(([c]) => CAPAS[c] || c).join(' + '); });
  }, calma ? 0 : 230);
}

// =========================================================
// TEMPLATES DEL KIT (carta, tienda de café, boxes)
// =========================================================
const chica = (src) => String(src || '').replace(/\.webp$/, '-s.webp');
function tplCarta(p, ctx) {
  const precio = ctx.money(p.precio) ?? '<span class="kit-price--na">Consultar</span>';
  const izq = p.capas ? tazaMini(p.capas)
    : p.foto ? `<button type="button" class="it__foto" data-foto="${esc(ctx.asset(p.foto))}" data-nombre="${esc(p.nombre)}" aria-label="Ver foto: ${esc(p.nombre)}"><img src="${esc(ctx.asset(chica(p.foto)))}" alt="" width="360" height="360" loading="lazy" decoding="async"></button>`
    : '<span class="it__foto it__foto--na" aria-hidden="true"></span>';
  return `${izq}
    <div class="it__body"><h3 class="it__n">${esc(p.nombre)} ${(p.etiquetas || []).map(ctx.etiquetaHTML).join('')}</h3>${p.descripcion ? `<p class="it__d">${esc(p.descripcion)}</p>` : ''}</div>
    <div class="it__side"><span class="it__precio">${precio}</span>${ctx.pedible(p) ? `<div data-kit-qty="${esc(p.id)}"></div>` : ''}</div>`;
}
function tplBolsa(p, ctx) {
  const vs = (p.variantes || []).filter(v => v.precio != null); const g = (p.opciones || [])[0];
  const tolva = p.id === 'grano-tolva';
  const origen = ctx.destacado ? ctx.destacado('tolva').origen : '';
  return `<div class="bolsa__foto">${p.foto ? `<img src="${esc(ctx.asset(chica(p.foto)))}" alt="" width="360" height="360" loading="lazy" decoding="async">` : ''}</div>
    <div class="bolsa__cab"><h3 class="bolsa__n">${esc(p.nombre)}</h3>${tolva ? `<span class="bolsa__o">Hoy: <span data-kit-destacado="tolva.origen">${esc(origen || '')}</span></span>` : ''}${p.descripcion ? `<p class="bolsa__d">${esc(p.descripcion)}</p>` : ''}</div>
    <div class="bolsa__opc">
      ${vs.length ? `<fieldset class="bolsa__g"><legend>Cantidad</legend><div class="chips">${vs.map((v, i) => `<label class="chip"><input type="radio" name="v-${esc(p.id)}" value="${esc(v.id)}" ${i ? '' : 'checked'}><span>${esc(v.nombre)}</span></label>`).join('')}</div></fieldset>` : ''}
      ${g ? `<fieldset class="bolsa__g"><legend>${esc(g.nombre)}</legend><div class="chips">${g.valores.map((v, i) => `<label class="chip"><input type="radio" name="o-${esc(p.id)}" data-grupo="${esc(g.id)}" value="${esc(v.id)}" ${i ? '' : 'checked'}><span>${esc(v.nombre)}</span></label>`).join('')}</div></fieldset>` : ''}
    </div>
    <div class="bolsa__pie"><b class="bolsa__precio">${vs.length ? ctx.money(vs[0].precio) : (ctx.money(p.precio) || 'Consultar')}</b>${ctx.pedible(p) ? `<button type="button" class="btn btn--rojo btn--chico bolsa__sumar" data-sumar-bolsa="${esc(p.id)}">Sumar</button>` : ''}</div>`;
}
function tplBox(p, ctx) {
  return `<div class="box__foto">${p.foto ? `<img src="${esc(ctx.asset(p.foto))}" alt="" width="900" height="900" loading="lazy" decoding="async">` : ''}</div>
    <div class="box__txt"><h4 class="box__n">${esc(p.nombre)}</h4>${p.descripcion ? `<p class="box__d">${esc(p.descripcion)}</p>` : ''}
    <div class="box__pie"><b>${ctx.money(p.precio) ?? 'Consultar'}</b>${ctx.pedible(p) ? `<div data-kit-qty="${esc(p.id)}"></div>` : ''}</div></div>`;
}

// =========================================================
// KIT
// =========================================================
// los eventos de la carta que llegan mientras el kit arranca se guardan y se procesan después
const pendientes = []; let alCarta = null;
document.addEventListener('kit:carta', (e) => { alCarta ? alCarta(e) : pendientes.push(e); });
const kit = await initKit({
  config: 'cliente.json',
  cartas: {
    'carta-principal': { itemClass: 'it', template: tplCarta, etiquetas: { casa: { label: 'De la casa' }, veggie: { label: 'Sin carne' } } },
    'tienda': { itemClass: 'bolsa', template: tplBolsa },
    'boxes': { itemClass: 'box', template: tplBox },
  },
  carrito: { label: 'Mi pedido' },
  badgeTexto: 'Probá el panel del local',
});
window.kitMakia = kit;
let productos = new Map();

// ---------- carta: encabezado de sección, anterior/siguiente, taza y foto
const carta = $('#carta'), cartaEl = $('#carta-principal');
const META = {
  cafe: (n) => `${n} opciones · Puerto Blest de la tolva · para llevar`,
  frios: (n) => `${n} opciones · para llevar por la ventanilla`,
  entrepanes: (n) => `Lunes a sábados de 12 a 16 · ${n} opciones · se piden para retirar`,
  dulce: (n) => `${n} opciones · pastelería artesanal`,
};
function catActual() { return $('.kit-tab.is-on', cartaEl)?.dataset.cat || $('.kit-carta__panel:not([hidden]) .kit-item', cartaEl)?.dataset.cat || 'cafe'; }
function pintarCabecera() {
  const tabs = $$('.kit-tab', cartaEl); const on = tabs.findIndex(t => t.classList.contains('is-on'));
  const cat = catActual();
  const panel = $('.kit-carta__panel:not([hidden])', cartaEl);
  const n = panel ? $$('.kit-item', panel).length : 0;
  $('.carta__sec').textContent = tabs[on]?.textContent || 'Café';
  $('.carta__meta').textContent = (META[cat] || ((k) => `${k} opciones`))(n);
  carta.classList.toggle('es-cafe', cat === 'cafe');
  const prev = tabs[on - 1], next = tabs[on + 1];
  const [bp, bn] = $$('[data-carta-mover]');
  bp.disabled = !prev; bn.disabled = !next;
  bp.style.visibility = prev ? '' : 'hidden'; bn.style.visibility = next ? '' : 'hidden';
  $('[data-carta-prev]').textContent = prev ? prev.textContent : 'Anterior';
  $('[data-carta-next]').textContent = next ? next.textContent : 'Siguiente';
  // selección por defecto
  const items = panel ? $$('.kit-item', panel) : [];
  if (cat === 'cafe') { const def = items.find(i => i.dataset.id === 'flat-white') || items[0]; if (def) seleccionar(def, false); }
  else { const def = items.find(i => i.dataset.photo); if (def) seleccionar(def, false); }
}
function seleccionar(item, marcar = true) {
  if (!item) return;
  const p = productos.get(item.dataset.id); if (!p) return;
  $$('.it.is-sel', cartaEl).forEach(x => x.classList.toggle('is-sel', x === item && marcar));
  if (marcar) item.classList.add('is-sel');
  if (p.capas) { llenarTaza(p); return; }
  if (!p.foto) return;
  const img = $('.aside__img img'), cap = $('.aside__foto figcaption');
  const src = kit.asset(p.foto);
  if (img.getAttribute('src') === src) return;
  img.classList.add('is-cambia');
  const pre = new Image(); pre.src = src;
  const listo = () => { img.src = src; img.alt = p.nombre; cap.textContent = p.nombre; requestAnimationFrame(() => img.classList.remove('is-cambia')); };
  pre.decode ? pre.decode().then(listo, listo) : (pre.onload = listo);
}
function onCarta(e) {
  (e.detail.productos || []).forEach(p => productos.set(p.id, p));
  if (e.detail.el === cartaEl) { tazaActual = null; pintarCabecera(); pintarCordillera(); }
  if (e.detail.el?.id === 'tienda' && kit.destacados) rellenarDestacados();
}
cartaEl.addEventListener('click', (e) => {
  if (e.target.closest('.kit-tab')) { requestAnimationFrame(pintarCabecera); return; }
  const foto = e.target.closest('[data-foto]');
  if (foto) { lightbox(foto.dataset.foto, foto.dataset.nombre); return; }
  const it = e.target.closest('.kit-item');
  if (it && !e.target.closest('button, a')) seleccionar(it);
});
// hover (desktop): la taza se arma o la foto cambia sola
let hovT = 0;
cartaEl.addEventListener('pointerover', (e) => {
  if (!hoverFino.matches) return;
  const it = e.target.closest('.kit-item'); if (!it) return;
  clearTimeout(hovT); hovT = setTimeout(() => seleccionar(it), 90);
});
$$('[data-carta-mover]').forEach(b => b.addEventListener('click', () => {
  const tabs = $$('.kit-tab', cartaEl); const on = tabs.findIndex(t => t.classList.contains('is-on'));
  const dest = tabs[on + Number(b.dataset.cartaMover)]; if (!dest) return;
  dest.click(); dest.scrollIntoView?.({ block: 'nearest', inline: 'center' });
  const cab = $('.carta__head'); const top = cab.getBoundingClientRect().top;
  if (top < 0 || top > innerHeight * .6) scrollTo({ top: scrollY + top - (desktop.matches ? 110 : 140), behavior: calma ? 'auto' : 'smooth' });
}));
function irCategoria(cat) { const t = $(`.kit-tab[data-cat="${cat}"]`, cartaEl); if (t) { t.click(); } }
$$('[data-ir-cat]').forEach(a => a.addEventListener('click', () => irCategoria(a.dataset.irCat)));

// ---------- foto del plato (celu: un toque)
const lb = $('.lb');
function lightbox(src, nombre) {
  $('img', lb).src = src; $('img', lb).alt = nombre || ''; $('figcaption', lb).textContent = nombre || '';
  lb.hidden = false; bloquear(true); $('.tk__x', lb).focus();
}
function cerrarLb() { lb.hidden = true; bloquear(false); }
lb.addEventListener('click', (e) => { if (e.target.closest('[data-lb-cerrar]')) cerrarLb(); });

let scrollGuardado = 0, bloqueos = 0;
function bloquear(si) {
  bloqueos = Math.max(0, bloqueos + (si ? 1 : -1));
  if (si && bloqueos === 1) { scrollGuardado = scrollY; Object.assign(document.body.style, { position: 'fixed', top: `-${scrollGuardado}px`, left: '0', right: '0' }); }
  if (!si && bloqueos === 0) { Object.assign(document.body.style, { position: '', top: '', left: '', right: '' }); scrollTo({ top: scrollGuardado, behavior: 'instant' }); }
}

// =========================================================
// LA CORDILLERA DE LOS SÁNDWICHES
// =========================================================
const CUMBRES = [['andes', 200, 150], ['chimborazo', 420, 120], ['genova', 660, 70], ['tokio', 900, 95], ['comuna', 1150, 60], ['peregrino', 1380, 110]];
const cumbresEl = $('[data-cumbres]'), postal = $('[data-postal]'), cordiScroll = $('.cordi__scroll');
let cumbreOn = null;
function pintarCordillera() {
  const ok = CUMBRES.filter(([id]) => productos.get(id) && productos.get(id).disponible !== false);
  cumbresEl.innerHTML = ok.map(([id, x, y], i) => `<button type="button" class="cumbre${id === cumbreOn ? ' is-on' : ''}" data-cumbre="${id}" style="left:${(x / 1600 * 100).toFixed(2)}%;top:${(y / 360 * 100).toFixed(2)}%;--i:${i}" aria-pressed="${id === cumbreOn}"><span class="cumbre__n">${esc(productos.get(id).nombre)}</span><span class="cumbre__p"></span></button>`).join('');
  if (!cumbreOn || !ok.some(([id]) => id === cumbreOn)) activarCumbre(ok[0]?.[0], false);
  else pintarPostal(cumbreOn, false);
}
function pintarPostal(id, animar = true) {
  const p = productos.get(id); if (!p) return;
  const llenar = () => {
    const img = $('.postal__foto img', postal);
    if (p.foto) { img.src = kit.asset(p.foto); img.alt = p.nombre; }
    $('.postal__t', postal).textContent = p.nombre;
    $('.postal__d', postal).textContent = p.descripcion || '';
    $('.postal__precio', postal).textContent = kit.money(p.precio) || '';
    $('.postal__alt', postal).textContent = `Cumbre ${CUMBRES.findIndex(c => c[0] === id) + 1} de ${CUMBRES.length} · almuerzo`;
    $('.postal__qty', postal).innerHTML = kit.pedible(p) ? `<div data-kit-qty="${esc(p.id)}"></div>` : '';
    kit.carrito?.sync(postal);
    postal.classList.remove('is-cambia');
  };
  if (!animar || calma) { llenar(); return; }
  postal.classList.add('is-cambia'); setTimeout(llenar, 220);
}
function activarCumbre(id, animar = true, mover = false) {
  if (!id) return;
  const cambio = id !== cumbreOn; cumbreOn = id;
  $$('.cumbre', cumbresEl).forEach(b => { const on = b.dataset.cumbre === id; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
  if (cambio) pintarPostal(id, animar);
  if (mover && cordiScroll.scrollWidth > cordiScroll.clientWidth) {
    const b = $(`[data-cumbre="${id}"]`, cumbresEl);
    if (b) cordiScroll.scrollTo({ left: b.offsetLeft - cordiScroll.clientWidth / 2, behavior: calma ? 'auto' : 'smooth' });
  }
}
cumbresEl.addEventListener('click', (e) => { const b = e.target.closest('[data-cumbre]'); if (b) activarCumbre(b.dataset.cumbre, true, true); });
cumbresEl.addEventListener('pointerover', (e) => { if (!hoverFino.matches) return; const b = e.target.closest('[data-cumbre]'); if (b) activarCumbre(b.dataset.cumbre); });
cumbresEl.addEventListener('focusin', (e) => { const b = e.target.closest('[data-cumbre]'); if (b) activarCumbre(b.dataset.cumbre); });
let scT = 0;
cordiScroll.addEventListener('scroll', () => {
  clearTimeout(scT);
  scT = setTimeout(() => {
    const c = cordiScroll.scrollLeft + cordiScroll.clientWidth / 2;
    let mejor = null, d = 1e9;
    $$('.cumbre', cumbresEl).forEach(b => { const x = Math.abs(b.offsetLeft - c); if (x < d) { d = x; mejor = b; } });
    if (mejor) activarCumbre(mejor.dataset.cumbre);
  }, 120);
}, { passive: true });
// arrastrar la cordillera con el mouse (pantallas medianas donde se desliza)
(function arrastre(el) {
  let x0 = 0, s0 = 0, on = false, movio = false;
  el.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' || el.scrollWidth <= el.clientWidth) return; on = true; movio = false; x0 = e.clientX; s0 = el.scrollLeft; el.style.scrollSnapType = 'none'; });
  addEventListener('pointermove', (e) => { if (!on) return; const dx = e.clientX - x0; if (Math.abs(dx) > 4) movio = true; el.scrollLeft = s0 - dx; });
  addEventListener('pointerup', () => { if (!on) return; on = false; el.style.scrollSnapType = ''; });
  el.addEventListener('click', (e) => { if (movio) { e.stopPropagation(); e.preventDefault(); movio = false; } }, true);
})(cordiScroll);

// =========================================================
// LA TOLVA + TIENDA DE CAFÉ EN GRANO
// =========================================================
const wow = $('.tolva__wow'), ficha = $('[data-ficha]');
$$('[data-tolva]').forEach(b => b.addEventListener('click', () => {
  wow.classList.remove('is-cae'); void wow.offsetWidth; wow.classList.add('is-cae');
  ficha.classList.toggle('is-vuelta');
}));
$('[data-ir-tienda]')?.addEventListener('click', (e) => {
  e.preventDefault();
  const card = $('#tienda .kit-item[data-id="grano-tolva"]') || $('#tienda');
  card.scrollIntoView({ behavior: calma ? 'auto' : 'smooth', block: 'center' });
  card.classList.add('is-destacada'); setTimeout(() => card.classList.remove('is-destacada'), 2200);
});
const tienda = $('#tienda');
function eleccion(card) {
  const id = card.dataset.id; const p = productos.get(id);
  const v = $(`input[name="v-${CSS.escape(id)}"]:checked`, card)?.value;
  const o = $(`input[name="o-${CSS.escape(id)}"]:checked`, card);
  return { p, variante: v, opc: o ? { [o.dataset.grupo]: o.value } : undefined };
}
tienda.addEventListener('change', (e) => {
  const card = e.target.closest('.kit-item'); if (!card) return;
  const { p, variante, opc } = eleccion(card); if (!p) return;
  const vv = (p.variantes || []).find(x => String(x.id) === String(variante));
  const g = (p.opciones || [])[0]; const val = g && opc ? g.valores.find(x => x.id === opc[g.id]) : null;
  if (vv) $('.bolsa__precio', card).textContent = kit.money(Number(vv.precio) + Number(val?.precio || 0));
});
tienda.addEventListener('click', (e) => {
  const b = e.target.closest('[data-sumar-bolsa]'); if (!b) return;
  const card = b.closest('.kit-item'); const { variante, opc } = eleccion(card);
  kit.carrito.agregar(b.dataset.sumarBolsa, 1, { variante, opc, origen: b });
  b.textContent = 'Sumado ✓'; b.disabled = true;
  setTimeout(() => { b.textContent = 'Sumar'; b.disabled = false; }, 1400);
});
function rellenarDestacados() {
  $$('[data-kit-destacado]').forEach(el => { const [d, c] = el.dataset.kitDestacado.split('.'); const v = kit.destacados?.[d]?.[c]; if (v != null && el.textContent !== v) el.textContent = v; });
}
document.addEventListener('kit:destacados', rellenarDestacados);
rellenarDestacados();

// =========================================================
// TRAÉ TU VASO (casilla del checkout)
// =========================================================
const vasoSec = $('.vaso'), vasoSw = $('[data-vaso]');
function pintarVaso(on) { vasoSw.setAttribute('aria-checked', on); vasoSec.classList.toggle('is-on', on); $('span:last-child', vasoSw).textContent = on ? 'Listo: lo sumamos a tu pedido' : 'Voy a traer mi vaso'; }
vasoSw.addEventListener('click', () => { const on = vasoSw.getAttribute('aria-checked') !== 'true'; kit.carrito.setCasilla('vaso', on); pintarVaso(on); });
document.addEventListener('kit:casillas', (e) => pintarVaso(e.detail.includes('vaso')));
pintarVaso(kit.carrito.casillas.includes('vaso'));

// =========================================================
// USTEDES: mazo para pasar con el dedo (celu)
// =========================================================
(function mazo(el) {
  if (!el) return;
  const cartas = $$('figure', el);
  let orden = cartas.slice();
  const pintar = () => orden.forEach((f, i) => {
    f.style.zIndex = String(orden.length - i);
    const r = [0, -3, 2.5, -1.5, 3][i % 5];
    f.style.transform = i < 4 ? `translate(${i * 3}px, ${i * 6}px) rotate(${r}deg)` : `translate(0, 18px) scale(.96)`;
    f.style.opacity = i < 4 ? '1' : '0';
  });
  pintar();
  let x0 = 0, y0 = 0, dx = 0, activa = null, id = null;
  el.addEventListener('pointerdown', (e) => {
    const top = orden[0]; if (!e.target.closest('figure') || e.target.closest('figure') !== top) return;
    activa = top; id = e.pointerId; x0 = e.clientX; y0 = e.clientY; dx = 0; top.style.transition = 'none'; top.setPointerCapture(id);
  });
  el.addEventListener('pointermove', (e) => {
    if (!activa || e.pointerId !== id) return;
    dx = e.clientX - x0; const dy = (e.clientY - y0) * .25;
    activa.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx / 14}deg)`;
  });
  const soltar = () => {
    if (!activa) return; const f = activa; activa = null; f.style.transition = '';
    if (Math.abs(dx) > 80) {
      f.style.transform = `translate(${Math.sign(dx) * 140}%, 30px) rotate(${Math.sign(dx) * 22}deg)`; f.style.opacity = '0';
      setTimeout(() => { orden = [...orden.slice(1), f]; f.style.transition = 'none'; pintar(); void f.offsetWidth; f.style.transition = ''; }, 380);
    } else pintar();
  };
  el.addEventListener('pointerup', soltar); el.addEventListener('pointercancel', soltar);
})($('[data-mazo]'));

// =========================================================
// PIZARRÓN: sus frases, se borran y se escriben
// =========================================================
const FRASES = [
  'Mucha gente pequeña, en lugares pequeños, haciendo cosas pequeñas, puede cambiar el mundo.',
  'Te brindamos un aroma para evocar, te entregamos un sabor para disfrutar.',
  'Compartiendo el momento, no la comida.',
  'Morimos cada vez que no elegimos lo que tiene que ver con el amor.',
];
let fraseI = 0;
$('[data-borrar]')?.addEventListener('click', () => {
  const f = $('[data-frase]');
  f.classList.add('is-borra');
  setTimeout(() => {
    fraseI = (fraseI + 1) % FRASES.length; f.textContent = FRASES[fraseI];
    f.style.transition = 'none'; f.classList.remove('is-borra'); f.style.clipPath = 'inset(0 100% 0 0)';
    void f.offsetWidth; f.style.transition = ''; f.style.clipPath = '';
  }, 520);
});

// =========================================================
// DÓNDE ESTAMOS: horario de hoy, abierto/cerrado y mapa
// =========================================================
const DIAS = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
const NOMBRE = { dom: 'el domingo', lun: 'el lunes', mar: 'el martes', mie: 'el miércoles', jue: 'el jueves', vie: 'el viernes', sab: 'el sábado' };
const h12 = (h) => String(h).replace(/^0/, '').replace(/:00$/, '');
function proximaApertura() {
  const H = kit.config.horarios; const hoy = new Date(kit.hoy() + 'T12:00:00Z').getUTCDay();
  for (let i = 1; i <= 7; i++) { const d = DIAS[(hoy + i) % 7]; if ((H[d] || []).length) return { dia: i === 1 ? 'mañana' : NOMBRE[d], hora: h12(H[d][0][0]) }; }
  return null;
}
function pintarAbierto() {
  const e = kit.abierto();
  let corto, largo;
  if (e.abierto) { corto = `Abierto · hasta las ${h12(e.cierra)}`; largo = `Abierto ahora · cerramos a las ${h12(e.cierra)}`; }
  else if (e.abre) { corto = `Abrimos a las ${h12(e.abre)}`; largo = `Cerrado ahora · abrimos hoy a las ${h12(e.abre)}`; }
  else { const p = proximaApertura(); corto = p ? `Abrimos ${p.dia} a las ${p.hora}` : 'Cerrado'; largo = p ? `Cerrado ahora · abrimos ${p.dia} a las ${p.hora}` : 'Cerrado'; }
  $$('[data-abierto]').forEach(el => { el.classList.toggle('is-cerrado', !e.abierto); $('span', el).textContent = corto; });
  $$('[data-abierto-largo]').forEach(el => { el.classList.toggle('is-cerrado', !e.abierto); $('span', el).textContent = largo; });
  const d = DIAS[new Date(kit.hoy() + 'T12:00:00Z').getUTCDay()];
  $$('[data-horas] li').forEach(li => li.classList.toggle('is-hoy', li.dataset.dia === d));
}
pintarAbierto(); setInterval(pintarAbierto, 60_000);
const mapa = $('.donde__mapa iframe');
if (mapa) {
  const cargar = () => { if (mapa.dataset.src) { mapa.src = mapa.dataset.src; delete mapa.dataset.src; } };
  if (io) { const mo = new IntersectionObserver((es) => { if (es.some(x => x.isIntersecting)) { cargar(); mo.disconnect(); } }, { rootMargin: '500px 0px' }); mo.observe(mapa); } else cargar();
}

// =========================================================
// CONTADOR DEL PEDIDO EN LA BARRA (desktop)
// =========================================================
function pintarContador() {
  const n = (kit.carrito?.calc().items || []).reduce((s, i) => s + i.cant, 0);
  const b = $('.top__n'); b.hidden = !n; b.textContent = n;
  $('.top__carro').setAttribute('aria-label', n ? `Ver mi pedido (${n})` : 'Ver mi pedido');
}
document.addEventListener('kit:carrito', pintarContador);
kit.carrito?.listo.then(pintarContador);

// =========================================================
// EL TICKET SALE POR LA VENTANILLA (confirmación propia)
// =========================================================
const tk = $('.tk');
const DIAS_L = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
function cuandoTexto(r) {
  if (!r?.fecha) return 'Te avisamos cuando esté listo.';
  const [, m, d] = r.fecha.split('-').map(Number);
  const dia = r.fecha === kit.hoy() ? 'hoy' : `el ${DIAS_L[new Date(r.fecha + 'T12:00:00Z').getUTCDay()]} ${d}/${m}`;
  const f = r.franja || {};
  if (f.asap || f.id === 'asap') return `Retirás <b>lo antes posible</b>, ${dia} (~${esc(h12(f.desde))} h)`;
  if (f.desde && f.desde === f.hasta) return `Retirás <b>${dia} a las ${esc(h12(f.desde))}</b>`;
  return `Retirás <b>${dia}</b> · ${esc(f.nombre || '')} (${esc(h12(f.desde))} a ${esc(h12(f.hasta))} h)`;
}
document.addEventListener('kit:exito', (e) => {
  const d = e.detail; if (!['enviado', 'aprobado'].includes(d.estado)) return;
  e.preventDefault();
  const p = d.pedido || {};
  $('.tk__cod', tk).textContent = `#${d.codigo || p.codigo || ''}`;
  $('.tk__cuando', tk).innerHTML = `${cuandoTexto(p.retiro)}${p.cliente?.nombre ? ` · ${esc(p.cliente.nombre)}` : ''}`;
  $('.tk__items', tk).innerHTML = (p.items || []).map(i => `<li>${i.cant} × ${esc(i.nombre)}${i.detalle ? ` <small>(${esc(i.detalle)})</small>` : ''}</li>`).join('');
  $('.tk__pago', tk).textContent = d.estado === 'aprobado' ? 'Pagado con Mercado Pago (prueba).' : p.pago === 'efectivo' ? 'Pagás en efectivo al retirar.' : 'Lo confirmás por WhatsApp con el local.';
  $('.tk__sub', tk).textContent = d.estado === 'aprobado' ? 'El local ya lo ve en su panel. Pasá por la ventanilla de Jonte 2999.' : 'Tu pedido ya está en el panel del local. Si se abrió WhatsApp, mandá el mensaje para confirmarlo.';
  const wa = $('[data-tk-wa]', tk); wa.hidden = !d.waUrl; if (d.waUrl) wa.href = d.waUrl;
  const papel = $('.tk__papel', tk); papel.style.animation = 'none'; void papel.offsetWidth; papel.style.animation = '';
  tk.hidden = false; html.classList.add('tk-abierto'); bloquear(true);
  setTimeout(() => $('.tk__x', tk).focus(), 50);
});
function cerrarTk() { if (tk.hidden) return; tk.hidden = true; html.classList.remove('tk-abierto'); bloquear(false); }
tk.addEventListener('click', (e) => { if (e.target.closest('[data-tk-cerrar]')) cerrarTk(); });
addEventListener('keydown', (e) => { if (e.key !== 'Escape') return; if (!tk.hidden) cerrarTk(); if (!lb.hidden) cerrarLb(); });

// la píldora del panel en el celu: solo en el inicio y al final (no tapa botones en el medio)
if (io) {
  const vistos = new Set();
  const po = new IntersectionObserver((es) => { es.forEach(e => e.isIntersecting ? vistos.add(e.target) : vistos.delete(e.target)); html.classList.toggle('pill-fuera', vistos.size === 0); });
  [$('.hero'), $('.pie')].forEach(x => x && po.observe(x));
}

// procesar la carta que ya se dibujó mientras arrancaba el kit
alCarta = onCarta; pendientes.splice(0).forEach(onCarta);
