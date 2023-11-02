#!/bin/bash
# ---
# title: Test - Echo Linux
# description: Echoing and failing
# type: ingredient
# category: Test
# os: linux
# ---

echo "Will fail in 2 seconds..."
sleep 2
exit 1
