/** Success/cancel banner reflecting the return from Stripe Checkout. */
export function CheckoutStatusBanner({ status }: { status: string | null }) {
  if (status === "success") {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">
        <p className="font-medium text-emerald-700 dark:text-emerald-400">Checkout complete</p>
        <p className="text-muted-foreground">
          Your subscription is active. The plan updates automatically through the Stripe webhook.
        </p>
      </div>
    );
  }
  if (status === "cancelled") {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
        <p className="font-medium text-amber-700 dark:text-amber-400">Checkout cancelled</p>
        <p className="text-muted-foreground">No charge was made — you can upgrade whenever you’re ready.</p>
      </div>
    );
  }
  return null;
}
