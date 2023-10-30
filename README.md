# For IT

This repository contains tools and scripts needed by IT organizations that are using different fleet management tools.


# RoboChef - The CLI interface

Hi, I'm RoboChef. Here is what I can do for you:

- `robochef` is a CLI tool that helps with diagnosing and execute actions on the environment
- `robochef` can execute different `Recipes` & `Ingredients`:
  - `Ingredients` = are atomic scripts with a simple and straight forward functionality
  - `Recipes` = are a collection of ingredients (atomic scripts/functions) to create more complex functionality
- the `Recipes` and `Ingredients` are stored in the Fridge (the internal Database)
- the available sous-chefs (Executors) are: bash|
- you can always build your own `Recipes` from available `Ingredients` or a combination of other `Recipes`
- new `Recipes` can be saved for future use
