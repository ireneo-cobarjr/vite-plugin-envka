import * as path from "path";
import * as fs from "fs";

interface TestArtifactType {
  root: string;
  env: string;
  example: string;
}

interface TestArtifact {
  [key: string]: TestArtifactType;
  builtin: TestArtifactType;
  arktype: TestArtifactType;
  valibot: TestArtifactType;
  zod: TestArtifactType;
  joi: TestArtifactType;
}

const builtinRoot = path.resolve(__dirname, "../../", "test-builtin");
const arktypeRoot = path.resolve(__dirname, "../../", "test-arktype");
const valibotRoot = path.resolve(__dirname, "../../", "test-valibot");
const zodRoot = path.resolve(__dirname, "../../", "test-zod");
const joiRoot = path.resolve(__dirname, "../../", "test-joi");

const builtinEnv = path.join(builtinRoot, "env.d.ts");
const arktypeEnv = path.join(arktypeRoot, "env.d.ts");
const valibotEnv = path.join(valibotRoot, "env.d.ts");
const zodEnv = path.join(zodRoot, "env.d.ts");
const joiEnv = path.join(joiRoot, "env.d.ts");

const builtinExample = path.join(builtinRoot, ".env.example");
const arktypeExample = path.join(arktypeRoot, ".env.example");
const valibotExample = path.join(valibotRoot, ".env.example");
const zodExample = path.join(zodRoot, ".env.example");
const joiExample = path.join(joiRoot, ".env.example");

export const artifact: TestArtifact = {
  builtin: {
    root: builtinRoot,
    env: builtinEnv,
    example: builtinExample,
  },
  arktype: {
    root: arktypeRoot,
    env: arktypeEnv,
    example: arktypeExample,
  },
  valibot: {
    root: valibotRoot,
    env: valibotEnv,
    example: valibotExample,
  },
  zod: {
    root: zodRoot,
    env: zodEnv,
    example: zodExample,
  },
  joi: {
    root: joiRoot,
    env: joiEnv,
    example: joiExample,
  },
};

export const createTestRootDir = (testCase: keyof TestArtifact) => {
  const dirPath = artifact[testCase].root;
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return artifact[testCase];
};

export const cleanupTestRootDir = (
  testCase: keyof TestArtifact,
  fileToRemove: string
) => {
  const dirPath = artifact[testCase].root;

  if (fs.existsSync(dirPath)) {
    const tobeEmptied = fs.readdirSync(dirPath).length <= 1;
    if (tobeEmptied) {
      console.info("Cleaning up artifact dir for", testCase);
      fs.rmSync(dirPath, { recursive: true, force: true });
    } else {
      const filePath = path.join(dirPath, fileToRemove);
      fs.rmSync(filePath, { force: true });
    }
  }
};
