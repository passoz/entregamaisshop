# Plano de Negocios - EntregaMais

Este documento foi elaborado com base no produto implementado neste repositorio. O plano considera as funcionalidades ja presentes na plataforma, como marketplace geolocalizado de bebidas, cadastro e aprovacao de parceiros, painel do lojista, fila do entregador, administracao central, areas de entrega por loja, checkout, avaliacoes, autenticacao por perfis e infraestrutura pronta para Docker/Kubernetes.

As projecoes financeiras abaixo sao estimativas estrategicas. Elas servem como base de validacao do negocio e devem ser refinadas com dados reais de operacao, custos fiscais, comissoes comerciais e contratos com parceiros logistico-financeiros.

## 1. Resumo Executivo

### 1.1 Objetivo Geral

A EntregaMais nasceu para conectar clientes, depositos e entregadores em uma plataforma digital de entrega rapida de bebidas, com foco em conveniencia, preco justo e cobertura local inteligente.

### 1.2 Definicao do Negocio

Nosso negocio consiste na operacao de um marketplace digital de bebidas com tres frentes integradas:

- aplicativo web para clientes encontrarem lojas proximas, montarem carrinho e acompanharem pedidos;
- portal do lojista para credenciamento, cadastro de produtos, gestao de frete por area e operacao de pedidos;
- portal do entregador para aceite e conclusao de entregas;
- painel administrativo para aprovacao de parceiros, acompanhamento da plataforma e gestao do ecossistema.

Trata-se de um negocio de intermedicao digital com receita transacional, potencial de assinatura para parceiros e escalabilidade regional.

### 1.3 Empreendedor(es)

O projeto foi idealizado por Fernando Passos, com perfil de construcao de produto digital e base tecnica para operacao escalavel. A composicao final da equipe fundadora devera ser complementada por liderancas em operacoes, comercial e crescimento.

### 1.4 Missao

Promover uma experiencia simples, rapida e confiavel para compra e entrega de bebidas, fortalecendo o comercio local e criando renda para parceiros e entregadores.

### 1.5 Visao

Ser a principal plataforma regional de delivery de bebidas em cidades medias e polos turisticos, com operacao padronizada, expansao replicavel e alto nivel de confiabilidade tecnologica.

### 1.6 Valores

- respeito e etica nas relacoes com clientes, parceiros, entregadores e equipe;
- transparencia operacional e financeira;
- foco em execucao, disponibilidade e melhoria continua;
- valorizacao do comercio local;
- inclusao e oportunidade de geracao de renda;
- seguranca da informacao, autenticacao e rastreabilidade;
- colaboracao entre times, parceiros e ecossistema.

### 1.7 Estrutura Legal

A empresa devera ser constituida preferencialmente como Sociedade Limitada, com acordo societario claro sobre vesting, responsabilidades, pro-labore, propriedade intelectual e governanca.

### 1.8 Enquadramento Tributario

Como recomendacao preliminar, a operacao pode iniciar no Simples Nacional, caso o faturamento e a atividade permitam. Com o crescimento da receita e maior complexidade contratual, recomenda-se reavaliacao para Lucro Presumido com suporte contabil especializado.

### 1.9 Capital Social

Sugere-se capital social inicial de R$ 200.000,00, suficiente para estruturação do produto, operacao piloto, marketing inicial e capital de giro.

### 1.10 Fonte de Recursos

As fontes previstas para o empreendimento sao:

- aporte dos socios fundadores;
- investidor-anjo ou microfundo pre-seed;
- programas de inovacao, aceleracao e fomento;
- reinvestimento do caixa operacional a partir da fase de tracao.

## 2. Plano Operacional

### 2.1 Capacidade Produtiva

A capacidade produtiva da EntregaMais esta baseada em software, rede de parceiros e operacao assistida por processos. A plataforma ja demonstra capacidade de suportar:

- cadastro e autenticacao de clientes, lojistas, entregadores e administradores;
- listagem de lojas e produtos por proximidade;
- definicao de areas de entrega e taxa por localidade;
- criacao, confirmacao, preparo, coleta e entrega de pedidos;
- gestao de catalogo, pedidos e configuracoes do lojista;
- aprovacao de novos parceiros pelo administrador;
- observabilidade, gateway, rate limiting e deploy em ambientes distintos.

