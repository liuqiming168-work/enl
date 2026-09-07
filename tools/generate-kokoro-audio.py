import argparse
import json
from pathlib import Path
import soundfile as sf

VOICE_PACKS = {
    'zoom': {'label': 'Zoom · 活力男声', 'voice': 'am_adam'},
    'sarah': {'label': 'Sarah · 自然女声', 'voice': 'af_bella'},
}
SPEEDS = {'word': 0.85, 'person': 0.80, 'sentence': 0.70}


def parse_args():
    parser = argparse.ArgumentParser(description='Generate fixed Kokoro voice packs for the learning site.')
    parser.add_argument('--pack', choices=['zoom', 'sarah', 'all'], default='all')
    parser.add_argument('--force', action='store_true', help='Regenerate files that already exist.')
    return parser.parse_args()


def filename_for(item):
    return f"u{item['unitIndex'] + 1:02d}-{item['kind']}-{item['itemIndex'] + 1:03d}.wav"


def build_pipeline():
    import spacy
    from kokoro import KPipeline

    if not spacy.util.is_package('en_core_web_sm'):
        original_is_package = spacy.util.is_package
        original_load = spacy.load
        spacy.util.is_package = lambda name: name == 'en_core_web_sm' or original_is_package(name)
        spacy.load = lambda name, enable=None: (
            spacy.blank('en') if name == 'en_core_web_sm' else original_load(name, enable=enable)
        )
        print('Using lightweight English tokenizer with eSpeak phoneme fallback', flush=True)

    return KPipeline(lang_code='a', repo_id='hexgrad/Kokoro-82M')


def write_manifest(items):
    packs = {}
    for pack, config in VOICE_PACKS.items():
        files = {
            item['text']: f"audio/kokoro/{pack}/{filename_for(item)}"
            for item in items
        }
        packs[pack] = {'label': config['label'], 'files': files}
    source = (
        'window.AUDIO_PACKS = '
        + json.dumps(packs, ensure_ascii=False, indent=2)
        + ';\nwindow.AUDIO_FILES = window.AUDIO_PACKS.zoom.files;\n'
    )
    Path('audio-data.js').write_text(source)


def main():
    args = parse_args()
    items = json.loads(Path('/private/tmp/enl-audio-items.json').read_text())
    selected_packs = VOICE_PACKS if args.pack == 'all' else {args.pack: VOICE_PACKS[args.pack]}
    pipeline = build_pipeline()

    for pack, config in selected_packs.items():
        output = Path('audio/kokoro') / pack
        output.mkdir(parents=True, exist_ok=True)
        print(f"Generating {pack}: {config['voice']} ({len(items)} items)", flush=True)
        for index, item in enumerate(items, 1):
            path = output / filename_for(item)
            if args.force or not path.exists():
                for _, _, audio in pipeline(item['text'], voice=config['voice'], speed=SPEEDS[item['kind']]):
                    sf.write(path, audio, 24000)
                    break
            if index % 10 == 0 or index == len(items):
                print(f"{pack}: {index}/{len(items)}", flush=True)

    write_manifest(items)
    print(f"Mapped {len(items)} items across {len(VOICE_PACKS)} voice packs")


if __name__ == '__main__':
    main()
