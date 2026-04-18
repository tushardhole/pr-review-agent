import { minimatch } from "minimatch";
import { PrFile } from "../types";

const isExcluded = (filename: string, patterns: string[]): boolean =>
  patterns.some((pattern) => minimatch(filename, pattern, { dot: true }));

export const filterFilesForReview = (files: PrFile[], patterns: string[], maxFiles: number): PrFile[] => {
  if (maxFiles <= 0) {
    throw new Error("maxFiles must be greater than 0.");
  }
  const included = files.filter((file) => !isExcluded(file.filename, patterns));
  return included.slice(0, maxFiles);
};
