import os
import re
import time
import urllib.request
import ssl
from pathlib import Path

ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf,*/*;q=0.8'
}

# The 8 target clinical guidelines
CLINICAL_GUIDELINE_TARGETS = {
    "endocrinology": {
        "guid": "ng28",
        "title": "NICE NG28: Type 2 Diabetes in Adults Management",
        "filename": "NICE_NG28_Type2_Diabetes_Management.pdf"
    },
    "pulmonology": {
        "guid": "ng115",
        "title": "NICE NG115: Chronic Obstructive Pulmonary Disease in Over 16s",
        "filename": "NICE_NG115_COPD_Management.pdf"
    },
    "neurology": {
        "guid": "ng128",
        "title": "NICE NG128: Stroke and Transient Ischaemic Attack (TIA) in Over 16s",
        "filename": "NICE_NG128_Stroke_and_TIA.pdf"
    },
    "oncology": {
        "guid": "ng122",
        "title": "NICE NG122: Lung Cancer Diagnosis and Management",
        "filename": "NICE_NG122_Lung_Cancer_Management.pdf"
    },
    "pediatrics": {
        "guid": "ng143",
        "title": "NICE NG143: Fever in Under 5s - Assessment and Initial Management",
        "filename": "NICE_NG143_Pediatric_Fever_Assessment.pdf"
    },
    "emergency": {
        "guid": "ng253",
        "title": "NICE NG253: Suspected Sepsis Recognition, Assessment and Early Management",
        "filename": "NICE_NG253_Sepsis_Emergency_Management.pdf"
    },
    "gastroenterology": {
        "guid": "ng129",
        "title": "NICE NG129: Crohn's Disease Management",
        "filename": "NICE_NG129_Crohns_Disease_Management.pdf"
    },
    "dermatology": {
        "guid": "cg153",
        "title": "NICE CG153: Psoriasis Assessment and Management",
        "filename": "NICE_CG153_Psoriasis_Assessment_Management.pdf"
    }
}

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "data" / "books"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def resolve_and_download(domain: str, info: dict):
    guid = info["guid"]
    landing_url = f"https://www.nice.org.uk/guidance/{guid}"
    out_file = OUTPUT_DIR / info["filename"]

    if out_file.exists() and out_file.stat().st_size > 10000:
        print(f"[{domain.upper()}] Already downloaded: {info['filename']} ({out_file.stat().st_size / 1024:.1f} KB)")
        return out_file

    print(f"[{domain.upper()}] Querying landing page: {landing_url} ...")
    try:
        req = urllib.request.Request(landing_url, headers=HEADERS)
        with urllib.request.urlopen(req, context=ssl_ctx, timeout=15) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
        
        pattern = rf'href="(/guidance/{guid}/resources/[^"]*pdf[^"]*)"'
        match = re.search(pattern, html)
        if not match:
            print(f"[{domain.upper()}] Could not match PDF pattern in {landing_url}")
            return None
        
        pdf_path = match.group(1)
        direct_pdf_url = f"https://www.nice.org.uk{pdf_path}"
        print(f"[{domain.upper()}] Found direct PDF: {direct_pdf_url}")
        print(f"[{domain.upper()}] Downloading to {out_file.name} ...")

        pdf_req = urllib.request.Request(direct_pdf_url, headers=HEADERS)
        with urllib.request.urlopen(pdf_req, context=ssl_ctx, timeout=30) as p_resp:
            content = p_resp.read()
            if len(content) < 5000:
                print(f"[{domain.upper()}] Downloaded file is too small ({len(content)} bytes), skipping.")
                return None
            with open(out_file, "wb") as f:
                f.write(content)
        
        print(f"[{domain.upper()}] SUCCESS! Saved ({len(content) / 1024:.1f} KB)")
        time.sleep(1)
        return out_file

    except Exception as e:
        print(f"[{domain.upper()}] Failed to download: {e}")
        return None

def main():
    print("=" * 65)
    print(" Automated Medical Guidelines Downloader (All 8 Remaining Domains)")
    print("=" * 65)
    
    downloaded = 0
    for domain, info in CLINICAL_GUIDELINE_TARGETS.items():
        res = resolve_and_download(domain, info)
        if res:
            downloaded += 1

    print("=" * 65)
    print(f" Download Complete: {downloaded}/{len(CLINICAL_GUIDELINE_TARGETS)} domain guidelines ready.")
    print("=" * 65)

if __name__ == "__main__":
    main()
