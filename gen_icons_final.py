#!/usr/bin/env python3
"""使用 pollinations.ai turbo (免认证) 串行生成道具 icon。"""
import urllib.parse, urllib.request, time, os

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets/icons")

ITEMS = [
    ("it_sw_xueyu",     "ornate Chinese ceremonial dagger ruby gemstone silver hilt single object dark background oil painting xianxia game item icon"),
    ("it_sw_canjuan",   "ancient yellowed Chinese scroll rolled with red wax seal single object dark background oil painting xianxia game item icon"),
    ("it_sw_iron",      "simple iron sword bronze hilt single object dark background oil painting weapon game icon"),
    ("it_sw_sunmoon",   "twin Chinese rings sun and moon golden ornamental weapon single object dark background xianxia oil painting game item icon"),
    ("it_pill_ningshen","single round green jade glowing immortal pill in porcelain bowl faint mist dark background xianxia oil painting game item icon"),
    ("it_pill_huiyuan", "single golden glowing immortal cinnabar pill amber glow dark background xianxia oil painting game item icon"),
    ("it_pill_dagong",  "single red glowing immortal pill cracks of light dark background xianxia oil painting game item icon"),
    ("it_pill_dujie",   "single deep purple glowing immortal pill with thunder pattern dark background xianxia oil painting rare game item icon"),
    ("it_gf_silkfan",   "Chinese antique silk fan painted blossoms partially open single object dark background oil painting game item icon"),
    ("it_gf_armor",     "antique Chinese soft leather armor folded vest single object dark background oil painting game item icon"),
    ("it_gf_inkstone",  "antique Chinese inkstone carved dragon single object dark background oil painting game item icon"),
    ("it_gf_winejar",   "small Chinese antique wine jar bamboo seal single object dark background oil painting game item icon"),
    ("it_gf_silvercomb","antique silver comb engraved characters single object dark background oil painting game item icon"),
    ("it_sc_canjuan",   "ancient yellowed scroll half-open red seal cinnabar text single object dark background xianxia oil painting game item icon"),
    ("it_sc_thunder",   "torn parchment scroll thunder rune crackling sparks single object dark background oil painting game item icon"),
    ("it_sc_xuanyin",   "dark torn scroll red sigil shadowy mist single object dark background dark fantasy oil painting game item icon"),
]

def fetch(name, prompt):
    out = os.path.join(OUT_DIR, name + ".png")
    if os.path.exists(out) and os.path.getsize(out) > 5000:
        return True
    # turbo 模型，无 model 参数，384x384
    url = f"https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt)}?width=384&height=384&nologo=true&seed={hash(name)%99999}"
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
            if len(data) > 5000:
                with open(out, "wb") as f: f.write(data)
                print(f"[OK] {name} {len(data)//1024}KB", flush=True)
                return True
            print(f"[retry {attempt+1}] {name}: small {len(data)}", flush=True)
        except Exception as e:
            print(f"[retry {attempt+1}] {name}: {e}", flush=True)
        time.sleep(6)
    print(f"[FAIL] {name}", flush=True)
    return False

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    todo = [(n,p) for n,p in ITEMS if not (os.path.exists(os.path.join(OUT_DIR, n+".png")) and os.path.getsize(os.path.join(OUT_DIR, n+".png"))>5000)]
    print(f"To gen: {len(todo)}", flush=True)
    for i,(n,p) in enumerate(todo):
        print(f"--- [{i+1}/{len(todo)}] {n}", flush=True)
        fetch(n, p)
        time.sleep(2)
    print("Done", flush=True)

if __name__ == "__main__":
    main()
