import { filterFilesForReview } from "../file-filter";
import { PrFile } from "../../types";

const files: PrFile[] = [
  { filename: "src/app.ts", status: "modified", additions: 1, deletions: 1, changes: 2 },
  { filename: "dist/index.js", status: "modified", additions: 1, deletions: 1, changes: 2 },
  { filename: "package-lock.json", status: "modified", additions: 1, deletions: 1, changes: 2 }
];

describe("filterFilesForReview", () => {
  it("filters excluded patterns", () => {
    const result = filterFilesForReview(files, ["dist/**", "*.json"], 10);
    expect(result).toHaveLength(1);
    expect(result[0].filename).toBe("src/app.ts");
  });

  it("limits to max files", () => {
    const result = filterFilesForReview(files, [], 2);
    expect(result).toHaveLength(2);
  });

  it("throws on invalid max files", () => {
    expect(() => filterFilesForReview(files, [], 0)).toThrow("maxFiles");
  });
});
