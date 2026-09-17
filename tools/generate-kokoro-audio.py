import argparse
import json
import re
import subprocess
from pathlib import Path
import soundfile as sf

VOICE_PACKS = {
    'sarah': {'label': 'Sarah · 自然女声', 'voice': 'af_bella'},
    'zoom': {'label': 'Zoom · 活力男声', 'voice': 'am_adam'},
}
SPEEDS = {'word': 0.90, 'person': 0.90, 'sentence': 0.75}
AUDIO_VERSION = '20260917-5'


def parse_args():
    parser = argparse.ArgumentParser(description='Generate fixed Kokoro voice packs for the learning site.')
    parser.add_argument('--pack', choices=['sarah', 'zoom', 'all'], default='all')
    parser.add_argument('--force', action='store_true', help='Regenerate files that already exist.')
    parser.add_argument('--article-a-only', action='store_true', help='Only regenerate text containing the article a.')
    return parser.parse_args()


def filename_for(item):
    return f"u{item['unitIndex'] + 1:02d}-{item['kind']}-{item['itemIndex'] + 1:03d}.m4a"


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
            item['text']: f"audio/kokoro/{pack}/{filename_for(item)}?v={AUDIO_VERSION}"
            for item in items
        }
        packs[pack] = {'label': config['label'], 'files': files}
    source = (
        'window.AUDIO_PACKS = '
        + json.dumps(packs, ensure_ascii=False, indent=2)
        + ';\nwindow.AUDIO_FILES = window.AUDIO_PACKS.sarah.files;\n'
    )
    Path('audio-data.js').write_text(source)


def pronunciation_tokens(pipeline, text):
    _, tokens = pipeline.g2p(text)
    for token in tokens:
        if token.text.strip().lower() == 'a':
            token.phonemes = 'ə'
    return tokens


def main():
    args = parse_args()
    items = json.loads(Path('/private/tmp/enl-audio-items.json').read_text())
    selected_items = [item for item in items if re.search(r'\ba\b', item['text'], re.IGNORECASE)] if args.article_a_only else items
    selected_packs = VOICE_PACKS if args.pack == 'all' else {args.pack: VOICE_PACKS[args.pack]}
    pipeline = build_pipeline()

    for pack, config in selected_packs.items():
        output = Path('audio/kokoro') / pack
        output.mkdir(parents=True, exist_ok=True)
        print(f"Generating {pack}: {config['voice']} ({len(selected_items)} items)", flush=True)
        for index, item in enumerate(selected_items, 1):
            path = output / filename_for(item)
            if args.force or not path.exists():
                token_stream = pronunciation_tokens(pipeline, item['text'])
                for result in pipeline.generate_from_tokens(token_stream, voice=config['voice'], speed=SPEEDS[item['kind']]):
                    wav_path = path.with_suffix('.tmp.wav')
                    sf.write(wav_path, result.audio.numpy(), 24000)
                    subprocess.run([
                        'afconvert', str(wav_path), '-o', str(path),
                        '-f', 'm4af', '-d', 'aac', '-b', '64000', '-q', '96'
                    ], check=True)
                    wav_path.unlink()
                    break
            if index % 10 == 0 or index == len(selected_items):
                print(f"{pack}: {index}/{len(selected_items)}", flush=True)

    write_manifest(items)
    print(f"Mapped {len(items)} items across {len(VOICE_PACKS)} voice packs")


if __name__ == '__main__':
    main()
