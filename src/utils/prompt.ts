import { emitKeypressEvents } from "node:readline";

export const confirmOverwrite = (): Promise<boolean> => {
  return new Promise((resolve) => {
    process.stdout.write("\n? Proceed with download? (y/N) ");

    // Set raw mode to read single keypress
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    emitKeypressEvents(process.stdin);

    const onKeypress = (
      _char: string,
      key: { name: string; ctrl?: boolean }
    ) => {
      const keyName = key.name.toLowerCase();
      let confirmed: boolean | null = null;
      let output = "";

      // Determine outcome based on key press
      if (key.ctrl && key.name === "c") {
        confirmed = false;
        output = "\n";
      } else if (keyName === "y") {
        confirmed = true;
        output = "y\n";
      } else if (
        keyName === "n" ||
        keyName === "return" ||
        keyName === "escape"
      ) {
        confirmed = false;
        output = "n\n";
      }

      // Perform side effects only if a decision was made
      if (confirmed !== null) {
        cleanup();
        process.stdout.write(output);
        resolve(confirmed);
      }
    };

    const cleanup = () => {
      process.stdin.removeListener("keypress", onKeypress);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      process.stdin.pause();
    };

    process.stdin.on("keypress", onKeypress);
  });
};
