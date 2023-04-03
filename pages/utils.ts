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

export function formatBalance (balance: number) {
  return Math.round(balance) / 100;
}