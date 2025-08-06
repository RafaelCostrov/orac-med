// Aguarda o DOM
document.addEventListener('DOMContentLoaded', () => {
  // ====== Dropdown Exames ======
  const dropdownSelected = document.querySelector('.dropdown-selected');
  const dropdownList = document.querySelector('.dropdown-list');
  const listaExamesUL = document.getElementById('lista-exames');
  const valorTotalInp = document.getElementById('valor-total');
  const btnRemover = document.querySelector('.remover');
  const tipoExameSel = document.getElementById('tipo-exame');

  // Garante querySelectors seguros
  const checkboxes = dropdownList ? dropdownList.querySelectorAll('input[type="checkbox"]') : [];

  // Preços por exame
  const EXAM_PRICES = {
    'Clínico': 150,
    'Audiometria': 80,
    'Espirometria': 120,
    'Teste Ishira': 40,
    'TGO': 70,
    'Aval. Psicossocial': 200,
    'ECG': 150,
    'EEC': 90,
    'Teste ROMBERG': 70
  };

  // Pacotes por tipo de exame
  const PACKAGE_MAP = {
    'Admissional': ['Clínico'],
    'Demissional': ['Clínico'],
    'Periódico':   ['Clínico'],
    'Mudança de Função': ['Clínico'],
    'Retorno ao Trabalho': ['Clínico'],
    'Outros': []
  };

  let selected = new Set();

  function formatBRL(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  }

  function renderList() {
    if (!listaExamesUL) return;
    listaExamesUL.innerHTML = '';
    if (selected.size === 0) return;
    [...selected].forEach(ex => {
      const li = document.createElement('li');
      li.textContent = ex;
      listaExamesUL.appendChild(li);
    });
  }

  function updateTotal() {
    if (!valorTotalInp) return;
    let total = 0;
    selected.forEach(ex => { total += EXAM_PRICES[ex] || 0; });
    valorTotalInp.value = formatBRL(total);
  }

  function toggleHighlight(checkbox) {
    const label = checkbox.parentElement;
    if (!label) return;
    if (checkbox.checked) label.classList.add('selected');
    else label.classList.remove('selected');
  }

  function applyPackage(tipo) {
    selected = new Set(PACKAGE_MAP[tipo] || []);
    checkboxes.forEach(chk => {
      chk.checked = selected.has(chk.value);
      toggleHighlight(chk);
    });
    renderList();
    updateTotal();
    updateDropdownText();
  }

  function updateDropdownText() {
    if (!dropdownSelected) return;
    if (selected.size === 0) {
      dropdownSelected.textContent = 'Selecione os exames';
    } else {
      dropdownSelected.textContent = `${selected.size} exame(s) selecionado(s)`;
    }
  }

  // Toggle dropdown
  dropdownSelected?.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownList.style.display = dropdownList.style.display === 'block' ? 'none' : 'block';
  });

  // Clicar fora fecha dropdown
  document.addEventListener('click', (e) => {
    if (!dropdownSelected) return;
    if (!dropdownSelected.contains(e.target) && !dropdownList.contains(e.target)) {
      dropdownList.style.display = 'none';
    }
  });

  // Resize fecha dropdown para evitar corte em mudanças de layout
  window.addEventListener('resize', () => {
    if (dropdownList) dropdownList.style.display = 'none';
  });

  // Alterações nos checkboxes
  checkboxes.forEach(chk => {
    chk.addEventListener('change', () => {
      if (chk.checked) selected.add(chk.value);
      else selected.delete(chk.value);
      toggleHighlight(chk);
      renderList();
      updateTotal();
      updateDropdownText();
    });
  });

  // Remover exames (volta ao pacote do tipo atual)
  btnRemover?.addEventListener('click', () => {
    const tipoAtual = tipoExameSel?.value || '';
    applyPackage(tipoAtual);
  });

  // Tipo de exame muda pacote
  tipoExameSel?.addEventListener('change', (e) => {
    applyPackage(e.target.value);
  });

  // Submeter formulário (placeholder)
  const form = document.getElementById('form-atendimento');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Enviar atendimento:', {
      tipoAtendimento: document.getElementById('tipo-atendimento')?.value || '',
      empresa: document.getElementById('empresa')?.value || '',
      colaborador: document.getElementById('colaborador')?.value || '',
      tipoExame: document.getElementById('tipo-exame')?.value || '',
      exames: [...selected],
      valorTotal: valorTotalInp?.value || 'R$ 0,00',
    });
    alert('Ficha enviada (mock). Integre com o backend quando estiver pronto.');
  });

  // ====== Dropdown do Perfil ======
  const btn  = document.getElementById('avatarBtn');
  const menu = document.getElementById('profileMenu');
  const minhaConta = document.getElementById('btnMinhaConta');
  const sair = document.getElementById('btnSair');

  const open = () => {
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
  };

  const close = () => {
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
  };

  btn?.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.contains('open') ? close() : open();
  });

  document.addEventListener('click', (e) => {
    if (!menu || !btn) return;
    if (!menu.contains(e.target) && !btn.contains(e.target)) close();
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  minhaConta?.addEventListener('click', (e) => {
    e.preventDefault(); close();
    console.log('Abrir Minha Conta');
  });
  sair?.addEventListener('click', (e) => {
    e.preventDefault(); close();
    console.log('Logout');
  });

  // Estado inicial
  close();
  renderList();
  updateTotal();
  updateDropdownText();
});
