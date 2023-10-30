# For IT

This repository contains tools and scripts needed by IT organizations that are using different fleet management tools.

# RoboChef - The CLI interface
```
 ________  ________  ________  ________  ________  ___  ___  _______   ________
|\   __  \|\   __  \|\   __  \|\   __  \|\   ____\|\  \|\  \|\  ___ \ |\  _____\
\ \  \|\  \ \  \|\  \ \  \|\ /\ \  \|\  \ \  \___|\ \  \\\  \ \   __/|\ \  \__/
 \ \   _  _\ \  \\\  \ \   __  \ \  \\\  \ \  \    \ \   __  \ \  \_|/_\ \   __\
  \ \  \\  \\ \  \\\  \ \  \|\  \ \  \\\  \ \  \____\ \  \ \  \ \  \_|\ \ \  \_|
   \ \__\\ _\\ \_______\ \_______\ \_______\ \_______\ \__\ \__\ \_______\ \__\
    \|__|\|__|\|_______|\|_______|\|_______|\|_______|\|__|\|__|\|_______|\|__|
```

Hi, I'm RoboChef. Here is what I can do for you:

- `robochef` is a CLI tool that helps with diagnosing and execute actions on the environment
- `robochef` can execute different `Recipes` & `Ingredients`:
  - `Ingredients` = are atomic scripts with a simple and straight forward functionality
  - `Recipes` = are a collection of ingredients (atomic scripts/functions) to create more complex functionality
- the `Recipes` and `Ingredients` are stored in the Fridge (the internal Database)
- the available sous-chefs (Executors) are: bash | powershell | js
- you can always build your own `Recipes` from available `Ingredients` or a combination of other `Recipes`
- new `Recipes` can be saved for future use - can be forgotten (deleted) afterwards

## Requirements

- Node 18.17.1
- NPM 9.6.7

## Setup

Run:
- `yarn setup`

## Development

To execute this in development (should work cross-platform):
- `yarn dev`

## Production

To create all needed executables for linux, darwin, windows:
- `yarn exe`

To enable development mode in Production run as:
- `NODE_ENV=development ./robochef-macos`
