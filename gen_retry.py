import os, time, urllib.parse, urllib.request, concurrent.futures
os.chdir(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://image.pollinations.ai/prompt/"

# 缺的 6 portrait
PORTS = [
  ("e_xueyue_d", "anime portrait blood mage male tattoos red robe dark fantasy", 524),
  ("e_xuxian_leader", "anime portrait ethereal male immortal sect leader silver hair white robe jade pendant oriental fantasy", 525),
  ("e_xuxian_a", "anime portrait fairy female cultivator white silk robe ribbons gentle oriental fantasy", 526),
  ("e_xuxian_b", "anime portrait immortal swordsman male white robe long sword oriental fantasy", 527),
  ("e_xuxian_c", "anime portrait fairy maiden light blue robe lotus ethereal oriental fantasy", 528),
  ("e_xuxian_d", "anime portrait immortal sage male white beard staff divine glow oriental fantasy", 529),
]
# scenes 改 800x500
SCENES = [
  ("bg_battle_thunder", "epic anime battle background mountain peak thunder storm lightning dark clouds no characters"),
  ("bg_battle_luoxia",  "anime battle background sunset valley peach blossoms golden hour oriental pavilion no characters"),
  ("bg_battle_xuanyin", "anime dark fantasy battle background abyss purple flames broken pillars fog no characters"),
  ("bg_battle_ziwei",   "anime battle background ancient academy courtyard dusk purple sky scrolls no characters"),
  ("bg_battle_xueyue",  "anime dark battle background blood red moon ritual altar dark mountains no characters"),
  ("bg_battle_xuxian",  "anime ethereal battle background floating mountains clouds divine light no characters"),
  ("bg_battle_arena",   "anime battle background sect martial arts arena stone platform torches dusk no characters"),
]

def gen(args):
  name, prompt, fname, w, h, seed = args
  if os.path.exists(fname) and os.path.getsize(fname) > 5000:
    return f"SKIP {name}"
  url = BASE + urllib.parse.quote(prompt) + f"?width={w}&height={h}&model=turbo&seed={seed}&nologo=true"
  for attempt in range(4):
    try:
      req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
      with urllib.request.urlopen(req, timeout=120) as r:
        data = r.read()
      if len(data) < 5000: raise Exception("too small")
      with open(fname, "wb") as f: f.write(data)
      return f"OK {name} {len(data)//1024}KB"
    except Exception as e:
      print(f" retry {name} {attempt}: {e}", flush=True)
      time.sleep(5)
  return f"FAIL {name}"

tasks = []
for n,p,s in PORTS:
  tasks.append((n, p, f"assets/portraits/{n}.jpg", 512, 640, s))
for i,(n,p) in enumerate(SCENES):
  tasks.append((n, p, f"assets/scenes/{n}.jpg", 800, 500, 600+i))

with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:
  for r in ex.map(gen, tasks):
    print(r, flush=True)
print("DONE", flush=True)
