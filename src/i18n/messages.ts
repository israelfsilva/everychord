export type Locale = 'pt' | 'en' | 'es';

type ToggleText = { label: string; title: string };

export interface Messages {
  meta: { htmlLang: string; title: string; languageName: string };
  header: {
    openChordSelection: string;
    openSearch: string;
    closeSearch: string;
    searchPlaceholder: string;
    go: string;
    leftHandedTitle: string;
    leftHandedLabel: string;
    themeToLight: string;
    themeToDark: string;
    toggleTheme: string;
    strumTitle: string;
    strumLabel: string;
    strum: string;
    language: string;
  };
  selector: {
    chord: string;
    positions: (n: number) => string;
    root: string;
    suffix: string;
    family: string;
    variation: string;
    /** Short label + tooltip per MODIFIER_GROUPS entry, same order */
    families: { short: string; full: string }[];
    voicing: string;
    bass: string;
    rootInBass: string;
    inversion: string;
    enharmonic: string;
    noEquivalent: string;
    noVoicing: string;
  };
  grid: {
    diagrams: string;
    emptyTitle: string;
    emptyHint: string;
    restoreDefaults: string;
  };
  filters: {
    span: string;
    spanValue: (n: number) => string;
    upToFret: string;
    upToFretValue: (n: number) => string;
    toggles: Record<'noBarre' | 'easyOnly' | 'omit5' | 'omit3' | 'allowInversions', ToggleText>;
    resetTitle: string;
    resetLabel: string;
  };
  difficulty: {
    easy: string;
    medium: string;
    hard: string;
    scoreTitle: (score: number) => string;
  };
  neck: {
    title: string;
    hintClickDiagram: string;
    hintStrum: string;
    hintClickDot: string;
    hintListen: string;
    legendVoicing: string;
    legendChordTones: string;
    tuning: string;
    tuningPreset: string;
    custom: string;
    /** Overrides for TUNING_PRESETS names that aren't language-neutral */
    tuningNames: Partial<Record<string, string>>;
    stringTuning: (n: number) => string;
    stringTitle: (n: number) => string;
    playNote: (note: string) => string;
    playVoicingNote: (note: string) => string;
  };
  diagram: {
    label: (root: string, tab: string) => string;
    tab: (tab: string) => string;
  };
}

const pt: Messages = {
  meta: {
    htmlLang: 'pt-BR',
    title: 'OpenChords • Acordes para violão, guitarra e baixo',
    languageName: 'Português',
  },
  header: {
    openChordSelection: 'Abrir seleção de acorde',
    openSearch: 'Abrir busca',
    closeSearch: 'Fechar busca',
    searchPlaceholder: 'Busca rápida (ex: F#m7, Bb9)',
    go: 'Ir',
    leftHandedTitle: 'Modo canhoto (inverte a ordem das cordas no diagrama)',
    leftHandedLabel: 'Modo Canhoto',
    themeToLight: 'Mudar para tema claro',
    themeToDark: 'Mudar para tema escuro',
    toggleTheme: 'Alternar tema',
    strumTitle: 'Dedilhar acorde selecionado (strumming)',
    strumLabel: 'Dedilhar Acorde',
    strum: 'Dedilhar',
    language: 'Idioma',
  },
  selector: {
    chord: 'Acorde',
    positions: (n) => (n === 1 ? 'posição' : 'posições'),
    root: 'Fundamental',
    suffix: 'Sufixo',
    family: 'Família',
    variation: 'Variação',
    families: [
      { short: 'Maior', full: 'Maior' },
      { short: 'Menor', full: 'Menor' },
      { short: 'Dom', full: 'Dominante' },
      { short: 'Sus', full: 'Sus / Dim / Aum' },
    ],
    voicing: 'Voicing',
    bass: 'Baixo',
    rootInBass: 'Fundamental',
    inversion: 'Inversão',
    enharmonic: 'Enarm.',
    noEquivalent: 'Nenhum equivalente direto',
    noVoicing: 'Nenhum voicing selecionado',
  },
  grid: {
    diagrams: 'Diagramas',
    emptyTitle: 'Nenhuma posição encontrada com os filtros atuais',
    emptyHint: 'Tente aumentar a distância de casas (fret span) ou permitir pestanas.',
    restoreDefaults: 'Restaurar Filtros Padrão',
  },
  filters: {
    span: 'Distância',
    spanValue: (n) => `${n} casas`,
    upToFret: 'Até a casa',
    upToFretValue: (n) => `${n}ª`,
    toggles: {
      noBarre: { label: 'Sem pestanas', title: 'Sem Pestanas' },
      easyOnly: { label: 'Fáceis', title: 'Só acordes fáceis' },
      omit5: { label: 'Omit 5ª', title: 'Omitir 5ª (Omit 5th)' },
      omit3: { label: 'Omit 3ª', title: 'Omitir 3ª (Omit 3rd)' },
      allowInversions: { label: 'Inversões', title: 'Permitir Inversões (Slash Chords)' },
    },
    resetTitle: 'Padrão (resetar filtros)',
    resetLabel: 'Resetar filtros',
  },
  difficulty: {
    easy: 'Fácil',
    medium: 'Média',
    hard: 'Difícil',
    scoreTitle: (score) => `Score de dificuldade: ${score}`,
  },
  neck: {
    title: 'Braço',
    hintClickDiagram: 'Clique no diagrama para',
    hintStrum: 'dedilhar',
    hintClickDot: 'clique na bolinha para',
    hintListen: 'ouvir a nota',
    legendVoicing: 'voicing',
    legendChordTones: 'notas do acorde',
    tuning: 'Afinação',
    tuningPreset: 'Preset de afinação',
    custom: 'Customizada',
    tuningNames: { bass4: 'Baixo 4 cordas (E-A-D-G)' },
    stringTuning: (n) => `Afinação da ${n}ª corda`,
    stringTitle: (n) => `${n}ª corda`,
    playNote: (note) => `Tocar ${note}`,
    playVoicingNote: (note) => `Tocar ${note} (voicing)`,
  },
  diagram: {
    label: (root, tab) => `Diagrama de acorde ${root} tablatura ${tab}`,
    tab: (tab) => `Tablatura ${tab}`,
  },
};

