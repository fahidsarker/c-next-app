import { exit } from "process";
import { spawn } from "child_process";
import path from "path";
import * as fs from "fs";

const execute = async (cmd: string) => {
  return new Promise<void>((resolve, reject) => {
    console.log(`Executing command: ${cmd}`);
    const child = spawn(cmd, { shell: true });

    child.stdout.on("data", (data) => {
      console.log(`${data}`);
    });

    child.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    child.on("close", (code) => {
      if (code !== 0) {
        console.error(`child process exited with code ${code}`);
        reject(new Error(`Command failed: ${cmd}`));
      } else {
        resolve();
      }
    });
  });
};

const createNextApp = async (appName: string) => {
  console.log(`Creating Next.js App... ${appName}`);
  const command = `npx create-next-app@latest ${appName} --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`;
  await execute(command);
};
const getAppDir = async (appName: string) => {
  const cwd = process.cwd();
  const appDir = path.join(cwd, appName);
  return appDir;
};
const installDependencies = async (appName: string) => {
  console.log(`Installing Shadcn UI... ${appName}`);
  const appDir = await getAppDir(appName);
  const command = `cd ${appDir} && 
  npx shadcn-ui@latest init -d && 
  npm i next-auth@beta mongodb mongo-rest-client react-icons @radix-ui/react-slot lucide-react @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-progress @radix-ui/react-slider @radix-ui/react-switch @radix-ui/react-tabs`;
  await execute(command);
};

function copyTemplateFiles(srcDir: string, destDir: string): void {
  const allFiles = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const file of allFiles) {
    const srcPath = path.join(srcDir, file.name);
    const destPath = path.join(destDir, file.name);
    if (file.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyTemplateFiles(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log("Please provide an app name");
  exit(1);
}
const appName = args[0];

const buildApp = async (appName: string) => {
  await createNextApp(appName);
  await installDependencies(appName);
  copyTemplateFiles(
    path.join(__dirname, "templates"),
    await getAppDir(appName)
  );
  await execute(
    `cd ${await getAppDir(appName)} && npx ts-node src/pre/genEnv.ts`
  );

  // open dest/src/app/layout.tsx
  // replace {{{appname}}} with the app name
  // save the file

  const layoutPath = path.join(await getAppDir(appName), "src", "config.ts");
  const layoutContent = fs.readFileSync(layoutPath, "utf-8");
  const newLayoutContent = layoutContent.replaceAll("{{{appname}}}", appName);
  fs.writeFileSync(layoutPath, newLayoutContent);
  console.log(`App created successfully: ${appName}`);
};

buildApp(appName);
