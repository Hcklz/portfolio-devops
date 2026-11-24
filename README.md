[![CI - Proteção de Branch](https://github.com/Hcklz/portfolio-devops/actions/workflows/ci.yml/badge.svg)](https://github.com/Hcklz/portfolio-devops/actions/workflows/ci.yml)
[![CD - Deploy GitHub Pages](https://github.com/Hcklz/portfolio-devops/actions/workflows/cd.yml/badge.svg)](https://github.com/Hcklz/portfolio-devops/actions/workflows/cd.yml)

# Portfólio Profissional — Victor Cassio (`@Hcklz`)

Projeto de portfólio estático protegido e publicado com esteira completa de **CI/CD no GitHub Actions**.

## Estrutura do Projeto

- `index.html`: página principal na raiz do repositório.
- `style.css`: folha de estilos responsiva.
- `images/`: ativos visuais leves (todos abaixo de 500KB).
- `scripts/check-links.mjs`: validador automático de links externos, âncoras internas e caminhos de imagem.
- `.github/workflows/ci.yml`: pipeline de Integração Contínua executada em Pull Requests para `main`.
- `.github/workflows/cd.yml`: pipeline de Entrega Contínua para publicação automática no GitHub Pages e alerta por e-mail em caso de falha.

## Regras da Esteira (CI/CD)

1. **Validação de entrada**: falha imediatamente se `index.html` não estiver na raiz.
2. **Matrix Strategy**: executa o `htmlhint` simultaneamente em **Node.js 18** e **Node.js 20**.
3. **Limite de tamanho**: bloqueia qualquer arquivo individual acima de **500KB** via `find`.
4. **Auditoria de texto**: bloqueia comentários de pendência e termos sensíveis.
5. **Integridade de links e imagens**: verifica se todas as tags `<a>`, `<img>` e `<link>` apontam para destinos válidos.
6. **Notificação por e-mail**: envia alerta via SMTP se o job de deploy falhar.

## Configuração dos Secrets de E-mail

Em **Settings > Secrets and variables > Actions**, cadastre:

- `MAIL_USERNAME`: endereço Gmail remetente.
- `MAIL_PASS`: App Key (credencial de aplicativo) gerada na Conta Google.
- `MAIL_TO`: endereço de destino que receberá os alertas de falha.
