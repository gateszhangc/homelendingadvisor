#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${DOMAIN:-homelendingadvisor.lol}"
WWW_DOMAIN="${WWW_DOMAIN:-www.homelendingadvisor.lol}"
NAMESPACE="${NAMESPACE:-homelendingadvisor}"
SECRET_NAME="${SECRET_NAME:-homelendingadvisor-live-tls}"
ACME_SH_BIN="${ACME_SH_BIN:-$HOME/.acme.sh/acme.sh}"

if [[ -z "${PORKBUN_API_KEY:-}" || -z "${PORKBUN_SECRET_API_KEY:-}" ]]; then
  echo "PORKBUN_API_KEY and PORKBUN_SECRET_API_KEY are required." >&2
  exit 1
fi

command -v kubectl >/dev/null 2>&1 || {
  echo "kubectl is required." >&2
  exit 1
}

if [[ ! -x "$ACME_SH_BIN" ]]; then
  echo "acme.sh not found at $ACME_SH_BIN" >&2
  exit 1
fi

export PORKBUN_API_KEY
export PORKBUN_SECRET_API_KEY

"$ACME_SH_BIN" --issue \
  --dns dns_porkbun \
  -d "$DOMAIN" \
  -d "$WWW_DOMAIN" \
  --server letsencrypt \
  --keylength ec-256 \
  --force

CERT_DIR="$HOME/.acme.sh/${DOMAIN}_ecc"
FULLCHAIN_PATH="$CERT_DIR/fullchain.cer"
KEY_PATH="$CERT_DIR/${DOMAIN}.key"

kubectl create secret tls "$SECRET_NAME" \
  -n "$NAMESPACE" \
  --cert="$FULLCHAIN_PATH" \
  --key="$KEY_PATH" \
  --dry-run=client \
  -o yaml | kubectl apply -f -

echo "TLS secret refreshed:"
echo "  namespace: $NAMESPACE"
echo "  secret:    $SECRET_NAME"
echo "  domains:   $DOMAIN, $WWW_DOMAIN"
