#!/usr/bin/env bash
# Quick health check for all ARE verse lookup API providers.
# Tests one known-good request against each provider.
# Exit code 0 = all primary providers healthy. Exit code 1 = one or more failed.
#
# Usage: bash .agents/skills/okhp3-verse-lookup/scripts/health-check.sh

set -euo pipefail

PASS=0
FAIL=0
WARN=0

check() {
  local label="$1"
  local url="$2"
  local jq_test="$3"
  local mode="${4:-primary}"

  HTTP=$(curl -s -o /tmp/are_check.json -w "%{http_code}" --max-time 8 "$url" 2>/dev/null || echo "000")

  if [[ "$HTTP" != "200" ]]; then
    if [[ "$mode" == "primary" ]]; then
      echo "FAIL  [$label] HTTP $HTTP  $url"
      FAIL=$((FAIL + 1))
    else
      echo "WARN  [$label] HTTP $HTTP  $url (non-primary)"
      WARN=$((WARN + 1))
    fi
    return
  fi

  VALUE=$(jq -r "$jq_test" /tmp/are_check.json 2>/dev/null || echo "PARSE_ERROR")
  if [[ -z "$VALUE" || "$VALUE" == "null" || "$VALUE" == "PARSE_ERROR" ]]; then
    if [[ "$mode" == "primary" ]]; then
      echo "FAIL  [$label] Response OK but field missing  $url"
      FAIL=$((FAIL + 1))
    else
      echo "WARN  [$label] Response OK but field missing  $url (non-primary)"
      WARN=$((WARN + 1))
    fi
  else
    echo "PASS  [$label] HTTP 200, field present"
    PASS=$((PASS + 1))
  fi
}

echo "=== ARE Verse Lookup API Health Check ==="
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""

# Judaism -- Sefaria
check "Sefaria (Psalms 23:1)" \
  "https://www.sefaria.org/api/texts/Psalms%2023:1?lang=en" \
  ".text" \
  "primary"

# Christianity -- bible-api.com (WEB translation, public domain)
check "bible-api.com (John 3:16, WEB)" \
  "https://bible-api.com/john%203:16?translation=web" \
  ".text" \
  "primary"

# Islam -- Quran.com v4
check "Quran.com v4 (Al-Fatiha 1:1, Sahih Int'l)" \
  "https://api.quran.com/api/v4/verses/by_key/1:1?language=en&translations=20&words=false" \
  ".verse.verse_key" \
  "primary"

# Islam fallback -- AlQuran.cloud
check "AlQuran.cloud (1:1, en.asad)" \
  "https://api.alquran.cloud/v1/ayah/1:1/en.asad" \
  ".data.text" \
  "fallback"

# Hadith CDN (fallback / non-primary)
check "Hadith CDN (Bukhari vol1 book1)" \
  "https://cdn.jsdelivr.net/npm/hadith-api@1.2.5/data/bukhari/english/collection.min.json" \
  ".[0].bookname" \
  "fallback"

echo ""
echo "=== Summary ==="
echo "PASS: $PASS  FAIL: $FAIL  WARN: $WARN"
echo ""

if [[ $FAIL -gt 0 ]]; then
  echo "One or more primary providers failed."
  exit 1
else
  echo "All primary providers healthy."
  exit 0
fi
