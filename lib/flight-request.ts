export const FORMSPREE_ENDPOINT = 'https://formspree.io/f/meerrdgp';
const retryMessage = 'Unable to save your request. Please try again.';

export async function submitFlightRequest(
  form: HTMLFormElement,
  send: typeof fetch = fetch,
  reference = 'RA-' + crypto.randomUUID().slice(0, 8).toUpperCase(),
): Promise<string> {
  const fields = Object.fromEntries(new FormData(form));
  const {website, ...inquiry} = fields;
  const response = await send(FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', Accept: 'application/json'},
    body: JSON.stringify({...inquiry, _gotcha: website || '', reference,
      subject: 'RemAvi flight inquiry / ' + reference, source: 'RemAvi',
      page: window.location.href}),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => null) as {errors?: {message?: string}[]} | null;
    const detail = result?.errors?.map(error => error.message).filter(Boolean).join(' ');
    throw new Error(detail ? detail + ' Please try again.' : retryMessage);
  }
  form.reset();
  return reference;
}
