#!/usr/bin/env bash
# TDOC-NEXUS-SSH-001. Operator-owned SSH, no automatic remote access.
set -euo pipefail
umask 077
mode="$(printf '%s' "$1")"; shift || :
ip=""; remote_user=""; target=""
fail(){ echo "NEXUS DENIED: $*" >&2; exit 1; }
for cmd in "$@"; do :; done
while (($#)); do
 case "$1" in
 --ip) ip="$2"; shift 2;;
 --user) remote_user="$2"; shift 2;;
 --target) target="$2"; shift 2;;
 *) fail "Unexpected argument $1";;
 esac
done
private_ip(){
 [[ "$1" =~ ^[0-9]{1,3}(\.[0-9]{1,3}){3}$ ]] || return 1
 local a b c d n; IFS=. read -r a b c d <<< "$1"
 for n in "$a" "$b" "$c" "$d"; do ((10#$n<=255)) || return 1; done
 [[ "$1" == 10.* || "$1" == 192.168.* || "$1" == 172.1[6-9].* || "$1" == 172.2[0-9].* || "$1" == 172.3[01].* ]]
}
phone(){ [[ -n "$(printenv PREFIX 2>/dev/null || :)" ]] || fail 'Run from Termux'; }
controller(){ [[ -z "$(printenv PREFIX 2>/dev/null || :)" ]] || fail 'Run from Chromebook Linux'; }
need(){ command -v "$1" >/dev/null || fail "Install $1 explicitly first"; }
state="$HOME/.local/state/nexus-mesh"
key="$HOME/.ssh/nexus-a15_ed25519"
case "$mode" in
help|--help)
 cat <<'HELP'
NEXUS SSH MESH v1:
Phone: pkg install openssh; bash nexus-mesh.sh phone-init
Phone: bash nexus-mesh.sh phone-authorize (paste Chromebook PUBLIC key)
Phone: bash nexus-mesh.sh phone-start --ip 192.168.X.Y
Phone: bash nexus-mesh.sh phone-stop
Chromebook: bash nexus-mesh.sh chromebook-init --ip 192.168.X.Y --user <Termux whoami>
Chromebook: bash nexus-mesh.sh pubkey
Chromebook: bash nexus-mesh.sh connect | verify | mount | unmount | pull
Chromebook: bash nexus-mesh.sh adb-pair --target PRIVATE_IP:PAIR_PORT
Chromebook: bash nexus-mesh.sh adb-connect --target PRIVATE_IP:DEBUG_PORT
Chromebook: bash nexus-mesh.sh adb-status
Chromebook: bash nexus-mesh.sh adb-disconnect --target PRIVATE_IP:DEBUG_PORT
HELP
 ;;
phone-init)
 phone; need ssh-keygen
 mkdir -p "$HOME/.ssh" "$HOME/nexus_exchange" "$state"
 chmod 700 "$HOME/.ssh" "$HOME/nexus_exchange" "$state"
 touch "$HOME/.ssh/authorized_keys"; chmod 600 "$HOME/.ssh/authorized_keys"
 echo "Phone Termux user: $(whoami)"
 ;;
phone-authorize)
 phone; need ssh-keygen; mkdir -p "$HOME/.ssh" "$state"
 chmod 700 "$HOME/.ssh" "$state"
 IFS= read -r -p "Paste PUBLIC ssh-ed25519 key: " pub
 [[ "$pub" =~ ^ssh-ed25519[[:space:]][A-Za-z0-9+/=]+([[:space:]][A-Za-z0-9@._-]+)?$ ]] || fail 'Invalid key'
 tmp="$(mktemp "$state/pub.XXXXXX")"
 printf '%s\n' "$pub" > "$tmp"
 ssh-keygen -lf "$tmp" >/dev/null || { rm -f "$tmp"; fail 'Invalid public key'; }
 rm -f "$tmp"
 touch "$HOME/.ssh/authorized_keys"; chmod 600 "$HOME/.ssh/authorized_keys"
 grep -Fxq "$pub" "$HOME/.ssh/authorized_keys" || printf '%s\n' "$pub" >> "$HOME/.ssh/authorized_keys"
 ;;
