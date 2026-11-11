# Portfólio Alessandra Colbert — publicação em repositório público novo.
# Requisitos: Git, GitHub CLI (gh) e login realizado em 'gh auth login'.
# Não altera nenhum repositório já existente.
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$Repo = 'PedroColbert/alessandra-colbert-portfolio'
$RepoName = 'alessandra-colbert-portfolio'
Set-Location -LiteralPath $PSScriptRoot

function Run([string]$Display, [scriptblock]$Action) {
    Write-Host "`n>>> $Display" -ForegroundColor Cyan
    & $Action
    if ($LASTEXITCODE -ne 0) { throw "Falha em: $Display (codigo $LASTEXITCODE)" }
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Git nao encontrado. Instale o Git para Windows.' }
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { throw 'GitHub CLI nao encontrado. Instale: winget install --id GitHub.cli -e' }

Run 'Verificar autenticacao GitHub' { gh auth status }
$LoggedIn = (& gh api user --jq '.login' 2>$null)
if ($LASTEXITCODE -ne 0 -or $LoggedIn -ne 'PedroColbert') {
    throw 'A conta do gh CLI precisa ser PedroColbert. Verifique: gh auth login / gh auth switch.'
}

if (Test-Path '.git') { throw 'Esta pasta ja tem .git. Para evitar alterar historico, interrompi a publicacao.' }

$AlreadyExists = & gh repo view $Repo --json name --jq '.name' 2>$null
if ($LASTEXITCODE -eq 0) {
    throw "O repositorio '$Repo' ja existe. Nenhuma alteracao foi feita."
}

Run 'Iniciar historico Git' { git init -b main }
Run 'Adicionar somente arquivos do site' { git add -- index.html styles.css script.js assets README.md PUBLICACAO_GITHUB.md PUBLICAR_GITHUB.ps1 .nojekyll .github/workflows/deploy.yml }
Run 'Criar primeiro commit' { git -c user.name='PedroColbert' -c user.email='134964004+PedroColbert@users.noreply.github.com' commit -m 'Publicar portfolio pedagogico de Alessandra Colbert' }
Run 'Criar repositorio PUBLICO e enviar arquivos' { gh repo create $Repo --public --description 'Portfolio pedagogico de Alessandra Colbert - 2026' --source . --remote origin --push }

# O token autenticado via GitHub CLI cria o site Pages. Um workflow comum nao
# tem permissao de administracao para criar Pages do zero automaticamente.
$null = & gh api "repos/$Repo/pages" 2>$null
if ($LASTEXITCODE -ne 0) {
    Run 'Ativar GitHub Pages com GitHub Actions' { gh api -X POST "repos/$Repo/pages" -f build_type=workflow }
}
# O registro de um workflow novo pode levar alguns segundos; evitar falso erro.
$Started = $false
for ($Attempt = 1; $Attempt -le 6; $Attempt++) {
    Write-Host "Disparando deploy (tentativa $Attempt de 6)..." -ForegroundColor Cyan
    & gh workflow run deploy.yml --repo $Repo --ref main
    if ($LASTEXITCODE -eq 0) { $Started = $true; break }
    Start-Sleep -Seconds 3
}
if (-not $Started) { throw 'Repositorio criado e Pages ativado, mas o workflow ainda nao foi disparado. Tente: gh workflow run deploy.yml --repo PedroColbert/alessandra-colbert-portfolio --ref main' }

Write-Host "`nRepositorio: https://github.com/$Repo" -ForegroundColor Green
Write-Host "Endereco esperado do site: https://pedrocolbert.github.io/$RepoName/" -ForegroundColor Green
Write-Host 'Verifique a implantacao em: https://github.com/PedroColbert/alessandra-colbert-portfolio/actions' -ForegroundColor Yellow
