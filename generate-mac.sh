#!/bin/bash 

# This script generates a bunch of Wi-Fi MAC addresses.
# It uses a simple loop to generate a few MAC addresses.

# Set the number of MAC addresses to generate
num_macs=10

# Loop to generate MAC addresses
for ((i=0; i<=$num_macs; i++)); do
  # Generate a random MAC address
  mac_address=$(cat /sys/class/net/wlp0s20f3/address  | cut -d' ' -f1)

  # Check if the MAC address is empty (may happen on some systems)
  if [[ -n "$mac_address" ]]; then
    echo "Generated MAC Address: $mac_address"
  else
    echo "Warning:  Could not generate MAC address.  This is rare."
  fi
done

echo "Script completed."