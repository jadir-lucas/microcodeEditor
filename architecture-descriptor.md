# Documentação do Esquema JSON de Microcódigo

Este documento descreve a estrutura, os campos e as regras de validação para o arquivo JSON responsável por definir a arquitetura e os sinais de controle (microcódigo) de um processador ou unidade de controle.

---

## 1. Estrutura Raiz

O JSON é composto pelas seguintes seções principais na raiz do documento. A presença de cada seção obedece a regras de obrigatoriedade:

* **`rom`**: Obrigatório
* **`next_address`**: Obrigatório
* **`reserved`**: Opcional
* **`opcode`**: Opcional
* **`flag`**: Opcional
* **`action`**: Obrigatório
* **`signals`**: Obrigatório

---

## 2. Detalhamento dos Campos

### `rom` *(Obrigatório)*
Define as dimensões e propriedades da memória ROM do microcódigo.
* **`address_bits`** (Inteiro): Define a quantidade de *bits* usados para o endereçamento da ROM.
* **`word_size`** (Inteiro): Define o tamanho (em *bits*) de cada palavra/microinstrução na ROM.

### `next_address` *(Obrigatório)*
Define a localização e as propriedades do campo de próximo endereço na microinstrução.
* **`bits`** (*Array* de 2 inteiros `[início, fim]`): Indica o intervalo de *bits* reservado para o próximo endereço.
    * **Regra Importante:** O número total de *bits* definidos neste intervalo (calculado por `fim - início + 1`) **deve ser obrigatoriamente igual** ao valor definido em `rom.address_bits`.
* **`overlaped`** (Booleano): Indica se este campo se sobrepõe a outros campos na microinstrução.

### `reserved` *(Opcional)*
Uma lista (*Array*) reservada para uso futuro ou blocos de *bits* não utilizados. Pode ser deixada vazia.

### `opcode` *(Opcional)*
Mapeia o campo da instrução que contém o código de operação e define seus mnemônicos associados.
* **`bits`** (*Array* de 2 inteiros `[início, fim]`): Indica o intervalo de *bits* que compõe o *opcode* na instrução.
* **`mnemonics`** (*Array* de objetos): Lista das instruções suportadas pela arquitetura. Cada objeto deve conter:
    * **`name`** (*String*): O nome ou mnemônico da instrução (ex: `"LD"`, `"NOP"`).
    * **`value`** (*String*): A representação binária do *opcode*. **Nota:** Suporta o caractere `"x"` para representar *bits* *"don't care"* (não importa o valor), permitindo o mapeamento de famílias de instruções (ex: `"00100xxx"`).
    * **`description`** (*String*): Descrição textual do comportamento da instrução.

### `flag` *(Opcional)*
Uma lista (*Array*) de objetos que mapeia as *flags* de *status* individuais da Unidade Lógica e Aritmética (ALU). Cada objeto define uma *flag* específica:
* **`name`** (*String*): O nome identificador da *flag* (ex: `"C"`, `"Z"`, `"N"`, `"V"`).
* **`bit`** (inteiro): Indica a posição exata (índice) do *bit* correspondente à *flag* no barramento ou registrador de *status*.
* **`description`** (*String*): Descrição textual da condição que aciona a *flag*.

### `action` *(Obrigatório)*
Define o campo de ações de fluxo de controle do microcódigo (saltos, dispatches, condicionais).
* **`bits`** (*Array* de 2 inteiros `[início, fim]`): Indica a posição do campo na microinstrução.
* **`values`** (Objeto): Contém o mapeamento de ações.
    * **Regra Importante:** Os elementos de `values` são opcionais, mas se presentes, devem sempre assumir nomes dentro de um conjunto fixo de possibilidades estritamente definido: `"NEXT"`, `"BEGIN"`, `"DISPATCH"`, `"GOTO"`, `"ifCgoto"`, `"ifZgoto"`, `"ifNgoto"`, `"ifVgoto"`, `"ifNCgoto"`, `"ifNZgoto"`, `"ifNNgoto"`, `"ifNVgoto"`, `"ifCexec"`, `"ifZexec"`, `"ifNexec"`, `"ifVexec"`. Cada chave recebe um número inteiro único associado.

### `signals` *(Obrigatório)*
Define todos os sinais de controle gerados pela palavra de microcódigo que atuarão sobre o hardware (registradores, ALU, memória, etc.).
* **Nomenclatura Livre:** Os nomes dos sinais (chaves do objeto, como `Rwr`, `Fwr`, `ALUop`) são de livre escolha.
* **Definição de Posição:** Cada sinal **deve** apresentar um (e apenas um) dos seguintes identificadores de posição:
    * **`bit`** (Inteiro): Utilizado quando o sinal ocupa apenas 1 *bit* isolado (ex: `bit: 25`).
    * **`bits`** (*Array* de 2 inteiros `[início, fim]`): Utilizado quando o sinal ocupa múltiplos *bits* (ex: `bits: [20, 22]`).
* **Mapeamento de Valores (`values`)**:
    * Se o campo **`bits`** for utilizado (indicando mais de 1 *bit*), o campo **`values` é obrigatório**. Ele deve mapear os mnemônicos dos valores (ex: `"ADD": 0`) ou referenciar outro dicionário de valores já existente (ex: `"@Asel"`).
    * Se o campo **`bit`** for utilizado (1 *bit* apenas), o uso de `values` não é necessário.
* **`description`** (*String*): Uma descrição textual da função do sinal (Opcional).