import { airports } from './airports.js';

const italianCities = {
  Moscow: 'Mosca',
  Rome: 'Roma',
  Naples: 'Napoli',
  'Saint Petersburg': 'San Pietroburgo',
  Venice: 'Venezia',
  Genoa: 'Genova',
  Barcelona: 'Barcellona',
  Gibraltar: 'Gibilterra',
  'Mexico City': 'Città del Messico',
  Nice: 'Nizza',
  Marseille: 'Marsiglia',
  Lisbon: 'Lisbona',
  Seville: 'Siviglia',
  Athens: 'Atene',
  Dublin: 'Dublino',
  London: 'Londra',
};

const italianAirportNames = {
  UUEE: 'Aeroporto internazionale di Mosca-Šeremet’evo',
  UUDD: 'Aeroporto internazionale di Mosca-Domodedovo',
  UUWW: 'Aeroporto internazionale di Mosca-Vnukovo',
  LIRF: 'Aeroporto di Roma-Fiumicino Leonardo da Vinci',
  LIRN: 'Aeroporto internazionale di Napoli-Capodichino',
  KLAX: 'Aeroporto internazionale di Los Angeles',
  KSFO: 'Aeroporto internazionale di San Francisco',
  KORD: 'Aeroporto internazionale di Chicago O’Hare',
  KATL: 'Aeroporto internazionale di Atlanta Hartsfield-Jackson',
  KDCA: 'Aeroporto nazionale Ronald Reagan di Washington',
  KEWR: 'Aeroporto internazionale di Newark Liberty',
  ULLI: 'Aeroporto internazionale di San Pietroburgo-Pulkovo',
  LIPZ: 'Aeroporto di Venezia Marco Polo',
  LIMJ: 'Aeroporto di Genova Cristoforo Colombo',
  LEMD: 'Aeroporto Adolfo Suárez di Madrid-Barajas',
  UWKD: 'Aeroporto internazionale di Kazan',
  PHNL: 'Aeroporto internazionale Daniel K. Inouye',
  YSSY: 'Aeroporto di Sydney Kingsford Smith',
  LMML: 'Aeroporto internazionale di Malta',
  LOWI: 'Aeroporto di Innsbruck',
  LEBL: 'Aeroporto Josep Tarradellas di Barcellona-El Prat',
  YSCB: 'Aeroporto di Canberra',
  LICC: 'Aeroporto di Catania-Fontanarossa',
  LEPA: 'Aeroporto di Palma di Maiorca',
  LXGB: 'Aeroporto internazionale di Gibilterra',
  MMMX: 'Aeroporto internazionale Benito Juárez di Città del Messico',
  KMIA: 'Aeroporto internazionale di Miami',
  MMUN: 'Aeroporto internazionale di Cancún',
  KDEN: 'Aeroporto internazionale di Denver',
  KIAH: 'Aeroporto intercontinentale George Bush di Houston',
  CYVR: 'Aeroporto internazionale di Vancouver',
  PANC: 'Aeroporto internazionale Ted Stevens di Anchorage',
  RJTT: 'Aeroporto internazionale di Tokyo-Haneda',
  VHHH: 'Aeroporto internazionale di Hong Kong',
  WSSS: 'Aeroporto di Singapore-Changi',
  KJFK: 'Aeroporto internazionale John F. Kennedy',
  SBGL: 'Aeroporto internazionale di Rio de Janeiro-Galeão',
  RJAA: 'Aeroporto internazionale di Tokyo-Narita',
  LIRA: 'Aeroporto di Roma-Ciampino',
  LFMN: 'Aeroporto di Nizza Costa Azzurra',
  LFML: 'Aeroporto di Marsiglia-Provenza',
  LPPT: 'Aeroporto di Lisbona Humberto Delgado',
  LEVC: 'Aeroporto di Valencia',
  LEZL: 'Aeroporto di Siviglia',
  LGAV: 'Aeroporto internazionale Eleftherios Venizelos di Atene',
  GCXO: 'Aeroporto di Tenerife Nord-Ciudad de La Laguna',
  SCEL: 'Aeroporto internazionale Arturo Merino Benítez',
  SAEZ: 'Aeroporto internazionale di Buenos Aires-Ezeiza',
  SACO: 'Aeroporto internazionale di Córdoba Ambrosio Taravella',
  SLET: 'Aeroporto El Trompillo',
  SLLP: 'Aeroporto internazionale di El Alto',
  SBGR: 'Aeroporto internazionale di São Paulo-Guarulhos',
  SBSV: 'Aeroporto internazionale di Salvador',
  SBRF: 'Aeroporto internazionale di Recife-Guararapes',
  MDSD: 'Aeroporto internazionale Las Américas',
  KLAS: 'Aeroporto internazionale Harry Reid di Las Vegas',
  KSEA: 'Aeroporto internazionale di Seattle-Tacoma',
  CYOW: 'Aeroporto internazionale di Ottawa Macdonald-Cartier',
  KBOS: 'Aeroporto internazionale Logan di Boston',
  EIDW: 'Aeroporto di Dublino',
  EGCC: 'Aeroporto di Manchester',
  EGPF: 'Aeroporto di Glasgow',
  EGGP: 'Aeroporto di Liverpool John Lennon',
  EGBB: 'Aeroporto di Birmingham',
  EGLL: 'Aeroporto di Londra-Heathrow',
  EGKK: 'Aeroporto di Londra-Gatwick',
  EGSS: 'Aeroporto di Londra-Stansted',
  EGLC: 'Aeroporto di Londra-City',
};