### 2.2 Organizacao Fisica

A empresa pode operar em modelo remoto-first, com base administrativa enxuta em coworking ou escritorio leve na cidade piloto. A estrutura fisica inicial deve contemplar:

- estacao operacional para suporte e onboarding;
- base comercial para visitas a parceiros;
- reunioes de governanca, treinamento e relacionamento;
- infraestrutura digital centralizada em cloud/container.

### 2.3 Processos Operacionais

#### Processo de Compras

A empresa nao depende de materia-prima fisica propria. Seus principais insumos sao:

- servicos de cloud, banco de dados, autenticacao e observabilidade;
- ferramentas de desenvolvimento, analytics, CRM e atendimento;
- servicos juridicos, contabeis e de compliance;
- aquisicao de clientes e parceiros via marketing e equipe comercial.

#### Processo de Venda

As vendas acontecem em dois niveis:

- B2C: o cliente acessa a plataforma, escolhe a loja, seleciona produtos, informa endereco e conclui o pedido;
- B2B2C: o lojista usa a EntregaMais como canal digital para vender online, ampliar alcance e operar entregas com mais padronizacao.

A receita da EntregaMais vem da intermediacao desses pedidos e, futuramente, de servicos premium para parceiros.

#### Processo de Distribuicao

A distribuicao do servico ocorre digitalmente pela plataforma, enquanto a distribuicao fisica dos produtos e executada pelos parceiros lojistas e entregadores credenciados. O fluxo operacional padrao e:

1. cliente escolhe loja e produtos;
2. pedido entra no painel do lojista;
3. lojista confirma e prepara;
4. entregador aceita a corrida;
5. pedido e coletado e entregue;
6. cliente acompanha status e pode avaliar o parceiro.

### 2.4 Necessidade de Pessoal

Na fase inicial, a operacao pode funcionar com equipe enxuta, aumentando gradualmente conforme cresce a densidade de pedidos, parceiros e cidades atendidas.

## 3. Plano Organizacional

### 3.1 Recursos Humanos

A estrutura recomendada para o inicio da operacao e:

- direcao geral/produto;
- lideranca tecnica/operacional;
- operacoes e suporte ao parceiro;
- comercial e onboarding;
- marketing de performance e CRM.

### 3.2 Funcionarios e Funcoes

| Funcao | Responsabilidade principal |
| --- | --- |
| Diretor Geral e Produto | estrategia, parcerias, metas, fundraising e roadmap |
| Diretor de Tecnologia e Operacoes | arquitetura, disponibilidade, seguranca e processos |
| Analista de Operacoes e Suporte | atendimento, onboarding e qualidade operacional |
| Executivo Comercial | prospeccao e credenciamento de depositos parceiros |
| Analista de Marketing e CRM | aquisicao, retencao e comunicacao com usuarios |

### 3.3 Politica Salarial

Faixa inicial sugerida para a operacao piloto:

| Cargo | Valor mensal sugerido |
| --- | ---: |
| Diretor Geral e Produto | R$ 4.000,00 (pro-labore) |
| Diretor de Tecnologia e Operacoes | R$ 4.000,00 (pro-labore) |
| Analista de Operacoes e Suporte | R$ 3.000,00 |
| Executivo Comercial | R$ 3.500,00 |
| Analista de Marketing e CRM | R$ 3.500,00 |

### 3.4 Politica de Beneficios

Beneficios sugeridos para equipe contratada:

- auxilio refeicao: R$ 600,00;
- auxilio mobilidade: R$ 250,00;
- ajuda de custo home office: R$ 150,00;
- plano de saude coparticipado: R$ 350,00;
- bonus variavel atrelado a metas de crescimento e qualidade.

### 3.5 Politica de Treinamento

O treinamento sera continuo e orientado a operacao real da plataforma:

- onboarding padronizado para novos colaboradores;
- playbooks de atendimento, incidentes e aprovacao de parceiros;
- treinamento comercial para captacao de lojistas;
- atualizacao tecnica sobre seguranca, LGPD e operacao da stack;
- reciclagem periodica com base em indicadores de qualidade.

### 3.6 Folha de Pagamento

