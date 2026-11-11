# Publicação — Portfólio Alessandra Colbert

O pacote está preparado para GitHub Pages, mas a publicação precisa de uma autenticação GitHub com permissão para **criar repositórios** e **gerenciar Pages**. Os conectores deste chat não oferecem essas ações.

## Caminho direto no Windows (Git + GitHub CLI)

1. Instale o Git para Windows e o GitHub CLI (`winget install --id GitHub.cli -e`) se ainda não estiverem instalados.
2. Execute `gh auth login` no PowerShell e autentique-se na conta `PedroColbert`.
3. Extraia o ZIP com todos os arquivos.
4. Abra o PowerShell **na pasta `alessandra_portfolio_web`** e execute:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\PUBLICAR_GITHUB.ps1
   ```

Esse script cria um **repositório novo e público** chamado `PedroColbert/alessandra-colbert-portfolio`, envia o site, habilita Pages com **GitHub Actions**, e dispara a implantação. Ele não modifica repositórios existentes.

Repositório esperado: `https://github.com/PedroColbert/alessandra-colbert-portfolio`  
Site esperado, **após publicação bem-sucedida**: `https://pedrocolbert.github.io/alessandra-colbert-portfolio/`  
Acompanhamento: `https://github.com/PedroColbert/alessandra-colbert-portfolio/actions`

## Alternativa manual

1. Crie no GitHub um **novo repositório público vazio** chamado `alessandra-colbert-portfolio`.
2. Envie `index.html`, `styles.css`, `script.js`, a pasta `assets`, `.nojekyll` e `.github/workflows/deploy.yml` para a branch `main`.
3. Em **Settings → Pages → Build and deployment → Source**, selecione **GitHub Actions**.
4. Em **Actions**, execute o workflow `Publicar portfolio no GitHub Pages`, caso ele não seja executado automaticamente.

## Notas de privacidade

A publicação pública disponibiliza as imagens com desfoque e os dados de contato exibidos no portfólio (e-mail, WhatsApp e cidade). Os originais sem desfoque e o PDF não estão presentes no pacote de publicação.
