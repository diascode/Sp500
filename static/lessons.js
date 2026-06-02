// IMPORTANT: This file is loaded AFTER stock-dashboard.html defines CHART_REGISTRY
// Each chart field references a string name that maps to a function in CHART_REGISTRY

window.LESSON_DATA = {

'why': {
  totalSteps: 5,
  sections: [
    {
      icon: '📉', title: 'Seu Dinheiro Está Encolhendo',
      hook: 'Você sabia que o dinheiro parado na sua conta perde valor todo ano, mesmo sem você gastar nada?',
      content: '<p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)">Quando a economia vai mal, bancos centrais criam dinheiro novo — eletronicamente, do nada — e injetam no sistema. Isso aconteceu no mundo inteiro durante a pandemia. No Brasil, a base monetária (M2) cresceu <strong style="color:var(--ink-1)">+68% entre 2019 e 2023</strong>. Mais dinheiro circulando com a mesma quantidade de bens = preços mais altos.</p><p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-4)">A poupança rendeu cerca de <strong style="color:var(--ink-1)">+90%</strong> de 2010 a 2024. Mas a inflação (IPCA) foi de <strong style="color:#ef5350">+104%</strong>. Quem manteve dinheiro na poupança perdeu poder de compra sem perceber.</p><div style="background:#0d0d0d;border:1px solid #2a2a2a;border-radius:8px;padding:14px;margin-bottom:var(--s-3);font-family:var(--font-mono);font-size:12px;line-height:2"><span style="color:#e8a846">R$10.000 guardados em 2010</span><br><span style="color:#ef5350">2024: compra o equivalente a R$4.900 de 2010</span><br><span style="color:#555">O dinheiro estava seguro. O poder de compra, não.</span></div>',
      chart: 'chartRealReturns'
    },
    {
      icon: '🏢', title: 'Isso Não É Jogo — É Ser Dono de Empresa',
      hook: 'Quando você compra uma ação, você não está apostando — você está virando sócio de uma empresa de verdade.',
      content: '<p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)">Uma ação é um pedaço real de uma empresa: ela tem funcionários, fábricas, clientes e receita. Quando você compra PETR4, você se torna sócio da Petrobras. Quando a empresa vai bem, você vai bem também.</p><div style="background:#0d0d0d;border:1px solid #2a2a2a;border-radius:8px;padding:14px;margin-bottom:var(--s-4)"><div style="font-size:11px;color:#666;font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">As 3 objeções mais comuns</div><div style="margin-bottom:10px"><span style="color:#e8a846;font-weight:600">❝ Bolsa é jogo de azar ❞</span><br><span style="font-size:13px;color:var(--ink-3)">Jogo tem valor esperado negativo — a banca sempre ganha. O Ibovespa acumulou +280% em 14 anos. Empresas vendem produtos reais — não são loteria.</span></div><div style="margin-bottom:10px"><span style="color:#e8a846;font-weight:600">❝ Não tenho dinheiro suficiente ❞</span><br><span style="font-size:13px;color:var(--ink-3)">Com ações fracionárias (ex: PETR4F), você pode começar com R$50/mês. Não existe mínimo. A barreira é psicológica, não financeira.</span></div><div><span style="color:#e8a846;font-weight:600">❝ O mercado caiu em 2020 ❞</span><br><span style="font-size:13px;color:var(--ink-3)">Sim — e voltou às máximas históricas em 18 meses. Toda crise da história foi seguida por recuperação. Quem precisou vender na hora errada sofreu; quem ficou quieto, ganhou.</span></div></div><p style="font-size:14px;color:var(--ink-2);line-height:1.7">Pense em imóveis: o Ibovespa historicamente dobra em ~10 anos, igual a um bom imóvel. Mas você vende uma ação em dois minutos com três cliques. Vender um apartamento leva meses de papelada. <strong style="color:var(--ink-1)">Ações são como imóveis que você pode comprar e vender com um clique</strong> — sem escritura, corretor ou financiamento.</p>',
      chart: null
    },
    {
      icon: '💰', title: 'Começar Com Pouco Já Muda Tudo',
      hook: 'Você não precisa ser rico para investir — você precisa investir para não continuar sem dinheiro.',
      content: '<p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)">Na B3, existe um tipo de ação chamada <strong style="color:var(--ink-1)">ação fracionária</strong> — o ticker termina em F (ex: PETR4F, VALE3F). Ela permite comprar menos do que uma ação inteira. Resultado: dá para começar com R$30, R$50, qualquer valor. Não existe mínimo obrigatório.</p><p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)">O segredo dos juros compostos é simples: a diferença de taxa que parece pequena mês a mês vira uma fortuna ao longo de décadas. Veja o que acontece com o mesmo R$500/mês em 25 anos:</p>',
      chart: 'chartCompoundInterest'
    },
    {
      icon: '⏳', title: 'O Custo de Não Fazer Nada',
      hook: 'Não investir também é uma escolha — e ela tem um preço que a maioria nunca calcula.',
      content: '<p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)">As pessoas se preocupam em perder dinheiro investindo. Quase ninguém calcula o custo de não começar. Veja o impacto de esperar apenas 5 ou 10 anos:</p>',
      chart: 'chartCostOfWaiting'
    }
  ],
  quiz: [
    {
      q: 'Você guarda R$10.000 em dinheiro na gaveta em 2010. Em 2024, quanto esse dinheiro vale na prática, levando em conta a inflação?',
      options: ['R$10.000 — o valor não muda, é dinheiro físico', 'R$14.000 — o dinheiro rendeu um pouco parado', 'R$4.900 — a inflação corroeu mais da metade do poder de compra', 'R$8.500 — perdeu um pouco, mas nada grave'],
      correct: 2,
      correctFeedback: 'Exatamente! O IPCA acumulou +104% de 2010 a 2024. Seu dinheiro parado perdeu mais da metade do poder de compra real.',
      wrongFeedback: 'Quase lá! Com o IPCA acumulando +104% em 14 anos, R$10.000 na gaveta equivalem a R$4.900 em poder de compra de 2010.'
    },
    {
      q: 'O que são as chamadas "ações fracionárias" (como PETR4F)?',
      options: ['Ações de empresas que faliram e valem menos', 'Ações que só grandes investidores podem comprar', 'Frações de ações que permitem investir com pouco dinheiro, como R$50', 'Um tipo de fundo de investimento arriscado'],
      correct: 2,
      correctFeedback: 'Isso mesmo! O "F" no final do código indica que é uma fração da ação. Dá para começar com R$50 por mês, sem precisar de grandes quantias.',
      wrongFeedback: 'Faz sentido pensar assim, mas ações fracionárias são uma porta de entrada para quem está começando! O "F" no código significa que você pode comprar uma fração da ação com R$50.'
    },
    {
      q: 'De 2010 a 2024, qual foi o retorno acumulado aproximado do Ibovespa (Bolsa de Valores brasileira)?',
      options: ['+50% — um pouco melhor que a poupança', '+90% — igual à poupança no mesmo período', '−30% — a Bolsa caiu no período por causa das crises', '+280% — bem acima da inflação e da poupança'],
      correct: 3,
      correctFeedback: 'Perfeito! O Ibovespa acumulou cerca de +280% no período, contra +104% do IPCA e +90% da poupança. Quem investiu na Bolsa mais que triplicou o poder de compra.',
      wrongFeedback: 'Pode parecer que a Bolsa perde por causa das crises no noticiário, mas o Ibovespa acumulou +280% de 2010 a 2024 — muito acima da poupança (+90%) e da inflação (+104%).'
    },
    {
      q: 'Em março de 2020, a Bolsa despencou por causa da pandemia. O que aconteceu com quem manteve os investimentos e não vendeu?',
      options: ['Perdeu tudo — a Bolsa nunca se recuperou totalmente', 'Ficou no zero a zero — a Bolsa voltou exatamente ao ponto anterior', 'Recuperou e viu a Bolsa bater novas máximas históricas em 18 meses', 'Precisou esperar 10 anos para recuperar o dinheiro'],
      correct: 2,
      correctFeedback: 'Exatamente! Em menos de 18 meses, o mercado não só se recuperou como atingiu novas máximas. Quem ficou quieto viu o patrimônio crescer.',
      wrongFeedback: 'Quem manteve a calma viu o mercado se recuperar e bater novas máximas em menos de 18 meses. Quem vendeu com medo ficou com o prejuízo no bolso.'
    },
    {
      q: 'Investindo R$500 por mês durante 25 anos, qual é a diferença aproximada entre aplicar em ações (12%/a) versus deixar na poupança (6%/a)?',
      options: ['Cerca de R$100 mil — é uma diferença pequena no longo prazo', 'Cerca de R$593 mil — os juros compostos fazem enorme diferença', 'Cerca de R$200 mil — a diferença existe mas não é tão relevante', 'Cerca de R$1 milhão — a poupança praticamente não rende nada'],
      correct: 1,
      correctFeedback: 'Isso mesmo! R$500/mês por 25 anos a 12%/a chegam a R$940 mil. Na poupança a 6%/a, o resultado seria R$347 mil. Diferença: R$593 mil gerada pelos juros compostos.',
      wrongFeedback: 'Os juros compostos têm um efeito que a gente subestima. R$500/mês por 25 anos a 12%/a chegam a R$940 mil, contra R$347 mil na poupança. A diferença é de R$593 mil.'
    },
    {
      q: 'Por que governos criar mais dinheiro (como aconteceu durante a pandemia) prejudica quem guarda dinheiro parado?',
      options: ['Porque o governo pode confiscar o dinheiro guardado quando imprime mais', 'Porque mais dinheiro em circulação eleva os preços, reduzindo o poder de compra de quem não investe', 'Porque bancos cobram taxas extras quando há muita emissão monetária', 'Porque a criação de dinheiro reduz os juros da poupança automaticamente'],
      correct: 1,
      correctFeedback: 'Perfeito! Mais dinheiro circulando com a mesma quantidade de bens = preços mais altos = inflação. Quem investe em ativos reais tende a se proteger.',
      wrongFeedback: 'O mecanismo principal é: mais dinheiro circulando com a mesma quantidade de bens = preços mais altos = inflação. Quem guarda dinheiro parado perde poder de compra.'
    }
  ]
},

'strategy': {
  totalSteps: 5,
  sections: [
    {
      icon: '🔺',
      title: 'A Pirâmide do Investidor',
      hook: '<em>Construir riqueza é como construir uma casa: você precisa da base antes do telhado.</em>',
      content: '<p>A pirâmide do investidor mostra a ordem certa de montar sua carteira. Na <strong>base</strong> ficam os investimentos mais seguros: Tesouro Direto, CDBs e fundos de renda fixa. São chatos, mas são sua proteção.</p>' +
        '<p>No <strong>meio</strong> vêm as ações diversificadas — ETFs e fundos que investem em várias empresas ao mesmo tempo. No <strong>topo</strong> ficam as apostas individuais em ações específicas, com mais risco e mais potencial de retorno.</p>' +
        '<p>A maioria dos iniciantes começa pelo topo e se machuca. Inverta essa lógica e você já estará à frente de 80% das pessoas.</p>',
      chart: 'chartPyramid'
    },
    {
      icon: '🛡️',
      title: 'Reserva de Emergência Primeiro',
      hook: '<em>Investir sem reserva é como dirigir sem cinto: tudo bem até não ser.</em>',
      content: '<p>Antes de colocar qualquer real na bolsa, você precisa de uma <strong>reserva de emergência</strong>. O padrão são 3 a 6 meses das suas <strong>despesas</strong> — não da sua renda, mas do que você gasta todo mês.</p>' +
        '<p>Essa reserva deve ficar em lugar seguro e com liquidez diária: Tesouro Selic ou CDB com resgate imediato. O objetivo não é render muito, é estar disponível quando você precisar.</p>' +
        '<p>Sem essa reserva, qualquer imprevisto — desemprego, doença, carro quebrado — pode te forçar a vender ações no pior momento possível, no fundo do poço.</p>',
      chart: null
    },
    {
      icon: '📅',
      title: 'Aportes Regulares Vencem Timing',
      hook: '<em>Ninguém sabe o dia certo de comprar — mas todo mês é um bom momento para investir um pouco.</em>',
      content: '<p>A estratégia de <strong>aportes regulares</strong> (conhecida no mundo como Dollar-Cost Averaging) consiste em investir um valor fixo todo mês, independente se o mercado subiu ou caiu.</p>' +
        '<p>Quando o mercado cai, seu dinheiro compra mais cotas. Quando sobe, seu patrimônio cresce. Com o tempo, você automaticamente compra mais barato na média — sem precisar adivinhar o fundo do poço.</p>' +
        '<p>Estudos mostram que investidores regulares superam quem tenta acertar o momento certo de entrar. Consistência bate genialidade na maioria dos casos.</p>',
      chart: null
    },
    {
      icon: '📏',
      title: 'Regras de Ouro da Estratégia',
      hook: '<em>As regras mais importantes não são sobre escolher a ação certa — são sobre não cometer os erros clássicos.</em>',
      content: '<p>Regra 1: <strong>Nunca invista dinheiro que você vai precisar em menos de 2 anos.</strong> A bolsa oscila, e você pode precisar resgatar num momento ruim. Dinheiro com prazo curto fica na renda fixa.</p>' +
        '<p>Regra 2: <strong>Nenhum ativo deve passar de 20% da sua carteira.</strong> Em 2023, quem tinha mais de 20% do patrimônio em Americanas perdeu mais de 70% daquele valor em um único dia. Diversificação não é frescura.</p>' +
        '<p>Regra 3: <strong>Estratégia primeiro, emoção depois.</strong> Defina seu plano antes de olhar o mercado. Quem muda de estratégia todo mês perde para quem mantém a calma.</p>',
      chart: null
    }
  ],
  quiz: [
    {
      q: 'Qual é a base correta da pirâmide do investidor?',
      options: [
        'A. Ações de empresas individuais com alto potencial',
        'B. Investimentos de renda fixa e alta segurança',
        'C. Criptomoedas e ativos internacionais',
        'D. FIIs e fundos multimercado'
      ],
      correct: 1,
      correctFeedback: 'Exato! A base deve ser sólida e segura — Tesouro Direto, CDBs e renda fixa. Isso protege você antes de assumir mais risco.',
      wrongFeedback: 'A base da pirâmide são os investimentos mais seguros: renda fixa, Tesouro Direto e CDBs. Ações individuais ficam no topo, com menor participação.'
    },
    {
      q: 'Quanto tempo de despesas deve ter sua reserva de emergência?',
      options: [
        'A. 1 mês de renda',
        'B. 6 meses de renda',
        'C. 3 a 6 meses de despesas',
        'D. 12 meses de despesas'
      ],
      correct: 2,
      correctFeedback: 'Correto! São 3 a 6 meses de despesas — não de renda. O que importa é cobrir seus gastos mensais em caso de emergência.',
      wrongFeedback: 'A reserva certa é de 3 a 6 meses das suas despesas mensais, não da renda. Pense no que você gasta, não no que ganha.'
    },
    {
      q: 'Onde deve ficar sua reserva de emergência?',
      options: [
        'A. Em ações de empresas sólidas como Petrobras',
        'B. Em imóveis, pois valorizam com o tempo',
        'C. Em Tesouro Selic ou CDB com resgate imediato',
        'D. Em dólar para proteção cambial'
      ],
      correct: 2,
      correctFeedback: 'Isso mesmo! Tesouro Selic e CDB com liquidez diária são os melhores lugares — seguros, disponíveis a qualquer hora e ainda rendem.',
      wrongFeedback: 'Reserva de emergência precisa de liquidez imediata. Ações e imóveis não servem — podem estar em baixa quando você precisar. Use Tesouro Selic ou CDB com resgate no mesmo dia.'
    },
    {
      q: 'O que é a estratégia de aportes regulares (DCA)?',
      options: [
        'A. Comprar muito quando o mercado cai e vender quando sobe',
        'B. Investir um valor fixo todo mês independente do mercado',
        'C. Concentrar investimentos no melhor mês do ano',
        'D. Guardar dinheiro e comprar tudo de uma vez no fundo do mercado'
      ],
      correct: 1,
      correctFeedback: 'Perfeito! DCA significa investir regularmente, sempre o mesmo valor. Assim você compra mais cotas quando o preço cai, reduzindo seu custo médio automaticamente.',
      wrongFeedback: 'DCA é simples: invista um valor fixo todo mês, sem tentar adivinhar o melhor momento. A regularidade é o que faz a diferença no longo prazo.'
    },
    {
      q: 'Por que nenhum ativo deve passar de 20% da carteira?',
      options: [
        'A. É uma exigência legal da CVM para pessoas físicas',
        'B. Para pagar menos imposto de renda',
        'C. Porque concentração em um ativo aumenta muito o risco de perda grande',
        'D. Porque ETFs exigem diversificação mínima por lei'
      ],
      correct: 2,
      correctFeedback: 'Exato! Concentrar mais de 20% em um ativo é perigoso. O caso Americanas mostrou que até empresas grandes podem desabar — diversificação limita o estrago.',
      wrongFeedback: 'A regra dos 20% existe para proteger você. Se um ativo representa 40% da carteira e cai 70% (como Americanas em 2023), você perde 28% do patrimônio total de uma vez.'
    },
    {
      q: 'Quando é adequado investir dinheiro na bolsa de valores?',
      options: [
        'A. Sempre que sobrar dinheiro no final do mês',
        'B. Apenas quando o mercado está em alta',
        'C. Somente com dinheiro que você não precisará por pelo menos 2 anos',
        'D. Assim que você receber qualquer renda extra'
      ],
      correct: 2,
      correctFeedback: 'Correto! A bolsa oscila e você pode ter que esperar para vender num bom momento. Dinheiro que você pode precisar em breve deve ficar fora da renda variável.',
      wrongFeedback: 'Investir na bolsa exige paciência. Só coloque dinheiro que você não vai precisar por pelo menos 2 anos — caso contrário, pode ser forçado a vender na baixa.'
    }
  ]
},

'diversify': {
  totalSteps: 5,
  sections: [
    {
      icon: '📉',
      title: 'Por Que Diversificar?',
      hook: '<em>Colocar todos os ovos numa cesta não é estratégia — é aposta.</em>',
      content: '<p>Diversificação é a única estratégia de investimento que <strong>reduz o risco sem necessariamente reduzir o retorno</strong>. Isso acontece porque diferentes ativos não caem ao mesmo tempo pelos mesmos motivos.</p>' +
        '<p>Quando a Petrobras cai por causa do petróleo, o Itaú pode estar subindo por causa dos juros. Quando o Brasil passa por crise política, ações internacionais continuam gerando retorno em dólar. Isso é <strong>correlação baixa</strong> trabalhando a seu favor.</p>' +
        '<p>A matemática é clara: uma carteira com 10 ações diversificadas tem muito menos risco do que uma carteira com 1 ação — mesmo que as 10 tenham o mesmo retorno esperado individualmente.</p>',
      chart: 'chartDiversificationRisk'
    },
    {
      icon: '🧩',
      title: 'Classes de Ativos',
      hook: '<em>Uma carteira equilibrada tem ingredientes diferentes — cada um com um papel específico.</em>',
      content: '<p><strong>Renda fixa</strong> (Tesouro, CDBs, LCIs): é a ancora da carteira. Protege do risco, rende de forma previsível e é onde fica sua reserva. No Brasil, com Selic alta, rende muito bem.</p>' +
        '<p><strong>Ações</strong>: maior potencial de crescimento no longo prazo, mas com volatilidade. Prefira ETFs como BOVA11 no começo — diversificação imediata com baixo custo. <strong>FIIs</strong> (Fundos Imobiliários) distribuem aluguéis mensais e são isentos de IR para pessoa física.</p>' +
        '<p><strong>Internacional</strong>: protege contra desvalorização do real e crise política local. BDRs e ETFs internacionais como IVVB11 dão exposição ao S&P 500 sem precisar abrir conta no exterior.</p>',
      chart: 'chartPieAllocation'
    },
    {
      icon: '🏭',
      title: 'Diversificação por Setor',
      hook: '<em>Se todos os seus investimentos dependem do mesmo fator, você não está diversificado — só tem a ilusão disso.</em>',
      content: '<p>Dentro de ações brasileiras, os setores mais comuns são: <strong>Financeiro</strong> (bancos), <strong>Energia</strong> (Petrobras, utilities), <strong>Mineração</strong> (Vale), <strong>Varejo</strong>, <strong>Saúde</strong> e <strong>Tecnologia</strong>.</p>' +
        '<p>A regra prática: <strong>nenhum setor deve passar de 30% da parcela de ações</strong>. Quem tem 50% em bancos está exposto ao risco regulatório do setor financeiro. Quem tem 50% em commodities depende do preço do petróleo e minério.</p>' +
        '<p>Setores que tendem a se movimentar de forma diferente: bancos e varejo reagem a juros, energia reage a commodities globais, saúde é mais defensiva. Ter os três já é um bom começo.</p>',
      chart: null
    },
    {
      icon: '⚠️',
      title: 'Erros Comuns',
      hook: '<em>Os erros de diversificação mais perigosos são os que parecem diversificação, mas não são.</em>',
      content: '<p><strong>Erro 1: Concentrar em 1 ação.</strong> Comprar apenas PETR4 porque "é Petrobras, não vai à falência" ignora o risco de intervenção política, variação do petróleo e câmbio. Nenhuma empresa é invencível — Americanas provou isso.</p>' +
        '<p><strong>Erro 2: Só Brasil.</strong> Investir 100% em ativos brasileiros expõe você ao risco cambial (real desvaloriza), político e econômico local. Uma crise de confiança no Brasil afeta toda a carteira de uma vez.</p>' +
        '<p><strong>Erro 3: Só renda fixa.</strong> Com inflação, dinheiro parado perde poder de compra. Renda fixa é segura, mas no longo prazo as ações tendem a superar a inflação com mais folga. Equilíbrio é a chave.</p>',
      chart: null
    }
  ],
  quiz: [
    {
      q: 'O que significa dizer que dois ativos têm "baixa correlação"?',
      options: [
        'A. Os dois rendem pouco e têm baixo risco',
        'B. Eles não costumam subir e cair ao mesmo tempo pelos mesmos motivos',
        'C. São emitidos pelo mesmo banco ou gestora',
        'D. Têm o mesmo prazo de vencimento'
      ],
      correct: 1,
      correctFeedback: 'Exato! Baixa correlação significa que os ativos reagem de forma diferente a eventos do mercado. Isso é o que faz a diversificação funcionar de verdade.',
      wrongFeedback: 'Correlação mede se dois ativos sobem e caem juntos. Baixa correlação significa que eles se movem de forma independente — exatamente o que protege sua carteira.'
    },
    {
      q: 'O que são FIIs (Fundos de Investimento Imobiliário)?',
      options: [
        'A. Fundos que investem em ações de construtoras',
        'B. Fundos que compram e vendem imóveis fisicamente para obter lucro',
        'C. Fundos que investem em imóveis e distribuem aluguéis mensais aos cotistas',
        'D. Seguros imobiliários que protegem contra desvalorização'
      ],
      correct: 2,
      correctFeedback: 'Correto! FIIs investem em imóveis (shoppings, galpões, lajes) e repassam os aluguéis mensalmente. Para pessoas físicas, esses rendimentos são isentos de IR.',
      wrongFeedback: 'FIIs (Fundos Imobiliários) são fundos negociados na bolsa que investem em imóveis reais e distribuem os aluguéis mensalmente para os cotistas, com isenção de IR para pessoa física.'
    },
    {
      q: 'Qual é o limite recomendado para um único setor dentro da parcela de ações?',
      options: [
        'A. No máximo 10%',
        'B. No máximo 20%',
        'C. No máximo 30%',
        'D. No máximo 50%'
      ],
      correct: 2,
      correctFeedback: 'Isso mesmo! Manter cada setor abaixo de 30% evita que uma crise específica de um segmento destrua sua carteira inteira.',
      wrongFeedback: 'A recomendação é que nenhum setor ultrapasse 30% da parcela de ações. Acima disso, uma crise setorial — como regulação bancária ou queda de commodities — causa estrago desproporcional.'
    },
    {
      q: 'Por que investir apenas em ativos brasileiros é um risco?',
      options: [
        'A. Porque a B3 cobra taxas muito altas de custódia',
        'B. Porque ações brasileiras rendem menos do que as americanas sempre',
        'C. Porque você fica exposto ao risco cambial, político e econômico do Brasil sem proteção',
        'D. Porque a CVM proíbe carteiras 100% nacionais'
      ],
      correct: 2,
      correctFeedback: 'Exato! Carteira 100% brasileira significa que uma crise política, desvalorização do real ou recessão local afeta tudo de uma vez. Diversificação geográfica distribui esse risco.',
      wrongFeedback: 'Investir só no Brasil expõe você a três riscos ao mesmo tempo: desvalorização do real (câmbio), instabilidade política e crises econômicas locais. Ativos internacionais protegem contra esses cenários.'
    },
    {
      q: 'O que é o BOVA11?',
      options: [
        'A. Um título do Tesouro indexado ao IBOVESPA',
        'B. Um ETF que replica o Índice Bovespa, dando exposição a cerca de 80 ações de uma vez',
        'C. Um fundo imobiliário focado em galpões logísticos',
        'D. Um BDR que permite comprar ações americanas no Brasil'
      ],
      correct: 1,
      correctFeedback: 'Correto! BOVA11 é um ETF que segue o IBOVESPA. Com uma única cota, você investe indiretamente em cerca de 80 empresas brasileiras — diversificação imediata e barata.',
      wrongFeedback: 'BOVA11 é um ETF (fundo de índice) negociado na B3 que replica o IBOVESPA. É uma forma simples e barata de ter exposição diversificada a dezenas de ações brasileiras de uma vez.'
    },
    {
      q: 'Por que manter tudo em renda fixa no longo prazo pode ser problemático?',
      options: [
        'A. Porque CDBs e Tesouro Direto têm risco de crédito muito alto',
        'B. Porque a inflação corrói o poder de compra e a renda fixa pode não superar isso no longo prazo',
        'C. Porque a CVM exige que investidores tenham pelo menos 30% em ações',
        'D. Porque renda fixa tem liquidez muito baixa e você não consegue resgatar'
      ],
      correct: 1,
      correctFeedback: 'Exato! No longo prazo, a inflação come o poder de compra. Embora renda fixa seja segura, as ações historicamente superam a inflação com mais margem. Equilíbrio é fundamental.',
      wrongFeedback: 'O problema da renda fixa no longo prazo é a inflação. Se o seu investimento rende 10% ao ano mas a inflação é 8%, seu ganho real é apenas 2%. Ações tendem a superar a inflação com mais folga no longo prazo.'
    }
  ]
},

'brazilstats': {
  totalSteps: 5,
  sections: [
    {
      icon: '🇧🇷',
      title: 'O Mercado Brasileiro',
      hook: '<em>O Brasil tem uma das bolsas mais antigas das Américas — e características únicas que todo investidor precisa entender.</em>',
      content: '<p>A <strong>B3</strong> (Brasil, Bolsa, Balcão) é a única bolsa de valores do Brasil, sediada em São Paulo. É a maior da América Latina e uma das 20 maiores do mundo em valor de mercado. Todos os ativos — ações, FIIs, ETFs, BDRs — são negociados em um único lugar.</p>' +
        '<p>O <strong>IBOVESPA</strong> é o principal índice da B3, composto pelas ações mais negociadas. Funciona como um termômetro da bolsa brasileira. Quando o IBOV sobe, em geral o humor do mercado é positivo — e vice-versa.</p>' +
        '<p>A <strong>CVM</strong> (Comissão de Valores Mobiliários) é o regulador, equivalente à SEC americana. Ela supervisiona empresas abertas, fundos e corretoras para proteger o investidor.</p>',
      chart: null
    },
    {
      icon: '📊',
      title: 'Brasil vs Mundo: Os Números',
      hook: '<em>Comparar o Brasil com os EUA parece simples — mas o câmbio muda tudo.</em>',
      content: '<p>De 2010 a 2024, o <strong>IBOVESPA subiu cerca de 280% em reais</strong>. Parece ótimo — até você comparar com o <strong>S&P 500, que subiu cerca de 500% em dólares</strong> no mesmo período.</p>' +
        '<p>O problema: o real se desvalorizou fortemente frente ao dólar nesse período. Para um brasileiro, o retorno real do IBOV foi ainda menor em termos de poder de compra internacional. A inflação brasileira também corrói parte do ganho nominal.</p>' +
        '<p>Isso não significa que o Brasil é mau investimento — significa que a <strong>taxa de câmbio e a inflação</strong> são variáveis críticas que o investidor brasileiro precisa considerar ao comparar mercados.</p>',
      chart: 'chartIbovVsSP500'
    },
    {
      icon: '🏦',
      title: 'Características Únicas do Brasil',
      hook: '<em>O Brasil tem uma taxa de juros entre as mais altas do mundo — e isso muda completamente a lógica de investir.</em>',
      content: '<p>A <strong>Selic</strong> é a taxa básica de juros do Brasil, definida pelo COPOM. Em 2023 chegou a 13,75% ao ano — uma das mais altas do mundo. Isso significa que <strong>a renda fixa brasileira é excepcionalmente rentável</strong>, ao contrário de países onde os juros são próximos de zero.</p>' +
        '<p>Com Selic alta, investir em ações precisa fazer ainda mais sentido, porque a renda fixa já paga bem. Isso eleva o padrão de retorno exigido para que valha a pena assumir o risco da bolsa.</p>' +
        '<p>Outro ponto: o <strong>IBOVESPA é altamente concentrado</strong>. Petrobras e Vale juntas representam cerca de 25% do índice, e os 5 maiores bancos somam outros 30%. Quem compra apenas BOVA11 não está tão diversificado quanto imagina — está apostando pesado em commodities e bancos.</p>',
      chart: null
    },
    {
      icon: '💡',
      title: 'Oportunidades Específicas do Brasil',
      hook: '<em>O mercado brasileiro tem ativos que simplesmente não existem em outros países — e que podem ser grandes aliados da sua carteira.</em>',
      content: '<p>Os <strong>FIIs (Fundos Imobiliários)</strong> são um grande diferencial brasileiro. Permitem investir em shoppings, galpões logísticos, hospitais e lajes corporativas com pouco dinheiro, recebendo aluguéis mensais isentos de IR. É um mercado grande, líquido e acessível.</p>' +
        '<p>As <strong>small caps brasileiras</strong> são empresas menores, fora do IBOVESPA, que muitas vezes crescem mais rápido e são menos acompanhadas por analistas — criando oportunidades para quem pesquisa. Mais risco, mas potencial de retorno maior.</p>' +
        '<p>Empresas pagadoras de <strong>dividendos</strong> como Itaú, Taesa e Engie distribuem parte do lucro regularmente. No Brasil, dividendos de ações são isentos de IR para pessoa física — uma vantagem fiscal que torna esses papéis ainda mais atrativos.</p>',
      chart: null
    }
  ],
  quiz: [
    {
      q: 'Como se chama a única bolsa de valores do Brasil?',
      options: [
        'A. BOVESPA',
        'B. CVM',
        'C. B3',
        'D. SELIC'
      ],
      correct: 2,
      correctFeedback: 'Correto! A B3 (Brasil, Bolsa, Balcão) é a única bolsa do Brasil, criada em 2017 pela fusão da BM&FBovespa com a Cetip.',
      wrongFeedback: 'A bolsa de valores do Brasil se chama B3, criada pela fusão da BM&FBovespa com a Cetip. BOVESPA foi o nome antigo, CVM é o regulador e Selic é a taxa de juros.'
    },
    {
      q: 'O que é a Selic e qual era seu patamar em 2023?',
      options: [
        'A. O índice da bolsa brasileira, em 280% no período',
        'B. A taxa básica de juros do Brasil, que chegou a 13,75% ao ano',
        'C. A taxa de câmbio oficial do real frente ao dólar',
        'D. O índice de inflação oficial medido pelo IBGE'
      ],
      correct: 1,
      correctFeedback: 'Exato! A Selic é a taxa básica de juros do Brasil, definida pelo COPOM. Em 2023 chegou a 13,75% — uma das mais altas do mundo, tornando a renda fixa muito atraente.',
      wrongFeedback: 'A Selic é a taxa básica de juros do Brasil, definida pelo COPOM (Comitê de Política Monetária). Em 2023 chegou a 13,75% ao ano — isso torna a renda fixa brasileira muito rentável comparada a outros países.'
    },
    {
      q: 'Por que a Selic alta impacta a atratividade das ações?',
      options: [
        'A. Porque impede empresas de abrir capital na B3',
        'B. Porque a renda fixa rende bem, então as ações precisam entregar retorno ainda maior para valer o risco',
        'C. Porque a CVM proíbe comprar ações quando a Selic está acima de 10%',
        'D. Porque juros altos sempre causam queda de todos os setores da bolsa'
      ],
      correct: 1,
      correctFeedback: 'Perfeito! Com Selic alta, a renda fixa já paga bem sem risco. Para justificar o risco das ações, o retorno esperado precisa ser ainda maior — o que eleva o padrão de exigência.',
      wrongFeedback: 'Com Selic alta, a renda fixa se torna muito atraente. Isso significa que investir em ações só faz sentido se o retorno esperado for bem superior — afinal, por que assumir risco se a renda fixa já paga bem?'
    },
    {
      q: 'Qual é o risco de concentração do IBOVESPA que os investidores devem conhecer?',
      options: [
        'A. O índice inclui apenas empresas estrangeiras listadas no Brasil',
        'B. Petrobras e Vale representam cerca de 25% do índice, e bancos somam mais 30%',
        'C. O IBOV só possui ações do setor de tecnologia e telecomunicações',
        'D. O índice é rebalanceado diariamente, causando alta rotatividade de ativos'
      ],
      correct: 1,
      correctFeedback: 'Correto! Petrobras e Vale juntas somam cerca de 25% do IBOV, e os grandes bancos acrescentam mais 30%. Quem compra BOVA11 está muito exposto a commodities e setor financeiro.',
      wrongFeedback: 'O IBOVESPA tem alta concentração: Petrobras e Vale representam cerca de 25% do índice, e os maiores bancos somam outros 30%. Isso significa que o índice não é tão diversificado quanto parece.'
    },
    {
      q: 'Qual é a vantagem fiscal dos FIIs e dos dividendos de ações para pessoa física?',
      options: [
        'A. Não há vantagem — ambos são tributados em 27,5% como renda comum',
        'B. Ambos são isentos de Imposto de Renda para pessoa física',
        'C. FIIs são isentos, mas dividendos de ações pagam 15% de IR',
        'D. Dividendos são isentos, mas FIIs pagam 20% de IR na fonte'
      ],
      correct: 1,
      correctFeedback: 'Exato! Tanto os rendimentos de FIIs quanto os dividendos de ações são isentos de IR para pessoa física no Brasil. Essa é uma vantagem fiscal importante e exclusiva do nosso mercado.',
      wrongFeedback: 'No Brasil, tanto os rendimentos mensais de FIIs quanto os dividendos pagos por ações são isentos de Imposto de Renda para pessoa física. Essa isenção é um grande diferencial do mercado brasileiro.'
    },
    {
      q: 'Por que comparar o retorno do IBOVESPA com o do S&P 500 diretamente pode ser enganoso?',
      options: [
        'A. Porque o S&P 500 inclui empresas brasileiras em sua composição',
        'B. Porque o IBOV é calculado em reais e o S&P em dólares, e o real se desvalorizou muito no período',
        'C. Porque os dois índices usam metodologias de cálculo completamente incompatíveis',
        'D. Porque o S&P 500 não distribui dividendos, enquanto o IBOV distribui'
      ],
      correct: 1,
      correctFeedback: 'Correto! O IBOV sobe em reais, mas o real perdeu valor frente ao dólar ao longo dos anos. Para comparar com o S&P 500 de forma justa, é preciso ajustar pelo câmbio e pela inflação.',
      wrongFeedback: 'Comparar IBOV e S&P 500 diretamente ignora o câmbio. O IBOV sobe em reais, enquanto o S&P sobe em dólares. Como o real se desvalorizou muito frente ao dólar desde 2010, o ganho real do investidor brasileiro foi menor do que parece.'
    }
  ]
},

'sectors': {
  totalSteps: 5,
  sections: [
    {
      icon: '🏭',
      title: 'Os Grandes Setores da B3',
      hook: 'A bolsa brasileira não é uma coisa só — ela é dividida em setores com comportamentos completamente diferentes.',
      content: '<p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)">A B3 agrupa empresas por setor. Os principais são: <strong style="color:var(--ink-1)">Financeiro</strong> (Itaú, Bradesco, Nubank), <strong style="color:var(--ink-1)">Petróleo e Gás</strong> (Petrobras), <strong style="color:var(--ink-1)">Mineração</strong> (Vale), <strong style="color:var(--ink-1)">Varejo</strong> (Magalu), <strong style="color:var(--ink-1)">Utilities</strong> (Eletrobras), <strong style="color:var(--ink-1)">Saúde</strong> (Hapvida) e <strong style="color:var(--ink-1)">Tecnologia</strong> (Totvs).</p><p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)">Cada setor reage de forma diferente à economia: quando o dólar sobe, Petrobras e Vale lucram mais. Quando o juros sobem, o financeiro se beneficia. Entender setores é entender o mapa da bolsa.</p><p style="font-size:14px;color:var(--ink-2);line-height:1.7">O gráfico ao lado mostra o peso de cada setor no índice Ibovespa. Dois setores — commodities e bancos — dominam mais da metade da bolsa brasileira.</p>',
      chart: 'chartSectorWeights'
    },
    {
      icon: '🔄',
      title: 'Cíclicos vs Defensivos',
      hook: 'Alguns setores caem muito em crise — outros quase não sentem. Saber a diferença pode salvar seu patrimônio.',
      content: '<p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)"><strong style="color:#ef5350">Setores cíclicos</strong> dependem do crescimento da economia: varejo, construção civil, turismo. Quando a renda cai e o crédito aperta, essas empresas sofrem primeiro. Magazine Luiza caiu 95% de 2021 a 2023 exatamente por isso.</p><p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)"><strong style="color:#4caf50">Setores defensivos</strong> vendem o que as pessoas precisam mesmo em crise: energia elétrica, saneamento, saúde, alimentos. Eletrobras e Hapvida continuam faturando mesmo quando a economia trava.</p><p style="font-size:14px;color:var(--ink-2);line-height:1.7">A regra prática: em recessão, reduza cíclicos e aumente defensivos. Em expansão econômica, cíclicos tendem a subir muito mais rápido.</p>',
      chart: null
    },
    {
      icon: '⚖️',
      title: 'Concentração do Ibovespa',
      hook: 'Quem compra um ETF do Ibovespa pensando em diversificar pode estar mais concentrado do que imagina.',
      content: '<p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)">O Ibovespa tem um problema escondido: <strong style="color:var(--ink-1)">Petrobras e Vale sozinhas representam cerca de 25% do índice</strong>. Somando os grandes bancos, você chega perto de 55% do índice concentrado em apenas dois setores — commodities e financeiro.</p><p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)">Isso significa que o Ibovespa sobe e cai muito com o preço do petróleo, do minério de ferro e com o câmbio do dólar. Se o dólar cair e a China desacelerar, o índice sente muito.</p><p style="font-size:14px;color:var(--ink-2);line-height:1.7">Não é errado ter Ibovespa — mas é importante <strong style="color:var(--ink-1)">saber o que você está comprando</strong>. Diversificar entre setores reduz esse risco de concentração.</p>',
      chart: null
    },
    {
      icon: '🎯',
      title: 'Como Usar os Setores na Prática',
      hook: 'Você não precisa comprar ações de todos os setores — precisa entender em qual ciclo econômico estamos.',
      content: '<p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)">Uma carteira bem diversificada por setores tende a ser mais estável. A regra básica: <strong style="color:var(--ink-1)">não coloque mais de 25-30% da carteira em um único setor</strong>. Se você já tem muito banco, pense em saúde ou utilities para equilibrar.</p><p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)">A <strong style="color:var(--ink-1)">rotação setorial</strong> acontece quando investidores migram de um setor para outro conforme o ciclo econômico muda. O Momentum mostra o gráfico de rotação para você identificar quais setores estão ganhando força agora.</p><p style="font-size:14px;color:var(--ink-2);line-height:1.7">Pense nos setores como grupos de amigos com personalidades diferentes. Em dias bons, os agitados (cíclicos) brilham. Em dias ruins, os calmos (defensivos) seguram o barco.</p>',
      chart: 'chartSectorRotation'
    }
  ],
  quiz: [
    {
      q: 'Qual das empresas abaixo pertence ao setor de Mineração na B3?',
      options: ['A. Itaú Unibanco (ITUB4)', 'B. Vale (VALE3)', 'C. Hapvida (HAPV3)', 'D. Totvs (TOTS3)'],
      correct: 1,
      correctFeedback: 'Exato! Vale (VALE3) é a maior mineradora do Brasil e uma das maiores do mundo, sendo referência do setor de mineração na B3.',
      wrongFeedback: 'A resposta certa é Vale (VALE3), a maior mineradora do Brasil. Itaú é banco, Hapvida é saúde e Totvs é tecnologia.'
    },
    {
      q: 'Por que uma pessoa que investe no Ibovespa via ETF está indiretamente exposta ao preço do dólar?',
      options: ['A. Porque ETFs são cotados em dólar automaticamente', 'B. Porque Petrobras e Vale têm receitas em dólar e pesam ~25% do índice', 'C. Porque o governo brasileiro atrelou o Ibovespa ao câmbio', 'D. Porque todos os setores da B3 dependem de importações'],
      correct: 1,
      correctFeedback: 'Perfeito! Petrobras e Vale representam ~25% do Ibovespa e faturam em dólar. Quando o dólar sobe, essas empresas lucram mais, puxando o índice.',
      wrongFeedback: 'A resposta correta é B. Petrobras e Vale têm receitas em dólar e pesam ~25% do Ibovespa, criando exposição cambial indireta para quem investe no índice.'
    },
    {
      q: 'Em um período de recessão econômica, qual setor tende a sofrer menos?',
      options: ['A. Varejo', 'B. Construção civil', 'C. Utilities (energia elétrica, saneamento)', 'D. Turismo e lazer'],
      correct: 2,
      correctFeedback: 'Correto! Utilities como energia elétrica e saneamento são setores defensivos — as pessoas continuam pagando a conta de luz mesmo em crise.',
      wrongFeedback: 'A resposta é Utilities (C). Varejo, construção e turismo são cíclicos e sofrem muito em recessão. Energia e saneamento são essenciais e continuam sendo pagos.'
    },
    {
      q: 'O que é "rotação setorial" no mercado de ações?',
      options: ['A. Quando uma empresa muda de setor na B3', 'B. Quando investidores vendem ações de um setor e compram de outro conforme o ciclo econômico', 'C. A troca de gestores nos fundos de investimento', 'D. A variação diária de preços dentro do mesmo setor'],
      correct: 1,
      correctFeedback: 'Isso mesmo! Rotação setorial é quando o dinheiro dos investidores migra de setores que estavam bem para os que estão ganhando força no novo ciclo econômico.',
      wrongFeedback: 'Rotação setorial (B) é quando investidores movem capital entre setores conforme o ciclo econômico muda — por exemplo, saindo de cíclicos e entrando em defensivos antes de uma recessão.'
    },
    {
      q: 'Qual é a principal limitação de investir apenas no Ibovespa para ter diversificação?',
      options: ['A. O Ibovespa tem poucas empresas, apenas 10', 'B. O Ibovespa é concentrado em commodities e bancos, que somam mais de 50% do índice', 'C. O Ibovespa não inclui empresas de tecnologia', 'D. O Ibovespa só pode ser comprado por investidores profissionais'],
      correct: 1,
      correctFeedback: 'Exato! Commodities (Petrobras + Vale ~25%) e bancos (~30%) dominam o Ibovespa. Comprar apenas o índice significa apostar muito nesses dois setores.',
      wrongFeedback: 'A resposta é B. O Ibovespa tem dezenas de empresas, mas é muito concentrado: commodities e bancos somam mais de 50% do peso. Isso não é diversificação real entre setores.'
    },
    {
      q: 'Uma carteira tem 60% do dinheiro em ações de bancos. Qual é o principal risco dessa concentração setorial?',
      options: ['A. Nenhum — bancos são sempre seguros e nunca caem', 'B. Risco cambial, pois bancos dependem do dólar', 'C. Se o setor financeiro sofrer (alta de inadimplência, regulação), toda a carteira sofre junto', 'D. O banco pode cancelar as ações a qualquer momento'],
      correct: 2,
      correctFeedback: 'Correto! Concentrar 60% em um setor significa que qualquer problema específico daquele setor vai prejudicar a maior parte do seu patrimônio.',
      wrongFeedback: 'A resposta é C. Concentração setorial cria risco específico: se o setor bancário sofrer com inadimplência alta ou mudanças regulatórias, 60% da sua carteira vai sentir o impacto direto.'
    }
  ]
},

'realcases': {
  totalSteps: 5,
  sections: [
    {
      icon: '📚',
      title: 'O Que os Casos Ensinam',
      hook: 'Nenhum livro ensina mais sobre investimento do que estudar o que aconteceu de verdade com empresas reais.',
      content: '<p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)">A história da bolsa brasileira é cheia de casos extremos: empresas que multiplicaram por 10, empresas que subiram 1.000% e depois perderam quase tudo, e fraudes que destruíram o patrimônio de milhares de pessoas.</p><p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)">Estudar casos reais tem um objetivo prático: <strong style="color:var(--ink-1)">reconhecer padrões antes que eles te atinjam</strong>. Todo erro já foi cometido antes. Toda euforia já virou pânico antes. Quem conhece a história tem uma vantagem enorme.</p><p style="font-size:14px;color:var(--ink-2);line-height:1.7">Vamos ver quatro casos da B3 que ensinam lições que valem mais do que qualquer análise técnica: Vale, Localiza, Americanas e Magazine Luiza.</p>',
      chart: null
    },
    {
      icon: '⛏️',
      title: 'O Caso Vale — O Poder dos Dividendos',
      hook: 'Vale (VALE3) mostrou que uma empresa pode te pagar bem mesmo quando o mercado está difícil.',
      content: '<p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)">A Vale é uma das maiores mineradoras do mundo. Durante o superciclo das commodities — quando a China crescia forte e demandava minério de ferro — a Vale distribuiu dividendos extraordinários. Em alguns anos, o <strong style="color:var(--ink-1)">dividend yield passou de 10% ao ano</strong>, muito acima da poupança.</p><p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)">A lição da Vale é sobre <strong style="color:var(--ink-1)">entender o ciclo do negócio</strong>: quando o preço do minério sobe, o lucro da Vale explode e os dividendos aumentam. Quando o preço cai, a ação também cai. Quem sabe disso não é pego de surpresa.</p><p style="font-size:14px;color:var(--ink-2);line-height:1.7">Mas há riscos reais: Mariana (2015) e Brumadinho (2019) mostraram que empresas de mineração carregam riscos ambientais e de reputação que podem pesar na ação por anos.</p>',
      chart: null
    },
    {
      icon: '🚨',
      title: 'O Caso Americanas — Quando Tudo Dá Errado',
      hook: 'Em janeiro de 2023, a Americanas anunciou uma "inconsistência contábil" de R$20 bilhões. A ação foi de R$40 para R$0,50.',
      content: '<p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)">A Americanas era uma empresa conhecida por todos os brasileiros, com décadas de história. Em 2022, a ação era negociada a R$40. Em janeiro de 2023, a gestão anunciou uma fraude contábil de R$20 bilhões. Em dias, a ação despencou para R$0,50 — uma perda de <strong style="color:#ef5350">mais de 98%</strong>.</p><p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)">Esse caso ensina duas lições brutais. Primeira: <strong style="color:var(--ink-1)">nunca coloque mais de 5-10% do patrimônio em uma única ação</strong>. Quem tinha 30% ou 50% em Americanas perdeu uma parte enorme do que tinha. Segunda: balanços contábeis precisam ser lidos e questionados.</p><p style="font-size:14px;color:var(--ink-2);line-height:1.7">Não existe empresa "segura demais para cair". Qualquer ação individual carrega risco de fraude, má gestão ou mudança de mercado. O tamanho da posição é sua principal proteção.</p>',
      chart: null
    },
    {
      icon: '🏆',
      title: 'Lições Práticas para Você',
      hook: 'Esses casos não são histórias do passado — são manuais de sobrevivência para quem investe hoje.',
      content: '<p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)">As quatro lições que ficam desses casos: <strong style="color:var(--ink-1)">(1) Position sizing é tudo</strong> — nenhuma ação deve representar mais de 5-10% da carteira. Uma fraude como Americanas não destrói sua carteira se ela era só 5% dela. <strong style="color:var(--ink-1)">(2) Entenda o que você está comprando</strong> — Vale depende do preço do minério. Magalu dependia do crédito fácil e do e-commerce em alta.</p><p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)"><strong style="color:var(--ink-1)">(3) Euforia é um sinal de alerta</strong> — quando todos falam de uma ação e o preço subiu muito, o risco de correção é alto. Magalu subiu 1.800% de 2016 a 2020, depois caiu 95%. <strong style="color:var(--ink-1)">(4) Due diligence importa</strong> — pesquise o modelo de negócio, o endividamento e a gestão antes de investir.</p><p style="font-size:14px;color:var(--ink-2);line-height:1.7">O Momentum identifica sinais técnicos, mas o trabalho de entender o negócio é sempre do investidor. Use as ferramentas como ponto de partida, não como resposta final.</p>',
      chart: null
    }
  ],
  quiz: [
    {
      q: 'O que aconteceu com a ação da Americanas (AMER3) em janeiro de 2023?',
      options: ['A. A empresa anunciou a maior expansão da sua história', 'B. A ação subiu 98% após resultados recordes', 'C. A empresa revelou fraude contábil de R$20 bilhões e a ação caiu de R$40 para R$0,50', 'D. A Americanas foi comprada por uma empresa estrangeira'],
      correct: 2,
      correctFeedback: 'Exato! A fraude contábil de R$20 bilhões destruiu a confiança dos investidores. A ação perdeu mais de 98% do valor em poucos dias.',
      wrongFeedback: 'A resposta é C. A Americanas revelou uma fraude contábil de R$20 bilhões em janeiro de 2023, fazendo a ação colapsar de R$40 para R$0,50 — uma perda de mais de 98%.'
    },
    {
      q: 'Qual é a principal lição do caso Americanas para um investidor individual?',
      options: ['A. Nunca investir em empresas de varejo', 'B. Nenhuma ação deve representar mais de 5-10% da carteira — concentração aumenta o risco de ruína', 'C. Sempre vender ações antes do fim do ano', 'D. Só investir em empresas que existem há mais de 50 anos'],
      correct: 1,
      correctFeedback: 'Isso mesmo! Se a Americanas era 5% da sua carteira, a perda foi de 5%. Se era 50%, foi catastrófico. Position sizing é sua principal proteção.',
      wrongFeedback: 'A lição principal é B: position sizing. Mesmo com due diligence perfeita, fraudes acontecem. Limitar cada ação a 5-10% da carteira protege você do pior cenário.'
    },
    {
      q: 'Por que os dividendos da Vale (VALE3) podem variar muito de um ano para o outro?',
      options: ['A. Porque a Vale decide aleatoriamente quanto pagar a cada ano', 'B. Porque o lucro da Vale depende do preço do minério de ferro, que oscila com a demanda global', 'C. Porque o governo brasileiro controla os dividendos de mineradoras', 'D. Porque a Vale distribui dividendos apenas quando o dólar está alto'],
      correct: 1,
      correctFeedback: 'Correto! O lucro da Vale está diretamente ligado ao preço do minério. Quando a China cresce e demanda mais aço, o minério sobe, o lucro explode e os dividendos aumentam.',
      wrongFeedback: 'A resposta é B. O minério de ferro é uma commodity global. Quando a China acelera, o preço sobe, o lucro da Vale aumenta e os dividendos crescem. Quando desacelera, o oposto acontece.'
    },
    {
      q: 'Magazine Luiza (MGLU3) subiu cerca de 1.800% entre 2016 e 2020. O que aconteceu depois?',
      options: ['A. A ação continuou subindo até 2024', 'B. A ação ficou estável no patamar alto atingido', 'C. A ação caiu aproximadamente 95% entre 2021 e 2023', 'D. A empresa foi privatizada e saiu da bolsa'],
      correct: 2,
      correctFeedback: 'Exato! Após a euforia de crescimento, o aumento dos juros e o fim do boom do e-commerce derrubou a ação em ~95%. Euforia sempre precede correções.',
      wrongFeedback: 'A resposta é C. Após subir 1.800%, a Magalu caiu ~95% quando os juros subiram e o crescimento desacelerou. É o ciclo clássico de euforia e correção.'
    },
    {
      q: 'O que é "due diligence" antes de comprar uma ação?',
      options: ['A. Esperar o preço cair 50% antes de comprar', 'B. Pesquisar o modelo de negócio, endividamento, gestão e riscos da empresa antes de investir', 'C. Consultar um astrólogo ou analista de sorte', 'D. Comprar a mesma ação que famosos e influenciadores estão comprando'],
      correct: 1,
      correctFeedback: 'Perfeito! Due diligence é o dever de casa do investidor: entender como a empresa ganha dinheiro, se tem dívida saudável e quem está na gestão.',
      wrongFeedback: 'Due diligence (B) significa pesquisar a fundo antes de investir: modelo de negócio, dívidas, margens, gestão e riscos. Nenhuma ferramenta técnica substitui esse trabalho.'
    },
    {
      q: 'Qual das afirmações abaixo resume melhor a lição de estudar casos reais na bolsa?',
      options: ['A. O passado garante que o futuro vai se repetir exatamente igual', 'B. Estudar casos é perda de tempo pois cada situação é única', 'C. Reconhecer padrões de euforia, fraude e ciclos ajuda a evitar os mesmos erros', 'D. Casos reais mostram que é impossível ganhar dinheiro na bolsa'],
      correct: 2,
      correctFeedback: 'Isso mesmo! Os detalhes mudam, mas os padrões se repetem: euforia, excesso de concentração e falta de due diligence causam os mesmos problemas em gerações diferentes.',
      wrongFeedback: 'A resposta é C. O objetivo de estudar casos não é prever o futuro, mas reconhecer padrões recorrentes — euforia antes de correção, concentração de risco, sinais de fraude — antes que eles te peguem.'
    }
  ]
},

'chart_basics': {
  totalSteps: 5,
  sections: [
    {
      icon: '🕯️',
      title: 'O Candlestick — A Linguagem do Mercado',
      hook: 'Cada vela no gráfico conta uma história completa de uma batalha entre compradores e vendedores.',
      content: '<p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)">O candlestick (ou vela) é a unidade básica de qualquer gráfico de ações. Cada vela representa um período — um dia, uma semana, um mês. Ela tem quatro informações: <strong style="color:var(--ink-1)">Abertura</strong> (onde o preço começou), <strong style="color:var(--ink-1)">Fechamento</strong> (onde terminou), <strong style="color:var(--ink-1)">Máxima</strong> (ponto mais alto) e <strong style="color:var(--ink-1)">Mínima</strong> (ponto mais baixo).</p><p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)"><strong style="color:#4caf50">Vela verde</strong>: o preço fechou acima da abertura — compradores venceram. <strong style="color:#ef5350">Vela vermelha</strong>: o preço fechou abaixo da abertura — vendedores dominaram. O corpo da vela mostra a distância entre abertura e fechamento. A sombra (wick) acima e abaixo mostra a máxima e mínima do período.</p><p style="font-size:14px;color:var(--ink-2);line-height:1.7">Sombra longa significa que o preço se moveu muito durante o dia mas fechou longe da extremidade — sinal de indecisão ou rejeição de preço. O Momentum usa gráficos diários para todos os sinais.</p>',
      chart: 'chartCandlestick'
    },
    {
      icon: '📈',
      title: 'Tendências: Para Onde o Preço Vai?',
      hook: 'Saber se o mercado está subindo, caindo ou de lado é a informação mais importante antes de qualquer decisão.',
      content: '<p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)"><strong style="color:#4caf50">Tendência de alta</strong>: o preço faz topos cada vez mais altos e fundos cada vez mais altos. Cada recuo é uma oportunidade de compra — os compradores estão no controle. <strong style="color:#ef5350">Tendência de baixa</strong>: topos cada vez mais baixos e fundos cada vez mais baixos. Cada repique é uma armadilha — os vendedores dominam.</p><p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)"><strong style="color:#e8a846">Movimento lateral</strong> (sideways): o preço oscila entre dois níveis sem definição clara. Nesses momentos, o risco de falsos sinais é maior e muitos traders experientes preferem esperar.</p><p style="font-size:14px;color:var(--ink-2);line-height:1.7">A regra de ouro: <strong style="color:var(--ink-1)">opere a favor da tendência</strong>. Comprar em tendência de alta e vender (ou não comprar) em tendência de baixa é a base de qualquer estratégia sólida.</p>',
      chart: 'chartTrendlines'
    },
    {
      icon: '🏗️',
      title: 'Suporte e Resistência',
      hook: 'O preço tem memória — ele tende a parar nos mesmos pontos repetidamente, e isso cria oportunidades.',
      content: '<p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)"><strong style="color:#4caf50">Suporte</strong> é um nível de preço onde compradores aparecem repetidamente, impedindo que o preço caia mais. Pense como um piso: cada vez que o preço desce até aquele nível, alguém compra. O suporte vira um ponto de entrada interessante para compras.</p><p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)"><strong style="color:#ef5350">Resistência</strong> é o oposto: um nível onde vendedores aparecem e impedem novas altas. O preço sobe até aquele ponto e recua várias vezes. Quando o preço finalmente rompe a resistência com força, ela vira o novo suporte — esse é um dos sinais mais poderosos da análise técnica.</p><p style="font-size:14px;color:var(--ink-2);line-height:1.7">Suporte e resistência funcionam porque muitos investidores enxergam os mesmos pontos. Essa profecia se autocumpre: todo mundo espera uma reação no mesmo preço, e ela acontece.</p>',
      chart: null
    },
    {
      icon: '📦',
      title: 'Volume: A Prova dos 9',
      hook: 'Um movimento de preço sem volume é como um boato sem fonte — pode ser verdade, pode ser armadilha.',
      content: '<p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)"><strong style="color:var(--ink-1)">Volume</strong> é a quantidade de ações negociadas em um período. É o indicador de convicção: quando muita gente compra ou vende, o movimento tem mais significado. <strong style="color:#4caf50">Alto volume em alta</strong>: tendência sólida, compradores estão convictos. <strong style="color:#ef5350">Alto volume em queda</strong>: venda massiva, sinal de saída.</p><p style="font-size:14px;color:var(--ink-2);line-height:1.7;margin-bottom:var(--s-3)"><strong style="color:#e8a846">Baixo volume</strong> em qualquer direção é sinal de desconfiança. Um rompimento de resistência com baixo volume frequentemente falha — o preço sobe, mas poucos acreditam, e ele volta.</p><p style="font-size:14px;color:var(--ink-2);line-height:1.7">A regra prática: <strong style="color:var(--ink-1)">sempre confirme com volume</strong>. O Momentum considera o volume médio dos últimos 20 dias como referência para identificar movimentos com convicção real.</p>',
      chart: null
    }
  ],
  quiz: [
    {
      q: 'O que uma vela (candlestick) verde em um gráfico diário significa?',
      options: ['A. O volume foi maior do que a média do dia', 'B. O preço de fechamento ficou acima do preço de abertura', 'C. A empresa anunciou bons resultados naquele dia', 'D. O preço atingiu a máxima histórica'],
      correct: 1,
      correctFeedback: 'Correto! Verde significa que o preço fechou acima de onde abriu — os compradores dominaram o dia.',
      wrongFeedback: 'A resposta é B. Vela verde = fechamento acima da abertura. Os compradores venceram a batalha do dia. Cor não diz nada sobre volume ou resultados da empresa.'
    },
    {
      q: 'Quais são os quatro dados que uma única vela (candlestick) mostra?',
      options: ['A. Lucro, dividendo, volume e liquidez', 'B. Abertura, fechamento, máxima e mínima do período', 'C. Preço médio, variação percentual, setor e market cap', 'D. Suporte, resistência, tendência e volume'],
      correct: 1,
      correctFeedback: 'Exato! OHLC: Open (abertura), High (máxima), Low (mínima), Close (fechamento). Esses quatro dados resumem toda a ação do preço no período.',
      wrongFeedback: 'A resposta é B: abertura, fechamento, máxima e mínima. Em inglês: Open, High, Low, Close (OHLC). São as quatro informações fundamentais de qualquer vela.'
    },
    {
      q: 'Como se caracteriza uma tendência de alta em um gráfico?',
      options: ['A. O preço sobe em linha reta sem nenhum recuo', 'B. O volume aumenta continuamente ao longo do tempo', 'C. O gráfico forma topos cada vez mais altos e fundos cada vez mais altos', 'D. O preço fica acima de R$100 por ação'],
      correct: 2,
      correctFeedback: 'Perfeito! Tendência de alta = topos crescentes e fundos crescentes. Cada recuo para em um nível mais alto do que o recuo anterior.',
      wrongFeedback: 'A resposta é C. Tendência de alta não é linha reta — tem recuos. O que define é que cada topo é mais alto que o anterior e cada fundo também. Topos e fundos crescentes.'
    },
    {
      q: 'O preço de uma ação testou o nível de R$20,00 três vezes e ricocheteou para cima toda vez. O que esse nível representa?',
      options: ['A. Uma resistência forte', 'B. O preço justo calculado por analistas', 'C. Um suporte — piso onde compradores aparecem repetidamente', 'D. O preço mínimo que a empresa pode ter por lei'],
      correct: 2,
      correctFeedback: 'Correto! Quando o preço rebate no mesmo nível várias vezes sem cair abaixo, estamos diante de um suporte — compradores aparecem naquele preço repetidamente.',
      wrongFeedback: 'A resposta é C: suporte. Três rejeições no mesmo preço mostram que compradores aparecem naquele nível consistentemente, criando um piso de preço.'
    },
    {
      q: 'Uma ação rompe uma resistência importante, mas o volume do dia foi muito abaixo da média. O que isso sugere?',
      options: ['A. O rompimento é muito forte e confiável', 'B. O rompimento pode ser falso — sem volume, falta convicção dos compradores', 'C. A empresa vai anunciar resultados positivos em breve', 'D. Isso indica que o preço vai cair pela metade'],
      correct: 1,
      correctFeedback: 'Exato! Rompimento sem volume é sinal de alerta. Falta a convicção dos grandes players. O preço pode voltar para baixo da resistência rapidamente.',
      wrongFeedback: 'A resposta é B. Volume fraco em rompimento = sinal de fraqueza. Sem participação forte do mercado, a resistência pode não ter sido realmente superada e o preço pode recuar.'
    },
    {
      q: 'Uma vela tem um corpo pequeno e sombras longas para cima e para baixo. O que isso indica?',
      options: ['A. A ação teve volume muito alto no dia', 'B. O preço subiu muito e não voltou', 'C. Houve muita movimentação de preço durante o dia mas sem definição clara de compradores ou vendedores', 'D. A empresa pagou dividendos naquele dia'],
      correct: 2,
      correctFeedback: 'Correto! Sombras longas com corpo pequeno indicam indecisão: o preço tentou subir e cair muito, mas fechou próximo de onde abriu. Nenhum lado venceu de forma clara.',
      wrongFeedback: 'A resposta é C. Corpo pequeno + sombras longas = indecisão. O preço se moveu muito (as sombras mostram isso) mas comprador e vendedor se equilibraram, fechando próximo da abertura.'
    }
  ]
}
,



'rsi': {
  totalSteps: 5,
  sections: [
    {
      icon: '📈',
      title: 'O Que é o RSI?',
      hook: 'O RSI mede se um ativo está sendo comprado em excesso ou vendido em excesso — numa escala de 0 a 100.',
      content: '<p><strong>RSI (Índice de Força Relativa)</strong> é um indicador de momentum que oscila entre 0 e 100. Ele compara a força dos dias de alta com os dias de baixa nos últimos 14 pregões, mostrando se o mercado está "esquentando demais" ou "resfriando demais".</p><p>A leitura é simples: <strong>acima de 70</strong> = sobrecomprado (o preço pode corrigir para baixo). <strong>Abaixo de 30</strong> = sobrevendido (o preço pode subir em breve). A zona entre 30 e 70 é considerada neutra.</p><p>Pense assim: se todo mundo já comprou, quem mais vai comprar para continuar subindo? O RSI avisa quando o entusiasmo passou dos limites — antes que o preço mostre isso no gráfico.</p>',
      chart: 'chartRSIZones'
    },
    {
      icon: '🔍',
      title: 'Como Ler o RSI na Prática',
      hook: 'RSI acima de 70 não é sinal de venda automática — é um alerta para prestar atenção.',
      content: '<p>O erro mais comum de iniciantes é vender assim que o RSI bate 70 ou comprar assim que cai para 30. Isso é perigoso: <strong>num mercado em forte tendência de alta, o RSI pode ficar acima de 70 por semanas seguidas</strong> sem que o preço caia.</p><p>A regra correta é usar o RSI como confirmação, nunca como sinal isolado. Um RSI acima de 70 com volume caindo e preço travado? Aí sim preste atenção. RSI acima de 70 com preço rompendo máximas e volume crescendo? A tendência pode continuar.</p><p><strong>Em tendência de alta</strong>, o RSI tende a permanecer entre 40 e 80. <strong>Em tendência de baixa</strong>, fica entre 20 e 60. Saber em qual tendência você está muda completamente a interpretação do indicador.</p>',
      chart: null
    },
    {
      icon: '⚠️',
      title: 'Divergência do RSI',
      hook: 'Quando o preço faz nova máxima mas o RSI não acompanha, o mercado está enviando um sinal de fraqueza.',
      content: '<p><strong>Divergência de baixa:</strong> o preço sobe para uma nova máxima, mas o RSI faz uma máxima menor do que a anterior. Isso significa que o movimento de alta está perdendo força — menos compradores sustentando o topo. É um dos sinais mais confiáveis de possível reversão.</p><p><strong>Divergência de alta:</strong> o preço cai para uma nova mínima, mas o RSI faz uma mínima maior. A pressão vendedora está se esgotando, mesmo com o preço ainda caindo. Pode sinalizar que o fundo está próximo.</p><p>Importante: divergências indicam <em>fraqueza</em> na tendência atual, não garantem reversão imediata. Sempre confirme com outros indicadores antes de agir — o preço pode continuar na mesma direção por mais tempo do que o esperado.</p>',
      chart: 'chartRSIDivergence'
    },
    {
      icon: '🏆',
      title: 'RSI no App Momentum',
      hook: 'O Momentum usa o RSI como um dos 9 critérios para pontuar cada ativo escaneado.',
      content: '<p>No sistema de pontuação do Momentum, cada ativo recebe pontos por critérios técnicos independentes. O RSI é um desses critérios: <strong>RSI entre 50 e 70 = zona altista</strong>, e o ativo ganha pontos nessa categoria. RSI abaixo de 50 ou acima de 70 não pontua nesse critério.</p><p>Por que 50–70 e não apenas "abaixo de 70"? Porque o RSI acima de 50 confirma que os compradores estão no controle. Abaixo de 50, a pressão vendedora domina. Acima de 70, o ativo pode estar sobrecomprado e sujeito a correção. A faixa 50–70 é o "ponto ideal" de momentum saudável.</p><p><strong>Na prática:</strong> quando você vê um ativo com pontuação alta no app, significa que o RSI está nessa zona favorável junto com outros 8 critérios positivos — o sistema já filtrou tudo por você.</p>',
      chart: null
    }
  ],
  quiz: [
    {
      q: 'O RSI oscila em qual escala de valores?',
      options: ['A. 0 a 50', 'B. -100 a +100', 'C. 0 a 100', 'D. 1 a 1000'],
      correct: 2,
      correctFeedback: 'Correto! O RSI vai de 0 a 100, onde valores extremos indicam condições de sobrecompra ou sobrevenda.',
      wrongFeedback: 'Não é essa. O RSI é um oscilador que vai de 0 a 100 — essa escala é fixa e padronizada em todos os gráficos.'
    },
    {
      q: 'O que significa RSI acima de 70?',
      options: ['A. Sinal garantido de venda imediata', 'B. O ativo está sobrecomprado e pode corrigir', 'C. O ativo está sobrevendido e vai subir', 'D. O volume está muito alto'],
      correct: 1,
      correctFeedback: 'Exato! RSI acima de 70 indica sobrecompra — o ativo pode estar "quente demais" e propenso a uma correção, mas não é sinal de venda automática.',
      wrongFeedback: 'Cuidado! RSI acima de 70 = sobrecomprado. Isso significa possível correção de preço, não certeza de queda imediata. Nunca aja só com base no RSI.'
    },
    {
      q: 'Em uma tendência de alta forte, o RSI tende a ficar em qual faixa?',
      options: ['A. Entre 0 e 30', 'B. Exatamente em 50', 'C. Entre 40 e 80', 'D. Sempre acima de 90'],
      correct: 2,
      correctFeedback: 'Perfeito! Em tendências de alta, o RSI costuma oscilar entre 40 e 80 — interpretar isso como sobrecompra seria um erro clássico.',
      wrongFeedback: 'Não é essa. Em tendências fortes de alta, o RSI se mantém elevado, tipicamente entre 40 e 80. Em tendências de baixa, fica entre 20 e 60.'
    },
    {
      q: 'O que é uma divergência de baixa no RSI?',
      options: ['A. RSI e preço caindo juntos', 'B. Preço fazendo nova máxima, mas RSI fazendo máxima menor', 'C. RSI abaixo de 30 por mais de 5 dias', 'D. Preço e RSI ambos acima de 70'],
      correct: 1,
      correctFeedback: 'Correto! Divergência de baixa = preço em nova máxima mas RSI não confirma. Sinal de que a alta está perdendo força internamente.',
      wrongFeedback: 'Não é essa. Divergência de baixa acontece quando o preço faz nova máxima, mas o RSI faz uma máxima menor — indicando enfraquecimento do movimento.'
    },
    {
      q: 'Qual faixa de RSI o app Momentum considera altista e dá pontos ao ativo?',
      options: ['A. RSI abaixo de 30', 'B. RSI entre 70 e 100', 'C. RSI entre 50 e 70', 'D. RSI exatamente em 50'],
      correct: 2,
      correctFeedback: 'Correto! O Momentum pontua ativos com RSI entre 50 e 70 — zona de momentum saudável onde compradores dominam sem excesso de sobrecompra.',
      wrongFeedback: 'Não é essa. O app usa a faixa 50–70 como zona altista ideal: acima de 50 confirma controle dos compradores, abaixo de 70 evita sobrecompra excessiva.'
    },
    {
      q: 'Por que o RSI não deve ser usado como sinal isolado de compra ou venda?',
      options: ['A. Porque ele só funciona em ações de tecnologia', 'B. Porque em tendências fortes ele pode ficar em extremos por muito tempo', 'C. Porque o RSI é calculado apenas uma vez por semana', 'D. Porque corretoras proíbem o uso do RSI'],
      correct: 1,
      correctFeedback: 'Exatamente! Em tendências fortes, o RSI pode permanecer em zona de sobrecompra ou sobrevenda por semanas. Usá-lo sozinho gera sinais falsos frequentes.',
      wrongFeedback: 'Não é essa. O problema do RSI isolado é que em tendências fortes ele fica em extremos por muito tempo. Sempre confirme com tendência e outros indicadores.'
    }
  ]
},

'macd': {
  totalSteps: 5,
  sections: [
    {
      icon: '🔄',
      title: 'O Que é o MACD?',
      hook: 'O MACD combina três componentes para revelar tanto a direção quanto a força de um movimento de preço.',
      content: '<p>O <strong>MACD (Convergência e Divergência de Médias Móveis)</strong> é formado por três elementos: a <strong>Linha MACD</strong> (diferença entre a média de 12 dias e a de 26 dias), a <strong>Linha de Sinal</strong> (média de 9 dias da Linha MACD) e o <strong>Histograma</strong> (diferença entre as duas linhas).</p><p>A ideia central é simples: médias mais curtas reagem mais rápido ao preço do que médias mais longas. Quando a média rápida (12 dias) está acima da lenta (26 dias), o momentum é de alta. Quando cruza para baixo, o momentum virou para baixa.</p><p>O histograma — as barras verticais no gráfico — mostra visualmente se as duas linhas estão se aproximando ou se afastando. <strong>Barras crescendo</strong> = momentum acelerando. <strong>Barras encolhendo</strong> = momentum fraquejando. É a camada mais rápida de informação do MACD.</p>',
      chart: 'chartMACDHistogram'
    },
    {
      icon: '⚡',
      title: 'Cruzamentos: Os Sinais de Compra e Venda',
      hook: 'O cruzamento das linhas do MACD é um dos sinais técnicos mais usados por traders no mundo todo.',
      content: '<p><strong>Cruzamento altista (sinal de compra):</strong> a Linha MACD cruza de baixo para cima a Linha de Sinal. Isso indica que o momentum de curto prazo superou o de médio prazo — os compradores assumiram o controle. Quanto mais abaixo da linha zero esse cruzamento ocorre, mais forte tende a ser o movimento subsequente.</p><p><strong>Cruzamento baixista (sinal de venda):</strong> a Linha MACD cruza de cima para baixo a Linha de Sinal. Os vendedores assumiram o controle do momentum. Cruzamentos acima da linha zero em tendência de baixa tendem a ser mais confiáveis.</p><p>Atenção: em mercados laterais (sem tendência), o MACD gera muitos cruzamentos falsos. O sinal é mais confiável quando confirmado pela direção da tendência principal e pelo ADX acima de 25.</p>',
      chart: 'chartMACDCrossover'
    },
    {
      icon: '📊',
      title: 'O Histograma: Força do Movimento',
      hook: 'O histograma do MACD revela a aceleração ou desaceleração do movimento antes do preço mostrar.',
      content: '<p>O histograma é a diferença entre a Linha MACD e a Linha de Sinal. <strong>Acima de zero</strong> significa que o MACD está acima do sinal — momentum positivo. <strong>Abaixo de zero</strong> significa momentum negativo. Mas o mais importante não é o valor absoluto: é a <em>direção</em> em que as barras estão indo.</p><p><strong>Histograma crescendo acima do zero</strong> = momentum de alta acelerando — tendência de alta se fortalecendo. <strong>Histograma encolhendo acima do zero</strong> = momentum de alta desacelerando — possível sinal antecipado de que o cruzamento baixista está próximo.</p><p>Traders experientes observam o histograma <em>antes</em> do cruzamento acontecer: quando as barras começam a encolher, é hora de apertar o stop. Quando começam a crescer na direção oposta, um novo cruzamento está em formação. O histograma avisa antes que as linhas se cruzem.</p>',
      chart: null
    },
    {
      icon: '🏆',
      title: 'MACD no App Momentum',
      hook: 'O Momentum usa o cruzamento altista do MACD como um dos 9 critérios do seu sistema de pontuação.',
      content: '<p>No score do Momentum, o <strong>cruzamento altista do MACD</strong> é um dos critérios avaliados: a Linha MACD cruzando acima da Linha de Sinal soma pontos ao ativo. Isso indica que o momentum de curto prazo superou o de médio prazo — condição favorável para continuidade de alta.</p><p>O app verifica esse cruzamento automaticamente para todos os ativos da B3 no scan diário. Você não precisa abrir gráfico por gráfico — o sistema já identificou quais ativos apresentam esse padrão agora.</p><p><strong>Combinando com outros critérios:</strong> um ativo com cruzamento MACD altista E RSI entre 50–70 E acima da média de 200 dias acumula pontos em múltiplos critérios — e aparece no topo do ranking. Quanto mais critérios positivos juntos, mais forte o sinal composto.</p>',
      chart: null
    }
  ],
  quiz: [
    {
      q: 'A Linha MACD é calculada como:',
      options: ['A. Média de 9 dias menos média de 26 dias', 'B. Média de 12 dias menos média de 26 dias', 'C. Média de 14 dias dividida por 2', 'D. Diferença entre máxima e mínima do dia'],
      correct: 1,
      correctFeedback: 'Correto! A Linha MACD é a EMA de 12 dias menos a EMA de 26 dias — capturando a diferença entre o momentum de curto e médio prazo.',
      wrongFeedback: 'Não é essa. A Linha MACD = EMA(12) menos EMA(26). A Linha de Sinal é a EMA de 9 dias aplicada sobre o resultado.'
    },
    {
      q: 'O que é o histograma do MACD?',
      options: ['A. Um gráfico de volume de negociações', 'B. A média móvel de 26 dias plotada em barras', 'C. A diferença entre a Linha MACD e a Linha de Sinal', 'D. O preço de fechamento em formato de barras'],
      correct: 2,
      correctFeedback: 'Exato! O histograma = Linha MACD menos Linha de Sinal. Ele mostra visualmente a distância e a direção entre as duas linhas.',
      wrongFeedback: 'Não é essa. O histograma é a diferença entre a Linha MACD e a Linha de Sinal — as barras verticais que mostram a força e direção do momentum.'
    },
    {
      q: 'O que é um cruzamento altista do MACD?',
      options: ['A. A Linha de Sinal cruzando acima da média de 200 dias', 'B. O preço cruzando acima da Linha MACD', 'C. A Linha MACD cruzando de baixo para cima a Linha de Sinal', 'D. O histograma atingindo valor máximo'],
      correct: 2,
      correctFeedback: 'Perfeito! Cruzamento altista = Linha MACD cruza para cima a Linha de Sinal. É interpretado como sinal de que o momentum de alta assumiu o controle.',
      wrongFeedback: 'Não é essa. O cruzamento altista acontece quando a Linha MACD cruza de baixo para cima a Linha de Sinal — não envolve o preço diretamente.'
    },
    {
      q: 'Histograma encolhendo acima de zero indica:',
      options: ['A. Momentum de alta acelerando fortemente', 'B. Momentum de alta desacelerando — possível sinal antecipado de reversão', 'C. Mercado em forte tendência de baixa', 'D. Volume de negociações caindo'],
      correct: 1,
      correctFeedback: 'Correto! Barras encolhendo acima de zero mostram que o momentum positivo está perdendo força — um aviso antes que o cruzamento baixista ocorra.',
      wrongFeedback: 'Não é essa. Histograma encolhendo (mesmo acima de zero) = desaceleração do momentum positivo. É um sinal precoce de possível mudança de direção.'
    },
    {
      q: 'Em qual situação os cruzamentos do MACD geram mais sinais falsos?',
      options: ['A. Em tendências de alta muito fortes', 'B. Quando o RSI está entre 50 e 70', 'C. Em mercados laterais sem tendência definida', 'D. Quando o volume está acima da média'],
      correct: 2,
      correctFeedback: 'Exato! Em mercados laterais (sem tendência), o MACD cruza as linhas repetidamente sem direção clara — gerando sinais falsos frequentes.',
      wrongFeedback: 'Não é essa. Mercados laterais (sem tendência) são o maior problema do MACD — as linhas cruzam para cima e para baixo várias vezes sem resultado real.'
    },
    {
      q: 'Como o app Momentum usa o MACD no seu sistema de pontuação?',
      options: ['A. Usa o histograma como único critério de score', 'B. Pontua ativos com cruzamento altista do MACD como 1 dos 9 critérios', 'C. Desconta pontos quando o MACD está acima de zero', 'D. Usa apenas a Linha de Sinal isolada'],
      correct: 1,
      correctFeedback: 'Correto! O cruzamento altista do MACD é 1 dos 9 critérios do score do Momentum — ativos com esse padrão ganham pontos no sistema.',
      wrongFeedback: 'Não é essa. O Momentum pontua o cruzamento altista do MACD (MACD cruzando acima do sinal) como um dos seus 9 critérios técnicos.'
    }
  ]
},

'adx': {
  totalSteps: 5,
  sections: [
    {
      icon: '📊',
      title: 'ADX — A Força Que Você Não Vê',
      hook: 'O ADX não diz para onde o mercado vai — ele diz se existe força suficiente para ir a algum lugar.',
      content: '<p>O <strong>ADX (Índice Direcional Médio)</strong> mede a <em>força</em> de uma tendência, não a sua direção. Um ADX de 40 pode estar num ativo subindo ou num ativo caindo — o que ele confirma é que existe uma tendência forte em curso, seja ela qual for.</p><p>A escala vai de 0 a 100: <strong>abaixo de 20</strong> = mercado lateral, sem tendência definida. <strong>Entre 20 e 25</strong> = tendência fraca emergindo. <strong>Acima de 25</strong> = tendência presente e confiável. <strong>Acima de 50</strong> = tendência muito forte, raramente sustentada por muito tempo.</p><p>Pense no ADX como o velocímetro do mercado: RSI e MACD dizem a direção, mas o ADX diz se o motor está ligado. De nada adianta saber que o carro está girando à direita se o motor está desligado e ele está apenas rolando.</p>',
      chart: 'chartADXStrength'
    },
    {
      icon: '🧭',
      title: '+DI e -DI: A Direção da Força',
      hook: 'O ADX sozinho não basta — são os indicadores +DI e -DI que revelam para qual lado a força está indo.',
      content: '<p>O sistema ADX vem acompanhado de dois indicadores direcionais: o <strong>+DI (Indicador Direcional Positivo)</strong> mede a pressão compradora, e o <strong>-DI (Indicador Direcional Negativo)</strong> mede a pressão vendedora. Ambos também oscilam entre 0 e 100.</p><p>A leitura é direta: <strong>+DI acima do -DI</strong> = compradores dominando, tendência de alta. <strong>-DI acima do +DI</strong> = vendedores dominando, tendência de baixa. O cruzamento entre eles pode sinalizar mudança de direção — mas só é significativo quando o ADX está acima de 25.</p><p>Juntos, os três formam o sistema completo: o ADX diz "existe tendência?", o +DI e o -DI dizem "em qual direção?". Sem o ADX alto, cruzamentos de +DI/-DI em mercado lateral são frequentemente falsos e podem levar a entradas ruins.</p>',
      chart: null
    },
    {
      icon: '🎯',
      title: 'ADX na Prática — Quando Agir',
      hook: 'A regra de ouro do ADX: só opere rompimentos e sinais técnicos quando o ADX estiver acima de 25.',
      content: '<p>Com ADX abaixo de 20, o mercado está andando de lado. Nessa condição, sinais do RSI e do MACD são muito menos confiáveis — o preço não tem força direcional para seguir o sinal. Entrar numa operação em mercado lateral é como apostar numa corrida onde os cavalos estão parados.</p><p><strong>ADX acima de 25 + cruzamento altista do MACD + RSI entre 50 e 70:</strong> essa combinação significa que há uma tendência real em curso, com momentum positivo e sem sobrecompra excessiva. Os três indicadores se confirmam mutuamente — e é nessa convergência que os melhores setups aparecem.</p><p><strong>ADX acima de 50:</strong> a tendência é muito forte, mas cuidado — tendências extremamente fortes tendem a se exaurir. Nesse nível, o risco de entrar tarde é alto. Priorize quem entrou com ADX entre 25 e 40, que é a zona de tendência saudável e sustentável.</p>',
      chart: null
    },
    {
      icon: '🏆',
      title: 'ADX no App Momentum',
      hook: 'O Momentum usa o ADX para filtrar ativos com tendência real, eliminando ruído de mercados laterais.',
      content: '<p>No sistema do Momentum, o <strong>ADX acima de 25</strong> funciona como filtro de qualidade de tendência — um dos critérios que o ativo precisa satisfazer para acumular pontuação alta. Ativos em mercado lateral (ADX baixo) ficam automaticamente abaixo no ranking, independente de outros sinais.</p><p>Isso protege você de um erro clássico: ver um cruzamento altista do MACD num ativo sem tendência e interpretar como sinal confiável. O Momentum já cruzou essa informação por você — se o ativo está no topo do ranking, é porque o ADX confirma que há força direcional real por trás do movimento.</p><p><strong>A combinação mais poderosa no app:</strong> ativo com ADX alto + cruzamento MACD altista + RSI em zona favorável + acima das médias de longo prazo. Esses quatro critérios juntos formam o sinal composto mais robusto do sistema — e é exatamente o que o score de 8 ou 9 pontos representa.</p>',
      chart: null
    }
  ],
  quiz: [
    {
      q: 'O que o ADX mede?',
      options: ['A. A direção da tendência (alta ou baixa)', 'B. O volume financeiro diário do ativo', 'C. A força da tendência, independente da direção', 'D. A diferença entre preço de abertura e fechamento'],
      correct: 2,
      correctFeedback: 'Correto! O ADX mede exclusivamente a força da tendência — não importa se é de alta ou de baixa. Um ADX alto confirma que existe uma tendência real.',
      wrongFeedback: 'Não é essa. O ADX não indica direção — apenas força. Para saber a direção, você precisa dos indicadores +DI e -DI que acompanham o ADX.'
    },
    {
      q: 'Um ADX abaixo de 20 indica:',
      options: ['A. Tendência de alta muito forte', 'B. Mercado lateral sem tendência definida', 'C. Ativo em sobrecompra extrema', 'D. Volume de vendas dominando o mercado'],
      correct: 1,
      correctFeedback: 'Exato! ADX abaixo de 20 = mercado lateral. Nessa condição, o preço não tem força direcional e sinais de outros indicadores são muito menos confiáveis.',
      wrongFeedback: 'Não é essa. ADX abaixo de 20 significa mercado sem tendência (lateral). Acima de 25 é que a tendência se confirma como real e confiável.'
    },
    {
      q: 'O que significa +DI acima do -DI?',
      options: ['A. O ativo está sobrevendido', 'B. A pressão compradora está dominando — tendência de alta', 'C. O ADX está acima de 50', 'D. O volume está acima da média de 20 dias'],
      correct: 1,
      correctFeedback: 'Perfeito! +DI acima do -DI indica que a pressão compradora supera a vendedora — o mercado está favorecendo os compradores.',
      wrongFeedback: 'Não é essa. +DI = pressão compradora, -DI = pressão vendedora. Quando +DI está acima, os compradores dominam e a tendência é de alta.'
    },
    {
      q: 'Por que sinais do MACD e RSI são menos confiáveis com ADX abaixo de 20?',
      options: ['A. Porque o MACD não funciona em ações brasileiras', 'B. Porque sem tendência definida, o preço não tem força para seguir os sinais', 'C. Porque o RSI fica sempre em 50 quando o ADX é baixo', 'D. Porque corretoras bloqueiam operações com ADX baixo'],
      correct: 1,
      correctFeedback: 'Correto! Em mercado lateral, o preço oscila sem direção. Mesmo com sinais técnicos positivos, não há força para o ativo se mover de forma sustentada.',
      wrongFeedback: 'Não é essa. Com ADX baixo, o mercado está lateral. Sinais de MACD e RSI existem, mas o preço não tem força direcional para segui-los de forma confiável.'
    },
    {
      q: 'Qual é a faixa de ADX considerada ideal para operar tendências de forma saudável?',
      options: ['A. ADX entre 0 e 20', 'B. ADX exatamente em 50', 'C. ADX entre 25 e 40', 'D. ADX acima de 80'],
      correct: 2,
      correctFeedback: 'Exato! ADX entre 25 e 40 representa uma tendência presente e sustentável — forte o suficiente para ser real, sem o risco de exaustão de tendências extremas.',
      wrongFeedback: 'Não é essa. A zona ideal é ADX entre 25 e 40: confirma tendência real sem o risco de exaustão que vem com valores acima de 50.'
    },
    {
      q: 'Como o ADX é usado no sistema de pontuação do app Momentum?',
      options: ['A. ADX baixo soma mais pontos pois indica ativo barato', 'B. ADX acima de 25 é um dos critérios para o ativo acumular pontuação alta', 'C. O ADX é ignorado — só MACD e RSI são usados', 'D. ADX acima de 50 desconta pontos do ativo'],
      correct: 1,
      correctFeedback: 'Correto! O Momentum usa ADX acima de 25 como filtro de qualidade de tendência — garantindo que ativos no topo do ranking têm força direcional real.',
      wrongFeedback: 'Não é essa. O Momentum pontua ativos com ADX acima de 25, confirmando que há tendência real por trás do sinal — não apenas ruído de mercado lateral.'
    }
  ]
},

'atr': {
  totalSteps: 5,
  sections: [
    {
      icon: '📏',
      title: 'O Que é ATR e Por Que Importa',
      hook: 'ATR é o termômetro do mercado — ele mede o quanto uma ação balança todo dia.',
      content: '<p><strong>ATR significa Average True Range</strong>, ou seja, a média do movimento diário de preço de uma ação nos últimos 14 dias. Se uma ação vale R$50 e tem ATR de R$2, é normal ela variar R$2 pra cima ou pra baixo em um único dia.</p><p><strong>ATR alto = volatilidade alta.</strong> A ação oscila muito — pode ganhar (ou perder) bastante em pouco tempo. <strong>ATR baixo = ação mais estável</strong>, que se move devagar. Nem um nem outro é melhor — depende da sua estratégia e do seu perfil.</p><p>O ATR <strong>não diz pra onde o preço vai</strong> — só diz o tamanho do movimento. É como saber que vai ter vento forte sem saber se vem do norte ou do sul.</p>',
      chart: 'chartATRVolatility'
    },
    {
      icon: '🛑',
      title: 'ATR e o Stop Móvel',
      hook: 'O app Momentum usa o ATR pra definir onde colocar seu stop — automaticamente.',
      content: '<p><strong>Stop loss é o preço em que você sai da operação pra não perder mais.</strong> O problema de colocar um stop no olho é que ele pode ser atingido pelo simples barulho do mercado — aquela variação normal do dia que não significa nada.</p><p>Por isso o Momentum usa <strong>2 × ATR como margem de segurança.</strong> A fórmula do stop móvel é: <strong>Stop = maior preço desde a entrada − (2 × ATR)</strong>. Assim o stop respeita a oscilação natural da ação sem te tirar cedo demais.</p><p>O stop é <strong>móvel</strong>: conforme o preço sobe, o stop sobe junto — travando o lucro aos poucos. Se o preço cair abaixo do stop, o app sinaliza saída.</p>',
      chart: null
    },
    {
      icon: '⚖️',
      title: 'ATR e o Tamanho da Posição',
      hook: 'Quanto mais a ação balança, menor a posição que você deve comprar — simples assim.',
      content: '<p><strong>Gerenciamento de risco começa antes de apertar comprar.</strong> Se você colocar o mesmo valor em toda ação, vai estar assumindo riscos muito diferentes — porque ações voláteis podem te fazer perder muito mais em um dia ruim.</p><p>A lógica é direta: <strong>ATR alto = posição menor.</strong> Se você arrisca R$200 por operação e o stop está a R$4 (2 × ATR de R$2), você compra no máximo 50 ações (R$200 ÷ R$4). Se o ATR fosse R$1, você compraria 100 ações com o mesmo risco.</p><p>Isso garante que <strong>todas as suas operações tenham o mesmo peso no seu bolso</strong>, independente de qual ação você escolher. Profissional não é quem ganha sempre — é quem controla o tamanho do prejuízo.</p>',
      chart: null
    },
    {
      icon: '🧮',
      title: 'Calculando Seu Stop com ATR',
      hook: 'Três números são tudo que você precisa: preço de entrada, ATR e a fórmula de 2×.',
      content: '<p><strong>Exemplo real:</strong> Você comprou PETR4 a R$50,00. O ATR de 14 dias está em R$2,00. O stop será: R$50,00 − (2 × R$2,00) = <strong>R$46,00</strong>. Se PETR4 cair abaixo de R$46, é hora de sair.</p><p><strong>Por que 2× e não 1×?</strong> Com 1× ATR, o stop seria a R$48 — e como a variação diária normal é de R$2, você seria stopado por acidente quase todo dia. O fator 2× dá espaço pra ação respirar sem te derrubar no barulho.</p><p>O Momentum calcula isso automaticamente pra cada ação que você rastreia. Mas <strong>saber como a conta é feita te ajuda a confiar no número</strong> — e a entender quando faz sentido ajustar conforme o mercado muda.</p>',
      chart: null
    }
  ],
  quiz: [
    {
      q: 'O que o ATR mede em uma ação?',
      options: [
        'A. O volume de negócios do dia',
        'B. A média de variação de preço diária num período',
        'C. O lucro esperado da operação',
        'D. O preço médio nos últimos 14 dias'
      ],
      correct: 1,
      correctFeedback: 'Exato! ATR = Average True Range, a média da oscilação diária de preço — o termômetro da volatilidade.',
      wrongFeedback: 'Não é essa. ATR mede a volatilidade: a média do quanto o preço se move por dia nos últimos 14 dias.'
    },
    {
      q: 'Uma ação com ATR alto significa que ela é:',
      options: [
        'A. Garantida de subir',
        'B. Mais segura pra investir',
        'C. Mais volátil — oscila bastante todo dia',
        'D. Ideal pra quem quer dividendos'
      ],
      correct: 2,
      correctFeedback: 'Isso! ATR alto = ação que balança muito. Não é bom nem ruim — depende da sua estratégia.',
      wrongFeedback: 'Errado. ATR alto quer dizer volatilidade alta: a ação sobe e cai muito. Isso não diz nada sobre direção ou segurança.'
    },
    {
      q: 'Você comprou uma ação a R$60. O ATR é R$3. Qual é o stop usando 2×ATR?',
      options: [
        'A. R$57,00',
        'B. R$54,00',
        'C. R$63,00',
        'D. R$56,00'
      ],
      correct: 1,
      correctFeedback: 'Perfeito! R$60 − (2 × R$3) = R$60 − R$6 = R$54. Você calculou direitinho.',
      wrongFeedback: 'A fórmula é: entrada − (2 × ATR). Então R$60 − (2 × R$3) = R$60 − R$6 = R$54.'
    },
    {
      q: 'Por que o Momentum usa 2×ATR e não 1×ATR no stop?',
      options: [
        'A. Pra aumentar o lucro potencial',
        'B. Porque 1×ATR seria muito perto e o stop seria atingido pelo barulho normal do mercado',
        'C. Pra reduzir o imposto sobre ganhos',
        'D. Porque o ATR é calculado em 28 dias'
      ],
      correct: 1,
      correctFeedback: 'Certo! 1×ATR é igual à variação diária normal — stop seria atingido sem motivo real. O 2× dá espaço pra ação respirar.',
      wrongFeedback: 'O motivo é evitar o barulho de mercado. Com 1×ATR, a variação diária normal já tocaria o stop. O 2× protege disso.'
    },
    {
      q: 'Com ATR de R$5 e risco máximo de R$300 por operação, quantas ações você deve comprar?',
      options: [
        'A. 60 ações',
        'B. 150 ações',
        'C. 30 ações',
        'D. 300 ações'
      ],
      correct: 2,
      correctFeedback: 'Correto! O stop fica a 2×R$5 = R$10 abaixo da entrada. R$300 ÷ R$10 = 30 ações. Risco controlado!',
      wrongFeedback: 'O stop é 2×ATR = R$10. Então: R$300 de risco ÷ R$10 de stop = 30 ações. Simples assim.'
    },
    {
      q: 'O ATR diz a direção do movimento do preço?',
      options: [
        'A. Sim, ATR alto indica tendência de alta',
        'B. Sim, ATR baixo indica queda iminente',
        'C. Não, o ATR só mede o tamanho da oscilação, não a direção',
        'D. Sim, mas só funciona com volume alto'
      ],
      correct: 2,
      correctFeedback: 'Exatamente! ATR é só o termômetro da volatilidade — não aponta pra cima nem pra baixo.',
      wrongFeedback: 'ATR não tem direção. Ele só mede o tamanho do movimento. Pra saber direção, você usa RSI, MACD e tendência.'
    }
  ]
},

'sma': {
  totalSteps: 5,
  sections: [
    {
      icon: '〰️',
      title: 'O Que São Médias Móveis',
      hook: 'A média móvel é o GPS do mercado — mostra se você está na rota certa ou indo contra o trânsito.',
      content: '<p><strong>SMA significa Simple Moving Average</strong> — média simples dos preços de fechamento num período. A <strong>SMA50</strong> é a média dos últimos 50 dias. A <strong>SMA200</strong>, dos últimos 200. Quanto maior o período, mais lenta e mais confiável a tendência que ela mostra.</p><p><strong>Preço acima da SMA200 = tendência de alta de longo prazo.</strong> Isso significa que, na média dos últimos 200 pregões, quem comprou está lucrando. É um filtro poderoso: o Momentum só considera sinais de compra em ações que estão acima da SMA200.</p><p>A <strong>SMA50 mostra a tendência de médio prazo.</strong> Juntas, SMA50 e SMA200 formam o par mais importante da análise técnica — a diferença entre elas é que gera os sinais mais famosos do mercado.</p>',
      chart: null
    },
    {
      icon: '✨',
      title: 'Golden Cross e Death Cross',
      hook: 'Dois cruzamentos que movem bilhões no mercado — e você vai aprender a reconhecê-los.',
      content: '<p>O <strong>Golden Cross</strong> acontece quando a SMA50 cruza <em>acima</em> da SMA200. É o sinal mais poderoso de alta de longo prazo na análise técnica. Raro, mas quando aparece, indica que o mercado virou de vez — os compradores assumiram o controle.</p><p>O oposto é o <strong>Death Cross</strong>: a SMA50 cruza <em>abaixo</em> da SMA200. Sinal de alerta vermelho — tendência de baixa instalada. Quem ignorou esse sinal em crises históricas pagou caro.</p><p>Esses sinais são <strong>lentos por natureza</strong> — nunca pegam o fundo nem o topo exato. Mas são excelentes pra confirmar uma tendência já em movimento. No Momentum, o Golden Cross é um dos critérios que elevam o score de uma ação.</p>',
      chart: 'chartSMAGoldenCross'
    },
    {
      icon: '🔄',
      title: 'SMA como Suporte Dinâmico',
      hook: 'Em tendências de alta, o preço costuma "pular" de volta quando toca a média — é o mercado se apoiando.',
      content: '<p>Em tendências de alta, a <strong>SMA50 funciona como um piso dinâmico.</strong> O preço sobe, afasta da média, recua até tocá-la... e volta a subir. Esse padrão se repete enquanto a tendência está intacta. Traders experientes usam esse toque como oportunidade de compra.</p><p>A lógica é simples: quando o preço cai até a SMA50, muitos investidores veem como "desconto" e compram — criando demanda que empurra o preço de volta. É a psicologia do mercado funcionando de forma previsível.</p><p><strong>Quando o preço fecha consistentemente abaixo da SMA50</strong>, o suporte foi rompido e a tendência pode estar virando. Esse é um dos primeiros sinais de que algo mudou — momento de revisar a posição.</p>',
      chart: null
    },
    {
      icon: '📱',
      title: 'SMA no App Momentum',
      hook: 'O Momentum usa a relação entre SMA50 e SMA200 como filtro principal de sinal de compra.',
      content: '<p>O Momentum aplica uma regra clara: <strong>SMA50 maior que SMA200 = mercado em tendência de alta.</strong> Só nessa condição o app considera sinais de compra. Se a SMA50 está abaixo da SMA200, o app assume que o contexto é desfavorável e filtra esses ativos fora dos sinais de compra.</p><p>Isso não é regra nova — é o <strong>filtro de mercado touro</strong> usado por sistemas de trading profissionais há décadas. A ideia é simples: nadar a favor da corrente é mais fácil do que contra ela.</p><p>Na tela de detalhes de cada ação, você vê os valores de SMA50 e SMA200 ao lado do preço atual. <strong>Quando o preço está acima das duas médias e SMA50 > SMA200</strong>, todos os semáforos de tendência estão verdes — é o cenário ideal pra um sinal de compra confiável.</p>',
      chart: null
    }
  ],
  quiz: [
    {
      q: 'O que a SMA200 representa?',
      options: [
        'A. A média dos últimos 200 volumes negociados',
        'B. A média dos preços de fechamento dos últimos 200 dias',
        'C. O preço máximo dos últimos 200 pregões',
        'D. A média dos últimos 200 oscilações de alta'
      ],
      correct: 1,
      correctFeedback: 'Isso! SMA200 é a média simples dos 200 últimos fechamentos — ela mostra a tendência de longo prazo.',
      wrongFeedback: 'SMA = Simple Moving Average. A SMA200 é a média dos 200 últimos preços de fechamento, simples assim.'
    },
    {
      q: 'O que significa o preço de uma ação estar acima da SMA200?',
      options: [
        'A. A ação vai subir amanhã com certeza',
        'B. A ação está em tendência de alta de longo prazo',
        'C. O ATR está alto',
        'D. O volume está acima da média'
      ],
      correct: 1,
      correctFeedback: 'Correto! Preço acima da SMA200 = contexto de alta de longo prazo. É um dos filtros mais importantes do Momentum.',
      wrongFeedback: 'Preço acima da SMA200 significa tendência de alta de longo prazo — na média dos 200 dias, quem comprou está lucrando.'
    },
    {
      q: 'O que é um Golden Cross?',
      options: [
        'A. Quando o RSI ultrapassa 70',
        'B. Quando o preço cruza acima da SMA200',
        'C. Quando a SMA50 cruza acima da SMA200',
        'D. Quando o MACD cruza acima do zero'
      ],
      correct: 2,
      correctFeedback: 'Perfeito! Golden Cross = SMA50 cruzando acima da SMA200. Um dos sinais de alta mais poderosos da análise técnica.',
      wrongFeedback: 'Golden Cross é quando a SMA50 cruza acima da SMA200 — sinal raro e poderoso de virada pra tendência de alta.'
    },
    {
      q: 'Como o Momentum usa a SMA50 e SMA200 nos sinais?',
      options: [
        'A. Só mostra compra quando SMA200 > SMA50',
        'B. Ignora as médias e usa só o RSI',
        'C. Filtra sinais de compra apenas quando SMA50 > SMA200',
        'D. Usa SMA9 como filtro principal'
      ],
      correct: 2,
      correctFeedback: 'Exato! O Momentum só considera sinal de compra se SMA50 > SMA200 — o filtro de mercado touro.',
      wrongFeedback: 'O Momentum usa SMA50 > SMA200 como filtro. Só quando esse critério é atendido o app considera sinais de compra.'
    },
    {
      q: 'O que acontece quando a SMA50 cruza abaixo da SMA200?',
      options: [
        'A. É chamado de Golden Cross e é sinal de alta',
        'B. É chamado de Death Cross e indica tendência de baixa',
        'C. O preço vai lateralizar por 200 dias',
        'D. O volume aumenta automaticamente'
      ],
      correct: 1,
      correctFeedback: 'Correto! Death Cross = SMA50 abaixo da SMA200. Sinal de alerta — tendência de baixa no longo prazo.',
      wrongFeedback: 'Quando SMA50 cruza abaixo da SMA200 é o Death Cross — sinal de tendência de baixa. O oposto do Golden Cross.'
    },
    {
      q: 'Por que a SMA50 funciona como suporte dinâmico em tendências de alta?',
      options: [
        'A. Porque é calculada pelo Banco Central',
        'B. Porque muitos investidores compram quando o preço recua até a média, criando demanda',
        'C. Porque o volume sempre aumenta quando o preço toca a SMA50',
        'D. Porque a SMA50 impede quedas maiores que 5%'
      ],
      correct: 1,
      correctFeedback: 'Isso! Quando o preço toca a SMA50, muitos veem como desconto e compram — isso cria o "pulo" de volta.',
      wrongFeedback: 'É psicologia de mercado: quando o preço recua à SMA50, muitos investidores compram enxergando desconto. Essa demanda empurra o preço de volta.'
    }
  ]
},

'bb': {
  totalSteps: 5,
  sections: [
    {
      icon: '📉',
      title: 'O Que São as Bandas de Bollinger',
      hook: 'Imagine um canal que se expande quando o mercado fica nervoso e se estreita quando ele está calmo — é isso que as Bandas de Bollinger mostram.',
      content: '<p><strong>Bandas de Bollinger</strong> são três linhas desenhadas em volta do preço. A linha do meio é a <strong>SMA20</strong> — média dos últimos 20 dias. As bandas superior e inferior ficam a <strong>2 desvios padrão</strong> acima e abaixo dessa média.</p><p>O desvio padrão mede o quanto os preços se afastaram da média. <strong>Quando o mercado está agitado, as bandas se abrem</strong>. Quando está calmo, as bandas se fecham. É um indicador automático de volatilidade — sem precisar calcular ATR.</p><p>Cerca de <strong>95% dos preços ficam dentro das bandas</strong>. Quando o preço toca ou ultrapassa uma das bandas, é fora do padrão — e isso chama atenção. Não é automaticamente hora de comprar ou vender, mas é sinal pra prestar atenção.</p>',
      chart: 'chartBollingerBands'
    },
    {
      icon: '💥',
      title: 'O Squeeze — Quando a Volatilidade Explode',
      hook: 'Bandas estreitas são como uma mola comprimida — quanto mais tempo comprimida, mais forte a explosão quando soltar.',
      content: '<p>O <strong>Squeeze de Bollinger</strong> acontece quando as bandas ficam muito próximas entre si por vários dias seguidos. Isso indica que a volatilidade está baixíssima — o mercado está "em silêncio".</p><p>Historicamente, <strong>períodos de baixa volatilidade são seguidos de alta volatilidade.</strong> O Squeeze sinaliza que um movimento forte está se preparando — mas não diz pra qual lado. O preço pode explodir pra cima ou pra baixo.</p><p>A estratégia é <strong>esperar a direção se confirmar.</strong> Quando as bandas começam a se abrir e o preço rompe uma delas com volume alto, esse é o sinal. Entrar antes do rompimento é apostar — entrar depois da confirmação é estratégia.</p>',
      chart: 'chartBollingerSqueeze'
    },
    {
      icon: '👀',
      title: 'Como Ler as Bandas na Prática',
      hook: 'As bandas não são sinais de compra e venda sozinhas — elas são o contexto que torna outros sinais mais fortes.',
      content: '<p>Em mercado <strong>lateralizado</strong> (sem tendência), o preço costuma quicar entre a banda inferior e a superior — o chamado <strong>Bollinger Bounce</strong>. Tocar a banda inferior pode ser oportunidade de compra; tocar a superior, de venda. Mas isso só funciona quando o mercado está realmente de lado.</p><p><strong>Em tendência forte de alta, o preço "caminha" pela banda superior</strong> — fica tocando ela ou até ultrapassando sem reverter. Nesse caso, tocar a banda superior não é sinal de venda, é sinal de força. Usar Bollinger como sinal de venda em tendências de alta é um erro clássico de iniciante.</p><p>A regra de ouro: <strong>primeiro identifique a tendência, depois use as bandas.</strong> RSI e SMA dizem a direção; as Bandas de Bollinger dizem se o momento está esticado ou não dentro dessa direção.</p>',
      chart: null
    },
    {
      icon: '📱',
      title: 'Bollinger no App Momentum',
      hook: 'O Momentum usa a posição do preço dentro das bandas como um dos componentes do score da ação.',
      content: '<p>O algoritmo do Momentum calcula a <strong>posição relativa do preço dentro das bandas</strong> — o chamado %B. Um %B próximo de 0 significa que o preço está perto da banda inferior; próximo de 1, da banda superior.</p><p>Isso entra no score junto com RSI, MACD, ADX e padrões gráficos. <strong>Preço perto da banda inferior com RSI abaixo de 40</strong> (sobrevendido) pesa positivamente para um sinal de compra. Já preço esticado na banda superior com RSI acima de 70 pode reduzir o score.</p><p>O Momentum também monitora o Squeeze: quando as bandas estão muito comprimidas, o app sinaliza esse estado — indicando que uma movimentação forte pode estar a caminho. <strong>Use esse sinal pra estar preparado, não pra agir antes de confirmar a direção.</strong></p>',
      chart: null
    }
  ],
  quiz: [
    {
      q: 'Qual é a linha do meio das Bandas de Bollinger?',
      options: [
        'A. SMA50',
        'B. SMA200',
        'C. SMA20',
        'D. EMA14'
      ],
      correct: 2,
      correctFeedback: 'Correto! A linha central é a SMA20 — média dos últimos 20 dias de fechamento.',
      wrongFeedback: 'A linha central das Bandas de Bollinger é a SMA20, a média simples dos últimos 20 pregões.'
    },
    {
      q: 'O que significa as bandas de Bollinger estarem muito estreitas (Squeeze)?',
      options: [
        'A. A ação vai cair com certeza',
        'B. A volatilidade está baixa e um movimento forte pode estar a caminho',
        'C. O volume está muito alto',
        'D. A SMA50 cruzou a SMA200'
      ],
      correct: 1,
      correctFeedback: 'Isso! Squeeze = bandas estreitas = baixa volatilidade. Historicamente isso precede um movimento explosivo.',
      wrongFeedback: 'Bandas estreitas = Squeeze = baixa volatilidade. Não diz a direção, mas indica que um movimento forte está se preparando.'
    },
    {
      q: 'Em uma tendência forte de alta, o preço toca a banda superior repetidamente. Isso significa:',
      options: [
        'A. Hora de vender — o preço está caro demais',
        'B. O preço vai cair pra banda inferior agora',
        'C. A tendência está forte — o preço pode continuar "caminhando" pela banda superior',
        'D. O ATR está muito baixo'
      ],
      correct: 2,
      correctFeedback: 'Perfeito! Em tendência forte, o preço pode caminhar pela banda superior por semanas. Vender só porque tocou a banda é erro de iniciante.',
      wrongFeedback: 'Em tendência forte, o preço "caminha" pela banda superior. Usar isso como sinal de venda sem checar a tendência é um erro clássico.'
    },
    {
      q: 'Qual porcentagem dos preços fica dentro das Bandas de Bollinger no padrão?',
      options: [
        'A. 50%',
        'B. 75%',
        'C. 90%',
        'D. 95%'
      ],
      correct: 3,
      correctFeedback: 'Isso! Com 2 desvios padrão, cerca de 95% dos preços ficam dentro das bandas. Sair delas é estatisticamente incomum.',
      wrongFeedback: 'Com 2 desvios padrão, 95% dos preços ficam dentro das bandas. Por isso quando o preço sai das bandas chama atenção.'
    },
    {
      q: 'O que é o "Bollinger Bounce" e quando funciona melhor?',
      options: [
        'A. Preço quicando entre as bandas — funciona melhor em mercado sem tendência',
        'B. Rompimento das bandas — funciona em tendência forte',
        'C. Cruzamento da SMA20 — funciona pra qualquer mercado',
        'D. Volume explodindo nas bandas — funciona no Squeeze'
      ],
      correct: 0,
      correctFeedback: 'Certo! Bollinger Bounce é o preço quicando entre as bandas. Funciona bem quando o mercado está lateralizado.',
      wrongFeedback: 'Bollinger Bounce = preço quicando entre as bandas. Essa estratégia funciona melhor em mercado lateralizado, sem tendência definida.'
    },
    {
      q: 'Como o Momentum usa as Bandas de Bollinger no score de uma ação?',
      options: [
        'A. Dobra o score quando o preço toca a banda superior',
        'B. Usa a posição relativa do preço dentro das bandas (%B) como um dos componentes do score',
        'C. Usa as bandas como único sinal de compra ou venda',
        'D. Ignora as bandas e usa só RSI e MACD'
      ],
      correct: 1,
      correctFeedback: 'Isso! O Momentum calcula o %B (posição dentro das bandas) e usa isso junto com RSI, MACD e padrões no score final.',
      wrongFeedback: 'O app usa %B — posição do preço dentro das bandas — como um componente do score. Nunca é o único fator.'
    }
  ]
},

'patterns': {
  totalSteps: 5,
  sections: [
    {
      icon: '🧠',
      title: 'Por Que Padrões Funcionam',
      hook: 'Padrões gráficos funcionam porque o ser humano reage ao medo e à ganância sempre da mesma forma — e isso aparece no gráfico.',
      content: '<p>O mercado é feito de pessoas comprando e vendendo com base em emoções e expectativas. <strong>Quando muitos investidores reagem da mesma forma às mesmas situações, padrões visuais se repetem</strong> nos gráficos — e analistas aprenderam a reconhecê-los ao longo de décadas.</p><p>Um padrão gráfico é uma <strong>fotografia da psicologia do mercado.</strong> Um Martelo no fundo de uma queda mostra que os vendedores tentaram empurrar mais pra baixo, mas os compradores reagiram com força e fecharam perto da máxima. Isso revela mudança de sentimento — e pode ser o início de uma reversão.</p><p><strong>Padrões sozinhos não são suficientes.</strong> Eles precisam ser confirmados por volume, RSI e contexto de tendência. Um padrão de alta em plena tendência de baixa com RSI caindo tem muito menos valor do que o mesmo padrão perto de um suporte com RSI sobrevendido.</p>',
      chart: null
    },
    {
      icon: '🕯️',
      title: 'Padrões de Velas — Os Mais Comuns',
      hook: 'Três velas mudam o jogo: o Martelo mostra reação dos compradores, o Doji mostra dúvida, e o Engolfo mostra virada.',
      content: '<p>O <strong>Martelo (Hammer)</strong> tem um corpo pequeno no topo e uma sombra longa embaixo. Aparece no fundo de uma queda e mostra que os vendedores tentaram derrubar mais, mas os compradores reagiram e puxaram de volta pra cima. É sinal de reversão de alta — especialmente com volume acima da média.</p><p>O <strong>Doji</strong> tem abertura e fechamento quase iguais — o corpo é mínimo. Representa indecisão: compradores e vendedores empataram. Após um movimento longo de alta ou baixa, um Doji avisa que a força está se esgotando. Atenção ao próximo candle.</p><p>O <strong>Engolfo de Alta (Bullish Engulfing)</strong> é uma vela vermelha seguida de uma vela verde que "engole" a primeira completamente. Mostra que os compradores tomaram o controle com força. Combinado com RSI abaixo de 40 e próximo de suporte, é um dos sinais mais confiáveis da análise técnica.</p>',
      chart: 'chartCandlePatterns'
    },
    {
      icon: '📐',
      title: 'Padrões de Gráfico — Reversão e Continuação',
      hook: 'Alguns padrões duram semanas ou meses — são mudanças de tendência se formando lentamente no gráfico.',
      content: '<p>O <strong>Ombro-Cabeça-Ombro (Head and Shoulders)</strong> é o padrão de reversão de alta mais famoso. Forma três topos: o do meio é mais alto (a cabeça). Quando o preço rompe abaixo da linha do pescoço, a tendência de alta acabou. Em sentido inverso, indica reversão de baixa.</p><p>O <strong>Topo Duplo (Double Top)</strong> mostra duas tentativas de superar a mesma resistência com falha em ambas. O mercado tentou subir, não conseguiu, tentou de novo, não conseguiu — e aí cede. O <strong>Fundo Duplo</strong> é o inverso, um padrão de alta.</p><p>A <strong>Bandeira (Flag)</strong> é um padrão de continuação: após um movimento forte, o preço consolida em um canal levemente oposto antes de retomar a direção original. É uma pausa, não uma reversão — e costuma ser seguida de movimento similar ao que veio antes.</p>',
      chart: null
    },
    {
      icon: '📱',
      title: 'Padrões no App Momentum',
      hook: 'O Momentum detecta padrões automaticamente e adiciona pontos ao score da ação quando confirma um padrão válido.',
      content: '<p>O algoritmo do Momentum analisa os últimos candles de cada ação em busca de padrões reconhecíveis. Quando um padrão confirmado é detectado, ele <strong>adiciona 0,5 ponto ao score da ação</strong> — que vai de 0 a 5. Isso pode ser o diferencial que eleva um sinal de "neutro" para "compra".</p><p>A detecção considera <strong>contexto e confirmação.</strong> Um Martelo no fundo de uma queda com RSI abaixo de 40 tem peso diferente de um Martelo no meio de uma tendência sem contexto. O app combina padrão + posição de RSI + tendência de SMA pra validar o sinal.</p><p>Na tela de detalhe de cada ação, o campo <strong>"Padrão detectado"</strong> mostra qual padrão o app identificou. Use isso como uma camada extra de confirmação — nunca como único motivo pra entrar numa operação. <strong>O melhor sinal é quando tudo aponta na mesma direção.</strong></p>',
      chart: null
    }
  ],
  quiz: [
    {
      q: 'Por que padrões gráficos se repetem no mercado?',
      options: [
        'A. Por causa de algoritmos que manipulam os preços',
        'B. Porque humanos reagem ao medo e à ganância de forma parecida em situações similares',
        'C. Porque as corretoras programam os preços assim',
        'D. Por causa da influência da lua nos mercados'
      ],
      correct: 1,
      correctFeedback: 'Exato! Padrões são a psicologia humana visível no gráfico — o medo e a ganância criam os mesmos desenhos repetidamente.',
      wrongFeedback: 'Padrões existem porque humanos reagem de forma similar a situações similares. Medo e ganância criam os mesmos movimentos no gráfico.'
    },
    {
      q: 'O que um candle Martelo (Hammer) indica?',
      options: [
        'A. Tendência de baixa continuando',
        'B. Reversão de alta — compradores reagiram com força no fundo',
        'C. Mercado sem direção definida',
        'D. Volume acima da média'
      ],
      correct: 1,
      correctFeedback: 'Correto! O Martelo mostra que os vendedores tentaram ir mais baixo, mas os compradores reagiram e fecharam perto da máxima — reversão de alta.',
      wrongFeedback: 'O Martelo (Hammer) sinaliza reversão de alta: sombra longa embaixo mostra que compradores reagiram e empurraram o preço de volta pra cima.'
    },
    {
      q: 'O que é um Doji e o que ele sinaliza?',
      options: [
        'A. Vela com fechamento muito acima da abertura — sinal de compra forte',
        'B. Vela com abertura e fechamento quase iguais — sinaliza indecisão do mercado',
        'C. Duas velas vermelhas seguidas — sinal de queda',
        'D. Volume muito baixo num único pregão'
      ],
      correct: 1,
      correctFeedback: 'Isso! Doji = abertura ≈ fechamento = empatou. Sinaliza indecisão — fique atento ao próximo candle pra saber pra onde vai.',
      wrongFeedback: 'Doji tem abertura e fechamento quase iguais — o mercado empatou. Após um movimento longo, avisa que a força está acabando.'
    },
    {
      q: 'O que caracteriza o padrão Ombro-Cabeça-Ombro?',
      options: [
        'A. Três fundos — o do meio mais baixo — indicando continuação de alta',
        'B. Três topos — o do meio mais alto — seguidos de rompimento da linha do pescoço',
        'C. Duas bandeiras consecutivas com volume crescente',
        'D. Um squeeze de Bollinger seguido de rompimento'
      ],
      correct: 1,
      correctFeedback: 'Perfeito! Três topos, o do meio mais alto. Quando rompe a linha do pescoço, indica fim da tendência de alta.',
      wrongFeedback: 'Ombro-Cabeça-Ombro tem três topos com o central mais alto. O rompimento da linha do pescoço confirma a reversão de tendência de alta.'
    },
    {
      q: 'Uma Bandeira (Flag) é um padrão de:',
      options: [
        'A. Reversão — indica mudança de tendência',
        'B. Continuação — o preço pausa e retoma a direção original',
        'C. Indecisão — mercado não sabe pra onde vai',
        'D. Squeeze — bandas de Bollinger se comprimindo'
      ],
      correct: 1,
      correctFeedback: 'Correto! Bandeira é continuação: o preço pausa num canal depois de um movimento forte e depois retoma a direção.',
      wrongFeedback: 'Bandeira é padrão de continuação — o preço descansa num canal levemente oposto à tendência, depois continua na mesma direção.'
    },
    {
      q: 'Como o Momentum usa padrões no score de uma ação?',
      options: [
        'A. Padrão detectado dobra o score da ação',
        'B. Adiciona 0,5 ponto ao score quando um padrão confirmado é detectado',
        'C. Usa padrões como único critério de sinal de compra',
        'D. Subtrai pontos quando detecta padrão de reversão'
      ],
      correct: 1,
      correctFeedback: 'Isso! Padrão confirmado = +0,5 no score. Pode ser o diferencial entre neutro e compra, mas nunca é o único fator.',
      wrongFeedback: 'O Momentum adiciona 0,5 ponto ao score quando detecta um padrão confirmado. É um componente, não o critério único.'
    }
  ]
}
,


'tesouro': {
  totalSteps: 5,
  sections: [
    {
      icon: '🏛️',
      title: 'O Que é o Tesouro Direto',
      hook: 'O investimento mais seguro do Brasil está disponível a partir de R$30 — e qualquer pessoa pode comprar.',
      content: '<p>O <strong>Tesouro Direto</strong> é um programa do governo federal que permite a qualquer cidadão emprestar dinheiro para o governo e receber juros em troca. É considerado o investimento de menor risco do país, pois é garantido pelo próprio Tesouro Nacional.</p><p>Funciona como um título: você compra, o governo usa esse dinheiro para pagar suas despesas e te devolve o valor corrigido com juros na data de vencimento. O risco de calote é praticamente zero — o governo brasileiro nunca deixou de pagar seus títulos.</p><p>A grande novidade do Tesouro Direto é a <strong>acessibilidade</strong>: você pode começar com cerca de R$30 a R$100, sem precisar de conta em banco grande ou de muito dinheiro guardado. Tudo é feito pelo site do Tesouro ou por corretoras parceiras.</p>',
      chart: null
    },
    {
      icon: '📊',
      title: 'Os 3 Tipos de Tesouro',
      hook: 'Cada tipo de Tesouro tem uma personalidade diferente — escolher o certo faz toda a diferença no seu bolso.',
      content: '<p>O <strong>Tesouro Selic</strong> acompanha a taxa Selic (a taxa básica de juros do Brasil). É o mais indicado para quem quer liquidez diária — você pode resgatar a qualquer momento sem perder dinheiro. Perfeito para a reserva de emergência.</p><p>O <strong>Tesouro IPCA+</strong> paga a inflação (IPCA) mais um percentual fixo. Se o IPCA for 5% e o título pagar IPCA+6%, você ganha 11%. Protege seu dinheiro da inflação e é ideal para objetivos de longo prazo como aposentadoria.</p><p>O <strong>Tesouro Prefixado</strong> tem uma taxa fixa definida no momento da compra. Se você comprar Prefixado 12% ao ano, receberá exatamente isso — independente do que acontecer com os juros. É ótimo quando você acredita que as taxas vão cair.</p>',
      chart: 'chartTesouroTypes'
    },
    {
      icon: '📋',
      title: 'Imposto de Renda no Tesouro',
      hook: 'Quanto mais tempo você deixa o dinheiro investido, menos imposto você paga — o governo recompensa a paciência.',
      content: '<p>O Imposto de Renda sobre o Tesouro Direto segue uma <strong>tabela regressiva</strong>: quanto mais tempo você mantém o investimento, menor a alíquota. Até 180 dias: 22,5%. De 181 a 360 dias: 20%. De 361 a 720 dias: 17,5%. Acima de 720 dias: 15%.</p><p>Além do IR, existe o <strong>IOF (Imposto sobre Operações Financeiras)</strong> se você resgatar antes de 30 dias. O IOF começa em 96% do rendimento no primeiro dia e vai caindo até zero no 30º dia. Regra prática: nunca resgate antes de 30 dias.</p><p>O IR é <strong>retido na fonte</strong>: quando você resgata, a corretora já desconta o imposto automaticamente. Você não precisa calcular nada — o valor que cai na sua conta já é o líquido. Isso facilita muito a vida comparado a ações e fundos.</p>',
      chart: null
    },
    {
      icon: '🎯',
      title: 'Qual Escolher e Quando',
      hook: 'Não existe o Tesouro certo para todos — existe o Tesouro certo para o seu momento de vida.',
      content: '<p>Use o <strong>Tesouro Selic</strong> para sua reserva de emergência (3 a 6 meses de gastos) e para guardar dinheiro que você pode precisar a qualquer hora. Ele nunca perde valor antes do vencimento — mesmo se você resgatar no dia seguinte, você recebe tudo que rendeu.</p><p>Use o <strong>Tesouro IPCA+</strong> para objetivos de longo prazo: aposentadoria, educação dos filhos, compra de imóvel em 10 ou 15 anos. Ele garante que seu dinheiro vai crescer acima da inflação, preservando seu poder de compra no futuro.</p><p>Use o <strong>Tesouro Prefixado</strong> quando você acredita que a Selic vai cair bastante nos próximos anos. Se hoje a Selic está alta e você trava uma taxa de 13% ao ano por 3 anos, mesmo que a Selic caia para 9%, você continua recebendo 13%. Mas atenção: se precisar resgatar antes do vencimento e as taxas subirem, pode ter perda.</p>',
      chart: null
    }
  ],
  quiz: [
    {
      q: 'Qual é o nível de risco do Tesouro Direto comparado a outros investimentos?',
      options: [
        'A. Alto risco, similar a ações',
        'B. Risco médio, similar a fundos multimercado',
        'C. Risco muito baixo, garantido pelo governo federal',
        'D. Risco zero absoluto, sem nenhuma possibilidade de perda'
      ],
      correct: 2,
      correctFeedback: 'Exato! O Tesouro Direto é garantido pelo governo federal, sendo o investimento de menor risco do Brasil. Há risco mínimo de mercado se você resgatar antes do vencimento, mas nenhum risco de calote.',
      wrongFeedback: 'O Tesouro Direto é garantido pelo Tesouro Nacional (governo federal), tornando-o o investimento de menor risco no Brasil. Não é risco zero absoluto pois pode haver variação de preço antes do vencimento.'
    },
    {
      q: 'Qual tipo de Tesouro é mais indicado para a reserva de emergência?',
      options: [
        'A. Tesouro Prefixado, pois tem taxa garantida',
        'B. Tesouro IPCA+, pois protege da inflação',
        'C. Tesouro Selic, pois tem liquidez diária sem risco de perda',
        'D. Qualquer um dos três, pois todos têm liquidez diária'
      ],
      correct: 2,
      correctFeedback: 'Correto! O Tesouro Selic é o ideal para reserva de emergência porque você pode resgatar a qualquer momento sem risco de perda, diferente dos outros tipos que podem ter variação negativa se resgatados antes do vencimento.',
      wrongFeedback: 'O Tesouro Selic é o mais indicado. Ele acompanha a Selic diariamente e pode ser resgatado a qualquer momento sem perder valor. O IPCA+ e o Prefixado podem ter perda se resgatados antes do vencimento.'
    },
    {
      q: 'Qual é a alíquota de IR para um investimento no Tesouro Direto mantido por 2 anos (730 dias)?',
      options: [
        'A. 22,5%',
        'B. 20%',
        'C. 17,5%',
        'D. 15%'
      ],
      correct: 3,
      correctFeedback: 'Perfeito! Para investimentos mantidos por mais de 720 dias, a alíquota de IR é de 15% — a menor da tabela regressiva. Isso premia quem tem paciência e mantém o investimento por mais tempo.',
      wrongFeedback: 'Para investimentos acima de 720 dias (aproximadamente 2 anos), a alíquota de IR é de 15%, que é a menor alíquota da tabela regressiva do Tesouro Direto.'
    },
    {
      q: 'O que acontece se você resgatar um Tesouro Direto antes de 30 dias?',
      options: [
        'A. Você perde todo o rendimento do período',
        'B. Você paga IOF além do IR normal',
        'C. O resgate é bloqueado e só libera após 30 dias',
        'D. Você paga multa de 2% sobre o valor total'
      ],
      correct: 1,
      correctFeedback: 'Correto! O IOF (Imposto sobre Operações Financeiras) é cobrado nos primeiros 30 dias de forma regressiva — começa em 96% do rendimento no 1º dia e vai a zero no 30º dia. Por isso, evite resgatar antes de 30 dias.',
      wrongFeedback: 'Se você resgatar antes de 30 dias, paga IOF além do IR. O IOF começa em 96% do rendimento no 1º dia e reduz progressivamente até zero no 30º dia. O resgate não é bloqueado, mas não compensa financeiramente.'
    },
    {
      q: 'Para qual objetivo o Tesouro IPCA+ é mais adequado?',
      options: [
        'A. Guardar o dinheiro do aluguel do próximo mês',
        'B. Construir patrimônio para aposentadoria em 15 anos',
        'C. Fazer uma viagem daqui 6 meses',
        'D. Ter uma reserva para emergências do dia a dia'
      ],
      correct: 1,
      correctFeedback: 'Exato! O Tesouro IPCA+ é ideal para objetivos de longo prazo como aposentadoria, pois protege o poder de compra contra a inflação e paga um rendimento real por cima. Para 15 anos, os juros compostos fazem um trabalho incrível.',
      wrongFeedback: 'O Tesouro IPCA+ é melhor para objetivos de longo prazo como aposentadoria. Para guardar dinheiro de curto prazo ou reserva de emergência, use o Tesouro Selic, que tem liquidez diária e sem risco de perda antecipada.'
    },
    {
      q: 'Qual é o valor mínimo aproximado para investir no Tesouro Direto?',
      options: [
        'A. R$1.000',
        'B. R$500',
        'C. R$30 a R$100 (dependendo do título)',
        'D. R$5.000'
      ],
      correct: 2,
      correctFeedback: 'Correto! O Tesouro Direto permite investir a partir de R$30 a R$100, dependendo do tipo de título e do preço atual. Isso o torna acessível para qualquer pessoa começar a investir com pouco dinheiro.',
      wrongFeedback: 'O Tesouro Direto é super acessível! Você pode começar com apenas R$30 a R$100, dependendo do tipo de título. Você compra frações dos títulos, então não precisa do valor cheio de uma vez.'
    }
  ]
},

'cdb_cdi': {
  totalSteps: 5,
  sections: [
    {
      icon: '📈',
      title: 'CDI — O Termômetro da Renda Fixa',
      hook: 'O CDI é o número que move todos os investimentos de renda fixa no Brasil — entendê-lo é entender o mercado.',
      content: '<p>O <strong>CDI (Certificado de Depósito Interbancário)</strong> é a taxa que os bancos cobram uns dos outros quando precisam de dinheiro emprestado por uma noite. É como um termômetro: mede a temperatura do crédito no sistema financeiro brasileiro.</p><p>O CDI anda quase colado à taxa <strong>Selic</strong> — a taxa básica de juros definida pelo Banco Central. Na prática, CDI e Selic são quase iguais. Quando a Selic sobe, o CDI sobe junto. Quando cai, o CDI cai também. Hoje, com a Selic a ~13,75%, o CDI fica em torno de 13,65% ao ano.</p><p>Por que isso importa para você? Porque quase toda renda fixa no Brasil usa o CDI como referência. Quando um banco oferece um CDB a "110% do CDI", significa que você ganha 110% do que o CDI render. <strong>Quanto maior o percentual do CDI, melhor para você.</strong></p>',
      chart: 'chartCDIvsSelicRate'
    },
    {
      icon: '🏦',
      title: 'CDB — Emprestando Dinheiro para o Banco',
      hook: 'Quando você investe em CDB, você vira o banco — e cobra juros pelo dinheiro que empresta.',
      content: '<p>O <strong>CDB (Certificado de Depósito Bancário)</strong> é um título emitido por bancos para captar dinheiro dos clientes. Em troca, o banco paga juros sobre o valor investido. É literalmente você emprestando dinheiro para o banco — e o banco pagando por isso.</p><p>A taxa varia muito dependendo do banco. <strong>Bancos grandes</strong> (Itaú, Bradesco, BB) pagam menos porque já têm muito dinheiro e não precisam captar tanto: geralmente 80% a 90% do CDI. <strong>Bancos médios e digitais</strong> (Nubank, Inter, C6, PicPay) precisam captar mais e pagam melhor: 100% a 130% do CDI ou mais.</p><p>Existem dois tipos principais: o <strong>CDB com liquidez diária</strong>, que você pode resgatar a qualquer dia (mas geralmente paga menos), e o <strong>CDB com prazo fixo</strong>, que prende o dinheiro por um período (90 dias, 1 ano, 2 anos) mas paga taxas maiores. Se vai precisar do dinheiro, prefira liquidez diária.</p>',
      chart: null
    },
    {
      icon: '🛡️',
      title: 'FGC — Seu Dinheiro Garantido até R$250k',
      hook: 'Mesmo que o banco quebre, seu dinheiro em CDB está protegido — o FGC existe justamente para isso.',
      content: '<p>O <strong>FGC (Fundo Garantidor de Créditos)</strong> é uma entidade privada, mantida pelos próprios bancos, que garante seu dinheiro caso a instituição financeira quebre. A cobertura é de até <strong>R$250.000 por CPF por instituição financeira</strong>.</p><p>Isso significa que, se você tiver R$200.000 em CDB no Banco X e ele falir, você recebe de volta os R$200.000 corrigidos. Se tiver R$300.000, recebe R$250.000 e perde os outros R$50.000. Por isso, ao investir valores altos, distribua entre diferentes bancos para não passar do limite.</p><p>O limite global do FGC é de <strong>R$1 milhão por CPF a cada 4 anos</strong> em todas as instituições somadas. Para a maioria das pessoas, o limite de R$250k por banco é mais do que suficiente. O FGC já pagou bilhões aos investidores e nunca deixou de honrar seus compromissos desde 1995.</p>',
      chart: null
    },
    {
      icon: '⚖️',
      title: 'CDB vs Tesouro — Como Comparar',
      hook: 'A comparação certa não é qual paga mais no papel — é qual deixa mais dinheiro no seu bolso depois do imposto.',
      content: '<p>Para comparar CDB e Tesouro Direto, sempre olhe a <strong>taxa líquida</strong> (depois do IR). Ambos seguem a mesma tabela de IR regressiva (22,5% a 15%). O CDB de banco digital que paga 110% do CDI pode ser mais rentável que o Tesouro Selic que paga ~100% do CDI.</p><p>Verifique sempre: <strong>1) A porcentagem do CDI</strong> — acima de 100% é bom; <strong>2) O prazo</strong> — CDB com prazo fixo geralmente paga mais, mas você não pode sacar antes; <strong>3) O limite do FGC</strong> — se você vai passar de R$250k naquela instituição, diversifique; <strong>4) A liquidez</strong> — o Tesouro Selic sempre tem liquidez diária sem perda.</p><p>Regra prática: para <strong>reserva de emergência</strong>, Tesouro Selic ou CDB com liquidez diária de 100%+ CDI. Para <strong>dinheiro parado por mais de 1 ano</strong>, procure CDBs de bancos digitais com 110%+ CDI e prazo compatível com seu objetivo. O FGC protege o risco de crédito do banco.</p>',
      chart: null
    }
  ],
  quiz: [
    {
      q: 'O que significa um CDB que paga "110% do CDI"?',
      options: [
        'A. Você ganha 110% de lucro sobre o valor investido',
        'B. Você recebe 110% do que o CDI render no período',
        'C. O banco cobra 10% de taxa sobre o rendimento do CDI',
        'D. Você ganha 10% a mais que a inflação'
      ],
      correct: 1,
      correctFeedback: 'Exato! Se o CDI render 13% ao ano e o CDB paga 110% do CDI, você ganha 13% × 1,10 = 14,3% ao ano. Quanto maior o percentual do CDI, melhor para você como investidor.',
      wrongFeedback: '110% do CDI significa que você recebe 110% do rendimento do CDI. Se o CDI render 13% ao ano, você ganha 13% × 1,10 = 14,3% ao ano. Não tem relação com lucro total ou taxa sobre rendimento.'
    },
    {
      q: 'Por que bancos digitais geralmente pagam mais que os grandes bancos nos CDBs?',
      options: [
        'A. Porque os bancos digitais são mais seguros',
        'B. Porque grandes bancos têm mais clientes e menos necessidade de captar dinheiro',
        'C. Porque CDBs de bancos digitais não pagam IR',
        'D. Porque o Banco Central obriga bancos pequenos a pagar mais'
      ],
      correct: 1,
      correctFeedback: 'Correto! Grandes bancos têm toneladas de depósitos em conta corrente e poupança, então não precisam oferecer CDBs tão rentáveis para captar dinheiro. Bancos digitais e médios precisam competir mais para atrair capital.',
      wrongFeedback: 'A lógica é simples: grandes bancos já têm muito dinheiro dos correntistas e não precisam oferecer taxas altas para captar. Bancos digitais precisam ser mais competitivos para atrair investidores, por isso pagam mais.'
    },
    {
      q: 'Qual é o valor máximo garantido pelo FGC por CPF em uma mesma instituição?',
      options: [
        'A. R$100.000',
        'B. R$500.000',
        'C. R$1.000.000',
        'D. R$250.000'
      ],
      correct: 3,
      correctFeedback: 'Correto! O FGC garante até R$250.000 por CPF por instituição financeira. Se você investir R$300.000 em CDB de um banco que quebrar, receberá apenas R$250.000 de volta. Para valores maiores, distribua entre diferentes bancos.',
      wrongFeedback: 'O FGC garante exatamente R$250.000 por CPF por instituição. Isso significa que você pode ter até esse valor em CDB de um mesmo banco sem se preocupar com risco de crédito. Acima disso, distribua em outras instituições.'
    },
    {
      q: 'O CDI e a Selic têm qual relação?',
      options: [
        'A. São completamente independentes',
        'B. CDI é sempre o dobro da Selic',
        'C. Andam muito próximos — CDI geralmente fica ligeiramente abaixo da Selic',
        'D. Selic segue o CDI, não o contrário'
      ],
      correct: 2,
      correctFeedback: 'Perfeito! O CDI anda quase colado à Selic, geralmente 0,10% abaixo. Quando o Banco Central muda a Selic, o CDI se ajusta automaticamente. Por isso, quando dizem que o Tesouro Selic rende "100% do CDI", é quase a mesma coisa que render a Selic.',
      wrongFeedback: 'O CDI e a Selic andam juntos — o CDI é geralmente 0,10% menor que a Selic. São diferentes taxas mas com valores muito próximos. O Banco Central define a Selic, e o CDI se ajusta ao mercado interbancário quase que automaticamente.'
    },
    {
      q: 'Qual tipo de CDB é mais adequado para quem pode precisar do dinheiro a qualquer momento?',
      options: [
        'A. CDB com prazo fixo de 2 anos (paga mais)',
        'B. CDB com liquidez diária',
        'C. CDB com prazo fixo de 90 dias',
        'D. Qualquer CDB, pois todos permitem resgate a qualquer hora'
      ],
      correct: 1,
      correctFeedback: 'Correto! O CDB com liquidez diária permite resgate a qualquer momento sem perda. Embora pague um pouco menos que CDBs com prazo fixo, é o ideal para reserva de emergência ou dinheiro que você pode precisar.',
      wrongFeedback: 'CDBs com prazo fixo podem não permitir resgate antecipado ou cobrar penalidades. Para dinheiro que você pode precisar a qualquer hora, o CDB com liquidez diária é a escolha certa, mesmo pagando um pouco menos.'
    },
    {
      q: 'Qual é o limite global do FGC por CPF, considerando todas as instituições somadas?',
      options: [
        'A. R$250.000 no total',
        'B. R$500.000 no total',
        'C. R$1.000.000 a cada 4 anos',
        'D. Não tem limite global, é R$250k por banco sem restrição'
      ],
      correct: 2,
      correctFeedback: 'Correto! O FGC tem um teto global de R$1 milhão por CPF a cada 4 anos, somando todas as instituições. Na prática, para a maioria das pessoas, o limite de R$250k por banco é mais relevante e suficiente.',
      wrongFeedback: 'Além do limite de R$250k por instituição, o FGC tem um teto global de R$1 milhão por CPF a cada 4 anos, considerando todas as instituições somadas. Para grandes patrimônios, isso é um fator importante a considerar.'
    }
  ]
},

'lci_lca': {
  totalSteps: 5,
  sections: [
    {
      icon: '🌾',
      title: 'LCI e LCA — A Vantagem da Isenção',
      hook: 'Imagine ganhar rendimento de renda fixa e não pagar nenhum imposto — é exatamente isso que LCI e LCA oferecem.',
      content: '<p>A <strong>LCI (Letra de Crédito Imobiliário)</strong> é um título emitido por bancos para financiar o setor imobiliário. A <strong>LCA (Letra de Crédito do Agronegócio)</strong> financia o agronegócio brasileiro. Os dois funcionam de forma similar: você empresta dinheiro ao banco, e o banco direciona para esses setores.</p><p>A grande vantagem é a <strong>isenção total de Imposto de Renda</strong> para pessoas físicas. Isso mesmo: zero de IR. Enquanto CDB e Tesouro Direto pagam de 15% a 22,5% de IR sobre os ganhos, LCI e LCA ficam com 100% do rendimento para você. Isso é determinado por lei para incentivar o financiamento desses setores estratégicos.</p><p>O governo abre mão da arrecadação de IR para que os bancos consigam captar dinheiro mais barato e emprestar para construção de imóveis e agronegócio. Você se beneficia como investidor. O banco se beneficia com captação. O setor se beneficia com crédito. É uma estratégia de política econômica que funciona para os três lados.</p>',
      chart: null
    },
    {
      icon: '📊',
      title: 'LCI vs CDB: A Comparação Correta',
      hook: 'Uma LCI que paga menos que um CDB pode ser mais rentável — tudo depende de fazer a conta certa.',
      content: '<p>O erro mais comum é comparar a taxa bruta de LCI com a taxa bruta de CDB. <strong>A comparação certa é sempre pela taxa líquida</strong> (depois do imposto). Fórmula: Taxa Líquida do CDB = Taxa Bruta × (1 - alíquota de IR).</p><p>Exemplo prático: CDB de 110% do CDI com IR de 20% (investimento de 6 meses). Taxa líquida = 110% × (1 - 0,20) = 88% do CDI. Se uma LCI oferecer 89% do CDI isento de IR, a LCI ganha! Mesmo sendo nominalmente menor, o dinheiro líquido na sua mão é maior.</p><p>Para o prazo mais longo (acima de 720 dias), o IR cai para 15%. Aí: CDB de 110% × (1 - 0,15) = 93,5% do CDI líquido. Nesse caso, a LCI precisa pagar mais de 93,5% do CDI para valer mais. <strong>Quanto mais curto o prazo, maior a vantagem da LCI</strong>, pois o IR do CDB é mais pesado.</p>',
      chart: 'chartTaxComparison'
    },
    {
      icon: '🛡️',
      title: 'FGC e Prazos de Carência',
      hook: 'LCI e LCA também têm proteção do FGC, mas exigem um compromisso mínimo de tempo — saiba antes de investir.',
      content: '<p>Assim como o CDB, LCI e LCA são <strong>garantidos pelo FGC</strong> (Fundo Garantidor de Créditos) até R$250.000 por CPF por instituição financeira. Se o banco emissor da sua LCI quebrar, você recebe o dinheiro de volta pelo FGC, até esse limite.</p><p>A diferença importante é o <strong>prazo de carência</strong>: a lei exige que LCI e LCA tenham um prazo mínimo antes de você poder resgatar. Geralmente é de 90 dias (3 meses) para LCI e 90 dias para LCA. Algumas são de 180 dias, 1 ano ou 2 anos. Isso é para garantir que o dinheiro realmente vá para o setor que a lei quer financiar.</p><p>Na prática: <strong>não invista em LCI ou LCA dinheiro que pode precisar antes do prazo de carência</strong>. Se precisar resgatar antes, em muitos casos não é possível ou você perde parte do rendimento. Verifique o prazo de carência antes de investir — é uma informação obrigatória na oferta do produto.</p>',
      chart: null
    },
    {
      icon: '🎯',
      title: 'Quando LCI/LCA é Melhor?',
      hook: 'Com a conta certa na mão, fica fácil saber quando a isenção de IR vale mais que uma taxa maior de CDB.',
      content: '<p>LCI/LCA é melhor quando a taxa líquida supera o CDB equivalente. Use a fórmula: <strong>LCI vence se: Taxa LCI > Taxa CDB × (1 - IR%)</strong>. Para prazo curto (até 6 meses, IR 22,5%): LCI de 86%+ do CDI supera CDB de 110% do CDI. Para prazo médio (1-2 anos, IR 17,5%): LCI de 91%+ supera o mesmo CDB.</p><p>LCI e LCA são especialmente interessantes para <strong>valores mais altos</strong>: R$10.000, R$50.000, R$100.000 ou mais. A economia de IR se torna muito relevante quanto maior o capital. Para R$50.000 investidos por 2 anos, a diferença pode ser de R$1.000 a R$3.000 a mais no bolso.</p><p>Estratégia prática: <strong>combine os dois</strong>. Use Tesouro Selic ou CDB com liquidez diária para sua reserva de emergência. Para dinheiro que vai ficar parado por 90 dias ou mais, pesquise LCI e LCA em bancos digitais e compare as taxas líquidas. Plataformas como XP, BTG e Rico listam várias opções lado a lado para facilitar a comparação.</p>',
      chart: null
    }
  ],
  quiz: [
    {
      q: 'Qual é a principal vantagem fiscal de LCI e LCA para pessoas físicas?',
      options: [
        'A. Pagam apenas 7,5% de IR, a metade da alíquota mínima normal',
        'B. São 100% isentas de Imposto de Renda',
        'C. Têm IR diferido — só pagam quando resgatam após 5 anos',
        'D. O IR é pago pelo banco emissor, não pelo investidor'
      ],
      correct: 1,
      correctFeedback: 'Exato! LCI e LCA são completamente isentas de IR para pessoas físicas. Isso é uma vantagem enorme porque o rendimento líquido é igual ao bruto — você fica com 100% dos juros.',
      wrongFeedback: 'LCI e LCA são 100% isentas de IR para pessoas físicas. Não há alíquota reduzida, nem diferimento — simplesmente não há cobrança de IR. Por isso, mesmo com taxas nominais menores, podem superar CDBs após a dedução do imposto.'
    },
    {
      q: 'Um CDB paga 110% do CDI com IR de 20% (6 meses). Uma LCI paga 88% do CDI isenta. Qual é melhor?',
      options: [
        'A. O CDB, pois 110% é maior que 88%',
        'B. A LCI, pois 88% líquido é maior que 88% líquido do CDB',
        'C. São iguais nesse caso',
        'D. O CDB, pois bancos grandes são mais seguros'
      ],
      correct: 1,
      correctFeedback: 'Correto! CDB líquido = 110% × (1 - 0,20) = 88% do CDI. LCI = 88% do CDI sem IR. São exatamente iguais nesse exemplo — mas se a LCI pagasse 89%, já seria melhor. A LCI nunca perde para o imposto, o CDB sempre paga.',
      wrongFeedback: 'A comparação correta é pela taxa líquida. CDB de 110% com IR de 20% = 110% × 0,80 = 88% líquido. LCI de 88% sem IR = 88% líquido. São iguais! Se a LCI pagasse qualquer coisa acima de 88%, ela ganharia do CDB de 110%.'
    },
    {
      q: 'Qual é o prazo mínimo de carência típico para LCI e LCA?',
      options: [
        'A. 7 dias',
        'B. 30 dias',
        'C. 90 dias',
        'D. 1 ano obrigatoriamente'
      ],
      correct: 2,
      correctFeedback: 'Correto! O prazo mínimo legal é geralmente de 90 dias para LCI e LCA. Algumas emissões têm prazos maiores (180 dias, 1 ano). Por isso, não invista dinheiro que pode precisar antes desse prazo — você pode não conseguir resgatar ou perder rendimento.',
      wrongFeedback: 'O prazo de carência típico mínimo para LCI e LCA é de 90 dias. A lei estabelece esse prazo para garantir que o dinheiro efetivamente financie os setores imobiliário e do agronegócio. Antes desse prazo, o resgate pode não ser possível.'
    },
    {
      q: 'LCI e LCA têm proteção do FGC?',
      options: [
        'A. Não, apenas CDB e poupança têm FGC',
        'B. Sim, até R$250.000 por CPF por instituição',
        'C. Sim, mas apenas até R$100.000',
        'D. Apenas LCI tem FGC; LCA não tem'
      ],
      correct: 1,
      correctFeedback: 'Correto! Tanto LCI quanto LCA são garantidas pelo FGC até R$250.000 por CPF por instituição financeira, igual ao CDB. Se o banco quebrar, o FGC cobre seu investimento até esse limite.',
      wrongFeedback: 'Tanto LCI quanto LCA têm proteção do FGC até R$250.000 por CPF por instituição, igual ao CDB. Não há distinção entre os produtos — todos os títulos bancários de renda fixa se enquadram nessa garantia.'
    },
    {
      q: 'Para qual situação LCI/LCA NÃO é a melhor escolha?',
      options: [
        'A. Dinheiro que ficará investido por 6 meses',
        'B. Reserva de emergência que precisa estar disponível a qualquer momento',
        'C. Objetivo financeiro para daqui 1 ano',
        'D. Complementar a carteira de renda fixa'
      ],
      correct: 1,
      correctFeedback: 'Exato! LCI e LCA têm prazo de carência (mínimo 90 dias) — você não consegue resgatar a qualquer momento. Para reserva de emergência, use Tesouro Selic ou CDB com liquidez diária, que permitem resgate imediato sem perda.',
      wrongFeedback: 'LCI e LCA têm prazo de carência mínimo (geralmente 90 dias), o que as torna inadequadas para reserva de emergência. A reserva precisa estar disponível imediatamente. Use Tesouro Selic ou CDB com liquidez diária para esse objetivo.'
    },
    {
      q: 'Por que o governo isenta LCI e LCA de IR?',
      options: [
        'A. Para beneficiar os bancos privados em detrimento dos públicos',
        'B. Para incentivar o financiamento do setor imobiliário e do agronegócio',
        'C. Porque esses produtos são de alto risco para o investidor',
        'D. Para competir com o Tesouro Direto que também é isento de IR'
      ],
      correct: 1,
      correctFeedback: 'Correto! É uma política econômica: o governo abre mão do IR para que os bancos captem dinheiro mais barato e emprestem para construção de imóveis e agronegócio. Esses setores são estratégicos para a economia e precisam de crédito acessível.',
      wrongFeedback: 'A isenção é uma política econômica deliberada: o governo abre mão do IR para estimular o fluxo de crédito para setores estratégicos — imóveis e agronegócio. Os bancos captam mais barato e emprestam para esses setores. Todos saem ganhando.'
    }
  ]
},

'juros_compostos': {
  totalSteps: 5,
  sections: [
    {
      icon: '📐',
      title: 'O Que São Juros Compostos',
      hook: 'Juros compostos são a diferença entre ficar estagnado e construir riqueza — Einstein teria chamado de a 8ª maravilha do mundo.',
      content: '<p>Juros simples: você ganha juros só sobre o capital inicial. Juros compostos: você ganha juros sobre o capital <strong>mais os juros já acumulados</strong>. Parece pouco, mas a diferença é enorme ao longo do tempo.</p><p>A fórmula é: <strong>M = C × (1 + i)^n</strong>. M = Montante final. C = Capital inicial. i = taxa de juros por período. n = número de períodos. Exemplo: R$1.000 a 10% ao ano por 10 anos = R$1.000 × (1 + 0,10)^10 = R$2.594. Com juros simples, seriam apenas R$2.000.</p><p>Esses R$594 extras vêm dos <strong>juros sobre os juros</strong>: no 2º ano, você não ganha 10% de R$1.000 (R$100), mas 10% de R$1.100 (R$110). No 3º ano, 10% de R$1.210 (R$121). A bola de neve cresce a cada ciclo, e quanto maior fica, mais rápido cresce.</p>',
      chart: 'chartCompoundSimple'
    },
    {
      icon: '72',
      title: 'A Regra dos 72 — Tempo para Dobrar o Dinheiro',
      hook: 'Você pode calcular mentalmente em quantos anos seu dinheiro dobra — sem calculadora, sem fórmula complicada.',
      content: '<p>A <strong>Regra dos 72</strong> é um atalho mental poderoso: divida 72 pela taxa de juros anual e você descobre em quantos anos seu dinheiro dobra. Simples assim: <strong>Anos para dobrar = 72 ÷ taxa%</strong>.</p><p>Exemplos práticos: Poupança a 6% ao ano → 72 ÷ 6 = <strong>12 anos</strong> para dobrar. Tesouro Selic a 12% ao ano → 72 ÷ 12 = <strong>6 anos</strong> para dobrar. CDB a 13% ao ano → 72 ÷ 13 = <strong>5,5 anos</strong> para dobrar. Ações com retorno de 15% ao ano → 72 ÷ 15 = <strong>4,8 anos</strong> para dobrar.</p><p>Isso explica por que cada ponto percentual a mais na sua taxa de retorno importa tanto. A diferença entre 6% e 12% ao ano não é "o dobro do ganho" — é a diferença entre dobrar o patrimônio em 12 anos ou em 6 anos. <strong>Com juros compostos, o tempo multiplica o efeito da taxa</strong>.</p>',
      chart: null
    },
    {
      icon: '⛄',
      title: 'O Efeito Bola de Neve',
      hook: 'No começo, parece que nada está acontecendo — mas depois de um certo ponto, o crescimento se torna imparável.',
      content: '<p>O efeito bola de neve acontece porque os juros compostos crescem de forma <strong>exponencial</strong>, não linear. Nos primeiros anos, a diferença para os juros simples é pequena e você pode sentir que "não valeu a pena". Mas com o tempo, o gap explode.</p><p>Exemplo: R$10.000 a 12% ao ano. Após 5 anos: R$17.623 (simples: R$16.000). Após 10 anos: R$31.058 (simples: R$22.000). Após 20 anos: <strong>R$96.463</strong> (simples: R$34.000). Após 30 anos: R$299.599 (simples: R$46.000)! Os últimos 10 anos rendem mais do que todos os 20 anteriores somados.</p><p>É por isso que o maior inimigo dos juros compostos é <strong>interromper o processo</strong> — sacar o dinheiro, gastar os rendimentos, parar de contribuir. A bola de neve precisa rolar sem parar para ganhar velocidade. Cada ano que você deixa o dinheiro investido é exponencialmente mais valioso do que o anterior.</p>',
      chart: null
    },
    {
      icon: '⏰',
      title: 'Tempo > Valor Investido',
      hook: 'Começar com pouco hoje é mais poderoso do que começar com muito amanhã — o tempo é o ingrediente secreto dos juros compostos.',
      content: '<p>Exemplo que muda mentalidade: Ana começa a investir R$500/mês aos 25 anos e para aos 35 anos (investiu por 10 anos = R$60.000 no total). João espera e começa a investir R$500/mês aos 35 anos e vai até os 65 anos (investiu por 30 anos = R$180.000 no total). Com 12% ao ano: <strong>Ana termina com mais dinheiro do que João</strong>, tendo investido apenas 1/3 do valor.</p><p>Como isso é possível? Ana começa 10 anos antes, então o dinheiro dela tem 10 anos a mais para a bola de neve crescer. Os R$60.000 de Ana viram mais de R$1 milhão. Os R$180.000 de João viram menos. O <strong>tempo é o ingrediente mais valioso</strong> — mais do que o valor mensal.</p><p>Contribuições mensais regulares potencializam ainda mais: R$500 por mês investidos por 30 anos a 12% ao ano resultam em cerca de R$1,75 milhão — muito mais do que um aporte único de R$180.000. A <strong>frequência e a consistência</strong> são tão importantes quanto o valor. Comece hoje, mesmo que seja pouco.</p>',
      chart: null
    }
  ],
  quiz: [
    {
      q: 'Qual é a fórmula dos juros compostos?',
      options: [
        'A. M = C × i × n',
        'B. M = C + (C × i × n)',
        'C. M = C × (1 + i)^n',
        'D. M = C ÷ (1 + i)^n'
      ],
      correct: 2,
      correctFeedback: 'Perfeito! M = C × (1 + i)^n é a fórmula dos juros compostos. M é o montante final, C é o capital inicial, i é a taxa por período e n é o número de períodos. O "elevado a n" é o que cria o efeito exponencial.',
      wrongFeedback: 'A fórmula correta é M = C × (1 + i)^n. A opção A e B são fórmulas de juros simples. O diferencial dos juros compostos é o expoente "n", que faz o crescimento ser exponencial em vez de linear.'
    },
    {
      q: 'Usando a Regra dos 72, em quantos anos um investimento a 9% ao ano dobra de valor?',
      options: [
        'A. 9 anos',
        'B. 8 anos',
        'C. 6 anos',
        'D. 12 anos'
      ],
      correct: 1,
      correctFeedback: 'Correto! 72 ÷ 9 = 8 anos. A Regra dos 72 é uma excelente aproximação mental: basta dividir 72 pela taxa anual para descobrir em quantos anos o dinheiro dobra. Simples e muito útil no dia a dia.',
      wrongFeedback: 'A Regra dos 72 diz: Anos para dobrar = 72 ÷ taxa%. Então 72 ÷ 9% = 8 anos. Não é 9 anos (esse seria 72 ÷ 8). A regra é uma aproximação, mas muito precisa para taxas entre 6% e 15%.'
    },
    {
      q: 'R$1.000 investidos a 10% ao ano por 10 anos com juros compostos resultam em quanto?',
      options: [
        'A. R$2.000 (juros simples: R$100 por ano × 10)',
        'B. R$2.594 (juros compostos: juros sobre juros)',
        'C. R$3.000 (taxa composta premium)',
        'D. R$1.500 (rendimento médio de renda fixa)'
      ],
      correct: 1,
      correctFeedback: 'Exato! R$1.000 × (1,10)^10 = R$2.594. Com juros simples seriam R$2.000. A diferença de R$594 são os "juros sobre os juros" — o poder dos juros compostos agindo por 10 anos.',
      wrongFeedback: 'Com juros compostos a 10% ao ano por 10 anos: R$1.000 × (1,10)^10 = R$2.594. Com juros simples seriam apenas R$2.000. A diferença de R$594 representa os juros que você ganhou sobre os juros já acumulados.'
    },
    {
      q: 'Por que o efeito bola de neve dos juros compostos se torna mais poderoso com o tempo?',
      options: [
        'A. Porque os bancos aumentam a taxa automaticamente após anos de fidelidade',
        'B. Porque o crescimento é exponencial — cada período os juros incidem sobre uma base maior',
        'C. Porque a inflação reduz os impostos devidos sobre o rendimento',
        'D. Porque investidores com mais experiência tomam melhores decisões'
      ],
      correct: 1,
      correctFeedback: 'Correto! O crescimento exponencial significa que a base sobre a qual os juros incidem cresce a cada período. No ano 1 você ganha juros sobre R$1.000. No ano 10, sobre R$2.594. No ano 20, sobre R$6.727. A base cresce, então os juros absolutos crescem também.',
      wrongFeedback: 'O poder cresce porque o crescimento é exponencial: os juros de cada período incidem sobre uma base cada vez maior. No ano 1 você ganha R$100 sobre R$1.000. No ano 10, ganha R$259 sobre R$2.594. Mesma taxa, mas base muito maior.'
    },
    {
      q: 'Ana investe R$500/mês por 10 anos (dos 25 aos 35) e para. João investe R$500/mês por 30 anos (dos 35 aos 65). Com 12% ao ano, quem tem mais aos 65 anos?',
      options: [
        'A. João, pois investiu por 3 vezes mais tempo e 3 vezes mais dinheiro',
        'B. São iguais, pois o retorno compensa exatamente a diferença de valor',
        'C. Ana, pois começou 10 anos antes e o tempo amplifica o efeito composto',
        'D. Depende da taxa — a 12% João vence, a 15% Ana venceria'
      ],
      correct: 2,
      correctFeedback: 'Impressionante mas verdadeiro! Ana termina com mais dinheiro, mesmo tendo investido apenas 1/3 do que João. Os 10 anos de vantagem no início são mais valiosos do que 30 anos de contribuições posteriores. Isso demonstra que TEMPO é o ativo mais precioso nos juros compostos.',
      wrongFeedback: 'Surpreendentemente, Ana vence! Ela começou 10 anos antes, então o dinheiro dela teve muito mais tempo para crescer de forma exponencial. O valor investido por Ana (R$60.000) é menor, mas o tempo adicional (10 anos) multiplica o efeito composto de forma que João não consegue recuperar.'
    },
    {
      q: 'Qual atitude é mais prejudicial ao efeito dos juros compostos?',
      options: [
        'A. Investir R$300/mês em vez de R$500/mês',
        'B. Escolher uma taxa de 10% em vez de 12% ao ano',
        'C. Sacar os rendimentos todo mês para gastar',
        'D. Diversificar entre diferentes produtos de renda fixa'
      ],
      correct: 2,
      correctFeedback: 'Correto! Sacar os rendimentos "quebra" o efeito composto. Os juros compostos funcionam porque os juros se somam ao capital e geram mais juros. Se você remove os juros a cada mês, você volta ao regime de juros simples — e perde todo o poder exponencial.',
      wrongFeedback: 'Sacar os rendimentos mensalmente é o maior erro. Isso transforma juros compostos em juros simples — você só ganha juros sobre o capital original, nunca sobre os juros acumulados. Investir um pouco menos ou a uma taxa ligeiramente menor é menos prejudicial do que interromper o processo de reinvestimento.'
    }
  ]
},

'darf': {
  totalSteps: 5,
  sections: [
    {
      icon: '🇧🇷',
      title: 'IR na Bolsa — O Básico que Todo Investidor Precisa Saber',
      hook: 'Muita gente investe em ações sem saber que pode dever imposto — e a Receita Federal não avisa antes de cobrar.',
      content: '<p>Quando você vende ações com lucro, pode dever <strong>Imposto de Renda</strong> sobre esse ganho. A alíquota é de <strong>15% para operações normais</strong> (comprou hoje, vendeu dias ou meses depois) e <strong>20% para day-trade</strong> (comprou e vendeu no mesmo dia).</p><p>A boa notícia para a maioria dos investidores: existe uma <strong>isenção de R$20.000</strong>. Se o total das suas vendas de ações em um mês for menor que R$20.000, você está isento de IR — mesmo que tenha lucro. Atenção: essa isenção é sobre o <strong>valor total vendido</strong>, não sobre o lucro. E ela NÃO vale para day-trade.</p><p>Exemplo prático: você comprou ações por R$15.000 e vendeu por R$18.000 no mês. Total vendido = R$18.000 (abaixo de R$20.000). Lucro = R$3.000. <strong>IR = R$0</strong>. Se tivesse vendido por R$22.000, o total vendido ultrapassa R$20k, e você pagaria 15% sobre R$7.000 de lucro = R$1.050 de IR.</p>',
      chart: null
    },
    {
      icon: '💰',
      title: 'A Isenção dos R$20.000',
      hook: 'R$20.000 em vendas por mês — entender esse número pode te poupar centenas de reais em impostos.',
      content: '<p>A isenção de R$20.000 funciona mês a mês e é contada pelo <strong>valor total de vendas</strong> no mês calendário, não pelo lucro. Se em janeiro você vendeu R$19.000 em ações com R$4.000 de lucro, você paga zero de IR em janeiro — independente do lucro.</p><p>Mas atenção: a isenção é para <strong>cada mês separadamente</strong>. Não existe acumulação. Se em fevereiro você vendeu R$25.000 (acima do limite), deve IR sobre o lucro do mês de fevereiro, independente de janeiro ter ficado abaixo. Cada mês é zerado.</p><p>A isenção se aplica apenas a <strong>ações negociadas em bolsa</strong> por pessoa física. Não vale para: ETFs (fundos de índice), FIIs (fundos imobiliários — que têm regra própria), day-trade, BDRs em algumas situações, ou operações em mercado futuro. Antes de assumir isenção, verifique se o produto específico se enquadra.</p>',
      chart: null
    },
    {
      icon: '📉',
      title: 'Prejuízo Acumulado — Compense nos Próximos Meses',
      hook: 'Perder dinheiro na bolsa é ruim — mas você pode usar esse prejuízo para pagar menos IR no futuro.',
      content: '<p>Se você teve prejuízo em um mês, pode <strong>carregar esse prejuízo para meses futuros</strong> e abater do lucro tributável. Esse mecanismo chama-se "compensação de perdas" e é garantido pela legislação tributária brasileira.</p><p>Exemplo: Em março você perdeu R$2.000 (vendeu com prejuízo). Em abril você ganhou R$5.000. Sem compensação, pagaria 15% sobre R$5.000 = R$750. Com compensação, paga 15% sobre (R$5.000 - R$2.000) = 15% sobre R$3.000 = <strong>R$450</strong>. Economizou R$300!</p><p>Regras importantes: o prejuízo só pode ser compensado com <strong>ganhos da mesma natureza</strong> — prejuízo em operação normal compensa ganho em operação normal; prejuízo em day-trade só compensa ganho em day-trade. O prejuízo pode ser carregado por tempo indeterminado, mas deve ser controlado pelo próprio investidor. A Receita não faz isso por você — anote tudo!</p>',
      chart: 'chartDARFCalendar'
    },
    {
      icon: '📄',
      title: 'Como Pagar o DARF',
      hook: 'Pagar o imposto é mais simples do que parece — mas perder o prazo tem consequências que valem a pena evitar.',
      content: '<p>O <strong>DARF (Documento de Arrecadação de Receitas Federais)</strong> é o documento que você usa para pagar o IR sobre ganhos na bolsa. O prazo é o <strong>último dia útil do mês seguinte</strong> ao mês das vendas. Vendeu em março? Pague até 30 de abril (ou último dia útil antes disso).</p><p>Como emitir: acesse o site da Receita Federal → programa SICALC (disponível online ou para download) → informe o código de receita (6015 para operações normais com ações, 6010 para day-trade) → informe o período e o valor → gere o DARF → pague em qualquer banco, lotérica, ou pelo internet banking/app do seu banco.</p><p>Se você perder o prazo, incide <strong>multa de 0,33% por dia de atraso</strong> (limitado a 20%) mais juros Selic. Além disso, a Receita Federal cruza as informações de operações informadas pelas corretoras com o que você declarou no imposto de renda anual. Se detectar divergência, você pode cair na malha fina — que dá muito mais trabalho do que simplesmente pagar no prazo.</p>',
      chart: null
    }
  ],
  quiz: [
    {
      q: 'Qual é a alíquota de IR para lucros em operações normais de ações (não day-trade)?',
      options: [
        'A. 20%',
        'B. 27,5%',
        'C. 15%',
        'D. 10%'
      ],
      correct: 2,
      correctFeedback: 'Correto! Para operações normais em ações (compra e venda em dias diferentes), a alíquota é de 15% sobre o lucro. Para day-trade (mesma data), sobe para 20%. Essa diferença é um dos motivos pelos quais day-trade é tributariamente mais pesado.',
      wrongFeedback: 'A alíquota para operações normais em ações é de 15% sobre o lucro líquido. O day-trade tem alíquota maior, de 20%. A alíquota de 27,5% é da tabela progressiva do IR sobre salários — não se aplica à bolsa.'
    },
    {
      q: 'Em qual situação você está isento de IR na bolsa?',
      options: [
        'A. Quando o lucro do mês for inferior a R$20.000',
        'B. Quando o total de vendas no mês for inferior a R$20.000',
        'C. Quando você investe há mais de 2 anos na mesma ação',
        'D. Quando você faz menos de 5 operações por mês'
      ],
      correct: 1,
      correctFeedback: 'Exato! A isenção é pelo total de VENDAS no mês, não pelo lucro. Se você vendeu R$19.000 em ações no mês com R$5.000 de lucro, está isento (total vendido abaixo de R$20.000). Mas se vendeu R$21.000 com R$1.000 de lucro, deve IR sobre o lucro.',
      wrongFeedback: 'A isenção é baseada no valor total de VENDAS no mês (não no lucro). Se o total vendido em um mês for abaixo de R$20.000, você está isento — independente do lucro obtido. Se ultrapassar R$20.000 em vendas, paga 15% sobre o lucro do mês.'
    },
    {
      q: 'Você teve R$3.000 de prejuízo em maio e R$7.000 de lucro em junho. Quanto de IR você paga em junho?',
      options: [
        'A. R$1.050 (15% sobre R$7.000)',
        'B. R$600 (15% sobre R$4.000, compensando o prejuízo)',
        'C. R$0, pois o prejuízo cancela qualquer obrigação',
        'D. R$1.050 em junho mais multa pelos R$3.000 de prejuízo em maio'
      ],
      correct: 1,
      correctFeedback: 'Correto! Você compensa o prejuízo de R$3.000 de maio com o lucro de R$7.000 de junho. Base de cálculo = R$7.000 - R$3.000 = R$4.000. IR = 15% × R$4.000 = R$600. Economizou R$450 comparado a pagar sem compensação!',
      wrongFeedback: 'Com a compensação de perdas: lucro de junho (R$7.000) - prejuízo de maio (R$3.000) = R$4.000 de base tributável. IR = 15% × R$4.000 = R$600. Sem compensação, pagaria R$1.050. A compensação economizou R$450!'
    },
    {
      q: 'Qual é o prazo para pagar o DARF referente a ganhos em março?',
      options: [
        'A. Até o dia 15 de abril',
        'B. Até o último dia útil de abril',
        'C. Até o dia 30 de março do mesmo mês',
        'D. Até maio, junto com a declaração anual'
      ],
      correct: 1,
      correctFeedback: 'Correto! O DARF de ganhos em março deve ser pago até o último dia útil de abril — o mês seguinte ao das operações. Se o dia 30 cair num final de semana, o prazo vai para a sexta-feira anterior ou segunda-feira seguinte (verifique qual é dia útil).',
      wrongFeedback: 'O prazo é o último dia útil do mês seguinte às vendas. Para vendas em março, pague até o último dia útil de abril. Não é o dia 15, nem junto com o IR anual (que é apenas para declaração, não para pagamento do DARF mensal).'
    },
    {
      q: 'A isenção de R$20.000 se aplica ao day-trade?',
      options: [
        'A. Sim, desde que o lucro seja inferior a R$20.000',
        'B. Sim, a isenção vale para qualquer operação na bolsa',
        'C. Não, day-trade não tem isenção — qualquer lucro é tributado em 20%',
        'D. Apenas para day-trade com ações de empresas brasileiras'
      ],
      correct: 2,
      correctFeedback: 'Correto! O day-trade não tem nenhuma isenção. Qualquer lucro em operações de day-trade é tributado em 20%, sem exceção. Além disso, há retenção na fonte de 1% sobre o lucro do day-trade, que é antecipação do imposto.',
      wrongFeedback: 'A isenção de R$20.000 NÃO se aplica ao day-trade. No day-trade, qualquer lucro é tributado a 20%, sem nenhuma isenção. Adicionalmente, há retenção na fonte de 1% sobre o lucro como antecipação. É por isso que day-trade tem carga tributária mais pesada.'
    },
    {
      q: 'O que acontece se você não pagar o DARF no prazo?',
      options: [
        'A. Nada, pois a Receita só cobra no IR anual de março',
        'B. Multa de 0,33% por dia de atraso mais juros Selic, e risco de malha fina',
        'C. Multa fixa de R$500 por DARF não pago',
        'D. Apenas juros Selic, sem multa adicional'
      ],
      correct: 1,
      correctFeedback: 'Correto! O atraso gera multa de 0,33% por dia (limitada a 20%) mais juros Selic sobre o valor devido. Além disso, as corretoras enviam todas as informações de operações para a Receita Federal, que cruza com sua declaração — inconsistências podem gerar malha fina.',
      wrongFeedback: 'Atrasar o DARF gera multa de 0,33% por dia de atraso (até o máximo de 20%) mais juros Selic. A Receita Federal recebe dados de todas as operações pelas corretoras automaticamente e cruza com sua declaração anual — não pagar no prazo pode resultar em malha fina além das penalidades financeiras.'
    }
  ]
}
,


'momentum_signal': {
  totalSteps: 5,
  sections: [
    {
      icon: '🎯',
      title: 'Como Funciona o Score do Momentum',
      hook: 'O app não chuta — ele soma pontos de 9 critérios técnicos para decidir se uma ação merece atenção.',
      content: '<p>O <strong>Score do Momentum</strong> vai de 0 a 6 pontos. Cada critério técnico adiciona uma fração quando a condição é favorável. São 9 critérios ao todo, cada um testando um aspecto diferente da saúde da ação.</p><p>Os <strong>critérios que valem 1 ponto</strong> são os mais pesados: preço acima da SMA200, SMA50 acima da SMA200 (tendência confirmada) e MACD com cruzamento de alta. Juntos já somam 3 pontos — metade do total.</p><p>Os <strong>critérios que valem 0,5 ponto</strong> completam o quadro: RSI entre 50 e 70 (força sem exagero), ADX acima de 25 (tendência real), volume acima da média, padrão gráfico detectado, regime de mercado bull e setor em tendência. Quanto mais critérios favoráveis, mais confiante é o sinal.</p>',
      chart: 'chartMomentumScore'
    },
    {
      icon: '🚦',
      title: 'BUY vs MONITORAR vs Sem Sinal',
      hook: 'A cor do sinal diz exatamente o que o app quer que você faça — ou não faça.',
      content: '<p>Quando o score atinge <strong>3,5 pontos ou mais</strong>, o app marca a ação com sinal <strong>BUY (verde)</strong>. Isso significa que a maioria dos critérios técnicos está alinhada a favor da compra. É o momento de considerar entrar com o tamanho certo de posição.</p><p>Score entre <strong>2,5 e 3,5 pontos</strong> gera o status <strong>MONITORAR (amarelo)</strong>. A ação está se animando, mas ainda falta confirmar mais critérios. A ação certa é acompanhar e esperar — não comprar ainda.</p><p>Abaixo de <strong>2,5 pontos</strong>, o app simplesmente não mostra sinal. Não há setup técnico relevante. Ignorar essa ação por ora é a decisão correta — o tempo no mercado é melhor usado em oportunidades mais claras.</p>',
      chart: null
    },
    {
      icon: '⚠️',
      title: 'O Que o Sinal Não É',
      hook: 'Um sinal verde não é uma ordem de compra — é o ponto de partida de uma análise, não o fim.',
      content: '<p>O sinal do Momentum é um <strong>filtro técnico automatizado</strong>, não uma recomendação de investimento. Ele diz que os indicadores estão alinhados — mas não conhece sua situação financeira, seu horizonte de tempo ou o quanto você pode perder.</p><p>Contexto ainda importa. Uma ação com sinal BUY pode estar em um <strong>setor que você não entende</strong>, prestes a divulgar um resultado difícil, ou num momento em que você já está exposto demais a risco. O sinal técnico não sabe disso.</p><p>Use o sinal como <strong>ponto de partida</strong>: ele filtra centenas de ações para deixar só as que têm momentum técnico favorável. A decisão final — comprar, quanto comprar e quando sair — sempre é sua. O app reduz o trabalho de garimpar, mas não elimina o ato de pensar.</p>',
      chart: null
    },
    {
      icon: '🔄',
      title: 'Como Usar os Sinais na Prática',
      hook: 'Sinal recebido — e agora? Existe uma sequência de quatro passos que separa quem age com método de quem age por impulso.',
      content: '<p><strong>Passo 1 — Confirme o regime:</strong> antes de qualquer coisa, olhe o indicador de regime de mercado no topo do app. Se o mercado está em modo Bear, novos sinais BUY ficam suspensos. Não adianta comprar contra a maré do IBOV.</p><p><strong>Passo 2 — Confirme o sinal:</strong> leia o porquê do sinal, veja o gráfico da ação e cheque se faz sentido com o que você já sabe sobre o setor. Um sinal de PETR4 durante alta do petróleo é muito mais confiável do que um sinal isolado sem contexto.</p><p><strong>Passo 3 — Calcule o tamanho:</strong> use a calculadora de posição do app para definir quantas ações comprar com base no ATR e no risco máximo de 1-2% do seu capital. Nunca entre com tamanho arbitrário. <strong>Passo 4 — Monitore a saída:</strong> ative o stop móvel e marque os 20 dias de prazo. O plano de saída deve existir antes da entrada.</p>',
      chart: null
    }
  ],
  quiz: [
    {
      q: 'Qual é a pontuação máxima possível no Score do Momentum?',
      options: ['A. 9,0 pontos', 'B. 5,0 pontos', 'C. 6,0 pontos', 'D. 10,0 pontos'],
      correct: 2,
      correctFeedback: 'Exato! São 9 critérios que somam no máximo 6,0 pontos — cada um com peso diferente.',
      wrongFeedback: 'Não é essa. O score vai de 0 a 6,0 pontos, distribuídos entre 9 critérios técnicos.'
    },
    {
      q: 'Uma ação com score de 3,2 pontos vai aparecer com qual status no Momentum?',
      options: ['A. BUY (verde)', 'B. MONITORAR (amarelo)', 'C. SELL (vermelho)', 'D. Sem sinal'],
      correct: 1,
      correctFeedback: 'Correto! Score entre 2,5 e 3,5 gera o status MONITORAR — acompanhe, mas ainda não compre.',
      wrongFeedback: 'Errado. Score de 3,2 fica na faixa MONITORAR (2,5 a 3,5). O BUY só aparece a partir de 3,5.'
    },
    {
      q: 'Qual critério vale 1 ponto inteiro no cálculo do score?',
      options: ['A. Volume acima da média', 'B. RSI entre 50 e 70', 'C. MACD com cruzamento de alta', 'D. ADX acima de 25'],
      correct: 2,
      correctFeedback: 'Isso mesmo! MACD com cruzamento de alta vale 1 ponto. Os critérios de 0,5 são os complementares.',
      wrongFeedback: 'Esse critério vale 0,5 ponto, não 1. O MACD com cruzamento de alta é um dos que valem 1 ponto inteiro.'
    },
    {
      q: 'O sinal BUY do Momentum é uma recomendação oficial de compra?',
      options: ['A. Sim, o app garante o resultado', 'B. Não, é um filtro técnico que ajuda na decisão', 'C. Sim, mas só para ações brasileiras', 'D. Não, porque o app não analisa nada'],
      correct: 1,
      correctFeedback: 'Perfeito! O sinal é um filtro técnico, não uma recomendação. A decisão final é sempre do investidor.',
      wrongFeedback: 'Atenção: o Momentum não garante resultado nem faz recomendações. Ele filtra — você decide.'
    },
    {
      q: 'O que acontece com os sinais BUY quando o regime de mercado é Bear?',
      options: ['A. Continuam aparecendo normalmente', 'B. Ficam todos vermelhos', 'C. Novos sinais BUY são suspensos', 'D. O app fecha automaticamente'],
      correct: 2,
      correctFeedback: 'Exato! Em regime Bear, o app suspende novos sinais BUY. Não vale comprar contra o mercado inteiro.',
      wrongFeedback: 'Errado. Em mercado Bear, o Momentum suspende os sinais BUY — porque 70-80% das ações caem junto com o IBOV.'
    },
    {
      q: 'Qual é a sequência correta de uso do sinal na prática?',
      options: ['A. Comprar, depois ver o regime', 'B. Ignorar o sinal e usar intuição', 'C. Confirmar regime → confirmar sinal → calcular posição → monitorar saída', 'D. Esperar o sinal virar SELL para agir'],
      correct: 2,
      correctFeedback: 'Perfeito! Essa sequência de 4 passos é o que diferencia quem investe com método de quem age por impulso.',
      wrongFeedback: 'Não é essa ordem. O método correto é: regime primeiro, sinal depois, tamanho calculado, saída planejada.'
    }
  ]
},

'smart_exit': {
  totalSteps: 5,
  sections: [
    {
      icon: '🧠',
      title: 'Por Que Ter uma Regra de Saída?',
      hook: 'A maioria das perdas no mercado não vem de entradas ruins — vem de não saber quando sair.',
      content: '<p>O ser humano tem um viés natural chamado <strong>"aversão à perda"</strong>: a dor de perder R$100 é sentida como duas vezes maior do que a alegria de ganhar R$100. Isso faz com que investidores segurem ações que estão caindo muito além do razoável, esperando "recuperar o que perderam".</p><p>Do lado dos ganhos, o problema é diferente: empatia com a ação. Depois de acompanhar um papel por semanas, fica difícil vendê-lo mesmo quando o setup técnico se desfaz. Você passa a torcer pela ação em vez de analisá-la — e torcer não é estratégia.</p><p>A regra de saída resolve os dois problemas <strong>antes da emoção entrar</strong>. Quando você define o stop e o prazo no momento da compra, a decisão de sair é automática — não depende de como você está se sentindo naquele dia.</p>',
      chart: null
    },
    {
      icon: '📉',
      title: 'O Stop Móvel — Protegendo Seus Ganhos',
      hook: 'O stop móvel é diferente do stop fixo: ele sobe com o preço e nunca desce, travando os lucros ao longo do caminho.',
      content: '<p>O Momentum usa um <strong>stop baseado em 2×ATR</strong> (Average True Range — a volatilidade média diária da ação). Na prática: se você comprou PETR4 a R$50 e o ATR é R$2, o stop inicial fica em R$46 (R$50 − 2×R$2).</p><p>Conforme o preço sobe, o stop acompanha. Se PETR4 chega a R$55, o stop sobe para R$51. O stop é calculado sempre a partir da <strong>máxima histórica desde a entrada</strong> — nunca do preço atual. Isso significa que cada novo topo "trava" um nível maior de lucro.</p><p>A regra mais importante: <strong>o stop jamais desce</strong>. Se o preço cair e depois subir de volta, o stop fica no nível mais alto que já atingiu. Isso evita que uma alta temporária coloque o stop num lugar e uma queda subsequente o "devolva" para baixo — o que anularia o propósito de proteger o ganho.</p>',
      chart: 'chartTrailingStop'
    },
    {
      icon: '📅',
      title: 'A Regra dos 20 Dias',
      hook: 'Se uma ação não andou em 20 pregões, o mercado está dizendo algo — e você precisa ouvir.',
      content: '<p>O Momentum aplica uma <strong>saída automática após 20 dias úteis</strong> (aproximadamente 1 mês do calendário). A lógica é simples: quando você compra com base em momentum, está apostando que a ação vai se mover logo. Se não se mover em 20 pregões, o setup se desfez.</p><p>A regra dos 20 dias combate a <strong>síndrome de "casar com a ação"</strong> — aquela tendência de segurar um papel indefinidamente por apego emocional ou esperança de recuperação. O capital parado em uma ação lateral poderia estar em uma oportunidade real.</p><p>A saída por tempo é independente do resultado: pode ser lucro, prejuízo ou zero. O que importa é que o <strong>capital volta a ficar disponível</strong> para o próximo sinal com setup claro. Disciplina no tempo é tão importante quanto disciplina no preço.</p>',
      chart: null
    },
    {
      icon: '⚡',
      title: 'Stop e 20 Dias — Como Usar Juntos',
      hook: 'As duas regras funcionam em paralelo — e o que disparar primeiro é o que vale.',
      content: '<p>Imagine que você comprou WEGE3 e ativou as duas regras: stop móvel em 2×ATR e prazo de 20 dias úteis. A partir daí, o app monitora os dois gatilhos simultaneamente. Não há ordem de prioridade — <strong>o que ocorrer primeiro é o sinal de saída</strong>.</p><p>Se o preço despencar e o stop for atingido no dia 8, você sai no dia 8. Se o papel ficar lateralizado e os 20 dias passarem sem o stop ser tocado, você sai no dia 20. Em nenhum dos casos você precisa tomar a decisão na hora — ela já foi tomada no momento da compra.</p><p>Essa combinação cria um <strong>sistema de saída com dois andares</strong>: o stop protege contra quedas bruscas, e o prazo protege contra a inércia silenciosa. Juntos, eles garantem que seu capital está sempre trabalhando — nunca preso em uma ação que perdeu o propósito.</p>',
      chart: null
    }
  ],
  quiz: [
    {
      q: 'Qual é a base de cálculo do stop móvel usado pelo Momentum?',
      options: ['A. 5% fixo do preço de entrada', 'B. 2 vezes o ATR (volatilidade média)', 'C. O menor preço dos últimos 20 dias', 'D. 10% abaixo do preço atual'],
      correct: 1,
      correctFeedback: 'Correto! O stop é calculado como 2×ATR abaixo da máxima desde a entrada — dinâmico e adaptado à volatilidade.',
      wrongFeedback: 'Não é essa. O stop do Momentum usa 2×ATR (Average True Range), não uma porcentagem fixa.'
    },
    {
      q: 'Você comprou uma ação a R$50 com ATR de R$2. O preço subiu para R$58. Onde fica o stop agora?',
      options: ['A. R$46 (fixo no nível inicial)', 'B. R$54 (2×ATR abaixo de R$58)', 'C. R$50 (no preço de entrada)', 'D. R$60 (acima do preço atual)'],
      correct: 1,
      correctFeedback: 'Perfeito! R$58 − (2×R$2) = R$54. O stop acompanhou a máxima e travou parte do ganho.',
      wrongFeedback: 'Errado. O stop sobe junto com o preço. R$58 − 2×ATR(R$2) = R$54. O ganho até aqui está protegido.'
    },
    {
      q: 'O que acontece com o stop móvel se o preço cair e depois subir de volta?',
      options: ['A. O stop volta para o nível inicial', 'B. O stop desce junto com o preço', 'C. O stop permanece no nível mais alto já atingido', 'D. O stop é cancelado automaticamente'],
      correct: 2,
      correctFeedback: 'Isso mesmo! O stop nunca retrocede. Ele fica fixado na máxima histórica desde a entrada.',
      wrongFeedback: 'Errado. O stop só sobe, nunca desce. Uma vez que a máxima foi estabelecida, o stop fica naquele nível.'
    },
    {
      q: 'Por que o Momentum aplica a regra de saída automática após 20 dias úteis?',
      options: ['A. Por exigência da CVM', 'B. Para evitar imposto de renda', 'C. Para liberar capital parado e evitar apego emocional com a ação', 'D. Porque todos os ativos caem após 20 dias'],
      correct: 2,
      correctFeedback: 'Exato! Se a ação não se moveu em 20 pregões, o setup de momentum perdeu o propósito. Capital livre para a próxima oportunidade.',
      wrongFeedback: 'Não é isso. A regra dos 20 dias evita que você "case" com a ação e libera capital para oportunidades reais.'
    },
    {
      q: 'Você está no dia 12 de uma operação. O stop é atingido. O que você faz?',
      options: ['A. Aguarda completar os 20 dias antes de sair', 'B. Sai imediatamente — o stop disparou primeiro', 'C. Move o stop para baixo para dar mais espaço', 'D. Compra mais ações para reduzir o preço médio'],
      correct: 1,
      correctFeedback: 'Correto! O stop disparou antes dos 20 dias — você sai. O que ocorrer primeiro é o sinal de saída.',
      wrongFeedback: 'Errado. As duas regras correm em paralelo. O stop atingido no dia 12 é o gatilho de saída — os 20 dias não importam mais.'
    },
    {
      q: 'Qual é o principal problema psicológico que a regra de saída resolve?',
      options: ['A. Medo de abrir o app todos os dias', 'B. Dificuldade de escolher corretoras', 'C. Segurar ações perdedoras por aversão à perda e apego emocional', 'D. Pagar muito imposto nos lucros'],
      correct: 2,
      correctFeedback: 'Isso mesmo! Aversão à perda e apego emocional fazem investidores segurarem perdas além do razoável — a regra de saída resolve isso.',
      wrongFeedback: 'Não é essa. O principal viés que a regra combate é a aversão à perda — a dor de realizar o prejuízo faz o investidor esperar demais.'
    }
  ]
},

'market_regime': {
  totalSteps: 5,
  sections: [
    {
      icon: '🌊',
      title: 'O Que é Regime de Mercado',
      hook: 'Quando a maré desce, todos os barcos descem — e não importa o quão boa seja a vela da ação.',
      content: '<p>Regime de mercado é o <strong>estado geral do mercado brasileiro</strong> no momento. Pense nele como o clima: você pode ter a roupa certa para o jogo, mas se está chovendo forte, vai se molhar de qualquer jeito. Ações individuais seguem o mercado com força surpreendente.</p><p>Estudos históricos mostram que em mercados em queda, <strong>70 a 80% das ações caem juntas</strong> — independente dos fundamentos individuais. Uma ação com score 5,0 no Momentum ainda pode cair 15% se o IBOV estiver despencando. O sinal técnico individual perde confiabilidade quando o contexto geral é adverso.</p><p>Por isso o Momentum checa o regime antes de mostrar qualquer sinal. É o <strong>filtro mais importante do sistema</strong> — mais importante até do que o score individual. Investir ignorando o regime é como tentar nadar contra a correnteza: possível, mas custoso.</p>',
      chart: null
    },
    {
      icon: '🚦',
      title: 'Os Três Estados do Mercado',
      hook: 'O Momentum usa três cores para traduzir o estado do IBOV em uma linguagem de ação imediata.',
      content: '<p><strong>🟢 Bull (favorável):</strong> o preço do IBOV está acima da sua média de 30 dias (SMA30). O mercado está em tendência de alta. Sinais BUY estão ativos, e as condições são propícias para novas posições. É a fase onde o momentum de ações individuais tende a se concretizar.</p><p><strong>🔴 Bear (adverso):</strong> o IBOV está mais de 3% abaixo da SMA30. O mercado entrou em modo de queda relevante. O Momentum <strong>pausa todos os novos sinais BUY</strong> automaticamente. Posições existentes continuam monitoradas, mas nenhuma nova entrada é sugerida.</p><p><strong>🟡 Neutral (atenção):</strong> o IBOV está ligeiramente abaixo da SMA30, mas ainda não atingiu o limiar Bear. É uma zona de transição. Sinais podem aparecer, mas o app sinaliza cautela: prefira <strong>posições menores</strong> e seja mais seletivo. Um passo errado aqui pode virar Bear rapidamente.</p>',
      chart: 'chartMarketRegime'
    },
    {
      icon: '🔗',
      title: 'Como o Regime Afeta os Sinais',
      hook: 'O mesmo sinal técnico tem peso completamente diferente dependendo do regime em que aparece.',
      content: '<p>Em regime <strong>Bull</strong>, um sinal BUY com score 4,0 tem alta credibilidade. O mercado está cooperando, o setor pode estar em tendência e as probabilidades estão do seu lado. É o momento de usar o tamanho normal de posição calculado pelo app.</p><p>Em regime <strong>Neutral</strong>, o mesmo sinal de score 4,0 pede mais cautela. O app pode mostrá-lo, mas é recomendável <strong>reduzir o tamanho da posição em 30-50%</strong>. A incerteza do regime aumenta o risco do setup — compense reduzindo a exposição.</p><p>Em regime <strong>Bear</strong>, o Momentum simplesmente não emite novos sinais BUY. Não é pessimismo — é matemática. Com 70-80% das ações caindo em mercado Bear, a taxa de acerto de sinais individuais despenca. Preservar capital para quando o regime voltar ao Bull é a decisão de maior retorno esperado.</p>',
      chart: null
    },
    {
      icon: '🗺️',
      title: 'Usando o Regime na Sua Estratégia',
      hook: 'O regime de mercado deve ser a primeira coisa que você olha ao abrir o Momentum — sempre.',
      content: '<p>O indicador de regime fica no <strong>topo da tela principal</strong> do app, sempre visível. Antes de qualquer outra análise — antes de ver os sinais, antes de checar seu portfólio — olhe o regime. Ele muda o significado de tudo o que vem depois.</p><p>Desenvolva o hábito de <strong>três perguntas</strong> ao abrir o app: (1) Qual é o regime agora? (2) Mudou desde ontem? (3) O que isso muda no meu plano? Se o regime virou Bear, sua resposta deve ser "não faço novas compras". Se virou Bull, pode voltar a considerar os sinais com tamanho normal.</p><p>Uma dica prática: <strong>anotações</strong> ajudam. Quando o regime muda, registre a data e o nível do IBOV. Com o tempo, você vai perceber padrões — quantos dias dura cada regime, o que costuma provocar a mudança, e como seu portfólio se comporta em cada fase. Esse histórico pessoal é um dos ativos mais valiosos de um investidor.</p>',
      chart: null
    }
  ],
  quiz: [
    {
      q: 'O que define se o regime de mercado é Bull no Momentum?',
      options: ['A. O IBOV subiu mais de 5% no mês', 'B. O preço do IBOV está acima da sua SMA30', 'C. Mais de 50% das ações têm sinal BUY', 'D. A Selic está em queda'],
      correct: 1,
      correctFeedback: 'Correto! Regime Bull = IBOV acima da SMA30. Simples, objetivo e eficaz como filtro.',
      wrongFeedback: 'Não é isso. O regime Bull é definido especificamente pelo preço do IBOV acima da sua média de 30 dias (SMA30).'
    },
    {
      q: 'Em regime Bear, o que o Momentum faz com os sinais BUY?',
      options: ['A. Mostra normalmente com um aviso', 'B. Aumenta o score necessário para 5,0', 'C. Pausa todos os novos sinais BUY automaticamente', 'D. Muda a cor para amarelo'],
      correct: 2,
      correctFeedback: 'Exato! Em Bear, o app pausa os sinais BUY. Não vale comprar quando 70-80% das ações estão caindo.',
      wrongFeedback: 'Errado. Em regime Bear, o Momentum suspende completamente os novos sinais BUY — não modifica, suspende.'
    },
    {
      q: 'Por que uma ação com score 5,0 ainda pode cair em mercado Bear?',
      options: ['A. Porque o score é calculado errado em Bear', 'B. Porque em Bear, 70-80% das ações caem independente do score individual', 'C. Porque o ATR aumenta em Bear', 'D. Porque o app bloqueia compras acima de R$50'],
      correct: 1,
      correctFeedback: 'Isso mesmo! Em mercados em queda, a correlação entre as ações aumenta muito — o score individual perde força preditiva.',
      wrongFeedback: 'Não é essa. Em Bear, a correlação entre ações dispara: 70-80% caem juntas, independente dos indicadores individuais.'
    },
    {
      q: 'Você vê um sinal BUY com score 4,2 em regime Neutral. Qual a abordagem recomendada?',
      options: ['A. Ignorar completamente o sinal', 'B. Comprar o dobro do tamanho normal', 'C. Comprar com posição 30-50% menor que o normal', 'D. Esperar o sinal virar Bear para comprar'],
      correct: 2,
      correctFeedback: 'Correto! Em regime Neutral, os sinais existem mas o risco é maior — reduza o tamanho da posição para compensar.',
      wrongFeedback: 'Não é isso. Em Neutral, o sinal pode ser considerado, mas com posição reduzida (30-50% menor) pelo aumento do risco.'
    },
    {
      q: 'Qual é o limite de queda do IBOV abaixo da SMA30 para o regime ser considerado Bear?',
      options: ['A. Qualquer queda abaixo da SMA30', 'B. Queda superior a 10%', 'C. Queda superior a 3%', 'D. Queda por mais de 30 dias consecutivos'],
      correct: 2,
      correctFeedback: 'Correto! Mais de 3% abaixo da SMA30 aciona o regime Bear. A margem evita falsos alarmes em oscilações normais.',
      wrongFeedback: 'Errado. O limiar é 3% abaixo da SMA30. Menos que isso ainda é zona Neutral — o Bear exige queda mais expressiva.'
    },
    {
      q: 'Qual deve ser a primeira coisa a verificar ao abrir o app Momentum?',
      options: ['A. As ações com maior valorização do dia', 'B. O regime de mercado atual', 'C. O saldo da carteira', 'D. As últimas notícias do setor financeiro'],
      correct: 1,
      correctFeedback: 'Perfeito! O regime muda o significado de tudo. Checar primeiro evita que você aja num contexto errado.',
      wrongFeedback: 'Não é essa prioridade. O regime deve ser verificado primeiro — ele determina se os sinais têm validade ou devem ser ignorados.'
    }
  ]
},

'capital_mgmt': {
  totalSteps: 5,
  sections: [
    {
      icon: '⚖️',
      title: 'Por Que o Tamanho da Posição Importa',
      hook: 'A maioria dos iniciantes controla quais ações comprar — mas ignora a variável que mais impacta o resultado: quanto comprar.',
      content: '<p>A regra fundamental da gestão de capital é <strong>nunca arriscar mais de 1-2% do seu patrimônio total em uma única operação</strong>. Parece pouco? Em uma carteira de R$10.000, isso é R$100 a R$200 de risco máximo por trade. Essa limitação não é fraqueza — é o que permite sobreviver a uma sequência de erros sem destruir o capital.</p><p>Imagine errar 5 operações seguidas — algo possível até para bons investidores. Com 2% de risco por trade, você perde apenas 10% do capital. Com 20% por trade, você já perdeu sua carteira. <strong>Sobreviver ao mercado longo prazo</strong> depende mais de gestão de risco do que de acertar muitas operações.</p><p>O Momentum calcula o tamanho sugerido de posição automaticamente usando o ATR da ação. Mas entender a lógica por trás do cálculo é o que transforma o número em convicção — e convicção é o que faz você seguir o plano quando as emoções pedem o contrário.</p>',
      chart: null
    },
    {
      icon: '🧮',
      title: 'Como Calcular o Tamanho da Posição',
      hook: 'O ATR da ação é a chave: ele diz quanto a ação oscila por dia e quanto risco cada ação representa.',
      content: '<p>A fórmula usa três variáveis: <strong>patrimônio total</strong>, <strong>percentual de risco</strong> e o <strong>ATR da ação</strong>. Exemplo prático: patrimônio R$10.000, risco de 2% (= R$200 de perda máxima), ATR da ação = R$2. O stop fica em 2×ATR = R$4 abaixo do preço de entrada.</p><p>Cálculo: <strong>Número de ações = Risco máximo ÷ (2 × ATR)</strong>. Usando os números: R$200 ÷ (2 × R$2) = R$200 ÷ R$4 = <strong>50 ações</strong>. Se o stop for atingido e a ação cair R$4, você perde exatamente R$200 — os 2% previstos. Nada mais.</p><p>O valor investido total depende do preço da ação: 50 ações × R$20 = R$1.000 (10% do patrimônio). Perceba que o tamanho da posição em reais depende da volatilidade — <strong>ações mais voláteis exigem posições menores</strong> para manter o risco constante. Isso é inteligente: você se expõe menos justamente quando o ativo oscila mais.</p>',
      chart: 'chartPositionSizing'
    },
    {
      icon: '🗂️',
      title: 'Limite de Setor e Diversificação',
      hook: 'Ter 5 ações do setor financeiro não é diversificação — é o mesmo risco repetido 5 vezes com nomes diferentes.',
      content: '<p>O Momentum recomenda que nenhum <strong>setor represente mais de 20-25%</strong> do portfólio total. Se você tem R$10.000 investidos, o máximo em ações de bancos (ou energia, ou varejo) é R$2.000 a R$2.500. Quando um setor entra em crise — regulação, commodities, taxa de juros — todas as ações do setor caem juntas.</p><p>A meta de diversificação é manter <strong>5 a 10 posições simultâneas em setores diferentes</strong>. Com 5 posições, cada uma representa no máximo 20% do portfólio — o que já cria uma proteção real. Com 10 posições bem distribuídas, nenhum evento setorial pode destruir mais de 10% do capital total.</p><p>Na prática: ao receber um sinal BUY de uma segunda ação do setor de energia, verifique primeiro quanto já está alocado nesse setor. Se já está no limite, aguarde uma saída antes de adicionar. <strong>Disciplina de setor</strong> é tão importante quanto disciplina de stop — mas muito mais fácil de ignorar quando a ação parece boa.</p>',
      chart: null
    },
    {
      icon: '🌱',
      title: 'Composição de Ganhos — Reinvistindo',
      hook: 'O maior aliado do investidor de longo prazo não é uma ação específica — é o tempo combinado com reinvestimento.',
      content: '<p><strong>Composição</strong> é o processo de reinvestir os ganhos em vez de sacá-los. A cada ciclo, o capital base cresce — e os ganhos futuros são calculados sobre esse valor maior. É o efeito "bola de neve": pequeno no início, exponencial com o tempo.</p><p>Exemplo simples: R$10.000 com 15% de retorno ao ano. Sem reinvestimento: R$1.500 por ano, R$15.000 em 10 anos. <strong>Com reinvestimento</strong>: R$40.455 em 10 anos. A diferença é R$25.455 — gerados sem nenhum esforço adicional, apenas pelo reinvestimento dos ganhos anteriores.</p><p>No Momentum, a aplicação prática é direta: quando uma operação encerra com lucro, o capital retorna para a carteira disponível. No próximo sinal, o cálculo de posição usa o patrimônio atualizado — agora maior. Com o tempo, o mesmo percentual de risco (2%) representa um valor em reais cada vez maior. A disciplina de <strong>não sacar os ganhos prematuramente</strong> é o que ativa esse mecanismo.</p>',
      chart: null
    }
  ],
  quiz: [
    {
      q: 'Qual é o percentual máximo de risco recomendado por operação no Momentum?',
      options: ['A. 10-15% do patrimônio', 'B. 5-10% do patrimônio', 'C. 1-2% do patrimônio', 'D. 0,1% do patrimônio'],
      correct: 2,
      correctFeedback: 'Correto! 1-2% por operação. Parece pouco, mas é o que permite sobreviver a sequências de erros sem destruir o capital.',
      wrongFeedback: 'Errado. O recomendado é 1-2% por trade. Percentuais maiores tornam uma sequência de erros devastadora para a carteira.'
    },
    {
      q: 'Patrimônio R$10.000, risco 2%, ATR da ação = R$2. Quantas ações comprar?',
      options: ['A. 25 ações', 'B. 100 ações', 'C. 50 ações', 'D. 200 ações'],
      correct: 2,
      correctFeedback: 'Perfeito! R$200 ÷ (2 × R$2) = 50 ações. Se o stop for atingido, a perda é exatamente R$200 (2% do patrimônio).',
      wrongFeedback: 'Errado. O cálculo: risco máximo R$200 ÷ (2×ATR = R$4) = 50 ações. A resposta C está correta.'
    },
    {
      q: 'Uma ação mais volátil (ATR maior) exige uma posição maior ou menor?',
      options: ['A. Maior — volatilidade gera mais lucro', 'B. Menor — para manter o risco constante em reais', 'C. Igual — o ATR não afeta o tamanho', 'D. Depende do humor do mercado'],
      correct: 1,
      correctFeedback: 'Correto! Mais volatilidade = posição menor. Assim o risco em reais permanece no mesmo limite de 1-2%.',
      wrongFeedback: 'Não é isso. Ações mais voláteis exigem posições menores para que o risco em reais permaneça controlado.'
    },
    {
      q: 'Qual é o limite máximo recomendado de alocação em um único setor?',
      options: ['A. 50% do portfólio', 'B. 20-25% do portfólio', 'C. 5% do portfólio', 'D. Não há limite — depende do setor'],
      correct: 1,
      correctFeedback: 'Correto! Máximo 20-25% por setor. Isso evita que uma crise setorial destrua uma fatia grande da carteira.',
      wrongFeedback: 'Errado. O limite é 20-25% por setor. Concentrar mais que isso transforma diversificação em ilusão.'
    },
    {
      q: 'Você tem PETR4 e VALE3 na carteira. Ambas são do setor de recursos naturais e já somam 22% do portfólio. Surge um sinal BUY para PRIO3 (petróleo). O que você faz?',
      options: ['A. Compra normalmente — é uma boa oportunidade', 'B. Compra o dobro para aproveitar o setor em alta', 'C. Aguarda uma saída no setor antes de adicionar PRIO3', 'D. Vende VALE3 imediatamente para comprar PRIO3'],
      correct: 2,
      correctFeedback: 'Exato! O setor já está no limite. A disciplina de setor diz: aguarde uma saída antes de adicionar mais exposição.',
      wrongFeedback: 'Não é essa ação. Com o setor já no limite de 20-25%, a decisão correta é aguardar uma saída antes de adicionar PRIO3.'
    },
    {
      q: 'O que é "composição de ganhos" no contexto do Momentum?',
      options: ['A. Comprar ações de setores diferentes ao mesmo tempo', 'B. Reinvestir os lucros para que o capital base cresça a cada ciclo', 'C. Calcular o score de múltiplas ações juntas', 'D. Dividir o patrimônio em partes iguais'],
      correct: 1,
      correctFeedback: 'Correto! Reinvestir os ganhos faz o capital base crescer, e os próximos ganhos são calculados sobre um valor maior. Efeito bola de neve.',
      wrongFeedback: 'Não é isso. Composição é reinvestir os lucros em vez de sacá-los — o que faz o capital crescer de forma exponencial ao longo do tempo.'
    }
  ]
}


};
