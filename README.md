# vite-plugin-envka

<!-- [![npm version](https://img.shields.io/npm/v/vite-plugin-envka.svg)](https://www.npmjs.com/package/vite-plugin-envka) -->

[![Vite](https://img.shields.io/badge/vite-compatible-blue.svg)](https://vitejs.dev/)

## Overview

**Envka** is a vite plugin designed to enhance environment variable management in Vite projects.

## Features

- Validate environment variables at Vite build and dev server startup
- TypeScript type generation (env.d.ts)
- Generate `.env.example` from schema
- Checking for unused and undeclared environment variables (planned)

## Installation

```bash
npm install vite-plugin-envka --save-dev
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
      schema,
      generateTypes: false /** Default */,
    }),
  ],
};
```

### env.d.ts generation

Generating env.d.ts is done after a successful validation. By default, its turned-off. You need to add `generateTypes: true` to turn it on.

### .env.example generation

Generating .env.example is done via the CLI

```bash
npx env example --schema /path/to/schema/file --output /optional/output
```

## Configuration example

```ts
import envka, { envkaValidator } from "vite-plugin-envka";

/** Example using Envka Validator */
export const builtinSchema = envkaValidator({
  FOO: { type: "string", default: "bar" },
  BAR: {
    type: "number",
    description: "A comment on your .env.example",
  },
  TEST_MODE: { type: "enum", enum: ["dev", "prod"] },
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
