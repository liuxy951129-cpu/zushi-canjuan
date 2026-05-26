#!/usr/bin/env python3
"""v1.02 + 高清场景图(只白天版，黑夜用 CSS filter) + 10 技能 icon"""
import urllib.parse, urllib.request, time, os

ROOT = os.path.dirname(os.path.abspath(__file__))
SCENE = os.path.join(ROOT, "assets/scenes")
ICONS = os.path.join(ROOT, "assets/icons")
os.makedirs(SCENE, exist_ok=True)
os.makedirs(ICONS, exist_ok=True)

# 用 hi_ 前缀，避免覆盖之前的；同时高分辨率 + 详细prompt
HI_SCENES = [
    ("hi_sc_temple.jpg",   "ultra detailed ancient Chinese xianxia ancestor temple interior, intricate wooden beams carved dragons, golden buddha statue glowing, hanging crimson lanterns, atmospheric dust particles in light beams, oil painting masterpiece, 8k cinematic"),
    ("hi_sc_dantang.jpg",  "ultra detailed ancient Chinese alchemy pavilion interior, copper bronze cauldron with green flame, hundreds of herbs hanging from beams, glowing pills floating in air, wooden shelves with porcelain jars, oil painting masterpiece, 8k cinematic"),
    ("hi_sc_battle.jpg",   "ultra detailed ancient Chinese martial arts training ground large courtyard, weapon racks with swords spears, stone slab floor, distant mountains, cherry blossom petals falling, oil painting masterpiece, 8k cinematic"),
    ("hi_sc_courtyard.jpg","ultra detailed ancient Chinese xianxia courtyard, koi pond bridge cherry blossom trees, traditional wooden pavilion roof tiles, distant mountain peaks in mist, oil painting masterpiece, 8k cinematic"),
    ("hi_map_sect.jpg",    "ultra detailed isometric ancient Chinese xianxia sect mountain top-down map, 5 distinct buildings on terraced cliff temple center alchemy hut left training ground right scripture pavilion top herb fields bottom, winding stone paths between buildings, surrounding pine forests cloud sea, intricate ink wash painting masterpiece, 8k cinematic"),
]

# 技能 icon (10 个通用 + 6 个专属共 16，但精品弟子的技能共 30+ 个无法全 AI 生)
# 先生 10 通用树各一个代表性 icon
SKILL_ICONS = [
    ("sk_metal_phys.png",  "ancient Chinese xianxia golden sword icon glowing metallic energy aura on dark velvet background, oil painting game skill icon"),
    ("sk_metal_magic.png", "ancient Chinese xianxia golden bell ringing with light waves on dark velvet background, oil painting game skill icon"),
    ("sk_wood_phys.png",   "ancient Chinese xianxia green vine whip with leaves on dark velvet background, oil painting game skill icon"),
    ("sk_wood_magic.png",  "ancient Chinese xianxia glowing green spirit tree with floating petals on dark velvet background, oil painting game skill icon"),
    ("sk_water_phys.png",  "ancient Chinese xianxia blue wave water blade slash on dark velvet background, oil painting game skill icon"),
    ("sk_water_magic.png", "ancient Chinese xianxia blue ice crystal frost spell on dark velvet background, oil painting game skill icon"),
    ("sk_fire_phys.png",   "ancient Chinese xianxia red flaming sabre blade on dark velvet background, oil painting game skill icon"),
    ("sk_fire_magic.png",  "ancient Chinese xianxia red phoenix flame circle on dark velvet background, oil painting game skill icon"),
    ("sk_earth_phys.png",  "ancient Chinese xianxia brown stone fist mountain peak on dark velvet background, oil painting game skill icon"),
    ("sk_earth_magic.png", "ancient Chinese xianxia yellow earth talisman with runes on dark velvet background, oil painting game skill icon"),
    # 6 专属
    ("sk_sig_chenyuan.png","ancient Chinese xianxia long blue river sword with flowing water glow on dark velvet background, oil painting signature skill icon"),
    ("sk_sig_lingxue.png", "ancient Chinese xianxia crystal ice sword frost mist swirling on dark velvet background, oil painting signature skill icon"),
    ("sk_sig_shixiong.png","ancient Chinese xianxia notched red battle sabre cracked blade on dark velvet background, oil painting signature skill icon"),
    ("sk_sig_xiaoyu.png",  "ancient Chinese xianxia jade bamboo flute soft moonlight halo on dark velvet background, oil painting signature skill icon"),
    ("sk_sig_heimo.png",   "ancient Chinese xianxia dark blood dagger crimson mist on dark velvet background, oil painting signature skill icon"),
    ("sk_sig_master.png",  "ancient Chinese xianxia yellow ancient scroll opening with golden light beams on dark velvet background, oil painting signature skill icon"),
]

def fetch(folder, fname, prompt, w, h):
    out = os.path.join(folder, fname)
    if os.path.exists(out) and os.path.getsize(out) > 5000:
        print(f"[SKIP] {fname}", flush=True); return True
    url = f"https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt)}?width={w}&height={h}&nologo=true&seed={hash(fname)%99999}"
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=150) as r:
                data = r.read()
            if len(data) > 5000:
                with open(out, "wb") as f: f.write(data)
                print(f"[OK] {fname} {len(data)//1024}KB", flush=True); return True
        except Exception as e:
            print(f"[retry {attempt+1}] {fname}: {e}", flush=True)
        time.sleep(6)
    print(f"[FAIL] {fname}", flush=True)
    return False

def main():
    # 1) 高清场景
    print("== HI scenes ==", flush=True)
    for fn, p in HI_SCENES:
        w = 1536; h = 1024 if "map" not in fn else 1024
        fetch(SCENE, fn, p, w, h)
        time.sleep(2)
    # 2) 技能图标
    print("\n== Skill icons ==", flush=True)
    for fn, p in SKILL_ICONS:
        fetch(ICONS, fn, p, 384, 384)
        time.sleep(2)
    print("Done", flush=True)

if __name__ == "__main__":
    main()
