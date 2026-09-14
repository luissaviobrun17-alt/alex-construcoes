/**
 * SISTEMA OPERACIONAL ALEX CONSTRUÇÕES - NÚCLEO DE OPERAÇÕES EM CAMPO E ESCRITÓRIO
 * Mobile-First, Three.js 3D, Touch Signature, WhatsApp Engine & Parametric Budget
 */

// ESTADO GLOBAL DA APLICAÇÃO
let appState = {
  client: {
    name: "João Carlos Ferreira",
    phone: "5511998877665",
    address: "Rua das Laranjeiras, 450 - Bairro Jardim América",
    cpf: "123.456.789-00",
    startDate: "2026-09-20",
    notes: "Reforma completa da área gourmet, banheiro social e fachada."
  },
  budgetSettings: {
    bdi: 15,
    margin: 25
  },
  catalog: [
    {
      code: "CIV-01",
      discipline: "Civil",
      name: "Alvenaria de vedação c/ bloco cerâmico assentado",
      unit: "m²",
      directCost: 45.00,
      suggestedPrice: 68.00,
      quantity: 35.0,
      description: "Alvenaria de vedação com blocos cerâmicos furados 9x19x19cm, assentados com argamassa mista cimento, cal e areia traço 1:2:8, incluindo amarração, vergas e contravergas nas aberturas."
    },
    {
      code: "CIV-02",
      discipline: "Civil",
      name: "Reboco paulista / emboço sarrafeado",
      unit: "m²",
      directCost: 28.00,
      suggestedPrice: 45.00,
      quantity: 70.0,
      description: "Emboço e reboco paulista com argamassa traço 1:3, sarrafeada com régua de alumínio e desempenada com feltro fino para acabamento plano e prumo perfeito."
    },
    {
      code: "CIV-03",
      discipline: "Civil",
      name: "Assentamento de porcelanato retificado até 80x80",
      unit: "m²",
      directCost: 55.00,
      suggestedPrice: 90.00,
      quantity: 42.0,
      description: "Assentamento de porcelanato retificado com dupla colagem em argamassa flexível AC-III, niveladores tipo cunha e rejunte resinado antifungos."
    },
    {
      code: "ELE-01",
      discipline: "Elétrica",
      name: "Ponto de força / tomada / iluminação embutida",
      unit: "un",
      directCost: 40.00,
      suggestedPrice: 75.00,
      quantity: 18.0,
      description: "Ponto de energia embutido com eletroduto reforçado, fiação de cobre antichama 2,5mm², caixa 4x2 e acabamento com módulo/espelho de primeira linha."
    },
    {
      code: "ELE-02",
      discipline: "Elétrica",
      name: "Montagem de Quadro de Distribuição (QDC) completo",
      unit: "un",
      directCost: 280.00,
      suggestedPrice: 500.00,
      quantity: 1.0,
      description: "Montagem de QDC para até 16 circuitos com Disjuntor Geral, barramentos tipo pente, DPS Classe II contra surtos e DR de proteção contra choque elétrico de 30mA."
    },
    {
      code: "HID-01",
      discipline: "Hidráulica",
      name: "Ponto de água fria/esgoto sanitário (PPR/PVC)",
      unit: "un",
      directCost: 95.00,
      suggestedPrice: 165.00,
      quantity: 6.0,
      description: "Instalação de ramal de água fria em PPR termofundido ou PVC soldável, e derivação para esgoto com fecho hídrico sifonado de PVC ponta e bolsa conforme NBR 5626."
    },
    {
      code: "PIN-01",
      discipline: "Pintura",
      name: "Emassamento (2 demãos) e pintura acrílica fosca",
      unit: "m²",
      directCost: 22.00,
      suggestedPrice: 38.00,
      quantity: 110.0,
      description: "Preparo de base com selador, lixamento orbital, 2 demãos de massa corrida/acrílica e 2 a 3 demãos de tinta acrílica premium fosca lavável."
    }
  ],
  financials: {
    receipts: [
      {
        id: "REC-001",
        date: "2026-09-20",
        clientName: "João Carlos Ferreira",
        stage: "Sinal / Entrada (30%)",
        amount: 4500.00,
        method: "PIX",
        remainingBalance: 14750.00
      }
    ],
    expenses: [
      {
        id: "EXP-001",
        date: "2026-09-21",
        description: "Diária de Pedreiro e Ajudante (Demolição)",
        category: "Mão de Obra",
        amount: 420.00
      },
      {
        id: "EXP-002",
        date: "2026-09-21",
        description: "Argamassa AC-III e cunhas niveladoras",
        category: "Material Rápido",
        amount: 265.00
      }
    ]
  },
  contract: {
    signedAt: "",
    signatureBase64: "",
    clientSigned: false
  }
};

let serverInfo = {
  local_ip: "192.168.2.122",
  port: 8000,
  mobile_url: "http://192.168.2.122:8000"
};

// ====================================================================
// INICIALIZAÇÃO DO SISTEMA
// ====================================================================
document.addEventListener("DOMContentLoaded", async () => {
  // Inicializa ícones Lucide
  if (window.lucide) {
    lucide.createIcons();
  }

  // Registra Service Worker para PWA Offline
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // Tenta carregar dados do servidor ou localStorage
  await fetchServerInfo();
  await loadState();

  // Popula os formulários e tabelas
  populateClientForm();
  renderCatalogItems();
  recalculateBudget();
  renderFinancials();
  initSignatureCanvas();
  initThreeJs();

  // Atualiza prévias de recibo e texto
  updateReceiptPreview();

  // Event listener para redimensionamento
  window.addEventListener('resize', () => {
    if (renderer && camera) {
      const container = document.getElementById('threejsCanvas');
      if (container && container.clientWidth > 0) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      }
    }
  });
});

