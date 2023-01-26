import { bold, green } from "https://deno.land/std@0.173.0/fmt/colors.ts";

interface Status {
  code: number;
  title: string;
  text: string;
}

const codeFilesPath = `${Deno.env.get("HOME")}/.config/hs/codes`;

function helpAndExit(exitCode: number): void {
  console.log(
    "usage: hs [-h|--help] [-s|--show-status-codes] <HTTP status: number>",
  );
  Deno.exit(exitCode);
}

function showStatusCodes(): void {
  const codes = { "1": [], "2": [], "3": [], "4": [], "5": [] };
  for (const statfile of Deno.readDirSync(codeFilesPath)) {
    codes[statfile.name[0]].push(statfile.name.replace(".txt", ""));
  }
  const table = Object.values(codes).map((c) => c.sort().join(" ")).join("\n");
  console.log(bold("HTTP Status Codes") + "\n");
  console.log(
    green(
      "1xx Informational | 2xx Success | 3xx Redirection | 4xx Client Error | 5xx Server Error\n",
    ),
  );
  console.log(green(table));
}

function parseUserArg(): string {
  if (Deno.args[0] === "-h" || Deno.args[0] === "--help") {
    helpAndExit(0);
  } else if (Deno.args[0] === "-s" || Deno.args[0] === "--show-status-codes") {
    showStatusCodes();
    Deno.exit(0);
  }
  if (!parseInt(Deno.args[0])) {
    helpAndExit(1);
  }
  return Deno.args[0];
}

function parseStatusText(text: string): string {
  let count = 0;
  const statusText = text.split("\n");
  let parsedText = "";

  for (let i = 0; i < statusText.length; i++) {
    if (statusText[i].includes("---")) {
      count += 1;
    } else if (count === 2) {
      parsedText += `\n${statusText[i]}`;
    }
  }

  return parsedText.trim();
}

function parseStatfileText(statfileText: string): Status {
  const status = {};
  status.code = /code: (\d+)/.exec(statfileText)[1];
  status.title = /title: (.*)/.exec(statfileText)[1];
  status.text = parseStatusText(statfileText);
  return status;
}

function printStatus(stat: string): void {
  const statfileText = new TextDecoder("UTF-8").decode(
    Deno.readFileSync(`${codeFilesPath}/${stat}.txt`),
  );
  const parsedStatus = parseStatfileText(statfileText);
  for (const attr of Object.keys(parsedStatus)) {
    console.log(bold(attr) + ": " + green(parsedStatus[attr]));
  }
}

if (import.meta.main) {
  printStatus(parseUserArg());
}
