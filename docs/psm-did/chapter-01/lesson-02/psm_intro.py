"""课程兼容入口；完整流程与参数见 analysis/README.md。"""
from pathlib import Path
import runpy
if __name__ == "__main__":
    runpy.run_path(str(Path(__file__).resolve().parents[2]/"analysis"/"run.py"),run_name="__main__")
