
const fs = require("fs");
const path = require("path");

const tsconfigPath = path.join(__dirname, "../tsconfig.json");
const modulesDir = path.join(__dirname, "../src/modules");

const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));
const modules = fs.readdirSync(modulesDir).filter(f => fs.statSync(path.join(modulesDir, f)).isDirectory());

// Clean up old @modules/* wildcard if it exists
if (tsconfig.compilerOptions.paths["@modules/*"]) {
    delete tsconfig.compilerOptions.paths["@modules/*"];
}

// Add explicit paths for each module root
modules.forEach(mod => {
    tsconfig.compilerOptions.paths[`@modules/${mod}`] = [`./src/modules/${mod}/index.ts`];
});

fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
console.log("Successfully synced module aliases in tsconfig.json!");

