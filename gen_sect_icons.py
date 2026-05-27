import subprocess, json, os, urllib.request, re, time

BC = "/Users/xinyiliu/WorkBuddy/automation-claw-20260408211517/asar-out/resources/builtin-skills/buddy-multimodal-generation/scripts/buddy-cloud.py"
TT = "tk_5fGeeoCNLuwOXxPGhCHc7fbEVsDPfNhG"

JOBS = [
  ("assets/icons/sect_thunder.png", "circular emblem icon, oriental sect crest, lightning bolt design with red and gold colors, dark background, ornate border, flat illustration, no text"),
  ("assets/icons/sect_luoxia.png",  "circular emblem icon, oriental sect crest, sunset peach blossom and alchemy furnace, orange red gradient, ornate border, flat illustration, no text"),
  ("assets/icons/sect_xuanyin.png", "circular emblem icon, dark oriental sect crest, ghost skull and purple flames, black purple gradient, ornate gothic border, flat illustration, no text"),
  ("assets/icons/sect_ziwei.png",   "circular emblem icon, oriental scholar sect crest, purple stars and ancient scroll, deep purple gold border, ornate, flat illustration, no text"),
  ("assets/icons/sect_xueyue.png",  "circular emblem icon, dark cult crest, blood red moon and ritual dagger, crimson black gradient, ornate evil border, flat illustration, no text"),
  ("assets/icons/sect_xuxian.png",  "circular emblem icon, immortal sect crest, white crane and divine cloud, silver white blue gradient, ethereal ornate border, flat illustration, no text"),
]

def run(fname, prompt):
  if os.path.exists(fname) and os.path.getsize(fname) > 5000:
    return f"SKIP {fname}"
  for attempt in range(5):
    try:
      r = subprocess.run(["python3", BC, "image", prompt, "--token", TT],
                         capture_output=True, text=True, timeout=300)
      out = r.stdout
      if "concurrency" in out:
        print(f"  busy, wait 30s...", flush=True)
        time.sleep(30); continue
      m = re.search(r'"result_url"\s*:\s*\[\s*"([^"]+)"', out)
      if m:
        url = m.group(1)
        with urllib.request.urlopen(url, timeout=60) as resp: data = resp.read()
        with open(fname, "wb") as f: f.write(data)
        return f"OK {fname} {len(data)//1024}KB"
      print(f"  retry {attempt}: no url in output", flush=True)
      time.sleep(8)
    except Exception as e:
      print(f"  retry {attempt}: {e}", flush=True)
      time.sleep(8)
  return f"FAIL {fname}"

for f,p in JOBS:
  print(run(f,p), flush=True)
  time.sleep(6)  # 每次间隔避免并发
print("DONE")
