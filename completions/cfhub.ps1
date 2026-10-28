Register-ArgumentCompleter -CommandName cfhub -ScriptBlock {
  param($wordToComplete, $commandAst, $cursorPosition)
  'auth','oauth','zones','dns-records','zone-settings','rulesets','lists','list-items','ssl','cache','api','health','audit','inventory','origin-ca','load-balancer','tunnel','workers','pages','r2','d1','queues','stream','images','ai','access','extension','alias','config','--help','--version','--json','--output','--jq','--template','--method','--quiet','--pager','--no-pager','--color','--width','--verbose','--paginate','--web','--force','--dry-run','--account-id','--zone-id','--file','--data' |
    Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object { [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterName', $_) }
}
