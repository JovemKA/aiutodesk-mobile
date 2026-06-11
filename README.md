# AiutoDesk Mobile

Aplicativo mobile de central de suporte (helpdesk) com assistente de IA, base de conhecimento e gestão de chamados, construído em **Expo + React Native** e conectado ao backend do AiutoDesk.

---

## 👤 Identificação

### Andrey Kaiky Reis Ferreira

> **RA:** `00000853666`
> **Disciplina:** **Programação para Dispositivos Móveis**

---

## 📱 Sobre

O AiutoDesk Mobile é a versão para celular do AiutoDesk. Permite que usuários conversem com um **assistente de IA** (respostas em streaming), consultem a **base de conhecimento** e acompanhem **chamados**, enquanto agentes e administradores gerenciam tickets e cadastros. A interface se adapta ao **papel (role)** do usuário autenticado.

## ✨ Funcionalidades

- **Autenticação**: login, cadastro (sign up) e logout com JWT, sessão persistida.
- **Assistente com IA**: chat com respostas em streaming (SSE), perguntas sugeridas, citação de fontes e escalonamento para chamado.
- **Base de Conhecimento**: listagem com busca, leitura (markdown) e voto de utilidade.
- **Chamados**: criação, listagem com filtros, detalhe com mensagens/timeline, atribuição e mudança de status/prioridade.
- **Administração**: CRUD de Categorias e Departamentos (restrito a master/admin).
- **UX**: tema claro/escuro persistente, navegação por menu lateral (drawer) adaptativa por papel.

## ✅ Requisitos atendidos

| Requisito | Implementação |
| --- | --- |
| Expo Router | Navegação por arquivos em `app/` com grupos `(auth)` e `(app)` |
| Estado global | **Zustand** (sessão, tema e drawer) |
| Telas Home, Sobre e equipe | `index` (Home), `about` (Sobre, com seção da equipe) |
| Interação | Botões, campos de texto, seleção (sheets) e checkbox |
| Axios + TanStack Query | Cliente HTTP com interceptors + hooks de query/mutation |
| Login, logout e sign up | Fluxo completo de autenticação |
| CRUD de 4 entidades | **Ticket, Artigo, Categoria, Departamento** |
| 2 relacionamentos | Ticket → Departamento/Categoria e Ticket → responsável (usuário) |
| UI Kit compatível com Expo | **Gluestack UI** |

## 🧱 Stack

Expo SDK 54 · React Native 0.81 · TypeScript · expo-router · **Zustand** · **TanStack Query** · **Axios** · **Gluestack UI** · expo-secure-store · react-native-markdown-display · EAS Update (OTA).

## 📂 Estrutura

```text
app/                # Rotas (expo-router): (auth) e (app)
  (app)/            # Área autenticada: home, chat, knowledge, tickets, admin, profile, about
features/           # auth, theme, navigation (stores Zustand)
components/         # UI compartilhada (ScreenLayout, ui/, forms/, chat/)
hooks/queries/      # Hooks TanStack Query por entidade
services/api/       # Cliente axios, tokenStore e serviços por domínio
theme/              # Design system (cores, tipografia, espaçamento)
```

## 🚀 Como rodar

**Pré-requisitos:** Node 20+, npm e o app **Expo Go** no celular (ou emulador Android/iOS).

```bash
# 1. Instalar dependências
npm install

# 2. Configurar a URL do backend
cp .env.sample .env
# edite o EXPO_PUBLIC_API_URL conforme o ambiente:
#   Web / iOS simulador : http://localhost:3000
#   Emulador Android     : http://10.0.2.2:3000
#   Celular físico       : http://<SEU_IP_NA_LAN>:3000
#   (ou a URL do backend hospedado)

# 3. Iniciar
npx expo start          # escaneie o QR no Expo Go
```

### Scripts

| Script | Ação |
| --- | --- |
| `npm start` | Inicia o servidor de desenvolvimento (Metro) |
| `npm run android` | Abre no emulador/dispositivo Android |
| `npm run ios` | Abre no simulador iOS |
| `npm run web` | Abre no navegador |
| `npm run go` | Inicia no modo Expo Go |
| `npm run lint` | Lint do projeto |

## 🔌 Backend e conta de teste

O app consome a API REST do **AiutoDesk** (NestJS). Defina a URL em `EXPO_PUBLIC_API_URL`.

- **Conta de teste:** `dev@teste.com` / `devTeste`
- Novos usuários podem ser criados pela própria tela de cadastro.

## 📦 Build e atualizações (EAS)

O projeto está configurado para **EAS Build** e **EAS Update** (OTA), com `runtimeVersion` por *fingerprint*.

```bash
eas build --profile preview --platform android   # gera o APK
eas update --auto                                 # publica atualização OTA
```

---

**Programação para Dispositivos Móveis** — Andrey Kaiky Reis Ferreira · RA 00000853666
