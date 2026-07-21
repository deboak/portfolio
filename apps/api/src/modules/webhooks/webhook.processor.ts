export async function processIncomingWebhook(
  provider: string,
  event: { id: string; type: string; data: Record<string, unknown> },
) {
  // Provider-specific business actions belong here; receipt and verification remain transport concerns.
  console.info(
    JSON.stringify({
      message: 'Incoming webhook processed',
      provider,
      eventId: event.id,
      eventType: event.type,
    }),
  );
}
