import { program } from "./cli";

describe("CLI Command Structure", () => {
  describe("pull command", () => {
    it("should be registered as default command", () => {
      const pullCommand = program.commands.find((cmd) => cmd.name() === "pull");
      expect(pullCommand).toBeDefined();
    });

    it("should accept source and optional destination arguments", () => {
      const pullCommand = program.commands.find((cmd) => cmd.name() === "pull");
      expect(pullCommand).toBeDefined();
      expect(pullCommand?.registeredArguments).toHaveLength(2);
      if (pullCommand?.registeredArguments) {
        expect(pullCommand.registeredArguments[0]?.required).toBe(true);
        expect(pullCommand.registeredArguments[1]?.required).toBe(false);
      }
    });

    it("should support conflict mode options", () => {
      const pullCommand = program.commands.find((cmd) => cmd.name() === "pull");
      expect(pullCommand?.options.map((opt) => opt.long)).toContain("--force");
      expect(pullCommand?.options.map((opt) => opt.long)).toContain("--skip-existing");
      expect(pullCommand?.options.map((opt) => opt.long)).toContain("--no-clobber");
    });

    it("should support exclude and token options", () => {
      const pullCommand = program.commands.find((cmd) => cmd.name() === "pull");
      expect(pullCommand?.options.map((opt) => opt.long)).toContain("--exclude");
      expect(pullCommand?.options.map((opt) => opt.long)).toContain("--token");
    });
  });

  describe("push command", () => {
    it("should be registered with sync-name argument", () => {
      const pushCommand = program.commands.find((cmd) => cmd.name() === "push");
      expect(pushCommand).toBeDefined();
      expect(pushCommand?.registeredArguments).toHaveLength(1);
      if (pushCommand?.registeredArguments) {
        expect(pushCommand.registeredArguments[0]?.name()).toBe("sync-name");
      }
    });
  });

  describe("push:init command", () => {
    it("should be registered with sync-name argument", () => {
      const pushInitCommand = program.commands.find((cmd) => cmd.name() === "push:init");
      expect(pushInitCommand).toBeDefined();
      expect(pushInitCommand?.registeredArguments).toHaveLength(1);
    });

    it("should support force option", () => {
      const pushInitCommand = program.commands.find((cmd) => cmd.name() === "push:init");
      expect(pushInitCommand?.options.map((opt) => opt.long)).toContain("--force");
    });
  });
});
