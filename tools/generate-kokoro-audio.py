import json
from pathlib import Path
from kokoro import KPipeline
import soundfile as sf

output = Path('audio/kokoro')
output.mkdir(parents=True, exist_ok=True)
items = json.loads(Path('/private/tmp/enl-audio-items.json').read_text())
pipeline = KPipeline(lang_code='a')
mapping = {}
for index, item in enumerate(items, 1):
    filename = f"u{item['unitIndex'] + 1:02d}-{item['kind']}-{item['itemIndex'] + 1:03d}.wav"
    path = output / filename
    if not path.exists():
        for _, _, audio in pipeline(item['text'], voice='am_adam', speed=0.65):
            sf.write(path, audio, 24000)
            break
    mapping[item['text']] = f"audio/kokoro/{filename}"
    if index % 10 == 0 or index == len(items):
        print(f"{index}/{len(items)}", flush=True)
Path('audio-data.js').write_text('window.AUDIO_FILES = ' + json.dumps(mapping, ensure_ascii=False, indent=2) + ';\n')
print(f'Generated {len(mapping)} mapped audio files')
