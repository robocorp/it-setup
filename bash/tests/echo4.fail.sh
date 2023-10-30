#!/bin/bash
# ---
# title: Test - Echo Fail
# description: Echoing and failing
# os: darwin
# type: ingredient
# ---

echo "Will fail in 2 seconds..."
sleep 2
exit 1
