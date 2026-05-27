import os, time, urllib.parse, urllib.request, concurrent.futures
os.chdir(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://image.pollinations.ai/prompt/"

JOBS = [
  ("sect_thunder", "circular emblem icon oriental sect lightning red gold ornate flat illustration no text"),
  ("sect_luoxia",  "circular emblem icon oriental sect peach blossom alchemy orange red ornate flat illustration no text"),
  ("sect_xuanyin", "circular emblem dark oriental sect skull purple flames black gothic flat illustration no text"),
  ("sect_ziwei",   "circular emblem oriental sect purple stars scroll deep purple gold border flat illustration no text"),
  ("sect_xueyue",  "circular emblem dark cult crest blood red moon ritual dagger crimson black ornate evil flat illustration no text"),
  ("sect_xuxian",  "circular emblem immortal sect crane divine cloud silver white blue ethereal ornate flat illustration no text"),
]

def gen(args):
  name, prompt, seed = args
  fname = f"assets/icons/{name}.png"
  if os.path.exists(fname) and os.path.getsize(fname) > 5000:
    return f"SKIP {name}"
  url = BASE + urllib.parse.quote(prompt) + f"?width=512&height=512&model=turbo&seed={seed}&nologo=true"
  for attempt in range(3):
    try:
      req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
      with urllib.request.urlopen(req, timeout=120) as r:
        data = r.read()
      if len(data) < 5000: raise Exception("too small")
      with open(fname, "wb") as f: f.write(data)
      return f"OK {name} {len(data)//1024}KB"
    except Exception as e:
      time.sleep(5)
  return f"FAIL {name}"

tasks = [(n,p,700+i) for i,(n,p) in enumerate(JOBS)]
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as ex:
  for r in ex.map(gen, tasks):
    print(r, flush=True)
print("DONE")
