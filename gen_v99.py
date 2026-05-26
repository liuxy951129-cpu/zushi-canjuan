#!/usr/bin/env python3
"""v0.99 新增图：铜钱 icon + 派遣分类 6 icon + 世界地图 1 张"""
import urllib.parse, urllib.request, time, os

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets/icons")
SCENE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets/scenes")
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(SCENE_DIR, exist_ok=True)

JOBS = [
    # ——— 铜钱 icon ———
    (OUT_DIR, "ic_coin.png", "ancient Chinese copper coin square hole, golden brown patina, single object on black background, oil painting, game item icon", 256),
    # ——— 派遣分类 icon (6 类) ———
    (OUT_DIR, "ic_disp_herb.png", "ancient Chinese herbal basket with green spirit grass, single object on black background, oil painting, xianxia game category icon", 256),
    (OUT_DIR, "ic_disp_escort.png", "ancient Chinese caravan wagon with red lantern, single object on black background, oil painting, xianxia game category icon", 256),
    (OUT_DIR, "ic_disp_hunt.png", "ancient Chinese demon-slaying paper talisman with sword crossed, single object on black background, oil painting, dark xianxia game category icon", 256),
    (OUT_DIR, "ic_disp_negotiate.png", "ancient Chinese diplomatic scroll with red seal and brush, single object on black background, oil painting, xianxia game category icon", 256),
    (OUT_DIR, "ic_disp_explore.png", "ancient Chinese cavern entrance with torch and rope, single object on black background, oil painting, dark fantasy game category icon", 256),
    (OUT_DIR, "ic_disp_war.png", "ancient Chinese war banner crossed swords flame, single object on black background, oil painting, xianxia game category icon", 256),
    # ——— 世界地图 ———
    (SCENE_DIR, "world_map.jpg", "ancient Chinese xianxia fantasy world map, ink wash painting style, dark mountains rivers, 7 sect locations marked with red seals, scroll texture, top-down view, dark moody atmospheric", 1024),
]

def fetch(folder, fname, prompt, size):
    out = os.path.join(folder, fname)
    if os.path.exists(out) and os.path.getsize(out) > 5000:
        print(f"[SKIP] {fname}", flush=True)
        return True
    url = f"https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt)}?width={size}&height={size}&nologo=true&seed={hash(fname)%99999}"
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=120) as r:
                data = r.read()
            if len(data) > 5000:
                with open(out, "wb") as f: f.write(data)
                print(f"[OK] {fname} {len(data)//1024}KB", flush=True)
                return True
        except Exception as e:
            print(f"[retry {attempt+1}] {fname}: {e}", flush=True)
        time.sleep(6)
    print(f"[FAIL] {fname}", flush=True)
    return False

def main():
    todo = [(d,f,p,s) for d,f,p,s in JOBS if not (os.path.exists(os.path.join(d,f)) and os.path.getsize(os.path.join(d,f))>5000)]
    print(f"To gen: {len(todo)}", flush=True)
    for i,(d,f,p,s) in enumerate(todo):
        print(f"--- [{i+1}/{len(todo)}] {f}", flush=True)
        fetch(d,f,p,s)
        time.sleep(2)
    print("Done", flush=True)

if __name__ == "__main__":
    main()
