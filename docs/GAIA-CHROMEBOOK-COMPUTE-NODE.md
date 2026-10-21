# GAIA Chromebook Crostini compute node — sequential commissioning

## 1. Verify Linux and storage
In Chromebook Terminal (Linux):
```bash
uname -a
df -h "$HOME"
cat /etc/os-release
```
Crostini is a VM/container; it needs a local system disk. Google Drive is durable storage, not a replacement for the live root filesystem.

## 2. Install Google Drive transport
```bash
sudo apt update
sudo apt install -y rclone curl ca-certificates
rclone config
```
Create a Google Drive remote named `gaia-drive`. Authenticate with your own Google account in the interactive rclone flow. Keep `~/.config/rclone/rclone.conf` private; never commit OAuth credentials. Create a dedicated GAIA folder with only the needed access.

## 3. Run bootstrap from the canonical public beta
```bash
curl -fsSLo /tmp/gaia-chromebook-bootstrap.sh https://raw.githubusercontent.com/machackabook/Cryptics-Hyper-Terminal-OS/main/scripts/gaia-chromebook-storage-bootstrap.sh
less /tmp/gaia-chromebook-bootstrap.sh
bash /tmp/gaia-chromebook-bootstrap.sh
```
The script checks Drive access and creates `~/.local/share/gaia-node` with downloads, artifacts, logs, checkpoints, cache, tmp and state. It creates `sync.sh` but does not schedule background jobs or delete local files.

## 4. Verify upload and recovery
```bash
printf 'GAIA node commissioning test\n' > "$HOME/.local/share/gaia-node/artifacts/commissioning.txt"
"$HOME/.local/share/gaia-node/sync.sh"
rclone cat gaia-drive:GAIA/Chromebook/artifacts/commissioning.txt
```
Do not delete the local file until the remote copy is verified. `rclone check --size-only` verifies sizes, not content hashes; use a checksum manifest for stronger integrity guarantees before automatic cleanup.

## 5. Storage policy
- Place build outputs, downloads, logs and checkpoints in GAIA's named directories; sync them to Drive.
- Put transient tool caches in `cache/` and `tmp/` only when the tool supports explicit cache directories.
- Keep `apt`, the Crostini OS, executables, active databases and browser profiles on local storage.
- Do not point `HOME`, root filesystem, `node_modules`, or a live SQLite database at an rclone Drive mount.
- Schedule sync/cleanup only after observing a successful commissioning cycle and ensuring retry/backpressure and offline retention.
- Drive API quotas, network interruptions and filesystem semantics require bounded local staging.

## 6. Subsequent integrations (not yet commissioned)
1. Add signed/verified upload receipts and local cleanup policy.
2. Register node identity and opt-in capabilities with the GAIA control plane.
3. Run Playwright tests under a dedicated unprivileged Linux worker.
4. Add Stagehand, Selenium and Gemini/Ollama adapters only when installed and authorized.
5. Connect GitHub main events to a durable queue; publish build/test evidence and remedy jobs.
6. Validate headless recovery, restart, consent revocation and device resource limits.

**ADAM certifies component releases; it is not in the per-task execution path.**
