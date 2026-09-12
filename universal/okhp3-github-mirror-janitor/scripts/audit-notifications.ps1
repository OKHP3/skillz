[CmdletBinding()]
param(
    [switch]$IncludeRead,
    [switch]$MarkDone,
    [string[]]$ThreadId,
    [ValidateRange(1, 100)]
    [int]$MaxPages = 20
)

$ErrorActionPreference = 'Stop'

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw 'GitHub CLI (gh) is required.'
}

if ($MarkDone -and (-not $ThreadId -or $ThreadId.Count -eq 0)) {
    throw 'MarkDone requires one or more exact ThreadId values.'
}

if ($ThreadId | Where-Object { $_ -notmatch '^\d+$' }) {
    throw 'ThreadId values must be numeric GitHub notification thread IDs.'
}

$ThreadId = @($ThreadId | Sort-Object -Unique)

$notifications = @()
$pagesRead = 0
$terminatedByEmptyPage = $false
$allValue = if ($IncludeRead -or $MarkDone) { 'true' } else { 'false' }
for ($page = 1; $page -le $MaxPages; $page++) {
    $raw = @(gh api -X GET notifications -f "all=$allValue" -f participating=false -f per_page=100 -f page=$page)
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to read GitHub notifications page $page."
    }
    $pagesRead++
    $chunk = @()
    if ($raw.Count -gt 0) {
        $chunk = @((($raw -join "`n") | ConvertFrom-Json))
    }
    if ($chunk.Count -eq 0) {
        $terminatedByEmptyPage = $true
        break
    }
    $notifications += $chunk
}

$items = foreach ($notification in $notifications) {
    [pscustomobject]@{
        id = [string]$notification.id
        unread = [bool]$notification.unread
        repository = [string]$notification.repository.full_name
        reason = [string]$notification.reason
        subjectType = [string]$notification.subject.type
        subjectTitle = [string]$notification.subject.title
        subjectApiUrl = [string]$notification.subject.url
        updatedAt = [string]$notification.updated_at
    }
}

$markedDone = @()
$errors = @()
if ($MarkDone) {
    foreach ($id in $ThreadId) {
        gh api -X DELETE "notifications/threads/$id" *> $null
        if ($LASTEXITCODE -eq 0) {
            $markedDone += $id
        } else {
            $errors += $id
        }
    }
}

[pscustomobject]@{
    generatedAt = (Get-Date).ToString('o')
    includeRead = [bool]($IncludeRead -or $MarkDone)
    pagesRead = $pagesRead
    maxPages = $MaxPages
    coverageComplete = [bool]$terminatedByEmptyPage
    coverageNote = if ($terminatedByEmptyPage) { 'Pagination reached an empty page.' } else { 'The MaxPages cap was reached before an empty page; increase MaxPages before claiming complete coverage.' }
    notificationCount = $items.Count
    unreadCount = @($items | Where-Object { $_.unread }).Count
    notifications = @($items)
    markedDone = @($markedDone)
    markDoneErrors = @($errors)
} | ConvertTo-Json -Depth 8
