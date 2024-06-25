const parseEnvFile = (path: string): Record<string, string> => {
  const fs = require("fs");
  const data = fs.readFileSync(path, "utf8");
  const lines = data.split("\n");
  const env: Record<string, string> = {};
  lines.forEach((line: string) => {
    if (line.includes("=")) {
      const [key, value] = line.split("=");
      env[key] = value;
    }
  });

  return env;
};

const parseEnvFiles = () => {
  const fs = require("fs");
  // read all files starting with .env

  const envFiles = fs
    .readdirSync("./")
    .filter((file: string) => file.startsWith(".env"));

  const allKeys: string[] = [];

  envFiles.forEach((file: string) => {
    const env = parseEnvFile(file);
    const keys = Object.keys(env);
    allKeys.push(...keys);
  });

  const uniqueKeys = Array.from(new Set(allKeys));

  return uniqueKeys;
};

const prepareEnv = (outputDir: string) => {
  const fs = require("fs");
  const keys = parseEnvFiles();

  const env = `
        export const ENV = {
            ${keys
              .map((key) => `${key}: process.env.${key}! as string`)
              .join(",\n")}
        }
        `;

  fs.writeFileSync(`${outputDir}/env.ts`, env);
};

prepareEnv("src");
