#!/usr/bin/env python3
"""使用 buddy-cloud 串行生成道具 icon。"""
import subprocess, json, os, sys, urllib.request, time

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets/icons")
BUDDY = "/Users/xinyiliu/WorkBuddy/automation-claw-20260408211517/buddy-cloud.py"
TOKEN = os.environ.get("BUDDY_CLOUD_TOKEN", "")

JOBS = [
    ("it_sw_qingyin",   "ancient Chinese bamboo flute silver-wrapped section, single object on dark velvet background, oil painting soft moonlight glow xianxia game item icon, 1:1"),
    ("it_sw_xueyu",     "dark Chinese assassin dagger blood-red blade obsidian handle, single object on dark velvet background, dark fantasy oil painting game item icon, 1:1"),
    ("it_sw_canjuan",   "ancient yellowed scroll scripture rolled with red wax seal, single object on dark velvet background, oil painting xianxia game item icon, 1:1"),
    ("it_sw_iron",      "simple iron sword bronze hilt rough texture, single object on dark velvet background, oil painting basic weapon game icon, 1:1"),
    ("it_sw_sunmoon",   "twin Chinese rings sun and moon weapon golden glow, single object on dark velvet background, divine xianxia oil painting game item icon, 1:1"),
    ("it_pill_ningshen","single round green-jade glowing immortal pill in porcelain bowl, faint mist, on dark velvet background, xianxia oil painting game item icon, 1:1"),
    ("it_pill_huiyuan", "single golden glowing immortal cinnabar pill, soft amber glow, on dark velvet background, xianxia oil painting game item icon, 1:1"),
    ("it_pill_dagong",  "single red-fire glowing volatile pill cracks of light, on dark velvet background, dark xianxia oil painting game item icon, 1:1"),
    ("it_pill_dujie",   "single deep purple glowing immortal pill with thunder pattern, on dark velvet background, xianxia oil painting ultra-rare game item icon, 1:1"),
    ("it_gf_silkfan",   "Chinese antique silk fan with painted blossoms partially open, single object on dark velvet background, oil painting game item icon, 1:1"),
    ("it_gf_armor",     "antique Chinese soft leather armor folded vest, single object on dark velvet background, oil painting game item icon, 1:1"),
    ("it_gf_inkstone",  "antique Chinese inkstone with engraved dragon, single object on dark velvet background, oil painting game item icon, 1:1"),
    ("it_gf_winejar",   "small Chinese antique wine jar with bamboo seal, single object on dark velvet background, oil painting game item icon, 1:1"),
    ("it_gf_silvercomb","antique silver comb engraved with characters, single object on dark velvet background, oil painting game item icon, 1:1"),
    ("it_sc_canjuan",   "ancient yellowed scroll half-open red seal cinnabar text, single object on dark velvet background, xianxia oil painting game item icon, 1:1"),
    ("it_sc_thunder",   "torn parchment scroll with thunder rune crackling sparks, single object on dark velvet background, oil painting game item icon, 1:1"),
    ("it_sc_xuanyin",   "dark torn scroll with blood-red sigil shadowy mist, single object on dark velvet background, dark fantasy oil painting game item icon, 1:1"),
]

def gen_one(name, prompt):
    out = os.path.join(OUT_DIR, name + ".png")
    if os.path.exists(out) and os.path.getsize(out) > 5000:
        return True
    for attempt in range(5):
        try:
            env = os.environ.copy()
            env["BUDDY_CLOUD_TOKEN"] = TOKEN
            r = subprocess.run([sys.executable, BUDDY, "image", prompt],
                               capture_output=True, text=True, timeout=120, env=env)
            output = r.stdout
            # 检查 concurrent 限制错误
            if "concurrent slot limit" in output or "concurrency limit" in output:
                print(f"[wait concurrent] {name} attempt {attempt+1}", flush=True)
                time.sleep(15)
                continue
            # 提取 result_url
            url = None
            try:
                idx = output.rfind("{")
                if idx > -1:
                    j = json.loads(output[idx:])
                    if j.get("status") == "DONE":
                        urls = j.get("result_url", [])
                        if urls:
                            url = urls[0]
            except: pass
            if url:
                req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
                with urllib.request.urlopen(req, timeout=30) as resp:
                    data = resp.read()
                if len(data) > 5000:
                    with open(out, "wb") as f: f.write(data)
                    print(f"[OK] {name} ({len(data)//1024} KB)", flush=True)
                    return True
            # 检查是否被审查（看 raw_result）
            if "raw_result" in output:
                # 多半是审查或参数错，跳过
                print(f"[review/error] {name} attempt {attempt+1}", flush=True)
            else:
                print(f"[retry {attempt+1}] {name}", flush=True)
        except Exception as e:
            print(f"[retry {attempt+1}] {name}: {e}", flush=True)
        time.sleep(8)
    print(f"[FAIL] {name}", flush=True)
    return False

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    todo = [(n,p) for n,p in JOBS if not (os.path.exists(os.path.join(OUT_DIR, n+".png")) and os.path.getsize(os.path.join(OUT_DIR, n+".png"))>5000)]
    print(f"To gen: {len(todo)}", flush=True)
    for i,(n,p) in enumerate(todo):
        print(f"--- [{i+1}/{len(todo)}] {n}", flush=True)
        gen_one(n,p)
        time.sleep(1)
    print("Done", flush=True)

if __name__ == "__main__":
    main()
