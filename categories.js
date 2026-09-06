// ============================================================
// CATEGORIAS DO JOGO
// ============================================================
// Para criar uma categoria nova, basta adicionar um novo item
// aqui, seguindo o formato abaixo. Cada categoria precisa de
// PELO MENOS 20 palavras (recomendado: 20-30).
//
// A dica do impostor é sorteada automaticamente entre as outras
// palavras da MESMA categoria — ou seja, você só precisa manter
// a lista de palavras, nada de escrever dicas manualmente.
//
// icon: um emoji só pra deixar o card da categoria bonitinho.
// ============================================================

const CATEGORIES = {
  valorant: {
    label: "Valorant",
    icon: "🎯",
    words: [
      "Jett", "Sage", "Sova", "Reyna", "Omen", "Killjoy", "Raze", "Phoenix",
      "Viper", "Cypher", "Breach", "Brimstone", "Skye", "Yoru", "Astra",
      "KAY/O", "Chamber", "Neon", "Fade", "Harbor", "Gekko", "Deadlock",
      "Iso", "Clove", "Vyse"
    ]
  },

  eldenring: {
    label: "Elden Ring",
    icon: "🗡️",
    words: [
      "Malenia", "Radagon", "Margit", "Godrick", "Rennala", "Morgott",
      "Mohg", "Maliketh", "Placidusax", "Rykard", "Radahn", "Godfrey",
      "Marika", "Miquella", "Ranni", "Melina", "Blaidd", "Torrent",
      "Árvore Áurea", "Limgrave", "Caelid", "Liurnia", "Castelo Stormveil",
      "Sem-Luz Tarnished"
    ]
  },

  naruto: {
    label: "Naruto",
    icon: "🍥",
    words: [
      "Naruto", "Sasuke", "Sakura", "Kakashi", "Itachi", "Jiraiya",
      "Orochimaru", "Gaara", "Hinata", "Shikamaru", "Rock Lee", "Neji",
      "Tsunade", "Minato", "Obito", "Madara", "Pain", "Konan", "Kisame",
      "Deidara", "Sasori", "Kurenai", "Asuma", "Tenten", "Choji"
    ]
  },

  onepiece: {
    label: "One Piece",
    icon: "🏴‍☠️",
    words: [
      "Luffy", "Zoro", "Nami", "Usopp", "Sanji", "Chopper", "Robin",
      "Franky", "Brook", "Jinbe", "Ace", "Sabo", "Shanks", "Barba Branca",
      "Doflamingo", "Kaido", "Big Mom", "Trafalgar Law", "Katakuri",
      "Crocodile", "Rob Lucci", "Boa Hancock", "Mihawk", "Buggy"
    ]
  },

  cs: {
    label: "Counter-Strike",
    icon: "💣",
    words: [
      "Dust II", "Mirage", "Inferno", "Nuke", "Overpass", "Vertigo",
      "Ancient", "Anubis", "Train", "AWP", "AK-47", "M4A4", "Desert Eagle",
      "Glock", "USP-S", "Flashbang", "Fumaça (Smoke)", "Molotov",
      "Kit de Defusa", "C4", "Zeus x27", "Galil", "Famas", "MP9"
    ]
  },

  animes: {
    label: "Animes (geral)",
    icon: "🎌",
    words: [
      "Goku", "Vegeta", "Gohan", "Piccolo", "Freeza", "Cell", "Majin Boo",
      "Light Yagami", "L", "Edward Elric", "Alphonse Elric",
      "Ichigo Kurosaki", "Saitama", "Genos", "Deku", "Bakugo", "All Might",
      "Killua", "Gon", "Meliodas", "Rimuru", "Sailor Moon", "Doraemon",
      "Conan Edogawa", "Spike Spiegel"
    ]
  },

  minecraft: {
    label: "Minecraft",
    icon: "⛏️",
    words: [
      "Steve", "Alex", "Creeper", "Enderman", "Zumbi", "Esqueleto",
      "Aranha", "Bruxa", "Piglin", "Ghast", "Blaze", "Wither",
      "Ender Dragon", "Vaca", "Porco", "Ovelha", "Cavalo", "Lobo",
      "Golem de Ferro", "Diamante", "Esmeralda", "Redstone", "Netherite",
      "TNT", "Poção"
    ]
  },

  fortnite: {
    label: "Fortnite",
    icon: "🪂",
    words: [
      "Victory Royale", "Ônibus de Batalha", "Lhama do Loot",
      "Zona de Tempestade", "Baú", "Rampa", "Picareta", "Escopeta",
      "Fuzil de Assalto", "Granada", "Bandagem", "Poção de Escudo",
      "Planador", "V-Bucks", "Passe de Batalha", "Emote", "Skin",
      "Construção", "Eliminação", "Solo", "Dupla", "Esquadrão"
    ]
  },

  pokemon: {
    label: "Pokémon",
    icon: "⚡",
    words: [
      "Pikachu", "Charizard", "Bulbasaur", "Squirtle", "Mewtwo", "Mew",
      "Eevee", "Snorlax", "Gengar", "Gyarados", "Lucario", "Greninja",
      "Charmander", "Jigglypuff", "Psyduck", "Machamp", "Alakazam",
      "Dragonite", "Blastoise", "Venusaur", "Pokébola", "Ginásio Pokémon",
      "Mestre Pokémon"
    ]
  },

  rpg: {
    label: "Elementos e Conceitos de RPG",
    icon: "🎲",
    words: [
      "Fogo", "Água", "Terra", "Vento", "Gelo", "Elétrico", "Veneno",
      "Luz", "Trevas", "Cura", "Mana", "Experiência (XP)", "Level Up",
      "Chefe Final", "Classe de Personagem", "Inventário", "Missão (Quest)",
      "NPC", "Pontos de Vida (HP)", "Dano Crítico", "Furtividade", "Loot",
      "Árvore de Habilidades", "Buff", "Debuff", "Respawn"
    ]
  },

  demonslayer: {
    label: "Demon Slayer",
    icon: "🌙",
    words: [
      "Tanjiro", "Nezuko", "Zenitsu", "Inosuke", "Giyu Tomioka",
      "Shinobu Kocho", "Kanao Tsuyuri", "Mitsuri Kanroji", "Muzan Kibutsuji",
      "Akaza", "Douma", "Kokushibo", "Rengoku", "Tengen Uzui", "Gyutaro",
      "Daki", "Yushiro", "Tamayo", "Genya", "Sanemi",
      "Respiração da Água", "Respiração do Fogo", "Respiração do Trovão",
      "Hashira"
    ]
  },

  aot: {
    label: "Attack on Titan",
    icon: "🧱",
    words: [
      "Eren Yeager", "Mikasa Ackerman", "Armin Arlert", "Levi Ackerman",
      "Erwin Smith", "Hange Zoe", "Historia Reiss", "Reiner Braun",
      "Bertholdt Hoover", "Annie Leonhart", "Ymir", "Jean Kirstein",
      "Sasha Blouse", "Connie Springer", "Zeke Yeager", "Titã Colossal",
      "Titã Blindado", "Titã de Ataque", "Titã Fêmea", "Muralha Maria",
      "Muralha Rose", "Equipamento de Manobras 3D", "Corpo de Exploração"
    ]
  }
};

// Validação simples em tempo de execução (só ajuda no console do navegador)
if (typeof window !== "undefined") {
  Object.entries(CATEGORIES).forEach(([key, cat]) => {
    if (!cat.words || cat.words.length < 20) {
      console.warn(`Categoria "${key}" tem menos de 20 palavras!`);
    }
  });
}