A folha mensal estimada, incluindo encargos e beneficios da equipe-base, e de aproximadamente R$ 18.000,00 a R$ 22.000,00 na fase inicial, crescendo conforme a expansao da operacao.

## 4. Plano de Marketing

### 4.1 Publico-Alvo

A EntregaMais atende tres segmentos principais:

- clientes finais entre 21 e 45 anos, urbanos, digitais e com demanda recorrente por conveniencia;
- depositos, conveniencias e distribuidoras locais que precisam vender online sem montar operacao propria complexa;
- entregadores autonomos em busca de renda complementar ou principal.

### 4.2 Produto

O produto principal e um marketplace de delivery de bebidas com experiencia integrada para cliente, lojista, entregador e administrador. Entre os diferenciais ja refletidos no app estao:

- descoberta de lojas por proximidade e localizacao;
- catalogo digital e carrinho;
- checkout com opcoes de pagamento previstas na experiencia;
- configuracao de frete por area;
- operacao de pedidos por status;
- avaliacao de parceiros;
- credenciamento e aprovacao administrativa;
- arquitetura pronta para escalar com gateway, autenticacao centralizada e observabilidade.

### 4.3 Preco

O modelo de monetizacao proposto para o piloto e:

- comissao media de 12% sobre o valor do pedido;
- taxa de servico media equivalente a 3% do GMV;
- servicos premium futuros para parceiros, como destaque, analytics e campanhas.

Para fins de projecao, este plano adota take rate total de 15% sobre o GMV.

### 4.4 Promocao

As principais alavancas de promocao serao:

- Instagram, TikTok e WhatsApp local;
- campanhas de bairro e geofencing;
- indicacao com cupons para primeira compra;
- parceria com depositos de referencia por micro-regiao;
- acoes com eventos, finais de semana e datas comemorativas;
- CRM com recompra, carrinho abandonado e pedidos recorrentes.

### 4.5 Praca

A praca inicial sugerida e a Regiao dos Lagos do Rio de Janeiro, alinhada aos dados de demonstracao presentes na plataforma, com foco em cidades como Cabo Frio, Arraial do Cabo, Buzios e Sao Pedro da Aldeia. A segunda etapa deve priorizar cidades medias e regioes turisticas com forte demanda por conveniencia.

### 4.6 Posicionamento do Produto

A EntregaMais deve ser posicionada como uma plataforma local de entrega rapida de bebidas com melhor equilibrio entre disponibilidade, tempo de entrega e preco final para o consumidor.

### 4.7 Classificacao

O negocio pode ser classificado como:

- startup de marketplace transacional;
- plataforma B2C com camada B2B operacional;
- operacao digital com componente logistico de ultima milha.

## 5. Plano Financeiro

### 5.1 Premissas Financeiras

As projecoes deste plano consideram:

- ticket medio por pedido: R$ 55,00;
- take rate total da plataforma: 15% do GMV;
- crescimento por densidade de parceiros e recorrencia de clientes;
- receita adicional de anuncios e planos premium ainda nao considerada;
- custos variaveis equivalentes a 18% da receita da plataforma.

### 5.2 Investimento Inicial Total

| Item | Valor |
| --- | ---: |
| Evolucao do produto e integracoes | R$ 55.000,00 |
| Marketing de lancamento e aquisicao inicial | R$ 45.000,00 |
| Estruturacao juridica, contabil e compliance | R$ 15.000,00 |
| Equipamentos, ferramentas e setup operacional | R$ 20.000,00 |
| Capital de giro inicial | R$ 50.000,00 |
| Reserva para expansao da operacao piloto | R$ 15.000,00 |
| **Total** | **R$ 200.000,00** |

### 5.3 Projecoes de Venda e Fluxo de Caixa Anual

| Periodo | Pedidos medios/mes | Pedidos no semestre | GMV do semestre | Receita da plataforma |
| --- | ---: | ---: | ---: | ---: |
| Ano 1 - 1o semestre | 1.000 | 6.000 | R$ 330.000,00 | R$ 49.500,00 |
| Ano 1 - 2o semestre | 2.500 | 15.000 | R$ 825.000,00 | R$ 123.750,00 |
| Ano 2 - 1o semestre | 4.500 | 27.000 | R$ 1.485.000,00 | R$ 222.750,00 |
| Ano 2 - 2o semestre | 6.500 | 39.000 | R$ 2.145.000,00 | R$ 321.750,00 |
| Ano 3 - 1o semestre | 8.500 | 51.000 | R$ 2.805.000,00 | R$ 420.750,00 |
| Ano 3 - 2o semestre | 10.500 | 63.000 | R$ 3.465.000,00 | R$ 519.750,00 |

