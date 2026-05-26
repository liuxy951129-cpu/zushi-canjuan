#!/usr/bin/env python3
"""为道具系统生成 AI icon。使用 Pollinations.ai flux 模型。"""
import urllib.parse, urllib.request, time, os, sys
from concurrent.futures import ThreadPoolExecutor, as_completed

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets/icons")

# 道具列表：(filename, prompt)
ITEMS = [
    # 武器
    ("it_sw_qinglu",    "ancient Chinese jade-handle sword in dark wood scabbard, gold tassel, single object on black background, oil painting, dark fantasy, top-down view, game item icon"),
    ("it_sw_hanshuang", "Chinese xianxia ice sword crystal blade frost mist, blue glow, single object on black background, oil painting style, game item icon, dark fantasy"),
    ("it_sw_pojun",     "Chinese broadsword saber notched blade red wrapping handle, single object on black background, oil painting, dark martial arts game icon"),
    ("it_sw_qingyin",   "ancient Chinese bamboo flute silver-wrapped section, single object on black background, oil painting, soft moonlight glow, game item icon"),
    ("it_sw_xueyu",     "dark Chinese assassin dagger blood-red blade obsidian handle, single object on black background, dark fantasy oil painting, game item icon"),
    ("it_sw_canjuan",   "ancient yellowed scroll scripture rolled with red seal, single object on black background, oil painting xianxia game item icon"),
    ("it_sw_iron",      "simple iron sword bronze hilt rough texture, single object on black background, oil painting, basic weapon game icon"),
    ("it_sw_sunmoon",   "twin Chinese rings sun and moon weapon golden glow, single object on black background, divine xianxia oil painting, game item icon"),
    # 丹药
    ("it_pill_ningshen", "single round green-jade glowing immortal pill in a porcelain bowl, faint mist, on black background, xianxia oil painting, game item icon"),
    ("it_pill_huiyuan",  "single golden glowing immortal cinnabar pill, soft amber glow, on black background, xianxia oil painting, game item icon"),
    ("it_pill_dagong",   "single red-fire glowing volatile pill cracks of light, on black background, dark xianxia oil painting, game item icon"),
    ("it_pill_dujie",    "single deep purple glowing immortal pill with thunder pattern, on black background, xianxia oil painting, ultra-rare game item icon"),
    # 礼物
    ("it_gf_silkfan",    "Chinese antique silk fan with painted blossoms, partially open, single object on black background, oil painting game item icon"),
    ("it_gf_armor",      "antique Chinese soft leather armor folded vest, single object on black background, oil painting game item icon"),
    ("it_gf_inkstone",   "antique Chinese inkstone with engraved dragon, single object on black background, oil painting game item icon"),
    ("it_gf_winejar",    "small Chinese antique wine jar with bamboo seal, single object on black background, oil painting game item icon"),
    ("it_gf_silvercomb", "antique silver comb engraved with characters, single object on black background, oil painting game item icon"),
    # 卷轴
    ("it_sc_canjuan",    "ancient yellowed scroll half-open red seal cinnabar text, single object on black background, xianxia oil painting game item icon"),
    ("it_sc_thunder",    "torn parchment scroll with thunder rune crackling sparks, single object on black background, oil painting game item icon"),
    ("it_sc_xuanyin",    "dark torn scroll with blood-red sigil shadowy mist, single object on black background, dark fantasy oil painting game item icon"),
]

def fetch(filename, prompt, retries=3):
    url = f"https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt)}?width=384&height=384&model=flux&nologo=true&seed={hash(filename)%99999}"
    out = os.path.join(OUT_DIR, filename + ".png")
    if os.path.exists(out):
        return True
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=120) as r:
                data = r.read()
            if len(data) < 5000:
                raise Exception(f"too small {len(data)}")
            with open(out, "wb") as f:
                f.write(data)
            print(f"  [OK] {filename} ({len(data)//1024} KB)", flush=True)
            return True
        except Exception as e:
            print(f"  [retry {attempt+1}] {filename}: {e}", flush=True)
            time.sleep(5)
    print(f"  [FAIL] {filename}", flush=True)
    return False

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    todo = [(n,p) for n,p in ITEMS if not os.path.exists(os.path.join(OUT_DIR, n+".png"))]
    print(f"To generate: {len(todo)} icons (concurrent=4)", flush=True)
    # 并发 4 路（pollinations 同 IP 限制为 1 排队，但有时多请求会触发 503-> retry）
    with ThreadPoolExecutor(max_workers=4) as ex:
        futs = {ex.submit(fetch, n, p): n for n, p in todo}
        for fut in as_completed(futs):
            try: fut.result()
            except: pass
    print("Done.", flush=True)

if __name__ == "__main__":
    main()
