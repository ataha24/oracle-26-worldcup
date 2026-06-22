import type { Team } from "@/lib/types";

// The ACTUAL 48-team field for the 2026 World Cup (USA / Canada / Mexico),
// per the official final draw of 5 Dec 2025. Elo ratings approximate World
// Football Elo at the start of the tournament and are the basis for every
// forecast in the engine. Star lists & history are curated.

export const TEAMS: Team[] = [
  // ---------------- CONMEBOL ----------------
  {
    id: "argentina", name: "Argentina", code: "ARG", flag: "🇦🇷", confederation: "CONMEBOL",
    fifaRank: 1, elo: 2130, formTrend: 0.5,
    blurb: "Reigning champions. Messi's last dance meets a ruthless, battle-hardened core.",
    history: { appearances: 19, titles: 3, bestResult: "Champions", lastTitle: 2022 },
    stars: ["Lionel Messi", "Lautaro Martínez", "Julián Álvarez", "Enzo Fernández"],
  },
  {
    id: "brazil", name: "Brazil", code: "BRA", flag: "🇧🇷", confederation: "CONMEBOL",
    fifaRank: 5, elo: 2025, formTrend: 0.2,
    blurb: "The most successful nation ever, hunting a sixth star and an end to the wait since 2002.",
    history: { appearances: 22, titles: 5, bestResult: "Champions", lastTitle: 2002 },
    stars: ["Vinícius Jr.", "Rodrygo", "Raphinha", "Endrick"],
  },
  {
    id: "uruguay", name: "Uruguay", code: "URU", flag: "🇺🇾", confederation: "CONMEBOL",
    fifaRank: 11, elo: 1915, formTrend: 0.3,
    blurb: "Two-time champions reborn under a fearless, high-pressing young generation.",
    history: { appearances: 14, titles: 2, bestResult: "Champions", lastTitle: 1950 },
    stars: ["Federico Valverde", "Darwin Núñez", "Ronald Araújo"],
  },
  {
    id: "colombia", name: "Colombia", code: "COL", flag: "🇨🇴", confederation: "CONMEBOL",
    fifaRank: 14, elo: 1880, formTrend: 0.4,
    blurb: "A golden generation built around James, capable of beating anyone on their day.",
    history: { appearances: 6, titles: 0, bestResult: "Quarter-finals" },
    stars: ["James Rodríguez", "Luis Díaz", "Jhon Durán"],
  },
  {
    id: "ecuador", name: "Ecuador", code: "ECU", flag: "🇪🇨", confederation: "CONMEBOL",
    fifaRank: 23, elo: 1790, formTrend: 0.2,
    blurb: "Young, athletic and defensively elite — the dark-horse spoiler of South America.",
    history: { appearances: 4, titles: 0, bestResult: "Round of 16" },
    stars: ["Moisés Caicedo", "Kendry Páez", "Pervis Estupiñán"],
  },
  {
    id: "paraguay", name: "Paraguay", code: "PAR", flag: "🇵🇾", confederation: "CONMEBOL",
    fifaRank: 40, elo: 1720, formTrend: 0.3,
    blurb: "Back among the elite after a long absence, awkward and resilient as ever.",
    history: { appearances: 9, titles: 0, bestResult: "Quarter-finals" },
    stars: ["Miguel Almirón", "Julio Enciso", "Antonio Sanabria"],
  },

  // ---------------- UEFA ----------------
  {
    id: "france", name: "France", code: "FRA", flag: "🇫🇷", confederation: "UEFA",
    fifaRank: 2, elo: 2105, formTrend: 0.3,
    blurb: "A relentless conveyor belt of talent. Finalists in 2022, favorites by depth alone.",
    history: { appearances: 17, titles: 2, bestResult: "Champions", lastTitle: 2018 },
    stars: ["Kylian Mbappé", "Aurélien Tchouaméni", "Désiré Doué", "William Saliba"],
  },
  {
    id: "spain", name: "Spain", code: "ESP", flag: "🇪🇸", confederation: "UEFA",
    fifaRank: 3, elo: 2095, formTrend: 0.7,
    blurb: "European champions playing the most complete football on the planet right now.",
    history: { appearances: 17, titles: 1, bestResult: "Champions", lastTitle: 2010 },
    stars: ["Lamine Yamal", "Rodri", "Pedri", "Nico Williams"],
  },
  {
    id: "england", name: "England", code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", confederation: "UEFA",
    fifaRank: 4, elo: 2040, formTrend: 0.3,
    blurb: "Frighteningly deep and finally fearless — desperate to end 60 years of hurt.",
    history: { appearances: 17, titles: 1, bestResult: "Champions", lastTitle: 1966 },
    stars: ["Jude Bellingham", "Harry Kane", "Bukayo Saka", "Cole Palmer"],
  },
  {
    id: "portugal", name: "Portugal", code: "POR", flag: "🇵🇹", confederation: "UEFA",
    fifaRank: 6, elo: 2010, formTrend: 0.2,
    blurb: "A devastating attack and Ronaldo's farewell — talent has never been the question.",
    history: { appearances: 9, titles: 0, bestResult: "Fourth place" },
    stars: ["Cristiano Ronaldo", "Bruno Fernandes", "Rafael Leão", "Vitinha"],
  },
  {
    id: "netherlands", name: "Netherlands", code: "NED", flag: "🇳🇱", confederation: "UEFA",
    fifaRank: 7, elo: 2000, formTrend: 0.1,
    blurb: "Total-football pedigree and a spine of world-class talent still chasing a first star.",
    history: { appearances: 12, titles: 0, bestResult: "Runners-up" },
    stars: ["Virgil van Dijk", "Cody Gakpo", "Xavi Simons"],
  },
  {
    id: "germany", name: "Germany", code: "GER", flag: "🇩🇪", confederation: "UEFA",
    fifaRank: 9, elo: 1965, formTrend: 0.4,
    blurb: "A sleeping giant stirring — youth, hunger, and four stars of history behind them.",
    history: { appearances: 21, titles: 4, bestResult: "Champions", lastTitle: 2014 },
    stars: ["Florian Wirtz", "Jamal Musiala", "Kai Havertz"],
  },
  {
    id: "belgium", name: "Belgium", code: "BEL", flag: "🇧🇪", confederation: "UEFA",
    fifaRank: 8, elo: 1945, formTrend: 0.0,
    blurb: "The last of a golden generation, still loaded with match-winners.",
    history: { appearances: 15, titles: 0, bestResult: "Third place" },
    stars: ["Kevin De Bruyne", "Jérémy Doku", "Romelu Lukaku"],
  },
  {
    id: "croatia", name: "Croatia", code: "CRO", flag: "🇭🇷", confederation: "UEFA",
    fifaRank: 12, elo: 1925, formTrend: -0.1,
    blurb: "The great overachievers — finalists and semi-finalists, masters of the long game.",
    history: { appearances: 7, titles: 0, bestResult: "Runners-up" },
    stars: ["Luka Modrić", "Joško Gvardiol", "Mateo Kovačić"],
  },
  {
    id: "switzerland", name: "Switzerland", code: "SUI", flag: "🇨🇭", confederation: "UEFA",
    fifaRank: 19, elo: 1840, formTrend: 0.2,
    blurb: "Tournament specialists — never spectacular, never easy to beat.",
    history: { appearances: 13, titles: 0, bestResult: "Quarter-finals" },
    stars: ["Granit Xhaka", "Manuel Akanji", "Dan Ndoye"],
  },
  {
    id: "austria", name: "Austria", code: "AUT", flag: "🇦🇹", confederation: "UEFA",
    fifaRank: 22, elo: 1810, formTrend: 0.4,
    blurb: "A pressing machine that punches well above its historical weight.",
    history: { appearances: 8, titles: 0, bestResult: "Third place" },
    stars: ["Marcel Sabitzer", "Konrad Laimer", "Marko Arnautović"],
  },
  {
    id: "turkey", name: "Türkiye", code: "TUR", flag: "🇹🇷", confederation: "UEFA",
    fifaRank: 26, elo: 1790, formTrend: 0.3,
    blurb: "Bursting with young talent and swagger after a thrilling Euro run.",
    history: { appearances: 6, titles: 0, bestResult: "Third place" },
    stars: ["Arda Güler", "Kenan Yıldız", "Hakan Çalhanoğlu"],
  },
  {
    id: "norway", name: "Norway", code: "NOR", flag: "🇳🇴", confederation: "UEFA",
    fifaRank: 25, elo: 1810, formTrend: 0.6,
    blurb: "Back on the big stage at last, with two of the best attackers alive.",
    history: { appearances: 4, titles: 0, bestResult: "Round of 16" },
    stars: ["Erling Haaland", "Martin Ødegaard", "Alexander Sørloth"],
  },
  {
    id: "sweden", name: "Sweden", code: "SWE", flag: "🇸🇪", confederation: "UEFA",
    fifaRank: 29, elo: 1800, formTrend: 0.5,
    blurb: "Back with a vengeance, fronted by the most fearsome strike duo in Europe.",
    history: { appearances: 13, titles: 0, bestResult: "Runners-up" },
    stars: ["Alexander Isak", "Viktor Gyökeres", "Dejan Kulusevski"],
  },
  {
    id: "scotland", name: "Scotland", code: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", confederation: "UEFA",
    fifaRank: 34, elo: 1790, formTrend: 0.4,
    blurb: "The Tartan Army are back, chasing a first-ever trip beyond the group stage.",
    history: { appearances: 9, titles: 0, bestResult: "Group stage" },
    stars: ["Scott McTominay", "Andy Robertson", "John McGinn"],
  },
  {
    id: "czech-republic", name: "Czechia", code: "CZE", flag: "🇨🇿", confederation: "UEFA",
    fifaRank: 38, elo: 1775, formTrend: 0.1,
    blurb: "Heirs to a proud footballing tradition, dangerous on their day.",
    history: { appearances: 11, titles: 0, bestResult: "Runners-up*" },
    stars: ["Patrik Schick", "Tomáš Souček", "Adam Hložek"],
  },
  {
    id: "bosnia", name: "Bosnia & Herzegovina", code: "BIH", flag: "🇧🇦", confederation: "UEFA",
    fifaRank: 70, elo: 1720, formTrend: 0.2,
    blurb: "Spirited and direct, still led up top by a legendary goalscorer.",
    history: { appearances: 1, titles: 0, bestResult: "Group stage" },
    stars: ["Edin Džeko", "Sead Kolašinac", "Ermedin Demirović"],
  },

  // ---------------- CONCACAF ----------------
  {
    id: "usa", name: "United States", code: "USA", flag: "🇺🇸", confederation: "CONCACAF",
    fifaRank: 16, elo: 1810, formTrend: 0.4, host: true,
    blurb: "Co-hosts with their most talented squad ever and a home crowd behind them.",
    history: { appearances: 12, titles: 0, bestResult: "Third place" },
    stars: ["Christian Pulisic", "Weston McKennie", "Gio Reyna", "Yunus Musah"],
  },
  {
    id: "mexico", name: "Mexico", code: "MEX", flag: "🇲🇽", confederation: "CONCACAF",
    fifaRank: 17, elo: 1800, formTrend: 0.3, host: true,
    blurb: "Co-hosts chasing the elusive fifth game — a deeper run than ever before.",
    history: { appearances: 19, titles: 0, bestResult: "Quarter-finals" },
    stars: ["Santiago Giménez", "Edson Álvarez", "Hirving Lozano"],
  },
  {
    id: "canada", name: "Canada", code: "CAN", flag: "🇨🇦", confederation: "CONCACAF",
    fifaRank: 31, elo: 1730, formTrend: 0.4, host: true,
    blurb: "Co-hosts on a meteoric rise with genuine pace and belief.",
    history: { appearances: 3, titles: 0, bestResult: "Group stage" },
    stars: ["Alphonso Davies", "Jonathan David", "Tajon Buchanan"],
  },
  {
    id: "panama", name: "Panama", code: "PAN", flag: "🇵🇦", confederation: "CONCACAF",
    fifaRank: 41, elo: 1690, formTrend: 0.3,
    blurb: "Tough, organized and rising fast within CONCACAF.",
    history: { appearances: 1, titles: 0, bestResult: "Group stage" },
    stars: ["Adalberto Carrasquilla", "José Fajardo", "Cecilio Waterman"],
  },
  {
    id: "haiti", name: "Haiti", code: "HAI", flag: "🇭🇹", confederation: "CONCACAF",
    fifaRank: 83, elo: 1560, formTrend: 0.3,
    blurb: "A fairy-tale return to the World Cup after half a century away.",
    history: { appearances: 1, titles: 0, bestResult: "Group stage" },
    stars: ["Frantzdy Pierrot", "Danley Jean Jacques", "Duckens Nazon"],
  },
  {
    id: "curacao", name: "Curaçao", code: "CUW", flag: "🇨🇼", confederation: "CONCACAF",
    fifaRank: 90, elo: 1540, formTrend: 0.2,
    blurb: "The smallest nation ever to reach a World Cup — pure history.",
    history: { appearances: 0, titles: 0, bestResult: "Debut" },
    stars: ["Leandro Bacuna", "Tahith Chong", "Juninho Bacuna"],
  },

  // ---------------- CAF ----------------
  {
    id: "morocco", name: "Morocco", code: "MAR", flag: "🇲🇦", confederation: "CAF",
    fifaRank: 13, elo: 1870, formTrend: 0.6,
    blurb: "The 2022 semi-finalists — Africa's standard-bearers and a genuine contender.",
    history: { appearances: 8, titles: 0, bestResult: "Fourth place" },
    stars: ["Achraf Hakimi", "Brahim Díaz", "Bilal El Khannouss"],
  },
  {
    id: "senegal", name: "Senegal", code: "SEN", flag: "🇸🇳", confederation: "CAF",
    fifaRank: 18, elo: 1815, formTrend: 0.3,
    blurb: "Powerful, fast and well-drilled — perennial African powerhouse.",
    history: { appearances: 5, titles: 0, bestResult: "Quarter-finals" },
    stars: ["Nicolas Jackson", "Pape Matar Sarr", "Iliman Ndiaye"],
  },
  {
    id: "egypt", name: "Egypt", code: "EGY", flag: "🇪🇬", confederation: "CAF",
    fifaRank: 33, elo: 1750, formTrend: 0.3,
    blurb: "Built around one of the greatest African players ever to chase a deep run.",
    history: { appearances: 4, titles: 0, bestResult: "Group stage" },
    stars: ["Mohamed Salah", "Omar Marmoush", "Mostafa Mohamed"],
  },
  {
    id: "algeria", name: "Algeria", code: "ALG", flag: "🇩🇿", confederation: "CAF",
    fifaRank: 36, elo: 1740, formTrend: 0.2,
    blurb: "Technical and dangerous, eager to recapture their 2014 heights.",
    history: { appearances: 5, titles: 0, bestResult: "Round of 16" },
    stars: ["Riyad Mahrez", "Houssem Aouar", "Amine Gouiri"],
  },
  {
    id: "ivory-coast", name: "Ivory Coast", code: "CIV", flag: "🇨🇮", confederation: "CAF",
    fifaRank: 39, elo: 1730, formTrend: 0.4,
    blurb: "Reigning African champions riding home-continent confidence.",
    history: { appearances: 4, titles: 0, bestResult: "Group stage" },
    stars: ["Sébastien Haller", "Simon Adingra", "Franck Kessié"],
  },
  {
    id: "ghana", name: "Ghana", code: "GHA", flag: "🇬🇭", confederation: "CAF",
    fifaRank: 43, elo: 1700, formTrend: 0.1,
    blurb: "The Black Stars — flair, drama and the eternal what-if of 2010.",
    history: { appearances: 5, titles: 0, bestResult: "Quarter-finals" },
    stars: ["Mohammed Kudus", "Antoine Semenyo", "Thomas Partey"],
  },
  {
    id: "tunisia", name: "Tunisia", code: "TUN", flag: "🇹🇳", confederation: "CAF",
    fifaRank: 45, elo: 1690, formTrend: 0.0,
    blurb: "Disciplined and stubborn — capable of upsetting anyone (just ask France).",
    history: { appearances: 7, titles: 0, bestResult: "Group stage" },
    stars: ["Hannibal Mejbri", "Montassar Talbi", "Elias Saad"],
  },
  {
    id: "south-africa", name: "South Africa", code: "RSA", flag: "🇿🇦", confederation: "CAF",
    fifaRank: 56, elo: 1700, formTrend: 0.3,
    blurb: "Bafana Bafana return revitalized, blending pace with a fearless young core.",
    history: { appearances: 4, titles: 0, bestResult: "Group stage" },
    stars: ["Lyle Foster", "Percy Tau", "Themba Zwane"],
  },
  {
    id: "dr-congo", name: "DR Congo", code: "COD", flag: "🇨🇩", confederation: "CAF",
    fifaRank: 55, elo: 1660, formTrend: 0.4,
    blurb: "Play-off winners with real attacking talent and nothing to lose.",
    history: { appearances: 2, titles: 0, bestResult: "Group stage" },
    stars: ["Cédric Bakambu", "Yoane Wissa", "Théo Bongonda"],
  },
  {
    id: "cape-verde", name: "Cape Verde", code: "CPV", flag: "🇨🇻", confederation: "CAF",
    fifaRank: 67, elo: 1630, formTrend: 0.4,
    blurb: "The Blue Sharks — one of the great underdog stories of this World Cup.",
    history: { appearances: 0, titles: 0, bestResult: "Debut" },
    stars: ["Ryan Mendes", "Garry Rodrigues", "Jamiro Monteiro"],
  },

  // ---------------- AFC ----------------
  {
    id: "japan", name: "Japan", code: "JPN", flag: "🇯🇵", confederation: "AFC",
    fifaRank: 15, elo: 1820, formTrend: 0.6,
    blurb: "Asia's most complete side — quick, fearless, and giant-slayers of 2022.",
    history: { appearances: 8, titles: 0, bestResult: "Round of 16" },
    stars: ["Takefusa Kubo", "Kaoru Mitoma", "Wataru Endo"],
  },
  {
    id: "south-korea", name: "South Korea", code: "KOR", flag: "🇰🇷", confederation: "AFC",
    fifaRank: 24, elo: 1760, formTrend: 0.2,
    blurb: "Relentless runners led by a generational captain.",
    history: { appearances: 12, titles: 0, bestResult: "Fourth place" },
    stars: ["Son Heung-min", "Lee Kang-in", "Kim Min-jae"],
  },
  {
    id: "iran", name: "Iran", code: "IRN", flag: "🇮🇷", confederation: "AFC",
    fifaRank: 20, elo: 1760, formTrend: 0.1,
    blurb: "Asia's most consistent qualifier — physical, organized and hard to break down.",
    history: { appearances: 7, titles: 0, bestResult: "Group stage" },
    stars: ["Mehdi Taremi", "Sardar Azmoun", "Alireza Jahanbakhsh"],
  },
  {
    id: "australia", name: "Australia", code: "AUS", flag: "🇦🇺", confederation: "AFC",
    fifaRank: 27, elo: 1720, formTrend: 0.2,
    blurb: "The Socceroos — all grit and heart, perennial last-16 nuisances.",
    history: { appearances: 7, titles: 0, bestResult: "Round of 16" },
    stars: ["Jackson Irvine", "Riley McGree", "Cameron Burgess"],
  },
  {
    id: "saudi-arabia", name: "Saudi Arabia", code: "KSA", flag: "🇸🇦", confederation: "AFC",
    fifaRank: 56, elo: 1660, formTrend: 0.0,
    blurb: "Conquerors of Argentina in 2022 — never to be underestimated.",
    history: { appearances: 7, titles: 0, bestResult: "Round of 16" },
    stars: ["Salem Al-Dawsari", "Firas Al-Buraikan", "Mohamed Kanno"],
  },
  {
    id: "qatar", name: "Qatar", code: "QAT", flag: "🇶🇦", confederation: "AFC",
    fifaRank: 49, elo: 1670, formTrend: 0.2,
    blurb: "Back-to-back Asian champions seeking respect on the global stage.",
    history: { appearances: 2, titles: 0, bestResult: "Group stage" },
    stars: ["Akram Afif", "Almoez Ali", "Hassan Al-Haydos"],
  },
  {
    id: "iraq", name: "Iraq", code: "IRQ", flag: "🇮🇶", confederation: "AFC",
    fifaRank: 58, elo: 1600, formTrend: 0.3,
    blurb: "Back at the World Cup with pride and a passionate footballing nation behind them.",
    history: { appearances: 2, titles: 0, bestResult: "Group stage" },
    stars: ["Aymen Hussein", "Zidane Iqbal", "Ali Jasim"],
  },
  {
    id: "uzbekistan", name: "Uzbekistan", code: "UZB", flag: "🇺🇿", confederation: "AFC",
    fifaRank: 57, elo: 1620, formTrend: 0.5,
    blurb: "Debutants and the feel-good story of Asian qualifying.",
    history: { appearances: 0, titles: 0, bestResult: "Debut" },
    stars: ["Eldor Shomurodov", "Abbosbek Fayzullaev", "Khusayin Norchaev"],
  },
  {
    id: "jordan", name: "Jordan", code: "JOR", flag: "🇯🇴", confederation: "AFC",
    fifaRank: 62, elo: 1640, formTrend: 0.5,
    blurb: "Asian Cup finalists making a historic World Cup debut.",
    history: { appearances: 0, titles: 0, bestResult: "Debut" },
    stars: ["Mousa Al-Tamari", "Yazan Al-Naimat", "Nour Al-Rawabdeh"],
  },

  // ---------------- OFC ----------------
  {
    id: "new-zealand", name: "New Zealand", code: "NZL", flag: "🇳🇿", confederation: "OFC",
    fifaRank: 86, elo: 1560, formTrend: 0.1,
    blurb: "Oceania's flag-bearers, unbeaten at their last World Cup back in 2010.",
    history: { appearances: 3, titles: 0, bestResult: "Group stage" },
    stars: ["Chris Wood", "Marko Stamenić", "Liberato Cacace"],
  },
];

export const TEAM_BY_ID: Record<string, Team> = Object.fromEntries(
  TEAMS.map((t) => [t.id, t]),
);

export function getTeam(id: string): Team {
  const t = TEAM_BY_ID[id];
  if (!t) throw new Error(`Unknown team: ${id}`);
  return t;
}

/** Elo nudged by recent form, used everywhere as the team's effective strength. */
export function effectiveElo(t: Team): number {
  return t.elo + t.formTrend * 18;
}
