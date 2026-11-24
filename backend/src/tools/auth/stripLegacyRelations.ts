import { readFile, writeFile } from "fs/promises";

// Post-processes the file written by `auth generate` (see the auth:generate
// script). The better-auth CLI appends `relations(...)` definitions that use
// drizzle-orm's legacy relations API, which drizzle-orm 1.0 no longer exports.
// Connect's relations live in database/src/relations.ts (defineRelations), so
// the generated block is dropped here instead of by hand.

const main = async () => {
  const [filePath] = process.argv.slice(2);
  if (!filePath) {
    console.error(
      "Usage: tsx src/tools/auth/stripLegacyRelations.ts <path to generated auth.ts>",
    );
    process.exit(1);
  }

  const source = await readFile(filePath, "utf8");

  const withoutImport = source.replace(
    /^import \{ relations \} from "drizzle-orm";\r?\n/m,
    "",
  );
  const relationsStart = withoutImport.search(
    /^export const \w+Relations = relations\(/m,
  );
  const stripped =
    relationsStart === -1
      ? withoutImport
      : withoutImport.slice(0, relationsStart).trimEnd() + "\n";

  await writeFile(filePath, stripped);
  console.log(
    relationsStart === -1
      ? "No legacy relations block found; file left as generated."
      : "Removed the legacy relations block from the generated schema.",
  );
};

void main();
