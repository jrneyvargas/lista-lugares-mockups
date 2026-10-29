/* Lista de Lugares — núcleo compartilhado pelos 3 mockups.
   Estado em memória, distâncias, formulário com campos por tipo, ficha,
   importação de PDF simulada e gerenciador de tipos. Cada alternativa
   de design aplica seu próprio visual (CSS) e sua navegação. */
(function () {
  'use strict';
  const D = window.LL_DADOS;
  const LL = (window.LL = {});
  const clone = o => JSON.parse(JSON.stringify(o));

  LL.tipos = clone(D.tipos);
  LL.paises = clone(D.paises);
  LL.cidades = clone(D.cidades);
  LL.lugares = clone(D.lugares);
  // semServidor: cópia online de demonstração (GitHub Pages), sem o servidor de teste para publicar.
  LL.config = { mapa: 'voyager', semServidor: location.hostname.endsWith('github.io') };
  let seq = 100;
  const novoId = p => p + ++seq;

  /* ---------- eventos ---------- */
  const ouvintes = [];
  LL.aoMudar = fn => ouvintes.push(fn);
  LL.avisar = ev => ouvintes.forEach(f => f(ev || {}));

  /* ---------- texto ---------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  LL.esc = esc;
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  LL.norm = norm;
  LL.h = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  LL.icone = (n, cls) => `<i class="ti ti-${n}${cls ? ' ' + cls : ''}" aria-hidden="true"></i>`;
  LL.bandeira = paisId => { const p = LL.pais(paisId); return p ? `<span class="fi fi-${p.bandeira} ll-bandeira" aria-hidden="true"></span>` : ''; };
  LL.corTipo = id => `var(--tipo-${id}, ${LL.tipo(id).cor})`;
  LL.chipTipo = (id, extra) => { const t = LL.tipo(id); return `<span class="ll-tipo-chip ${extra || ''}" style="--cor-tipo:${LL.corTipo(id)}">${LL.icone(t.icone)}<span>${esc(t.nome)}</span></span>`; };
  const fmtNum = n => Number(n).toLocaleString('pt-BR');

  LL.autolink = txt => {
    const partes = String(txt || '').split(/(https?:\/\/[^\s<]+)/g);
    return partes.map((p, i) => {
      if (i % 2 === 0) return esc(p).replace(/\n/g, '<br>');
      const url = p.replace(/[.,;:!?)]+$/, ''); const resto = p.slice(url.length);
      let mostra = url.replace(/^https?:\/\/(www\.)?/, ''); if (mostra.length > 38) mostra = mostra.slice(0, 36) + '…';
      return `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(mostra)}${LL.icone('external-link', 'll-link-ic')}</a>${esc(resto)}`;
    }).join('');
  };
  LL.primeiraUrl = txt => (String(txt || '').match(/https?:\/\/[^\s<]+/) || [null])[0];

  /* ---------- consultas ---------- */
  LL.pais = id => LL.paises.find(p => p.id === id);
  LL.cidade = id => LL.cidades.find(c => c.id === id);
  LL.tipo = id => LL.tipos.find(t => t.id === id) || { id, nome: 'Sem tipo', plural: 'Sem tipo', icone: 'map-pin', cor: '#868e96', campos: [] };
  LL.lugar = id => LL.lugares.find(l => l.id === id);
  LL.filtrar = (f = {}) => LL.lugares.filter(l =>
    (!f.pais || l.pais === f.pais) && (!f.cidade || l.cidade === f.cidade) && (!f.tipo || l.tipo === f.tipo) &&
    (!f.favorito || l.favorito) && (f.visitado == null || l.visitado === f.visitado));
  LL.progresso = f => { const ls = LL.filtrar(f); return { total: ls.length, visitados: ls.filter(l => l.visitado).length, favoritos: ls.filter(l => l.favorito).length }; };
  LL.paisesComLugares = () => LL.paises.filter(p => LL.lugares.some(l => l.pais === p.id));
  LL.cidadesDe = paisId => LL.cidades.filter(c => c.pais === paisId && LL.lugares.some(l => l.cidade === c.id))
    .sort((a, b) => LL.filtrar({ cidade: b.id }).length - LL.filtrar({ cidade: a.id }).length);
  LL.tiposEm = (f) => LL.tipos.map(t => ({ tipo: t, qtd: LL.filtrar({ ...f, tipo: t.id }).length })).filter(x => x.qtd > 0);
  LL.cidadeCompleta = cidadeId => { const p = LL.progresso({ cidade: cidadeId }); return p.total > 0 && p.visitados === p.total; };
  LL.buscar = q => {
    const n = norm(q); if (!n) return [];
    return LL.lugares.filter(l => [l.titulo, l.descricao, l.dicas, LL.cidade(l.cidade)?.nome, LL.tipo(l.tipo).nome,
      ...(l.extras?.comida || [])].some(s => norm(s).includes(n)))
      .sort((a, b) => (norm(b.titulo).startsWith(n) ? 1 : 0) - (norm(a.titulo).startsWith(n) ? 1 : 0));
  };

  /* ---------- alterações ---------- */
  LL.alternarFavorito = id => { const l = LL.lugar(id); l.favorito = !l.favorito; LL.avisar({ acao: 'favorito', id, valor: l.favorito }); return l.favorito; };
  LL.alternarVisitado = id => {
    const l = LL.lugar(id); l.visitado = !l.visitado;
    LL.avisar({ acao: 'visitado', id, valor: l.visitado, cidadeCompleta: l.visitado && LL.cidadeCompleta(l.cidade) });
    return l.visitado;
  };
  LL.resolverCidade = (paisId, nome, lat, lng) => {
    const n = norm(nome); if (!n) return '';
    const c = LL.cidades.find(c => c.pais === paisId && norm(c.nome) === n);
    if (c) return c.id;
    const nova = { id: novoId('c'), pais: paisId, nome: nome.trim(), lat: lat || 0, lng: lng || 0, capa: null };
    LL.cidades.push(nova); return nova.id;
  };
  LL.salvarLugar = obj => {
    const l = clone(obj);
    if (l.id && LL.lugar(l.id)) { Object.assign(LL.lugar(l.id), l); LL.avisar({ acao: 'salvo', id: l.id, novo: false }); return LL.lugar(l.id); }
    l.id = novoId('l'); LL.lugares.push(l); LL.avisar({ acao: 'salvo', id: l.id, novo: true }); return l;
  };
  LL.apagarLugar = id => {
    const i = LL.lugares.findIndex(l => l.id === id); if (i < 0) return () => {};
    const [l] = LL.lugares.splice(i, 1); LL.avisar({ acao: 'apagado', id });
    return () => { LL.lugares.splice(i, 0, l); LL.avisar({ acao: 'restaurado', id }); };
  };
  LL.apagarComDesfazer = id => {
    const nome = LL.lugar(id)?.titulo; const desfazer = LL.apagarLugar(id);
    LL.toast(`“${nome}” foi apagado.`, { icone: 'trash', desfazer });
  };

  /* ---------- distância ---------- */
  LL.LOCAL_SIMULADO = { lat: 35.659, lng: 139.7006, nome: 'Shibuya, Tóquio' };
  LL.origem = null;
  LL.usarGPS = () => { LL.origem = { modo: 'gps', simulado: true, ...LL.LOCAL_SIMULADO }; LL.avisar({ acao: 'origem' }); };
  LL.usarLugarComoOrigem = id => { const l = LL.lugar(id); if (!l) return; LL.origem = { modo: 'lugar', id, lat: l.lat, lng: l.lng, nome: l.titulo }; LL.avisar({ acao: 'origem' }); };
  LL.limparOrigem = () => { LL.origem = null; LL.avisar({ acao: 'origem' }); };
  const rad = x => x * Math.PI / 180;
  LL.metros = (a, b) => {
    const R = 6371000, dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  };
  LL.distancia = l => (LL.origem && l && l.lat != null ? LL.metros(LL.origem, l) : null);
  LL.fmtDistancia = m => m == null ? '' : m < 1000 ? `${Math.round(m / 10) * 10} m` : m < 100000 ? `${(m / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km` : `${fmtNum(Math.round(m / 1000))} km`;
  LL.fmtPe = m => {
    if (m == null) return '';
    if (m > 6000) return 'melhor ir de transporte';
    const min = Math.max(1, Math.round(m / 80));
    return min < 60 ? `~${min} min a pé` : `~${Math.floor(min / 60)}h${String(min % 60).padStart(2, '0')} a pé`;
  };
  LL.textoDistancia = l => { const m = LL.distancia(l); return m == null ? '' : `${LL.fmtDistancia(m)} · ${LL.fmtPe(m)}`; };
  LL.ordenar = (lista, modo) => {
    const a = [...lista];
    if (modo === 'perto' && LL.origem) return a.sort((x, y) => LL.distancia(x) - LL.distancia(y));
    if (modo === 'nome') return a.sort((x, y) => x.titulo.localeCompare(y.titulo, 'pt-BR'));
    return a.sort((x, y) => (y.favorito - x.favorito) || (x.visitado - y.visitado) || x.titulo.localeCompare(y.titulo, 'pt-BR'));
  };

  /* ---------- valores e horário ---------- */
  LL.PERIODOS = [
    { id: 'manha', nome: 'Manhã', icone: 'sunrise' }, { id: 'tarde', nome: 'Tarde', icone: 'sun' },
    { id: 'noite', nome: 'Noite', icone: 'moon' }, { id: '24h', nome: '24h', icone: 'clock-24' }];
  LL.DIAS = [['seg', 'Seg'], ['ter', 'Ter'], ['qua', 'Qua'], ['qui', 'Qui'], ['sex', 'Sex'], ['sab', 'Sáb'], ['dom', 'Dom']];
  const DIA_LONGO = { seg: 'segundas', ter: 'terças', qua: 'quartas', qui: 'quintas', sex: 'sextas', sab: 'sábados', dom: 'domingos' };
  LL.valorPartes = (v, paisId) => {
    if (!v) return null;
    const p = LL.pais(paisId) || LL.paises[0];
    if (v.gratis) return { gratis: true, texto: 'Grátis' };
    if (!v.faixa && !v.valor) return null;
    return { faixa: v.faixa ? '$'.repeat(v.faixa) : '', local: v.valor ? `${p.simbolo}${fmtNum(v.valor)}` : '',
      reais: v.valor ? `≈ R$ ${fmtNum(Math.max(1, Math.round(v.valor * p.cotacao)))}` : '' };
  };
  LL.textoValor = (v, paisId) => { const x = LL.valorPartes(v, paisId); if (!x) return ''; if (x.gratis) return 'Grátis'; return [x.local && `${x.local} ${x.reais}`, x.faixa].filter(Boolean).join(' · '); };
  LL.textoHorario = h => {
    if (!h) return '';
    const per = h.periodos?.includes('24h') ? 'Aberto 24h' : (h.periodos || []).map(id => LL.PERIODOS.find(p => p.id === id)?.nome).join(' · ');
    const fecha = (h.fecha || []).length ? `fecha às ${h.fecha.map(d => DIA_LONGO[d]).join(' e ')}` : '';
    return [per, fecha].filter(Boolean).join(' — ');
  };
  const vazio = v => v == null || v === '' || (Array.isArray(v) && !v.length) ||
    (typeof v === 'object' && !Array.isArray(v) && (
      ('periodos' in v && !v.periodos.length && !v.nota && !(v.fecha || []).length && !(v.regras || []).length) ||
      ('faixa' in v && !v.faixa && !v.valor && !v.gratis) ||
      ('entrada' in v && !v.entrada && !v.saida) || ('de' in v && !v.de && !v.para)));
  LL.campoVazio = vazio;

  /* ================================================================
     HORÁRIO EM REGRAS + SITUAÇÃO AGORA (sempre na hora local do destino)
     regra = { tipo: 'aberto'|'fechado'|'ultima'|'aviso', dias: ['seg',…] (vazio = todos),
               de: 'HH:MM', ate: 'HH:MM' (ate ≤ de = passa da meia-noite), texto }
     ================================================================ */
  const SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
  const DIA_CURTO = { dom: 'dom', seg: 'seg', ter: 'ter', qua: 'qua', qui: 'qui', sex: 'sex', sab: 'sáb' };
  const FAIXA_PERIODO = { manha: [360, 720], tarde: [720, 1080], noite: [1080, 1440] };
  const paraMin = t => { const [h, m] = String(t).split(':').map(Number); return h * 60 + (m || 0); };
  const hora = m => { m = ((m % 1440) + 1440) % 1440; const h = Math.floor(m / 60), mm = m % 60; return mm ? `${h}h${String(mm).padStart(2, '0')}` : `${h}h`; };
  LL.hora = hora;
  const diaMais = (d, n) => SEMANA[(SEMANA.indexOf(d) + n) % 7];
  const vale = (r, d) => !r.dias || !r.dias.length || r.dias.includes(d);
  LL.relogio = () => new Date();
  LL.agoraNoDestino = paisId => {
    const fuso = LL.pais(paisId)?.fuso || 'UTC';
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: fuso, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(LL.relogio()).map(x => [x.type, x.value]));
    return { dia: { Sun: 'dom', Mon: 'seg', Tue: 'ter', Wed: 'qua', Thu: 'qui', Fri: 'sex', Sat: 'sab' }[p.weekday], min: (+p.hour % 24) * 60 + +p.minute };
  };
  LL.textoDias = dias => {
    if (!dias || !dias.length || dias.length === 7) return 'todos os dias';
    const idx = dias.map(d => SEMANA.indexOf(d)).sort((a, b) => a - b);
    const corridos = idx.every((v, i) => !i || v === idx[i - 1] + 1);
    if (corridos && idx.length > 2) return `${DIA_CURTO[SEMANA[idx[0]]]}–${DIA_CURTO[SEMANA[idx[idx.length - 1]]]}`;
    if (dias.includes('dom') && dias.length > 2) { /* faixa que vira a semana, ex.: sex–dom */
      const g = [...idx.filter(i => i > 0), 7], ok = g.every((v, i) => !i || v === g[i - 1] + 1);
      if (ok) return `${DIA_CURTO[SEMANA[g[0]]]}–dom`;
    }
    return dias.map(d => DIA_CURTO[d]).join(', ');
  };
  LL.textoRegra = r => {
    const dias = LL.textoDias(r.dias), faixa = r.de ? `${hora(paraMin(r.de))}–${hora(paraMin(r.ate || '24:00'))}` : '';
    if (r.tipo === 'aberto') return r.de === '00:00' && (!r.ate || r.ate === '24:00') ? `Aberto 24h · ${dias}` : `Aberto ${dias} · ${faixa}`;
    if (r.tipo === 'fechado') return r.de ? `Fechado ${dias} · ${faixa}` : `Fecha ${dias}`;
    if (r.tipo === 'ultima') return `Última entrada ${hora(paraMin(r.de))}${r.dias?.length ? ' · ' + dias : ''}`;
    return `${r.texto || 'Aviso'}${r.de ? ' · ' + faixa : ''}${r.dias?.length ? ' · ' + dias : ''}`;
  };

  /* faixas em que o lugar está aberto num dia (0–1440 min); a 3ª posição marca continuação da madrugada */
  LL.faixasDoDia = (h, d) => {
    const regras = h.regras || [], periodos = h.periodos || [];
    const fechaDia = x => (h.fecha || []).includes(x) || regras.some(r => r.tipo === 'fechado' && !r.de && vale(r, x));
    const abertos = regras.filter(r => r.tipo === 'aberto');
    const exato = abertos.length > 0 || periodos.includes('24h');
    let f = [];
    const ant = diaMais(d, 6);
    /* a noite de ontem que passa da meia-noite continua valendo, mesmo se hoje for dia fechado */
    if (!fechaDia(ant)) abertos.forEach(r => { const a = paraMin(r.de || '00:00'), b = paraMin(r.ate || '24:00'); if (vale(r, ant) && b <= a && b > 0) f.push([0, b, true]); });
    if (fechaDia(d)) return { faixas: f, exato, fechaDia: true };
    if (abertos.length) {
      abertos.forEach(r => { const a = paraMin(r.de || '00:00'), b = paraMin(r.ate || '24:00'); if (vale(r, d)) f.push(b > a ? [a, b] : [a, 1440]); });
    } else if (periodos.includes('24h')) f.push([0, 1440]);
    else periodos.forEach(p => FAIXA_PERIODO[p] && f.push([...FAIXA_PERIODO[p]]));
    regras.filter(r => r.tipo === 'fechado' && r.de && vale(r, d)).forEach(r => {
      const a = paraMin(r.de), b = paraMin(r.ate || '24:00');
      f = f.flatMap(x => (b <= x[0] || a >= x[1]) ? [x] : [[x[0], a, x[2]], [b, x[1]]].filter(y => y[1] > y[0]));
    });
    return { faixas: f.sort((x, y) => x[0] - y[0]), exato, fechaDia: false };
  };

  const NOME_PERIODO = { manha: 'de manhã', tarde: 'à tarde', noite: 'à noite' };
  LL.situacao = l => {
    const h = l.extras?.horario;
    if (!h || !((h.regras || []).length || (h.periodos || []).length || (h.fecha || []).length)) return null;
    const agora = LL.agoraNoDestino(l.pais), m = agora.min, hoje = LL.faixasDoDia(h, agora.dia);
    const avisos = [];
    const regras = h.regras || [];
    let nivel, texto;
    const dentro = hoje.faixas.find(([a, b]) => m >= a && m < b);
    const proxima = () => {
      for (let i = 0; i < 8; i++) {
        const d = diaMais(agora.dia, i), fx = i ? LL.faixasDoDia(h, d) : hoje;
        const ini = fx.faixas.filter(x => !x[2] && (i || x[0] > m)).map(x => x[0])[0];
        if (ini != null) return { i, d, ini };
      }
      return null;
    };
    const quando = p => !p ? 'sem horário de abertura' : p.i === 0 ? `abre às ${hora(p.ini)}` : p.i === 1 ? `abre amanhã às ${hora(p.ini)}` : `abre ${DIA_CURTO[p.d]} às ${hora(p.ini)}`;
    if (!hoje.exato) {
      const per = (h.periodos || []).map(p => NOME_PERIODO[p]).filter(Boolean).join(' e ');
      if (hoje.fechaDia) { nivel = 'fechado'; texto = 'Fechado hoje'; }
      else if (dentro) { nivel = 'talvez'; texto = `Deve estar aberto${per ? ' — costuma abrir ' + per : ''}`; }
      else { nivel = 'talvez'; texto = `Pode estar fechado agora${per ? ' — costuma abrir ' + per : ''}`; }
    } else if (dentro) {
      let fim = dentro[1];
      if (fim === 1440) { const am = LL.faixasDoDia(h, diaMais(agora.dia, 1)).faixas.find(x => x[2] || x[0] === 0); if (am) fim = 1440 + am[1]; }
      const resta = fim - m;
      if (fim >= 1440 && dentro[0] === 0 && hoje.faixas.length === 1 && LL.faixasDoDia(h, diaMais(agora.dia, 1)).faixas.some(x => x[0] === 0 && x[1] === 1440)) { nivel = 'aberto'; texto = 'Aberto 24h'; }
      else if (resta <= 60) { nivel = 'alerta'; texto = `Fecha em ${resta} min (${hora(fim)})`; }
      else { nivel = 'aberto'; texto = `Aberto · fecha às ${hora(fim)}`; }
    } else {
      nivel = 'fechado'; const p = proxima();
      texto = hoje.fechaDia ? `Fechado hoje · ${quando(p)}` : `Fechado agora · ${quando(p)}`;
    }
    /* última entrada */
    regras.filter(r => r.tipo === 'ultima' && vale(r, agora.dia)).forEach(r => {
      const u = paraMin(r.de);
      if (dentro && m >= u) { nivel = 'fechado'; texto = `Entrada encerrada (última às ${hora(u)})`; }
      else if (dentro && u - m <= 90) avisos.push({ nivel: 'alerta', texto: `Última entrada às ${hora(u)} (em ${u - m} min)` });
    });
    /* avisos livres na hora certa */
    regras.filter(r => r.tipo === 'aviso' && vale(r, agora.dia)).forEach(r => {
      if (!r.de) { if (r.dias?.length) avisos.push({ nivel: 'aviso', texto: `Hoje: ${r.texto}` }); return; }
      const a = paraMin(r.de), b = paraMin(r.ate || r.de) || 1440, fim = b > a ? b : b + 1440;
      if (m >= a && m < fim) avisos.push({ nivel: 'aviso', texto: `Agora: ${r.texto}` });
      else if (a > m && a - m <= 180) avisos.push({ nivel: 'aviso', texto: `Às ${hora(a)}: ${r.texto}` });
    });
    /* amanhã e próximos dias */
    for (let i = 1; i <= 3; i++) {
      const d = diaMais(agora.dia, i);
      if (LL.faixasDoDia(h, d).fechaDia) { avisos.push({ nivel: i === 1 ? 'alerta' : 'info', texto: i === 1 ? `Amanhã (${DIA_CURTO[d]}) fechado` : `Fechado ${DIA_CURTO[d]} (em ${i} dias)` }); break; }
    }
    return { nivel, texto, avisos, agora: `${DIA_CURTO[agora.dia]} ${hora(m)}` };
  };
  const ICONE_SITU = { aberto: 'clock', alerta: 'alert-triangle', fechado: 'clock-x', talvez: 'help-circle', aviso: 'info-circle', info: 'info-circle' };
  LL.seloSituacao = (l, op = {}) => {
    const s = LL.situacao(l); if (!s) return '';
    const extra = op.todos ? s.avisos : s.avisos.slice(0, 1);
    return `<span class="ll-situ-grupo" data-situ="${l.id}"${op.todos ? ' data-todos="1"' : ''}><span class="ll-situ ll-situ-${s.nivel}">${LL.icone(ICONE_SITU[s.nivel])}<span>${esc(s.texto)}</span></span>${extra.map(a => `<span class="ll-situ ll-situ-${a.nivel}">${LL.icone(ICONE_SITU[a.nivel])}<span>${esc(a.texto)}</span></span>`).join('')}</span>`;
  };
  /* os selos se atualizam sozinhos a cada minuto */
  setInterval(() => document.querySelectorAll('[data-situ]').forEach(el => {
    const l = LL.lugar(el.dataset.situ); if (l) el.outerHTML = LL.seloSituacao(l, { todos: el.dataset.todos === '1' }) || '<span></span>';
  }), 60000);

  /* "Transformar em regras": no protótipo, um leitor local simula a IA (no sistema real: Groq/Gemini com JSON-schema) */
  const DIA_PALAVRA = [[/\bdomingos?\b|\bdom\b/, 'dom'], [/\bsegundas?(-feiras?)?\b|\bseg\b/, 'seg'], [/\bter[cç]as?(-feiras?)?\b|\bter\b/, 'ter'], [/\bquartas?(-feiras?)?\b|\bqua\b/, 'qua'],
    [/\bquintas?(-feiras?)?\b|\bqui\b/, 'qui'], [/\bsextas?(-feiras?)?\b|\bsex\b/, 'sex'], [/\bs[aá]bados?\b|\bs[aá]b\b/, 'sab']];
  const lerDias = s => {
    if (/todos os dias|diariamente|todo dia/.test(s)) return [];
    if (/fins? de semana/.test(s)) return ['sab', 'dom'];
    if (/dias [uú]teis/.test(s)) return ['seg', 'ter', 'qua', 'qui', 'sex'];
    const achados = [];
    DIA_PALAVRA.forEach(([re, d]) => { for (const x of s.matchAll(new RegExp(re.source, 'g'))) achados.push({ i: x.index, f: x.index + x[0].length, d }); });
    achados.sort((a, b) => a.i - b.i);
    const out = [];
    for (let k = 0; k < achados.length; k++) {
      const a = achados[k], b = achados[k + 1];
      if (b && /^\s*(a|–|-|até)\s*$/.test(s.slice(a.f, b.i))) { for (let i = SEMANA.indexOf(a.d); ; i = (i + 1) % 7) { out.push(SEMANA[i]); if (SEMANA[i] === b.d) break; } k++; }
      else out.push(a.d);
    }
    return [...new Set(out)];
  };
  const limparAviso = t => {
    const x = t.replace(/todos os dias|fins? de semana|dias [uú]teis/gi, ' ')
      .replace(/(^|[\s,(–-])(domingos?|segundas?|ter[cç]as?|quartas?|quintas?|sextas?|s[aá]bados?|dom|seg|ter|qua|qui|sex|s[aá]b)(-feiras?)?(?=$|[\s,–\-)])/gi, '$1')
      .replace(/(^|\s)(a|até|–|-)(?=\s|$)/g, ' ').replace(/\s{2,}/g, ' ').replace(/^[\s,–-]+|[\s,–-]+$/g, '');
    return x ? x[0].toUpperCase() + x.slice(1) : '';
  };
  const lerHoraTexto = t => { const x = String(t).match(/(\d{1,2})(?:[h:](\d{2})?)/); return x ? `${String(+x[1]).padStart(2, '0')}:${x[2] || '00'}` : null; };
  const frases = texto => {
    const segs = [];
    String(texto || '').split(/[;\n]+|\.\s+/).forEach(bloco => {
      let pend = '';
      bloco.split(/,\s*/).map(p => p.trim()).filter(Boolean).forEach(p => {
        if (/^[\d\sh:e]+$/i.test(p) && segs.length && !pend) segs[segs.length - 1] += ', ' + p; /* "às 10h, 13h e 15h" */
        else if (!/\d|fecha|[uú]ltima/i.test(p)) pend += (pend ? ', ' : '') + p;
        else { segs.push((pend ? pend + ', ' : '') + p); pend = ''; }
      });
      if (pend) segs.push(pend);
    });
    return segs.map(s => s.replace(/\.$/, '').trim()).filter(Boolean);
  };
  LL.lerRegras = texto => {
    const regras = [];
    frases(texto).forEach(original => {
      const s = original.toLowerCase();
      const dias = lerDias(s);
      if (/24 ?h(oras)?|24 horas/.test(s) && !/\d{1,2}h\s*[–-]/.test(s)) { regras.push({ tipo: 'aberto', dias, de: '00:00', ate: '24:00' }); return; }
      const faixa = s.match(/(\d{1,2}(?:[h:]\d{2}|h))\s*(?:–|-|às|as|a|até)\s*(\d{1,2}(?:[h:]\d{2}|h))/);
      if (/[uú]ltima entrada/.test(s)) { const h = lerHoraTexto(s.split(/[uú]ltima entrada/)[1] || ''); if (h) regras.push({ tipo: 'ultima', dias, de: h }); return; }
      if (/\bfecha(do|da)?\b|\bfechad[oa]s?\b|\bn[aã]o abre\b/.test(s) && !faixa) { if (dias.length) regras.push({ tipo: 'fechado', dias }); return; }
      if (faixa) {
        const de = lerHoraTexto(faixa[1]), ate = lerHoraTexto(faixa[2]);
        const resto = s.replace(faixa[0], ' ').replace(/todos os dias|fins? de semana|dias [uú]teis|\b(de|das|do|da|e|a|até|às|as|aberto|abre|funciona|horário|horario|diariamente)\b/g, ' ')
          .replace(/\b(domingos?|segundas?|ter[cç]as?|quartas?|quintas?|sextas?|s[aá]bados?|dom|seg|ter|qua|qui|sex|s[aá]b)\b(-feiras?)?/g, ' ').replace(/[–\-,:()]/g, ' ').trim();
        if (/fecha/.test(s)) regras.push({ tipo: 'fechado', dias, de, ate });
        else if (!resto) regras.push({ tipo: 'aberto', dias, de, ate });
        else regras.push({ tipo: 'aviso', dias, de, ate, texto: limparAviso(original.replace(new RegExp(faixa[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), ' ')) || original });
        return;
      }
      const hs = /(^|\s)(às|as)\s/.test(s) ? [...s.matchAll(/\d{1,2}h\d{0,2}/g)].map(x => lerHoraTexto(x[0])).filter(Boolean) : [];
      if (hs.length) { hs.forEach(h => regras.push({ tipo: 'aviso', dias, de: h, ate: `${String(Math.min(23, +h.slice(0, 2) + 1)).padStart(2, '0')}:${h.slice(3)}`, texto: original })); return; }
      if (dias.length) regras.push({ tipo: 'aviso', dias, texto: original });
    });
    return regras;
  };
  LL.camposFaltando = l => LL.tipo(l.tipo).campos.filter(c => vazio(l.extras?.[c.id])).map(c => c.rotulo);

  /* ---------- coordenadas ---------- */
  LL.lerCoordenadas = txt => {
    const s = String(txt || '').trim(); if (!s) return null;
    /* !3d…!4d é o ponto exato do lugar; @lat,lng é só o centro da tela do mapa */
    const pads = [/!3d(-?\d{1,3}\.\d+)!4d(-?\d{1,3}\.\d+)/, /@(-?\d{1,3}\.\d+),\s*(-?\d{1,3}\.\d+)/,
      /[?&](?:q|query|ll|destination)=(-?\d{1,3}\.\d+),\s*(-?\d{1,3}\.\d+)/, /^\(?\s*(-?\d{1,3}(?:\.\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:\.\d+)?)\s*\)?$/];
    for (const p of pads) {
      const m = s.match(p);
      if (m) { const lat = +m[1], lng = +m[2]; if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng }; }
    }
    return null;
  };
  LL.sugerirLocal = (lat, lng) => {
    let melhor = null, dist = Infinity;
    LL.cidades.forEach(c => { const d = LL.metros({ lat, lng }, c); if (d < dist) { dist = d; melhor = c; } });
    if (melhor && dist < 60000) return { pais: melhor.pais, cidade: melhor.id };
    if (lat > 33 && lat < 38.7 && lng > 124 && lng < 131) return { pais: 'kr', cidade: null };
    if (lat > 24 && lat < 46 && lng > 122 && lng < 146) return { pais: 'jp', cidade: null };
    return null;
  };
  LL.linkMaps = l => `https://www.google.com/maps/search/?api=1&query=${l.lat},${l.lng}`;

  /* resumo de uma linha para listas: o que mais importa em cada tipo */
  LL.resumo = l => {
    const x = l.extras || {}, v = k => LL.textoValor(x[k], l.pais);
    switch (l.tipo) {
      case 'restaurante': return [(x.comida || []).join(', '), v('preco')].filter(Boolean).join(' · ');
      case 'hotel': return [x.hospedagem, v('diaria') && `diária ${v('diaria')}`].filter(Boolean).join(' · ');
      case 'atrativo': return [v('ingresso') && `ingresso ${v('ingresso')}`, x.tempoVisita].filter(Boolean).join(' · ');
      case 'transporte': return [x.dePara && x.dePara.de && `${x.dePara.de} → ${x.dePara.para}`, x.duracao].filter(Boolean).join(' · ');
      case 'cafe': return [x.especialidade, v('preco')].filter(Boolean).join(' · ');
      case 'compras': return [x.oQue, x.taxfree ? 'tax free' : ''].filter(Boolean).join(' · ');
      case 'bar': return [x.estilo, v('preco')].filter(Boolean).join(' · ');
      case 'experiencia': return [x.duracao, v('preco')].filter(Boolean).join(' · ');
      default: return LL.textoHorario(x.horario);
    }
  };

  /* ---------- mapa (Leaflet) ---------- */
  const TILES = {
    voyager: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    claro: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    escuro: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
  };
  LL.mapa = (el, pontos, op = {}) => {
    if (!window.L) { el.innerHTML = `<p class="ll-mapa-off">${LL.icone('map')} Mapa indisponível sem internet.</p>`; return null; }
    const m = L.map(el, { scrollWheelZoom: false, zoomControl: !op.mini, attributionControl: !op.mini, dragging: !op.mini || !L.Browser.mobile });
    L.tileLayer(TILES[op.estilo || LL.config.mapa] || TILES.voyager, { maxZoom: 19, attribution: '© OpenStreetMap · © CARTO' }).addTo(m);
    const pts = pontos.filter(p => p.lat != null);
    pts.forEach(p => {
      const t = LL.tipo(p.tipo);
      const mk = L.marker([p.lat, p.lng], { icon: L.divIcon({ className: 'll-pino-wrap', html: `<span class="ll-pino${p.visitado ? ' ll-pino-visitado' : ''}" style="--cor-tipo:${LL.corTipo(p.tipo)}">${LL.icone(t.icone)}</span>`, iconSize: [34, 34], iconAnchor: [17, 34] }), title: p.titulo }).addTo(m);
      if (op.aoClicar) mk.on('click', () => op.aoClicar(p.id));
      else if (!op.mini) mk.bindTooltip(esc(p.titulo));
    });
    if (LL.origem && !op.mini) L.marker([LL.origem.lat, LL.origem.lng], { icon: L.divIcon({ className: 'll-pino-wrap', html: '<span class="ll-voce" title="Você"></span>', iconSize: [18, 18] }) }).addTo(m);
    const ajustar = () => {
      m.invalidateSize();
      if (pts.length === 1) m.setView([pts[0].lat, pts[0].lng], op.zoom || 15);
      else if (pts.length) m.fitBounds(L.latLngBounds(pts.map(p => [p.lat, p.lng])), { padding: [30, 30], maxZoom: 15 });
      else m.setView([35.68, 139.76], 5);
    };
    ajustar(); setTimeout(ajustar, 60); setTimeout(ajustar, 400);
    return m;
  };

  /* ---------- toast e painel ---------- */
  let toasts;
  LL.toast = (msg, op = {}) => {
    if (!toasts) { toasts = LL.h('<div class="ll-toasts" role="status" aria-live="polite"></div>'); document.body.append(toasts); }
    const t = LL.h(`<div class="ll-toast">${op.icone ? LL.icone(op.icone) : ''}<span>${esc(msg)}</span>${op.desfazer ? '<button type="button" class="ll-toast-btn">Desfazer</button>' : ''}</div>`);
    toasts.append(t);
    const sair = () => { t.classList.add('ll-saindo'); setTimeout(() => t.remove(), 260); };
    if (op.desfazer) t.querySelector('button').onclick = () => { op.desfazer(); sair(); };
    setTimeout(sair, op.desfazer ? 6500 : 3200);
  };
  let pilha = 0;
  LL.painel = ({ titulo, conteudo, classe, aoFechar }) => {
    const id = 'llp' + ++pilha;
    const fundo = LL.h(`<div class="ll-painel-fundo"><section class="ll-painel ${classe || ''}" role="dialog" aria-modal="true" aria-labelledby="${id}">
      <header class="ll-painel-cab"><h2 id="${id}" class="ll-painel-titulo">${esc(titulo)}</h2>
      <button type="button" class="ll-icone-btn" data-fechar aria-label="Fechar">${LL.icone('x')}</button></header>
      <div class="ll-painel-corpo"></div></section></div>`);
    const corpo = fundo.querySelector('.ll-painel-corpo');
    if (conteudo) corpo.append(conteudo);
    const antes = document.activeElement;
    const fechar = () => { fundo.classList.add('ll-saindo'); document.removeEventListener('keydown', tecla); setTimeout(() => fundo.remove(), 220); antes?.focus?.(); aoFechar && aoFechar(); };
    const tecla = e => { if (e.key === 'Escape' && fundo === document.querySelector('.ll-painel-fundo:last-of-type')) fechar(); };
    document.addEventListener('keydown', tecla);
    fundo.addEventListener('mousedown', e => { if (e.target === fundo) fechar(); });
    fundo.querySelector('[data-fechar]').onclick = fechar;
    document.body.append(fundo);
    requestAnimationFrame(() => fundo.classList.add('ll-aberto'));
    setTimeout(() => (corpo.querySelector('input:not([type=checkbox]),textarea,button') || fundo.querySelector('[data-fechar]')).focus({ preventScroll: true }), 80);
    return { el: fundo, corpo, fechar, setTitulo: t => (fundo.querySelector('.ll-painel-titulo').textContent = t) };
  };

  /* ================================================================
     CAMPOS POR TIPO — edição
     ================================================================ */
  const chip = (rotulo, ativo, attrs = '', icone = '') =>
    `<button type="button" class="ll-chip" aria-pressed="${ativo ? 'true' : 'false'}" ${attrs}>${icone ? LL.icone(icone) : ''}<span>${rotulo}</span></button>`;

  function editorCampo(def, extras, ctx) {
    const v = extras[def.id];
    const uid = 'f' + Math.random().toString(36).slice(2, 8);
    const wrap = LL.h(`<div class="ll-campo ll-campo-${def.tipo}" data-campo="${def.id}"></div>`);
    const marcarVazio = () => wrap.classList.toggle('ll-vazio', !!ctx.destacarVazios && vazio(extras[def.id]));
    const rot = `<span class="ll-rotulo" id="${uid}">${esc(def.rotulo)}${ctx.destacarVazios ? '<span class="ll-falta-tag">não encontrado no PDF</span>' : ''}</span>`;

    if (def.tipo === 'horario') {
      const h = v || { periodos: [], fecha: [], nota: '' }; extras[def.id] = h; h.fecha = h.fecha || []; h.regras = h.regras || [];
      wrap.innerHTML = `${rot}<div class="ll-chips" role="group" aria-labelledby="${uid}">${LL.PERIODOS.map(p => chip(p.nome, h.periodos.includes(p.id), `data-per="${p.id}"`, p.icone)).join('')}</div>
        <span class="ll-subrotulo">Fecha em</span>
        <div class="ll-chips ll-chips-dias" role="group" aria-label="Dias em que fecha">${LL.DIAS.map(([id, n]) => chip(n, h.fecha.includes(id), `data-dia="${id}"`)).join('')}</div>
        <span class="ll-subrotulo">Horário exato e avisos (opcional)</span>
        <textarea class="ll-input ll-nota-horario" rows="2" aria-label="Horário escrito do seu jeito" placeholder="Escreva do seu jeito: ter a dom 11h–22h; fecha seg; última entrada 21h20; fila grande 12h–13h">${esc(h.nota)}</textarea>
        <div class="ll-chips"><button type="button" class="ll-btn ll-btn-sec ll-btn-peq" data-ia>${LL.icone('wand')}<span>Transformar em regras</span></button>
          <span class="ll-ajuda">Com as regras, o sistema avisa “aberto agora”, “amanhã fechado” etc. Só com Manhã/Tarde/Noite, os avisos são aproximados.</span></div>
        <ul class="ll-regras-ed"></ul>
        <button type="button" class="ll-btn ll-btn-sec ll-btn-peq ll-add-regra" data-add-regra>${LL.icone('plus')}<span>Adicionar regra</span></button>`;
      const lista = wrap.querySelector('.ll-regras-ed');
      const TIPOS_REGRA = [['aberto', 'Aberto'], ['fechado', 'Fechado'], ['ultima', 'Última entrada'], ['aviso', 'Aviso']];
      const desenharRegras = anim => {
        lista.innerHTML = h.regras.map((r, i) => `<li class="ll-regra ll-regra-${r.tipo}${anim ? ' ll-troca' : ''}" data-i="${i}">
          <div class="ll-regra-linha"><select class="ll-input ll-regra-tipo" aria-label="Tipo da regra">${TIPOS_REGRA.map(([k, n]) => `<option value="${k}" ${r.tipo === k ? 'selected' : ''}>${n}</option>`).join('')}</select>
            <span class="ll-regra-horas"><input class="ll-input" type="time" aria-label="${r.tipo === 'ultima' ? 'Hora' : 'De'}" value="${esc(r.de || '')}" data-k="de">
            ${r.tipo === 'ultima' ? '' : `<span aria-hidden="true">–</span><input class="ll-input" type="time" aria-label="Até" value="${esc(r.ate && r.ate !== '24:00' ? r.ate : r.ate === '24:00' ? '23:59' : '')}" data-k="ate">`}</span>
            <button type="button" class="ll-icone-btn" data-tirar-regra aria-label="Remover regra">${LL.icone('x')}</button></div>
          <div class="ll-chips ll-regra-dias" role="group" aria-label="Dias (nenhum = todos)">${LL.DIAS.map(([id, n]) => chip(n, (r.dias || []).includes(id), `data-rdia="${id}"`)).join('')}<span class="ll-ajuda">${(r.dias || []).length ? '' : 'todos os dias'}</span></div>
          ${r.tipo === 'aviso' ? `<input class="ll-input" aria-label="Texto do aviso" placeholder="ex.: fila grande, almoço mais barato" value="${esc(r.texto || '')}" data-k="texto">` : ''}</li>`).join('');
        lista.querySelectorAll('.ll-regra').forEach(li => {
          const r = h.regras[+li.dataset.i];
          li.querySelector('.ll-regra-tipo').onchange = e => { r.tipo = e.target.value; if (r.tipo === 'aviso' && !r.texto) r.texto = ''; desenharRegras(); };
          li.querySelectorAll('[data-k]').forEach(inp => inp.oninput = () => { r[inp.dataset.k] = inp.dataset.k === 'ate' && inp.value === '23:59' ? '24:00' : inp.value; });
          li.querySelectorAll('[data-rdia]').forEach(b => b.onclick = () => { const d = b.dataset.rdia; r.dias = (r.dias || []).includes(d) ? r.dias.filter(x => x !== d) : [...(r.dias || []), d]; desenharRegras(); });
          li.querySelector('[data-tirar-regra]').onclick = () => { h.regras.splice(+li.dataset.i, 1); desenharRegras(); marcarVazio(); };
        });
      };
      desenharRegras();
      wrap.querySelector('[data-ia]').onclick = () => {
        const novas = LL.lerRegras(h.nota);
        if (!novas.length) { LL.toast('Não encontrei horários no texto. Ex.: “ter a dom 11h–22h; fecha seg”.', { icone: 'wand' }); return; }
        h.regras = novas;
        novas.filter(r => r.tipo === 'fechado' && !r.de).forEach(r => r.dias.forEach(d => { if (!h.fecha.includes(d)) h.fecha.push(d); }));
        wrap.querySelectorAll('[data-dia]').forEach(b => b.setAttribute('aria-pressed', h.fecha.includes(b.dataset.dia)));
        desenharRegras(true); marcarVazio();
        LL.toast(`${novas.length} ${novas.length === 1 ? 'regra criada' : 'regras criadas'} — confira e ajuste. (No protótipo a IA é simulada.)`, { icone: 'wand' });
      };
      wrap.querySelector('[data-add-regra]').onclick = () => { h.regras.push({ tipo: 'aberto', dias: [], de: '09:00', ate: '18:00' }); desenharRegras(true); };
      wrap.querySelectorAll('[data-per]').forEach(b => b.onclick = () => {
        const id = b.dataset.per, on = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', on); h.periodos = on ? [...h.periodos, id] : h.periodos.filter(x => x !== id); marcarVazio();
      });
      wrap.querySelectorAll('[data-dia]').forEach(b => b.onclick = () => {
        const id = b.dataset.dia, on = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', on); h.fecha = on ? [...h.fecha, id] : h.fecha.filter(x => x !== id); marcarVazio();
      });
      wrap.querySelector('.ll-nota-horario').oninput = e => { h.nota = e.target.value; marcarVazio(); };
    }
    else if (def.tipo === 'valor') {
      const val = v || { faixa: 0, valor: null, gratis: false }; extras[def.id] = val;
      const p = LL.pais(ctx.pais()) || LL.paises[0];
      wrap.innerHTML = `${rot}<div class="ll-valor">
        <div class="ll-chips" role="group" aria-label="Faixa de preço">${def.gratis ? chip('Grátis', val.gratis, 'data-gratis') : ''}${[1, 2, 3].map(n => chip('$'.repeat(n), !val.gratis && val.faixa === n, `data-faixa="${n}"`)).join('')}</div>
        <label class="ll-valor-exato"><span class="ll-prefixo">${esc(p.simbolo)}</span><input class="ll-input" inputmode="numeric" aria-label="Valor exato em ${esc(p.moeda)} (opcional)" placeholder="valor (opcional)" value="${val.valor ?? ''}" ${val.gratis ? 'disabled' : ''}></label>
        <output class="ll-reais" aria-live="polite"></output></div>`;
      const out = wrap.querySelector('output'), inp = wrap.querySelector('input');
      const atual = () => { const x = LL.valorPartes(val, ctx.pais()); out.textContent = x && x.reais ? x.reais : ''; marcarVazio(); };
      wrap.querySelectorAll('[data-faixa]').forEach(b => b.onclick = () => {
        const n = +b.dataset.faixa; val.faixa = val.faixa === n ? 0 : n; val.gratis = false; inp.disabled = false;
        wrap.querySelectorAll('.ll-chip').forEach(c => c.setAttribute('aria-pressed', c.dataset.faixa == val.faixa && val.faixa ? 'true' : 'false')); atual();
      });
      const g = wrap.querySelector('[data-gratis]');
      if (g) g.onclick = () => {
        val.gratis = !val.gratis; if (val.gratis) { val.faixa = 0; val.valor = null; inp.value = ''; }
        inp.disabled = val.gratis; wrap.querySelectorAll('.ll-chip').forEach(c => c.setAttribute('aria-pressed', 'false')); g.setAttribute('aria-pressed', val.gratis); atual();
      };
      inp.oninput = () => { const n = parseInt(inp.value.replace(/\D/g, ''), 10); val.valor = isNaN(n) ? null : n; if (!isNaN(n)) inp.value = fmtNum(n); atual(); };
      if (val.valor) inp.value = fmtNum(val.valor);
      atual();
    }
    else if (def.tipo === 'etiquetas') {
      let lista = Array.isArray(v) ? v : []; extras[def.id] = lista;
      const todas = () => [...def.opcoes, ...lista.filter(x => !def.opcoes.includes(x))];
      const desenhar = () => {
        wrap.innerHTML = `${rot}<div class="ll-chips" role="group" aria-labelledby="${uid}">${todas().map(o => chip(esc(o), lista.includes(o), `data-et="${esc(o)}"`)).join('')}
          <input class="ll-input ll-input-chip" aria-label="Adicionar outro tipo de comida" placeholder="+ outro"></div>`;
        wrap.querySelectorAll('[data-et]').forEach(b => b.onclick = () => {
          const o = b.dataset.et, on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on);
          lista = on ? [...lista, o] : lista.filter(x => x !== o); extras[def.id] = lista; marcarVazio();
        });
        const inp = wrap.querySelector('input');
        inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); const t = inp.value.trim(); if (t && !lista.includes(t)) { lista = [...lista, t]; extras[def.id] = lista; desenhar(); wrap.querySelector('input').focus(); } } };
        marcarVazio();
      };
      desenhar();
    }
    else if (def.tipo === 'opcao' || def.tipo === 'simnao') {
      const ops = def.tipo === 'simnao' ? [[true, 'Sim'], [false, 'Não']] : def.opcoes.map(o => [o, o]);
      wrap.innerHTML = `${rot}<div class="ll-chips" role="radiogroup" aria-labelledby="${uid}">${ops.map(([val, n], i) => chip(esc(n), v === val, `data-i="${i}" role="radio" aria-checked="${v === val}"`)).join('')}</div>`;
      wrap.querySelectorAll('[data-i]').forEach(b => b.onclick = () => {
        const val = ops[+b.dataset.i][0]; extras[def.id] = extras[def.id] === val ? null : val;
        wrap.querySelectorAll('[data-i]').forEach(c => { const on = ops[+c.dataset.i][0] === extras[def.id]; c.setAttribute('aria-pressed', on); c.setAttribute('aria-checked', on); }); marcarVazio();
      });
    }
    else if (def.tipo === 'checkinout') {
      const c = v || { entrada: '', saida: '' }; extras[def.id] = c;
      wrap.innerHTML = `${rot}<div class="ll-dupla"><label><span class="ll-subrotulo">Check-in</span><input class="ll-input" type="time" value="${esc(c.entrada)}" data-k="entrada"></label>
        <span class="ll-seta" aria-hidden="true">${LL.icone('arrow-right')}</span><label><span class="ll-subrotulo">Check-out</span><input class="ll-input" type="time" value="${esc(c.saida)}" data-k="saida"></label></div>`;
      wrap.querySelectorAll('input').forEach(i => i.oninput = () => { c[i.dataset.k] = i.value; marcarVazio(); });
    }
    else if (def.tipo === 'depara') {
      const c = v || { de: '', para: '' }; extras[def.id] = c;
      wrap.innerHTML = `${rot}<div class="ll-dupla"><input class="ll-input" aria-label="De" placeholder="De (ex.: Tóquio)" value="${esc(c.de)}" data-k="de">
        <span class="ll-seta" aria-hidden="true">${LL.icone('arrow-right')}</span><input class="ll-input" aria-label="Para" placeholder="Para (ex.: Quioto)" value="${esc(c.para)}" data-k="para"></div>`;
      wrap.querySelectorAll('input').forEach(i => i.oninput = () => { c[i.dataset.k] = i.value; marcarVazio(); });
    }
    else {
      wrap.innerHTML = `${rot}<input class="ll-input" ${def.tipo === 'link' ? 'type="url" placeholder="https://…"' : `placeholder="${esc(def.dica || '')}"`} aria-labelledby="${uid}" value="${esc(v || '')}">`;
      wrap.querySelector('input').oninput = e => { extras[def.id] = e.target.value; marcarVazio(); };
    }
    marcarVazio();
    return wrap;
  }

  /* ---------- exibição de um campo ---------- */
  LL.valorCampoHTML = (def, v, paisId) => {
    if (vazio(v)) return '';
    switch (def.tipo) {
      case 'horario': {
        const per = v.periodos?.includes('24h') ? [LL.PERIODOS[3]] : LL.PERIODOS.filter(p => v.periodos?.includes(p.id));
        return `<span class="ll-mini-chips">${per.map(p => `<span class="ll-mini-chip">${LL.icone(p.icone)}${p.nome}</span>`).join('')}</span>` +
          ((v.fecha || []).length ? `<span class="ll-fecha">${LL.icone('x')}Fecha: ${v.fecha.map(d => LL.DIAS.find(x => x[0] === d)[1]).join(', ')}</span>` : '') +
          ((v.regras || []).filter(r => !(r.tipo === 'fechado' && !r.de)).length ? `<ul class="ll-regras">${v.regras.filter(r => !(r.tipo === 'fechado' && !r.de)).map(r => `<li class="ll-regra-${r.tipo}">${esc(LL.textoRegra(r))}</li>`).join('')}</ul>` : '') +
          (v.nota && !(v.regras || []).length ? `<span class="ll-nota">${esc(v.nota)}</span>` : '');
      }
      case 'valor': {
        const x = LL.valorPartes(v, paisId); if (!x) return '';
        if (x.gratis) return '<span class="ll-preco"><b>Grátis</b></span>';
        return `<span class="ll-preco">${x.local ? `<b>${esc(x.local)}</b> <span class="ll-reais">${esc(x.reais)}</span>` : ''}${x.faixa ? ` <span class="ll-faixa" aria-label="faixa ${x.faixa.length} de 3">${x.faixa}</span>` : ''}</span>`;
      }
      case 'etiquetas': return `<span class="ll-mini-chips">${v.map(e => `<span class="ll-mini-chip">${esc(e)}</span>`).join('')}</span>`;
      case 'simnao': return v ? `${LL.icone('circle-check')} Sim` : 'Não';
      case 'link': return `<a href="${esc(v)}" target="_blank" rel="noopener">Abrir link ${LL.icone('external-link')}</a>`;
      case 'checkinout': return `<span class="ll-depara">${esc(v.entrada || '—')} ${LL.icone('arrow-right')} ${esc(v.saida || '—')}</span>`;
      case 'depara': return `<span class="ll-depara">${esc(v.de || '—')} ${LL.icone('arrow-right')} ${esc(v.para || '—')}</span>`;
      default: return esc(v);
    }
  };

  /* ================================================================
     FORMULÁRIO
     ================================================================ */
  LL.ui = {};
  LL.ui.formulario = (orig, op = {}) => {
    const ctx0 = op.contexto || {};
    const l = orig ? clone(orig) : { id: null, titulo: '', descricao: '', pais: ctx0.pais || '', cidade: ctx0.cidade || '', tipo: ctx0.tipo || '', lat: null, lng: null,
      fonte: { tipo: 'link', url: '' }, dicas: '', fotos: [], favorito: false, visitado: false, extras: {} };
    l.extras = l.extras || {}; l.fotos = l.fotos || []; l.fonte = l.fonte || { tipo: 'link', url: '' };
    const cidadeNome = () => LL.cidade(l.cidade)?.nome || '';
    const el = LL.h(`<form class="ll-form" novalidate>
      <div class="ll-form-corpo">
        <fieldset class="ll-grupo ll-grupo-tipo"><legend class="ll-legenda">Que tipo de lugar é?</legend>
          <div class="ll-tipos-escolha" role="radiogroup" aria-label="Tipo de local"></div>
          <p class="ll-erro" data-erro="tipo" hidden>Escolha um tipo.</p></fieldset>
        <div class="ll-grupo">
          <label class="ll-campo"><span class="ll-rotulo">Título</span><input class="ll-input ll-input-titulo" name="titulo" placeholder="ex.: Ichiran Shibuya" value="${esc(l.titulo)}" autocomplete="off">
            <span class="ll-erro" data-erro="titulo" hidden>Dê um nome ao lugar.</span></label>
          <div class="ll-campo"><label class="ll-rotulo" for="ll-coord">Coordenadas do Google Maps</label>
            <input class="ll-input" id="ll-coord" name="coord" placeholder="Cole aqui: 35.6614, 139.7010 ou o link do Maps" value="${l.lat != null ? `${l.lat}, ${l.lng}` : ''}" autocomplete="off">
            <div class="ll-coord-res" aria-live="polite"></div></div>
          <div class="ll-linha2">
            <label class="ll-campo"><span class="ll-rotulo">País</span><select class="ll-input" name="pais"><option value="">Escolha…</option>${LL.paises.map(p => `<option value="${p.id}">${esc(p.nome)}</option>`).join('')}</select>
              <span class="ll-erro" data-erro="pais" hidden>Escolha o país.</span></label>
            <label class="ll-campo"><span class="ll-rotulo">Cidade ou região</span><input class="ll-input" name="cidade" list="ll-cidades-dl" placeholder="ex.: Tóquio, Monte Fuji / Hakone" value="${esc(cidadeNome())}" autocomplete="off">
              <datalist id="ll-cidades-dl"></datalist><span class="ll-erro" data-erro="cidade" hidden>Diga a cidade ou região.</span></label>
          </div>
        </div>
        <fieldset class="ll-grupo ll-bloco-tipo" hidden></fieldset>
        <div class="ll-grupo">
          <label class="ll-campo"><span class="ll-rotulo">Descrição</span><textarea class="ll-input" name="descricao" rows="3" placeholder="O que é, por que ir. Links colados viram clicáveis.">${esc(l.descricao)}</textarea>
            <span class="ll-previa" hidden></span></label>
          <label class="ll-campo"><span class="ll-rotulo">Dicas gerais</span><textarea class="ll-input" name="dicas" rows="2" placeholder="Melhor horário, o que pedir, como chegar…">${esc(l.dicas)}</textarea></label>
          <label class="ll-campo"><span class="ll-rotulo">Link da fonte original</span>
            ${l.fonte.tipo === 'pdf' ? `<span class="ll-fonte-pdf">${LL.icone('file-type-pdf')} ${esc(l.fonte.arquivo)} · pág. ${l.fonte.pagina}</span>` : ''}
            <input class="ll-input" name="fonte" type="url" placeholder="https://… (blog, vídeo, site)" value="${esc(l.fonte.url || '')}"></label>
        </div>
        <div class="ll-grupo"><span class="ll-rotulo">Fotos</span>
          <div class="ll-fotos-edit"></div>
          <label class="ll-solta-foto">${LL.icone('camera-plus')}<span><b>Arraste fotos aqui</b>, clique para escolher ou cole um print (Ctrl+V)</span><input type="file" accept="image/*" multiple hidden></label>
        </div>
      </div>
      <div class="ll-form-rodape">
        <button type="button" class="ll-btn ll-btn-sec" data-cancelar>Cancelar</button>
        <button type="submit" class="ll-btn ll-btn-pri">${LL.icone('check')}<span>${op.textoSalvar || 'Salvar lugar'}</span></button>
      </div></form>`);
    const $ = s => el.querySelector(s);
    const paisSel = $('[name=pais]'); paisSel.value = l.pais || '';
    const dl = $('#ll-cidades-dl');
    const atualizarCidades = () => { dl.innerHTML = LL.cidades.filter(c => c.pais === paisSel.value).map(c => `<option value="${esc(c.nome)}">`).join(''); };
    atualizarCidades();

    /* tipo */
    const escolha = $('.ll-tipos-escolha'), bloco = $('.ll-bloco-tipo');
    const desenharTipos = () => {
      escolha.innerHTML = LL.tipos.map(t => `<button type="button" class="ll-tipo-op" role="radio" aria-checked="${l.tipo === t.id}" data-tipo="${t.id}" style="--cor-tipo:${LL.corTipo(t.id)}">${LL.icone(t.icone)}<span>${esc(t.nome)}</span></button>`).join('') +
        `<button type="button" class="ll-tipo-op ll-tipo-novo" data-novo-tipo>${LL.icone('plus')}<span>Novo tipo</span></button>`;
      escolha.querySelectorAll('[data-tipo]').forEach(b => b.onclick = () => { l.tipo = b.dataset.tipo; desenharTipos(); desenharBloco(true); $('[data-erro=tipo]').hidden = true; });
      escolha.querySelector('[data-novo-tipo]').onclick = () => LL.abrirTipos(novo => { if (novo) l.tipo = novo; desenharTipos(); desenharBloco(true); });
    };
    const desenharBloco = anim => {
      const t = LL.tipo(l.tipo);
      if (!l.tipo) { bloco.hidden = true; return; }
      bloco.hidden = false; bloco.style.setProperty('--cor-tipo', LL.corTipo(l.tipo));
      bloco.innerHTML = `<legend class="ll-legenda">${LL.icone(t.icone)} Detalhes de ${esc(t.nome.toLowerCase())}</legend>`;
      const grade = LL.h('<div class="ll-bloco-campos"></div>');
      t.campos.forEach(c => grade.append(editorCampo(c, l.extras, { pais: () => paisSel.value || 'jp', destacarVazios: op.destacarVazios })));
      if (!t.campos.length) grade.append(LL.h('<p class="ll-ajuda">Este tipo usa só os campos comuns.</p>'));
      bloco.append(grade);
      if (anim) { bloco.classList.remove('ll-troca'); void bloco.offsetWidth; bloco.classList.add('ll-troca'); }
    };
    desenharTipos(); desenharBloco(false);
    paisSel.onchange = () => { l.pais = paisSel.value; atualizarCidades(); desenharBloco(false); $('[data-erro=pais]').hidden = true; };

    /* coordenadas */
    const res = $('.ll-coord-res'); let mini = null;
    const lerCoord = (auto) => {
      const txt = $('[name=coord]').value; const c = LL.lerCoordenadas(txt);
      if (!txt.trim()) { res.innerHTML = ''; l.lat = l.lng = null; return; }
      if (!c) { res.innerHTML = `<p class="ll-erro">${LL.icone('alert-circle')} Não entendi. Cole no formato <b>35.6614, 139.7010</b> ou o link do Google Maps.</p>`; return; }
      l.lat = c.lat; l.lng = c.lng;
      const s = LL.sugerirLocal(c.lat, c.lng);
      const sugTxt = s ? `${LL.bandeira(s.pais)} ${esc(LL.pais(s.pais).nome)}${s.cidade ? ' › ' + esc(LL.cidade(s.cidade).nome) : ''}` : '';
      res.innerHTML = `<div class="ll-coord-ok"><div class="ll-minimapa"></div><div class="ll-coord-txt">
        ${s ? `<p>${LL.icone('map-pin')} Parece ser <b>${sugTxt}</b></p>` : `<p>${LL.icone('map-pin')} Ponto marcado. Não reconheci a cidade — preencha abaixo.</p>`}
        <p class="ll-ajuda" data-sug-status></p>
        ${s ? '<button type="button" class="ll-btn ll-btn-sec ll-btn-peq" data-usar-sug>Usar país e cidade</button>' : ''}</div></div>`;
      if (window.L) { if (mini) mini.remove(); mini = LL.mapa(res.querySelector('.ll-minimapa'), [{ ...l, tipo: l.tipo || 'x' }], { mini: true, zoom: 14 }); }
      const aplicar = () => {
        paisSel.value = s.pais; l.pais = s.pais; atualizarCidades();
        if (s.cidade) { $('[name=cidade]').value = LL.cidade(s.cidade).nome; }
        [paisSel, $('[name=cidade]')].forEach(x => { x.classList.remove('ll-preenchido'); void x.offsetWidth; x.classList.add('ll-preenchido'); });
        res.querySelector('[data-sug-status]').textContent = 'Preenchido pelas coordenadas — confira e mude se precisar.';
        const b = res.querySelector('[data-usar-sug]'); if (b) b.hidden = true;
        desenharBloco(false);
      };
      const b = res.querySelector('[data-usar-sug]'); if (b) b.onclick = aplicar;
      const confere = s && paisSel.value === s.pais && (!s.cidade || norm($('[name=cidade]').value) === norm(LL.cidade(s.cidade).nome));
      if (confere) { b.hidden = true; res.querySelector('[data-sug-status]').textContent = 'Confere com o país e a cidade abaixo.'; }
      else if (s && auto && (!paisSel.value || !$('[name=cidade]').value)) aplicar();
    };
    $('[name=coord]').addEventListener('input', () => lerCoord(true));
    if (l.lat != null) lerCoord(false);

    /* descrição: prévia dos links */
    const prev = $('.ll-previa');
    const atualizarPrevia = () => { const t = $('[name=descricao]').value; const tem = /https?:\/\//.test(t); prev.hidden = !tem; if (tem) prev.innerHTML = `<span class="ll-subrotulo">Assim vai aparecer:</span> ${LL.autolink(t)}`; };
    $('[name=descricao]').oninput = atualizarPrevia; atualizarPrevia();

    /* fotos */
    const fotosEl = $('.ll-fotos-edit');
    const desenharFotos = () => {
      fotosEl.innerHTML = l.fotos.map((f, i) => `<figure class="ll-foto-mini"><img src="${esc(f)}" alt="Foto ${i + 1}" loading="lazy"><button type="button" class="ll-icone-btn" data-tirar="${i}" aria-label="Remover foto ${i + 1}">${LL.icone('x')}</button></figure>`).join('');
      fotosEl.querySelectorAll('[data-tirar]').forEach(b => b.onclick = () => { l.fotos.splice(+b.dataset.tirar, 1); desenharFotos(); });
    };
    const addArquivos = files => [...files].filter(f => f.type.startsWith('image/')).forEach(f => { const r = new FileReader(); r.onload = () => { l.fotos.push(r.result); desenharFotos(); }; r.readAsDataURL(f); });
    const zona = $('.ll-solta-foto');
    zona.querySelector('input').onchange = e => addArquivos(e.target.files);
    zona.addEventListener('dragover', e => { e.preventDefault(); zona.classList.add('ll-sobre'); });
    zona.addEventListener('dragleave', () => zona.classList.remove('ll-sobre'));
    zona.addEventListener('drop', e => { e.preventDefault(); zona.classList.remove('ll-sobre'); addArquivos(e.dataTransfer.files); });
    el.addEventListener('paste', e => { const imgs = [...(e.clipboardData?.files || [])]; if (imgs.length) { e.preventDefault(); addArquivos(imgs); } });
    desenharFotos();

    /* salvar */
    $('[data-cancelar]').onclick = () => op.aoCancelar && op.aoCancelar();
    el.onsubmit = e => {
      e.preventDefault();
      l.titulo = $('[name=titulo]').value.trim(); l.pais = paisSel.value; l.descricao = $('[name=descricao]').value.trim();
      l.dicas = $('[name=dicas]').value.trim(); l.fonte = { ...l.fonte, url: $('[name=fonte]').value.trim() };
      const nomeCidade = $('[name=cidade]').value.trim();
      const erros = { tipo: !l.tipo, titulo: !l.titulo, pais: !l.pais, cidade: !nomeCidade };
      Object.entries(erros).forEach(([k, v]) => { $(`[data-erro=${k}]`).hidden = !v; });
      const primeiro = Object.keys(erros).find(k => erros[k]);
      if (primeiro) { (primeiro === 'tipo' ? escolha.querySelector('button') : $(`[name=${primeiro}]`)).focus(); return; }
      l.cidade = LL.resolverCidade(l.pais, nomeCidade, l.lat, l.lng);
      const campos = LL.tipo(l.tipo).campos.map(c => c.id);
      l.extras = Object.fromEntries(Object.entries(l.extras).filter(([k]) => campos.includes(k)));
      op.aoSalvar && op.aoSalvar(l);
    };
    ['titulo', 'cidade'].forEach(n => $(`[name=${n}]`).addEventListener('input', () => { $(`[data-erro=${n}]`).hidden = true; }));
    return el;
  };

  /* ================================================================
     FICHA DO LUGAR
     ================================================================ */
  LL.ui.ficha = (l, op = {}) => {
    const t = LL.tipo(l.tipo), c = LL.cidade(l.cidade), p = LL.pais(l.pais);
    const destaques = t.campos.map(def => ({ def, html: LL.valorCampoHTML(def, l.extras?.[def.id], l.pais) })).filter(x => x.html);
    const dist = LL.textoDistancia(l);
    const fonte = l.fonte?.tipo === 'pdf'
      ? `${LL.icone('file-type-pdf')} <span>${esc(l.fonte.arquivo)} · pág. ${l.fonte.pagina}</span>${l.fonte.url ? ` · <a href="${esc(l.fonte.url)}" target="_blank" rel="noopener">link citado</a>` : ''}`
      : l.fonte?.url ? `${LL.icone('link')} <a href="${esc(l.fonte.url)}" target="_blank" rel="noopener">${esc(l.fonte.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0])}</a>` : '<span>Sem fonte</span>';
    const el = LL.h(`<article class="ll-ficha ll-ficha-${l.tipo}" style="--cor-tipo:${LL.corTipo(l.tipo)}">
      ${l.fotos?.length ? `<div class="ll-ficha-fotos">${l.fotos.map((f, i) => `<img src="${esc(f)}" alt="${esc(l.titulo)}${i ? ' — foto ' + (i + 1) : ''}" loading="lazy">`).join('')}</div>` : ''}
      <header class="ll-ficha-cab">
        ${LL.chipTipo(l.tipo)}
        <h2 class="ll-ficha-titulo">${esc(l.titulo)}</h2>
        <p class="ll-ficha-local">${LL.bandeira(l.pais)} ${esc(c?.nome || '')}, ${esc(p?.nome || '')}</p>
        ${dist ? `<p class="ll-ficha-dist">${LL.icone('walk')} <span>${esc(dist)}</span> <span class="ll-de">de ${esc(LL.origem.nome)}</span></p>` : ''}
        <div class="ll-ficha-acoes">
          <button type="button" class="ll-acao ll-acao-fav" aria-pressed="${!!l.favorito}" data-fav>${LL.icone(l.favorito ? 'heart-filled' : 'heart')}<span>${l.favorito ? 'Quero ir' : 'Quero ir'}</span></button>
          <button type="button" class="ll-acao ll-acao-vis" aria-pressed="${!!l.visitado}" data-vis>${LL.icone(l.visitado ? 'circle-check-filled' : 'circle-check')}<span>${l.visitado ? 'Já fui' : 'Marcar: já fui'}</span></button>
          ${op.somenteLeitura ? '' : `<button type="button" class="ll-acao" data-editar>${LL.icone('pencil')}<span>Editar</span></button>
          <button type="button" class="ll-acao ll-acao-apagar" data-apagar>${LL.icone('trash')}<span>Apagar</span></button>`}
        </div>
      </header>
      ${destaques.length ? `<dl class="ll-destaques">${destaques.map(({ def, html }) => `<div class="ll-destaque ll-d-${def.tipo} ll-d-${def.id}"><dt>${esc(def.rotulo)}</dt><dd>${html}</dd></div>`).join('')}</dl>` : ''}
      ${l.descricao ? `<section class="ll-secao"><h3 class="ll-secao-titulo">Sobre</h3><p>${LL.autolink(l.descricao)}</p></section>` : ''}
      ${l.dicas ? `<section class="ll-secao ll-dicas"><h3 class="ll-secao-titulo">${LL.icone('bulb')} Dicas</h3><p>${LL.autolink(l.dicas)}</p></section>` : ''}
      ${l.lat != null ? `<section class="ll-secao ll-onde"><h3 class="ll-secao-titulo">Onde fica</h3><div class="ll-minimapa"></div>
        <a class="ll-btn ll-btn-sec" href="${LL.linkMaps(l)}" target="_blank" rel="noopener">${LL.icone('map-pin')}<span>Abrir no Google Maps</span></a></section>` : ''}
      <footer class="ll-ficha-fonte"><span class="ll-subrotulo">Fonte</span> ${fonte}</footer>
    </article>`);
    const q = s => el.querySelector(s);
    const trocaIcone = (b, nome) => b.firstElementChild.replaceWith(LL.h(LL.icone(nome)));
    q('[data-fav]').onclick = e => { const b = e.currentTarget; const v = LL.alternarFavorito(l.id); b.setAttribute('aria-pressed', v); trocaIcone(b, v ? 'heart-filled' : 'heart'); b.classList.remove('ll-pulo'); void b.offsetWidth; b.classList.add('ll-pulo'); };
    q('[data-vis]').onclick = e => { const b = e.currentTarget; const v = LL.alternarVisitado(l.id); b.setAttribute('aria-pressed', v); trocaIcone(b, v ? 'circle-check-filled' : 'circle-check'); b.querySelector('span').textContent = v ? 'Já fui' : 'Marcar: já fui'; b.classList.remove('ll-pulo'); void b.offsetWidth; b.classList.add('ll-pulo'); };
    if (!op.somenteLeitura) {
      q('[data-editar]').onclick = () => (op.aoEditar || (() => LL.abrirEdicao(l.id)))(l.id);
      q('[data-apagar]').onclick = () => { LL.apagarComDesfazer(l.id); op.aposApagar && op.aposApagar(l.id); };
    }
    const mm = q('.ll-minimapa');
    if (mm) requestAnimationFrame(() => LL.mapa(mm, [l], { mini: true, zoom: 15 }));
    return el;
  };

  /* ================================================================
     DE ONDE MEDIR A DISTÂNCIA
     ================================================================ */
  LL.ui.seletorOrigem = (op = {}) => {
    const el = LL.h('<div class="ll-origem"></div>');
    const desenhar = () => {
      const lugares = LL.filtrar(op.filtro || {}).filter(l => l.lat != null);
      const hoteis = lugares.filter(l => l.tipo === 'hotel'), outros = lugares.filter(l => l.tipo !== 'hotel');
      const opts = `<option value="">Medir a partir de…</option>${hoteis.length ? `<optgroup label="Hotéis">${hoteis.map(l => `<option value="${l.id}">${esc(l.titulo)}</option>`).join('')}</optgroup>` : ''}<optgroup label="Outros lugares">${outros.map(l => `<option value="${l.id}">${esc(l.titulo)}</option>`).join('')}</optgroup>`;
      if (LL.origem) {
        el.innerHTML = `<span class="ll-origem-txt">${LL.icone(LL.origem.modo === 'gps' ? 'current-location' : 'map-pin')}<span>Distâncias a partir de <b>${esc(LL.origem.nome)}</b>${LL.origem.simulado ? ' <em class="ll-simulado">(GPS simulado)</em>' : ''}</span></span>
          <select class="ll-input ll-origem-sel" aria-label="Medir a partir de outro lugar">${opts}</select>
          ${LL.config.semGPS ? '' : LL.origem.modo !== 'gps' ? `<button type="button" class="ll-btn ll-btn-sec ll-btn-peq" data-gps>${LL.icone('current-location')}<span>Minha localização</span></button>` : `<button type="button" class="ll-btn ll-btn-sec ll-btn-peq" data-gps>${LL.icone('refresh')}<span>Atualizar</span></button>`}`;
      } else if (LL.config.semGPS) {
        /* arquivo aberto do WhatsApp/Downloads: o Chrome não libera o GPS fora de https */
        el.innerHTML = `<select class="ll-input ll-origem-sel" aria-label="Medir a partir de um lugar">${opts}</select>
          <span class="ll-ajuda">${LL.icone('map-pin')} Escolha onde você está (ex.: o hotel). Neste arquivo o celular não libera a localização — pelo <b>link do guia</b> ela funciona.</span>`;
      } else {
        el.innerHTML = `<button type="button" class="ll-btn ll-btn-pri ll-btn-peq" data-gps>${LL.icone('current-location')}<span>Usar minha localização</span></button>
          <span class="ll-origem-ou">ou</span><select class="ll-input ll-origem-sel" aria-label="Medir a partir de um lugar">${opts}</select>`;
      }
      const g = el.querySelector('[data-gps]'); if (g) g.onclick = () => LL.usarGPS();
      el.querySelector('select').onchange = e => e.target.value && LL.usarLugarComoOrigem(e.target.value);
    };
    desenhar();
    LL.aoMudar(ev => { if (ev.acao === 'origem' && el.isConnected) desenhar(); });
    return el;
  };

  /* ================================================================
     IMPORTAÇÃO DE PDF (simulada)
     ================================================================ */
  LL.ui.importacao = (op = {}) => {
    const P = clone(D.pdfSimulado);
    const el = LL.h('<div class="ll-imp"></div>');
    let itens = [], imagens = [], arquivo = P.arquivo;

    const etapa1 = () => {
      el.innerHTML = `<div class="ll-imp-inicio">
        <label class="ll-solta-pdf">${LL.icone('file-type-pdf', 'll-solta-ic')}<b>Solte o PDF aqui</b><span>ou clique para escolher no computador</span><input type="file" accept="application/pdf" hidden></label>
        <p class="ll-ajuda">Funciona com guias, roteiros e anotações em PDF com texto. A IA encontra os lugares, preenche os campos de cada tipo e separa as imagens. <b>Nada é salvo antes de você revisar.</b></p>
        <button type="button" class="ll-btn ll-btn-sec" data-exemplo>${LL.icone('file-type-pdf')}<span>Usar o PDF de exemplo: ${esc(P.arquivo)}</span></button></div>`;
      const z = el.querySelector('.ll-solta-pdf');
      const comecar = f => { if (f) arquivo = f.name; etapa2(); };
      z.querySelector('input').onchange = e => comecar(e.target.files[0]);
      z.addEventListener('dragover', e => { e.preventDefault(); z.classList.add('ll-sobre'); });
      z.addEventListener('dragleave', () => z.classList.remove('ll-sobre'));
      z.addEventListener('drop', e => { e.preventDefault(); comecar(e.dataTransfer.files[0]); });
      el.querySelector('[data-exemplo]').onclick = () => comecar(null);
    };

    const etapa2 = () => {
      const passos = [`Lendo o texto (${P.paginas} páginas)`, 'Encontrando lugares', 'Preenchendo os campos de cada tipo', 'Separando as imagens', 'Procurando lugares que você já tem'];
      el.innerHTML = `<div class="ll-imp-lendo"><p class="ll-imp-arquivo">${LL.icone('file-type-pdf')} ${esc(arquivo)}</p>
        <ol class="ll-passos">${passos.map(p => `<li>${LL.icone('loader-2', 'll-gira')}${LL.icone('circle-check-filled', 'll-feito')}<span>${p}</span></li>`).join('')}</ol>
        <p class="ll-ajuda">Simulação — no sistema real a IA (Groq/Gemini) leva de 10 a 40 segundos.</p></div>`;
      const lis = [...el.querySelectorAll('.ll-passos li')];
      lis.forEach((li, i) => { setTimeout(() => li.classList.add('ll-ativo'), i * 650); setTimeout(() => { li.classList.remove('ll-ativo'); li.classList.add('ll-ok'); }, i * 650 + 600); });
      setTimeout(preparar, lis.length * 650 + 250);
    };

    const preparar = () => {
      itens = P.lugares.map(x => {
        const dup = LL.lugares.find(l => l.cidade === x.cidade && norm(l.titulo) === norm(x.titulo));
        return { ...x, fonte: { tipo: 'pdf', arquivo, pagina: x.pagina, url: LL.primeiraUrl(x.descricao) || '' }, fotos: [], favorito: false, visitado: false,
          dup: dup ? dup.id : null, decisao: null, sel: !dup };
      });
      imagens = P.imagens.map(i => ({ ...i, lugar: i.sugeridoPara }));
      etapa3();
    };

    const fotosDe = id => imagens.filter(i => i.lugar === id);
    const resumo = () => {
      const sel = itens.filter(i => i.sel);
      return `<div class="ll-imp-resumo"><p><b>${itens.length} lugares</b> encontrados · <b>${itens.filter(i => i.dup).length}</b> já existem · <b>${imagens.length}</b> imagens</p>
        <button type="button" class="ll-btn ll-btn-pri" data-salvar ${sel.length ? '' : 'disabled'}>${LL.icone('check')}<span>${sel.length ? `Salvar ${sel.length} ${sel.length === 1 ? 'lugar' : 'lugares'}` : 'Nada selecionado'}</span></button></div>`;
    };
    const opcoesLugar = (atual) => `<option value="">Mover para…</option>${itens.map(i => `<option value="${i.id}" ${i.id === atual ? 'disabled' : ''}>${esc(i.titulo)}</option>`).join('')}<option value="__sem">Deixar sem lugar</option>`;

    const cartao = it => {
      const t = LL.tipo(it.tipo), falta = LL.camposFaltando(it);
      const preenchidos = t.campos.map(def => ({ def, html: LL.valorCampoHTML(def, it.extras?.[def.id], it.pais) })).filter(x => x.html).slice(0, 4);
      const ex = it.dup && LL.lugar(it.dup);
      return `<article class="ll-imp-item ${it.sel || (it.dup && !it.decisao) ? '' : 'll-imp-desmarcado'} ${it.dup ? 'll-imp-dup' : ''}" data-id="${it.id}" style="--cor-tipo:${LL.corTipo(it.tipo)}">
        <header class="ll-imp-cab">
          <label class="ll-check"><input type="checkbox" ${it.sel ? 'checked' : ''} ${it.dup && !it.decisao ? 'disabled' : ''} data-sel aria-label="Importar ${esc(it.titulo)}"><span class="ll-check-caixa">${LL.icone('check')}</span></label>
          <input class="ll-imp-titulo" value="${esc(it.titulo)}" aria-label="Título" data-titulo>
          <span class="ll-imp-pag">pág. ${it.pagina}</span>
          <button type="button" class="ll-icone-btn" data-tirar aria-label="Apagar ${esc(it.titulo)} da importação" title="Apagar da importação">${LL.icone('trash')}</button>
        </header>
        <div class="ll-imp-meta">
          <label class="ll-imp-sel">${LL.icone(t.icone)}<select data-tipo aria-label="Tipo">${LL.tipos.map(x => `<option value="${x.id}" ${x.id === it.tipo ? 'selected' : ''}>${esc(x.nome)}</option>`).join('')}</select></label>
          <label class="ll-imp-sel">${LL.bandeira(it.pais)}<select data-cidade aria-label="Cidade">${LL.cidades.filter(c => c.pais === it.pais).map(c => `<option value="${c.id}" ${c.id === it.cidade ? 'selected' : ''}>${esc(c.nome)}</option>`).join('')}</select></label>
        </div>
        ${ex ? `<div class="ll-imp-dup-aviso"><p>${LL.icone('copy')} Você já tem <b>${esc(ex.titulo)}</b> em ${esc(LL.cidade(ex.cidade).nome)}. O que fazer?</p>
          <div class="ll-segmentado" role="radiogroup" aria-label="O que fazer com o repetido">
            ${[['juntar', 'Juntar informações'], ['manter', 'Manter os dois'], ['pular', 'Pular']].map(([k, n]) => `<button type="button" role="radio" aria-checked="${it.decisao === k}" data-dec="${k}">${n}</button>`).join('')}</div>
          ${it.decisao === 'juntar' ? '<p class="ll-ajuda">Os campos vazios do lugar que você já tem serão completados com o PDF; as dicas e as fotos novas são somadas.</p>' : ''}</div>` : ''}
        <p class="ll-imp-desc">${esc(it.descricao)}</p>
        <div class="ll-imp-campos">${preenchidos.map(({ def, html }) => `<span class="ll-imp-campo"><span class="ll-subrotulo">${esc(def.rotulo)}</span> ${html}</span>`).join('')}
          ${falta.length ? `<span class="ll-imp-falta">${LL.icone('alert-circle')} Não encontrado: ${esc(falta.join(', ').toLowerCase())}</span>` : ''}</div>
        <div class="ll-imp-fotos">${fotosDe(it.id).map(img => `<figure class="ll-imp-foto"><img src="${esc(img.url)}" alt="Imagem da página ${img.pagina}" loading="lazy">
            <figcaption><select data-mover="${img.id}" aria-label="Mover imagem da página ${img.pagina}">${opcoesLugar(it.id)}</select>
            <button type="button" class="ll-icone-btn" data-descartar="${img.id}" aria-label="Descartar imagem da página ${img.pagina}">${LL.icone('x')}</button></figcaption></figure>`).join('') ||
            '<span class="ll-ajuda">Nenhuma imagem para este lugar.</span>'}</div>
        <footer class="ll-imp-rodape"><button type="button" class="ll-btn ll-btn-sec ll-btn-peq" data-editar>${LL.icone('pencil')}<span>Editar todos os campos</span></button></footer>
      </article>`;
    };

    const etapa3 = () => {
      const porCidade = {};
      itens.forEach(i => (porCidade[i.cidade] = porCidade[i.cidade] || []).push(i));
      const semLugar = imagens.filter(i => !i.lugar || !itens.some(x => x.id === i.lugar));
      el.innerHTML = `<div class="ll-imp-rev">${resumo()}
        <p class="ll-ajuda ll-imp-instr">Confira o que a IA encontrou em <b>${esc(arquivo)}</b>. Desmarque o que não quer, edite o que estiver errado e decida o que fazer com os repetidos.</p>
        ${Object.entries(porCidade).map(([cid, lista]) => `<section class="ll-imp-grupo"><h3 class="ll-imp-grupo-titulo">${LL.bandeira(LL.cidade(cid)?.pais)} ${esc(LL.cidade(cid)?.nome)} <span>${lista.length}</span></h3>
          <div class="ll-imp-lista">${lista.map(cartao).join('')}</div></section>`).join('')}
        ${semLugar.length ? `<section class="ll-imp-grupo ll-imp-bandeja"><h3 class="ll-imp-grupo-titulo">${LL.icone('photo')} Imagens sem lugar <span>${semLugar.length}</span></h3>
          <div class="ll-imp-fotos">${semLugar.map(img => `<figure class="ll-imp-foto"><img src="${esc(img.url)}" alt="Imagem da página ${img.pagina}" loading="lazy">
            <figcaption><select data-mover="${img.id}" aria-label="Ligar imagem da página ${img.pagina} a um lugar">${opcoesLugar(null).replace('Mover para…', 'Ligar a…')}</select>
            <button type="button" class="ll-icone-btn" data-descartar="${img.id}" aria-label="Descartar imagem">${LL.icone('x')}</button></figcaption></figure>`).join('')}</div></section>` : ''}
      </div>`;
      ligar();
    };

    const atualizarResumo = () => { const r = el.querySelector('.ll-imp-resumo'); r.replaceWith(LL.h(resumo())); el.querySelector('[data-salvar]').onclick = salvar; };
    const ligar = () => {
      el.querySelector('[data-salvar]').onclick = salvar;
      el.querySelectorAll('.ll-imp-item').forEach(card => {
        const it = itens.find(i => i.id === card.dataset.id);
        card.querySelector('[data-sel]').onchange = e => { it.sel = e.target.checked; card.classList.toggle('ll-imp-desmarcado', !it.sel); atualizarResumo(); };
        card.querySelector('[data-titulo]').oninput = e => { it.titulo = e.target.value; };
        card.querySelector('[data-tirar]').onclick = () => {
          const i = itens.indexOf(it); itens.splice(i, 1); imagens.filter(x => x.lugar === it.id).forEach(x => (x.lugar = null));
          etapa3(); LL.toast(`“${it.titulo}” saiu da importação.`, { icone: 'trash', desfazer: () => { itens.splice(i, 0, it); imagens.filter(x => x.lugar == null && x.sugeridoPara === it.id).forEach(x => (x.lugar = it.id)); etapa3(); } });
        };
        card.querySelector('[data-tipo]').onchange = e => { it.tipo = e.target.value; etapa3(); };
        card.querySelector('[data-cidade]').onchange = e => { it.cidade = e.target.value; etapa3(); };
        card.querySelectorAll('[data-dec]').forEach(b => b.onclick = () => { it.decisao = b.dataset.dec; it.sel = it.decisao !== 'pular'; etapa3(); });
        card.querySelector('[data-editar]').onclick = () => {
          let pn;
          const f = LL.ui.formulario(it, { destacarVazios: true, textoSalvar: 'Guardar alterações', aoCancelar: () => pn.fechar(),
            aoSalvar: novo => { Object.assign(it, novo, { id: it.id }); imagens.filter(x => x.lugar === it.id).forEach(x => { if (!novo.fotos.includes(x.url)) x.lugar = null; });
              novo.fotos.filter(u => !imagens.some(x => x.url === u)).forEach(u => imagens.push({ id: 'up' + Math.random(), url: u, pagina: '—', lugar: it.id }));
              pn.fechar(); etapa3(); } });
          f.querySelector('.ll-fotos-edit')?.closest('.ll-grupo')?.setAttribute('hidden', '');
          pn = LL.painel({ titulo: `Editar “${it.titulo}”`, conteudo: f, classe: 'll-painel-form' });
        };
      });
      el.querySelectorAll('[data-mover]').forEach(s => s.onchange = () => {
        const img = imagens.find(i => i.id === s.dataset.mover); img.lugar = s.value === '__sem' ? null : s.value; etapa3();
        LL.toast(img.lugar ? `Imagem movida para “${itens.find(i => i.id === img.lugar).titulo}”.` : 'Imagem ficou sem lugar.', { icone: 'photo' });
      });
      el.querySelectorAll('[data-descartar]').forEach(b => b.onclick = () => {
        const i = imagens.findIndex(x => x.id === b.dataset.descartar); const [img] = imagens.splice(i, 1); etapa3();
        LL.toast('Imagem descartada.', { icone: 'photo', desfazer: () => { imagens.splice(i, 0, img); etapa3(); } });
      });
    };

    const salvar = () => {
      const ids = [];
      itens.filter(i => i.sel).forEach(it => {
        const fotos = fotosDe(it.id).map(i => i.url);
        if (it.dup && it.decisao === 'juntar') {
          const ex = LL.lugar(it.dup);
          LL.tipo(ex.tipo).campos.forEach(c => { if (vazio(ex.extras?.[c.id]) && !vazio(it.extras?.[c.id])) ex.extras[c.id] = clone(it.extras[c.id]); });
          if (it.dicas && !ex.dicas.includes(it.dicas)) ex.dicas = [ex.dicas, it.dicas].filter(Boolean).join('\n');
          if (!ex.descricao) ex.descricao = it.descricao;
          ex.fotos = [...ex.fotos, ...fotos.filter(f => !ex.fotos.includes(f))];
          ids.push(ex.id);
        } else {
          const { id, dup, decisao, sel, pagina, ...resto } = it;
          ids.push(LL.salvarLugar({ ...resto, id: null, fotos }).id);
        }
      });
      LL.avisar({ acao: 'importado', ids });
      el.innerHTML = `<div class="ll-imp-fim"><span class="ll-imp-fim-ic">${LL.icone('circle-check-filled')}</span>
        <h3>${ids.length} ${ids.length === 1 ? 'lugar entrou' : 'lugares entraram'} na sua lista</h3>
        <p class="ll-ajuda">Fonte de cada um: “${esc(arquivo)} · pág. N”. Dá para editar ou apagar qualquer um depois.</p>
        <button type="button" class="ll-btn ll-btn-pri" data-ver>${LL.icone('arrow-right')}<span>Ver na lista</span></button></div>`;
      el.querySelector('[data-ver]').onclick = () => op.aoTerminar && op.aoTerminar(ids);
    };

    etapa1();
    return el;
  };

  /* ================================================================
     TIPOS DE LOCAL
     ================================================================ */
  const ICONES_NOVOS = ['map-pin', 'building-store', 'trees', 'beach', 'mountain', 'ticket', 'music', 'camera', 'building-church', 'swimming', 'palette', 'book', 'paw', 'building-castle', 'bike'];
  const CORES_NOVAS = ['#d6452f', '#e8892b', '#e0b100', '#2f9e44', '#0c8599', '#3b5bdb', '#7048e8', '#c2338a'];
  LL.ui.tipos = (op = {}) => {
    const el = LL.h('<div class="ll-tipos-ger"></div>');
    let ed = null;
    const desenhar = () => {
      el.innerHTML = `<ul class="ll-tipos-lista">${LL.tipos.map(t => `<li class="ll-tipo-linha" style="--cor-tipo:${LL.corTipo(t.id)}">
          <span class="ll-tipo-ic">${LL.icone(t.icone)}</span>
          <span class="ll-tipo-nome"><b>${esc(t.nome)}</b><small>${t.proprio ? 'Campos comuns + horário' : `${t.campos.length} campos próprios`} · ${LL.filtrar({ tipo: t.id }).length} lugares</small></span>
          ${t.proprio ? `<button type="button" class="ll-icone-btn" data-ed="${t.id}" aria-label="Editar ${esc(t.nome)}">${LL.icone('pencil')}</button>` : ''}</li>`).join('')}</ul>
        <form class="ll-tipo-novo-form">
          <h3 class="ll-secao-titulo">${ed ? 'Editar tipo' : 'Criar um tipo novo'}</h3>
          <label class="ll-campo"><span class="ll-rotulo">Nome</span><input class="ll-input" name="nome" placeholder="ex.: Praia, Museu, Parque" value="${esc(ed?.nome || '')}" required></label>
          <fieldset class="ll-campo"><legend class="ll-rotulo">Ícone</legend><div class="ll-icones-grade">${ICONES_NOVOS.map(i => `<button type="button" class="ll-chip ll-chip-ic" aria-pressed="${(ed?.icone || 'map-pin') === i}" data-ic="${i}" aria-label="${i}">${LL.icone(i)}</button>`).join('')}</div></fieldset>
          <fieldset class="ll-campo"><legend class="ll-rotulo">Cor</legend><div class="ll-cores">${CORES_NOVAS.map(c => `<button type="button" class="ll-cor" aria-pressed="${(ed?.cor || CORES_NOVAS[3]) === c}" data-cor="${c}" style="--c:${c}" aria-label="Cor ${c}"></button>`).join('')}</div></fieldset>
          <p class="ll-ajuda">Tipos novos usam os campos comuns + horário. Os campos próprios dos 8 tipos principais são fixos.</p>
          <div class="ll-form-rodape">${op.aoFechar ? '<button type="button" class="ll-btn ll-btn-sec" data-fechar-tipos>Fechar</button>' : ''}<button type="submit" class="ll-btn ll-btn-pri">${LL.icone(ed ? 'check' : 'plus')}<span>${ed ? 'Salvar tipo' : 'Criar tipo'}</span></button></div>
        </form>`;
      let icone = ed?.icone || 'map-pin', cor = ed?.cor || CORES_NOVAS[3];
      el.querySelectorAll('[data-ic]').forEach(b => b.onclick = () => { icone = b.dataset.ic; el.querySelectorAll('[data-ic]').forEach(x => x.setAttribute('aria-pressed', x === b)); });
      el.querySelectorAll('[data-cor]').forEach(b => b.onclick = () => { cor = b.dataset.cor; el.querySelectorAll('[data-cor]').forEach(x => x.setAttribute('aria-pressed', x === b)); });
      el.querySelectorAll('[data-ed]').forEach(b => b.onclick = () => { ed = LL.tipo(b.dataset.ed); desenhar(); });
      const f = el.querySelector('[data-fechar-tipos]'); if (f) f.onclick = () => op.aoFechar();
      el.querySelector('form').onsubmit = e => {
        e.preventDefault(); const nome = e.target.nome.value.trim(); if (!nome) { e.target.nome.focus(); return; }
        let id;
        if (ed) { Object.assign(ed, { nome, plural: nome, icone, cor }); id = ed.id; }
        else { id = 't' + ++seq; LL.tipos.push({ id, nome, plural: nome, icone, cor, proprio: true, campos: [{ id: 'horario', tipo: 'horario', rotulo: 'Horário' }] }); }
        LL.toast(ed ? `Tipo “${nome}” atualizado.` : `Tipo “${nome}” criado.`, { icone: icone });
        ed = null; LL.avisar({ acao: 'tipos' }); op.aoCriar ? op.aoCriar(id) : desenhar();
      };
    };
    desenhar();
    return el;
  };

  /* ================================================================
     GUIA DE VIAGEM — gera um único .html somente leitura para o celular
     ================================================================ */
  const tamanho = b => b < 1048576 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1048576).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`;
  LL.tamanho = tamanho;
  const baixarTexto = async url => { const r = await fetch(url); if (!r.ok) throw new Error(`não consegui baixar ${url}`); return r.text(); };
  const paraDataUrl = blob => new Promise((ok, erro) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = erro; r.readAsDataURL(blob); });
  LL.comprimirFoto = async (src, lado = 720, qualidade = 0.72) => {
    const blob = await (await fetch(src, { mode: 'cors' })).blob();
    const bmp = await createImageBitmap(blob);
    const k = Math.min(1, lado / Math.max(bmp.width, bmp.height));
    const cv = document.createElement('canvas'); cv.width = Math.round(bmp.width * k); cv.height = Math.round(bmp.height * k);
    cv.getContext('2d').drawImage(bmp, 0, 0, cv.width, cv.height);
    return cv.toDataURL('image/jpeg', qualidade);
  };
  /* só o subconjunto latino das fontes, convertido em data: URL */
  const fontesEmbutidas = async href => {
    const css = await baixarTexto(href);
    const blocos = [...css.matchAll(/\/\*\s*([a-z-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g)];
    let faces = blocos.length ? blocos.filter(b => b[1] === 'latin').map(b => b[2]) : css.match(/@font-face\s*\{[^}]*\}/g) || [];
    for (let i = 0; i < faces.length; i++) {
      const url = (faces[i].match(/url\(([^)]+)\)/) || [])[1];
      if (url) faces[i] = faces[i].replace(url, await paraDataUrl(await (await fetch(url)).blob()));
    }
    return faces.join('\n');
  };
  const semFimDeScript = s => s.replace(/<\/script/gi, '<\\/script');
  LL.lugaresDoGuia = op => LL.lugares.filter(l => l.pais === op.pais && op.cidades.includes(l.cidade) && (!op.soFavoritos || l.favorito));
  LL.estimarGuia = op => {
    const ls = LL.lugaresDoGuia(op), nf = op.fotos ? ls.filter(l => l.fotos?.length).length : 0;
    return { lugares: ls.length, fotos: nf, bytes: 430000 + ls.length * 1800 + nf * 75000 };
  };
  LL.exportarGuia = async (op, progresso = () => {}) => {
    const p = LL.pais(op.pais), sel = LL.lugaresDoGuia(op);
    const comFoto = op.fotos ? sel.filter(l => l.fotos?.length) : [];
    const lugares = []; let feitas = 0;
    for (const l of sel) {
      const n = { ...clone(l), fotos: [], favorito: !!l.favorito, visitado: !!l.visitado };
      if (op.fotos && l.fotos?.length) {
        try { n.fotos = [await LL.comprimirFoto(l.fotos[0])]; } catch (e) { n.fotos = []; }
        progresso('fotos', ++feitas, comFoto.length);
      }
      lugares.push(n);
    }
    progresso('arquivo');
    let bandeiraImg = null;
    try { bandeiraImg = await paraDataUrl(await (await fetch(`https://cdn.jsdelivr.net/npm/flag-icons@7.2.3/flags/4x3/${p.bandeira}.svg`)).blob()); } catch (e) {}
    const dados = {
      tipos: LL.tipos.filter(t => sel.some(l => l.tipo === t.id)),
      paises: [{ ...p, capa: null, bandeiraImg }],
      cidades: LL.cidades.filter(c => sel.some(l => l.cidade === c.id)).map(c => ({ ...c, capa: null })),
      lugares, pdfSimulado: null
    };
    const info = { id: 'g' + Date.now().toString(36), titulo: op.titulo, gerado: new Date().toISOString(), pais: p.id };
    const doc = new DOMParser().parseFromString(await baixarTexto(LL.config.guia), 'text/html');
    doc.querySelectorAll('[data-so-demo]').forEach(e => e.remove());
    doc.getElementById('guia-dados').textContent = semFimDeScript(`window.LL_DADOS = ${JSON.stringify(dados)};\nwindow.GUIA_INFO = ${JSON.stringify(info)};`);
    for (const el of [...doc.querySelectorAll('[data-embutir]')]) {
      const url = el.getAttribute('src') || el.getAttribute('href');
      const novo = doc.createElement(el.tagName === 'SCRIPT' ? 'script' : 'style');
      novo.textContent = el.dataset.embutir === 'fonte' ? await fontesEmbutidas(url) : semFimDeScript(await baixarTexto(url));
      el.replaceWith(novo);
    }
    doc.title = op.titulo;
    doc.head.insertAdjacentHTML('afterbegin', '<meta name="robots" content="noindex, nofollow">');
    const blob = new Blob(['<!doctype html>\n' + doc.documentElement.outerHTML], { type: 'text/html' });
    /* versão do link: a mesma página, registrando o sw.js que a guarda no celular */
    const dadosEl = doc.getElementById('guia-dados');
    dadosEl.textContent += "\nwindow.GUIA_SW = 'sw.js';";
    const htmlLink = '<!doctype html>\n' + doc.documentElement.outerHTML;
    const nome = `Guia ${op.titulo}`.replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim() + '.html';
    const slug = norm(op.titulo).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + info.id.slice(-4);
    return { blob, htmlLink, nome, slug, lugares: lugares.length, fotos: lugares.filter(l => l.fotos.length).length };
  };
  /* pacote para publicar o link (index.html + sw.js) num serviço gratuito com https */
  LL.pacoteDoLink = async r => {
    if (!window.JSZip) await new Promise((ok, erro) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'; s.onload = ok; s.onerror = () => erro(new Error('não consegui carregar o compactador')); document.head.append(s); });
    const zip = new JSZip(), pasta = zip.folder(r.slug);
    pasta.file('index.html', r.htmlLink);
    pasta.file('sw.js', await baixarTexto('guia-sw.js'));
    pasta.file('LEIA-ME.txt', `Guia "${r.nome.replace(/\.html$/, '')}" — versão para link.\n\nPublique esta pasta num site gratuito com https (Cloudflare Pages, GitHub Pages ou Netlify).\nNo sistema real isso é feito sozinho pelo botão "Publicar link".\n\nNo celular: abra o link uma vez com internet. A partir daí o guia fica guardado e funciona offline,\ne a localização (GPS) funciona porque o endereço é https.\n`);
    return zip.generateAsync({ type: 'blob' });
  };

  LL.ui.gerarGuia = (op = {}) => {
    const el = LL.h('<div class="ll-guia-ger"></div>');
    const paises = LL.paisesComLugares();
    const mes = new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '').replace(' de ', ' ');
    const est = { pais: paises.some(p => p.id === op.pais) ? op.pais : paises[0]?.id, cidades: [], soFavoritos: false, fotos: true, titulo: '' };
    const padraoCidades = () => { est.cidades = op.cidade && LL.cidade(op.cidade)?.pais === est.pais ? [op.cidade] : LL.cidadesDe(est.pais).map(c => c.id); };
    const tituloPadrao = () => `${LL.pais(est.pais).nome} · ${mes}`;
    padraoCidades(); est.titulo = tituloPadrao();
    let url = null;

    const formulario = () => {
      el.innerHTML = `<div class="ll-form-corpo">
        <p class="ll-ajuda">Um arquivo só, para mandar por WhatsApp ou e-mail e abrir no celular durante a viagem. <b>Funciona sem internet</b> — só o mapa precisa de conexão. É somente leitura: no celular dá para marcar “quero ir” e “já fui”, que ficam salvos só naquele aparelho.</p>
        <fieldset class="ll-grupo"><legend class="ll-legenda">País</legend>
          <div class="ll-chips" role="radiogroup" aria-label="País">${paises.map(p => `<button type="button" class="ll-chip" role="radio" aria-checked="${est.pais === p.id}" aria-pressed="${est.pais === p.id}" data-pais="${p.id}">${LL.bandeira(p.id)}<span>${esc(p.nome)}</span></button>`).join('')}</div></fieldset>
        <fieldset class="ll-grupo"><legend class="ll-legenda">Cidades da viagem</legend>
          <div class="ll-guia-cidades">${LL.cidadesDe(est.pais).map(c => `<label class="ll-guia-cidade"><span class="ll-check"><input type="checkbox" value="${c.id}" ${est.cidades.includes(c.id) ? 'checked' : ''}><span class="ll-check-caixa">${LL.icone('check')}</span></span>
            <span>${esc(c.nome)}</span><small>${LL.filtrar({ cidade: c.id }).length} lugares</small></label>`).join('')}</div>
          <div class="ll-chips"><button type="button" class="ll-btn ll-btn-sec ll-btn-peq" data-todas>Todas</button><button type="button" class="ll-btn ll-btn-sec ll-btn-peq" data-nenhuma>Nenhuma</button></div></fieldset>
        <fieldset class="ll-grupo"><legend class="ll-legenda">Opções</legend>
          <div class="ll-chips">${chip('Só os lugares “quero ir”', est.soFavoritos, 'data-sofav', 'heart')}</div>
          <div class="ll-chips" role="radiogroup" aria-label="Fotos">${chip('1 foto por lugar, comprimida', est.fotos, 'data-fotos="1" role="radio"', 'photo')}${chip('Sem fotos', !est.fotos, 'data-fotos="0" role="radio"')}</div>
          <label class="ll-campo"><span class="ll-rotulo">Nome do guia</span><input class="ll-input" name="titulo" value="${esc(est.titulo)}"></label></fieldset>
        <div class="ll-guia-resumo" aria-live="polite"></div>
      </div>
      <div class="ll-form-rodape"><button type="button" class="ll-btn ll-btn-sec" data-cancelar>Cancelar</button>
        <button type="button" class="ll-btn ll-btn-pri" data-gerar>${LL.icone('device-mobile')}<span>Gerar guia</span></button></div>`;
      const resumo = () => {
        const e = LL.estimarGuia(est), r = el.querySelector('.ll-guia-resumo');
        r.innerHTML = e.lugares ? `<b>${e.lugares} lugares</b> · ${e.fotos} fotos · cerca de <b>${tamanho(e.bytes)}</b> <span>${e.bytes < 24e6 ? 'cabe no WhatsApp e no e-mail' : 'grande para e-mail; envie pelo WhatsApp'}</span>` : 'Escolha ao menos uma cidade com lugares.';
        el.querySelector('[data-gerar]').disabled = !e.lugares;
      };
      el.querySelectorAll('[data-pais]').forEach(b => b.onclick = () => { const mudouTitulo = est.titulo !== tituloPadrao(); est.pais = b.dataset.pais; padraoCidades(); if (!mudouTitulo) est.titulo = tituloPadrao(); formulario(); });
      el.querySelectorAll('.ll-guia-cidade input').forEach(i => i.onchange = () => { est.cidades = [...el.querySelectorAll('.ll-guia-cidade input:checked')].map(x => x.value); resumo(); });
      el.querySelector('[data-todas]').onclick = () => { est.cidades = LL.cidadesDe(est.pais).map(c => c.id); formulario(); };
      el.querySelector('[data-nenhuma]').onclick = () => { est.cidades = []; formulario(); };
      el.querySelector('[data-sofav]').onclick = e => { est.soFavoritos = !est.soFavoritos; e.currentTarget.setAttribute('aria-pressed', est.soFavoritos); resumo(); };
      el.querySelectorAll('[data-fotos]').forEach(b => b.onclick = () => { est.fotos = b.dataset.fotos === '1'; el.querySelectorAll('[data-fotos]').forEach(x => { const on = (x.dataset.fotos === '1') === est.fotos; x.setAttribute('aria-pressed', on); x.setAttribute('aria-checked', on); }); resumo(); });
      el.querySelector('[name=titulo]').oninput = e => { est.titulo = e.target.value; };
      el.querySelector('[data-cancelar]').onclick = () => op.aoFechar && op.aoFechar();
      el.querySelector('[data-gerar]').onclick = gerar;
      resumo();
    };

    const gerar = async () => {
      est.titulo = est.titulo.trim() || tituloPadrao();
      el.innerHTML = `<div class="ll-imp-lendo"><p class="ll-imp-arquivo">${LL.icone('device-mobile')} ${esc(est.titulo)}</p>
        <ol class="ll-passos"><li class="ll-ativo" data-p="fotos">${LL.icone('loader-2', 'll-gira')}${LL.icone('circle-check-filled', 'll-feito')}<span>Comprimindo fotos para o celular <b data-n></b></span></li>
          <li data-p="arquivo">${LL.icone('loader-2', 'll-gira')}${LL.icone('circle-check-filled', 'll-feito')}<span>Embutindo mapa, ícones e fontes no arquivo</span></li></ol>
        <div class="ll-guia-barra"><span></span></div></div>`;
      const li = p => el.querySelector(`[data-p=${p}]`), barra = el.querySelector('.ll-guia-barra span');
      if (!est.fotos) { li('fotos').classList.remove('ll-ativo'); li('fotos').classList.add('ll-ok'); li('fotos').querySelector('span').textContent = 'Sem fotos'; }
      try {
        const r = await LL.exportarGuia(est, (fase, n, total) => {
          if (fase === 'fotos') { el.querySelector('[data-n]').textContent = `${n} de ${total}`; barra.style.width = `${Math.round(n / total * 85)}%`; }
          else { li('fotos').classList.remove('ll-ativo'); li('fotos').classList.add('ll-ok'); li('arquivo').classList.add('ll-ativo'); barra.style.width = '92%'; }
        });
        if (url) URL.revokeObjectURL(url);
        url = URL.createObjectURL(r.blob);
        pronto(r);
      } catch (e) {
        el.innerHTML = `<div class="ll-imp-fim"><p class="ll-erro">${LL.icone('alert-circle')} Não consegui gerar o guia: ${esc(e.message)}.</p>
          <p class="ll-ajuda">Confira a internet do computador (as fotos e o mapa são baixados para dentro do arquivo) e tente de novo.</p>
          <button type="button" class="ll-btn ll-btn-pri" data-de-novo>Tentar de novo</button></div>`;
        el.querySelector('[data-de-novo]').onclick = formulario;
      }
    };

    const pronto = r => {
      const podeCompartilhar = navigator.canShare && navigator.canShare({ files: [new File([r.blob], r.nome, { type: 'text/html' })] });
      el.innerHTML = `<div class="ll-guia-pronto">
        <section class="ll-saida ll-saida-link">
          <h3 class="ll-secao-titulo">${LL.icone('link')} Link — para usar na viagem <span class="ll-recomendado">recomendado</span></h3>
          <p class="ll-ajuda">Abre com a <b>localização funcionando</b>. Depois de aberto uma vez com internet, fica guardado no celular e <b>funciona offline</b>.</p>
          <div class="ll-link-caixa" data-caixa><span class="ll-ajuda">Toque em “Publicar link” para criar o endereço.</span></div>
          <div class="ll-chips">
            <button type="button" class="ll-btn ll-btn-pri" data-publicar>${LL.icone('link')}<span>Publicar link</span></button>
            <button type="button" class="ll-btn ll-btn-sec" data-zip>${LL.icone('download')}<span>Baixar pacote do link (.zip)</span></button></div>
          <p class="ll-ajuda ll-nota-sim">No protótipo, “Publicar link” publica no <b>seu computador</b> (servidor de teste), para abrir no celular pelo mesmo Wi-Fi. No sistema real, publica sozinho num site gratuito com https (Cloudflare Pages ou GitHub Pages) e abre o WhatsApp com o link pronto. O link não aparece em buscas, mas quem tiver o link consegue ver.</p>
        </section>
        <section class="ll-saida">
          <h3 class="ll-secao-titulo">${LL.icone('file-type-html')} Arquivo — reserva, sem depender de nada</h3>
          <p class="ll-ajuda">Funciona mesmo que o link nunca tenha sido aberto. Mas, aberto como arquivo, o celular <b>não libera a localização</b>: as distâncias são medidas a partir de um lugar escolhido (ex.: o hotel).</p>
          <div class="ll-arquivo">${LL.icone('file-type-html')}<div><b>${esc(r.nome)}</b><small>${tamanho(r.blob.size)} · ${r.lugares} lugares · ${r.fotos} fotos · gerado agora</small></div></div>
          <div class="ll-chips">
            <a class="ll-btn ll-btn-sec" href="${url}" download="${esc(r.nome)}">${LL.icone('download')}<span>Baixar arquivo</span></a>
            ${podeCompartilhar ? `<button type="button" class="ll-btn ll-btn-sec" data-compartilhar>${LL.icone('share')}<span>Compartilhar…</span></button>` : ''}
            <a class="ll-btn ll-btn-sec" href="${url}" target="_blank" rel="noopener">${LL.icone('device-mobile')}<span>Abrir aqui</span></a></div>
          <p class="ll-ajuda">Para mandar: WhatsApp → clipe → <b>Documento</b> (não “Foto”), ou anexo de e-mail. No celular, abra com o <b>Chrome</b>.</p>
        </section>
        <p class="ll-ajuda">Mudou algo depois? Gere de novo e reenvie — o guia mostra a data em que foi gerado.</p>
        <div class="ll-form-rodape"><button type="button" class="ll-btn ll-btn-sec" data-outro>Gerar outro guia</button><button type="button" class="ll-btn ll-btn-pri" data-fechar-guia>Concluir</button></div></div>`;
      const c = el.querySelector('[data-compartilhar]');
      if (c) c.onclick = () => navigator.share({ files: [new File([r.blob], r.nome, { type: 'text/html' })], title: r.nome }).catch(() => {});
      const caixa = el.querySelector('[data-caixa]');
      const publicado = async p => {
        const msg = `Guia de viagem ${r.nome.replace(/^Guia |\.html$/g, '')}: ${p.rede}`;
        caixa.classList.add('ll-link-pub');
        caixa.innerHTML = `<canvas class="ll-qr" width="168" height="168" aria-label="QR code do link"></canvas>
          <div class="ll-link-info"><p><b>Publicado no seu computador.</b> No celular (mesmo Wi-Fi), aponte a câmera para o QR code ou abra:</p>
            <a href="${esc(p.rede)}" target="_blank" rel="noopener"><code>${esc(p.rede)}</code></a>
            <div class="ll-chips"><button type="button" class="ll-btn ll-btn-sec ll-btn-peq" data-copiar>${LL.icone('link')}<span>Copiar link</span></button>
              <a class="ll-btn ll-btn-sec ll-btn-peq" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">${LL.icone('share')}<span>Enviar pelo WhatsApp</span></a>
              <a class="ll-btn ll-btn-sec ll-btn-peq" href="${esc(p.local)}" target="_blank" rel="noopener">${LL.icone('device-mobile')}<span>Abrir aqui</span></a></div>
            <p class="ll-ajuda">Este endereço de teste é <b>http</b>. Para a localização funcionar nele, ative no Chrome do celular <code>chrome://flags</code> → “Insecure origins treated as secure” com <code>${esc(p.rede.split('/publicados')[0])}</code>. No sistema real o link é https e isso não é preciso.</p></div>`;
        caixa.querySelector('[data-copiar]').onclick = () => navigator.clipboard?.writeText(p.rede).then(() => LL.toast('Link copiado.', { icone: 'link' }), () => LL.toast(p.rede));
        try {
          if (!window.QRious) await new Promise((ok, erro) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js'; s.onload = ok; s.onerror = erro; document.head.append(s); });
          new QRious({ element: caixa.querySelector('canvas'), value: p.rede, size: 168, padding: 8 });
        } catch (e) { caixa.querySelector('canvas').remove(); }
      };
      el.querySelector('[data-publicar]').onclick = async e => {
        const b = e.currentTarget, rot = b.querySelector('span');
        if (LL.config.semServidor) {
          LL.toast('Nesta versão online de demonstração o “Publicar link” fica desligado: no protótipo ele publica pelo servidor de teste do computador. No sistema real, publica sozinho.', { icone: 'info-circle' });
          return;
        }
        b.disabled = true; rot.textContent = 'Publicando…';
        try {
          const resp = await fetch('/api/publicar', { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug: r.slug, arquivos: { 'index.html': r.htmlLink, 'sw.js': await baixarTexto('guia-sw.js') } }) });
          const p = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(p.erro || `o servidor respondeu ${resp.status}`);
          await publicado(p);
          rot.textContent = 'Publicar de novo';
        } catch (erro) {
          rot.textContent = 'Publicar link';
          LL.toast(`Não consegui publicar: ${erro.message}. O servidor de teste (servidor_mockups.py) precisa estar rodando.`, { icone: 'alert-circle' });
        }
        b.disabled = false;
      };
      el.querySelector('[data-zip]').onclick = async e => {
        const b = e.currentTarget; b.disabled = true;
        try {
          const z = await LL.pacoteDoLink(r), a = document.createElement('a');
          a.href = URL.createObjectURL(z); a.download = `${r.slug}.zip`; document.body.append(a); a.click(); a.remove();
          setTimeout(() => URL.revokeObjectURL(a.href), 4000);
          LL.toast(`Pacote ${r.slug}.zip baixado (${tamanho(z.size)}).`, { icone: 'download' });
        } catch (erro) { LL.toast(`Não consegui montar o pacote: ${erro.message}.`, { icone: 'alert-circle' }); }
        b.disabled = false;
      };
      el.querySelector('[data-outro]').onclick = formulario;
      el.querySelector('[data-fechar-guia]').onclick = () => op.aoFechar && op.aoFechar();
    };
    formulario();
    return el;
  };

  /* ---------- atalhos que abrem painéis ---------- */
  LL.abrirGerarGuia = contexto => {
    let p; const g = LL.ui.gerarGuia({ ...(contexto || {}), aoFechar: () => p.fechar() });
    p = LL.painel({ titulo: 'Guia de viagem para o celular', conteudo: g, classe: 'll-painel-form' });
  };
  LL.abrirNovo = (contexto, depois) => {
    let p; const f = LL.ui.formulario(null, { contexto, aoCancelar: () => p.fechar(), aoSalvar: l => { const s = LL.salvarLugar(l); p.fechar(); depois && depois(s); } });
    p = LL.painel({ titulo: 'Novo lugar', conteudo: f, classe: 'll-painel-form' });
  };
  LL.abrirEdicao = (id, depois) => {
    let p; const f = LL.ui.formulario(LL.lugar(id), { aoCancelar: () => p.fechar(), aoSalvar: l => { const s = LL.salvarLugar(l); p.fechar(); depois && depois(s); } });
    p = LL.painel({ titulo: 'Editar lugar', conteudo: f, classe: 'll-painel-form' });
  };
  LL.abrirImportacao = depois => {
    let p; const imp = LL.ui.importacao({ aoTerminar: ids => { p.fechar(); depois && depois(ids); } });
    p = LL.painel({ titulo: 'Importar PDF', conteudo: imp, classe: 'll-painel-largo' });
  };
  LL.abrirTipos = depois => {
    let p; const t = LL.ui.tipos({ aoFechar: () => p.fechar(), aoCriar: depois ? id => { p.fechar(); depois(id); } : null });
    p = LL.painel({ titulo: 'Tipos de local', conteudo: t, classe: 'll-painel-form', aoFechar: () => depois && depois(null) });
  };
})();
