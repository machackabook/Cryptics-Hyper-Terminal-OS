# TDOC-NEXUS-SSH-ALPHA-001 — Chromebook ↔ A15

[Open Cryptic public landing page](https://machackabook.github.io/Cryptic/)

## Scope

This is an **operator-controlled** source implementation. Chromebook Crostini is the SSH and ADB controller. The unrooted Samsung A15 hosts a Termux SSH service on private Wi-Fi port 8022 only after an explicit command.

Android Wireless debugging is **ADB**, not SSH. Pairing requires a one-time code displayed on the phone and entered on the Chromebook terminal. Do not save the code, upload credentials, grant permanent ADB access, enable legacy ADB TCP 5555, or configure public port forwarding.

The public Cryptic website DOES NOT mount a device by removing parts of a URL. The virtual namespace nexus://mesh/a15/files cannot traverse above its root. Only a separately authenticated SYNAPSE gateway can ultimately bridge user-approved intents. No actual private gateway/HTTPDFS mount is created here. ChatGPT connectors are not local filesystems and are not exposed by URL traversal.

## Architecture

Cryptic public UI → intent-only SYNAPSE gateway (future, fail-closed) → Chromebook local controller → SSH/SFTP to Termux A15, independently paired optional wireless ADB.

Never put keys, SSH agent socket, ADB codes, precise device addresses, OAuth tokens, or private files in GitHub Pages. The Termux SSH account can access its own files beyond nexus_exchange if you deliberately log in; the **SSHFS mount** exposes just that directory to the controller by convention, not an OS-level chroot. The read-only setting applies to the mount, not to all possible direct SSH operations.

## Operator commands

**On A15 Termux:**

~~~bash
pkg install openssh
bash scripts/nexus-mesh.sh phone-init
# Note the username shown by whoami.
~~~

**On Chromebook Linux terminal:**

~~~bash
sudo apt-get update && sudo apt-get install openssh-client adb
# sshfs optional: install only if FUSE is supported
bash scripts/nexus-mesh.sh chromebook-init --ip PHONE_PRIVATE_WIFI_IP --user TERMUX_USERNAME
bash scripts/nexus-mesh.sh pubkey
~~~

Copy the public ssh-ed25519 line only to A15; then:

~~~bash
bash scripts/nexus-mesh.sh phone-authorize
bash scripts/nexus-mesh.sh phone-start --ip PHONE_PRIVATE_WIFI_IP
~~~

Compare the Ed25519 host fingerprint printed on A15 with the Chromebook first-login prompt; do not accept it blindly. Back on Chromebook:

~~~bash
bash scripts/nexus-mesh.sh connect
bash scripts/nexus-mesh.sh verify
bash scripts/nexus-mesh.sh mount    # optional read-only SSHFS ~/nexus_exchange
bash scripts/nexus-mesh.sh unmount
bash scripts/nexus-mesh.sh pull     # scp fallback to ~/Nexus/inbox
~~~

**Optional wireless ADB:** On phone Settings → Developer options → Wireless debugging → Pair device with pairing code. Chromebook uses the temporary pair port, then the DIFFERENT debug connection port shown by the phone:

~~~bash
bash scripts/nexus-mesh.sh adb-pair --target PHONE_PRIVATE_WIFI_IP:PAIR_PORT
bash scripts/nexus-mesh.sh adb-connect --target PHONE_PRIVATE_WIFI_IP:DEBUG_PORT
bash scripts/nexus-mesh.sh adb-status
bash scripts/nexus-mesh.sh adb-disconnect --target PHONE_PRIVATE_WIFI_IP:DEBUG_PORT
~~~

On phone, switch Wireless debugging OFF after the session, and optionally run bash scripts/nexus-mesh.sh phone-stop. ADB and sshd are never started automatically.

## Alpha-Fabric: distinct α concepts

- alphaOpacity ∈ [0,1] is raster opacity, not a reconstruction hyperparameter.
- alphaTransmission ∈ [0,1] is a complex-wave amplitude attenuation: U=A·αtrans·exp(iφ). The module does not implement Fresnel or angular spectrum propagation.
- lambdaReg≥0 is sparse ISTA thresholding for min ½||Ax−y||²+λ||x||₁, specifically Ψ=I, not a general Ψ solver.
- kompressor is bounded lossy uniform quantization with a reported MSE.
- tensalltensions is a project-named discrete-gradient diagnostic, not a standard physical stress calculation.
- hatchetchopman is a project-named hard-threshold tiled coefficient pruning step, not an OS command.

## Verification

~~~bash
bash -n scripts/nexus-mesh.sh
node --test tests/nexus-alpha-mesh.test.mjs
~~~

Those checks verify source mathematics and namespace rejection only. They **do not** prove the A15 is reachable, sshd is listening, SSH host key verified, ADB paired, or providers live. Record device-derived evidence after executing it yourself; never publish pairing codes or private keys.

ADAM: ORCHBENCH → LIVE_EXECUTION → ADAM_PROOF_GATES → PRODUCTION_VERIFIED → ARCHBENCHSHOP. Unverified operations fail closed.
