import subprocess, json, os, urllib.request

BC = "/Users/xinyiliu/Library/Caches/com.workbuddy.workbuddy.ShipIt/update.ivsyDLK/WorkBuddy.app/Contents/Resources/app.asar.unpacked/resources/builtin-skills/buddy-multimodal-generation/scripts/buddy-cloud.py"
TT = "tk_HBM5VyECrMrvbIvJGPn4H4Tb9XC1SAXR"

JOBS = [
  # 缺的 portraits（768:1024 大头像）
  ("assets/portraits/e_xuxian_leader.jpg", "anime portrait ethereal male immortal sect leader silver hair white robe jade pendant serene oriental fantasy", "768:1024"),
  ("assets/portraits/e_xuxian_a.jpg",      "anime portrait fairy female cultivator white silk robe ribbons gentle smile oriental fantasy",                "768:1024"),
  ("assets/portraits/e_xuxian_c.jpg",      "anime portrait fairy maiden light blue robe holding lotus ethereal oriental fantasy",                          "768:1024"),
  ("assets/portraits/e_xuxian_d.jpg",      "anime portrait immortal sage male white beard staff divine glow white robe oriental fantasy",                  "768:1024"),
  # 战斗背景 1280:720（buddy 支持但要 *1024 限制：1280*720=921600 < 1024*1024=1048576 OK）
  ("assets/scenes/bg_battle_thunder.jpg", "epic cinematic battle background mountain peak thunder storm lightning dark clouds oriental sect dramatic landscape no characters",          "1280:720"),
  ("assets/scenes/bg_battle_luoxia.jpg",  "cinematic battle background sunset valley with peach blossoms golden hour oriental pavilion dramatic no characters",                          "1280:720"),
  ("assets/scenes/bg_battle_xuanyin.jpg", "cinematic dark fantasy battle background abyss with purple flames broken stone pillars fog dramatic no characters",                            "1280:720"),
  ("assets/scenes/bg_battle_ziwei.jpg",   "cinematic battle background ancient academy courtyard at dusk purple sky with stars scrolls floating no characters",                           "1280:720"),
  ("assets/scenes/bg_battle_xueyue.jpg",  "cinematic dark fantasy battle background blood red moon ritual altar dark mountains eerie no characters",                                     "1280:720"),
  ("assets/scenes/bg_battle_xuxian.jpg",  "cinematic ethereal battle background floating mountains in clouds divine light white pavilion no characters",                                  "1280:720"),
]

def run_one(fname, prompt, res):
  if os.path.exists(fname) and os.path.getsize(fname) > 5000:
    print(f"SKIP {fname}"); return True
  for attempt in range(3):
    try:
      r = subprocess.run(["python3", BC, "image", prompt, "--resolution", res, "--revise", "0", "--token", TT],
                         capture_output=True, text=True, timeout=180)
      # 提取 JSON
      out = r.stdout
      # 取最后一个 { 到末尾
      idx = out.rfind('{\n')
      if idx<0: idx = out.find('{')
      js = json.loads(out[idx:])
      if js.get("status") == "DONE" and js.get("result_url"):
        url = js["result_url"][0]
        with urllib.request.urlopen(url, timeout=60) as resp:
          data = resp.read()
        with open(fname, "wb") as f: f.write(data)
        print(f"OK {fname} {len(data)//1024}KB")
        return True
    except Exception as e:
      print(f" retry {fname} {attempt}: {e}")
  print(f"FAIL {fname}")
  return False

for fname, prompt, res in JOBS:
  run_one(fname, prompt, res)
print("DONE")
