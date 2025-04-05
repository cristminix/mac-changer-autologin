#!/bin/bash

INTERFACE="wlp0s20f3"

while true; do
  echo "[INFO] Spoofing MAC address for $INTERFACE..."

  # Matikan interface
  sudo ip link set $INTERFACE down

  # Ganti MAC address secara acak
  sudo macchanger -r $INTERFACE

  # Nyalakan kembali interface
  sudo ip link set $INTERFACE up

  echo "[INFO] MAC address updated. Sleeping for 5 minutes..."
  sleep 300  # 5 menit = 300 detik
done