// Named airports sharing a city use a short qualifier in compact labels.
const qualifiers = {
  UUEE: ['Шереметьево', 'Sheremetyevo'],
  UUDD: ['Домодедово', 'Domodedovo'],
  UUWW: ['Внуково', 'Vnukovo'],
  LIRF: ['Фьюмичино', 'Fiumicino'],
  LIRA: ['Чампино', 'Ciampino'],
  RJTT: ['Ханэда', 'Haneda'],
  RJAA: ['Нарита', 'Narita'],
  EGLL: ['Хитроу', 'Heathrow'],
  EGKK: ['Гатвик', 'Gatwick'],
  EGSS: ['Станстед', 'Stansted'],
  EGLC: ['Сити', 'City'],
};

// These flight endpoints are used in the log but are outside the map catalogue.
const routeOnlyLabels = {
  RJFF: { ru: 'Фукуока', en: 'Fukuoka', it: 'Fukuoka' },
  BIKF: { ru: 'Кеблавик', en: 'Keflavík', it: 'Keflavík' },
  ZSPD: { ru: 'Шанхай · Пудун', en: 'Shanghai · Pudong', it: 'Shanghai · Pudong' },
  LTBA: { ru: 'Стамбул · Ататюрк', en: 'Istanbul · Atatürk', it: 'Istanbul · Atatürk' },
  OMDB: { ru: 'Дубай', en: 'Dubai', it: 'Dubai' },
};

const byIcao = new Map(airports.map((airport) => [airport[0], airport]));

export function airportCity(airport, lang) {
  if (lang === 'ru') return airport[2];
  return lang === 'it' ? italianCities[airport[3]] || airport[3] : airport[3];
}

export function airportName(airport, lang) {
  if (lang === 'it') return italianAirportNames[airport[0]];
  return airport[lang === 'ru' ? 4 : 5];
}

export function airportLabel(airport, lang) {
  const city = airportCity(airport, lang);
  const qualifier = qualifiers[airport[0]]?.[lang === 'ru' ? 0 : 1];
  return qualifier ? city + ' · ' + qualifier : city;
}

function normalize(value) {
  return value
    .toLowerCase()
    .replaceAll('ё', 'е')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/['’]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export function matchesAirport(airport, query, regions = []) {
  const needle = normalize(query);
  if (!needle) return true;
  const labels = ['ru', 'en', 'it'].flatMap((lang) => [
    airportLabel(airport, lang),
    airportName(airport, lang),
  ]);
  const searchable = normalize([airport[0], airport[1], ...labels, ...regions].join(' '));
  return needle.split(' ').every((word) => searchable.includes(word));
}

export function routeLabel(flight, lang) {
  return [flight.from, flight.to]
    .map((code) => {
      const airport = byIcao.get(code);
      return airport ? airportLabel(airport, lang) : (routeOnlyLabels[code]?.[lang] ?? code);
    })
    .join(' → ');
}
