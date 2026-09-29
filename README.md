# OpenChords

> Todas as formas de tocar um acorde no violão, na guitarra ou no baixo, em qualquer afinação. Veja os diagramas, ouça cada posição e escolha a mais confortável para a sua mão.

**Acesse:** https://israelfsilva.github.io/openchords/

Inspirado no clássico "Billion Chords".

---

## 🎸 O que dá pra fazer

- **Achar qualquer acorde:** escolha a fundamental e o sufixo (maior, menor, dominante, sus…) ou digite direto na busca (`F#m7`, `Bb9`, `Cadd9`). Atalho: ⌘K / Ctrl+K.
- **Ver todas as posições:** cada forma aparece como diagrama, com dedilhado sugerido, pestana, cordas soltas e abafadas, tablatura (`X32010`) e uma indicação de dificuldade (Fácil, Média, Difícil).
- **Ouvir antes de tocar:** clique num diagrama para ouvir o acorde dedilhado, ou numa bolinha para ouvir só aquela nota.
- **Enxergar o braço inteiro:** o braço mostra a posição escolhida e onde estão todas as notas do acorde até a casa que você definir.
- **Tocar na sua afinação:** Standard, Drop D, DADGAD, Open G, Open D, baixo de 4 cordas ou uma afinação sua, corda por corda.
- **Filtrar pelo que cabe na mão:** distância máxima entre casas, até qual casa procurar, sem pestana, só acordes fáceis, omitir 3ª ou 5ª e permitir inversões.
- **Modo canhoto** e **tema claro/escuro**.

## ⚙️ Como funciona

Os acordes não vêm de uma tabela pronta: o app calcula no próprio navegador todas as combinações de casas que formam o acorde na afinação escolhida. Depois descarta as que a mão não alcança, sugere quais dedos usar e ordena as posições da mais fácil para a mais difícil. Por isso funciona com qualquer afinação, sem servidor.

---

## 🛠️ Stack Tecnológica

- **Framework:** React 19 + TypeScript + Vite
- **Estilização:** Tailwind CSS v4 + Inter + JetBrains Mono
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
