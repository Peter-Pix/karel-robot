import { AnalysisResult, EmailInput } from "../types";

export interface EmailAnalyzer {
  analyze(input: EmailInput): Promise<AnalysisResult>;
}

export class ApiEmailAnalyzer implements EmailAnalyzer {
  constructor(private modelName: string) {}

  async analyze(input: EmailInput): Promise<AnalysisResult> {
    const base = import.meta.env.BASE_URL || '/';
    const response = await fetch(`${base}api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: this.modelName, input }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as AnalysisResult;
  }
}

export class LocalDemoEmailAnalyzer implements EmailAnalyzer {
  async analyze(input: EmailInput): Promise<AnalysisResult> {
    const text = (input.subject + " " + input.body).toLowerCase();
    
    // Legal/Escalation
    if (text.includes("výpověď") || text.includes("právní") || text.includes("okamžitou platností")) {
      return {
        action: "ESCALATE",
        actionLabel: "Eskalace",
        category: "Právní hrozba / Výpověď",
        customerStatus: "Ověřený firemní zákazník",
        recipient: "Právní oddělení & Retenční tým",
        outputTitle: "Interní shrnutí pro specialistu",
        output: "Zákazník podává výpověď smlouvy s okamžitou platností a hrozí právním zástupcem v případě další fakturace.\n\nNutné kroky:\n1. Zastavit automatickou fakturaci.\n2. Ověřit smluvní podmínky a závazky.\n3. Kontaktovat zákazníka s vyčíslením.",
        reasons: [
          "E-mail obsahuje právní terminologii a výpověď.",
          "Záležitost vyžaduje okamžitou pozornost specialisty.",
          "Finanční riziko a hrozba právního sporu.",
          "Vyžaduje manuální kontrolu a schválení postupu."
        ],
        humanMinutes: 12,
        aiSeconds: 8,
        hourlyCost: 400,
        confidence: 98,
      };
    }

    // Complaint / Compensation
    if (text.includes("výpadek") || text.includes("kompenzac") || text.includes("stížnost") || text.includes("nevyřešil")) {
      return {
        action: "ACKNOWLEDGE",
        actionLabel: "Potvrzení přijetí",
        category: "Technický problém s kompenzací",
        customerStatus: "Registrovaný zákazník",
        recipient: "Technická podpora",
        outputTitle: "Návrh odpovědi zákazníkovi",
        output: "Dobrý den,\n\nvelmi se omlouváme za opakované výpadky internetového připojení. Váš požadavek jsme s vysokou prioritou předali technickému oddělení k urgentnímu řešení.\n\nMožnost kompenzace bude posouzena ihned po odstranění závady.\n\nS pozdravem,\nZákaznická péče",
        reasons: [
          "Zákazník hlásí opakovaný technický problém.",
          "Obsahuje žádost o kompenzaci (nelze schválit automaticky).",
          "Je nutné potvrdit přijetí a uklidnit zákazníka.",
          "Záležitost předána jako prioritní incident."
        ],
        humanMinutes: 8,
        aiSeconds: 7,
        hourlyCost: 400,
        confidence: 92,
      };
    }

    // Unknown Sender
    if (!input.sender.endsWith("@example.cz") && !input.sender.endsWith("@novycloud.cz")) {
      return {
        action: "DRAFT",
        actionLabel: "Návrh pro operátora",
        category: "Neověřený odesílatel",
        customerStatus: "Neznámý kontakt",
        recipient: "Zákaznická podpora (Triage)",
        outputTitle: "Návrh odpovědi k ověření identity",
        output: "Dobrý den,\n\nděkujeme za Váš e-mail. Tuto adresu však neevidujeme u žádné aktivní smlouvy v našem systému.\n\nPro poskytnutí konkrétních informací nebo provedení změn Vás prosíme o potvrzení čísla Vaší smlouvy, případně o zaslání požadavku z e-mailu vedeného u Vašeho zákaznického účtu.\n\nS pozdravem,\nZákaznická péče",
        reasons: [
          "Odesílatel není spárován s žádným zákaznickým účtem.",
          "Nelze poskytovat specifické informace bez ověření.",
          "Připraven standardní návrh žádosti o doplnění údajů.",
          "Zabraňuje možnému úniku osobních dat."
        ],
        humanMinutes: 5,
        aiSeconds: 4,
        hourlyCost: 400,
        confidence: 96,
      };
    }

    // Default / Admin Request
    return {
      action: "DRAFT",
      actionLabel: "Návrh pro operátora",
      category: "Administrativní požadavek",
      customerStatus: "Registrovaný zákazník",
      recipient: "Zákaznická podpora",
      outputTitle: "Návrh odpovědi pro operátora",
      output: "Dobrý den,\n\nděkujeme za Vaši zprávu. Požadavek na změnu fakturační adresy jsme zaznamenali. Pro bezpečné dokončení změny prosíme o potvrzení identifikačních údajů vedených u smlouvy.\n\nPo ověření změnu zpracujeme a zašleme Vám potvrzení.\n\nS pozdravem,\nZákaznická péče",
      reasons: [
        "Identifikován běžný administrativní úkon.",
        "Odesílatel se shoduje s registrovaným zákazníkem.",
        "Požadovaná akce vyžaduje ověření identity.",
        "Připraven standardizovaný návrh k odeslání."
      ],
      humanMinutes: 6,
      aiSeconds: 6,
      hourlyCost: 400,
      confidence: 95,
    };
  }
}
