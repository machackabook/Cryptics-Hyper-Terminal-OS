#!/usr/bin/env bash
# GAIA Chromebook Crostini storage bootstrap — non-destructive, no secrets in repository.
set -Eeuo pipefail
umask 077
ROOT="${GAIA_ROOT:-$HOME/.local/share/gaia-node}"
REMOTE="${GAIA_DRIVE_REMOTE:-gaia-drive:GAIA/Chromebook}"
mkdir -p "$ROOT"/{downloads,artifacts,logs,checkpoints,cache,tmp,state} "$HOME/.config/gaia"
command -v rclone >/dev/null || { echo "Install rclone first: sudo apt update && sudo apt install -y rclone"; exit 2; }
if ! rclone listremotes | grep -Fxq "${REMOTE%%:*}:"; then
 echo "Configure Google Drive interactively with: rclone config"
 echo "Choose remote name: ${REMOTE%%:*} (type: drive), then rerun."
 exit 3
fi
echo "Checking remote access: $REMOTE"
rclone lsf "$REMOTE" --max-depth 1 >/dev/null || { echo "Drive access failed; local data retained."; exit 4; }
cat > "$HOME/.config/gaia/node.env" <<EOF
GAIA_ROOT="$ROOT"
GAIA_DRIVE_REMOTE="$REMOTE"
EOF
cat > "$ROOT/sync.sh" <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail
source "$HOME/.config/gaia/node.env"
# copy + checksum verification before local cleanup; no remote deletes.
for name in downloads artifacts logs checkpoints; do
  mkdir -p "$GAIA_ROOT/$name"
  rclone copy "$GAIA_ROOT/$name" "$GAIA_DRIVE_REMOTE/$name" --create-empty-src-dirs --retries 3
  rclone check "$GAIA_ROOT/$name" "$GAIA_DRIVE_REMOTE/$name" --one-way --size-only
done
date -u +%FT%TZ > "$GAIA_ROOT/state/last-sync-utc"
echo "GAIA durable outputs synchronized; source files retained."
EOF
chmod 700 "$ROOT/sync.sh"
echo "Ready. Place durable outputs under $ROOT; run $ROOT/sync.sh to upload."
echo "Do not erase local data until sync receipts and remote contents are inspected."
