[CmdletBinding()]
param(
    [string]$Root = $env:OKHP3_GITHUB_MIRROR_ROOT,
    [switch]$RefreshMain,
    [switch]$CheckRemote
)

$ErrorActionPreference = 'Continue'

if ([string]::IsNullOrWhiteSpace($Root)) {
    throw 'Mirror root is required. Pass -Root <path> or set OKHP3_GITHUB_MIRROR_ROOT.'
}

function Invoke-GitText {
    param(
        [Parameter(Mandatory)] [string]$Repository,
        [Parameter(Mandatory)] [string[]]$Arguments
    )
    @(& git -C $Repository @Arguments 2>$null | ForEach-Object { [string]$_ })
}

function Get-CountPair {
    param([string[]]$Lines)
    $value = ($Lines -join '')
    if ($value -match '^\s*(\d+)\s+(\d+)\s*$') {
        return [pscustomobject]@{ left = [int]$matches[1]; right = [int]$matches[2] }
    }
    return $null
}

if (-not (Test-Path -LiteralPath $Root -PathType Container)) {
    throw "Git mirror root does not exist: $Root"
}

$repoPaths = @(
    Get-ChildItem -LiteralPath $Root -Recurse -Force -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -eq '.git' } |
        ForEach-Object { Split-Path -Parent $_.FullName } |
        Sort-Object -Unique
)

$repositories = foreach ($repository in $repoPaths) {
    $origin = (Invoke-GitText $repository @('remote', 'get-url', 'origin')) -join ''
    $fetchError = $null

    if ($RefreshMain -and $origin) {
        $fetchOutput = @(& git -C $repository fetch --no-tags origin main 2>&1 | ForEach-Object { [string]$_ })
        if ($LASTEXITCODE -ne 0) { $fetchError = ($fetchOutput -join ' | ') }
    }

    $branch = (Invoke-GitText $repository @('branch', '--show-current')) -join ''
    if (-not $branch) { $branch = '(detached)' }
    $head = (Invoke-GitText $repository @('rev-parse', 'HEAD')) -join ''
    $originMain = (Invoke-GitText $repository @('rev-parse', 'refs/remotes/origin/main')) -join ''
    $status = @(Invoke-GitText $repository @('status', '--short', '--untracked-files=all'))
    $localBranches = @(Invoke-GitText $repository @('for-each-ref', '--format=%(refname:short)', 'refs/heads') | Where-Object { $_ })
    $upstream = (Invoke-GitText $repository @('rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}')) -join ''

    $headDelta = $null
    $workingTreeVariance = @()
    if ($originMain) {
        $headDelta = Get-CountPair (Invoke-GitText $repository @('rev-list', '--left-right', '--count', 'refs/remotes/origin/main...HEAD'))
        $workingTreeVariance = @(Invoke-GitText $repository @('diff', '--name-status', 'refs/remotes/origin/main'))
    }

    $branches = foreach ($localBranch in $localBranches) {
        $delta = $null
        $fullyMerged = $false
        if ($originMain) {
            $delta = Get-CountPair (Invoke-GitText $repository @('rev-list', '--left-right', '--count', "refs/remotes/origin/main...$localBranch"))
            & git -C $repository merge-base --is-ancestor $localBranch refs/remotes/origin/main 2>$null
            $fullyMerged = ($LASTEXITCODE -eq 0)
        }
        $branchUpstream = (Invoke-GitText $repository @('for-each-ref', '--format=%(upstream:short)', "refs/heads/$localBranch")) -join ''
        $branchHead = (Invoke-GitText $repository @('rev-parse', $localBranch)) -join ''
        $last = (Invoke-GitText $repository @('log', '-1', '--format=%aI`t%s', $localBranch)) -join ''
        [pscustomobject]@{
            name = $localBranch
            head = $branchHead
            upstream = $branchUpstream
            originMainOnly = if ($delta) { $delta.left } else { $null }
            branchOnly = if ($delta) { $delta.right } else { $null }
            fullyMergedIntoOriginMain = $fullyMerged
            lastCommit = $last
        }
    }

    $remoteBranches = @()
    if ($CheckRemote -and $origin) {
        $remoteLines = @(& git -C $repository ls-remote --heads origin 2>$null | ForEach-Object { [string]$_ })
        foreach ($line in $remoteLines) {
            if ($line -match 'refs/heads/(.+)$') { $remoteBranches += $matches[1] }
        }
    }

    [pscustomobject]@{
        path = $repository
        origin = $origin
        currentBranch = $branch
        head = $head
        originMain = $originMain
        originMainOnly = if ($headDelta) { $headDelta.left } else { $null }
        headOnly = if ($headDelta) { $headDelta.right } else { $null }
        upstream = $upstream
        dirty = ($status.Count -gt 0)
        status = $status
        workingTreeVarianceAgainstOriginMain = $workingTreeVariance
        fetchError = $fetchError
        branches = @($branches)
        remoteBranches = $remoteBranches
    }
}

[pscustomobject]@{
    generatedAt = (Get-Date).ToString('o')
    root = (Resolve-Path -LiteralPath $Root).Path
    refreshMain = [bool]$RefreshMain
    checkRemote = [bool]$CheckRemote
    repositoryCount = $repositories.Count
    dirtyRepositoryCount = @($repositories | Where-Object dirty).Count
    repositories = $repositories
} | ConvertTo-Json -Depth 10
