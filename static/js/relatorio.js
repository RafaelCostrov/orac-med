// ../js/relatorio.js
document.addEventListener('DOMContentLoaded', () => {
  /* ================== MOCK ================== */
  const dados = [
    { id: 1, data: '2025-08-01', empresa: 'Oraculus', colaborador: 'Ana Souza', tipoAt: 'Cliente', tipoEx: 'Admissional', exames: 'Clínico, Audiometria', valor: 230, status: 'Pago' },
    { id: 2, data: '2025-08-02', empresa: 'Controller', colaborador: 'Bruno Lima', tipoAt: 'Cliente', tipoEx: 'Periódico', exames: 'Clínico', valor: 150, status: 'Pendente' },
    { id: 3, data: '2025-08-03', empresa: 'Azul Serviços', colaborador: 'Carla Nunes', tipoAt: 'Particular', tipoEx: 'Outros', exames: 'Teste Ishira', valor: 40, status: 'Pago' },
    { id: 4, data: '2025-08-03', empresa: 'Orac', colaborador: 'Diego Alves', tipoAt: 'Credenciado', tipoEx: 'Demissional', exames: 'Clínico, ECG', valor: 300, status: 'Pago' },
    { id: 5, data: '2025-08-05', empresa: 'Oraculus', colaborador: 'Elaine Prado', tipoAt: 'Cliente', tipoEx: 'Mudança de Função', exames: 'Clínico, Espirometria', valor: 270, status: 'Pendente' },
    { id: 6, data: '2025-08-05', empresa: 'Controller', colaborador: 'Fabio Teixeira', tipoAt: 'Serviço Prestado', tipoEx: 'Periódico', exames: 'Clínico, Audiometria', valor: 230, status: 'Pago' },
    { id: 7, data: '2025-08-06', empresa: 'Azul Serviços', colaborador: 'Giovana Melo', tipoAt: 'Cliente', tipoEx: 'Retorno ao Trabalho', exames: 'Clínico', valor: 150, status: 'Pago' },
    { id: 8, data: '2025-08-06', empresa: 'Orac', colaborador: 'Hugo Teles', tipoAt: 'Cliente', tipoEx: 'Admissional', exames: 'Clínico, Espirometria', valor: 270, status: 'Pendente' },
    { id: 9, data: '2025-08-07', empresa: 'Oraculus', colaborador: 'Iris Santos', tipoAt: 'Cliente', tipoEx: 'Periódico', exames: 'Clínico, Audiometria', valor: 230, status: 'Pago' },
    { id: 10, data: '2025-08-07', empresa: 'Controller', colaborador: 'João Pedro', tipoAt: 'Cliente', tipoEx: 'Demissional', exames: 'Clínico', valor: 150, status: 'Pago' },
    { id: 11, data: '2025-08-08', empresa: 'Azul Serviços', colaborador: 'Katia Moraes', tipoAt: 'Particular', tipoEx: 'Outros', exames: 'Aval. Psicossocial', valor: 200, status: 'Pendente' },
    { id: 12, data: '2025-08-08', empresa: 'Orac', colaborador: 'Lucas Faria', tipoAt: 'Cliente', tipoEx: 'Periódico', exames: 'Clínico, ECG', valor: 300, status: 'Pago' },
    { id: 13, data: '2025-08-09', empresa: 'Oraculus', colaborador: 'Marta Dias', tipoAt: 'Cliente', tipoEx: 'Retorno ao Trabalho', exames: 'Clínico', valor: 150, status: 'Pendente' },
    { id: 14, data: '2025-08-09', empresa: 'Controller', colaborador: 'Nina Prado', tipoAt: 'Serviço Prestado', tipoEx: 'Admissional', exames: 'Clínico', valor: 150, status: 'Pago' },
    { id: 15, data: '2025-08-10', empresa: 'Azul Serviços', colaborador: 'Otávio Leal', tipoAt: 'Cliente', tipoEx: 'Periódico', exames: 'Clínico, Espirometria', valor: 270, status: 'Pago' },
    { id: 16, data: '2025-08-11', empresa: 'Orac', colaborador: 'Paula Reis', tipoAt: 'Credenciado', tipoEx: 'Mudança de Função', exames: 'Clínico, Audiometria', valor: 230, status: 'Pendente' },
    { id: 17, data: '2025-08-12', empresa: 'Oraculus', colaborador: 'Rafael Costa', tipoAt: 'Cliente', tipoEx: 'Demissional', exames: 'Clínico, ECG', valor: 300, status: 'Pago' },
    { id: 18, data: '2025-08-13', empresa: 'Controller', colaborador: 'Sofia Brito', tipoAt: 'Cliente', tipoEx: 'Retorno ao Trabalho', exames: 'Clínico', valor: 150, status: 'Pago' },
    { id: 19, data: '2025-08-13', empresa: 'Azul Serviços', colaborador: 'Tiago Melo', tipoAt: 'Cliente', tipoEx: 'Periódico', exames: 'Clínico, Audiometria', valor: 230, status: 'Pendente' },
    { id: 20, data: '2025-08-14', empresa: 'Orac', colaborador: 'Vivian Rocha', tipoAt: 'Particular', tipoEx: 'Outros', exames: 'Teste ROMBERG', valor: 70, status: 'Pago' },
  ];

  /* ================== UTILS ================== */
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  const toDate = (s) => (s ? new Date(s + 'T00:00:00') : null);
  const fmtBRL = (n) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
  const today = () => new Date().toISOString().slice(0, 10);

  // Modais (HTML com .modal / .modal__backdrop / .modal__dialog)
  function openModal(id) {
    const m = $('#' + id); if (!m) return;
    m.setAttribute('aria-hidden', 'false');
    // foco no primeiro input do modal, se existir
    const firstInput = m.querySelector('input, select, button');
    if (firstInput) setTimeout(() => firstInput.focus(), 50);
  }
  function closeModal(id) {
    const m = $('#' + id); if (!m) return;
    m.setAttribute('aria-hidden', 'true');
  }

  // download helper
  function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /* ================== ELEMENTOS ================== */
  const tBody = $('#tbl tbody');
  const ths = $$('#tbl thead th[data-sort]');
  const ippEl = $('#ipp');
  const prev = $('#prev');
  const next = $('#next');
  const pinfo = $('#pinfo');
  const count = $('#count');
  const total = $('#total');

  // Toolbar
  const btnFiltro = $('#btnFiltro');
  const btnExportar = $('#btnExportar');
  const btnImprimir = $('#btnImprimir');

  // Modais
  const modalFiltros = $('#modalFiltros');
  const modalExportar = $('#modalExportar');

  // Controles dos modais
  const filtrosAplicar = $('#filtrosAplicar');
  const filtrosLimpar = $('#filtrosLimpar');
  const exportCsvBtn = $('#exportCsv');
  const exportTxtBtn = $('#exportTxt');

  // Campos de filtro
  const campos = {
    ini: $('#ini'),
    fim: $('#fim'),
    emp: $('#emp'),
    tipoAt: $('#tipoAt'),
    tipoEx: $('#tipoEx'),
    status: $('#status'),
    q: $('#q')
  };

  /* ================== STATE ================== */
  let filtered = [...dados];
  let sort = { key: 'data', dir: 'desc' };
  let page = 1;

  /* ================== PREP ================== */
  // Empresas no select
  (function fillEmpresas() {
    const set = new Set(dados.map(d => d.empresa));
    [...set].sort().forEach(e => {
      const op = document.createElement('option');
      op.value = e; op.textContent = e;
      campos.emp.appendChild(op);
    });
  })();

  // Fechar modal no backdrop / botões X
  $$('.modal').forEach(m => {
    // backdrop
    const backdrop = $('.modal__backdrop', m);
    if (backdrop) {
      backdrop.addEventListener('click', () => m.setAttribute('aria-hidden', 'true'));
    }
    // botões de fechar
    $$('.modal__close', m).forEach(btn => {
      btn.addEventListener('click', () => m.setAttribute('aria-hidden', 'true'));
    });
  });

  // Fechar modal com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      $$('.modal[aria-hidden="false"]').forEach(m => m.setAttribute('aria-hidden', 'true'));
    }
  });

  /* ================== CORE ================== */
  function applyFilters() {
    const ini = toDate(campos.ini.value);
    const fim = toDate(campos.fim.value);
    const emp = (campos.emp.value || '').toLowerCase();
    const tipoAt = (campos.tipoAt.value || '').toLowerCase();
    const tipoEx = (campos.tipoEx.value || '').toLowerCase();
    const status = (campos.status.value || '').toLowerCase();
    const q = (campos.q.value || '').toLowerCase();

    filtered = dados.filter(d => {
      const dData = toDate(d.data);
      if (ini && dData < ini) return false;
      if (fim && dData > fim) return false;
      if (emp && d.empresa.toLowerCase() !== emp) return false;
      if (tipoAt && d.tipoAt.toLowerCase() !== tipoAt) return false;
      if (tipoEx && d.tipoEx.toLowerCase() !== tipoEx) return false;
      if (status && d.status.toLowerCase() !== status) return false;
      if (q) {
        const blob = `${d.empresa} ${d.colaborador} ${d.tipoAt} ${d.tipoEx} ${d.exames}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });

    page = 1;
    render();
  }

  function pill(status) {
    const s = (status || '').toLowerCase();
    if (s === 'pago') return `<span class="pill pago">Pago</span>`;
    if (s === 'pendente') return `<span class="pill pendente">Pendente</span>`;
    return status || '';
  }

  function render() {
    // ordenação
    filtered.sort((a, b) => {
      const k = sort.key;
      let va = a[k], vb = b[k];
      if (k === 'data') { va = a.data; vb = b.data; }
      if (k === 'valor') { va = +a.valor; vb = +b.valor; }
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sort.dir === 'asc' ? -1 : 1;
      if (va > vb) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });

    // paginação
    const ipp = parseInt(ippEl.value, 10) || 10;
    const totalPages = Math.max(1, Math.ceil(filtered.length / ipp));
    if (page > totalPages) page = totalPages;
    const start = (page - 1) * ipp;
    const rows = filtered.slice(start, start + ipp);

    // linhas
    tBody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.data.split('-').reverse().join('/')}</td>
        <td>${r.empresa}</td>
        <td>${r.colaborador}</td>
        <td>${r.tipoAt}</td>
        <td>${r.tipoEx}</td>
        <td>${r.exames}</td>
        <td class="num">${fmtBRL(r.valor)}</td>
        <td>${pill(r.status)}</td>
      </tr>
    `).join('');

    // info / resumo
    pinfo.textContent = `Página ${page} de ${totalPages}`;
    prev.disabled = page === 1;
    next.disabled = page === totalPages;

    count.textContent = String(filtered.length);
    const soma = filtered.reduce((acc, r) => acc + (r.valor || 0), 0);
    total.textContent = fmtBRL(soma);
  }

  /* ================== EVENTS ================== */
  // Ordenação
  // ths.forEach(th => {
  //   th.addEventListener('click', () => {
  //     const key = th.dataset.sort;
  //     if (sort.key === key) {
  //       sort.dir = sort.dir === 'asc' ? 'desc' : 'asc';
  //     } else {
  //       sort.key = key;
  //       sort.dir = key === 'valor' ? 'desc' : 'asc';
  //     }
  //     render();
  //   });
  // });

  // // Paginação
  // prev.addEventListener('click', () => { page = Math.max(1, page - 1); render(); });
  // next.addEventListener('click', () => { page += 1; render(); });
  // ippEl.addEventListener('change', () => { page = 1; render(); });

  // Toolbar
  btnFiltro.addEventListener('click', () => openModal('modalFiltros'));
  btnExportar.addEventListener('click', () => openModal('modalExportar'));
  btnImprimir.addEventListener('click', () => window.print());

  // Filtros (modal)
  // filtrosAplicar.addEventListener('click', () => { applyFilters(); closeModal('modalFiltros'); });
  filtrosLimpar.addEventListener('click', () => {
    Object.values(campos).forEach(i => { if (i && 'value' in i) i.value = ''; });
  });
  // campos.q.addEventListener('input', () => { page = 1; applyFilters(); });

  // Exportar (modal)
  exportCsvBtn.addEventListener('click', () => {
    const header = ['Data', 'Empresa', 'Colaborador', 'Tipo Atendimento', 'Tipo Exame', 'Exames', 'Valor', 'Status'];
    const lines = filtered.map(r => [
      r.data.split('-').reverse().join('/'),
      r.empresa, r.colaborador, r.tipoAt, r.tipoEx, r.exames,
      r.valor, // número cru
      r.status
    ]);
    const csv = [header, ...lines]
      .map(arr => arr.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';'))
      .join('\n');
    downloadFile(csv, `relatorio_${today()}.csv`, 'text/csv;charset=utf-8;');
    closeModal('modalExportar');
  });

  exportTxtBtn.addEventListener('click', () => {
    const header = 'Data;Empresa;Colaborador;Tipo Atendimento;Tipo Exame;Exames;Valor;Status';
    const lines = filtered.map(r => [
      r.data.split('-').reverse().join('/'),
      r.empresa, r.colaborador, r.tipoAt, r.tipoEx, r.exames,
      r.valor,
      r.status
    ].join(';'));
    const txt = [header, ...lines].join('\n');
    downloadFile(txt, `relatorio_${today()}.txt`, 'text/plain;charset=utf-8;');
    closeModal('modalExportar');
  });

  /* ================== START ================== */
  applyFilters(); // primeira renderização
});

/* ===== Dropdown do perfil (Minha conta / Sair) ===== */
(() => {
  const btn = document.getElementById('avatarBtn');
  const menu = document.getElementById('profileMenu');
  if (!btn || !menu) return;

  const open = () => { menu.classList.add('open'); menu.setAttribute('aria-hidden', 'false'); btn.setAttribute('aria-expanded', 'true'); };
  const close = () => { menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true'); btn.setAttribute('aria-expanded', 'false'); };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.contains('open') ? close() : open();
  });

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && e.target !== btn) close();
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  // Navegação
  const goConta = document.getElementById('btnMinhaConta');
  if (goConta) goConta.addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'conta'; });

  const sair = document.getElementById('btnSair');
  if (sair) sair.addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'login'; });
})();
