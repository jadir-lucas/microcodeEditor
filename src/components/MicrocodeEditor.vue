<script lang="ts">
import { defineComponent, ref, computed } from "vue";

interface Config {
  rom: { address_bits: number; word_size: number };
  signals: Record<string, any>;
  action?: any;
  next_address?: any;
}

interface Row {
  label?: string;
  action?: number;
  next?: string | number;
  signals: Record<string, any>;
}

export default defineComponent({
  name: "MicrocodeEditor",

  setup() {
    const config = ref<Config | null>(null);
    const microcode = ref<Row[]>([]);

    const loadJSON = (event: any) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const json = JSON.parse(e.target.result);
          config.value = json;
          microcode.value = [];
        } catch {
          alert("Erro ao ler JSON");
        }
      };
      reader.readAsText(file);
    };

    const addRow = () => {
      microcode.value.push({
        label: "",
        action: undefined,
        next: undefined,
        signals: {}
      });

      setTimeout(() => {
        const container = document.getElementById("table-container");
        if (container) container.scrollTop = container.scrollHeight;
      });
    };

    const labels = computed(() =>
      microcode.value
        .map(r => r.label)
        .filter(l => l && l.length > 0)
        .map(l => ({ label: l, value: l }))
    );

    const resolveValues = (def: any) => {
      if (def.values === "@Asel") {
        return config.value?.signals["Asel"].values;
      }
      return def.values;
    };

    const updateSignal = (row: Row, signal: string, value: any) => {
      row.signals[signal] = value;
    };

    const exportJSON = () => {
      const blob = new Blob(
        [JSON.stringify(microcode.value, null, 2)],
        { type: "application/json" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "microcode.json";
      a.click();
    };

    const showNextField = (row: Row) => {
      if (!config.value?.action) return false;
      const values = config.value.action.Values;
      const selected = Object.entries(values).find(([, v]) => v === row.action);
      if (!selected) return false;
      const name = selected[0];
      return name === "GOTO" || name.startsWith("if");
    };

    return {
      config,
      microcode,
      loadJSON,
      addRow,
      resolveValues,
      updateSignal,
      exportJSON,
      showNextField,
      labels
    };
  }
});
</script>

