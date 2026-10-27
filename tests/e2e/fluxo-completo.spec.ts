import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Controle - Fluxo Completo Ponta a Ponta (§10.4)', () => {
  test('Navegação inicial e verificação de acessibilidade no Resumo', async ({ page }) => {
    await page.goto('/');

    // Confere que a casca inicial e o título carregaram
    await expect(page).toHaveTitle(/Controle/);
    await expect(page.getByText('Fluxo do Mês')).toBeVisible();

    // Auditoria de Acessibilidade (§10.4, WCAG 2.1 AA)
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast']) // cores personalizáveis por usuário em gráficos
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Alternância entre visão Tudo e Freela sincronizada', async ({ page }) => {
    await page.goto('/');

    // Alterna para visão Freela
    await page.getByRole('button', { name: 'Freela' }).click();
    await expect(page).toHaveURL(/visao=freela/);
    await expect(page.getByText('Recebido (Caixa)')).toBeVisible();

    // Alterna de volta para Tudo
    await page.getByRole('button', { name: 'Tudo' }).click();
    await expect(page).toHaveURL(/visao=tudo/);
    await expect(page.getByText('Ganhos Totais')).toBeVisible();
  });

  test('Módulo de Categorias e Criação', async ({ page }) => {
    await page.goto('/categorias');
    await expect(page.getByText('Categorias')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Nova Categoria' })).toBeVisible();
  });

  test('Módulo de Clientes e Concentração', async ({ page }) => {
    await page.goto('/clientes');
    await expect(page.getByText('Clientes')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Novo Cliente' })).toBeVisible();
  });

  test('Módulo de Projetos e Kanban', async ({ page }) => {
    await page.goto('/projetos');
    await expect(page.getByText('Projetos & Pipeline')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Novo Projeto' })).toBeVisible();
    await expect(page.getByText('Lead')).toBeVisible();
    await expect(page.getByText('Em Andamento')).toBeVisible();
  });

  test('Módulo de Recebimentos e Abas', async ({ page }) => {
    await page.goto('/recebimentos');
    await expect(page.getByText('Controle de Recebimentos')).toBeVisible();
    await expect(page.getByText(/A Receber/)).toBeVisible();
    await expect(page.getByText(/Atrasados/)).toBeVisible();
    await expect(page.getByText(/Recebidos/)).toBeVisible();
  });

  test('Módulo de Estúdio Freela (Hub) e Timer', async ({ page }) => {
    await page.goto('/freela');
    await expect(page.getByText('Estúdio Freelancer')).toBeVisible();
    await expect(page.getByText(/Timer de Produção/)).toBeVisible();
    await expect(page.getByText(/Meta de Faturamento/)).toBeVisible();
  });
});
