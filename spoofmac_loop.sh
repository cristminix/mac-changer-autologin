#!/bin/bash

INTERFACE="wlp0s20f3"

while true; do
  echo "[INFO] Spoofing MAC address for $INTERFACE using spoofmac..."

  # Matikan interface
  sudo ip link set $INTERFACE down

  # Ganti MAC address secara acak dengan spoofmac
  sudo /home/damar/.local/bin/spoof-mac set $INTERFACE random

  # Nyalakan kembali interface
  sudo ip link set $INTERFACE up

  echo "[INFO] MAC address updated. Sleeping for 5 minutes..."
  sleep 300  # 5 menit
done