const en: Messages = {
  meta: {
    htmlLang: 'en',
    title: 'OpenChords • Guitar and bass chords in any tuning',
    languageName: 'English',
  },
  header: {
    openChordSelection: 'Open chord picker',
    openSearch: 'Open search',
    closeSearch: 'Close search',
    searchPlaceholder: 'Quick search (e.g. F#m7, Bb9)',
    go: 'Go',
    leftHandedTitle: 'Left-handed mode (flips the string order in diagrams)',
    leftHandedLabel: 'Left-handed mode',
    themeToLight: 'Switch to light theme',
    themeToDark: 'Switch to dark theme',
    toggleTheme: 'Toggle theme',
    strumTitle: 'Strum the selected chord',
    strumLabel: 'Strum chord',
    strum: 'Strum',
    language: 'Language',
  },
  selector: {
    chord: 'Chord',
    positions: (n) => (n === 1 ? 'voicing' : 'voicings'),
    root: 'Root',
    suffix: 'Suffix',
    family: 'Family',
    variation: 'Variation',
    families: [
      { short: 'Major', full: 'Major' },
      { short: 'Minor', full: 'Minor' },
      { short: 'Dom', full: 'Dominant' },
      { short: 'Sus', full: 'Sus / Dim / Aug' },
    ],
    voicing: 'Voicing',
    bass: 'Bass',
    rootInBass: 'Root',
    inversion: 'Inversion',
    enharmonic: 'Enh.',
    noEquivalent: 'No direct equivalent',
    noVoicing: 'No voicing selected',
  },
  grid: {
    diagrams: 'Diagrams',
    emptyTitle: 'No voicings match the current filters',
    emptyHint: 'Try increasing the fret span or allowing barre chords.',
    restoreDefaults: 'Restore default filters',
  },
  filters: {
    span: 'Span',
    spanValue: (n) => `${n} frets`,
    upToFret: 'Up to fret',
    upToFretValue: (n) => `${n}`,
    toggles: {
      noBarre: { label: 'No barre', title: 'No barre chords' },
      easyOnly: { label: 'Easy', title: 'Easy chords only' },
      omit5: { label: 'Omit 5th', title: 'Omit the 5th' },
      omit3: { label: 'Omit 3rd', title: 'Omit the 3rd' },
      allowInversions: { label: 'Inversions', title: 'Allow inversions (slash chords)' },
    },
    resetTitle: 'Default (reset filters)',
    resetLabel: 'Reset filters',
  },
  difficulty: {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    scoreTitle: (score) => `Difficulty score: ${score}`,
  },
  neck: {
    title: 'Neck',
    hintClickDiagram: 'Click a diagram to',
    hintStrum: 'strum it',
    hintClickDot: 'click a dot to',
    hintListen: 'hear the note',
    legendVoicing: 'voicing',
    legendChordTones: 'chord tones',
    tuning: 'Tuning',
    tuningPreset: 'Tuning preset',
    custom: 'Custom',
    tuningNames: { bass4: '4-string bass (E-A-D-G)' },
    stringTuning: (n) => `Tuning of string ${n}`,
    stringTitle: (n) => `String ${n}`,
    playNote: (note) => `Play ${note}`,
    playVoicingNote: (note) => `Play ${note} (voicing)`,
  },
  diagram: {
    label: (root, tab) => `${root} chord diagram, tab ${tab}`,
    tab: (tab) => `Tab ${tab}`,
  },
};

