import * as core from "@actions/core";

export const getRequiredInput = (name: string): string => core.getInput(name, { required: true }).trim();

export const getOptionalInput = (name: string): string => core.getInput(name).trim();

export const failAction = (message: string): void => {
  core.setFailed(message);
};