// ====================================================================
// SINCRONIZAÇÃO NUVEM LOCAL & REST API
// ====================================================================
async function fetchServerInfo() {
  try {
    const res = await fetch('/api/info');
    if (res.ok) {
      serverInfo = await res.json();
      const mobileDisplay = document.getElementById('mobileUrlDisplay');
      if (mobileDisplay) {
        mobileDisplay.innerText = serverInfo.mobile_url;
      }
    }
  } catch (err) {
    console.warn("Executando em modo isolado/offline:", err);
  }
}

async function loadState() {
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      const data = await res.json();
      if (data && data.client) {
        appState = data;
        updateSyncStatus(true);
        return;
      }
    }
  } catch (err) {
    console.warn("Servidor offline, tentando localStorage");
  }

  const local = localStorage.getItem('alex_app_state');
  if (local) {
    try {
      appState = JSON.parse(local);
      updateSyncStatus(false);
    } catch (e) {}
  }
}

async function saveAllData(showFeedback = true) {
  // Atualiza localStorage
  localStorage.setItem('alex_app_state', JSON.stringify(appState));

  // Tenta sincronizar com o backend
  let synced = false;
  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appState)
    });
    if (res.ok) {
      synced = true;
    }
  } catch (err) {
    synced = false;
  }

  updateSyncStatus(synced);

  if (showFeedback) {
    showToast(synced ? "Dados sincronizados com o Computador e Celular!" : "Salvo localmente (Dispositivo Offline)");
  }
}

function updateSyncStatus(isOnline) {
  const badge = document.getElementById('syncBadge');
  if (!badge) return;
  if (isOnline) {
    badge.className = "hidden md:flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800";
    badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span> Sincronizado';
  } else {
    badge.className = "hidden md:flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950 text-amber-400 border border-amber-800";
    badge.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-500 mr-2"></span> Modo Offline';
  }
}

function showToast(msg) {
  const toast = document.getElementById('toastNotification');
  const msgEl = document.getElementById('toastMessage');
  if (!toast || !msgEl) return;
  msgEl.innerText = msg;
  toast.classList.remove('hidden');
  toast.classList.add('flex');
  setTimeout(() => {
    toast.classList.add('hidden');
    toast.classList.remove('flex');
  }, 3500);
}

