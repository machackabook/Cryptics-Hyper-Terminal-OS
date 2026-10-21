#!/usr/bin/env bash
# GAIA Chromebook: repeatable, user-authorized Google Drive node commissioning.
set -Eeuo pipefail
umask 077
REMOTE_NAME="${GAIA_REMOTE_NAME:-gDrive}"
DEST="${GAIA_DEST:-GAIA/Chromebook}"
ROOT="${GAIA_ROOT:-$HOME/.local/share/gaia-node}"
case "$REMOTE_NAME" in *[!a-zA-Z0-9_-]*|'') echo 'Invalid remote name' >&2; exit 2;; esac
case "$DEST" in /*|*..*|'') echo 'Invalid Drive destination' >&2; exit 2;; esac
for dep in rclone sha256sum mktemp; do command -v "$dep" >/dev/null || { echo "Missing $dep" >&2; exit 2; }; done
if ! rclone listremotes | grep -Fxq "${REMOTE_NAME}:"; then
  echo "Remote ${REMOTE_NAME}: not configured. Run: rclone config"
  echo "Select n (new remote), name ${REMOTE_NAME}, storage drive, choose required scope, then complete Google OAuth interactively."
  echo "Do not paste OAuth callback URLs, tokens, or rclone.conf into chat or logs."
  exit 3
fi
REMOTE="${REMOTE_NAME}:${DEST}"
echo "Verifying Google Drive remote ${REMOTE_NAME}: (credentials will not be printed)"
rclone lsf "${REMOTE_NAME}:" --max-depth 1 >/dev/null || { echo "Remote inaccessible; reauthorize with rclone config reconnect ${REMOTE_NAME}:" >&2; exit 4; }
echo 'Provisioning remote directories (this can take time)...'
for dir in artifacts checkpoints logs downloads; do rclone mkdir "$REMOTE/$dir"; done
mkdir -p "$ROOT"/{artifacts,checkpoints,logs,downloads,cache,tmp,state}
chmod 700 "$ROOT"
# Generate sync command using positional args, avoiding executable config files.
cat > "$ROOT/sync.sh" <<'SYNC'
#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
ROOT="${GAIA_ROOT:-$HOME/.local/share/gaia-node}"
REMOTE_NAME="${GAIA_REMOTE_NAME:-gDrive}"
DEST="${GAIA_DEST:-GAIA/Chromebook}"
REMOTE="${REMOTE_NAME}:${DEST}"
for dir in artifacts checkpoints logs downloads; do
  rclone copy "$ROOT/$dir" "$REMOTE/$dir" --retries 3
  # rclone checks common supported hashes; if unavailable, it may use size.
  rclone check "$ROOT/$dir" "$REMOTE/$dir" --one-way
done
date -u +%FT%TZ > "$ROOT/state/last-sync-utc"
echo 'Sync completed; local sources retained.'
SYNC
chmod 700 "$ROOT/sync.sh"
probe="gaia-commission-$(date -u +%Y%m%dT%H%M%S)-$$.txt"
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT
printf 'GAIA commissioning %s\n' "$(date -u +%FT%TZ)" > "$tmp"
rclone copyto "$tmp" "$REMOTE/artifacts/$probe"
rclone cat "$REMOTE/artifacts/$probe" | sha256sum | grep -Fq "$(sha256sum "$tmp" | cut -d' ' -f1)" || { echo 'Upload verification failed; remote probe retained.' >&2; exit 5; }
printf 'GAIA node commissioned: %s\n' "$(date -u +%FT%TZ)" > "$ROOT/state/commissioned"
echo "PASS: authenticated Drive access, remote mkdir, upload and SHA256 readback."
echo "Sync outputs with: $ROOT/sync.sh"
echo "Note: ChromeOS browser downloads require separate browser configuration."
