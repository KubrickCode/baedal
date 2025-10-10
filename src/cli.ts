import pc from "picocolors";
import { baedal } from "./core/baedal.js";

const [source, destination] = process.argv.slice(2);

if (!source) {
  console.log(pc.cyan("Usage: baedal <user/repo> [destination]"));
  console.log(pc.gray("\nExamples:"));
  console.log(pc.gray("  baedal user/repo"));
  console.log(pc.gray("  baedal user/repo ./output"));
  console.log(pc.gray("  baedal user/repo/src/components ./components"));
  process.exit(1);
}

try {
  const result = await baedal(source, destination);
  console.log(
    pc.green(`Downloaded ${result.files.length} files to ${result.path}`)
  );
} catch (error) {
  console.error(
    pc.red("Error:"),
    error instanceof Error ? error.message : String(error)
  );
  process.exit(1);
}
