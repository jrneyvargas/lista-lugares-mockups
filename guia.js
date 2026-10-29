/* Lista de Lugares — guia de viagem somente leitura (roda dentro do .html gerado).
   Tudo funciona offline; só os blocos do mapa precisam de internet.
   Marcações "quero ir" / "já fui" ficam salvas só neste celular. */
(function () {
  'use strict';
  const { esc } = LL;
  const CFG = Object.assign({
    layout: 'niveis',
    cabecalho: ({ texto }) => `<h1 class="g-h1">${esc(texto)}</h1>`,
    depois: () => {}
  }, window.GUIA_CFG || {});
  const demo = !window.GUIA_INFO;
  const G = window.GUIA_INFO || { id: 'demo-jp', titulo: 'Japão · guia de exemplo', gerado: new Date().toISOString(), pais: 'jp' };
  if (demo) {
    LL.lugares = LL.lugares.filter(l => l.pais === G.pais).map(l => ({ ...l, fotos: (l.fotos || []).slice(0, 1) }));
    LL.cidades = LL.cidades.filter(c => c.pais === G.pais);
    LL.paises = LL.paises.filter(p => p.id === G.pais);
  }
  const P = LL.pais(G.pais);
  const app = document.getElementById('guia');

  /* ---------- ícones e bandeira embutidos ---------- */
  LL.icone = (n, cls) => {
    const I = window.LL_ICONES || {}, cheio = n.endsWith('-filled');
    return `<svg class="ti ti-${n}${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" width="24" height="24" fill="${cheio ? 'currentColor' : 'none'}" stroke="${cheio ? 'none' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n] || I['map-pin'] || ''}</svg>`;
  };
  const icone = LL.icone;
  LL.bandeira = id => { const p = LL.pais(id); if (!p) return ''; return p.bandeiraImg ? `<img class="ll-bandeira" src="${p.bandeiraImg}" alt="" width="20" height="15">` : `<span class="fi fi-${p.bandeira} ll-bandeira" aria-hidden="true"></span>`; };

  /* ---------- marcações salvas só neste celular ---------- */
  const CHAVE = 'lista-lugares-guia-' + G.id;
  let marcas = {};
  try { marcas = JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { marcas = {}; }
  LL.lugares.forEach(l => { const m = marcas[l.id]; if (m) { l.favorito = !!m.f; l.visitado = !!m.v; } });
  LL.aoMudar(ev => {
    if (ev.acao !== 'favorito' && ev.acao !== 'visitado') return;
    const l = LL.lugar(ev.id); marcas[l.id] = { f: !!l.favorito, v: !!l.visitado };
    try { localStorage.setItem(CHAVE, JSON.stringify(marcas)); } catch (e) { /* sem armazenamento: vale só nesta abertura */ }
  });

  /* ---------- internet instável ---------- */
  let online = navigator.onLine;
  const mapaBase = LL.mapa;
  LL.mapa = (el, pts, op) => {
    if (!online || !window.L) {
      el.classList.add('g-sem-net');
      el.innerHTML = `<p class="ll-mapa-off">${icone('wifi-off')}<span>Sem internet agora — o mapa volta sozinho quando a conexão voltar.</span></p>`;
      return null;
    }
    const m = mapaBase(el, pts, op); let erros = 0;
    if (m) m.eachLayer(c => c.on && c.on('tileerror', () => { if (++erros === 3) el.insertAdjacentHTML('beforeend', `<p class="g-mapa-fraco">${icone('wifi-off')} Internet fraca: o mapa pode demorar.</p>`); }));
    return m;
  };
  const avisoNet = () => { const s = document.querySelector('.g-net'); if (s) s.hidden = online; };
  addEventListener('online', () => { online = true; avisoNet(); desenhar(true); });
  addEventListener('offline', () => { online = false; avisoNet(); desenhar(true); });

  /* ---------- GPS do celular ----------
     O Chrome só libera a localização em página segura (https ou localhost).
     Aberto como arquivo (WhatsApp, Downloads) ou por http://IP, não há GPS. */
  const seguro = window.isSecureContext && !!navigator.geolocation;
  LL.config.semGPS = !seguro && !demo;
  LL.usarGPS = () => {
    const simular = motivo => { LL.toast(`${motivo} No guia de exemplo, simulei que você está em Shibuya.`, { icone: 'current-location' }); LL.origem = { modo: 'gps', simulado: true, ...LL.LOCAL_SIMULADO }; LL.avisar({ acao: 'origem' }); };
    const falhou = motivo => demo ? simular(motivo) : LL.toast(`${motivo} Escolha em “Medir a partir de…” onde você está.`, { icone: 'current-location' });
    if (!seguro) return falhou('Aberto por aqui, o Chrome não libera a localização (só pelo link https do guia).');
    LL.toast('Procurando você no GPS…', { icone: 'current-location' });
    navigator.geolocation.getCurrentPosition(pos => {
      const o = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const perto = Math.min(...LL.lugares.filter(l => l.lat != null).map(l => LL.metros(o, l)));
      if (demo && perto > 300000) return simular(`A localização funcionou! Você está a ${LL.fmtDistancia(perto)} do lugar mais próximo do guia.`);
      LL.origem = { modo: 'gps', nome: 'você', ...o }; LL.avisar({ acao: 'origem' });
    }, e => falhou(e.code === 1 ? 'A permissão de localização foi negada (confira as permissões do Chrome).' : 'O GPS não respondeu agora.'), { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  };

  /* ---------- aberto por link: guarda o guia no celular para usar offline ---------- */
  if ('serviceWorker' in navigator && window.isSecureContext && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register(window.GUIA_SW || 'guia-sw.js').then(() => navigator.serviceWorker.ready).then(reg => {
      navigator.serviceWorker.addEventListener('message', ev => {
        if (ev.data?.guardado && !localStorage.getItem(CHAVE + '-offline')) {
          try { localStorage.setItem(CHAVE + '-offline', '1'); } catch (e) {}
          LL.toast('Guia guardado neste celular: agora ele abre mesmo sem internet.', { icone: 'circle-check' });
        }
        const r = document.querySelector('.g-offline-ok'); if (r) r.hidden = false;
      });
      reg.active?.postMessage({ cachear: [location.href.split('#')[0], ...performance.getEntriesByType('resource').map(e => e.name).filter(u => !/basemaps|tile/.test(u))] });
    }).catch(() => {});
  }

  /* ---------- rotas ---------- */
  let est = {}, ordem = 'favoritos', vista = 'tipos', soFav = false, naoFui = false, mapa = null, painel = null;
  const lerHash = () => {
    const p = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    if (p[0] === 'busca') return { busca: p[1] || '', lugar: p[2] || null };
    if (p[0] === 'favoritos') return { favs: true, lugar: p[1] || null };
    return { cidade: p[0] && p[0] !== '-' ? p[0] : null, tipo: p[1] && p[1] !== '-' ? p[1] : null, lugar: p[2] || null };
  };
  const rota = (...p) => { while (p.length && !p[p.length - 1]) p.pop(); return '#/' + p.map(x => x ? encodeURIComponent(x) : '-').join('/'); };
  const rotaLugar = l => est.busca != null ? rota('busca', est.busca, l.id) : est.favs ? rota('favoritos', l.id)
    : CFG.layout === 'filtros' ? rota(est.cidade, est.tipo, l.id) : rota(l.cidade, est.tipo === 'mapa' ? 'mapa' : l.tipo, l.id);

  /* ---------- peças ---------- */
  const dataGerado = new Date(G.gerado).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '');
  const fotoCidade = cid => (LL.filtrar({ cidade: cid }).find(l => l.fotos?.length) || {}).fotos?.[0] || null;
  const barra = (v, t) => `<span class="g-barra" role="img" aria-label="${v} de ${t} visitados"><span style="width:${t ? Math.round(v / t * 100) : 0}%"></span></span>`;
  const meta = f => { const g = LL.progresso(f); return `<p class="g-meta"><span>${g.total} ${g.total === 1 ? 'lugar' : 'lugares'}</span><span>${barra(g.visitados, g.total)} ${g.visitados} de ${g.total} visitados</span>${g.favoritos ? `<span>${icone('heart-filled')} ${g.favoritos} quero ir</span>` : ''}</p>`; };
  const item = l => {
    const t = LL.tipo(l.tipo), dist = LL.textoDistancia(l), res = LL.resumo(l);
    return `<li class="g-item${l.visitado ? ' visitado' : ''}" data-id="${l.id}" style="--cor-tipo:${LL.corTipo(l.tipo)}">
      <a class="g-item-link" href="${rotaLugar(l)}">${l.fotos?.[0] ? `<img class="g-item-foto" src="${l.fotos[0]}" alt="" loading="lazy">` : `<span class="g-item-ic">${icone(t.icone)}</span>`}
        <span class="g-item-txt"><b class="g-item-nome">${esc(l.titulo)}</b>
          ${res ? `<span class="g-item-res">${esc(res)}</span>` : ''}
          ${LL.seloSituacao(l)}
          ${est.busca != null || est.favs || (CFG.layout === 'filtros' && !est.cidade) ? `<span class="g-item-res">${esc(t.nome)} · ${esc(LL.cidade(l.cidade)?.nome || '')}</span>` : ''}
          ${dist ? `<span class="g-item-dist">${icone('walk')} ${esc(dist)}</span>` : ''}</span></a>
      <span class="g-item-acoes"><button type="button" class="g-bot" data-fav aria-pressed="${!!l.favorito}" aria-label="Quero ir: ${esc(l.titulo)}">${icone(l.favorito ? 'heart-filled' : 'heart')}</button>
        <button type="button" class="g-bot" data-vis aria-pressed="${!!l.visitado}" aria-label="Já fui: ${esc(l.titulo)}">${icone('check')}</button></span></li>`;
  };
  const ferramentas = filtro => {
    const div = LL.h(`<div class="g-ferr"><div class="g-origem"></div><div class="g-ordem" role="group" aria-label="Ordenar">
      ${[['perto', 'Mais perto'], ['favoritos', 'Quero ir primeiro'], ['nome', 'A–Z']].map(([k, n]) => `<button type="button" class="ll-chip" data-ordem="${k}" aria-pressed="${ordem === k}">${n}</button>`).join('')}</div></div>`);
    div.querySelector('.g-origem').append(LL.ui.seletorOrigem({ filtro }));
    div.querySelectorAll('[data-ordem]').forEach(b => b.onclick = () => {
      if (b.dataset.ordem === 'perto' && !LL.origem) { LL.toast(LL.config.semGPS ? 'Primeiro escolha em “Medir a partir de…” onde você está.' : 'Primeiro: “Usar minha localização” ou “Medir a partir de…”.', { icone: 'current-location' }); return; }
      ordem = b.dataset.ordem; desenhar(true);
    });
    return div;
  };
  const lista = ls => {
    if (ordem === 'perto' && !LL.origem) ordem = 'favoritos';
    ls = LL.ordenar(ls, ordem);
    return ls.length ? `<ul class="g-lista">${ls.map(item).join('')}</ul>` : '<p class="g-vazio">Nenhum lugar aqui.</p>';
  };
  const ligarItens = raiz => raiz.querySelectorAll('.g-item').forEach(li => {
    const id = li.dataset.id;
    li.querySelector('[data-fav]').onclick = e => { const v = LL.alternarFavorito(id), b = e.currentTarget; b.setAttribute('aria-pressed', v); b.innerHTML = icone(v ? 'heart-filled' : 'heart'); b.classList.remove('ll-pulo'); void b.offsetWidth; b.classList.add('ll-pulo'); };
    li.querySelector('[data-vis]').onclick = e => { const v = LL.alternarVisitado(id), b = e.currentTarget; b.setAttribute('aria-pressed', v); li.classList.toggle('visitado', v); b.classList.remove('ll-pulo'); void b.offsetWidth; b.classList.add('ll-pulo'); };
  });
  const voltar = (href, txt) => `<a class="g-voltar" href="${href}">${icone('arrow-left')} ${esc(txt)}</a>`;
  const ficha = l => {
    const f = LL.ui.ficha(l, { somenteLeitura: true }), s = LL.situacao(l);
    if (s) f.querySelector('.ll-ficha-cab').insertAdjacentHTML('afterend', `<section class="g-agora"><h3 class="ll-secao-titulo">${icone('clock')} Agora em ${esc(LL.cidade(l.cidade)?.nome || '')} · ${esc(s.agora)}</h3>${LL.seloSituacao(l, { todos: true })}</section>`);
    return f;
  };

  /* ================= layout por níveis (A e B) ================= */
  const niveis = () => {
    const m = document.getElementById('g-main');
    if (est.busca != null) {
      const ls = LL.buscar(est.busca);
      m.innerHTML = `${voltar(rota(), P.nome)}${CFG.cabecalho({ texto: `Busca: ${est.busca}`, nivel: 'busca' })}<p class="g-meta">${ls.length} resultados</p>${lista(ls)}`;
    } else if (est.lugar) {
      const l = LL.lugar(est.lugar); if (!l) { location.hash = rota(); return; }
      const de = est.favs ? [rota('favoritos'), 'Quero ir'] : est.busca != null ? [rota('busca', est.busca), 'Busca'] : [rota(l.cidade, est.tipo), est.tipo === 'mapa' ? `Mapa de ${LL.cidade(l.cidade).nome}` : `${LL.tipo(l.tipo).plural} em ${LL.cidade(l.cidade).nome}`];
      m.innerHTML = voltar(...de) + '<div class="g-ficha"></div>';
      m.querySelector('.g-ficha').append(ficha(l));
    } else if (est.favs) {
      m.innerHTML = `${voltar(rota(), P.nome)}${CFG.cabecalho({ texto: 'Quero ir', nivel: 'favs' })}${meta({ favorito: true })}<div class="g-ferr-lugar"></div>${lista(LL.filtrar({ favorito: true }))}`;
      m.querySelector('.g-ferr-lugar').append(ferramentas({}));
    } else if (est.tipo && est.tipo !== 'mapa') {
      const c = LL.cidade(est.cidade), t = LL.tipo(est.tipo);
      m.innerHTML = `${voltar(rota(c.id), c.nome)}${CFG.cabecalho({ texto: `${t.plural} · ${c.nome}`, nivel: 'tipo', tipo: t.id })}${meta({ cidade: c.id, tipo: t.id })}<div class="g-ferr-lugar"></div>${lista(LL.filtrar({ cidade: c.id, tipo: t.id }))}`;
      m.querySelector('.g-ferr-lugar').append(ferramentas({ cidade: c.id }));
    } else if (est.cidade) {
      const c = LL.cidade(est.cidade); if (!c) { location.hash = rota(); return; }
      if (est.tipo === 'mapa') vista = 'mapa';
      m.innerHTML = `${voltar(rota(), P.nome)}${CFG.cabecalho({ texto: c.nome, foto: fotoCidade(c.id), nivel: 'cidade' })}${meta({ cidade: c.id })}
        <div class="g-abas" role="tablist"><button type="button" role="tab" aria-selected="${vista !== 'mapa'}" data-vista="tipos">${icone('stack-2')} Por tipo</button><button type="button" role="tab" aria-selected="${vista === 'mapa'}" data-vista="mapa">${icone('map')} Mapa</button></div>
        <div class="g-vista"></div>`;
      const v = m.querySelector('.g-vista');
      if (vista === 'mapa') {
        v.append(ferramentas({ cidade: c.id })); v.querySelector('.g-ordem').remove();
        v.insertAdjacentHTML('beforeend', '<div class="ll-mapa g-mapa"></div>');
        mapa = LL.mapa(v.querySelector('.g-mapa'), LL.filtrar({ cidade: c.id }), { aoClicar: id => { location.hash = rota(c.id, 'mapa', id); } });
      } else {
        v.innerHTML = `<ul class="g-tipos">${LL.tiposEm({ cidade: c.id }).map(({ tipo: t, qtd }) => { const x = LL.progresso({ cidade: c.id, tipo: t.id }); return `
          <li><a class="g-tipo" href="${rota(c.id, t.id)}" style="--cor-tipo:${LL.corTipo(t.id)}"><span class="g-tipo-ic">${icone(t.icone)}</span><b>${esc(qtd === 1 ? t.nome : t.plural)}</b><span class="g-tipo-num">${qtd}</span>${x.visitados ? `<small>${x.visitados} visitado${x.visitados > 1 ? 's' : ''}</small>` : ''}</a></li>`; }).join('')}</ul>`;
      }
      m.querySelectorAll('[data-vista]').forEach(b => b.onclick = () => { vista = b.dataset.vista; if (est.tipo === 'mapa') { history.replaceState(null, '', rota(c.id)); est.tipo = null; } desenhar(); });
    } else {
      const favs = LL.filtrar({ favorito: true }).length;
      m.innerHTML = `${CFG.cabecalho({ texto: P.nome, foto: fotoCidade(LL.cidadesDe(P.id)[0]?.id), nivel: 'inicio' })}${meta({})}
        ${favs ? `<a class="g-atalho" href="${rota('favoritos')}">${icone('heart-filled')}<span>Quero ir</span><b>${favs}</b>${icone('chevron-right')}</a>` : ''}
        <ul class="g-cidades">${LL.cidadesDe(P.id).map(c => { const g = LL.progresso({ cidade: c.id }), f = fotoCidade(c.id); return `
          <li><a class="g-cidade${g.total && g.visitados === g.total ? ' completa' : ''}" href="${rota(c.id)}">${f ? `<img src="${f}" alt="" loading="lazy">` : ''}
            <span class="g-cidade-txt"><b>${esc(c.nome)}</b><small>${g.total} lugares · ${g.visitados} de ${g.total} visitados</small>${barra(g.visitados, g.total)}</span>${icone('chevron-right')}</a></li>`; }).join('')}</ul>`;
    }
    ligarItens(m);
    CFG.depois(m, est);
  };

  /* ================= layout por filtros (C) ================= */
  const capsula = (rot, ativo, attrs, bolha, cor) => `<button type="button" class="capsula" aria-pressed="${ativo}" ${attrs} ${cor ? `style="--c:${cor}"` : ''}>${rot}<span class="bolha">${ativo ? icone('check') : bolha}</span></button>`;
  const filtros = () => {
    const m = document.getElementById('g-main');
    const f = { cidade: est.cidade, tipo: est.tipo };
    let ls = est.busca ? LL.buscar(est.busca) : LL.filtrar(f);
    if (soFav) ls = ls.filter(l => l.favorito);
    if (naoFui) ls = ls.filter(l => !l.visitado);
    const c = LL.cidade(est.cidade), t = est.tipo && LL.tipo(est.tipo);
    const texto = est.busca ? `“${est.busca}”` : t && c ? `${t.plural} em ${c.nome}` : t ? `${t.plural} no ${P.nome}` : c ? c.nome : P.nome;
    m.innerHTML = `<section class="g-heroi">${CFG.cabecalho({ texto, nivel: 'filtros', tipo: est.tipo })}${meta(f)}</section>
      <nav class="g-filtros" aria-label="Filtros">
        <div class="fileira f-cidade" role="group" aria-label="Cidade">${LL.cidadesDe(P.id).map(x => capsula(`<span>${esc(x.nome)}</span>`, est.cidade === x.id, `data-cidade="${x.id}"`, LL.filtrar({ cidade: x.id }).length)).join('')}</div>
        <div class="fileira f-tipo" role="group" aria-label="Tipo">${LL.tiposEm({ cidade: est.cidade }).map(({ tipo: x, qtd }) => capsula(`${icone(x.icone)}<span>${esc(qtd === 1 ? x.nome : x.plural)}</span>`, est.tipo === x.id, `data-tipo="${x.id}"`, qtd, LL.corTipo(x.id))).join('')}
          ${capsula(`${icone('heart')}<span>Quero ir</span>`, soFav, 'data-sofav', icone('plus'), 'var(--coral)')}${capsula(`${icone('route')}<span>Ainda não fui</span>`, naoFui, 'data-naofui', icone('plus'), 'var(--lilas)')}</div>
      </nav>
      <div class="g-barra-res"><label class="g-busca-c">${icone('search')}<input type="search" placeholder="Buscar lugar ou comida…" aria-label="Buscar" value="${esc(est.busca || '')}"></label>
        <div class="g-alterna" role="group" aria-label="Ver como"><button type="button" aria-pressed="${vista !== 'mapa'}" data-vista="lista">${icone('layout-grid')} Lista</button><button type="button" aria-pressed="${vista === 'mapa'}" data-vista="mapa">${icone('map')} Mapa</button></div></div>
      <div class="g-ferr-lugar"></div><div class="g-res"></div>`;
    m.querySelector('.g-ferr-lugar').append(ferramentas({ cidade: est.cidade }));
    const res = m.querySelector('.g-res');
    if (vista === 'mapa') { m.querySelector('.g-ordem').remove(); res.innerHTML = '<div class="ll-mapa g-mapa"></div>'; mapa = LL.mapa(res.firstChild, ls, { aoClicar: id => { location.hash = rota(est.cidade, est.tipo, id); } }); }
    else res.innerHTML = lista(ls);
    m.querySelectorAll('[data-cidade]').forEach(b => b.onclick = () => { const id = b.dataset.cidade === est.cidade ? null : b.dataset.cidade; location.hash = rota(id, est.tipo && LL.filtrar({ cidade: id, tipo: est.tipo }).length ? est.tipo : null); });
    m.querySelectorAll('[data-tipo]').forEach(b => b.onclick = () => { location.hash = rota(est.cidade, b.dataset.tipo === est.tipo ? null : b.dataset.tipo); });
    m.querySelector('[data-sofav]').onclick = () => { soFav = !soFav; desenhar(true); };
    m.querySelector('[data-naofui]').onclick = () => { naoFui = !naoFui; desenhar(true); };
    m.querySelectorAll('[data-vista]').forEach(b => b.onclick = () => { vista = b.dataset.vista; desenhar(true); });
    const inp = m.querySelector('.g-busca-c input'); let tm;
    inp.oninput = () => { clearTimeout(tm); tm = setTimeout(() => { est.busca = inp.value.trim() || null; desenhar(true); const n = document.querySelector('.g-busca-c input'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 260); };
    ligarItens(m);
    const ativo = m.querySelector('.g-filtros [aria-pressed=true]'); if (ativo) ativo.scrollIntoView({ block: 'nearest', inline: 'center' });
    CFG.depois(m, est);
    /* ficha por cima */
    if (painel) { const p = painel; painel = null; p.fechar(); }
    const l = est.lugar && LL.lugar(est.lugar);
    if (l) painel = LL.painel({ titulo: LL.tipo(l.tipo).nome, conteudo: ficha(l), classe: 'll-painel-form', aoFechar: () => { if (painel) { painel = null; history.replaceState(null, '', rota(est.cidade, est.tipo)); est.lugar = null; } } });
  };

  /* ---------- casca ---------- */
  app.innerHTML = `<header class="g-topo"><div class="g-topo-in">
      <a class="g-marca" href="#/">${LL.bandeira(P.id)}<span>${esc(G.titulo)}</span></a>
      ${CFG.layout === 'niveis' ? `<form class="g-busca" role="search" onsubmit="return false">${icone('search')}<input type="search" placeholder="Buscar…" aria-label="Buscar no guia" autocomplete="off"></form>` : ''}</div>
      <p class="g-net" role="status" ${online ? 'hidden' : ''}>${icone('wifi-off')} Sem internet — tudo funciona, menos o mapa.</p></header>
    <main id="g-main" class="g-main"></main>
    <footer class="g-rodape"><p class="g-offline-ok" hidden>${icone('circle-check')} Guardado neste celular — funciona sem internet</p>
      Guia gerado em ${esc(dataGerado)} pela Lista de Lugares · somente leitura · suas marcações ficam salvas só neste celular${demo ? ' · <b>exemplo com dados de demonstração</b>' : ''}</footer>`;
  const buscaN = app.querySelector('.g-busca input');
  if (buscaN) {
    let tb;
    buscaN.oninput = () => { clearTimeout(tb); tb = setTimeout(() => {
      const q = buscaN.value.trim();
      if (!q) { if (est.busca != null) location.hash = rota(); return; }
      if (est.busca != null) { history.replaceState(null, '', rota('busca', q)); est = lerHash(); desenhar(); } else location.hash = rota('busca', q);
    }, 240); };
  }
  const desenhar = manterScroll => {
    const y = scrollY;
    if (mapa) { mapa.remove(); mapa = null; }
    if (CFG.layout === 'filtros') filtros(); else niveis();
    if (buscaN && est.busca == null && document.activeElement !== buscaN) buscaN.value = '';
    if (manterScroll) scrollTo(0, y); else if (CFG.layout !== 'filtros' || !est.lugar) scrollTo(0, 0);
  };
  addEventListener('hashchange', () => { const antes = est; est = lerHash(); if (CFG.layout === 'filtros' && antes.cidade === est.cidade && antes.tipo === est.tipo && est.busca == null) { est.busca = antes.busca; desenhar(true); } else desenhar(); });
  LL.aoMudar(ev => {
    if (ev.acao === 'origem') { if (LL.origem && (est.tipo || est.favs || CFG.layout === 'filtros') && vista !== 'mapa') ordem = 'perto'; desenhar(true); }
    if (ev.acao === 'visitado' && ev.cidadeCompleta) LL.toast(`${LL.cidade(LL.lugar(ev.id).cidade).nome} completa! Você visitou todos os lugares.`, { icone: 'trophy' });
  });
  est = lerHash();
  desenhar();
})();
