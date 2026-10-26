type ClassValue = string | number | false | null | undefined | ClassValue[];

/** Junta classes condicionais. Os componentes evitam conflitos por construção. */
export function cn(...valores: ClassValue[]): string {
  const saida: string[] = [];
  for (const v of valores) {
    if (!v) continue;
    if (Array.isArray(v)) {
      const interno = cn(...v);
      if (interno) saida.push(interno);
    } else {
      saida.push(String(v));
    }
  }
  return saida.join(' ');
}
