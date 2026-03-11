import { getLevelData, getAllWords, getLevelIcon, Word } from './lessons';

export type ExerciseType =
  | 'multiple-choice'
  | 'translate'
  | 'match-pairs'
  | 'listen-write'
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

// Ordenar oración
export interface SentenceOrderExercise {
  type: 'sentence-order';
  question: string;
  questionEs: string;
  words: string[];          // palabras en orden correcto
  shuffledWords: string[];  // palabras mezcladas para mostrar al usuario
  sentence: string;         // oración completa correcta
  sentenceEs: string;       // traducción al español
}

// Completar la oración
export interface FillBlankExercise {
  type: 'fill-blank';
  question: string;
  questionEs: string;
  sentenceBefore: string;   // parte antes del hueco
  sentenceAfter: string;    // parte después del hueco
  sentenceEs: string;       // traducción completa al español
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

// Genera un ejercicio de ordenar oración usando el ejemplo de la palabra
function buildSentenceOrderExercise(word: Word): SentenceOrderExercise {
  const sentence = word.example.replace(/[.,!?;:]$/, '');
  const words = sentence.split(' ').filter(w => w.length > 0);
  const shuffledWords = shuffleArray([...words]);

  return {
    type: 'sentence-order',
    question: 'Ordena las palabras para formar una oración:',
    questionEs: `Ordena las palabras para formar la oración en inglés:`,
    words,
    shuffledWords,
    sentence,
    sentenceEs: word.exampleEs,
  };
}

/**
 * Genera un ejercicio fill-blank con dificultad adaptada al nivel.
 * Niveles bajos (1-5): oraciones muy cortas y simples (solo la palabra clave).
 * Niveles medios (6-20): oraciones del ejemplo de la palabra.
 * Niveles altos (21+): oraciones completas del ejemplo.
 */
function buildFillBlankExercise(
  word: Word,
  wrongWords: Word[],
  levelNum: number
): FillBlankExercise {
  let sentence: string;
  let sentenceEs: string;

  if (levelNum <= 5) {
    // Niveles 1-5: oración muy simple — solo "The ___ is ..." con la palabra
    const simpleTemplates = [
      { en: `The ${word.word} is important.`, es: `El/La ${word.translation} es importante.` },
      { en: `I see a ${word.word}.`, es: `Veo un/una ${word.translation}.` },
      { en: `This is a ${word.word}.`, es: `Esto es un/una ${word.translation}.` },
      { en: `I like the ${word.word}.`, es: `Me gusta el/la ${word.translation}.` },
    ];
    const tpl = simpleTemplates[Math.floor(Math.random() * simpleTemplates.length)];
    sentence = tpl.en;
    sentenceEs = tpl.es;
  } else {
    // Niveles 6+: usar el ejemplo real de la palabra
    sentence = word.example.replace(/[.,!?;:]$/, '');
    sentenceEs = word.exampleEs;
  }

  const wordLower = word.word.toLowerCase();
  const regex = new RegExp(`\\b${word.word}\\b`, 'i');
  const match = sentence.match(regex);

  let sentenceBefore = '';
  let sentenceAfter = '';

  if (match && match.index !== undefined) {
    sentenceBefore = sentence.substring(0, match.index);
    sentenceAfter = sentence.substring(match.index + match[0].length);
  } else {
    sentenceBefore = sentence + ' ';
    sentenceAfter = '';
  }

  // Opciones: la correcta + 3 incorrectas del mismo nivel de dificultad
  const wrongOptions = shuffleArray(wrongWords.slice(0, 8))
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
    sentenceEs,
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

  // ── BLOQUE 2: Ejercicios 11-20 (sin pronunciación) ───────────────────────

  // Ejercicio 11: Opción múltiple (repaso)
  const w11 = shuffled[0];
  const opts11 = shuffleArray([w11.translation, ...shuffledWrong.slice(9, 12).map(w => w.translation)]);
  exercises.push({
    type: 'multiple-choice',
    question: `"${w11.word}" means:`,
    questionEs: `"${w11.word}" significa:`,
    options: opts11,
    correct: opts11.indexOf(w11.translation),
    correctAnswer: w11.translation,
  });

  // Ejercicio 12: Ordenar oración
  exercises.push(buildSentenceOrderExercise(shuffled[1]));

  // Ejercicio 13: Completar la oración (con dificultad según nivel)
  exercises.push(buildFillBlankExercise(shuffled[2], shuffledWrong, levelNum));

  // Ejercicio 14: Escucha y escribe
  const w14 = shuffled[3];
  exercises.push({
    type: 'listen-write',
    question: 'Listen and write what you hear',
    questionEs: 'Escucha y escribe lo que oyes',
    wordToSpeak: w14.word,
    answer: w14.word.toLowerCase(),
    answerAlt: removeAccents(w14.word.toLowerCase()),
    correctAnswer: w14.word,
    hint: w14.word,
  });

  // Ejercicio 15: Ordenar oración
  exercises.push(buildSentenceOrderExercise(shuffled[4]));

  // Ejercicio 16: Completar la oración
  exercises.push(buildFillBlankExercise(shuffled[5], shuffledWrong, levelNum));

  // Ejercicio 17: Traducción
  const w17 = shuffled[6];
  exercises.push({
    type: 'translate',
    question: `Write in English: "${w17.translation}"`,
    questionEs: `Escribe en inglés: "${w17.translation}"`,
    answer: w17.word.toLowerCase(),
    answerAlt: removeAccents(w17.word.toLowerCase()),
    correctAnswer: w17.word,
    hint: w17.word,
  });

  // Ejercicio 18: Ordenar oración
  exercises.push(buildSentenceOrderExercise(shuffled[7]));

  // Ejercicio 19: Completar la oración
  exercises.push(buildFillBlankExercise(shuffled[8], shuffledWrong, levelNum));

  // Ejercicio 20: Emparejamiento final (repaso de todo el nivel)
  const finalPairWords = shuffled.slice(0, 4);
  exercises.push({
    type: 'match-pairs',
    question: 'Final review: match all pairs',
    questionEs: 'Repaso final: empareja todos los pares',
    pairs: finalPairWords.map(w => ({ left: w.word, right: w.translation })),
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