<template>
  <div class="editor-shell">

    <!-- HEADER -->
    <header class="editor-header">
      <h2 class="editor-title">Microcode Editor</h2>
      <div class="editor-actions">
        <label class="file-label">
          <span class="pi pi-upload" style="margin-right: 6px;"></span>
          Carregar JSON
          <input type="file" accept=".json" @change="loadJSON" hidden />
        </label>
        <Button label="Add Row"    icon="pi pi-plus"     @click="addRow"      :disabled="!config" />
        <Button label="Export JSON" icon="pi pi-download" @click="exportJSON"  :disabled="!config" severity="secondary" />
      </div>
    </header>

    <!-- CONTEÚDO -->
    <main id="table-container" class="editor-main">

      <!-- Estado vazio: sem config carregada -->
      <div v-if="!config" class="empty-state">
        <span class="pi pi-file-import empty-icon"></span>
        <p>Carregue um arquivo JSON de configuração para começar.</p>
      </div>

      <!-- Config carregada mas sem linhas -->
      <div v-else-if="microcode.length === 0" class="empty-state">
        <span class="pi pi-table empty-icon"></span>
        <p>Nenhuma instrução ainda. Clique em <strong>Add Row</strong> para adicionar.</p>
      </div>

      <!-- Tabela com dados -->
      <DataTable
        v-else
        :value="microcode"
        scrollable
        scrollHeight="flex"
        class="p-datatable-sm"
      >
        <!-- LABEL -->
        <Column header="Label" style="min-width: 140px">
          <template #body="slotProps">
            <Select
              v-model="slotProps.data.label"
              :options="labels"
              optionLabel="label"
              optionValue="value"
              editable
              class="w-full"
            />
          </template>
        </Column>

        <!-- ACTION -->
        <Column header="Action" style="min-width: 160px" v-if="config.action">
          <template #body="slotProps">
            <Select
              :options="Object.entries(config.action.Values).map(([k,v]) => ({ label: k, value: v }))"
              optionLabel="label"
              optionValue="value"
              v-model="slotProps.data.action"
              class="w-full"
            />
          </template>
        </Column>

        <!-- NEXT ADDRESS -->
        <Column header="Next" style="min-width: 140px" v-if="config.next_address">
          <template #body="slotProps">
            <Select
              v-if="showNextField(slotProps.data)"
              v-model="slotProps.data.next"
              :options="labels"
              optionLabel="label"
              optionValue="value"
              editable
              class="w-full"
            />
          </template>
        </Column>

        <!-- SIGNALS -->
        <Column
          v-for="(def, sig) in config.signals"
          :key="sig"
          :header="sig"
          style="min-width: 120px"
        >
          <template #body="slotProps">
            <Select
              v-if="def.values"
              :options="Object.entries(resolveValues(def)).map(([k,v]) => ({ label: k, value: v }))"
              optionLabel="label"
              optionValue="value"
              class="w-full"
              :modelValue="slotProps.data.signals[sig]"
              @update:modelValue="(val: number) => updateSignal(slotProps.data, sig, val)"
            />
            <Checkbox
              v-else
              :binary="true"
              :modelValue="slotProps.data.signals[sig] || false"
              @update:modelValue="(val: boolean) => updateSignal(slotProps.data, sig, val)"
            />
          </template>
        </Column>
      </DataTable>
    </main>

    <!-- FOOTER -->
    <footer class="editor-footer">
      © 2026 Jadir Eduardo Souza Lucas — Universidade Federal do Espírito Santo (UFES) |
      Email: jadir.lucas@ufes.br | Telegram: @profjadirlucas
    </footer>

  </div>
</template>

<style scoped>
/*
  Layout principal: ocupa 100% da viewport.
  Não depende de Tailwind — funciona com ou sem ele.
*/
.editor-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;        /* altura total da janela */
  overflow: hidden;     /* impede scroll no shell; só o main scrolla */
  font-family: var(--p-font-family, system-ui, sans-serif);
  background: var(--p-surface-ground, #f8f9fa);
  color: var(--p-text-color, #1a1a1a);
}

/* ── Header ── */
.editor-header {
  flex-shrink: 0;       /* nunca encolhe */
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  background: var(--p-surface-0, #ffffff);
  border-bottom: 1px solid var(--p-surface-200, #e2e8f0);
  box-shadow: 0 1px 4px rgba(0,0,0,.06);
}

.editor-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.file-label {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  padding: 0.375rem 0.75rem;
  border-radius: var(--p-border-radius, 6px);
  border: 1px solid var(--p-primary-color, #6366f1);
  color: var(--p-primary-color, #6366f1);
  font-size: 0.875rem;
  transition: background 0.15s;
}
.file-label:hover {
  background: var(--p-primary-50, #eef2ff);
}

/* ── Main (área scrollável) ── */
.editor-main {
  flex: 1;              /* ocupa todo o espaço sobrante entre header e footer */
  overflow: auto;       /* scroll só aqui */
  min-height: 0;        /* correção crítica em flex: sem isso, flex-item não encolhe */
}

/* Estado vazio */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 0.75rem;
  color: var(--p-text-muted-color, #64748b);
  font-size: 0.95rem;
}
.empty-icon {
  font-size: 2.5rem;
  opacity: 0.4;
}

/* ── Footer ── */
.editor-footer {
  flex-shrink: 0;       /* nunca encolhe */
  padding: 0.6rem 1.25rem;
  background: var(--p-surface-100, #f1f5f9);
  border-top: 1px solid var(--p-surface-200, #e2e8f0);
  font-size: 0.75rem;
  color: var(--p-text-muted-color, #64748b);
  text-align: center;
}
</style>