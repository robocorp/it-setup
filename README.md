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

Hi, I'm **RoboChef**. Here is what I can do for you:

- `robochef` is a CLI tool that helps with diagnosing and execute actions on the environment
- `robochef` can execute different `Recipes` & `Ingredients`:
  - `Ingredients` = are atomic scripts with a simple and straight forward functionality
  - `Recipes` = are collections of ingredients (atomic scripts/functions) that create more complex functionality
- the `Recipes` and `Ingredients` are stored in the `Fridge` (the internal Database)
- the available sous-chefs (Executors) are: bash | powershell | js
- you can always build your own `Recipes` from available `Ingredients` or a combination of other `Recipes`
- new `Recipes` can be saved for future use - can be forgotten (deleted) afterwards

## Creating Recipes & Ingredients

**RoboChef** will scan included folders for scripts & create a DB on the fly.

The included folders are:
- `./lib/powershell/**/*`
- `./lib/bash/**/*`
- `./lib/python/**/*`
- `./lib/recipes/**/*`

These can be found in `package.json / pkg (section)`

If no folder suites you well, `Create a new folder`, but add it in:
- `package.json / pkg (section)`
- `buildResources.js`
- `(here in ...) README.md`

To add a new script to **RoboChef** you can add it in one of the specified folders.

For **RoboChef** to recognize the script as being part of the DB, you'll need to adhere to this header:

```
# ---
# title: Remove Windows Worker
# description: Running several atomic scripts that would remove the Windows Service & Scheduled task
# requirements: User needs to be an admin
# category: worker | ssl
# os (this should always be specified so that the script isn't disabled): windows | linux | darwin
# type: recipe | ingredient
# executor (optional) - this is determined through the file extension: bash | powershell | js
# internalPath (not for use) - (this is created when scanning the internal objects)
# ---
```

The `#` should function as a comment, but if `#` doesn't work, you can use `//`

### The JS Recipe (Script)

There is a special kind of scripts you can create.

These would be JS scripts that would become `Recipes` in **RoboChef**.
These `Recipes` are combinations of other `Ingredients` and `Recipes` created a priori.

The format:

```
// ---
// title: Template - First recipe as a combination
// description: Recipe template to show you can build simple recipes
// type: recipe
// executor: js
// ---

module.exports = {
  InnerSteps: [
    {
      title: 'Echo 1',
      internalPath: './bash/tests/echo1.sh',
      description: 'Just echoing...',
      os: 'darwin',
      type: 'ingredient',
    },
    {
      title: 'Echo Fail',
      internalPath: './bash/tests/echo4.fail.sh',
      description: 'Echoing and failing',
      os: 'darwin',
      type: 'ingredient',
    },
  ],
};

```

### User Created Recipes

> The JS format will be used when a User creates a personalized `Recipe`.
> - The `User Recipes` will be saved in a `temp` (cross-platform) folder.
> - The `User Recipes` will be available if the user quits the application and comes back to it.
> - The `User Recipes` will be able to create new `Recipes` **only** out of the internal `Ingredients` or `Recipes`
> - The `User Recipes` don't have any value as independent scripts.
> - The `User Recipes` can be deleted if the user wishes so. The internal scripts will never be deleted.


## Dev & Build Requirements

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
