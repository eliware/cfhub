import { COMMAND_NAMES, GLOBAL_FLAG_NAMES } from "../command/catalog.mjs";

const commands = COMMAND_NAMES.join(" ");
const flags = GLOBAL_FLAG_NAMES.join(" ");
const allWords = `${commands} ${flags}`;

export function renderShellCompletions() {
  return {
    "completions/cfhub.bash": [
      "_cfhub_complete() {",
      '  local cur="${COMP_WORDS[COMP_CWORD]}"',
      `  COMPREPLY=( $(compgen -W "${allWords}" -- "$cur") )`,
      "}",
      "complete -F _cfhub_complete cfhub",
      "",
    ].join("\n"),
    "completions/cfhub.fish": [
      `complete -c cfhub -f -a '${commands}'`,
      `complete -c cfhub ${GLOBAL_FLAG_NAMES.map((flag) => `-l ${flag.slice(2)}`).join(" ")}`,
      "",
    ].join("\n"),
    "completions/cfhub.ps1": [
      "Register-ArgumentCompleter -CommandName cfhub -ScriptBlock {",
      "  param($wordToComplete, $commandAst, $cursorPosition)",
      `  '${allWords.split(" ").join("','")}' |`,
      "    Where-Object { $_ -like \"$wordToComplete*\" } | ForEach-Object { [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_) }",
      "}",
      "",
    ].join("\n"),
    "completions/_cfhub": [
      "#compdef cfhub",
      `_arguments '1:command:(${commands})' '*:options:(${flags})'`,
      "",
    ].join("\n"),
  };
}
