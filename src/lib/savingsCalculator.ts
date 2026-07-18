export function calculateSavings(humanMinutes: number, aiSeconds: number, hourlyCost: number) {
  const aiMinutes = aiSeconds / 60;
  const savedMinutes = humanMinutes - aiMinutes;
  const savedCost = (savedMinutes / 60) * hourlyCost;
  const savedPercent = (savedMinutes / humanMinutes) * 100;

  return {
    savedMinutes: Math.max(0, savedMinutes),
    savedCost: Math.max(0, savedCost),
    savedPercent: Math.max(0, savedPercent),
  };
}

export function calculateExtendedSavings(savedMinutesPerEmail: number, hourlyCost: number, emailsPerDay: number) {
  const savedHoursPerDay = (savedMinutesPerEmail / 60) * emailsPerDay;
  const savedCostPerDay = savedHoursPerDay * hourlyCost;
  
  const savedHoursPerWeek = savedHoursPerDay * 5; // 5 pracovních dní
  const savedCostPerWeek = savedCostPerDay * 5;

  const savedHoursPerMonth = savedHoursPerDay * 21; // průměrně 21 pracovních dní
  const savedCostPerMonth = savedCostPerDay * 21;

  const savedHoursPerYear = savedHoursPerMonth * 12; // 12 měsíců
  const savedCostPerYear = savedCostPerMonth * 12;

  return {
    daily: { hours: savedHoursPerDay, cost: savedCostPerDay },
    weekly: { hours: savedHoursPerWeek, cost: savedCostPerWeek },
    monthly: { hours: savedHoursPerMonth, cost: savedCostPerMonth },
    yearly: { hours: savedHoursPerYear, cost: savedCostPerYear },
  };
}

export function formatCZK(amount: number) {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(value: number, decimals = 1) {
  return new Intl.NumberFormat('cs-CZ', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: value % 1 === 0 ? 0 : decimals
  }).format(value);
}