// ====================================================================
// NAVEGAÇÃO ENTRE ABAS
// ====================================================================
function switchTab(tabId) {
  document.querySelectorAll('.tab-pane').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.nav-btn').forEach(el => {
    el.classList.remove('bg-brand-blue', 'text-white', 'border-b-2', 'border-brand-orange');
    el.classList.add('bg-slate-800', 'text-slate-300');
  });

  const activePane = document.getElementById(`tab-${tabId}`);
  const activeNav = document.getElementById(`nav-${tabId}`);
  if (activePane) activePane.classList.remove('hidden');
  if (activeNav) {
    activeNav.classList.remove('bg-slate-800', 'text-slate-300');
    activeNav.classList.add('bg-brand-blue', 'text-white', 'border-b-2', 'border-brand-orange');
  }

  // Ações de refresh específicas por aba
  if (tabId === 'memorial') {
    updateMemorialContent();
  } else if (tabId === 'contrato') {
    updateContractDocument();
  } else if (tabId === 'recibos') {
    renderFinancials();
  } else if (tabId === 'visualizador') {
    setTimeout(() => {
      if (renderer && camera) {
        const container = document.getElementById('threejsCanvas');
        if (container) {
          camera.aspect = container.clientWidth / container.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(container.clientWidth, container.clientHeight);
        }
      }
    }, 100);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ====================================================================
// MÓDULO 1: CLIENTE & WHATSAPP
// ====================================================================
function populateClientForm() {
  const c = appState.client;
  document.getElementById('clientName').value = c.name || "";
  document.getElementById('clientPhone').value = c.phone || "";
  document.getElementById('clientAddress').value = c.address || "";
  document.getElementById('clientCpf').value = c.cpf || "";
  document.getElementById('clientStartDate').value = c.startDate || "";
  document.getElementById('clientNotes').value = c.notes || "";
}

function saveClientData() {
  appState.client.name = document.getElementById('clientName').value;
  appState.client.phone = document.getElementById('clientPhone').value.replace(/\D/g, '');
  appState.client.address = document.getElementById('clientAddress').value;
  appState.client.cpf = document.getElementById('clientCpf').value;
  appState.client.startDate = document.getElementById('clientStartDate').value;
  appState.client.notes = document.getElementById('clientNotes').value;

  saveAllData(true);
}

function sendWhatsAppTemplate(type) {
  const c = appState.client;
  const phone = c.phone || "";
  const total = calculateTotalSalePrice();

  let text = "";
  if (type === 'welcome') {
    text = `Olá, *${c.name}*! Tudo bem? 🛠️\n\nAqui é da equipe técnica da *Alex Construções*.\nConfirmamos o início dos trabalhos e mobilização de nossa equipe para a sua obra no endereço:\n📍 *${c.address}*.\n\nNosso compromisso é entregar máxima solidez, segurança e acabamento refinado conforme as normas de engenharia. Qualquer dúvida estamos à total disposição! 🤝`;
  } else if (type === 'budget') {
    text = `Olá, *${c.name}*! Segue a proposta técnica orçamentária da *Alex Construções* para o seu projeto:\n\n💰 *Valor Total da Empreitada:* R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n📋 *Condições Facilitadas de Pagamento:*\n• Sinal / Mobilização: 30%\n• 1ª Medição Intermediária: 30%\n• 2ª Medição Intermediária: 30%\n• Entrega Final e Vistoria: 10%\n\n🛡️ Garantia de 5 anos (Art. 618 do Código Civil).\nPodemos emitir o contrato e agendar o início?`;
  } else if (type === 'measurement') {
    text = `Prezado(a) *${c.name}*, informamos que concluímos mais uma etapa construtiva da sua obra com sucesso! 📐✨\n\nNossa vistoria técnica de medição foi realizada. Convidamos você para conferir os acabamentos executados e validarmos a liberação da medição seguinte.\n\nAlex Construções - Engenharia e Rigor em Campo.`;
  }

  const encoded = encodeURIComponent(text);
  const targetUrl = phone ? `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}` : `https://api.whatsapp.com/send?text=${encoded}`;
  window.open(targetUrl, '_blank');
}

// ====================================================================
// MÓDULO 2: CALCULADORA DE MEDIÇÃO & MOTOR DE ORÇAMENTAÇÃO
// ====================================================================
function calcQuickArea() {
  const l = parseFloat(document.getElementById('quickLength').value) || 0;
  const w = parseFloat(document.getElementById('quickWidth').value) || 0;
  const area = l * w;
  document.getElementById('quickAreaResult').innerText = area.toFixed(2).replace('.', ',') + " m²";
}

function applyQuickAreaToPrompt() {
  const l = parseFloat(document.getElementById('quickLength').value) || 0;
  const w = parseFloat(document.getElementById('quickWidth').value) || 0;
  const area = l * w;
  if (area <= 0) {
    alert("Por favor, insira o Comprimento e a Largura primeiro.");
    return;
  }

  const code = prompt("Para qual serviço deseja aplicar " + area.toFixed(2) + " m²?\n(Ex: CIV-01, CIV-02, CIV-03, PIN-01)", "CIV-03");
  if (!code) return;

  const item = appState.catalog.find(i => i.code.toUpperCase() === code.trim().toUpperCase());
  if (item) {
    item.quantity = parseFloat(area.toFixed(2));
    renderCatalogItems();
    recalculateBudget();
    saveAllData(false);
    showToast(`Área de ${area.toFixed(2)} m² atribuída ao item ${item.code}!`);
  } else {
    alert("Código não encontrado na tabela.");
  }
}

function renderCatalogItems() {
  const container = document.getElementById('catalogItemsContainer');
  if (!container) return;

  container.innerHTML = "";

  appState.catalog.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = "bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-md hover:border-slate-700 transition";

    const subtotalDirect = (item.quantity || 0) * item.directCost;
    const subtotalSale = (item.quantity || 0) * item.suggestedPrice;

    card.innerHTML = `
      <div class="flex-1 space-y-1">
        <div class="flex items-center space-x-2">
          <span class="px-2.5 py-0.5 rounded-lg text-xs font-black bg-brand-steel text-brand-orange border border-brand-orange/30">
            ${item.code}
          </span>
          <span class="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-800 text-slate-300">
            ${item.discipline}
          </span>
          <span class="text-xs text-slate-400 font-medium">Unid: <strong class="text-white">${item.unit}</strong></span>
        </div>
        <h3 class="text-base font-bold text-white">${item.name}</h3>
        <p class="text-xs text-slate-400 leading-relaxed">${item.description}</p>
        <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs pt-1">
          <span class="text-slate-400">Custo Direto Un.: <strong class="text-slate-200">R$ ${item.directCost.toFixed(2).replace('.', ',')}</strong></span>
          <span class="text-slate-400">Preço Sugerido Un.: <strong class="text-emerald-400">R$ ${item.suggestedPrice.toFixed(2).replace('.', ',')}</strong></span>
        </div>
      </div>

      <!-- CONTROLE DE QUANTIDADE E SUBTOTAL -->
      <div class="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
        <div class="flex items-center space-x-2">
          <label class="text-xs font-bold text-slate-400 uppercase">Qtd:</label>
          <div class="flex items-center border border-slate-700 rounded-xl bg-slate-900 overflow-hidden">
            <button onclick="changeItemQty(${index}, -1)" class="w-9 h-9 flex items-center justify-center text-slate-300 hover:bg-slate-800 font-bold">-</button>
            <input type="number" step="0.5" min="0" value="${item.quantity || 0}" onchange="setItemQty(${index}, this.value)" class="w-16 h-9 bg-transparent text-center font-bold text-white text-sm outline-none">
            <button onclick="changeItemQty(${index}, 1)" class="w-9 h-9 flex items-center justify-center text-slate-300 hover:bg-slate-800 font-bold">+</button>
          </div>
        </div>

        <div class="text-right">
          <span class="text-[10px] text-slate-400 uppercase font-bold block">Subtotal Sugerido:</span>
          <span class="text-base sm:text-lg font-black text-brand-orange">R$ ${subtotalSale.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

function changeItemQty(idx, delta) {
  const cur = appState.catalog[idx].quantity || 0;
  const next = Math.max(0, cur + delta);
  appState.catalog[idx].quantity = next;
  renderCatalogItems();
  recalculateBudget();
  saveAllData(false);
}

function setItemQty(idx, val) {
  const parsed = Math.max(0, parseFloat(val) || 0);
  appState.catalog[idx].quantity = parsed;
  renderCatalogItems();
  recalculateBudget();
  saveAllData(false);
}

function updateMarginFromSlider(val) {
  appState.budgetSettings.margin = parseInt(val, 10);
  document.getElementById('marginValueBadge').innerText = val + "%";
  recalculateBudget();
  saveAllData(false);
}

function recalculateBudget() {
  const margin = appState.budgetSettings.margin || 25;
  const bdi = appState.budgetSettings.bdi || 15;

  let totalDirectCost = 0;
  let totalBaseSale = 0;

  appState.catalog.forEach(item => {
    const q = item.quantity || 0;
    totalDirectCost += q * item.directCost;
    totalBaseSale += q * item.suggestedPrice;
  });

  const bdiCost = totalDirectCost * (bdi / 100);

  // Preço de venda ponderado pela margem (base: Custo Direto + BDI ajustado pela margem desejada)
  // Margem de Negociação entre 10% e 35%
  // Preço Final = (Custo Direto + BDI) / (1 - Margem/100)
  const factor = Math.max(0.01, 1 - (margin / 100));
  const finalSalePrice = (totalDirectCost + bdiCost) / factor;
  const profitExpected = finalSalePrice - totalDirectCost - bdiCost;

  document.getElementById('totalDirectCostDisplay').innerText = `R$ ${totalDirectCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  document.getElementById('totalBdiCostDisplay').innerText = `R$ ${bdiCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  document.getElementById('totalProfitExpectedDisplay').innerText = `R$ ${profitExpected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  document.getElementById('totalSalePriceDisplay').innerText = `R$ ${finalSalePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  // Alerta Visual de Margem Mínima < 12%
  const globalAlert = document.getElementById('globalMarginAlert');
  const warningBadge = document.getElementById('marginWarningBadge');

  if (margin < 12) {
    if (globalAlert) globalAlert.classList.remove('hidden');
    if (warningBadge) {
      warningBadge.className = "text-xs font-bold text-red-500 flex items-center animate-pulse";
      warningBadge.innerHTML = `<i data-lucide="alert-octagon" class="w-4 h-4 mr-1"></i> ⚠️ Risco Operacional (< 12%)`;
    }
  } else {
    if (globalAlert) globalAlert.classList.add('hidden');
    if (warningBadge) {
      warningBadge.className = "text-xs font-bold text-emerald-400 flex items-center";
      warningBadge.innerHTML = `<i data-lucide="check-circle-2" class="w-4 h-4 mr-1"></i> Margem Segura`;
    }
  }

  if (window.lucide) lucide.createIcons();
}

function calculateTotalSalePrice() {
  const margin = appState.budgetSettings.margin || 25;
  const bdi = appState.budgetSettings.bdi || 15;
  let totalDirectCost = 0;
  appState.catalog.forEach(item => {
    totalDirectCost += (item.quantity || 0) * item.directCost;
  });
  const bdiCost = totalDirectCost * (bdi / 100);
  const factor = Math.max(0.01, 1 - (margin / 100));
  return (totalDirectCost + bdiCost) / factor;
}

// ====================================================================
// MÓDULO 3: MEMORIAL DESCRITIVO AUTOMÁTICO
// ====================================================================
function updateMemorialContent() {
  const box = document.getElementById('memorialContentBox');
  if (!box) return;

  const activeItems = appState.catalog.filter(i => (i.quantity || 0) > 0);
  const client = appState.client;

  let html = `
    <div class="border-b border-slate-800 pb-4">
      <h3 class="text-xl font-black text-white">RESUMO TÉCNICO E ESPECIFICAÇÃO DE SERVIÇOS</h3>
      <p class="text-xs text-slate-400 mt-1">Obra: <strong class="text-white">${client.address || "Não informado"}</strong> | Cliente: <strong class="text-white">${client.name || "Não informado"}</strong></p>
    </div>

    <div class="space-y-4">
      <h4 class="text-sm font-bold text-brand-orange uppercase tracking-wider">1. Metodologia Executiva e Boas Práticas Construtivas</h4>
      <p class="text-xs sm:text-sm text-slate-300">
        Todos os serviços serão conduzidos rigorosamente em conformidade com as normas técnicas da ABNT (Associação Brasileira de Normas Técnicas), garantindo a estabilidade estrutural e a segurança das instalações prediais:
      </p>
      <ul class="list-disc pl-5 space-y-2 text-xs sm:text-sm text-slate-300">
        <li><strong>Preparo de Base e Nivelamento:</strong> Verificação prévia de esquadro, alinhamento ótico a laser e prumo das alvenarias. Todas as superfícies receptoras serão limpas, chapiscadas ou preparadas com promotores de aderência apropriados antes da aplicação de argamassas.</li>
        <li><strong>Cura Técnica e Tempos de Intervalo:</strong> Respeito absoluto aos tempos de cura química — mínimo de 14 dias para emboços antes de revestimentos cerâmicos, e 72 horas de cura da argamassa colante AC-III antes do rejuntamento, evitando descolamentos futuros.</li>
        <li><strong>Instalações Elétricas e Hidráulicas:</strong> Testes de estanqueidade hidrostática por 24 horas sob pressão antes do fechamento de tubulações embutidas; fiações dimensionadas conforme NBR 5410 com proteção contra fuga por DR.</li>
      </ul>
    </div>

    <div class="space-y-4">
      <h4 class="text-sm font-bold text-brand-blueLight uppercase tracking-wider">2. Relação de Serviços Orçados para a Obra</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
  `;

  if (activeItems.length === 0) {
    html += `<p class="text-xs text-amber-400 col-span-2">Nenhum item com quantidade lançada na calculadora. Lance as quantidades para visualizar as diretrizes técnicas.</p>`;
  } else {
    activeItems.forEach(item => {
      html += `
        <div class="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <div class="flex items-center justify-between text-xs font-bold text-slate-400">
            <span class="text-brand-orange">${item.code} (${item.discipline})</span>
            <span class="text-white">${item.quantity} ${item.unit}</span>
          </div>
          <h5 class="text-sm font-bold text-white mt-1">${item.name}</h5>
          <p class="text-xs text-slate-400 mt-1 leading-relaxed">${item.description}</p>
        </div>
      `;
    });
  }

  html += `
      </div>
    </div>

    <div class="space-y-4 pt-4 border-t border-slate-800">
      <h4 class="text-sm font-bold text-emerald-400 uppercase tracking-wider">3. Delimitação de Fornecimento de Materiais e Insumos</h4>
      <div class="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2 text-xs sm:text-sm">
        <p><strong>Por conta da ALEX CONSTRUÇÕES (Empreiteira):</strong> Toda a mão de obra especializada (mestres, pedreiros, eletricistas, encanadores e pintores), maquinários de corte, andaimes, betoneira, réguas de nível a laser, e insumos de fixação inicial.</p>
        <p><strong>Por conta do CONTRATANTE (Cliente):</strong> Fornecimento oportuno dos materiais de acabamento fino, incluindo: peças de porcelanato/cerâmica, louças sanitárias, torneiras e metais, luminárias e lustres, tomadas/espelhos decorativos e as tintas acrílicas nas cores de preferência.</p>
      </div>
    </div>

    <div class="space-y-3 pt-2">
      <h4 class="text-sm font-bold text-slate-300 uppercase tracking-wider">4. Critérios de Entrega e Limpeza Pós-Obra</h4>
      <p class="text-xs sm:text-sm text-slate-300">
        A entrega do imóvel ocorrerá após limpeza fina de obra, remoção total de resíduos e entulhos, com teste funcional de todos os pontos de iluminação, tomadas, ralos e fechamento de esquadrias, acompanhada de vistoria técnica presencial com o cliente.
      </p>
    </div>
  `;

  box.innerHTML = html;
}

function copyMemorialText() {
  const box = document.getElementById('memorialContentBox');
  if (!box) return;
  navigator.clipboard.writeText(box.innerText).then(() => {
    showToast("Memorial Descritivo copiado com sucesso!");
  });
}

function sendMemorialWhatsApp() {
  const c = appState.client;
  const phone = c.phone || "";
  const total = calculateTotalSalePrice();

  let text = `📋 *MEMORIAL DESCRITIVO & ESPECIFICAÇÃO TÉCNICA*\n*Alex Construções - Engenharia e Rigor*\n\nCliente: *${c.name}*\nObra: *${c.address}*\nValor Estimado: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n*Diretrizes e Escopo:*\n• Mão de obra qualificada e ferramentas sob responsabilidade da Alex Construções.\n• Respeito irrestrito aos tempos de cura técnica (rebocos e colagem AC-III).\n• Acabamentos finos (pisos, tintas, louças) sob responsabilidade do cliente.\n• Entrega com limpeza fina e vistoria técnica.\n\nMais detalhes disponíveis no contrato formal anexo! 🤝`;
  
  const encoded = encodeURIComponent(text);
  const targetUrl = phone ? `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}` : `https://api.whatsapp.com/send?text=${encoded}`;
  window.open(targetUrl, '_blank');
}

// ====================================================================
// MÓDULO 4: VISUALIZADOR 3D / THREE.JS & SLIDER ANTES VS DEPOIS
// ====================================================================
let scene, camera, renderer, controls;
let roofMesh, wallsGroup, floorMesh, openingsGroup;
let isVisualizer3dActive = true;

function initThreeJs() {
  const container = document.getElementById('threejsCanvas');
  if (!container || !window.THREE) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0f1d);

  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(12, 10, 14);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  if (window.THREE.OrbitControls) {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
  }

  // Iluminação
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xfff5ea, 1.2);
  dirLight.position.set(15, 25, 10);
  dirLight.castShadow = true;
  scene.add(dirLight);

  // Piso Porcelanato Retificado 80x80
  const floorGeo = new THREE.PlaneGeometry(10, 8);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xd8e0ea,
    roughness: 0.2,
    metalness: 0.1
  });
  floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  scene.add(floorMesh);

  // Grade de rejunte
  const grid = new THREE.GridHelper(10, 10, 0x1E3A8A, 0x94a3b8);
  grid.position.y = 0.01;
  scene.add(grid);

  // Paredes
  wallsGroup = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.8 });
  const darkSteelMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.8, roughness: 0.3 });

  // Parede Traseira
  const backWallGeo = new THREE.BoxGeometry(10, 3.5, 0.25);
  const backWall = new THREE.Mesh(backWallGeo, wallMat);
  backWall.position.set(0, 1.75, -4);
  backWall.castShadow = true;
  wallsGroup.add(backWall);

  // Parede Esquerda com abertura de Janela
  const leftWallPart1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.5, 2.5), wallMat);
  leftWallPart1.position.set(-5, 1.75, -2.75);
  wallsGroup.add(leftWallPart1);

  const leftWallPart2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.5, 2.5), wallMat);
  leftWallPart2.position.set(-5, 1.75, 2.75);
  wallsGroup.add(leftWallPart2);

  const leftWallPeitoril = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.2, 3), wallMat);
  leftWallPeitoril.position.set(-5, 0.6, 0);
  wallsGroup.add(leftWallPeitoril);

  const leftWallViga = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.8, 3), wallMat);
  leftWallViga.position.set(-5, 3.1, 0);
  wallsGroup.add(leftWallViga);

  // Vidro da Janela
  openingsGroup = new THREE.Group();
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.45, roughness: 0.1, transmission: 0.9 });
  const windowGlass = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.5, 2.8), glassMat);
  windowGlass.position.set(-5, 1.95, 0);
  openingsGroup.add(windowGlass);

  // Parede Direita com Vão de Porta
  const rightWallPart1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.5, 4.5), wallMat);
  rightWallPart1.position.set(5, 1.75, -1.75);
  wallsGroup.add(rightWallPart1);

  const rightWallVigaPorta = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.2, 2.2), wallMat);
  rightWallVigaPorta.position.set(5, 2.9, 2);
  wallsGroup.add(rightWallVigaPorta);

  // Moldura de Aço Estrutural Alex Construções
  const beamLeft = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.6, 0.35), darkSteelMat);
  beamLeft.position.set(-5, 1.8, 4);
  wallsGroup.add(beamLeft);

  const beamRight = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.6, 0.35), darkSteelMat);
  beamRight.position.set(5, 1.8, 4);
  wallsGroup.add(beamRight);

  scene.add(wallsGroup);
  scene.add(openingsGroup);

  // Laje / Teto Concreto
  const roofGeo = new THREE.BoxGeometry(10.4, 0.3, 8.4);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
  roofMesh = new THREE.Mesh(roofGeo, roofMat);
  roofMesh.position.set(0, 3.65, 0);
  roofMesh.castShadow = true;
  scene.add(roofMesh);

  // Loop de Animação
  function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

