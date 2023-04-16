export function requestOpenaiClient(path: string, token: string) {
  return (body: any, method = 'POST') =>
    fetch('/api/openai', {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        path,
        token,
      },
      body: body && JSON.stringify(body),
    });
}

export async function getOpenaiUsage ({ startDate, endDate, key }: { startDate: string, endDate: string, key: string }): Promise<number> {
  const path = `/dashboard/billing/usage?${new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
  }).toString()}`;
  const res = await requestOpenaiClient(path, key)(null, 'GET');
  const { total_usage } = await res.json();
  return total_usage;
}

export function formatBalance (balance: number) {
  return Math.round(balance) / 100;
}

export function balanceText (balance: number) {
  return `$${formatBalance(balance)}`;
}