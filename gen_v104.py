import os, time, urllib.parse, urllib.request, sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))

BASE = "https://image.pollinations.ai/prompt/"
PORT_DIR = "assets/portraits"
SCENE_DIR = "assets/scenes"

# 7 派每派 5 人（leader + 4），共 35 张敌方立绘
# (file, prompt)
PORT_TASKS = [
  # 雷霆门（刚猛剑修）
  ("e_thunder_leader", "anime portrait, fierce middle-aged male thunder sect master, golden lightning eyes, white hair, ornate red and gold robe, electric arcs, oriental fantasy, detailed, dramatic lighting"),
  ("e_thunder_a", "anime portrait, young male sword cultivator, red robe, lightning sword, intense gaze, oriental fantasy"),
  ("e_thunder_b", "anime portrait, female warrior, short red hair, leather armor, lightning whip, fierce smile, oriental fantasy"),
  ("e_thunder_c", "anime portrait, muscular male warrior, scar on face, broadsword, red headband, oriental fantasy"),
  ("e_thunder_d", "anime portrait, elder male martial artist, white beard, twin daggers, red and gold robe, oriental fantasy"),
  # 落霞谷（炼丹经营）
  ("e_luoxia_leader", "anime portrait, mature female sect leader, elegant orange-red robe, jade hairpin, gentle smile, alchemy furnace behind, oriental fantasy"),
  ("e_luoxia_a", "anime portrait, young female alchemist, orange robe, holding pill bottle, kind eyes, oriental fantasy"),
  ("e_luoxia_b", "anime portrait, male medicine master, yellow robe, herbal pouch, calm face, oriental fantasy"),
  ("e_luoxia_c", "anime portrait, female cultivator, fan in hand, sunset gradient robe, oriental fantasy"),
  ("e_luoxia_d", "anime portrait, young male herbalist, brown robe, basket of herbs, friendly smile, oriental fantasy"),
  # 玄阴宗（暗黑邪修）
  ("e_xuanyin_leader", "anime portrait, sinister male dark sect leader, black hooded robe, purple eyes glowing, pale skin, dark aura, oriental dark fantasy"),
  ("e_xuanyin_a", "anime portrait, female ghost cultivator, long black hair, purple ghost flames, pale face, oriental dark fantasy"),
  ("e_xuanyin_b", "anime portrait, male necromancer, black robe with skulls, scythe, oriental dark fantasy"),
  ("e_xuanyin_c", "anime portrait, female assassin, dark veil, dual daggers, purple eyes, oriental dark fantasy"),
  ("e_xuanyin_d", "anime portrait, male dark mage, hood, glowing runes, oriental dark fantasy"),
  # 紫薇阁（书院儒修）
  ("e_ziwei_leader", "anime portrait, scholarly male sect leader, purple robe with stars embroidery, white hair tied up, holding fan, wise eyes, oriental fantasy"),
  ("e_ziwei_a", "anime portrait, young scholar male, purple robe, holding scroll, gentle face, oriental fantasy"),
  ("e_ziwei_b", "anime portrait, female scholar, blue purple robe, calligraphy brush, elegant, oriental fantasy"),
  ("e_ziwei_c", "anime portrait, male astrologer, purple robe with star pattern, holding compass, oriental fantasy"),
  ("e_ziwei_d", "anime portrait, young female sword scholar, purple uniform, slim sword, focused, oriental fantasy"),
  # 血月教（魔教）
  ("e_xueyue_leader", "anime portrait, demonic male cult leader, dark red robe, blood moon symbol, crimson eyes, long black hair, evil smile, oriental dark fantasy"),
  ("e_xueyue_a", "anime portrait, blood cultivator female, red robe, blood splatter, mad eyes, oriental dark fantasy"),
  ("e_xueyue_b", "anime portrait, male demon warrior, dark red armor, curved blade, oriental dark fantasy"),
  ("e_xueyue_c", "anime portrait, female priestess, red veil, ritual dagger, oriental dark fantasy"),
  ("e_xueyue_d", "anime portrait, blood mage male, tattoos, red robe, dark fantasy"),
  # 虚仙宗（仙门）
  ("e_xuxian_leader", "anime portrait, ethereal male immortal sect leader, white silver robe, long silver hair, jade pendant, serene face, oriental fantasy"),
  ("e_xuxian_a", "anime portrait, fairy female cultivator, white silk robe, floating ribbons, gentle smile, oriental fantasy"),
  ("e_xuxian_b", "anime portrait, immortal swordsman male, white robe, long white sword, calm, oriental fantasy"),
  ("e_xuxian_c", "anime portrait, fairy maiden, light blue robe, lotus, ethereal, oriental fantasy"),
  ("e_xuxian_d", "anime portrait, immortal sage male, white beard, staff, divine glow, oriental fantasy"),
]

# 7 张战斗背景图
SCENE_TASKS = [
  ("bg_battle_thunder", "epic anime battle background, mountain peak with thunder storm, lightning, dark clouds, oriental sect, dramatic, no characters, landscape"),
  ("bg_battle_luoxia",  "anime battle background, sunset valley with peach blossoms, golden hour, oriental pavilion, dramatic, no characters"),
  ("bg_battle_xuanyin", "anime dark fantasy battle background, abyss with purple flames, broken stone pillars, fog, no characters, dramatic"),
  ("bg_battle_ziwei",   "anime battle background, ancient academy courtyard at dusk, purple sky with stars, scrolls floating, no characters"),
  ("bg_battle_xueyue",  "anime dark fantasy battle background, blood red moon, ritual altar, dark mountains, eerie, no characters"),
  ("bg_battle_xuxian",  "anime ethereal battle background, floating mountains in clouds, divine light, white pavilion, no characters"),
  ("bg_battle_arena",   "anime battle background, sect martial arts arena, stone platform, torches, dusk, no characters, dramatic"),
]

def gen(prompt, fname, w=512, h=640, seed=42):
  url = BASE + urllib.parse.quote(prompt) + f"?width={w}&height={h}&model=turbo&seed={seed}&nologo=true"
  for attempt in range(3):
    try:
      req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
      with urllib.request.urlopen(req, timeout=80) as r:
        data = r.read()
      if len(data) < 5000:
        raise Exception("too small")
      with open(fname, "wb") as f: f.write(data)
      print(f"OK  {fname} ({len(data)//1024}KB)", flush=True)
      return True
    except Exception as e:
      print(f"  retry {attempt+1} {fname}: {e}", flush=True)
      time.sleep(2)
  print(f"FAIL {fname}", flush=True)
  return False

os.makedirs(PORT_DIR, exist_ok=True)
os.makedirs(SCENE_DIR, exist_ok=True)

print("=== portraits (35) ===", flush=True)
for i,(name,p) in enumerate(PORT_TASKS):
  fp = f"{PORT_DIR}/{name}.jpg"
  if os.path.exists(fp) and os.path.getsize(fp) > 5000:
    print(f"skip {name}", flush=True); continue
  gen(p, fp, 512, 640, seed=100+i)

print("=== scenes (7) ===", flush=True)
for i,(name,p) in enumerate(SCENE_TASKS):
  fp = f"{SCENE_DIR}/{name}.jpg"
  if os.path.exists(fp) and os.path.getsize(fp) > 5000:
    print(f"skip {name}", flush=True); continue
  gen(p, fp, 1280, 720, seed=200+i)

print("=== done ===", flush=True)