function toggle3dElement(elem) {
  if (elem === 'roof' && roofMesh) {
    roofMesh.visible = !roofMesh.visible;
    const btn = document.getElementById('toggle-roof-btn');
    if (btn) btn.innerText = roofMesh.visible ? "Ocultar Laje" : "Exibir Laje";
  } else if (elem === 'doors' && openingsGroup) {
    openingsGroup.visible = !openingsGroup.visible;
    const btn = document.getElementById('toggle-doors-btn');
    if (btn) btn.innerText = openingsGroup.visible ? "Ocultar Aberturas" : "Exibir Aberturas";
  }
}

function reset3dCamera() {
  if (camera && controls) {
    camera.position.set(12, 10, 14);
    controls.target.set(0, 1.5, 0);
    controls.update();
  }
}

function switchVisualizerMode(mode) {
  const container3d = document.getElementById('container-3d');
  const containerSlider = document.getElementById('container-slider');
  const btn3d = document.getElementById('btn-vis-3d');
  const btnSlider = document.getElementById('btn-vis-slider');

  if (mode === '3d') {
    container3d.classList.remove('hidden');
    containerSlider.classList.add('hidden');
    btn3d.className = "touch-btn px-5 py-2.5 rounded-xl font-black text-sm bg-brand-blue text-white shadow-md";
    btnSlider.className = "touch-btn px-5 py-2.5 rounded-xl font-black text-sm bg-slate-800 text-slate-400 hover:text-white";
    isVisualizer3dActive = true;
    setTimeout(() => {
      if (renderer && camera) {
        const c = document.getElementById('threejsCanvas');
        camera.aspect = c.clientWidth / c.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(c.clientWidth, c.clientHeight);
      }
    }, 50);
  } else {
    container3d.classList.add('hidden');
    containerSlider.classList.remove('hidden');
    btnSlider.className = "touch-btn px-5 py-2.5 rounded-xl font-black text-sm bg-brand-blue text-white shadow-md";
    btn3d.className = "touch-btn px-5 py-2.5 rounded-xl font-black text-sm bg-slate-800 text-slate-400 hover:text-white";
    isVisualizer3dActive = false;
  }
}