### 5.4 Estimativa do Faturamento da Empresa

Com base nas premissas adotadas:

- receita mensal media apos o break-even: entre R$ 45.000,00 e R$ 55.000,00;
- receita mensal estimada ao final do terceiro ano: R$ 86.625,00;
- faturamento acumulado da plataforma em 36 meses: R$ 1.658.250,00.

### 5.5 Custo da Materia-Prima / Materiais Diretos / Terceirizacoes

Como empresa de tecnologia, os custos diretos concentram-se em terceirizacoes e servicos variaveis:

- hospedagem, banco de dados, storage e observabilidade;
- servicos de autenticacao, seguranca e notificacao;
- taxas transacionais e integracoes financeiras futuras;
- incentivos comerciais e rebates logisticos;
- atendimento variavel e suporte de operacao.

Para efeito de plano, esses custos foram estimados em 18% da receita da plataforma.

### 5.6 Estimativas dos Custos Fixos Operacionais Mensais

| Item | Valor mensal |
| --- | ---: |
| Pro-labore da direcao | R$ 8.000,00 |
| Operacoes e suporte | R$ 4.000,00 |
| Comercial e onboarding | R$ 4.500,00 |
| Marketing e CRM | R$ 4.000,00 |
| Cloud, monitoramento e licencas | R$ 1.500,00 |
| Juridico, contabil e compliance | R$ 1.000,00 |
| Coworking e despesas administrativas | R$ 1.500,00 |
| Reserva operacional | R$ 1.500,00 |
| **Total mensal estimado** | **R$ 26.000,00** |

### 5.7 Demonstrativo de Resultados

| Indicador | Ano 1 | Ano 2 | Ano 3 |
| --- | ---: | ---: | ---: |
| Receita da plataforma | R$ 173.250,00 | R$ 544.500,00 | R$ 940.500,00 |
| Custos variaveis (18%) | R$ 31.185,00 | R$ 98.010,00 | R$ 169.290,00 |
| Margem de contribuicao | R$ 142.065,00 | R$ 446.490,00 | R$ 771.210,00 |
| Custos fixos anuais | R$ 312.000,00 | R$ 360.000,00 | R$ 420.000,00 |
| **Resultado operacional estimado** | **-R$ 169.935,00** | **R$ 86.490,00** | **R$ 351.210,00** |

### 5.8 Indicadores de Viabilidade

- take rate projetado: 15% do GMV;
- margem de contribuicao sobre receita: 82%;
- ponto de equilibrio operacional: aproximadamente 3.152 pedidos por mes;
- GMV mensal minimo para break-even: aproximadamente R$ 173.333,00;
- janela estimada para break-even: entre os meses 18 e 24;
- janela estimada de payback: entre 36 e 42 meses.

### 5.9 Taxa de Remuneracao do Capital

Para avaliacao do projeto, recomenda-se taxa minima de atratividade entre 12% e 15% ao ano, compatível com o risco e o potencial de retorno de uma operacao digital em fase de escala.

### 5.10 Prazo de Retorno do Investimento

Considerando as premissas adotadas, o retorno do investimento deve ocorrer entre o final do terceiro ano e o inicio do quarto ano de operacao.

## 6. Analise Estrategica

### 6.1 Analise SWOT

#### Forcas

- produto multiportal ja estruturado para clientes, lojistas, entregadores e admin;
- autenticacao por perfil, gateway e observabilidade acima da media para um MVP;
- operacao por areas de entrega e proximidade, aderente ao problema real;
- arquitetura pronta para ambientes dev, test e prod com Docker/Kubernetes.

#### Fraquezas

- operacao ainda depende de ganho de densidade regional para maximizar eficiencia;
- meios de pagamento e automacoes logisticas podem evoluir em novas fases;
- marca ainda precisa construir confianca e recorrencia frente a incumbentes.

