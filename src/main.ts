import { createApp } from "vue";
import App from "./App.vue";

import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";

// ─── Ordem das camadas CSS ───────────────────────────────────────────────────
// Deve vir ANTES de qualquer import de .css para que o navegador respeite
// a prioridade correta entre reset, primevue e seus estilos locais.
import "./style.css";

import "primeicons/primeicons.css";

// componentes
import DataTable   from "primevue/datatable";
import Column      from "primevue/column";
import Select      from "primevue/select";
import Checkbox    from "primevue/checkbox";
import Button      from "primevue/button";
import InputNumber from "primevue/inputnumber";

const app = createApp(App);

app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: Aura,
    options: {
      // cssLayer: true faz o PrimeVue colocar seus estilos numa @layer,
      // deixando seus estilos locais (sem @layer) sempre com prioridade maior.
      cssLayer: {
        name: "primevue",
        order: "reset, primevue",   // ← define a cascata explicitamente
      },
    },
  },
});

// componentes globais
app.component("DataTable",   DataTable);
app.component("Column",      Column);
app.component("Select",      Select);
app.component("Checkbox",    Checkbox);
app.component("Button",      Button);
app.component("InputNumber", InputNumber);

app.mount("#app");
