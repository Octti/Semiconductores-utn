export const triviaData = [
  { q: "En 1907, ¿quién observó por primera vez la electroluminiscencia al aplicar corriente a cristales de carburo de silicio?", options: ["Thomas Edison", "Henry Joseph Round", "Oleg Lósev"], correct: 1 },
  { q: "¿En qué año Oleg Lósev presentó la primera patente registrada para un 'relé luminoso'?", options: ["1907", "1927", "1955"], correct: 1 },
  { q: "¿Qué científico es reconocido como el «padre del diodo emisor de luz» por crear el primer LED rojo visible en 1962?", options: ["Nick Holonyak Jr.", "Rubin Braunstein", "James R. Biard"], correct: 0 },
  { q: "¿Qué elemento añadió M. George Craford en 1972 para lograr la invención del primer LED amarillo?", options: ["Nitrógeno", "Fósforo", "Magnesio"], correct: 0 },
  { q: "¿Qué empresa desarrolló la solución de conversión por fósforo (pc-LED) en 1995 para generar luz blanca?", options: ["Texas Instruments", "Monsanto Company", "Nichia Corporation"], correct: 2 },
  { q: "¿Por qué avance ganaron el Premio Nobel de Física en 2014 Isamu Akasaki, Hiroshi Amano y Shuji Nakamura?", options: ["El LED Infrarrojo", "El LED azul eficiente", "Las pantallas OLED"], correct: 1 },
  { q: "En la agricultura vertical, ¿qué efecto tiene la longitud de onda azul en las plantas?", options: ["Promueve la floración", "Evita el estiramiento excesivo del tallo", "Aumenta la temperatura ambiente"], correct: 1 },
  { q: "Según la Agencia Internacional de Energía, ¿qué porcentaje del consumo eléctrico mundial representa la iluminación?", options: ["10%", "20%", "40%"], correct: 1 }
];

export const matchMaterials = [
  { id: 'm1', text: 'Carburo de Silicio (1907)' },
  { id: 'm2', text: 'Arseniuro de Galio (1961)' },
  { id: 'm3', text: 'Arseniuro-fosfuro de galio (1962)' },
  { id: 'm4', text: 'Nitruro de Galio e Indio (1993)' }
];

export const matchColors = [
  { id: 'c1', text: 'Luz amarillenta tenue', match: 'm1' },
  { id: 'c2', text: 'Radiación infrarroja de alta intensidad', match: 'm2' },
  { id: 'c3', text: 'Luz brillante de tonalidad roja', match: 'm3' },
  { id: 'c4', text: 'Luz azul brillante (450 nm)', match: 'm4' }
];

export const timelineEvents = [
  { id: 1, year: 1907, text: 'H. J. Round presencia el fenómeno de la electroluminiscencia en estado sólido.' },
  { id: 2, year: 1961, text: 'Biard y Pittman patentan el primer diodo emisor de luz infrarroja comercial.' },
  { id: 3, year: 1968, text: 'Hewlett-Packard y Monsanto masifican el uso del LED.' },
  { id: 4, year: 1993, text: 'Shuji Nakamura inventa el LED azul brillante comercial.' },
  { id: 5, year: 2006, text: 'El LED supera la barrera de eficiencia de los 100 lm/W frente a la luz incandescente.' }
];