#!/usr/bin/env bash
# 用 buddy-cloud 串行生成道具 icon
set -e
TOKEN="${BUDDY_CLOUD_TOKEN}"
OUT_DIR="$(cd "$(dirname "$0")" && pwd)/assets/icons"
mkdir -p "$OUT_DIR"
BUDDY=/Users/xinyiliu/WorkBuddy/automation-claw-20260408211517/buddy-cloud.py

declare -a JOBS=(
  "it_sw_qingyin|ancient Chinese bamboo flute silver-wrapped section, single object on dark velvet background, oil painting, soft moonlight glow, xianxia game item icon, 1:1"
  "it_sw_xueyu|dark Chinese assassin dagger blood-red blade obsidian handle, single object on dark velvet background, dark fantasy oil painting, game item icon, 1:1"
  "it_sw_canjuan|ancient yellowed scroll scripture rolled with red wax seal, single object on dark velvet background, oil painting xianxia game item icon, 1:1"
  "it_sw_iron|simple iron sword bronze hilt rough texture, single object on dark velvet background, oil painting, basic weapon game icon, 1:1"
  "it_sw_sunmoon|twin Chinese rings sun and moon weapon golden glow, single object on dark velvet background, divine xianxia oil painting, game item icon, 1:1"
  "it_pill_ningshen|single round green-jade glowing immortal pill in a porcelain bowl, faint mist, on dark velvet background, xianxia oil painting, game item icon, 1:1"
  "it_pill_huiyuan|single golden glowing immortal cinnabar pill, soft amber glow, on dark velvet background, xianxia oil painting, game item icon, 1:1"
  "it_pill_dagong|single red-fire glowing volatile pill cracks of light, on dark velvet background, dark xianxia oil painting, game item icon, 1:1"
  "it_pill_dujie|single deep purple glowing immortal pill with thunder pattern, on dark velvet background, xianxia oil painting, ultra-rare game item icon, 1:1"
  "it_gf_silkfan|Chinese antique silk fan with painted blossoms partially open, single object on dark velvet background, oil painting game item icon, 1:1"
  "it_gf_armor|antique Chinese soft leather armor folded vest, single object on dark velvet background, oil painting game item icon, 1:1"
  "it_gf_inkstone|antique Chinese inkstone with engraved dragon, single object on dark velvet background, oil painting game item icon, 1:1"
  "it_gf_winejar|small Chinese antique wine jar with bamboo seal, single object on dark velvet background, oil painting game item icon, 1:1"
  "it_gf_silvercomb|antique silver comb engraved with characters, single object on dark velvet background, oil painting game item icon, 1:1"
  "it_sc_canjuan|ancient yellowed scroll half-open red seal cinnabar text, single object on dark velvet background, xianxia oil painting game item icon, 1:1"
  "it_sc_thunder|torn parchment scroll with thunder rune crackling sparks, single object on dark velvet background, oil painting game item icon, 1:1"
  "it_sc_xuanyin|dark torn scroll with blood-red sigil shadowy mist, single object on dark velvet background, dark fantasy oil painting game item icon, 1:1"
)

for entry in "${JOBS[@]}"; do
  name="${entry%%|*}"
  prompt="${entry#*|}"
  out="$OUT_DIR/$name.png"
  if [ -f "$out" ] && [ "$(stat -f%z "$out" 2>/dev/null || stat -c%s "$out")" -gt 5000 ]; then
    echo "[SKIP] $name (exists)"
    continue
  fi

  echo "==> [$name]"
  attempt=0
  ok=0
  while [ $attempt -lt 3 ] && [ $ok -eq 0 ]; do
    attempt=$((attempt+1))
    out_text=$(BUDDY_CLOUD_TOKEN="$TOKEN" timeout 90 python3 "$BUDDY" image "$prompt" 2>&1) || true
    url=$(echo "$out_text" | grep -oE 'https://[^ ]*\.(png|jpg|jpeg|webp)' | head -1)
    if [ -n "$url" ]; then
      curl -sSL "$url" -o "$out"
      sz=$(stat -f%z "$out" 2>/dev/null || stat -c%s "$out")
      if [ "$sz" -gt 5000 ]; then
        echo "  [OK] $name ${sz}B"
        ok=1
      fi
    fi
    if [ $ok -eq 0 ]; then
      echo "  [retry $attempt] no url"
      sleep 4
    fi
  done
  [ $ok -eq 0 ] && echo "  [FAIL] $name"
  sleep 1
done
echo "All done."
