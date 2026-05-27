import subprocess, re, urllib.request, time, os
BC = "/Users/xinyiliu/WorkBuddy/automation-claw-20260408211517/asar-out/resources/builtin-skills/buddy-multimodal-generation/scripts/buddy-cloud.py"
TT = "tk_5fGeeoCNLuwOXxPGhCHc7fbEVsDPfNhG"
JOB = ("assets/portraits/d_player.jpg",
       "anime portrait young male sect master, age 25, ornate gold and dark robe, jade hairpin, calm wise eyes, half body, oriental fantasy galgame style, detailed, dramatic lighting")
fname, prompt = JOB
for a in range(8):
  print(f"attempt {a}", flush=True)
  if os.path.exists(fname) and os.path.getsize(fname) > 5000:
    print("done"); break
  r = subprocess.run(["python3", BC, "image", prompt, "--token", TT], capture_output=True, text=True, timeout=300)
  out = r.stdout
  if "concurrency" in out:
    print("  busy, sleep 60s"); time.sleep(60); continue
  m = re.search(r'"result_url"\s*:\s*\[\s*"([^"]+)"', out)
  if m:
    url = m.group(1)
    with urllib.request.urlopen(url, timeout=60) as resp: data = resp.read()
    with open(fname, "wb") as f: f.write(data)
    print(f"  OK {len(data)//1024}KB"); break
  print(f"  err: {out[:200]}"); time.sleep(15)
