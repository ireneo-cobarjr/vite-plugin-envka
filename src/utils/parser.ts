export const parseEnv = (env: Record<string, string | undefined>) => {
  const parsedEnv: Record<string, any> = {};
  for (const key in env) {
    const value = env[key];
    if (value === undefined) {
      parsedEnv[key] = undefined;
    } else if (value.toLowerCase() === "true") {
      parsedEnv[key] = true;
    } else if (value.toLowerCase() === "false") {
      parsedEnv[key] = false;
    } else if (!isNaN(Number(value))) {
      parsedEnv[key] = Number(value);
    } else {
      parsedEnv[key] = value;
    }
  }
  return parsedEnv;
};
