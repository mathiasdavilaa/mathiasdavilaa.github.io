# Jogo do Impostor

Site pra jogar o "jogo do impostor" com os amigos, cada um no seu computador. Todo mundo recebe a mesma palavra secreta, menos o(s) impostor(es), que recebem uma dica relacionada.

## Como funciona

- Um jogador **cria a sala**, escolhe a categoria e quantos impostores vão ter.
- Os outros **entram na sala** com o código de 5 letras.
- O anfitrião **inicia o jogo**: cada jogador vê, em segredo no próprio celular/computador, a palavra ou (se for impostor) uma dica.
- Depois da rodada de conversa, o anfitrião clica em **"Encerrar rodada e revelar"** e todo mundo vê a palavra verdadeira e quem eram os impostores.
- Dá pra jogar quantas rodadas quiser sem sair da sala.

Como o GitHub Pages só serve arquivos estáticos, a sincronização entre os computadores dos amigos é feita pelo **Firebase Realtime Database** (tem plano gratuito, suficiente pra esse uso).

## Passo 1 — Criar o Firebase (5 minutos, de graça)

1. Acesse [console.firebase.google.com](https://console.firebase.google.com) e crie um projeto novo (pode desativar o Google Analytics, não precisa).
2. No menu lateral, vá em **Build > Realtime Database** e clique em **Criar banco de dados**.
   - Escolha qualquer região.
   - Escolha **"Iniciar em modo de teste"** (isso deixa leitura/escrita liberadas por 30 dias — depois, se quiser continuar usando, é só renovar a regra, veja a seção "Segurança" abaixo).
3. Ainda no console, clique no ícone de engrenagem > **Configurações do projeto**.
4. Na aba **Geral**, role até "Seus apps" e clique no ícone **`</>`** (Web) pra registrar um app.
5. Dê um nome qualquer e clique em registrar. Vai aparecer um bloco de código com um objeto `firebaseConfig` parecido com isto:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "meu-projeto.firebaseapp.com",
  databaseURL: "https://meu-projeto-default-rtdb.firebaseio.com",
  projectId: "meu-projeto",
  storageBucket: "meu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

6. Copie esses valores e cole no arquivo **`firebase-config.js`** deste projeto, substituindo os valores de exemplo.

## Passo 2 — Colocar no GitHub Pages

1. Crie um repositório novo no GitHub (pode ser público).
2. Suba todos os arquivos desta pasta (`index.html`, `style.css`, `app.js`, `categories.js`, `firebase-config.js`) pra raiz do repositório.
3. No repositório, vá em **Settings > Pages**.
4. Em "Source", escolha a branch `main` e a pasta `/ (root)`, e salve.
5. Depois de um minuto, o GitHub mostra o link do site (algo como `https://seu-usuario.github.io/nome-do-repo/`).
6. Manda esse link pros seus amigos — cada um abre no próprio computador/celular e entra na mesma sala pelo código.

## Adicionando novas categorias

Abra `categories.js` e adicione um novo item no objeto `CATEGORIES`, por exemplo:

```js
filmesdeterror: {
  label: "Filmes de Terror",
  icon: "🔪",
  words: [
    "Freddy Krueger", "Jason Voorhees", "Michael Myers", /* ... pelo menos 20 no total */
  ]
}
```

Não precisa escrever dicas: a dica do impostor é sempre sorteada entre as outras palavras da mesma categoria. Só garanta que cada categoria tenha **pelo menos 20 palavras**.

## Sobre segurança do banco de dados

O "modo de teste" do Firebase libera leitura/escrita pra qualquer pessoa que tenha a URL do banco, por 30 dias. Pra um jogo casual com amigos isso é tranquilo, mas depois desse prazo o banco passa a bloquear tudo. Se quiser manter funcionando, volte em **Realtime Database > Regras** e coloque algo assim (mais permissivo, sem prazo de validade — ok pra esse uso, já que não guarda nada sensível):

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

## Rodando localmente antes de publicar

Não dá só pra abrir o `index.html` direto no navegador com duplo clique em alguns casos (por causa de restrições de `file://`). O mais simples é, dentro da pasta do projeto, rodar:

```bash
python3 -m http.server 8000
```

e abrir `http://localhost:8000` no navegador.
