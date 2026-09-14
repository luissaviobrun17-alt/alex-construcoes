# Alex Construções - Sistema Operacional de Obras 🏗️

> **Sistema Operacional Mobile-First e Desktop para Engenharia Civil, Orçamentação Paramétrica, Memorial Descritivo, Modelagem 3D, Contrato com Blindagem Jurídica e Gestão Financeira.**

Desenvolvido especialmente para operação em campo sem atrito técnico e sincronização em tempo real entre smartphones e computadores.

---

## 📐 Funcionalidades Principais

1. **Identidade Visual & Logomarca SVG**:
   * Pórtico estrutural em **A** em Aço Escuro (`#1E293B`).
   * Escoras de sustentação simétricas em perfil estilizado **Y** (alusão aos filhos e continuidade familiar) em Laranja Canteiro (`#EA580C`).
   * Paleta técnica: Azul Aço (`#1E3A8A`), Laranja Segurança (`#EA580C`) e Cinza Concreto (`#F1F5F9`).

2. **📱 [CLIENTE & WHATSAPP]**:
   * Cadastro ágil de clientes e escopo da obra.
   * Central de disparo com 1 clique para WhatsApp (Boas-Vindas, Envio de Orçamento e Notificação de Medição).

3. **📐 [CALCULADORA DE MEDIÇÃO & MOTOR PARAMÉTRICO]**:
   * Calculadora $L \times C \to \text{m}²$ instantânea.
   * Composições técnicas oficiais:
     * `CIV-01` - Alvenaria de vedação c/ bloco cerâmico (m²)
     * `CIV-02` - Reboco paulista / emboço sarrafeado (m²)
     * `CIV-03` - Assentamento de porcelanato retificado até 80x80 (m²)
     * `ELE-01` - Ponto de força / iluminação embutida (un)
     * `ELE-02` - Montagem de QDC completo (un)
     * `HID-01` - Ponto de água fria/esgoto PPR/PVC (un)
     * `PIN-01` - Emassamento e pintura acrílica fosca (m²)
   * Fórmulas: Custo Direto, BDI (15%), Slider de Margem de Negociação (10% a 35%).
   * **Tarja Vermelha de Alerta**: Aviso imediato de *Risco Operacional* se a margem for $< 12\%$.

4. **📋 [MEMORIAL DESCRITIVO AUTOMÁTICO]**:
   * Tradução dos itens técnicos para linguagem clara com normas ABNT (NBR 13755, NBR 5410, NBR 5626).
   * Delimitação expressa de fornecimento (mão de obra e ferramentas pela empreiteira; acabamentos finos pelo cliente).

5. **🏠 [VISUALIZADOR 3D / FOTOS]**:
   * Maquete volumétrica 3D interativa em **Three.js** (WebGL) com paredes, aberturas, laje removível e piso porcelanato com controles touch e mouse.
   * Comparador **Antes vs. Depois** com barra deslizante interativa.

6. **✍️ [CONTRATO BLINDADO COM ASSINATURA NA TELA]**:
   * Minuta jurídica completa com **Art. 618 do Código Civil Brasileiro** (garantia de 5 anos).
   * Cláusula Climática e de Fornecimento contra chuvas torrenciais ou atrasos de materiais.
   * Cronograma de pagamento: 30% Entrada, 30% Medição 1, 30% Medição 2 e 10% Entrega.
   * Assinatura digital direta na tela (Touch Canvas) e geração de PDF/Impressão.

7. **💰 [RECIBOS & SALDOS]**:
   * Painel de Bordo: Total Fechado, Total Pago, Saldo Devedor, Gastos de Canteiro e Lucro Realizado.
   * Emissor de Recibo em 1 Clique com disparo formatado no WhatsApp.

8. **🔄 SINCRONIZAÇÃO NUVEM LOCAL & OFFLINE-FIRST**:
   * PWA com Service Worker (`sw.js`) e LocalStorage.
   * Servidor Python (`server.py`) com API REST (`/api/data`) sincronizando o PC e o Smartphone em tempo real via Wi-Fi.
   * Modal de conexão com **QR Code** integrado.

---

## 🚀 Como Executar

### Pré-requisitos
* Python 3.10+ (qualquer versão moderna).

### Inicialização Rápida
```bash
python server.py
```
O servidor inicializará nas seguintes portas:
* **Computador:** `http://localhost:8000`
* **Celular (mesmo Wi-Fi):** `http://<seu-ip-local>:8000`
