# Calculadora de emissões de viagens

Aplicação estática em português para estimar emissões de CO₂e de viagens entre cidades brasileiras, comparar bicicleta, carro, ônibus e caminhão, e consultar uma referência didática de compensação.

## Como usar

1. Informe origem e destino. As cidades sugeridas vêm da base local de rotas.
2. Selecione o modal da viagem (carro é a opção inicial).
3. Para uma rota cadastrada, a distância é preenchida automaticamente, inclusive quando origem e destino são invertidos. Para uma rota não cadastrada, informe uma distância maior que zero em quilômetros.
4. Selecione **Calcular viagem** para atualizar o resumo, a comparação e a compensação sem recarregar a página.

## Cálculos e premissas

Os fatores estão centralizados em `js/config.js` e são ilustrativos, em kg CO₂e por veículo-km. A emissão principal e a compensação usam o modal selecionado; a tabela compara os quatro modais para a mesma distância. A bicicleta tem fator zero. Os fatores não são medições oficiais e não representam emissão por passageiro ou por unidade de carga, portanto não são uma comparação de eficiência por ocupante.

- Emissões (kg CO₂e) = distância (km) × fator (kg CO₂e/veículo-km).
- Toneladas de CO₂e = emissões em kg ÷ 1000.
- Créditos equivalentes = toneladas de CO₂e.
- Créditos inteiros necessários = arredondamento para cima das toneladas. Emissão zero requer zero créditos.
- Custo estimado = créditos inteiros × preço configurado por crédito.

O preço padrão é **R$ 80 por crédito** e pode ser alterado em `js/config.js`. É um valor didático, não uma cotação atual de mercado nem recomendação de compra. A compensação é uma estimativa simplificada e não substitui a redução de emissões.

As distâncias de `js/route-data.js` são exemplos simulados, não dados de navegação. Rotas fora dessa lista não recebem uma distância inventada; o usuário precisa informar uma estimativa manual. A aplicação não consulta mapas, tráfego, ocupação, tipo de combustível ou condições reais da viagem.

## Arquivos

- `index.html`: estrutura semântica, formulário e áreas de resultado.
- `css/style.css`: estilos responsivos, variáveis visuais e estados de foco/erro.
- `js/route-data.js`: exemplos locais de rotas e distâncias.
- `js/config.js`: fatores de emissão, nomes dos modais e preço ilustrativo.
- `js/calculator.js`: busca de rota e cálculos sem dependência do DOM.
- `js/ui.js`: atualização segura da interface e formatação dos resultados.
- `js/app.js`: inicialização, autocompletar local e eventos do formulário.
- `.github/workflows/deploy.yml`: publicação dos arquivos estáticos pelo GitHub Pages.

## Abrir e publicar

Os módulos ES devem ser servidos por HTTP; abrir `index.html` diretamente como arquivo local pode ser bloqueado pelo navegador. Para testar localmente sem instalar dependências, na raiz do repositório execute:

```sh
python3 -m http.server 8000
```

Depois abra `http://localhost:8000`.

Para publicar, envie o repositório ao GitHub na branch `main`. Em **Settings → Pages**, selecione **GitHub Actions** como fonte de publicação. O fluxo será iniciado em cada `push` para `main` ou manualmente pela aba **Actions**. O endereço de um repositório de projeto normalmente será `https://<usuario>.github.io/<nome-do-repositorio>/`; caminhos relativos nos arquivos mantêm os assets e imports funcionando nessa subpasta. Se a branch padrão do repositório não for `main`, ajuste o filtro de branch em `.github/workflows/deploy.yml`.

## Exemplo de prompt usado no desenvolvimento

> Crie uma calculadora estática de emissões de CO₂e para viagens no Brasil com HTML, CSS e JavaScript puro. Inclua rotas simuladas locais com busca nos dois sentidos, distância manual validada, comparação de bicicleta, carro, ônibus e caminhão, e estimativa transparente de créditos e custo. Use módulos ES e prepare o GitHub Pages sem build ou dependências externas.