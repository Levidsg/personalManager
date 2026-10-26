'use client';

import { useSyncExternalStore } from 'react';

export type Aparencia = 'sistema' | 'claro' | 'escuro';

const CHAVE_STORAGE = 'controle_aparencia';
const CHAVE_COOKIE = 'controle_aparencia';

export function aplicarAparencia(aparencia: Aparencia) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (aparencia === 'sistema') {
    root.removeAttribute('data-aparencia');
  } else {
    root.setAttribute('data-aparencia', aparencia);
  }
}

function getSnapshot(): Aparencia {
  const salva = localStorage.getItem(CHAVE_STORAGE) as Aparencia | null;
  if (salva === 'sistema' || salva === 'claro' || salva === 'escuro') {
    return salva;
  }
  return 'sistema';
}

function getServerSnapshot(): Aparencia {
  return 'sistema';
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('controle_aparencia_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('controle_aparencia_change', callback);
  };
}

export function useAparencia() {
  const aparencia = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setAparencia = (novaAparencia: Aparencia) => {
    localStorage.setItem(CHAVE_STORAGE, novaAparencia);
    document.cookie = `${CHAVE_COOKIE}=${novaAparencia}; path=/; max-age=31536000; SameSite=Lax`;
    aplicarAparencia(novaAparencia);
    window.dispatchEvent(new Event('controle_aparencia_change'));
  };

  return { aparencia, setAparencia };
}
