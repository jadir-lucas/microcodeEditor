// src.opcodes.js

// ═══════════════════════════════════════════════════════
// ASSEMBLY — OPCODES
// ═══════════════════════════════════════════════════════

export function asmAddOpcode(mnemonic='', value='', desc='') {
    const div = document.createElement('div');
    div.style.cssText = 'display:grid;grid-template-columns:100px 80px 1fr 26px;gap:4px;align-items:center;padding:2px 0;';
    div.innerHTML = `
        <input class="arch-flag-name opcode-mnemonic" type="text" placeholder="e.g. MOV" value="${mnemonic}"
        style="text-transform:uppercase;letter-spacing:.04em;">
        <input class="arch-signal-input opcode-value" type="text" value="${value}" placeholder="e.g. 00100xxx"
        style="width:100%;height:26px;padding:0 4px;border:1px solid var(--border);border-radius:4px;
                font-family:var(--mono);font-size:11px;box-sizing:border-box;box-shadow:none;text-align:center;
                background:var(--surface2)!important;color:var(--text)!important;-moz-appearance:textfield;appearance:textfield;">
        <input class="arch-flag-name opcode-desc" type="text" placeholder="Description" value="${desc}">
        <button class="arch-del-btn" title="Remove opcode"
        onclick="this.closest('div').remove();"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M5.75 3V2.25h4.5V3h3a.75.75 0 0 1 0 1.5h-.5l-.9 8.1a1.75 1.75 0 0 1-1.74 1.65H5.89a1.75 1.75 0 0 1-1.74-1.65L3.25 4.5h-.5a.75.75 0 0 1 0-1.5zm1.5 0h1.5V2.25H7.25zm-1 2.5a.5.5 0 0 0-.498.55l.5 5a.5.5 0 0 0 .996-.1l-.5-5a.5.5 0 0 0-.498-.45zm3.5 0a.5.5 0 0 0-.498.45l-.5 5a.5.5 0 0 0 .996.1l.5-5A.5.5 0 0 0 9.75 5.5z"/></svg></button>
    `;

    div.querySelector('.opcode-mnemonic').addEventListener('input', e => {
        e.target.value = e.target.value.toUpperCase();
    });

    div.querySelector('.opcode-value').addEventListener('input', e => {
        // allow only 0, 1, x (and uppercase X normalised to x)
        const cleaned = e.target.value.replace(/[^01xX]/g, '').replace(/X/g, 'x');
        if (e.target.value !== cleaned) {
            const pos = e.target.selectionStart - (e.target.value.length - cleaned.length);
            e.target.value = cleaned;
            e.target.setSelectionRange(pos, pos);
        }
    });

    document.getElementById('opcodes-container').appendChild(div);
}

export function asmLoadOpcodes(opcData) {
    document.getElementById('opcodes-container').innerHTML = '';
    if (!opcData) return;
    if (Array.isArray(opcData)) {
        for (const item of opcData)
            asmAddOpcode(item.name || '', item.value ?? '', item.description || item.desc || '');
    } else if (typeof opcData === 'object') {
        for (const [mnemonic, val] of Object.entries(opcData)) {
            if (typeof val === 'object' && val !== null)
                asmAddOpcode(mnemonic, val.value ?? val.opcode ?? '', val.description ?? val.desc ?? '');
            else
                asmAddOpcode(mnemonic, val, '');
        }
    }
}