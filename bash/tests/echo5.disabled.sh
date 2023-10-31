#!/bin/bash
# ---
# title: Test - Echo Disabled
# description: Echoing and failing
# type: ingredient
# ---

echo "Will fail in 2 seconds..."
sleep 2
exit 1
