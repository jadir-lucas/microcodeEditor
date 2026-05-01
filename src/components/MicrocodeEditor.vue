<script lang="ts">
import { defineComponent, ref } from "vue";

interface Config {
  rom: { address_bits: number; word_size: number };
  signals: Record<string, any>;
  action?: any;
  next_address?: any;
}

interface Row {
  label?: string;
  action?: number;
  next?: number;
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
    };

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
      const selected = Object.entries(values).find(
        ([, v]) => v === row.action
      );

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
      showNextField
    };
  }
});
</script>

<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-3">Microcode Editor</h2>

    <!-- Upload -->
    <input type="file" accept=".json" @change="loadJSON" />

    <div v-if="config" class="mt-4">

      <!-- Add Row -->
      <Button label="Add Row" icon="pi pi-plus" @click="addRow" class="mb-3" />

      <!-- Tabela -->
      <DataTable :value="microcode" class="p-datatable-sm">

        <!-- LABEL -->
        <Column header="Label">
          <template #body="slotProps">
            <InputText v-model="slotProps.data.label" class="w-full" />
          </template>
        </Column>

        <!-- ACTION -->
        <Column header="Action">
          <template #body="slotProps">
            <Dropdown
              :options="Object.entries(config.action.Values).map(([k,v]) => ({ label: k, value: v }))"
              optionLabel="label"
              optionValue="value"
              class="w-full"
              v-model="slotProps.data.action"
            />
          </template>
        </Column>

        <!-- NEXT ADDRESS -->
        <Column header="Next" v-if="config.next_address">
          <template #body="slotProps">
            <InputNumber
              v-if="showNextField(slotProps.data)"
              v-model="slotProps.data.next"
              :min="0"
              class="w-full"
            />
          </template>
        </Column>

        <!-- SIGNALS -->
        <Column
          v-for="(def, sig) in config.signals"
          :key="sig"
          :header="sig"
        >
          <template #body="slotProps">

            <!-- ENUM -->
            <Dropdown
              v-if="def.values"
              :options="Object.entries(resolveValues(def)).map(([k,v]) => ({ label: k, value: v }))"
              optionLabel="label"
              optionValue="value"
              class="w-full"
              :modelValue="slotProps.data.signals[sig]"
              @update:modelValue="(val: number) => updateSignal(slotProps.data, sig, val)"
            />

            <!-- BOOLEAN -->
            <Checkbox
              v-else
              :binary="true"
              :modelValue="slotProps.data.signals[sig] || false"
              @update:modelValue="(val: boolean) => updateSignal(slotProps.data, sig, val)"
            />

          </template>
        </Column>
      </DataTable>

      <!-- Export -->
      <Button label="Export JSON" icon="pi pi-download" class="mt-4" @click="exportJSON" />

    </div>
  </div>
</template>