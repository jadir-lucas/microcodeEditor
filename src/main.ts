import { createApp } from "vue";
import App from "./App.vue";

import PrimeVue from "primevue/config";

import Aura from "@primeuix/themes/aura";

import "primeicons/primeicons.css";

// componentes
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Dropdown from "primevue/dropdown";
import Checkbox from "primevue/checkbox";
import Button from "primevue/button";
import InputNumber from "primevue/inputnumber";

// estilos (não esqueça)
// import "primevue/resources/themes/lara-light-blue/theme.css";
// import "primevue/resources/primevue.min.css";
// import "primeicons/primeicons.css";

// 🔥 AQUI estava faltando
const app = createApp(App);



// plugins
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
});

// componentes globais
app.component("DataTable", DataTable);
app.component("Column", Column);
app.component("Dropdown", Dropdown);
app.component("Checkbox", Checkbox);
app.component("Button", Button);
app.component("InputNumber", InputNumber);

// mount
app.mount("#app");