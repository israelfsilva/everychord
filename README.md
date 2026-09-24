# OpenChords

> **OpenChords** é uma aplicação web desktop-first para violão, guitarra e baixo inspirada no clássico "Billion Chords", com geração de acordes 100% client-side via algoritmo combinatório puro, sem depender de banco de dados estático.

---

## 🚀 Principais Funcionalidades

- **Motor Combinatório Puro (Branch & Bound):** Mapeamento e cálculo dinâmico de qualquer afinação (Standard EADGBE, Drop D, DADGAD, Open Tunings, Baixo 4 cordas e afinações personalizadas corda a corda).
- **Heurística Biomecânica de Digitação:** Atribuição ergonômica inteligente de dedos (1-4 e polegar T), detecção de pestana sólida única com o dedo 1, descarte de aberturas anatômicas impossíveis e cálculo de pontuação de dificuldade (*difficulty score*).
- **Diagramas Vetoriais SVG em Tempo Real:** Visualização nítida com espessuras de cordas realistas, marcadores de corda solta (O) e abafada (X), pestana sólida conectada, indicação de casa base e suporte nativo ao **Modo Canhoto** (*Left-handed*).
- **Síntese Acústica e Strumming com Tone.js:** Clique em qualquer diagrama para disparar um dedilhado arpejado dinâmico com variação orgânica de *velocity* e animação visual de vibração na corda ativa, além de audição de notas isoladas.
- **Console Inferior Completo:**
  - Nomes enarmônicos e acordes equivalentes.
  - Formação em tablatura compacta (ex: `X32010`, `X35543`).
  - Sliders verticais de afinação por corda e presets rápidos.
  - Filtros ergonômicos: Distância de casas (span 3-5), traste máximo (até 24ª casa), *Omit 5th*, *Omit 3rd*, *No barre chords*, *Easy chords* e *Permitir inversões (slash chords)*.

---

## 🛠️ Stack Tecnológica

- **Framework:** React 19 + TypeScript + Vite
- **Estilização:** Tailwind CSS v4 + JetBrains Mono
- **Gerenciamento de Estado:** Zustand com Cache LRU
- **Teoria Musical:** `@tonaljs/tonal`
- **Áudio Web:** `Tone.js` (PolySynth acústico com envelope percussivo)
- **Testes (TDD):** Vitest + Testing Library + jsdom

---

## 📦 Scripts Disponíveis

```bash
# Iniciar o servidor de desenvolvimento
npm run dev

# Executar a suíte completa de testes (TDD)
npm run test:run

# Executar os testes em modo watch
npm run test

# Gerar o bundle de produção
npm run build
```
