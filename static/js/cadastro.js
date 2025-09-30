// // ../js/cadastro.js
// document.addEventListener('DOMContentLoaded', () => {
//   const $ = (s, ctx = document) => ctx.querySelector(s);
//   const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
//   const fmtBRL = (n) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(+n || 0);

//   /* ===== Perfil / menu ===== */
//   (function () {
//     const btn = $('#avatarBtn'), menu = $('#profileMenu');
//     if (!btn || !menu) return;
//     const open = () => { menu.classList.add('open'); menu.setAttribute('aria-hidden', 'false'); btn.setAttribute('aria-expanded', 'true'); };
//     const close = () => { menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true'); btn.setAttribute('aria-expanded', 'false'); };
//     btn.addEventListener('click', e => { e.stopPropagation(); menu.classList.contains('open') ? close() : open(); });
//     document.addEventListener('click', e => { if (!menu.contains(e.target) && e.target !== btn) close(); });
//     document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
//     const goConta = $('#btnMinhaConta'); if (goConta) goConta.addEventListener('click', e => { e.preventDefault(); location.href = 'conta'; });
//     // const sair = $('#btnSair'); if (sair) sair.addEventListener('click', e => { e.preventDefault(); location.href = 'login'; });
//   })();


//   let tipoAtual = 'clientes';

//   /* ===== Filtros ===== */
//   const filtros = {
//     usuarios: { nome: '', email: '', role: '' },
//     clientes: { nome: '', cnpj: '', tipo: '' },
//     exames: { nome: '', interno: '', vmin: '', vmax: '' }
//   };

//   /* ===== UI refs ===== */
//   const tipoLista = $('#tipoLista');
//   const tbody = $('#tbodyCad');
//   const ippEl = $('#ipp');
//   const prev = $('#prev'), next = $('#next'), pinfo = $('#pinfo');

//   const btnNovo = $('#btnNovo');
//   const btnFiltro = $('#btnFiltro');
//   const btnImprimir = $('#btnImprimir');

//   /* ===== Colunas (sem "Ações") ===== */
//   const COLS = {
//     usuarios: ['Nome', 'E-mail', 'Perfil'],
//     clientes: ['Nome do cliente', 'CNPJ', 'Tipo'],
//     exames: ['Nome do exame', 'Interno?', 'Valor']
//   };

//   const renderRow = {
//     usuarios: (r) => [r.nome_usuario, r.email_usuario, r.role],
//     clientes: (r) => [r.nome_cliente, r.cnpj_cliente, r.tipo_cliente],
//     exames: (r) => [
//       r.nome_exame,
//       r.is_interno ? `<span class="pill ok">Sim</span>` : `<span class="pill no">Não</span>`,
//       `<span class="num">${fmtBRL(r.valor_exame)}</span>`
//     ]
//   };

//   /* ===== Helpers modal ===== */
//   function openModal(id) { const m = $('#' + id); if (!m) return; m.setAttribute('aria-hidden', 'false'); setTimeout(() => { const f = m.querySelector('input,select,button'); f && f.focus(); }, 50); }
//   function closeModal(id) { const m = $('#' + id); if (!m) return; m.setAttribute('aria-hidden', 'true'); }

//   $$('.modal').forEach(m => {
//     const bd = $('.modal__backdrop', m); if (bd) bd.addEventListener('click', () => m.setAttribute('aria-hidden', 'true'));
//     $$('.modal__close', m).forEach(b => b.addEventListener('click', () => m.setAttribute('aria-hidden', 'true')));
//   });
//   document.addEventListener('keydown', e => { if (e.key === 'Escape') $$('.modal[aria-hidden="false"]').forEach(m => m.setAttribute('aria-hidden', 'true')); });

//   switchCadFields(tipoAtual);
//   switchFiltroFields(tipoAtual);

//   prev.addEventListener('click', () => { if (page > 1) { page--; renderBody(); } });
//   next.addEventListener('click', () => { page++; renderBody(); });
//   ippEl.addEventListener('change', () => { page = 1; renderBody(); });

//   /* ===== Modal Cadastro ===== */
//   const cadTipo = $('#cadTipo');
//   const btnExcluirReg = $('#btnExcluirReg');
//   function switchCadFields(tipo) { $$('.cad-field').forEach(el => el.classList.toggle('hidden', el.getAttribute('data-for') !== tipo)); }
//   cadTipo.addEventListener('change', () => switchCadFields(cadTipo.value));

//   let mode = 'create', editCtx = null;

