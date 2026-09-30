import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../analyze';

// --- Test helpers ---

function makeReq(body: unknown): VercelRequest {
  return { method: 'POST', body } as unknown as VercelRequest;
}

function makeRes() {
  const res: any = {
    _status: 200,
    _json: null,
    setHeader: vi.fn(),
    status(code: number) {
      this._status = code;
      return this;
    },
    json(payload: unknown) {
      this._json = payload;
      return this;
    },
    end() {
      return this;
    },
  };
  return res;
}

// Mock global fetch. Returns a sequence of responses (one per call).
function mockFetchSequence(responses: Array<{ ok: boolean; status?: number; json?: () => Promise<unknown>; text?: () => Promise<string> }>) {
  const fetchMock = vi.fn();
  responses.forEach((r) => {
    fetchMock.mockResolvedValueOnce(r);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function okJsonResponse(payload: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ choices: [{ message: { content: JSON.stringify(payload) } }] }),
  };
}

const baseInput = {
  sender: 'zakaznik@novycloud.cz',
  subject: 'Výpověď smlouvy',
  body: 'Tímto podávám výpověď smlouvy s okamžitou platností.',
};

describe('api/analyze.ts — double-check logika', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    delete process.env.OLLAMA_API_KEY;
  });

  it('spustí druhé volání (double-check), když confidence < 0.80', async () => {
    const firstPass = {
      action: 'ESCALATE',
      actionLabel: 'Předat právnímu týmu',
      category: 'výpověď',
      customerStatus: 'zákazník',
      recipient: 'právní tým',
      outputTitle: 'Výpověď smlouvy',
      output: 'Dobrý den, Vaši výpověď jsem zaevidoval.',
      reasons: ['výpověď smlouvy', 'právní jazyk'],
      humanMinutes: 10,
      aiSeconds: 2,
      hourlyCost: 500,
      confidence: 0.55, // < 0.80 → musí spustit double-check
    };
    const reviewed = { ...firstPass, confidence: 0.95 };

    const fetchMock = mockFetchSequence([okJsonResponse(firstPass), okJsonResponse(reviewed)]);

    const res = makeRes();
    await handler(makeReq({ model: 'gemma4:31b', input: baseInput }), res);

    // Dvě volání: hlavní + double-check
    expect(fetchMock).toHaveBeenCalledTimes(2);
    // Druhé volání je review (jiný prompt) — ověříme, že šlo na OLLAMA_API_URL
    const secondCall = fetchMock.mock.calls[1];
    expect(secondCall[0]).toContain('chat/completions');
    const secondBody = JSON.parse(secondCall[1].body);
    expect(secondBody.messages[1].content).toContain('Zkontroluj a vylepši');
    // Výsledek je vylepšený (z double-checku)
    expect(res._json.confidence).toBe(0.95);
  });

  it('NEspustí druhé volání, když confidence >= 0.80', async () => {
    const firstPass = {
      action: 'DRAFT',
      actionLabel: 'Připravit odpověď',
      category: 'dotaz',
      customerStatus: 'zákazník',
      recipient: 'operátor',
      outputTitle: 'Dotaz na službu',
      output: 'Dobrý den, podívám se na to.',
      reasons: ['běžný dotaz'],
      humanMinutes: 5,
      aiSeconds: 2,
      hourlyCost: 0,
      confidence: 0.92, // >= 0.80 → přeskočit double-check
    };

    const fetchMock = mockFetchSequence([okJsonResponse(firstPass)]);

    const res = makeRes();
    await handler(makeReq({ model: 'gemma4:31b', input: baseInput }), res);

    // Jen jedno volání — žádný double-check
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(res._json.confidence).toBe(0.92);
  });

  it('použije první pass, když double-check selže (timeout / chyba)', async () => {
    const firstPass = {
      action: 'ACKNOWLEDGE',
      actionLabel: 'Potvrdit a eskalovat',
      category: 'výpadek',
      customerStatus: 'zákazník',
      recipient: 'technický tým',
      outputTitle: 'Výpadek připojení',
      output: 'Dobrý den, výpadek řešíme.',
      reasons: ['výpadek', 'technický problém'],
      humanMinutes: 8,
      aiSeconds: 2,
      hourlyCost: 0,
      confidence: 0.60, // < 0.80 → pokusí se o double-check
    };

    // Druhé volání (review) selže — ne-ok odpověď
    const fetchMock = mockFetchSequence([
      okJsonResponse(firstPass),
      { ok: false, status: 503, text: async () => 'boom' },
    ]);

    const res = makeRes();
    await handler(makeReq({ model: 'gemma4:31b', input: baseInput }), res);

    // Dvě volání proběhla, ale výsledek zůstává první pass
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(res._json.confidence).toBe(0.60);
  });
});

describe('api/analyze.ts — klasifikační log', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    delete process.env.OLLAMA_API_KEY;
  });

  it('zaloguje klasifikaci s requestId, model, akce a confidence', async () => {
    const firstPass = {
      action: 'ESCALATE',
      actionLabel: 'Předat právnímu týmu',
      category: 'výpověď',
      customerStatus: 'zákazník',
      recipient: 'právní tým',
      outputTitle: 'Výpověď smlouvy',
      output: 'Dobrý den, Vaši výpověď jsem zaevidoval.',
      reasons: ['výpověď smlouvy', 'právní jazyk'],
      humanMinutes: 10,
      aiSeconds: 2,
      hourlyCost: 500,
      confidence: 0.95, // >= 0.80 → žádný double-check, jeden log
    };

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    mockFetchSequence([okJsonResponse(firstPass)]);

    const res = makeRes();
    await handler(makeReq({ model: 'gemma4:31b', input: baseInput }), res);

    // Najdi klasifikační log entry
    const classificationLogs = consoleLogSpy.mock.calls
      .map((c) => c[0])
      .filter((line) => typeof line === 'string' && line.includes('"classification"'))
      .map((line) => JSON.parse(line));

    expect(classificationLogs).toHaveLength(1);
    const entry = classificationLogs[0];
    expect(entry.msg).toBe('classification');
    expect(entry.requestId).toMatch(/^req_/);
    expect(entry.model).toBe('gemma4:31b');
    expect(entry.akce).toBe('ESCALATE');
    expect(entry.confidence).toBe(0.95);

    consoleLogSpy.mockRestore();
  });
});
