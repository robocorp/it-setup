#!/bin/bash
# ---
# title: Test (SH) - Echo Fail
# description: Echoing and failing
# os: darwin
# category: Test
# type: ingredient
# ---

echo "SH - Will fail in 2 seconds..."
sleep 2
exit 1