function updateBeforeAfterSlider(val) {
  const overlay = document.getElementById('beforeImageOverlay');
  const handle = document.getElementById('sliderHandle');
  if (overlay) overlay.style.width = val + "%";
  if (handle) handle.style.left = val + "%";
}

// ====================================================================
// MÓDULO 5: CONTRATO BLINDADO & ASSINATURA TOUCH DIGITAL
// ====================================================================
function updateContractDocument() {
  const c = appState.client;
  const total = calculateTotalSalePrice();

  document.getElementById('contractClientNameDisplay').innerText = c.name || "Não informado";
  document.getElementById('contractClientCpfDisplay').innerText = c.cpf || "Não informado";
  document.getElementById('contractClientAddressDisplay').innerText = c.address || "Não informado";
  document.getElementById('contractClientPhoneDisplay').innerText = c.phone || "Não informado";
  document.getElementById('contractStartDateDisplay').innerText = c.startDate || "Imediato";
  document.getElementById('contractClientSignatory').innerText = c.name ? c.name.toUpperCase() : "CONTRATANTE";

  document.getElementById('contractTotalValueDisplay').innerText = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const p30 = total * 0.30;
  const p10 = total * 0.10;

  document.getElementById('contractPart1').innerText = `R$ ${p30.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  document.getElementById('contractPart2').innerText = `R$ ${p30.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  document.getElementById('contractPart3').innerText = `R$ ${p30.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  document.getElementById('contractPart4').innerText = `R$ ${p10.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const list = document.getElementById('contractServicesList');
  if (list) {
    list.innerHTML = "";
    appState.catalog.filter(i => (i.quantity || 0) > 0).forEach(item => {
      const p = document.createElement('p');
      p.innerHTML = `• <strong>${item.code} - ${item.name}</strong> (${item.quantity} ${item.unit}): ${item.description}`;
      list.appendChild(p);
    });
  }
}

let sigCanvas, sigCtx;
let isDrawing = false;

function initSignatureCanvas() {
  sigCanvas = document.getElementById('signatureCanvas');
  if (!sigCanvas) return;
  sigCtx = sigCanvas.getContext('2d');
  sigCtx.strokeStyle = '#0f172a';
  sigCtx.lineWidth = 2.5;
  sigCtx.lineCap = 'round';

  const getPos = (e) => {
    const rect = sigCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (sigCanvas.width / rect.width),
      y: (clientY - rect.top) * (sigCanvas.height / rect.height)
    };
  };

  const start = (e) => {
    isDrawing = true;
    const pos = getPos(e);
    sigCtx.beginPath();
    sigCtx.moveTo(pos.x, pos.y);
    e.preventDefault();
  };

  const move = (e) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    sigCtx.lineTo(pos.x, pos.y);
    sigCtx.stroke();
    e.preventDefault();
  };

  const end = () => {
    isDrawing = false;
  };

  sigCanvas.addEventListener('mousedown', start);
  sigCanvas.addEventListener('mousemove', move);
  sigCanvas.addEventListener('mouseup', end);
  sigCanvas.addEventListener('touchstart', start, { passive: false });
  sigCanvas.addEventListener('touchmove', move, { passive: false });
  sigCanvas.addEventListener('touchend', end);

  // Restaura assinatura anterior se houver
  if (appState.contract && appState.contract.signatureBase64) {
    const img = new Image();
    img.onload = () => {
      sigCtx.drawImage(img, 0, 0);
      const printImg = document.getElementById('printSignatureImg');
      if (printImg) {
        printImg.src = appState.contract.signatureBase64;
        document.getElementById('printSignatureContainer').classList.remove('hidden');
      }
      document.getElementById('contractSignatureStatus').innerText = `✅ Assinado digitalmente em: ${appState.contract.signedAt}`;
    };
    img.src = appState.contract.signatureBase64;
  }
}

