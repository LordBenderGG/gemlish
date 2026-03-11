import { getLevelData, getAllWords, getLevelIcon, Word } from './lessons';

export type ExerciseType =
  | 'multiple-choice'
  | 'translate'
  | 'match-pairs'
  | 'listen-write'
  | 'pronunciation'
  | 'sentence-order'
  | 'fill-blank';

export interface MultipleChoiceExercise {
  type: 'multiple-choice';
  question: string;
  questionEs: string;
  options: string[];
  correct: number;
  correctAnswer: string;
}

export interface TranslateExercise {
  type: 'translate';
  question: string;
  questionEs: string;
  answer: string;
  answerAlt: string;
  correctAnswer: string;
  hint: string;
}

export interface MatchPairsExercise {
  type: 'match-pairs';
  question: string;
  questionEs: string;
  pairs: { left: string; right: string }[];
}

export interface ListenWriteExercise {
  type: 'listen-write';
  question: string;
  questionEs: string;
  wordToSpeak: string;   // palabra en inglés que el TTS pronuncia
  answer: string;        // respuesta esperada (lowercase)
  answerAlt: string;     // sin acentos
  correctAnswer: string; // para mostrar al usuario
  hint: string;
}

// Nuevo: ejercicio de pronunciación
export interface PronunciationExercise {
  type: 'pronunciation';
  question: string;
  questionEs: string;
  wordToSpeak: string;      // palabra/frase en inglés para pronunciar
  pronunciation: string;    // notación fonética /IPA/
  translation: string;      // traducción al español
  example: string;          // oración de ejemplo en inglés
  exampleEs: string;        // oración de ejemplo en español
}

// Nuevo: ordenar oración
export interface SentenceOrderExercise {
  type: 'sentence-order';
  question: string;
  questionEs: string;
  words: string[];          // palabras en orden correcto
  shuffledWords: string[];  // palabras mezcladas para mostrar al usuario
  sentence: string;         // oración completa correcta
}

// Nuevo: completar la oración
export interface FillBlankExercise {
  type: 'fill-blank';
  question: string;
  questionEs: string;
  sentenceBefore: string;   // parte antes del hueco
  sentenceAfter: string;    // parte después del hueco
  options: string[];        // 4 opciones de respuesta
  correct: number;          // índice de la opción correcta
  correctAnswer: string;    // respuesta correcta
  fullSentence: string;     // oración completa para mostrar al verificar
}

export type Exercise =
  | MultipleChoiceExercise
  | TranslateExercise
  | MatchPairsExercise
  | ListenWriteExercise
  | PronunciationExercise
  | SentenceOrderExercise
  | FillBlankExercise;

export interface Level {
  id: number;
  title: string;
  topic: string;
  icon: string;
  color: string;
  xp: number;
  exercises: Exercise[];
}

function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Genera una oración de ejemplo para ordenar usando el ejemplo de la palabra
function buildSentenceOrderExercise(word: Word): SentenceOrderExercise {
  // Usar el ejemplo de la palabra (en inglés) como oración a ordenar
  const sentence = word.example;
  // Dividir en palabras (sin puntuación al final)
  const cleanSentence = sentence.replace(/[.,!?;:]$/, '');
  const words = cleanSentence.split(' ').filter(w => w.length > 0);
  const shuffledWords = shuffleArray([...words]);

  return {
    type: 'sentence-order',
    question: 'Ordena las palabras para formar una oración:',
    questionEs: `Ordena las palabras para formar la oración en inglés:`,
    words,
    shuffledWords,
    sentence: cleanSentence,
  };
}

// Genera un ejercicio de completar la oración
function buildFillBlankExercise(
  word: Word,
  wrongWords: Word[]
): FillBlankExercise {
  // Usar el ejemplo de la palabra y reemplazar la palabra clave con un hueco
  const sentence = word.example.replace(/[.,!?;:]$/, '');
  const wordLower = word.word.toLowerCase();

  // Buscar la palabra en la oración (case insensitive)
  const regex = new RegExp(`\\b${word.word}\\b`, 'i');
  const match = sentence.match(regex);

  let sentenceBefore = '';
  let sentenceAfter = '';

  if (match && match.index !== undefined) {
    sentenceBefore = sentence.substring(0, match.index);
    sentenceAfter = sentence.substring(match.index + match[0].length);
  } else {
    // Si no se encuentra la palabra exacta, poner el hueco al final
    sentenceBefore = sentence + ' ';
    sentenceAfter = '';
  }

  // Opciones: la correcta + 3 incorrectas
  const wrongOptions = shuffleArray(wrongWords.slice(0, 6))
    .filter(w => w.word.toLowerCase() !== wordLower)
    .slice(0, 3)
    .map(w => w.word);

  const allOptions = shuffleArray([word.word, ...wrongOptions]);
  const correctIdx = allOptions.indexOf(word.word);

  return {
    type: 'fill-blank',
    question: 'Completa la oración:',
    questionEs: 'Elige la palabra correcta para completar la oración:',
    sentenceBefore: sentenceBefore.trim(),
    sentenceAfter: sentenceAfter.trim(),
    options: allOptions,
    correct: correctIdx,
    correctAnswer: word.word,
    fullSentence: sentence,
  };
}

