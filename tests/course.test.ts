import { describe, it, expect } from 'vitest';
import { LESSONS, getLevelData, getDailyWords, getAllWords, getLevelIcon } from '../data/lessons';
import { generateLevel } from '../data/exerciseGenerator';

describe('Datos del Curso', () => {
  it('debe tener lecciones definidas', () => {
    expect(LESSONS.length).toBeGreaterThanOrEqual(30);
  });

  it('cada lección debe tener exactamente 10 palabras', () => {
    LESSONS.forEach(lesson => {
      expect(lesson.words.length).toBe(10);
    });
  });

  it('debe retornar datos para el nivel 1', () => {
    const data = getLevelData(1);
    expect(data).toBeDefined();
    expect(data.name).toBe('Saludos');
  });

  it('debe retornar datos para el nivel 500', () => {
    const data = getLevelData(500);
    expect(data).toBeDefined();
    expect(data.name).toBeTruthy();
  });

  it('debe retornar 30 palabras diarias', () => {
    const words = getDailyWords();
    expect(words.length).toBe(30);
  });

  it('debe retornar todas las palabras del curso', () => {
    const words = getAllWords();
    expect(words.length).toBeGreaterThanOrEqual(300);
  });

  it('debe retornar un ícono para cada nivel', () => {
    for (let i = 1; i <= 10; i++) {
      const icon = getLevelIcon(i);
      expect(icon).toBeTruthy();
    }
  });
});

describe('Generador de Ejercicios', () => {
  it('debe generar un nivel con 20 ejercicios', () => {
    const level = generateLevel(1);
    expect(level).not.toBeNull();
    expect(level!.exercises.length).toBe(20);
  });

  it('debe generar ejercicios de los 7 tipos', () => {
    const level = generateLevel(1);
    const types = level!.exercises.map(e => e.type);
    expect(types).toContain('multiple-choice');
    expect(types).toContain('translate');
    expect(types).toContain('match-pairs');
    expect(types).toContain('listen-write');
    expect(types).toContain('pronunciation');
    expect(types).toContain('sentence-order');
    expect(types).toContain('fill-blank');
  });

  it('debe generar el nivel 500 correctamente', () => {
    const level = generateLevel(500);
    expect(level).not.toBeNull();
    expect(level!.id).toBe(500);
    expect(level!.exercises.length).toBe(20);
  });

  it('los ejercicios de opción múltiple deben tener 4 opciones', () => {
    const level = generateLevel(1);
    const mc = level!.exercises.filter(e => e.type === 'multiple-choice');
    mc.forEach(ex => {
      expect((ex as any).options.length).toBe(4);
    });
  });

  it('los ejercicios de pronunciación deben tener wordToSpeak y pronunciation', () => {
    const level = generateLevel(1);
    const pron = level!.exercises.filter(e => e.type === 'pronunciation');
    expect(pron.length).toBe(4);
    pron.forEach(ex => {
      expect((ex as any).wordToSpeak).toBeTruthy();
      expect((ex as any).pronunciation).toBeTruthy();
    });
  });

  it('los ejercicios de ordenar oración deben tener words y shuffledWords', () => {
    const level = generateLevel(1);
    const so = level!.exercises.filter(e => e.type === 'sentence-order');
    expect(so.length).toBe(3);
    so.forEach(ex => {
      expect((ex as any).words.length).toBeGreaterThan(0);
      expect((ex as any).shuffledWords.length).toBe((ex as any).words.length);
    });
  });

  it('los ejercicios de completar la oración deben tener 4 opciones', () => {
    const level = generateLevel(1);
    const fb = level!.exercises.filter(e => e.type === 'fill-blank');
    expect(fb.length).toBe(3);
    fb.forEach(ex => {
      expect((ex as any).options.length).toBe(4);
    });
  });

});
