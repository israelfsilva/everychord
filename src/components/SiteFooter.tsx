import React from 'react';
import { useT } from '@/i18n';
import { LogoMark } from './LogoMark';

const REPO_URL = 'https://github.com/israelfsilva/everychord';
const AUTHOR_URL = 'https://israelfsilva.com';

const linkClass = 'text-muted underline-offset-2 transition-colors duration-120 hover:text-text hover:underline';

/** Slim credits bar under the neck: author on the left, source and license on the right. */
export const SiteFooter: React.FC = () => {
  const t = useT();
  return (
    <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line bg-surface px-(--pad) py-1.5 text-[11px] text-faint">
      <p>
        {t.footer.madeWith}{' '}
        <span role="img" aria-label={t.footer.music} className="inline-block align-[-2px] text-accent">
          <LogoMark className="h-3 w-3" />
        </span>{' '}
        {t.footer.by}{' '}
        <a href={AUTHOR_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
          Israel Silva
        </a>
      </p>
      <p className="flex items-center gap-2">
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {t.footer.sourceCode}
        </a>
        <span aria-hidden>·</span>
        <a href={`${REPO_URL}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {t.footer.license}
        </a>
      </p>
    </footer>
  );
};