export function generateLevel(levelNum: number): Level | null {
  const levelData = getLevelData(levelNum);
  if (!levelData) return null;

  const words = levelData.words;
  const allWords = getAllWords();
  const wrongWords = allWords.filter(
    w => !words.some(lw => lw.word.toLowerCase() === w.word.toLowerCase())
  );
  const shuffledWrong = shuffleArray(wrongWords);
  const shuffled = shuffleArray([...words]);

  const exercises: Exercise[] = [];

  // ── BLOQUE 1: Ejercicios 1-10 (tipos existentes) ─────────────────────────

  // Ejercicio 1: Opción múltiple — significado
  const w1 = shuffled[0];
  const opts1 = shuffleArray([w1.translation, ...shuffledWrong.slice(0, 3).map(w => w.translation)]);
  exercises.push({
    type: 'multiple-choice',
    question: `What does "${w1.word}" mean?`,
    questionEs: `¿Qué significa "${w1.word}"?`,
    options: opts1,
    correct: opts1.indexOf(w1.translation),
    correctAnswer: w1.translation,
  });

  // Ejercicio 2: Traducción — escribe en inglés
  const w2 = shuffled[1];
  exercises.push({
    type: 'translate',
    question: `How do you say "${w2.translation}" in English?`,
    questionEs: `¿Cómo se dice "${w2.translation}" en inglés?`,
    answer: w2.word.toLowerCase(),
    answerAlt: removeAccents(w2.word.toLowerCase()),
    correctAnswer: w2.word,
    hint: w2.word,
  });

  // Ejercicio 3: Opción múltiple — palabra en inglés
  const w3 = shuffled[2];
  const opts3 = shuffleArray([w3.word, ...shuffledWrong.slice(3, 6).map(w => w.word)]);
  exercises.push({
    type: 'multiple-choice',
    question: `Select the English word for "${w3.translation}"`,
    questionEs: `Selecciona la palabra en inglés para "${w3.translation}"`,
    options: opts3,
    correct: opts3.indexOf(w3.word),
    correctAnswer: w3.word,
  });

  // Ejercicio 4: Traducción
  const w4 = shuffled[3];
  exercises.push({
    type: 'translate',
    question: `What is "${w4.translation}" in English?`,
    questionEs: `¿Qué es "${w4.translation}" en inglés?`,
    answer: w4.word.toLowerCase(),
    answerAlt: removeAccents(w4.word.toLowerCase()),
    correctAnswer: w4.word,
    hint: w4.word,
  });

  // Ejercicio 5: Opción múltiple
  const w5 = shuffled[4];
  const opts5 = shuffleArray([w5.translation, ...shuffledWrong.slice(6, 9).map(w => w.translation)]);
  exercises.push({
    type: 'multiple-choice',
    question: `Choose: "${w5.word}" = ?`,
    questionEs: `Elige: "${w5.word}" = ?`,
    options: opts5,
    correct: opts5.indexOf(w5.translation),
    correctAnswer: w5.translation,
  });

  // Ejercicio 6: Emparejamiento de pares (4 pares)
  const pairWords = shuffled.slice(5, 9);
  exercises.push({
    type: 'match-pairs',
    question: 'Match the words with their translations',
    questionEs: 'Empareja las palabras con sus traducciones',
    pairs: pairWords.map(w => ({ left: w.word, right: w.translation })),
  });

  // Ejercicio 7: Traducción
  const w7 = shuffled[5];
  exercises.push({
    type: 'translate',
    question: `Translate: "${w7.translation}"`,
    questionEs: `Traduce: "${w7.translation}"`,
    answer: w7.word.toLowerCase(),
    answerAlt: removeAccents(w7.word.toLowerCase()),
    correctAnswer: w7.word,
    hint: w7.word,
  });

  // Ejercicio 8: Opción múltiple
  const w8 = shuffled[6];
  const opts8 = shuffleArray([w8.word, ...shuffledWrong.slice(0, 3).map(w => w.word)]);
  exercises.push({
    type: 'multiple-choice',
    question: `What is the English for "${w8.translation}"?`,
    questionEs: `¿Cuál es la palabra en inglés para "${w8.translation}"?`,
    options: opts8,
    correct: opts8.indexOf(w8.word),
    correctAnswer: w8.word,
  });

  // Ejercicio 9: Traducción
  const w9 = shuffled[7];
  exercises.push({
    type: 'translate',
    question: `"${w9.translation}" in English is:`,
    questionEs: `"${w9.translation}" en inglés es:`,
    answer: w9.word.toLowerCase(),
    answerAlt: removeAccents(w9.word.toLowerCase()),
    correctAnswer: w9.word,
    hint: w9.word,
  });

  // Ejercicio 10: Escucha y escribe (listen-write)
  const w10 = shuffled[9] || shuffled[0];
  exercises.push({
    type: 'listen-write',
    question: 'Listen and write the word you hear',
    questionEs: 'Escucha y escribe la palabra que oyes',
    wordToSpeak: w10.word,
    answer: w10.word.toLowerCase(),
    answerAlt: removeAccents(w10.word.toLowerCase()),
    correctAnswer: w10.word,
    hint: w10.word,
  });

  // ── BLOQUE 2: Ejercicios 11-20 (nuevos tipos) ────────────────────────────

  // Ejercicio 11: Pronunciación
  const wp1 = shuffled[0];
  exercises.push({
    type: 'pronunciation',
    question: 'Practica tu pronunciación:',
    questionEs: 'Lee en voz alta y graba tu pronunciación:',
    wordToSpeak: wp1.word,
    pronunciation: wp1.pronunciation,
    translation: wp1.translation,
    example: wp1.example,
    exampleEs: wp1.exampleEs,
  });

  // Ejercicio 12: Ordenar oración
  exercises.push(buildSentenceOrderExercise(shuffled[1]));

  // Ejercicio 13: Completar la oración
  exercises.push(buildFillBlankExercise(shuffled[2], shuffledWrong));

  // Ejercicio 14: Pronunciación
  const wp2 = shuffled[3];
  exercises.push({
    type: 'pronunciation',
    question: 'Practica tu pronunciación:',
    questionEs: 'Lee en voz alta y graba tu pronunciación:',
    wordToSpeak: wp2.word,
    pronunciation: wp2.pronunciation,
    translation: wp2.translation,
    example: wp2.example,
    exampleEs: wp2.exampleEs,
  });

  // Ejercicio 15: Ordenar oración
  exercises.push(buildSentenceOrderExercise(shuffled[4]));

  // Ejercicio 16: Completar la oración
  exercises.push(buildFillBlankExercise(shuffled[5], shuffledWrong));

  // Ejercicio 17: Pronunciación
  const wp3 = shuffled[6];
  exercises.push({
    type: 'pronunciation',
    question: 'Practica tu pronunciación:',
    questionEs: 'Lee en voz alta y graba tu pronunciación:',
    wordToSpeak: wp3.word,
    pronunciation: wp3.pronunciation,
    translation: wp3.translation,
    example: wp3.example,
    exampleEs: wp3.exampleEs,
  });

  // Ejercicio 18: Ordenar oración
  exercises.push(buildSentenceOrderExercise(shuffled[7]));

  // Ejercicio 19: Completar la oración
  exercises.push(buildFillBlankExercise(shuffled[8], shuffledWrong));

  // Ejercicio 20: Pronunciación final (con oración de ejemplo)
  const wpFinal = shuffled[9] || shuffled[0];
  exercises.push({
    type: 'pronunciation',
    question: 'Pronunciación final del nivel:',
    questionEs: 'Pronuncia la oración completa del nivel:',
    wordToSpeak: wpFinal.example,
    pronunciation: wpFinal.pronunciation,
    translation: wpFinal.exampleEs,
    example: wpFinal.example,
    exampleEs: wpFinal.exampleEs,
  });

  return {
    id: levelNum,
    title: `Nivel ${levelNum}: ${levelData.name}`,
    topic: levelData.name,
    icon: getLevelIcon(levelNum),
    color: levelData.color,
    xp: levelData.xp,
    exercises,
  };
}