//   function fillForm(rec) {
//     const t = $('#cadTipo').value;
//     if (t === 'usuarios') {
//       $('#nome_usuario').value = rec?.nome_usuario || '';
//       $('#email_usuario').value = rec?.email_usuario || '';
//       $('#senha').value = ''; // não mostramos senha
//       $('#role').value = rec?.role || 'OPERADOR';
//     } else if (t === 'clientes') {
//       $('#nome_cliente').value = rec?.nome_cliente || '';
//       $('#cnpj_cliente').value = rec?.cnpj_cliente || '';
//       $('#tipo_cliente').value = rec?.tipo_cliente || 'EMPRESA';
//     } else {
//       $('#nome_exame').value = rec?.nome_exame || '';
//       $('#is_interno').value = String(!!rec?.is_interno);
//       $('#valor_exame').value = rec?.valor_exame ?? '';
//     }
//   }

//   function readForm() {
//     const t = $('#cadTipo').value;
//     if (t === 'usuarios') {
//       return {
//         nome_usuario: $('#nome_usuario').value.trim(),
//         email_usuario: $('#email_usuario').value.trim(),
//         senha: $('#senha').value,
//         role: $('#role').value
//       };
//     } else if (t === 'clientes') {
//       return {
//         nome_cliente: $('#nome_cliente').value.trim(),
//         cnpj_cliente: $('#cnpj_cliente').value.trim(),
//         tipo_cliente: $('#tipo_cliente').value
//       };
//     }
//     return {
//       nome_exame: $('#nome_exame').value.trim(),
//       is_interno: $('#is_interno').value === 'true',
//       valor_exame: parseFloat($('#valor_exame').value || '0')
//     };
//   }

//   function validate(t, rec) {
//     const errs = [];
//     if (t === 'usuarios') {
//       if (!rec.nome_usuario) errs.push('Nome é obrigatório.');
//       if (!rec.email_usuario) errs.push('E-mail é obrigatório.');
//       if (mode === 'create' && !rec.senha) errs.push('Senha é obrigatória no cadastro.');
//     } else if (t === 'clientes') {
//       if (!rec.nome_cliente) errs.push('Nome do cliente é obrigatório.');
//       if (!rec.cnpj_cliente) errs.push('CNPJ é obrigatório.');
//     } else {
//       if (!rec.nome_exame) errs.push('Nome do exame é obrigatório.');
//     }
//     return errs;
//   }

//   $('#formCadastro').addEventListener('submit', (e) => {
//     e.preventDefault();
//     const t = $('#cadTipo').value;
//     const rec = readForm();
//     const errs = validate(t, rec);
//     if (errs.length) { alert(errs.join('\n')); return; }

//     if (mode === 'create') {
//       const idKey = t === 'usuarios' ? 'id_usuario' : t === 'clientes' ? 'id_cliente' : 'id_exame';
//       db[t].push({ [idKey]: ++seq, ...rec });
//     } else if (mode === 'edit' && editCtx) {
//       const arr = db[editCtx.tipo];
//       const idKey = editCtx.tipo === 'usuarios' ? 'id_usuario' : editCtx.tipo === 'clientes' ? 'id_cliente' : 'id_exame';
//       const idx = arr.findIndex(r => r[idKey] === editCtx.id);
//       if (idx >= 0) arr[idx] = { [idKey]: editCtx.id, ...rec };
//     }
//     closeModal('modalCadastro');
//     renderAll();
//   });

//   // NOVO
//   btnNovo.addEventListener('click', () => {
//     $('#cadTipo').value = tipoAtual;
//     switchCadFields(tipoAtual);
//     fillForm(null);
//     mode = 'create'; editCtx = null;
//     btnExcluirReg.style.display = 'none';
//     openModal('modalCadastro');
//   });

//   /* ===== Modal Filtros ===== */
//   function switchFiltroFields(tipo) { $$('.filtro-field').forEach(el => el.classList.toggle('hidden', el.getAttribute('data-for') !== tipo)); }

//   btnFiltro.addEventListener('click', () => {
//     switchFiltroFields(tipoAtual);
//     // preencher os inputs com o estado atual:
//     $('#nome_usuario_filtro').value = filtros.usuarios.nome;
//     $('#email_usuario_filtro').value = filtros.usuarios.email;
//     $('#role_filtro').value = filtros.usuarios.role;

//     $('#nome_cliente_filtro').value = filtros.clientes.nome;
//     $('#cnpj_cliente_filtro').value = filtros.clientes.cnpj;
//     $('#tipo_cliente_filtro').value = filtros.clientes.tipo;

//     $('#nome_exame_filtro').value = filtros.exames.nome;
//     $('#is_interno_filtro').value = filtros.exames.interno;
//     $('#min_valor_filtro').value = filtros.exames.vmin;
//     $('#max_valor_filtro').value = filtros.exames.vmax;

//     openModal('modalFiltrosCad');
//   });

//   // btnImprimir.addEventListener('click', () => window.print());

//   tipoLista.addEventListener('change', () => {
//     tipoAtual = tipoLista.value;
//     switchCadFields(tipoAtual);
//     switchFiltroFields(tipoAtual);
//   });

//   /* ===== Init ===== */
//   $('#cadTipo').value = tipoLista.value;
//   switchCadFields(tipoLista.value);
//   switchFiltroFields(tipoLista.value);
// });
