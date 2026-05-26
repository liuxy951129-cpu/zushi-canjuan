import os, time, urllib.parse, urllib.request, concurrent.futures
os.chdir(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://image.pollinations.ai/prompt/"

PORT_DIR = "assets/portraits"
SCENE_DIR = "assets/scenes"

PORT_TASKS = [
  ("e_thunder_leader", "anime portrait, fierce thunder sect master, golden lightning eyes, white hair, red gold robe, oriental fantasy"),
  ("e_thunder_a", "anime portrait young male sword cultivator red robe lightning sword oriental fantasy"),
  ("e_thunder_b", "anime portrait female warrior short red hair leather armor lightning whip oriental fantasy"),
  ("e_thunder_c", "anime portrait muscular male warrior scar broadsword red headband oriental fantasy"),
  ("e_thunder_d", "anime portrait elder male martial artist white beard twin daggers red robe oriental fantasy"),
  ("e_luoxia_leader", "anime portrait mature female sect leader orange robe jade hairpin alchemy oriental fantasy"),
  ("e_luoxia_a", "anime portrait young female alchemist orange robe pill bottle oriental fantasy"),
  ("e_luoxia_b", "anime portrait male medicine master yellow robe herbal pouch oriental fantasy"),
  ("e_luoxia_c", "anime portrait female cultivator fan sunset gradient robe oriental fantasy"),
  ("e_luoxia_d", "anime portrait young male herbalist brown robe basket of herbs oriental fantasy"),
  ("e_xuanyin_leader", "anime portrait sinister male dark sect leader black hooded robe purple eyes pale skin oriental dark fantasy"),
  ("e_xuanyin_a", "anime portrait female ghost cultivator long black hair purple flames pale face oriental dark fantasy"),
  ("e_xuanyin_b", "anime portrait male necromancer black robe skulls scythe oriental dark fantasy"),
  ("e_xuanyin_c", "anime portrait female assassin dark veil dual daggers purple eyes oriental dark fantasy"),
  ("e_xuanyin_d", "anime portrait male dark mage hood glowing runes oriental dark fantasy"),
  ("e_ziwei_leader", "anime portrait scholarly male sect leader purple robe stars white hair fan oriental fantasy"),
  ("e_ziwei_a", "anime portrait young scholar male purple robe scroll oriental fantasy"),
  ("e_ziwei_b", "anime portrait female scholar blue purple robe calligraphy brush oriental fantasy"),
  ("e_ziwei_c", "anime portrait male astrologer purple star robe compass oriental fantasy"),
  ("e_ziwei_d", "anime portrait young female sword scholar purple uniform slim sword oriental fantasy"),
  ("e_xueyue_leader", "anime portrait demonic male cult leader dark red robe blood moon crimson eyes black hair oriental dark fantasy"),
  ("e_xueyue_a", "anime portrait blood cultivator female red robe blood splatter mad eyes oriental dark fantasy"),
  ("e_xueyue_b", "anime portrait male demon warrior dark red armor curved blade oriental dark fantasy"),
  ("e_xueyue_c", "anime portrait female priestess red veil ritual dagger oriental dark fantasy"),
  ("e_xueyue_d", "anime portrait blood mage male tattoos red robe dark fantasy"),
  ("e_xuxian_leader", "anime portrait ethereal male immortal sect leader white silver robe long silver hair jade pendant serene oriental fantasy"),
  ("e_xuxian_a", "anime portrait fairy female cultivator white silk robe ribbons gentle smile oriental fantasy"),
  ("e_xuxian_b", "anime portrait immortal swordsman male white robe long white sword oriental fantasy"),
  ("e_xuxian_c", "anime portrait fairy maiden light blue robe lotus ethereal oriental fantasy"),
  ("e_xuxian_d", "anime portrait immortal sage male white beard staff divine glow oriental fantasy"),
]

SCENE_TASKS = [
  ("bg_battle_thunder", "epic anime battle background mountain peak thunder storm lightning dark clouds oriental sect no characters"),
  ("bg_battle_luoxia",  "anime battle background sunset valley peach blossoms golden hour oriental pavilion no characters"),
  ("bg_battle_xuanyin", "anime dark fantasy battle background abyss purple flames broken stone pillars fog no characters"),
  ("bg_battle_ziwei",   "anime battle background ancient academy courtyard dusk purple sky stars scrolls floating no characters"),
  ("bg_battle_xueyue",  "anime dark fantasy battle background blood red moon ritual altar dark mountains no characters"),
  ("bg_battle_xuxian",  "anime ethereal battle background floating mountains clouds divine light white pavilion no characters"),
  ("bg_battle_arena",   "anime battle background sect martial arts arena stone platform torches dusk no characters"),
]

def gen(args):
  name, prompt, fname, w, h, seed = args
  if os.path.exists(fname) and os.path.getsize(fname) > 5000:
    return f"SKIP {name}"
  url = BASE + urllib.parse.quote(prompt) + f"?width={w}&height={h}&model=turbo&seed={seed}&nologo=true"
  for attempt in range(3):
    try:
      req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
      with urllib.request.urlopen(req, timeout=90) as r:
        data = r.read()
      if len(data) < 5000: raise Exception("too small")
      with open(fname, "wb") as f: f.write(data)
      return f"OK {name} {len(data)//1024}KB"
    except Exception as e:
      time.sleep(3)
  return f"FAIL {name}"

os.makedirs(PORT_DIR, exist_ok=True)
os.makedirs(SCENE_DIR, exist_ok=True)

tasks = []
for i,(n,p) in enumerate(PORT_TASKS):
  tasks.append((n, p, f"{PORT_DIR}/{n}.jpg", 512, 640, 100+i))
for i,(n,p) in enumerate(SCENE_TASKS):
  tasks.append((n, p, f"{SCENE_DIR}/{n}.jpg", 1280, 720, 200+i))

with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
  for r in ex.map(gen, tasks):
    print(r, flush=True)
print("DONE", flush=True)