#### Oportunidades

- digitalizacao de depositos e conveniencias locais;
- expansao para cidades medias e polos turisticos;
- servicos premium para parceiros, publicidade local e dados de demanda;
- venda corporativa para eventos, condominio e reposicao recorrente.

#### Ameacas

- concorrencia de players nacionais com maior capital;
- guerra de subsidio em frete e desconto;
- mudancas regulatórias para alcool, entrega e dados;
- rotatividade de entregadores e pressao sobre SLA operacional.

#### Acoes Prioritarias

- dominar uma regiao por vez antes de expandir;
- fortalecer onboarding e aprovacao de parceiros;
- medir recorrencia, tempo medio e NPS desde o piloto;
- lancar camada premium para lojistas apos validacao do canal transacional.

### 6.2 Cinco Forcas de Porter

- rivalidade entre concorrentes: alta, devido a players estabelecidos e apps generalistas;
- ameaca de novos entrantes: media, pois o software e reproduzivel, mas a operacao local cria barreira;
- poder de barganha dos fornecedores: medio, pois lojistas bons em micro-regioes sao ativos valiosos;
- poder de barganha dos clientes: alto, dado o baixo custo de troca e sensibilidade a preco;
- ameaca de substitutos: media, pois compra presencial, apps generalistas e atacarejos competem com a conveniencia digital.

## 7. Plano de Sustentabilidade / Responsabilidade Social e Ambiental

### 7.1 Acoes de Responsabilidade Social ou Sustentabilidade

- digitalizacao integral dos processos internos e documentos;
- incentivo a rotas mais curtas e operacao por proximidade;
- fortalecimento do pequeno e medio comercio local;
- orientacao a parceiros sobre descarte correto, embalagens e reducao de desperdicio;
- criacao de oportunidades de renda para entregadores e equipes locais.

### 7.2 Objetivos a Serem Alcancados

- reduzir impressao e papel em 100% dos fluxos internos;
- operar com onboarding, atendimento e documentacao digitais;
- acompanhar eficiencia logistica por bairro e cidade;
- priorizar fornecedores e servicos com boas praticas de seguranca e energia;
- manter governanca minima de LGPD, autenticacao e rastreabilidade.

### 7.3 Resultados Esperados

- menor consumo de papel e retrabalho administrativo;
- menor distancia media por entrega com ganho de eficiencia;
- aumento da renda local por meio de parceiros regionais;
- operacao mais previsivel, segura e transparente.

### 7.4 Mapeamento de Impactos

- consumo de energia em infraestrutura e equipamentos;
- emissao indireta na ultima milha;
- descarte de equipamentos eletronicos ao longo do tempo;
- necessidade de educacao continua sobre consumo responsavel de bebidas alcoolicas.

## 8. Anexo

### 8.1 Business Model Canvas

**Segmentos de clientes**

- consumidores finais;
- depositos e conveniencias;
- entregadores parceiros.

**Proposta de valor**

- conveniencia e rapidez para o cliente;
- canal digital e gestao simplificada para o lojista;
- oferta de corridas e renda para o entregador.

**Canais**

- aplicativo web;
- redes sociais;
- comercial direto com parceiros;
- CRM, WhatsApp e indicacao.

**Relacionamento com clientes**

- autoatendimento digital;
- suporte operacional;
- notificacoes e campanhas de recompra;
- avaliacao e reputacao na plataforma.

**Fontes de receita**

- comissao sobre pedidos;
- taxa de servico;
- planos premium, destaque e publicidade local.

**Recursos principais**

- software e infraestrutura;
- rede de parceiros;
- dados operacionais;
- marca e canais de aquisicao.

**Atividades-chave**

- onboarding de lojistas e entregadores;
- operacao da plataforma;
- suporte e qualidade;
- aquisicao e retencao;
- evolucao do produto.

**Parcerias principais**

- depositos e distribuidoras;
- entregadores autonomos;
- provedores de cloud, pagamentos e autenticacao;
- contabilidade, juridico e marketing local.

**Estrutura de custos**

- pessoas;
- marketing;
- cloud e monitoramento;
- suporte e compliance;
- incentivos comerciais e logistico-operacionais.
