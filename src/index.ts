import BuildIcons, { IconOutput, ModuleName } from "@carbon/icons";
import * as fs from "fs";
import { promisify } from "util";
import { template, templateSvg } from "./template";
import { performance } from "perf_hooks";
import { name, devDependencies } from "../package.json";

const VERSION = devDependencies["@carbon/icons"];

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const rmdir = promisify(fs.rmdir);
const mkdir = promisify(fs.mkdir);

(async () => {
  const start = performance.now();
  const source = await readFile(
    "node_modules/@carbon/icons/metadata.json",
    "utf8"
  );
  const metadata: BuildIcons = JSON.parse(source);
  const iconMap = new Map<ModuleName, IconOutput>();
  const iconModuleNames = metadata.icons
    .map((icon) =>
      icon.output.map((icon) => {
        iconMap.set(icon.moduleName, icon);
        return icon.moduleName;
      })
    )
    .flat()
    .sort();

  await rmdir("lib", { recursive: true });
  await mkdir("lib");

  const iconType = `import { Component } from 'solid-js/types/render';
  export declare interface CarbonIconProps {
    id?: string;
    class?: string;
    className?: string;
    tabindex?: string;
    focusable?: boolean;
    title?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    style?: string;
    fill?: string;
    stroke?: string;
    width?: string;
    height?: string;
    onClick?: MouseEvent;
    onMouseOver?: MouseEvent;
    onMouseEnter?: MouseEvent;
    onMouseLeave?: MouseEvent;
    onKeyUp?: KeyboardEvent;
    onKeyDown?: KeyboardEvent;
}
export declare type CarbonIconComponent = Component<CarbonIconProps>;
\n\n`;

  let libExport = "";
  let definitions = "import { CarbonIconComponent } from './index'; export { CarbonIconComponent } from './index';";

  const bySize: Record<string, string[]> = {
    glyph: [],
    "16": [],
    "20": [],
    "24": [],
    "32": [],
  };

  iconModuleNames.forEach(async (moduleName) => {
    const icon = iconMap.get(moduleName);

    if (icon) {
      bySize[icon.size.toString()].push(templateSvg(icon));

      libExport += `export { default as ${moduleName} } from "./${moduleName}";\n`;
      definitions += `export declare const ${moduleName} : CarbonIconComponent;\n`;

      await mkdir(`lib/${moduleName}`);
      await writeFile(`lib/${moduleName}/index.tsx`, template(icon));
      await writeFile(
        `lib/${moduleName}/index.js`,
        `import ${moduleName} from "./index.tsx";\nexport default ${moduleName};`
      );
      await writeFile(
        `lib/${moduleName}/index.d.ts`,
        `export { ${moduleName} as default } from "../";\n`
      );
    }
  });

  await writeFile("lib/index.js", libExport);
  await writeFile("lib/index.ts", iconType);

  const version = `[@carbon/icons@${VERSION}](https://unpkg.com/browse/@carbon/icons@${VERSION}/)`;
  const total = iconModuleNames.length;
  const packageMetadata = `${total} icons from @carbon/icons@${devDependencies["@carbon/icons"]}`;

  await writeFile(
    "lib/index.d.ts",
    `// Type definitions for ${name}
// ${packageMetadata}

${definitions}`
  );
  await writeFile(
    "ICON_INDEX.md",
    `# Icon Index\n
> ${total} icons from ${version}\n
${iconModuleNames.map((moduleName) => `- ${moduleName}`).join("\n")}\n`
  );

  const bench = (performance.now() - start) / 1000;
  console.log(`Built ${total} icons in ${bench.toFixed(2)}s.`);

  await writeFile(
    "docs/build-info.json",
    JSON.stringify({ VERSION, total, bySize })
  );
})();