function clearSignatureCanvas() {
  if (sigCtx && sigCanvas) {
    sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
    appState.contract.signatureBase64 = "";
    appState.contract.signedAt = "";
    appState.contract.clientSigned = false;
    document.getElementById('contractSignatureStatus').innerText = "Aguardando assinatura digital na tela...";
    document.getElementById('printSignatureContainer').classList.add('hidden');
    saveAllData(false);
  }
}

function saveContractSignature() {
  if (!sigCanvas) return;
  const dataUrl = sigCanvas.toDataURL('image/png');
  const now = new Date().toLocaleString('pt-BR');

  appState.contract.signatureBase64 = dataUrl;
  appState.contract.signedAt = now;
  appState.contract.clientSigned = true;

  const printImg = document.getElementById('printSignatureImg');
  if (printImg) {
    printImg.src = dataUrl;
    document.getElementById('printSignatureContainer').classList.remove('hidden');
  }

  document.getElementById('contractSignatureStatus').innerText = `✅ Assinado digitalmente em: ${now}`;
  saveAllData(true);

  if (window.confetti) {
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
  }
}

// ====================================================================
// MÓDULO 6: RECIBOS, SALDOS & FINANCEIRO
// ====================================================================
function renderFinancials() {
  const totalFechado = calculateTotalSalePrice();

  let totalPago = 0;
  appState.financials.receipts.forEach(r => {
    totalPago += parseFloat(r.amount) || 0;
  });

  let totalGastos = 0;
  appState.financials.expenses.forEach(e => {
    totalGastos += parseFloat(e.amount) || 0;
  });

  const saldoDevedor = Math.max(0, totalFechado - totalPago);
  const lucroRealizado = totalPago - totalGastos;

  document.getElementById('kpiTotalFechado').innerText = `R$ ${totalFechado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  document.getElementById('kpiTotalPago').innerText = `R$ ${totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  document.getElementById('kpiSaldoDevedor').innerText = `R$ ${saldoDevedor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  document.getElementById('kpiGastosCanteiro').innerText = `R$ ${totalGastos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  document.getElementById('kpiLucroRealizado').innerText = `R$ ${lucroRealizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  // Renderiza Histórico de Recibos
  const receiptsList = document.getElementById('receiptsHistoryList');
  if (receiptsList) {
    receiptsList.innerHTML = "";
    if (appState.financials.receipts.length === 0) {
      receiptsList.innerHTML = `<p class="text-xs text-slate-500 py-2">Nenhum recibo emitido ainda.</p>`;
    } else {
      appState.financials.receipts.slice().reverse().forEach((rec, idx) => {
        const item = document.createElement('div');
        item.className = "bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between";
        item.innerHTML = `
          <div>
            <span class="text-[10px] font-bold text-emerald-400 uppercase">${rec.stage} (${rec.method})</span>
            <h5 class="text-sm font-bold text-white">${rec.clientName}</h5>
            <span class="text-[11px] text-slate-400">${rec.date} | Saldo Restante: R$ ${rec.remainingBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="text-right">
            <span class="text-base font-black text-emerald-400">R$ ${rec.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        `;
        receiptsList.appendChild(item);
      });
    }
  }

  // Renderiza Histórico de Despesas de Canteiro
  const expensesList = document.getElementById('expensesHistoryList');
  if (expensesList) {
    expensesList.innerHTML = "";
    if (appState.financials.expenses.length === 0) {
      expensesList.innerHTML = `<p class="text-xs text-slate-500 py-2">Nenhum gasto de canteiro registrado.</p>`;
    } else {
      appState.financials.expenses.slice().reverse().forEach(exp => {
        const item = document.createElement('div');
        item.className = "bg-slate-950 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs";
        item.innerHTML = `
          <div>
            <span class="font-bold text-slate-300">${exp.description}</span>
            <span class="text-[10px] text-slate-500 block">${exp.date} • ${exp.category}</span>
          </div>
          <span class="font-black text-red-400">R$ ${exp.amount.toFixed(2).replace('.', ',')}</span>
        `;
        expensesList.appendChild(item);
      });
    }
  }

  updateReceiptPreview();
}

function updateReceiptPreview() {
  const val = parseFloat(document.getElementById('receiptAmountInput').value) || 0;
  const stage = document.getElementById('receiptStageSelect').value;
  const clientName = appState.client.name || "[Nome do Cliente]";
  const totalFechado = calculateTotalSalePrice();

  let totalPago = 0;
  appState.financials.receipts.forEach(r => totalPago += (parseFloat(r.amount) || 0));
  const saldoRestante = Math.max(0, totalFechado - (totalPago + val));

  const text = `Recebemos de *${clientName}* a quantia de *R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}* referente à etapa *${stage}* da Alex Construções. Saldo restante: *R$ ${saldoRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*.`;
  const preview = document.getElementById('receiptTextPreview');
  if (preview) {
    preview.innerText = `"${text}"`;
  }
}

document.addEventListener('input', (e) => {
  if (e.target.id === 'receiptAmountInput' || e.target.id === 'receiptStageSelect') {
    updateReceiptPreview();
  }
});

function emitAndSendReceipt() {
  const amount = parseFloat(document.getElementById('receiptAmountInput').value) || 0;
  if (amount <= 0) {
    alert("Por favor, preencha o valor recebido.");
    return;
  }

  const method = document.getElementById('receiptPaymentMethod').value;
  const stage = document.getElementById('receiptStageSelect').value;
  const clientName = appState.client.name || "Cliente";
  const totalFechado = calculateTotalSalePrice();

  let totalPagoAnterior = 0;
  appState.financials.receipts.forEach(r => totalPagoAnterior += (parseFloat(r.amount) || 0));
  const saldoRestante = Math.max(0, totalFechado - (totalPagoAnterior + amount));

  const newReceipt = {
    id: "REC-" + Date.now().toString().slice(-4),
    date: new Date().toLocaleDateString('pt-BR'),
    clientName: clientName,
    stage: stage,
    amount: amount,
    method: method,
    remainingBalance: saldoRestante
  };

  appState.financials.receipts.push(newReceipt);
  saveAllData(true);
  renderFinancials();

  // Limpa o input
  document.getElementById('receiptAmountInput').value = "";

  // Disparo WhatsApp
  const phone = appState.client.phone || "";
  const msg = `Recebemos de *${clientName}* a quantia de *R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}* referente à etapa *${stage}* da Alex Construções. Saldo restante: *R$ ${saldoRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*.\n\nForma de Pagamento: ${method}.\nAgradecemos a confiança! 🤝🛠️`;
  const encoded = encodeURIComponent(msg);
  const targetUrl = phone ? `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}` : `https://api.whatsapp.com/send?text=${encoded}`;
  window.open(targetUrl, '_blank');
}

function addSiteExpense() {
  const desc = document.getElementById('expenseDescInput').value.trim();
  const cat = document.getElementById('expenseCategoryInput').value;
  const amount = parseFloat(document.getElementById('expenseAmountInput').value) || 0;

  if (!desc || amount <= 0) {
    alert("Preencha a descrição e o valor do gasto de canteiro.");
    return;
  }

  const newExp = {
    id: "EXP-" + Date.now().toString().slice(-4),
    date: new Date().toLocaleDateString('pt-BR'),
    description: desc,
    category: cat,
    amount: amount
  };

  appState.financials.expenses.push(newExp);
  saveAllData(true);
  renderFinancials();

  document.getElementById('expenseDescInput').value = "";
  document.getElementById('expenseAmountInput').value = "";
  showToast("Despesa de canteiro lançada com sucesso!");
}

// ====================================================================
// MODAL QR CODE (ACESSO MOBILE)
// ====================================================================
let qrCodeInstance = null;

function openQrModal() {
  const modal = document.getElementById('qrModal');
  const targetUrl = serverInfo.mobile_url || window.location.href;

  document.getElementById('mobileUrlDisplay').innerText = targetUrl;
  modal.classList.remove('hidden');

  const container = document.getElementById('qrcodeDisplay');
  container.innerHTML = "";

  if (window.QRCode) {
    qrCodeInstance = new QRCode(container, {
      text: targetUrl,
      width: 180,
      height: 180,
      colorDark: "#0f172a",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  }
}

function closeQrModal() {
  const modal = document.getElementById('qrModal');
  modal.classList.add('hidden');
}

function copyMobileUrl() {
  const url = document.getElementById('mobileUrlDisplay').innerText;
  navigator.clipboard.writeText(url).then(() => {
    showToast("Link copiado para a área de transferência!");
  });
}

// ====================================================================
// MODAL NOVO ITEM PERSONALIZADO
// ====================================================================
function openNewItemModal() {
  document.getElementById('newItemModal').classList.remove('hidden');
}

function closeNewItemModal() {
  document.getElementById('newItemModal').classList.add('hidden');
}

function saveNewCustomItem() {
  const code = document.getElementById('newCodeInput').value.trim();
  const disc = document.getElementById('newDisciplineInput').value;
  const name = document.getElementById('newNameInput').value.trim();
  const unit = document.getElementById('newUnitInput').value;
  const cost = parseFloat(document.getElementById('newCostInput').value) || 0;
  const price = parseFloat(document.getElementById('newPriceInput').value) || 0;
  const desc = document.getElementById('newDescInput').value.trim();

  if (!code || !name || price <= 0) {
    alert("Preencha Código, Nome e Preço de Venda.");
    return;
  }

  appState.catalog.push({
    code: code.toUpperCase(),
    discipline: disc,
    name: name,
    unit: unit,
    directCost: cost,
    suggestedPrice: price,
    quantity: 1,
    description: desc || name
  });

  saveAllData(true);
  renderCatalogItems();
  recalculateBudget();
  closeNewItemModal();
  showToast(`Item ${code} cadastrado com sucesso!`);
}