phone-start)
 phone; need sshd; need ssh-keygen
 private_ip "$ip" || fail 'Requires private Wi-Fi IP'
 mkdir -p "$state" "$HOME/nexus_exchange"; chmod 700 "$state" "$HOME/nexus_exchange"
 ssh-keygen -A >/dev/null 2>&1 || :
 pid="$state/sshd.pid"
 [[ ! -f "$pid" ]] || ! kill -0 "$(cat "$pid")" 2>/dev/null || fail 'Already running'
 opts=(-p 8022 -o "ListenAddress=$ip" -o "PidFile=$pid" -o PasswordAuthentication=no -o KbdInteractiveAuthentication=no -o PubkeyAuthentication=yes -o PermitRootLogin=no -o AllowTcpForwarding=no -o X11Forwarding=no)
 sshd -t "${opts[@]}" || fail 'Invalid sshd config'
 sshd "${opts[@]}"
 ssh-keygen -lf "$(printenv PREFIX)/etc/ssh/ssh_host_ed25519_key.pub"
 echo 'Verify fingerprint out of band before Chromebook accepts host key.'
 ;;
phone-stop)
 phone; pid="$state/sshd.pid"
 [[ -f "$pid" ]] || fail 'Managed process not found'
 p="$(cat "$pid")"; [[ "$p" =~ ^[0-9]+$ ]] || fail 'Invalid PID'
 [[ "$(ps -p "$p" -o args= 2>/dev/null || :)" == *sshd* ]] || fail 'Not managed sshd'
 kill "$p"; rm -f "$pid"
 ;;
chromebook-init)
 controller; private_ip "$ip" || fail 'Requires private phone Wi-Fi IP'
 [[ "$remote_user" =~ ^[A-Za-z0-9._-]{2,64}$ ]] || fail 'Requires Termux --user'
 need ssh-keygen; need ssh
 mkdir -p "$HOME/.ssh" "$HOME/Nexus/mounts/A15" "$HOME/Nexus/inbox"
 chmod 700 "$HOME/.ssh"
 [[ -f "$key" ]] || ssh-keygen -t ed25519 -a 100 -f "$key" -C nexus-chromebook-controller
 conf="$HOME/.ssh/config"; tmp="$(mktemp "$HOME/.ssh/nexus-conf.XXXXXX")"
 [[ ! -f "$conf" ]] || sed '/^# NEXUS MESH BEGIN$/,/^# NEXUS MESH END$/d' "$conf" > "$tmp"
 grep -Eq '^[[:space:]]*Host[[:space:]]+nexus-a15([[:space:]]|$)' "$tmp" && fail 'Unmanaged SSH alias exists'
 cat >> "$tmp" <<CFG
# NEXUS MESH BEGIN
Host nexus-a15
  HostName $ip
  Port 8022
  User $remote_user
  IdentityFile $key
  IdentitiesOnly yes
  StrictHostKeyChecking ask
  UserKnownHostsFile ~/.ssh/known_hosts
  ForwardAgent no
  ClearAllForwardings yes
# NEXUS MESH END
CFG
 chmod 600 "$tmp"; mv "$tmp" "$conf"
 echo 'Profile written. Copy the PUBLIC key to the phone.'
 ;;
pubkey) controller; cat "$key.pub";;
connect) controller; need ssh; exec ssh nexus-a15;;
verify) controller; need ssh; ssh -o BatchMode=yes nexus-a15 'printf "SSH_OK "; whoami; uname -s';;
mount)
 controller; need sshfs; need mountpoint
 mkdir -p "$HOME/Nexus/mounts/A15"
 mountpoint -q "$HOME/Nexus/mounts/A15" && fail 'Already mounted'
 sshfs 'nexus-a15:nexus_exchange' "$HOME/Nexus/mounts/A15" -o ro,reconnect
 ;;
unmount)
 controller
 if command -v fusermount3 >/dev/null; then fusermount3 -u "$HOME/Nexus/mounts/A15"
 else fusermount -u "$HOME/Nexus/mounts/A15"; fi
 ;;
pull) controller; need scp; mkdir -p "$HOME/Nexus/inbox"; scp -r 'nexus-a15:nexus_exchange' "$HOME/Nexus/inbox/";;
adb-pair|adb-connect|adb-disconnect)
 controller; need adb
 addr="$(printf '%s' "$target" | cut -d: -f1)"
 port="$(printf '%s' "$target" | cut -d: -f2)"
 private_ip "$addr" || fail 'Only private LAN ADB endpoint'
 [[ "$port" =~ ^[0-9]{2,5}$ ]] || fail 'Invalid ADB port'
 ((10#$port>=1024 && 10#$port<=65535)) || fail 'Invalid ADB port'
 case "$mode" in
 adb-pair) echo 'Enter temporary pairing code in adb prompt ONLY'; adb pair "$target";;
 adb-connect) adb connect "$target"; adb devices -l;;
 adb-disconnect) adb disconnect "$target"; echo 'Disable Wireless debugging on A15 when finished';;
 esac
 ;;
adb-status) controller; need adb; adb devices -l;;
*) fail "Unknown command $mode";;
esac
