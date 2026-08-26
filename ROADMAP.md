# Karel Robot — Roadmapa

> Stav: Funkční AI e-mailový administrátor. Demo (local + reálný LLM routing přes Ollama Cloud), ROI simulátor, dashboard.

## Co to je
AI zaměstnanec, který třídí příchozí zákaznické e-maily (DRAFT / ACKNOWLEDGE / ESCALATE) a měří ekonomický dopad.

## Cíl
Zpevnit LLM routing a dotáhnout ROI dashboard pro operátora.

## Fáze

### Fáze 1 — Routing (teď)
- [ ] Ověřit double-check logiku (confidence < 0.80 → druhé volání)
- [ ] Fallback: když Ollama Cloud selže → jasná chyba v UI, ne špatná klasifikace
- [ ] Logovat klasifikace do souboru (feedback pro ladění)

### Fáze 2 — Dashboard (hotové + dolaď)
- [ ] ROI simulátor: realistiktější vstupní parametry (objem emailů/den, lidský čas)
- [ ] Graf úspory v čase (denní/týdenní agregace)
- [ ] Export klasifikací (CSV)

### Fáze 3 — Produkce (volitelné)
- [ ] Ověřit s reálným e-mailovým feedem (aktuálně demo)

## Blokery
- Reálné e-maily nejsou zapojené — klasifikace běží na demo vstupech.
