// ../js/cadastro.js
document.addEventListener('DOMContentLoaded', () => {
  const $  = (s, ctx=document) => ctx.querySelector(s);
  const $$ = (s, ctx=document) => [...ctx.querySelectorAll(s)];
  const fmtBRL = (n)=> new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(+n||0);

  /* ===== Perfil / menu ===== */
  (function(){
    const btn = $('#avatarBtn'), menu = $('#profileMenu');
    if(!btn||!menu) return;
    const open=()=>{menu.classList.add('open');menu.setAttribute('aria-hidden','false');btn.setAttribute('aria-expanded','true');};
    const close=()=>{menu.classList.remove('open');menu.setAttribute('aria-hidden','true');btn.setAttribute('aria-expanded','false');};
    btn.addEventListener('click',e=>{e.stopPropagation();menu.classList.contains('open')?close():open();});
    document.addEventListener('click',e=>{if(!menu.contains(e.target)&&e.target!==btn) close();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape') close();});
    const goConta=$('#btnMinhaConta'); if(goConta) goConta.addEventListener('click',e=>{e.preventDefault();location.href='conta.html';});
    const sair=$('#btnSair'); if(sair) sair.addEventListener('click',e=>{e.preventDefault();location.href='login.html';});
  })();

  /* ===== Mock com nomes do back ===== */
  const db = {
    usuarios: [
      { id_usuario:1, nome_usuario:'Ana Souza',   email_usuario:'ana@exemplo.com',   senha:'', role:'ADMIN' },
      { id_usuario:2, nome_usuario:'Bruno Lima',  email_usuario:'bruno@exemplo.com', senha:'', role:'OPERADOR' }
    ],
    clientes: [
      { id_cliente:1, nome_cliente:'Alfa Serviços Ltda', cnpj_cliente:'12.345.678/0001-90', tipo_cliente:'EMPRESA' },
      { id_cliente:2, nome_cliente:'Carlos Pereira',     cnpj_cliente:'000.000.000-00',    tipo_cliente:'PARTICULAR' }
    ],
    exames: [
      { id_exame:1, nome_exame:'Audiometria', is_interno:true,  valor_exame: 120.0 },
      { id_exame:2, nome_exame:'Clínico',     is_interno:false, valor_exame: 80.0  }
    ]
  };
  let seq = 100;
  let tipoAtual = 'usuarios';
  let page = 1;

  /* ===== Filtros ===== */
  const filtros = {
    usuarios: { nome:'', email:'', role:'' },
    clientes: { nome:'', cnpj:'',  tipo:'' },
    exames:   { nome:'', interno:'', vmin:'', vmax:'' }
  };

  /* ===== UI refs ===== */
  const tipoLista = $('#tipoLista');
  const thead = $('#theadCad');
  const tbody = $('#tbodyCad');
  const ippEl = $('#ipp');
  const prev = $('#prev'), next = $('#next'), pinfo = $('#pinfo');

  const btnNovo = $('#btnNovo');
  const btnFiltro = $('#btnFiltro');
  const btnImprimir = $('#btnImprimir');

  /* ===== Colunas (sem "Ações") ===== */
  const COLS = {
    usuarios: ['Nome','E-mail','Perfil'],
    clientes: ['Nome do cliente','CNPJ','Tipo'],
    exames  : ['Nome do exame','Interno?','Valor']
  };

  const renderRow = {
    usuarios: (r)=> [ r.nome_usuario, r.email_usuario, r.role ],
    clientes: (r)=> [ r.nome_cliente, r.cnpj_cliente, r.tipo_cliente ],
    exames:   (r)=> [
      r.nome_exame,
      r.is_interno ? `<span class="pill ok">Sim</span>` : `<span class="pill no">Não</span>`,
      `<span class="num">${fmtBRL(r.valor_exame)}</span>`
    ]
  };

  /* ===== Helpers modal ===== */
  function openModal(id){ const m=$('#'+id); if(!m) return; m.setAttribute('aria-hidden','false'); setTimeout(()=>{ const f=m.querySelector('input,select,button'); f&&f.focus();},50); }
  function closeModal(id){ const m=$('#'+id); if(!m) return; m.setAttribute('aria-hidden','true'); }

  $$('.modal').forEach(m=>{
    const bd = $('.modal__backdrop', m); if(bd) bd.addEventListener('click', ()=> m.setAttribute('aria-hidden','true'));
    $$('.modal__close', m).forEach(b=> b.addEventListener('click', ()=> m.setAttribute('aria-hidden','true')));
  });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') $$('.modal[aria-hidden="false"]').forEach(m=>m.setAttribute('aria-hidden','true')); });

  /* ===== Render ===== */
  function getFilteredRows(){
    const base = db[tipoAtual] || [];
    const f = filtros[tipoAtual];

    if(tipoAtual==='usuarios'){
      return base.filter(r =>
        (!f.nome  || r.nome_usuario.toLowerCase().includes(f.nome.toLowerCase())) &&
        (!f.email || r.email_usuario.toLowerCase().includes(f.email.toLowerCase())) &&
        (!f.role  || r.role===f.role)
      );
    }
    if(tipoAtual==='clientes'){
      return base.filter(r =>
        (!f.nome || r.nome_cliente.toLowerCase().includes(f.nome.toLowerCase())) &&
        (!f.cnpj || r.cnpj_cliente.toLowerCase().includes(f.cnpj.toLowerCase())) &&
        (!f.tipo || r.tipo_cliente===f.tipo)
      );
    }
    // exames
    return base.filter(r => {
      const okNome = !f.nome || r.nome_exame.toLowerCase().includes(f.nome.toLowerCase());
      const okInt  = !f.interno || String(r.is_interno)===f.interno;
      const vmin   = f.vmin!=='' ? parseFloat(f.vmin) : null;
      const vmax   = f.vmax!=='' ? parseFloat(f.vmax) : null;
      const okMin  = vmin===null || (+r.valor_exame)>=vmin;
      const okMax  = vmax===null || (+r.valor_exame)<=vmax;
      return okNome && okInt && okMin && okMax;
    });
  }

  function renderHead(){
    const cols = COLS[tipoAtual] || [];
    thead.innerHTML = `<tr>${cols.map(c=>`<th>${c}</th>`).join('')}</tr>`;
  }

  function renderBody(){
    const rows = getFilteredRows();
    const ipp = parseInt(ippEl.value,10)||10;
    const totalPages = Math.max(1, Math.ceil(rows.length/ipp));
    if(page>totalPages) page = totalPages;

    const start = (page-1)*ipp;
    const slice = rows.slice(start, start+ipp);

    const idKey = tipoAtual==='usuarios'?'id_usuario': tipoAtual==='clientes'?'id_cliente':'id_exame';

    if(!slice.length){
      tbody.innerHTML = `<tr><td colspan="${(COLS[tipoAtual]||[]).length}">Sem registros.</td></tr>`;
    } else {
      tbody.innerHTML = slice.map((r)=>{
        const cells = renderRow[tipoAtual](r);
        const dataId = r[idKey];
        return `<tr data-tipo="${tipoAtual}" data-id="${dataId}">${cells.map(td=>`<td>${td}</td>`).join('')}</tr>`;
      }).join('');
    }

    pinfo.textContent = `Página ${page} de ${totalPages}`;
    prev.disabled = page===1; next.disabled = page===totalPages;
  }

  function renderAll(){ renderHead(); renderBody(); }

  /* ===== Troca de tipo / paginação ===== */
  tipoLista.addEventListener('change', ()=>{
    tipoAtual = tipoLista.value;
    $('#cadTipo').value = tipoAtual;
    switchCadFields(tipoAtual);
    switchFiltroFields(tipoAtual);
    page = 1;
    renderAll();
  });
  prev.addEventListener('click', ()=>{ if(page>1){ page--; renderBody(); } });
  next.addEventListener('click', ()=>{ page++; renderBody(); });
  ippEl.addEventListener('change', ()=>{ page=1; renderBody(); });

  /* ===== Modal Cadastro ===== */
  const cadTipo = $('#cadTipo');
  const btnExcluirReg = $('#btnExcluirReg');
  function switchCadFields(tipo){ $$('.cad-field').forEach(el=> el.classList.toggle('hidden', el.getAttribute('data-for')!==tipo)); }
  cadTipo.addEventListener('change', ()=> switchCadFields(cadTipo.value));

  let mode='create', editCtx=null;

  function fillForm(rec){
    const t = $('#cadTipo').value;
    if(t==='usuarios'){
      $('#nome_usuario').value  = rec?.nome_usuario  || '';
      $('#email_usuario').value = rec?.email_usuario || '';
      $('#senha').value         = ''; // não mostramos senha
      $('#role').value          = rec?.role || 'OPERADOR';
    } else if(t==='clientes'){
      $('#nome_cliente').value = rec?.nome_cliente || '';
      $('#cnpj_cliente').value = rec?.cnpj_cliente || '';
      $('#tipo_cliente').value = rec?.tipo_cliente || 'EMPRESA';
    } else {
      $('#nome_exame').value   = rec?.nome_exame || '';
      $('#is_interno').value   = String(!!rec?.is_interno);
      $('#valor_exame').value  = rec?.valor_exame ?? '';
    }
  }

  function readForm(){
    const t = $('#cadTipo').value;
    if(t==='usuarios'){
      return {
        nome_usuario:  $('#nome_usuario').value.trim(),
        email_usuario: $('#email_usuario').value.trim(),
        senha:         $('#senha').value,
        role:          $('#role').value
      };
    } else if(t==='clientes'){
      return {
        nome_cliente:  $('#nome_cliente').value.trim(),
        cnpj_cliente:  $('#cnpj_cliente').value.trim(),
        tipo_cliente:  $('#tipo_cliente').value
      };
    }
    return {
      nome_exame:  $('#nome_exame').value.trim(),
      is_interno:  $('#is_interno').value === 'true',
      valor_exame: parseFloat($('#valor_exame').value || '0')
    };
  }

  function validate(t, rec){
    const errs=[];
    if(t==='usuarios'){
      if(!rec.nome_usuario)  errs.push('Nome é obrigatório.');
      if(!rec.email_usuario) errs.push('E-mail é obrigatório.');
      if(mode==='create' && !rec.senha) errs.push('Senha é obrigatória no cadastro.');
    } else if(t==='clientes'){
      if(!rec.nome_cliente) errs.push('Nome do cliente é obrigatório.');
      if(!rec.cnpj_cliente) errs.push('CNPJ é obrigatório.');
    } else {
      if(!rec.nome_exame) errs.push('Nome do exame é obrigatório.');
    }
    return errs;
  }

  $('#formCadastro').addEventListener('submit', (e)=>{
    e.preventDefault();
    const t = $('#cadTipo').value;
    const rec = readForm();
    const errs = validate(t, rec);
    if(errs.length){ alert(errs.join('\n')); return; }

    if(mode==='create'){
      const idKey = t==='usuarios'?'id_usuario': t==='clientes'?'id_cliente':'id_exame';
      db[t].push({ [idKey]: ++seq, ...rec });
    } else if(mode==='edit' && editCtx){
      const arr = db[editCtx.tipo];
      const idKey = editCtx.tipo==='usuarios'?'id_usuario': editCtx.tipo==='clientes'?'id_cliente':'id_exame';
      const idx = arr.findIndex(r=> r[idKey]===editCtx.id);
      if(idx>=0) arr[idx] = { [idKey]: editCtx.id, ...rec };
    }
    closeModal('modalCadastro');
    renderAll();
  });

  // NOVO
  btnNovo.addEventListener('click', ()=>{
    $('#cadTipo').value = tipoAtual;
    switchCadFields(tipoAtual);
    fillForm(null);
    mode='create'; editCtx=null;
    btnExcluirReg.style.display = 'none';
    openModal('modalCadastro');
  });

  // Clique na linha abre edição
  tbody.addEventListener('click', (e)=>{
    const tr = e.target.closest('tr');
    if(!tr || !tr.dataset.id) return;
    const tipo = tr.dataset.tipo;
    const id   = +tr.dataset.id;
    const idKey = tipo==='usuarios'?'id_usuario': tipo==='clientes'?'id_cliente':'id_exame';
    const rec = db[tipo].find(r=> r[idKey]===id);
    if(!rec) return;

    $('#cadTipo').value = tipo;
    switchCadFields(tipo);
    fillForm(rec);
    mode='edit'; editCtx={ tipo, id };
    btnExcluirReg.style.display = 'inline-block';
    openModal('modalCadastro');
  });

  // Excluir dentro do modal
  btnExcluirReg.addEventListener('click', ()=>{
    if(!editCtx) return;
    if(!confirm('Confirma excluir este registro?')) return;
    const arr = db[editCtx.tipo];
    const idKey = editCtx.tipo==='usuarios'?'id_usuario': editCtx.tipo==='clientes'?'id_cliente':'id_exame';
    const idx = arr.findIndex(r=> r[idKey]===editCtx.id);
    if(idx>=0) arr.splice(idx,1);
    closeModal('modalCadastro');
    renderAll();
  });

  /* ===== Modal Filtros ===== */
  function switchFiltroFields(tipo){ $$('.filtro-field').forEach(el=> el.classList.toggle('hidden', el.getAttribute('data-for')!==tipo)); }

  btnFiltro.addEventListener('click', ()=>{
    switchFiltroFields(tipoAtual);
    // preencher os inputs com o estado atual:
    $('#f_u_nome').value   = filtros.usuarios.nome;
    $('#f_u_email').value  = filtros.usuarios.email;
    $('#f_u_role').value   = filtros.usuarios.role;

    $('#f_c_nome').value   = filtros.clientes.nome;
    $('#f_c_cnpj').value   = filtros.clientes.cnpj;
    $('#f_c_tipo').value   = filtros.clientes.tipo;

    $('#f_e_nome').value      = filtros.exames.nome;
    $('#f_e_interno').value   = filtros.exames.interno;
    $('#f_e_valor_min').value = filtros.exames.vmin;
    $('#f_e_valor_max').value = filtros.exames.vmax;

    openModal('modalFiltrosCad');
  });

  $('#filtrosAplicarCad').addEventListener('click', ()=>{
    if(tipoAtual==='usuarios'){
      filtros.usuarios.nome  = $('#f_u_nome').value.trim();
      filtros.usuarios.email = $('#f_u_email').value.trim();
      filtros.usuarios.role  = $('#f_u_role').value;
    } else if(tipoAtual==='clientes'){
      filtros.clientes.nome = $('#f_c_nome').value.trim();
      filtros.clientes.cnpj = $('#f_c_cnpj').value.trim();
      filtros.clientes.tipo = $('#f_c_tipo').value;
    } else {
      filtros.exames.nome    = $('#f_e_nome').value.trim();
      filtros.exames.interno = $('#f_e_interno').value;
      filtros.exames.vmin    = $('#f_e_valor_min').value;
      filtros.exames.vmax    = $('#f_e_valor_max').value;
    }
    page=1; renderAll(); closeModal('modalFiltrosCad');
  });

  $('#filtrosLimparCad').addEventListener('click', ()=>{
    filtros.usuarios = { nome:'', email:'', role:'' };
    filtros.clientes = { nome:'', cnpj:'',  tipo:'' };
    filtros.exames   = { nome:'', interno:'', vmin:'', vmax:'' };
    page=1; renderAll();
  });

  btnImprimir.addEventListener('click', ()=> window.print());

  /* ===== Init ===== */
  $('#cadTipo').value = tipoLista.value;
  switchCadFields(tipoLista.value);
  switchFiltroFields(tipoLista.value);
  renderAll();
});
