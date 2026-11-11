# Alessandra Colbert — Pedagogical Portfolio 2026

Site estático e responsivo, baseado na apresentação original em PDF.

## Como abrir

1. Extraia o arquivo ZIP.
2. Abra `index.html` no navegador, ou hospede a pasta inteira em um serviço de sites estáticos.
3. Não altere a estrutura da pasta `assets`, pois ela contém as imagens do site.

Alternativamente, use o arquivo `Alessandra_Colbert_Portfolio_2026.html`, que já contém imagens, CSS e JavaScript em um único arquivo e pode ser aberto diretamente no navegador.

## Conteúdo

- Textos, nomes de projetos, citação e informações de contato preservados do PDF original, em inglês.
- As 25 imagens do PDF foram utilizadas como base de conteúdo (incluindo repetições previstas no documento).
- Cinco fotografias adicionais de aquarelas fornecidas junto com o PDF foram adicionadas à galeria visual da atividade de aquarela, sem textos novos.
- Fotos capturadas como prints foram recortadas para retirar menus, barras e outros controles.
- Os rostos visíveis das crianças foram desfocados nas imagens do site. O rosto da educadora adulta permaneceu visível.

## Recursos

- Layout responsivo para computador, tablet e celular.
- Entrada animada das seções conforme a rolagem.
- Galeria de fotos em tela cheia (clique, botões anterior/próximo, setas de teclado e Esc).
- Navegação fixa, indicador de progresso e menu móvel.
- Transições cinematográficas entre seções: uma passagem em tela cheia cobre o conteúdo, a navegação muda de capítulo instantaneamente e a nova seção é revelada sem rolagem visível.
- Links internos, botões da capa e retorno ao topo utilizam a mesma transição; histórico do navegador e preferência de movimento reduzido continuam funcionando.
- Carrossel automático e contínuo das pinturas ao final; pausa ao passar o mouse e ao selecionar uma imagem.
- Acessibilidade básica (teclado, atributos ARIA e respeito a preferência de movimento reduzido).
- Sem backend, banco de dados nem informações inventadas.

## Tipografia

Inter e Cormorant Garamond são carregadas pelo Google Fonts, quando houver internet. As fontes têm fallbacks locais para funcionamento sem internet.

## Publicação

É possível publicar esta pasta em hospedagens estáticas, como GitHub Pages, Netlify ou Vercel. O formulário de contato não é usado: o site fornece links diretos de e-mail e WhatsApp com os dados fornecidos no PDF.

## Publicar no GitHub Pages

Este projeto inclui um workflow em `.github/workflows/deploy.yml` e o script `PUBLICAR_GITHUB.ps1` para publicar no repositório público `PedroColbert/alessandra-colbert-portfolio`. Veja o passo a passo em [PUBLICACAO_GITHUB.md](PUBLICACAO_GITHUB.md).
