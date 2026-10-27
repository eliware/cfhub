import { readBuiltPickerAsset } from "../built-assets.mjs";
import { readSourcePickerAsset } from "../source-assets.mjs";

export const pickerAsset = (name) => {
  return readBuiltPickerAsset(name) ?? readSourcePickerAsset(name, "utf8");
};
