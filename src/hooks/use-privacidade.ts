'use client';

import { useSyncExternalStore } from 'react';

const CHAVE_STORAGE = 'controle_privacidade';

export function aplicarPrivacidade(ativo: boolean) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (ativo) {
    root.setAttribute('data-privacidade', 'on');
  } else {
    root.removeAttribute('data-privacidade');
  }
}

function getSnapshot(): boolean {
  return localStorage.getItem(CHAVE_STORAGE) === 'true';
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('controle_privacidade_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('controle_privacidade_change', callback);
  };
}

export function usePrivacidade() {
  const privacidadeAtiva = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const togglePrivacidade = () => {
    const proximo = !getSnapshot();
    localStorage.setItem(CHAVE_STORAGE, String(proximo));
    aplicarPrivacidade(proximo);
    window.dispatchEvent(new Event('controle_privacidade_change'));
  };

  return { privacidadeAtiva, togglePrivacidade };
}
