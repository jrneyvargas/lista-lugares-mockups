/* Lista de Lugares — DADOS DE DEMONSTRAÇÃO (fictícios) para os mockups.
   Coordenadas aproximadas; preços, horários e dicas são inventados.
   Fotos: Wikimedia Commons (licenças livres, créditos na página de cada arquivo). */
(function () {
  const W = 'https://upload.wikimedia.org/wikipedia/commons/thumb/';
  const F = {
    sensoji: W + '4/43/Sensoji_2023.jpg/960px-Sensoji_2023.jpg',
    shibuya: W + '8/88/Shibuya_Crossing%2C_Aerial.jpg/960px-Shibuya_Crossing%2C_Aerial.jpg',
    meiji: W + '8/8b/Meiji_Jingu_2023-3.jpg/960px-Meiji_Jingu_2023-3.jpg',
    ichiran: W + 'c/cd/Headquarters_of_Ichiran_Ramen.jpg/960px-Headquarters_of_Ichiran_Ramen.jpg',
    ramen: W + 'c/c3/Shoyu_Ramen%EF%BC%88Tokyo_Ramen%EF%BC%89_-_01.jpg/960px-Shoyu_Ramen%EF%BC%88Tokyo_Ramen%EF%BC%89_-_01.jpg',
    tsukiji: W + 'f/fd/2018_Tsukiji_fish_market.jpg/960px-2018_Tsukiji_fish_market.jpg',
    sushi: W + '6/60/Sushi_platter.jpg/960px-Sushi_platter.jpg',
    izakaya: W + 'b/b3/Izakaya_Exterior_Gotanda.jpg/960px-Izakaya_Exterior_Gotanda.jpg',
    parkHyatt: W + 'a/a9/Shinjuku_Park_Tower_2018_from_MetGovBld.jpg/960px-Shinjuku_Park_Tower_2018_from_MetGovBld.jpg',
    capsula: W + 'f/ff/Capsule_hotel.jpg/960px-Capsule_hotel.jpg',
    goldenGai: W + '8/8d/G2_Street_20090626_2.jpg/960px-G2_Street_20090626_2.jpg',
    yamanote: W + '6/64/Yamanote-Line-E235.jpg/960px-Yamanote-Line-E235.jpg',
    tokyoStation: W + '1/1d/Tokyo-STA_Marunouchi-Entrance_2023.jpg/960px-Tokyo-STA_Marunouchi-Entrance_2023.jpg',
    donki: W + '4/4e/Don_Quijote_Headquarters_-01.jpg/960px-Don_Quijote_Headquarters_-01.jpg',
    scramble: W + '4/45/SHIBUYA_SCRAMBLE_SQUARE_East_Tower.jpg/960px-SHIBUYA_SCRAMBLE_SQUARE_East_Tower.jpg',
    cafe: W + 'e/e4/Latte_and_dark_coffee.jpg/960px-Latte_and_dark_coffee.jpg',
    fushimi: W + '0/0e/Torii_path_with_lantern_at_Fushimi_Inari_Taisha_Shrine%2C_Kyoto%2C_Japan.jpg/960px-Torii_path_with_lantern_at_Fushimi_Inari_Taisha_Shrine%2C_Kyoto%2C_Japan.jpg',
    kinkakuji: W + '0/0f/Golden_Pavilion_Kinkaku-ji_water_mirror_2024.jpg/960px-Golden_Pavilion_Kinkaku-ji_water_mirror_2024.jpg',
    nishiki: W + 'c/ce/Nishiki_Ichiba_by_matsuyuki.jpg/960px-Nishiki_Ichiba_by_matsuyuki.jpg',
    gion: W + '2/23/150124_Gion_Kyoto_Japan01s3.jpg/960px-150124_Gion_Kyoto_Japan01s3.jpg',
    udon: W + '9/94/%E9%B6%8F%E5%A4%A9%E3%81%AE%E3%81%86%E3%81%A9%E3%82%93.jpg/960px-%E9%B6%8F%E5%A4%A9%E3%81%AE%E3%81%86%E3%81%A9%E3%82%93.jpg',
    ryokan: W + '2/27/Tamatsukuri_onsen_yado02s3648.jpg/960px-Tamatsukuri_onsen_yado02s3648.jpg',
    kiyomizu: W + 'a/ae/Kiyomizu-dera%2C_Kyoto%2C_November_2016_-02.jpg/960px-Kiyomizu-dera%2C_Kyoto%2C_November_2016_-02.jpg',
    arashiyama: W + 'c/c2/Arashiyama%2C_Part_II_-_Arashiyama7534.jpg/960px-Arashiyama%2C_Part_II_-_Arashiyama7534.jpg',
    dotonbori: W + 'f/f4/Osaka_Dotonbori_Ebisu_Bridge.jpg/960px-Osaka_Dotonbori_Ebisu_Bridge.jpg',
    okonomiyaki: W + '5/59/Okonomiyaki_001.jpg/960px-Okonomiyaki_001.jpg',
    takoyaki: W + '5/5c/%E3%82%BD%E3%83%BC%E3%82%B9%E3%81%A8%E3%83%9D%E3%83%B3%E9%85%A2%E3%81%AE%E3%81%9F%E3%81%93%E7%84%BC%E3%81%8D.jpg/960px-%E3%82%BD%E3%83%BC%E3%82%B9%E3%81%A8%E3%83%9D%E3%83%B3%E9%85%A2%E3%81%AE%E3%81%9F%E3%81%93%E7%84%BC%E3%81%8D.jpg',
    osakaCastle: W + 'c/ca/Osaka_Castle_03bs3200.jpg/960px-Osaka_Castle_03bs3200.jpg',
    naraPark: W + 'b/b4/Nara_Park_-_panoramio_%282%29.jpg/960px-Nara_Park_-_panoramio_%282%29.jpg',
    todaiji: W + '2/2f/T%C5%8Ddai-ji_Kon-d%C5%8D.jpg/960px-T%C5%8Ddai-ji_Kon-d%C5%8D.jpg',
    kawaguchi: W + '1/18/KawaguchiKo.jpg/960px-KawaguchiKo.jpg',
    chureito: W + '6/66/Chuurei-tou_Fujiyoshida_17025277650_c59733d6ba_o.jpg/960px-Chuurei-tou_Fujiyoshida_17025277650_c59733d6ba_o.jpg',
    ropeway: W + '6/65/Hakone_ropeway_%28cropped%29.jpg/960px-Hakone_ropeway_%28cropped%29.jpg',
    onsen: W + '4/41/Onsen_in_Nachikatsuura%2C_Japan.jpg/960px-Onsen_in_Nachikatsuura%2C_Japan.jpg',
    hakone: W + 'b/b5/View_of_Mount_Fuji_from_Lake_Ashi.jpg/960px-View_of_Mount_Fuji_from_Lake_Ashi.jpg',
    fuji: W + 'f/f8/View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg/960px-View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg',
    tokyo: W + 'b/b2/Skyscrapers_of_Shinjuku_2009_January.jpg/960px-Skyscrapers_of_Shinjuku_2009_January.jpg',
    seoul: W + '3/30/%EC%A4%91%ED%99%94%EC%A0%84%EC%9D%98_%EB%82%AE.jpg/960px-%EC%A4%91%ED%99%94%EC%A0%84%EC%9D%98_%EB%82%AE.jpg',
    gyeongbokgung: W + '6/63/%EA%B4%91%ED%99%94%EB%AC%B8_%EC%9B%94%EB%8C%80.jpg/960px-%EA%B4%91%ED%99%94%EB%AC%B8_%EC%9B%94%EB%8C%80.jpg',
    gwangjang: W + '9/94/Gwangjang_Market%2C_Seoul_01.jpg/960px-Gwangjang_Market%2C_Seoul_01.jpg',
    sake: W + '1/13/Overflowing_sake_glass_in_masu.jpg/960px-Overflowing_sake_glass_in_masu.jpg'
  };

  /* Campos próprios de cada tipo (fixos). tipos de campo:
     horario | valor | etiquetas | opcao | simnao | texto | link | checkinout | depara */
  const HORARIO = { id: 'horario', tipo: 'horario', rotulo: 'Horário' };
  const tipos = [
    { id: 'atrativo', nome: 'Atrativo', plural: 'Atrativos', icone: 'torii', cor: '#d6452f', campos: [
      HORARIO,
      { id: 'ingresso', tipo: 'valor', rotulo: 'Ingresso', gratis: true },
      { id: 'tempoVisita', tipo: 'texto', rotulo: 'Tempo de visita', dica: 'ex.: 1h30' },
      { id: 'melhorHora', tipo: 'texto', rotulo: 'Melhor horário ou época', dica: 'ex.: cedo, antes das 8h' },
      { id: 'comprarAntes', tipo: 'simnao', rotulo: 'Comprar ingresso antes?' }
    ] },
    { id: 'restaurante', nome: 'Restaurante', plural: 'Restaurantes', icone: 'bowl-chopsticks', cor: '#e8892b', campos: [
      HORARIO,
      { id: 'comida', tipo: 'etiquetas', rotulo: 'Tipo de comida', opcoes: ['Ramen', 'Sushi', 'Izakaya', 'Tempurá', 'Yakiniku', 'Kaiseki', 'Udon', 'Okonomiyaki', 'Street food', 'Vegetariano'] },
      { id: 'preco', tipo: 'valor', rotulo: 'Preço por pessoa' },
      { id: 'pratos', tipo: 'texto', rotulo: 'Pratos recomendados', dica: 'ex.: tonkotsu com ovo' },
      { id: 'reserva', tipo: 'simnao', rotulo: 'Precisa reservar?' }
    ] },
    { id: 'hotel', nome: 'Hotel', plural: 'Hotéis', icone: 'bed', cor: '#3b5bdb', campos: [
      { id: 'hospedagem', tipo: 'opcao', rotulo: 'Tipo de hospedagem', opcoes: ['Hotel', 'Ryokan', 'Hostel', 'Cápsula'] },
      { id: 'diaria', tipo: 'valor', rotulo: 'Diária estimada' },
      { id: 'checkin', tipo: 'checkinout', rotulo: 'Check-in / check-out' },
      { id: 'cafe', tipo: 'simnao', rotulo: 'Café da manhã incluso?' },
      { id: 'estacao', tipo: 'texto', rotulo: 'Estação mais próxima', dica: 'ex.: Shinjuku (5 min a pé)' }
    ] },
    { id: 'cafe', nome: 'Café', plural: 'Cafés', icone: 'coffee', cor: '#8a5a3b', campos: [
      HORARIO,
      { id: 'especialidade', tipo: 'texto', rotulo: 'Especialidade', dica: 'ex.: matcha latte' },
      { id: 'preco', tipo: 'valor', rotulo: 'Preço médio' }
    ] },
    { id: 'compras', nome: 'Compras', plural: 'Compras', icone: 'shopping-bag', cor: '#c2338a', campos: [
      HORARIO,
      { id: 'oQue', tipo: 'texto', rotulo: 'O que comprar', dica: 'ex.: lembrancinhas, cosméticos' },
      { id: 'preco', tipo: 'valor', rotulo: 'Faixa de preço' },
      { id: 'taxfree', tipo: 'simnao', rotulo: 'Tax free?' }
    ] },
    { id: 'bar', nome: 'Bar', plural: 'Bares', icone: 'glass-cocktail', cor: '#7048e8', campos: [
      HORARIO,
      { id: 'estilo', tipo: 'texto', rotulo: 'Estilo', dica: 'ex.: balcão com 8 lugares' },
      { id: 'preco', tipo: 'valor', rotulo: 'Preço médio' }
    ] },
    { id: 'transporte', nome: 'Transporte', plural: 'Transportes', icone: 'train', cor: '#0c8599', campos: [
      { id: 'meio', tipo: 'opcao', rotulo: 'Tipo', opcoes: ['Trem', 'Ônibus', 'Passe', 'Balsa', 'Teleférico'] },
      { id: 'dePara', tipo: 'depara', rotulo: 'De → para' },
      { id: 'preco', tipo: 'valor', rotulo: 'Valor' },
      { id: 'duracao', tipo: 'texto', rotulo: 'Duração', dica: 'ex.: 2h15' },
      { id: 'ondeComprar', tipo: 'texto', rotulo: 'Onde comprar', dica: 'ex.: máquina da estação' }
    ] },
    { id: 'experiencia', nome: 'Experiência', plural: 'Experiências', icone: 'sparkles', cor: '#2f9e44', campos: [
      HORARIO,
      { id: 'duracao', tipo: 'texto', rotulo: 'Duração', dica: 'ex.: 2h' },
      { id: 'preco', tipo: 'valor', rotulo: 'Valor' },
      { id: 'reserva', tipo: 'simnao', rotulo: 'Precisa reservar?' },
      { id: 'linkReserva', tipo: 'link', rotulo: 'Link de reserva' }
    ] }
  ];

  const paises = [
    { id: 'jp', nome: 'Japão', bandeira: 'jp', moeda: 'JPY', simbolo: '¥', cotacao: 0.037, fuso: 'Asia/Tokyo', capa: F.fuji },
    { id: 'kr', nome: 'Coreia do Sul', bandeira: 'kr', moeda: 'KRW', simbolo: '₩', cotacao: 0.0041, fuso: 'Asia/Seoul', capa: F.seoul }
  ];

  const cidades = [
    { id: 'toquio', pais: 'jp', nome: 'Tóquio', lat: 35.6812, lng: 139.7671, capa: F.tokyo },
    { id: 'quioto', pais: 'jp', nome: 'Quioto', lat: 35.0116, lng: 135.7681, capa: F.kiyomizu },
    { id: 'osaka', pais: 'jp', nome: 'Osaka', lat: 34.6937, lng: 135.5023, capa: F.dotonbori },
    { id: 'nara', pais: 'jp', nome: 'Nara', lat: 34.6851, lng: 135.8048, capa: F.naraPark },
    { id: 'fuji', pais: 'jp', nome: 'Monte Fuji / Hakone', lat: 35.3606, lng: 138.9, capa: F.hakone },
    { id: 'seul', pais: 'kr', nome: 'Seul', lat: 37.5665, lng: 126.978, capa: F.seoul }
  ];

  const H = (periodos, fecha, nota) => ({ periodos, fecha: fecha || [], nota: nota || '' });
  const V = (faixa, valor, gratis) => ({ faixa: faixa || 0, valor: valor || null, gratis: !!gratis });
  const link = url => ({ tipo: 'link', url });

  const lugares = [
    /* ---------- Tóquio ---------- */
    { id: 'l1', titulo: 'Sensō-ji', pais: 'jp', cidade: 'toquio', tipo: 'atrativo', lat: 35.7148, lng: 139.7967,
      descricao: 'Templo budista mais antigo de Tóquio, em Asakusa. O portão Kaminarimon, com a lanterna vermelha gigante, é a foto clássica.\nVídeo com o passeio completo: https://www.youtube.com/watch?v=asakusa-demo',
      dicas: 'Ir antes das 8h para ver sem multidão. A rua Nakamise tem doces de feijão quentinhos — provar o ningyo-yaki.',
      fonte: link('https://www.japan-guide.com/e/e3001.html'), fotos: [F.sensoji], favorito: true, visitado: true,
      extras: { horario: H(['manha', 'tarde', 'noite'], [], 'Área externa aberta 24h; salão principal 6h–17h'), ingresso: V(0, null, true), tempoVisita: '1h30', melhorHora: 'Cedo de manhã ou à noite, iluminado', comprarAntes: false } },
    { id: 'l2', titulo: 'Cruzamento de Shibuya', pais: 'jp', cidade: 'toquio', tipo: 'atrativo', lat: 35.6595, lng: 139.7005,
      descricao: 'O cruzamento de pedestres mais famoso do mundo. Até 3 mil pessoas atravessam a cada sinal verde.',
      dicas: 'Ver de cima no Starbucks do prédio Tsutaya ou no Shibuya Sky. A estátua do Hachikō fica do lado.',
      fonte: link('https://www.gotokyo.org/en/spot/78/index.html'), fotos: [F.shibuya], favorito: false, visitado: true,
      extras: { horario: H(['manha', 'tarde', 'noite', '24h'], [], ''), ingresso: V(0, null, true), tempoVisita: '30 min', melhorHora: 'Fim de tarde, quando acendem os telões', comprarAntes: false } },
    { id: 'l3', titulo: 'Santuário Meiji', pais: 'jp', cidade: 'toquio', tipo: 'atrativo', lat: 35.6764, lng: 139.6993,
      descricao: 'Santuário xintoísta dentro de uma floresta enorme, colado em Harajuku. Contraste total com a cidade.',
      dicas: 'Domingo de manhã às vezes tem casamento tradicional passando. Entrar pelo torii de Harajuku.',
      fonte: link('https://www.meijijingu.or.jp/en/'), fotos: [F.meiji], favorito: false, visitado: true,
      extras: { horario: H(['manha', 'tarde'], [], 'Do nascer ao pôr do sol'), ingresso: V(0, null, true), tempoVisita: '1h', melhorHora: 'Manhã', comprarAntes: false } },
    { id: 'l4', titulo: 'Shibuya Sky', pais: 'jp', cidade: 'toquio', tipo: 'atrativo', lat: 35.6585, lng: 139.7024,
      descricao: 'Mirante a céu aberto no topo do Shibuya Scramble Square, 229 m de altura. Dá para ver o Monte Fuji em dias limpos.',
      dicas: 'Comprar o horário do pôr do sol com semanas de antecedência — esgota rápido. Não pode levar bolsa para o terraço (tem armário).',
      fonte: link('https://www.shibuya-scramble-square.com/sky/'), fotos: [F.scramble], favorito: true, visitado: false,
      extras: { horario: H(['manha', 'tarde', 'noite'], [], '10h–22h30, última entrada 21h20'), ingresso: V(2, 2500), tempoVisita: '1h', melhorHora: 'Pôr do sol', comprarAntes: true } },
    { id: 'l5', titulo: 'teamLab Planets', pais: 'jp', cidade: 'toquio', tipo: 'experiencia', lat: 35.6491, lng: 139.7898,
      descricao: 'Museu de arte digital imersiva onde se anda descalço na água. Mais info: https://www.teamlab.art/e/planets/',
      dicas: 'Ir de bermuda ou calça que dobre até o joelho. Saias curtas: tem shorts emprestados.',
      fonte: link('https://www.teamlab.art/e/planets/'), fotos: [], favorito: true, visitado: false,
      extras: { horario: H(['manha', 'tarde', 'noite'], [], '9h–22h'), duracao: '2h', preco: V(3, 3800), reserva: true, linkReserva: 'https://www.teamlab.art/e/planets/' } },
    { id: 'l6', titulo: 'Ichiran Shibuya', pais: 'jp', cidade: 'toquio', tipo: 'restaurante', lat: 35.6614, lng: 139.701,
      descricao: 'Ramen tonkotsu servido em cabines individuais. Você marca o pedido num papelzinho (tem em inglês).',
      dicas: 'Pedir o ovo cozido à parte. Fila menor depois das 22h. Pagar na máquina da entrada.',
      fonte: link('https://en.ichiran.com/'), fotos: [F.ramen, F.ichiran], favorito: true, visitado: true,
      extras: { horario: H(['manha', 'tarde', 'noite', '24h'], [], 'Aberto 24 horas'), comida: ['Ramen'], preco: V(1, 1180), pratos: 'Tonkotsu clássico + ovo', reserva: false } },
    { id: 'l7', titulo: 'Sushi Zanmai Tsukiji', pais: 'jp', cidade: 'toquio', tipo: 'restaurante', lat: 35.6655, lng: 139.7707,
      descricao: 'Sushi fresco no mercado externo de Tsukiji, com preço honesto. Rede, mas a loja principal é a melhor.',
      dicas: 'Combinar com o café da manhã no mercado. O atum (maguro) é a estrela.',
      fonte: link('https://www.kiyomura.co.jp/'), fotos: [F.sushi, F.tsukiji], favorito: false, visitado: false,
      extras: { horario: H(['manha', 'tarde', 'noite', '24h'], [], ''), comida: ['Sushi'], preco: V(2, 3000), pratos: 'Maguro zanmai, uni', reserva: false } },
    { id: 'l8', titulo: 'Gonpachi Nishi-Azabu', pais: 'jp', cidade: 'toquio', tipo: 'restaurante', lat: 35.6566, lng: 139.7253,
      descricao: 'Izakaya enorme de madeira que inspirou a luta de Kill Bill. Comida boa e ambiente divertido.',
      dicas: 'Reservar mesa no mezanino. Yakitori e soba são os mais pedidos.',
      fonte: link('https://gonpachi.jp/nishi-azabu/'), fotos: [F.izakaya], favorito: false, visitado: false,
      extras: { horario: H(['tarde', 'noite'], [], '11h30–23h30'), comida: ['Izakaya', 'Yakiniku'], preco: V(3, 6000), pratos: 'Yakitori, soba artesanal', reserva: true } },
    { id: 'l9', titulo: 'Park Hyatt Tokyo', pais: 'jp', cidade: 'toquio', tipo: 'hotel', lat: 35.6856, lng: 139.6907,
      descricao: 'O hotel de "Encontros e Desencontros". Quartos a partir do 41º andar do Shinjuku Park Tower.',
      dicas: 'Mesmo sem se hospedar, dá para tomar um drink no New York Bar (52º andar) — chegar antes das 20h para não pagar couvert.',
      fonte: link('https://www.hyatt.com/park-hyatt/tyoph-park-hyatt-tokyo'), fotos: [F.parkHyatt], favorito: false, visitado: false,
      extras: { hospedagem: 'Hotel', diaria: V(3, 145000), checkin: { entrada: '15:00', saida: '12:00' }, cafe: false, estacao: 'Shinjuku (12 min a pé) / Tochōmae (8 min)' } },
    { id: 'l10', titulo: 'Nine Hours Shinjuku', pais: 'jp', cidade: 'toquio', tipo: 'hotel', lat: 35.695, lng: 139.702,
      descricao: 'Hotel-cápsula moderno e limpíssimo. Boa opção para uma noite antes de um trem cedo.',
      dicas: 'Andares separados por gênero. Malas grandes ficam em armário na recepção.',
      fonte: link('https://ninehours.co.jp/en/'), fotos: [F.capsula], favorito: false, visitado: false,
      extras: { hospedagem: 'Cápsula', diaria: V(1, 5500), checkin: { entrada: '14:00', saida: '10:00' }, cafe: false, estacao: 'Seibu-Shinjuku (2 min a pé)' } },
    { id: 'l11', titulo: 'Fuglen Tokyo', pais: 'jp', cidade: 'toquio', tipo: 'cafe', lat: 35.667, lng: 139.692,
      descricao: 'Café norueguês em Tomigaya com móveis vintage. De dia café especial, à noite vira bar de coquetéis.',
      dicas: 'Sentar no banco de fora numa manhã de sol. Perto do parque Yoyogi.',
      fonte: link('https://fuglen.no/tokyo'), fotos: [F.cafe], favorito: true, visitado: false,
      extras: { horario: H(['manha', 'tarde', 'noite'], [], '7h–22h (sex e sáb até 1h)'), especialidade: 'Café coado de torra clara', preco: V(1, 600) } },
    { id: 'l12', titulo: 'Don Quijote Shibuya', pais: 'jp', cidade: 'toquio', tipo: 'compras', lat: 35.6603, lng: 139.6987,
      descricao: 'Loja de tudo, 24h, com 7 andares. Doces, cosméticos, eletrônicos, fantasias.',
      dicas: 'Levar passaporte para o tax free (compras acima de ¥5.000). KitKats de sabores no 1º andar.',
      fonte: link('https://www.donki.com/en/'), fotos: [F.donki], favorito: false, visitado: true,
      extras: { horario: H(['manha', 'tarde', 'noite', '24h'], [], 'Aberto 24 horas'), oQue: 'KitKats, cosméticos, lembrancinhas', preco: V(1), taxfree: true } },
    { id: 'l13', titulo: 'Golden Gai', pais: 'jp', cidade: 'toquio', tipo: 'bar', lat: 35.694, lng: 139.7046,
      descricao: 'Seis vielas com mais de 200 barzinhos minúsculos, cada um com 5 a 10 lugares.',
      dicas: 'Muitos cobram couvert (¥500–1.000). Procurar placas "no cover charge" ou "welcome".',
      fonte: link('https://www.gotokyo.org/en/spot/31/index.html'), fotos: [F.goldenGai], favorito: true, visitado: false,
      extras: { horario: H(['noite'], ['dom'], 'Das 20h até de madrugada'), estilo: 'Barzinhos de balcão', preco: V(2, 1200) } },
    { id: 'l14', titulo: 'Linha Yamanote (JR)', pais: 'jp', cidade: 'toquio', tipo: 'transporte', lat: 35.6812, lng: 139.7671,
      descricao: 'Linha circular verde que passa por Shinjuku, Shibuya, Harajuku, Ueno e Tóquio. Resolve quase tudo.',
      dicas: 'Usar o cartão Suica no celular (Apple Wallet). Evitar entre 7h30 e 9h.',
      fonte: link('https://www.jreast.co.jp/e/'), fotos: [F.yamanote], favorito: false, visitado: true,
      extras: { meio: 'Trem', dePara: { de: 'Circular', para: '30 estações' }, preco: V(1, 200), duracao: 'Volta completa: 1h', ondeComprar: 'Suica no celular ou máquina da estação' } },
    { id: 'l15', titulo: 'Shinkansen Tóquio → Quioto', pais: 'jp', cidade: 'toquio', tipo: 'transporte', lat: 35.6812, lng: 139.7671,
      descricao: 'Trem-bala Nozomi saindo da Estação de Tóquio.',
      dicas: 'Sentar do lado direito (assento E) para ver o Monte Fuji. Comprar um ekiben (marmita) antes de embarcar.',
      fonte: link('https://smart-ex.jp/en/'), fotos: [F.tokyoStation], favorito: false, visitado: false,
      extras: { meio: 'Trem', dePara: { de: 'Tóquio', para: 'Quioto' }, preco: V(3, 14170), duracao: '2h15', ondeComprar: 'App SmartEX ou bilheteria JR' } },

    /* ---------- Quioto ---------- */
    { id: 'l16', titulo: 'Fushimi Inari Taisha', pais: 'jp', cidade: 'quioto', tipo: 'atrativo', lat: 34.9671, lng: 135.7727,
      descricao: 'Milhares de portões torii laranja subindo a montanha.',
      dicas: 'Chegar às 7h. A multidão some depois do primeiro mirante.',
      fonte: link('https://inari.jp/en/'), fotos: [F.fushimi], favorito: true, visitado: false,
      extras: { horario: H(['manha', 'tarde', 'noite', '24h'], [], 'Aberto 24h'), ingresso: V(0, null, true), tempoVisita: '2h a 3h', melhorHora: 'Bem cedo', comprarAntes: false } },
    { id: 'l17', titulo: 'Kinkaku-ji', pais: 'jp', cidade: 'quioto', tipo: 'atrativo', lat: 35.0394, lng: 135.7292,
      descricao: 'O Pavilhão Dourado, coberto de folha de ouro, refletido no lago.',
      dicas: 'Combinar com Ryoan-ji (20 min a pé). Ônibus 205 da estação de Quioto.',
      fonte: link('https://www.shokoku-ji.jp/en/kinkakuji/'), fotos: [F.kinkakuji], favorito: false, visitado: false,
      extras: { horario: H(['manha', 'tarde'], [], '9h–17h'), ingresso: V(1, 500), tempoVisita: '1h', melhorHora: 'Dia de sol, logo na abertura', comprarAntes: false } },
    { id: 'l18', titulo: 'Mercado Nishiki', pais: 'jp', cidade: 'quioto', tipo: 'compras', lat: 35.005, lng: 135.7649,
      descricao: 'A "cozinha de Quioto": 400 m de bancas de comida, picles, chá e facas.',
      dicas: 'Não é permitido comer andando — comer na frente da banca. Muitas fecham às quartas.',
      fonte: link('https://www.kyoto-nishiki.or.jp/'), fotos: [F.nishiki], favorito: false, visitado: false,
      extras: { horario: H(['manha', 'tarde'], ['qua'], '10h–17h, varia por banca'), oQue: 'Tamagoyaki no palito, matcha, facas Aritsugu', preco: V(1), taxfree: false } },
    { id: 'l19', titulo: '% Arabica Arashiyama', pais: 'jp', cidade: 'quioto', tipo: 'cafe', lat: 35.0136, lng: 135.6778,
      descricao: 'Café minúsculo na beira do rio Katsura com vista para as montanhas.',
      dicas: 'Fila anda rápido. Levar o café para a margem do rio.',
      fonte: link('https://arabica.coffee/'), fotos: [F.arashiyama], favorito: false, visitado: false,
      extras: { horario: H(['manha', 'tarde'], [], '9h–18h'), especialidade: 'Kyoto latte', preco: V(1, 600) } },
    { id: 'l20', titulo: 'Cerimônia do chá em Gion', pais: 'jp', cidade: 'quioto', tipo: 'experiencia', lat: 35.0037, lng: 135.7788,
      descricao: 'Cerimônia do chá de 45 minutos numa casa tradicional, com explicação em inglês.',
      dicas: 'Ir de meia limpa (tira o sapato). Depois caminhar por Hanamikoji ao entardecer.',
      fonte: link('https://www.gion-tea.example.com'), fotos: [F.gion], favorito: true, visitado: false,
      extras: { horario: H(['manha', 'tarde'], ['ter'], 'Sessões às 10h, 13h e 15h'), duracao: '45 min', preco: V(2, 4000), reserva: true, linkReserva: 'https://www.gion-tea.example.com/reservar' } },
    { id: 'l21', titulo: 'Ryokan Yachiyo', pais: 'jp', cidade: 'quioto', tipo: 'hotel', lat: 35.0115, lng: 135.7925,
      descricao: 'Ryokan tradicional ao lado do templo Nanzen-ji, com jardim e jantar kaiseki no quarto.',
      dicas: 'Pedir quarto com vista para o jardim. O jantar começa às 18h — não se atrasar.',
      fonte: link('https://www.ryokan-yachiyo.com/'), fotos: [F.ryokan], favorito: true, visitado: false,
      extras: { hospedagem: 'Ryokan', diaria: V(3, 48000), checkin: { entrada: '15:00', saida: '10:00' }, cafe: true, estacao: 'Keage (8 min a pé)' } },
    { id: 'l22', titulo: 'Omen Ginkakuji', pais: 'jp', cidade: 'quioto', tipo: 'restaurante', lat: 35.026, lng: 135.793,
      descricao: 'Udon caseiro servido com legumes da estação para colocar no caldo.',
      dicas: 'Perto do Caminho do Filósofo — almoçar depois do passeio.',
      fonte: link('https://omen.co.jp/'), fotos: [F.udon], favorito: false, visitado: false,
      extras: { horario: H(['tarde', 'noite'], ['qui'], '11h–21h'), comida: ['Udon', 'Vegetariano'], preco: V(1, 1300), pratos: 'Omen udon (quente ou frio)', reserva: false } },

    /* ---------- Osaka ---------- */
    { id: 'l23', titulo: 'Dōtonbori', pais: 'jp', cidade: 'osaka', tipo: 'atrativo', lat: 34.6687, lng: 135.5013,
      descricao: 'Canal com letreiros gigantes, o Glico Man e muita comida de rua.',
      dicas: 'Vir à noite. Provar takoyaki e kushikatsu andando pelo canal.',
      fonte: link('https://osaka-info.jp/en/spot/dotonbori/'), fotos: [F.dotonbori], favorito: true, visitado: false,
      extras: { horario: H(['tarde', 'noite'], [], 'Melhor das 18h à meia-noite'), ingresso: V(0, null, true), tempoVisita: '2h', melhorHora: 'Noite', comprarAntes: false } },
    { id: 'l24', titulo: 'Castelo de Osaka', pais: 'jp', cidade: 'osaka', tipo: 'atrativo', lat: 34.6873, lng: 135.5262,
      descricao: 'Castelo do século XVI cercado de fossos e um parque enorme.',
      dicas: 'O parque é mais bonito que o museu dentro do castelo. Primavera: cerejeiras.',
      fonte: link('https://www.osakacastle.net/english/'), fotos: [F.osakaCastle], favorito: false, visitado: false,
      extras: { horario: H(['manha', 'tarde'], [], '9h–17h'), ingresso: V(1, 600), tempoVisita: '1h30', melhorHora: 'Abril (cerejeiras)', comprarAntes: false } },
    { id: 'l25', titulo: 'Mizuno', pais: 'jp', cidade: 'osaka', tipo: 'restaurante', lat: 34.6688, lng: 135.503,
      descricao: 'Okonomiyaki desde 1945, feito na chapa na sua frente.',
      dicas: 'Fila de 30–60 min no jantar. Ir na abertura, às 11h.',
      fonte: link('https://www.mizuno-osaka.com/'), fotos: [F.okonomiyaki], favorito: false, visitado: false,
      extras: { horario: H(['tarde', 'noite'], ['qui'], '11h–22h'), comida: ['Okonomiyaki'], preco: V(1, 1500), pratos: 'Yamaimo-yaki', reserva: false } },

    /* ---------- Nara ---------- */
    { id: 'l26', titulo: 'Parque de Nara', pais: 'jp', cidade: 'nara', tipo: 'atrativo', lat: 34.685, lng: 135.843,
      descricao: 'Parque com mais de mil cervos soltos que fazem reverência pedindo biscoito.',
      dicas: 'Comprar os shika senbei (¥200) e esconder o mapa de papel — eles comem!',
      fonte: link('https://www.visitnara.jp/'), fotos: [F.naraPark], favorito: true, visitado: false,
      extras: { horario: H(['manha', 'tarde', 'noite', '24h'], [], 'Aberto sempre'), ingresso: V(0, null, true), tempoVisita: 'Meio dia', melhorHora: 'Manhã', comprarAntes: false } },
    { id: 'l27', titulo: 'Tōdai-ji', pais: 'jp', cidade: 'nara', tipo: 'atrativo', lat: 34.689, lng: 135.8398,
      descricao: 'Templo com o Grande Buda de bronze de 15 m dentro de um dos maiores prédios de madeira do mundo.',
      dicas: 'Passar pelo buraco do pilar (diz a lenda que traz iluminação).',
      fonte: link('https://www.todaiji.or.jp/en/'), fotos: [F.todaiji], favorito: false, visitado: false,
      extras: { horario: H(['manha', 'tarde'], [], '7h30–17h30'), ingresso: V(1, 800), tempoVisita: '1h', melhorHora: 'Logo cedo', comprarAntes: false } },

    /* ---------- Monte Fuji / Hakone (região) ---------- */
    { id: 'l28', titulo: 'Lago Kawaguchi', pais: 'jp', cidade: 'fuji', tipo: 'atrativo', lat: 35.516, lng: 138.7519,
      descricao: 'Lago aos pés do Monte Fuji, com a vista mais clássica da montanha refletida na água.',
      dicas: 'Ficar uma noite para ver o Fuji ao amanhecer — de tarde ele costuma se esconder nas nuvens.',
      fonte: link('https://www.fujisan.ne.jp/en/'), fotos: [F.kawaguchi], favorito: true, visitado: false,
      extras: { horario: H(['manha', 'tarde', 'noite', '24h'], [], ''), ingresso: V(0, null, true), tempoVisita: '1 dia', melhorHora: 'Amanhecer, de novembro a fevereiro', comprarAntes: false } },
    { id: 'l29', titulo: 'Pagode Chūreitō', pais: 'jp', cidade: 'fuji', tipo: 'atrativo', lat: 35.5011, lng: 138.8017,
      descricao: 'Pagode de cinco andares com o Fuji ao fundo. São 398 degraus até o mirante.',
      dicas: 'Ir até a estação Shimoyoshida. Primavera com cerejeiras é a foto do cartão-postal.',
      fonte: link('https://www.fujiyoshida.net/'), fotos: [F.chureito], favorito: false, visitado: false,
      extras: { horario: H(['manha', 'tarde', 'noite', '24h'], [], ''), ingresso: V(0, null, true), tempoVisita: '1h', melhorHora: 'Amanhecer', comprarAntes: false } },
    { id: 'l30', titulo: 'Teleférico de Hakone', pais: 'jp', cidade: 'fuji', tipo: 'transporte', lat: 35.244, lng: 139.021,
      descricao: 'Passa por cima do vale vulcânico de Ōwakudani, com fumaça de enxofre e vista do Fuji.',
      dicas: 'Incluso no Hakone Free Pass. Comer o ovo preto em Ōwakudani.',
      fonte: link('https://www.hakoneropeway.co.jp/foreign/en/'), fotos: [F.ropeway], favorito: false, visitado: false,
      extras: { meio: 'Teleférico', dePara: { de: 'Sōunzan', para: 'Tōgendai' }, preco: V(2, 1500), duracao: '25 min', ondeComprar: 'Hakone Free Pass ou na estação' } },
    { id: 'l31', titulo: 'Gora Kadan', pais: 'jp', cidade: 'fuji', tipo: 'hotel', lat: 35.2486, lng: 139.0507,
      descricao: 'Ryokan de luxo numa antiga casa de veraneio da família imperial, com onsen privativo.',
      dicas: 'Reservar o quarto com banheira de onsen na varanda.',
      fonte: link('https://www.gorakadan.com/en/'), fotos: [F.onsen], favorito: false, visitado: false,
      extras: { hospedagem: 'Ryokan', diaria: V(3, 120000), checkin: { entrada: '15:00', saida: '11:00' }, cafe: true, estacao: 'Gora (5 min a pé)' } },

    /* ---------- Coreia do Sul ---------- */
    { id: 'l32', titulo: 'Palácio Gyeongbokgung', pais: 'kr', cidade: 'seul', tipo: 'atrativo', lat: 37.5796, lng: 126.977,
      descricao: 'O maior dos cinco palácios de Seul, com troca da guarda às 10h e 14h.',
      dicas: 'Quem vai de hanbok (roupa tradicional) entra de graça. Fecha às terças.',
      fonte: link('https://royal.khs.go.kr/'), fotos: [F.gyeongbokgung], favorito: true, visitado: false,
      extras: { horario: H(['manha', 'tarde'], ['ter'], '9h–18h'), ingresso: V(1, 3000), tempoVisita: '2h', melhorHora: 'Troca da guarda às 10h', comprarAntes: false } },
    { id: 'l33', titulo: 'Mercado Gwangjang', pais: 'kr', cidade: 'seul', tipo: 'restaurante', lat: 37.5701, lng: 126.9996,
      descricao: 'Mercado tradicional com bancas de bindaetteok (panqueca de feijão) e kimbap.',
      dicas: 'Sentar no banco da banca e apontar o que quer.',
      fonte: link('https://english.visitseoul.net/'), fotos: [F.gwangjang], favorito: false, visitado: false,
      extras: { horario: H(['manha', 'tarde', 'noite'], ['dom'], '9h–23h'), comida: ['Street food'], preco: V(1, 8000), pratos: 'Bindaetteok, mayak kimbap', reserva: false } }
  ];


  /* regras de horário (como se ela tivesse clicado em "Transformar em regras").
     Sem regras = só as etiquetas Manhã/Tarde/Noite → avisos aproximados (ex.: Santuário Meiji, Dōtonbori). */
  const R = (tipo, dias, de, ate, texto) => ({ tipo, dias: dias ? dias.split(' ') : [], de: de || undefined, ate: ate || undefined, texto });
  const REGRAS = {
    l1: [R('aberto', '', '06:00', '17:00')],
    l4: [R('aberto', '', '10:00', '22:30'), R('ultima', '', '21:20'), R('aviso', '', '16:30', '18:30', 'Pôr do sol: fila grande no elevador')],
    l5: [R('aberto', '', '09:00', '22:00'), R('ultima', '', '21:00'), R('aviso', '', '09:00', '10:00', 'Menos gente na primeira hora')],
    l8: [R('aberto', '', '11:30', '23:30'), R('aviso', 'seg ter qua qui sex', '11:30', '14:30', 'Almoço executivo mais barato (¥1.500)')],
    l11: [R('aberto', 'dom seg ter qua qui', '07:00', '22:00'), R('aberto', 'sex sab', '07:00', '01:00')],
    l13: [R('aberto', 'seg ter qua qui sex sab', '20:00', '02:00'), R('fechado', 'dom')],
    l17: [R('aberto', '', '09:00', '17:00')],
    l18: [R('aberto', '', '10:00', '17:00'), R('fechado', 'qua')],
    l19: [R('aberto', '', '09:00', '18:00')],
    l20: [R('aberto', 'seg qua qui sex sab dom', '09:30', '16:00'), R('fechado', 'ter'), R('aviso', '', '10:00', '10:45', 'Sessão de cerimônia'), R('aviso', '', '13:00', '13:45', 'Sessão de cerimônia'), R('aviso', '', '15:00', '15:45', 'Sessão de cerimônia')],
    l22: [R('aberto', '', '11:00', '21:00'), R('fechado', 'qui')],
    l24: [R('aberto', '', '09:00', '17:00'), R('ultima', '', '16:30')],
    l25: [R('aberto', '', '11:00', '22:00'), R('fechado', 'qui'), R('aviso', '', '18:00', '20:00', 'Fila longa no jantar (30–60 min)')],
    l27: [R('aberto', '', '07:30', '17:30')],
    l32: [R('aberto', '', '09:00', '18:00'), R('fechado', 'ter'), R('ultima', '', '17:00'), R('aviso', '', '10:00', '10:20', 'Troca da guarda'), R('aviso', '', '14:00', '14:20', 'Troca da guarda')],
    l33: [R('aberto', '', '09:00', '23:00'), R('fechado', 'dom')]
  };
  lugares.forEach(l => { if (REGRAS[l.id] && l.extras.horario) l.extras.horario.regras = REGRAS[l.id]; });

  /* ---------- PDF simulado ---------- */
  const PDF = 'Roteiro Japão - Kansai.pdf';
  const pdfSimulado = {
    arquivo: PDF, paginas: 14,
    imagens: [
      { id: 'img1', url: F.fushimi, pagina: 3, sugeridoPara: 'p1' },
      { id: 'img2', url: F.kiyomizu, pagina: 4, sugeridoPara: 'p2' },
      { id: 'img3', url: F.arashiyama, pagina: 5, sugeridoPara: 'p3' },
      { id: 'img4', url: F.dotonbori, pagina: 9, sugeridoPara: 'p4' },
      { id: 'img5', url: F.takoyaki, pagina: 10, sugeridoPara: 'p5' },
      { id: 'img6', url: F.sake, pagina: 11, sugeridoPara: null }
    ],
    lugares: [
      { id: 'p1', titulo: 'Fushimi Inari Taisha', pais: 'jp', cidade: 'quioto', tipo: 'atrativo', lat: 34.9671, lng: 135.7727, pagina: 3,
        descricao: 'Santuário dedicado a Inari, deus do arroz. A trilha completa até o topo do monte Inari leva 2–3 horas.',
        dicas: 'No cruzamento Yotsutsuji tem a melhor vista da cidade. Levar água.',
        extras: { horario: H(['manha', 'tarde', 'noite', '24h'], [], ''), ingresso: V(0, null, true), tempoVisita: '3h', melhorHora: 'Fim de tarde', comprarAntes: false } },
      { id: 'p2', titulo: 'Kiyomizu-dera', pais: 'jp', cidade: 'quioto', tipo: 'atrativo', lat: 34.9949, lng: 135.785, pagina: 4,
        descricao: 'Templo com o famoso terraço de madeira sobre o vale, sem nenhum prego. Site: https://www.kiyomizudera.or.jp/en/',
        dicas: 'Descer pelas ruas Sannenzaka e Ninenzaka até Gion.',
        extras: { horario: H(['manha', 'tarde'], [], '6h–18h; última entrada 17h30'), ingresso: V(1, 500), tempoVisita: '1h30', melhorHora: 'Outono', comprarAntes: false } },
      { id: 'p3', titulo: 'Bosque de bambu de Arashiyama', pais: 'jp', cidade: 'quioto', tipo: 'atrativo', lat: 35.017, lng: 135.6713, pagina: 5,
        descricao: 'Caminho entre bambus gigantes, mais bonito com vento.',
        dicas: 'Antes das 8h. Seguir até a vila Okochi Sanso.',
        extras: { horario: H(['manha', 'tarde', 'noite', '24h'], [], ''), ingresso: V(0, null, true), tempoVisita: '45 min', melhorHora: '', comprarAntes: null } },
      { id: 'p4', titulo: 'Dōtonbori', pais: 'jp', cidade: 'osaka', tipo: 'atrativo', lat: 34.6687, lng: 135.5013, pagina: 9,
        descricao: 'Coração da vida noturna de Osaka.',
        dicas: 'Passeio de barco no canal (¥1.200, 20 min) sai do Don Quijote.',
        extras: { horario: H(['tarde', 'noite'], [], ''), ingresso: V(0, null, true), tempoVisita: '', melhorHora: 'Noite', comprarAntes: false } },
      { id: 'p5', titulo: 'Kushikatsu Daruma', pais: 'jp', cidade: 'osaka', tipo: 'restaurante', lat: 34.6519, lng: 135.5063, pagina: 10,
        descricao: 'Espetinhos empanados e fritos, o prato típico de Shinsekai.',
        dicas: 'Regra da casa: não molhar duas vezes no molho comunitário!',
        extras: { horario: null, comida: ['Street food'], preco: V(0, null), pratos: '', reserva: null } },
      { id: 'p6', titulo: 'Takoyaki Wanaka', pais: 'jp', cidade: 'osaka', tipo: 'restaurante', lat: 34.6655, lng: 135.5013, pagina: 10,
        descricao: 'Bolinhos de polvo crocantes por fora e cremosos por dentro.',
        dicas: 'Pedir a versão com maionese e katsuobushi.',
        extras: { horario: H(['manha', 'tarde', 'noite'], [], '10h–23h'), comida: ['Street food'], preco: V(1, 600), pratos: 'Takoyaki 8 unidades', reserva: false } },
      { id: 'p7', titulo: 'Cross Hotel Osaka', pais: 'jp', cidade: 'osaka', tipo: 'hotel', lat: 34.6703, lng: 135.5013, pagina: 11,
        descricao: 'Hotel moderno a 1 minuto do canal de Dōtonbori. Reservas: https://www.crosshotel.com/osaka/en/',
        dicas: 'Quartos de esquina são maiores.',
        extras: { hospedagem: 'Hotel', diaria: V(2, 22000), checkin: { entrada: '15:00', saida: '11:00' }, cafe: null, estacao: 'Namba (5 min a pé)' } },
      { id: 'p8', titulo: 'Trem Kintetsu Osaka → Nara', pais: 'jp', cidade: 'osaka', tipo: 'transporte', lat: 34.6655, lng: 135.4999, pagina: 12,
        descricao: 'Trem expresso da estação Osaka-Namba até Kintetsu-Nara, a 5 minutos do parque.',
        dicas: 'Mais perto do parque que a linha JR.',
        extras: { meio: 'Trem', dePara: { de: 'Osaka-Namba', para: 'Kintetsu-Nara' }, preco: V(1, 680), duracao: '40 min', ondeComprar: 'Suica / ICOCA' } }
    ]
  };

  window.LL_DADOS = { fotos: F, tipos, paises, cidades, lugares, pdfSimulado };
})();
