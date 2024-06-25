// get all the page.tsx files in the project
const getAllPageFiles = (root: string) => {
  const fs = require("fs");
  const path = require("path");

  const walkSync = (dir: string, filelist: string[] = []) => {
    fs.readdirSync(dir).forEach((file: string) => {
      filelist = fs.statSync(path.join(dir, file)).isDirectory()
        ? walkSync(path.join(dir, file), filelist)
        : filelist.concat(path.join(dir, file));
    });
    return filelist;
  };

  return walkSync(root).filter((file: string) => file.endsWith("page.tsx"));
};

const pathToProps = (path: string) => {
  const segments = path.split("/");
  const params = [];
  const paramKeys = [];
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].startsWith("[") && segments[i].endsWith("]")) {
      params.push(`${segments[i].slice(1, -1)}: string`);
      paramKeys.push(segments[i].slice(1, -1));
    }
  }

  const searchParams: string[] = [];
  const searchParamKeys: string[] = [];
  const fs = require("fs");
  const data = fs.readFileSync(path, "utf8") as string;
  const lines = data
    .split("\n")
    .filter((line: string) => line.includes("// ::search::"));
  if (lines.length > 0) {
    const searchParamsStr = lines[0].split("::search::")[1].trim();
    searchParamsStr.split(",").forEach((param) => {
      searchParams.push(`${param}: string`);
      searchParamKeys.push(param);
    });
  }

  return [
    `type Props = {
  params: {${params.join(", ")}},
  searchParams: {${searchParams.join(", ")}}
};`,
    searchParamKeys.length > 0 ? `: {${searchParamKeys.join(", ")}}` : ``,
    paramKeys.length > 0 ? `: {${paramKeys.join(", ")}}` : "",
  ];
};

const injectProps = (path: string) => {
  const props = pathToProps(path);
  const fs = require("fs");
  // find the line between // props-auto-gen and // end-props-auto-gen
  // if exists remove lines from // props-auto-gen to // end-props-auto-gen
  const data = fs.readFileSync(path, "utf8") as string;
  const lines = data.split("\n");
  let start = -1;
  let end = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("// props-auto-gen")) {
      start = i;
    }
    if (lines[i].includes("// end-props-auto-gen")) {
      end = i;
    }
  }

  if (start !== -1 && end !== -1) {
    lines.splice(start, end - start + 1);
  }

  // insert the props after the imports statement
  let lastImportIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("import ")) {
      lastImportIndex = i;
    }
  }

  const toInsertProp = `
// props-auto-gen
${props[0]}
// end-props-auto-gen
  `;
  if (lastImportIndex !== -1) {
    lines.splice(lastImportIndex + 1, 0, toInsertProp);
  }

  // find first line with const page = (<anything here>) => {
  // if exists replace with `const page = ({ params, searchParams }: Props) => {`

  const regex = /const page = (async)?\s?\((.*?)\) => \{/;
  let pageStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (regex.test(lines[i])) {
      pageStart = i;
      break;
    }
  }

  if (pageStart !== -1) {
    lines[pageStart] =
      `const page = ${lines[pageStart].includes("async") ? "async" : ""} ({ params ${props[2]}, searchParams ${props[1]} }: Props) => {`;
  } else {
    // multi line search
    // const page = ({
    //   params: { pid },
    //   searchParams: { error, success, icons },
    // }: Props) => {

    let isAsync = false;
    let startLine = lines.findIndex((line) => line.includes("const page = ({"));

    if (startLine === -1) {
      startLine = lines.findIndex((line) =>
        line.includes("const page = async ({"),
      );
      isAsync = true;
    }

    const endLine = lines.findIndex((line) => line.includes("}: Props) => {"));

    if (startLine !== -1 && endLine !== -1) {
      lines[startLine] =
        `const page = ${isAsync ? "async" : ""} ({ params ${props[2]}, searchParams ${props[1]} }: Props) => {`;
      lines.splice(startLine + 1, endLine - startLine);
    }
  }

  fs.writeFileSync(path, lines.join("\n"));
};

const injectPropsToAllPages = () => {
  const pages = getAllPageFiles("src");
  pages.forEach(injectProps);
  console.log("Injected props to all pages: " + pages.length);
};

// console.log(getAllPageFiles("src").map(pathToProps));

injectPropsToAllPages();