const es: Messages = {
  meta: {
    htmlLang: 'es',
    title: 'OpenChords • Acordes para guitarra y bajo',
    languageName: 'Español',
  },
  header: {
    openChordSelection: 'Abrir selector de acordes',
    openSearch: 'Abrir búsqueda',
    closeSearch: 'Cerrar búsqueda',
    searchPlaceholder: 'Búsqueda rápida (ej: F#m7, Bb9)',
    go: 'Ir',
    leftHandedTitle: 'Modo zurdo (invierte el orden de las cuerdas en el diagrama)',
    leftHandedLabel: 'Modo zurdo',
    themeToLight: 'Cambiar a tema claro',
    themeToDark: 'Cambiar a tema oscuro',
    toggleTheme: 'Cambiar tema',
    strumTitle: 'Rasguear el acorde seleccionado',
    strumLabel: 'Rasguear acorde',
    strum: 'Rasguear',
    language: 'Idioma',
  },
  selector: {
    chord: 'Acorde',
    positions: (n) => (n === 1 ? 'posición' : 'posiciones'),
    root: 'Tónica',
    suffix: 'Sufijo',
    family: 'Familia',
    variation: 'Variación',
    families: [
      { short: 'Mayor', full: 'Mayor' },
      { short: 'Menor', full: 'Menor' },
      { short: 'Dom', full: 'Dominante' },
      { short: 'Sus', full: 'Sus / Dis / Aum' },
    ],
    voicing: 'Voicing',
    bass: 'Bajo',
    rootInBass: 'Tónica',
    inversion: 'Inversión',
    enharmonic: 'Enarm.',
    noEquivalent: 'Sin equivalente directo',
    noVoicing: 'Ningún voicing seleccionado',
  },
  grid: {
    diagrams: 'Diagramas',
    emptyTitle: 'Ninguna posición coincide con los filtros actuales',
    emptyHint: 'Prueba a aumentar la distancia de trastes o a permitir cejillas.',
    restoreDefaults: 'Restaurar filtros por defecto',
  },
  filters: {
    span: 'Distancia',
    spanValue: (n) => `${n} trastes`,
    upToFret: 'Hasta el traste',
    upToFretValue: (n) => `${n}`,
    toggles: {
      noBarre: { label: 'Sin cejilla', title: 'Sin acordes con cejilla' },
      easyOnly: { label: 'Fáciles', title: 'Solo acordes fáciles' },
      omit5: { label: 'Sin 5ª', title: 'Omitir la 5ª' },
      omit3: { label: 'Sin 3ª', title: 'Omitir la 3ª' },
      allowInversions: { label: 'Inversiones', title: 'Permitir inversiones (acordes con barra)' },
    },
    resetTitle: 'Por defecto (restablecer filtros)',
    resetLabel: 'Restablecer filtros',
  },
  difficulty: {
    easy: 'Fácil',
    medium: 'Media',
    hard: 'Difícil',
    scoreTitle: (score) => `Puntuación de dificultad: ${score}`,
  },
  neck: {
    title: 'Mástil',
    hintClickDiagram: 'Haz clic en un diagrama para',
    hintStrum: 'rasguearlo',
    hintClickDot: 'haz clic en un punto para',
    hintListen: 'oír la nota',
    legendVoicing: 'voicing',
    legendChordTones: 'notas del acorde',
    tuning: 'Afinación',
    tuningPreset: 'Preset de afinación',
    custom: 'Personalizada',
    tuningNames: { bass4: 'Bajo de 4 cuerdas (E-A-D-G)' },
    stringTuning: (n) => `Afinación de la ${n}.ª cuerda`,
    stringTitle: (n) => `${n}.ª cuerda`,
    playNote: (note) => `Tocar ${note}`,
    playVoicingNote: (note) => `Tocar ${note} (voicing)`,
  },
  diagram: {
    label: (root, tab) => `Diagrama del acorde ${root}, tablatura ${tab}`,
    tab: (tab) => `Tablatura ${tab}`,
  },
};

export const MESSAGES: Record<Locale, Messages> = { pt, en, es };
export const LOCALES: Locale[] = ['pt', 'en', 'es'];
