'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { toast } from '@/components/ui/toast';
import { criarCliente } from '../actions';

export function NovoClienteSheet() {
  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [origem, setOrigem] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.erro('Informe o nome do cliente.');
      return;
    }

    try {
      setSalvando(true);
      await criarCliente({
        nome: nome.trim(),
        empresa: empresa.trim() || null,
        email: email.trim() || null,
        telefone: telefone.trim() || null,
        origem: origem.trim() || null,
        observacoes: observacoes.trim() || null,
        arquivado: false,
      });
      toast.sucesso('Cliente cadastrado com sucesso!');
      setAberto(false);
      setNome('');
      setEmpresa('');
      setEmail('');
      setTelefone('');
      setOrigem('');
      setObservacoes('');
    } catch {
      toast.erro('Não foi possível cadastrar o cliente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>
        <Button className="flex items-center gap-1.5 shadow-xs">
          <Plus className="size-4" />
          Novo Cliente
        </Button>
      </SheetTrigger>
      <SheetContent
        titulo="Novo Cliente"
        descricao="Cadastre uma pessoa ou empresa para vincular projetos e recebimentos"
      >
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Nome do Cliente *
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Lucas Mendes, Mariana Castro"
              className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
              autoFocus
            />
          </div>

          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Empresa / Marca (Opcional)
            </label>
            <input
              type="text"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              placeholder="Ex.: Nexus Tech, Agência Horizonte"
              className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@cliente.com"
                className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="text-caption1 font-medium text-secondary block mb-1.5">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Origem do Contato
            </label>
            <input
              type="text"
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
              placeholder="Ex.: Indicação, LinkedIn, Instagram, Upwork"
              className="w-full rounded-xl bg-card border border-border px-3 py-2 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="text-caption1 font-medium text-secondary block mb-1.5">
              Observações
            </label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Detalhes de pagamento, preferências, etc."
              className="w-full rounded-xl bg-card border border-border p-2.5 text-subhead text-label focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <Button type="submit" disabled={salvando} className="w-full mt-3">
            {salvando ? 'Salvando...' : 'Cadastrar Cliente'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
