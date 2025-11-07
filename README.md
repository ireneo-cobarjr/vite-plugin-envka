# vite-plugin-envka

<!-- [![npm version](https://img.shields.io/npm/v/vite-plugin-envka.svg)](https://www.npmjs.com/package/vite-plugin-envka) -->

[![Vite](https://img.shields.io/badge/vite-compatible-blue.svg)](https://vitejs.dev/)

## Overview

**Envka** is a vite plugin designed to enhance environment variable management in Vite projects.

## Features

- Validate environment variables at Vite build and dev server startup
- TypeScript type generation (env.d.ts)
- Generate `.env.example` from schema
- Supports only the built-in validator (envkaValidator).
- Checking for unused and undeclared environment variables (not yet ready)

## Installation

```bash
npm install vite-plugin-envka --save-dev
```

or

```bash
yarn add vite-plugin-envka --dev
```

## Usage

Add to your `vite.config.ts`:

```ts
import envka from "vite-plugin-envka";

export default {
  plugins: [envka(/* options */)],
};
```

## Configuration

```ts
import envka from "vite-plugin-envka";

export default {
  plugins: [
    envka({
      schema: /** standard-schema */,
      generateTypes: false, /** Default */
    })
  ],
};
```

### env.d.ts generation

Generating env.d.ts is done after a successful validation. By default, its turned-off. You need to add `generateTypes: true` to turn it on. Zod, Valibot, ArkType and the builtin validator supports `enum` while others like Joi will end up with primitive types (i.e _string_, _number_ and _boolean_).

### .env.example generation

Generating .env.example is done via the CLI

```bash
npx env example --schema /path/to/schema/file --output /optional/output
```

Only supports the built-in validator

## Configuration example

```ts
import envka, { envkaValidator } from "vite-plugin-envka";

/** Example using Envka Validator */
export const builtinSchema = envkaValidator({
  FOO: { type: "string", default: "bar" },
  BAR: {
    type: "number",
    default: 42,
    description: "A comment on your .env.example",
  },
  TEST_MODE: { type: "enum", enum: ["dev", "prod"], default: "dev" },
});

export default {
  plugins: [
    envka({
      schema: builtinSchema,
      generateTypes: true,
    }),
  ],
};
```

## License

BSD-3 Clause

## Links

<!-- - [npm](https://www.npmjs.com/package/vite-plugin-envka) -->

- [Vite](https://vitejs.dev/)
- [Issues](https://github.com/ireneo-cobarjr/vite-plugin-envka/issues)
