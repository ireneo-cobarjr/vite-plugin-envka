// Utility for logging
import chalk from "chalk";

type LogType = "error" | "success" | "info";

export function log(message: string, type: LogType = "info") {
  const prefix = chalk.hex("#d898ca")("[envka]");
  let colorFn: (msg: string) => string;
  switch (type) {
    case "error":
      colorFn = chalk.hex("#ff6666");
      break;
    case "success":
      colorFn = chalk.hex("#66ff66");
      break;
    case "info":
    default:
      colorFn = chalk.hex("#88ffff");
      break;
  }
  console.log(`${prefix} ${colorFn(message)}`);
}
