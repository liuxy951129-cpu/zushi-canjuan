#!/usr/bin/env python3
"""v1.01 新增：宗门地图(白天+黑夜) + 重生场景背景(每个场景白天+黑夜版)"""
import urllib.parse, urllib.request, time, os

ROOT = os.path.dirname(os.path.abspath(__file__))
SCENE_DIR = os.path.join(ROOT, "assets/scenes")
os.makedirs(SCENE_DIR, exist_ok=True)

JOBS = [
    # 宗门俯视地图（白天/黑夜）
    ("map_sect_day.jpg",   "ancient Chinese xianxia sect mountain top-down isometric map, day light bright sunshine, 5 buildings clearly placed on terraced cliff: temple hall center, alchemy pavilion left, training ground right, scripture pavilion top, herb fields bottom, ink wash painting style, atmospheric, 1024x768", 1024),
    ("map_sect_night.jpg", "ancient Chinese xianxia sect mountain top-down isometric map, night time moonlight, lanterns glowing, 5 buildings on terraced cliff: temple hall center, alchemy pavilion left, training ground right, scripture pavilion top, herb fields bottom, dark moody atmospheric, 1024x768", 1024),
    # 场景背景：白天+黑夜
    ("sc_temple_day.jpg",     "ancient Chinese xianxia ancestor temple interior, sunlit beams, golden buddha statue, atmospheric dust, oil painting, dark fantasy", 1024),
    ("sc_temple_night.jpg",   "ancient Chinese xianxia ancestor temple interior, candle light only, deep shadows, atmospheric, oil painting, dark fantasy", 1024),
    ("sc_dantang_day.jpg",    "ancient Chinese alchemy pill workshop, sunlit windows, copper cauldrons, herbs hanging, oil painting xianxia", 1024),
    ("sc_dantang_night.jpg",  "ancient Chinese alchemy pill workshop at night, fire glow from cauldron, dark, oil painting xianxia", 1024),
    ("sc_battle_day.jpg",     "ancient Chinese martial arts training ground courtyard, daylight, weapon racks, oil painting xianxia", 1024),
    ("sc_battle_night.jpg",   "ancient Chinese martial arts training ground at night, torches, full moon, oil painting xianxia", 1024),
    ("sc_courtyard_day.jpg",  "ancient Chinese xianxia courtyard with cherry blossom trees, sunlight, peaceful, oil painting", 1024),
    ("sc_courtyard_night.jpg","ancient Chinese xianxia courtyard at night, moonlight, lanterns, oil painting", 1024),
]

def fetch(fname, prompt, size):
    out = os.path.join(SCENE_DIR, fname)
    if os.path.exists(out) and os.path.getsize(out) > 5000:
        print(f"[SKIP] {fname}", flush=True); return True
    url = f"https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt)}?width={size}&height={int(size*0.75) if 'map' in fname else size}&nologo=true&seed={hash(fname)%99999}"
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=140) as r:
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
    todo = [(f,p,s) for f,p,s in JOBS if not (os.path.exists(os.path.join(SCENE_DIR,f)) and os.path.getsize(os.path.join(SCENE_DIR,f))>5000)]
    print(f"To gen: {len(todo)}", flush=True)
    for i,(f,p,s) in enumerate(todo):
        print(f"--- [{i+1}/{len(todo)}] {f}", flush=True)
        fetch(f,p,s)
        time.sleep(2)
    print("Done", flush=True)

if __name__ == "__main__":
    main()
