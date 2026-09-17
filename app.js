(() => {
  'use strict';

  const textbook = Array.isArray(window.TEXTBOOK_CONTENT) ? window.TEXTBOOK_CONTENT : [];
  const audioPacks = window.AUDIO_PACKS || {};
  const phonicsContent = window.PHONICS_CONTENT || {};
  const phonemeInfo = window.PHONEME_INFO || {};
  const spellingSounds = window.SPELLING_SOUNDS || {};
  const phonemeAudio = window.PHONEME_AUDIO || {};
  const buzzPhonemeFiles = window.BUZZ_PHONEME_FILES || {};
  const xfyunISE = window.XfyunISE || null;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const POINTS_RESET_VERSION = 1;
  const LEGACY_AUDIO_CACHE_NAME = 'liujin-english-audio-v1';
  const audioElements = new Map();
  let audioPlaybackRequest = 0;

  const unitMeta = [
    { id: 'Unit 1', title: 'Making friends', subtitle: '问候、介绍与友谊', icon: '1F44B', color: '#dcefe4', parts: ['Part A', 'Part B', 'Part C'] },
    { id: 'Unit 2', title: 'Different families', subtitle: '家庭成员与不同的家庭', icon: '1F91D', color: '#dcebf2', parts: ['Part A', 'Part B', 'Part C'] },
    { id: 'Unit 3', title: 'Amazing animals', subtitle: '宠物、野生动物与特征', icon: '1F415', color: '#f5ebc9', parts: ['Part A', 'Part B', 'Part C'] },
    { id: 'Unit 4', title: 'Plants around us', subtitle: '水果、植物与爱护花园', icon: '1F34E', color: '#e3e2f2', parts: ['Part A', 'Part B', 'Part C'] },
    { id: 'Unit 5', title: 'The colourful world', subtitle: '颜色、标识与多彩自然', icon: '1F60A', color: '#f2dfe7', parts: ['Part A', 'Part B', 'Part C'] },
    { id: 'Unit 6', title: 'Useful numbers', subtitle: '数字、年龄与生日', icon: '2B50', color: '#dcece8', parts: ['Part A', 'Part B', 'Part C'] },
    { id: 'Revision', title: 'Being a good guest', subtitle: '全册综合复习与礼貌做客', icon: '1F9E9', color: '#f2dfdb', parts: ['听力', '拼写', '跟读'], revision: true }
  ];
  const quizUnitNames = ['朋友', '家庭', '动物', '植物', '颜色', '数字', '复习'];

  const rewards = [
    { id: 'tv', title: '看电视', detail: '30 分钟', cost: 120, image: 'home-cinema.svg' },
    { id: 'phone', title: '玩手机', detail: '20 分钟', cost: 280, image: 'mobile-life.svg' },
    { id: 'request', title: '小要求', detail: '一个合理愿望', cost: 600, image: 'wishes.svg' },
    { id: 'cash', title: '10 元钱', detail: '零花钱奖励', cost: 1200, image: 'wallet.svg' }
  ];

  const directIcons = {
    hello: '1F44B', hi: '1F44B', name: '1F3F7', friend: '1F91D', good: '1F44D', nice: '1F60A', meet: '1F91D',
    arm: '1F4AA', hand: '270B', ear: '1F442', eye: '1F441', mouth: '1F444', wave: '1F44B', point: '1F449',
    look: '1F440', listen: '1F442', smile: '1F60A', share: '1F91D', help: '1FAC2', say: '1F5E3', play: '1F3AE',
    fair: '2696', care: '2764', together: '1FAC2', apple: '1F34E', bag: '1F392', bed: '1F6CF', cat: '1F408',
    can: '2705', dad: '1F468', dog: '1F415', family: '1F46A', father: '1F468', mother: '1F469', mum: '1F469',
    grandfather: '1F474', grandpa: '1F474', grandmother: '1F475', grandma: '1F475', brother: '1F466', sister: '1F467',
    baby: '1F476', 'baby sister': '1F476', cousin: '1F9D1', uncle: '1F468', aunt: '1F469', me: '1F9D1', big: '1F418',
    small: '1F41C', love: '2764', live: '1F3E0', 'each other': '1FAC2', egg: '1F95A', fish: '1F41F', girl: '1F467',
    pig: '1F416', animal: '1F43E', pet: '1F43E', bird: '1F426', rabbit: '1F407', fox: '1F98A', 'red panda': '1F98A',
    panda: '1F43C', monkey: '1F412', tiger: '1F42F', lion: '1F981', elephant: '1F418', giraffe: '1F992', wild: '1F3DE',
    cute: '1F929', tall: '1F992', fast: '1F4A8', swim: '1F3CA', hop: '1F407', sing: '1F3A4', sleep: '1F634',
    run: '1F3C3', eat: '1F37D', ill: '1F912', kid: '1F9D2', jet: '1F6E9', kite: '1FA81', plant: '1F331',
    fruit: '1F347', banana: '1F34C', grape: '1F347', orange: '1F34A', farm: '1F69C', garden: '1F3E1', tree: '1F333',
    flower: '1F33C', grass: '1F33F', leaf: '1F343', air: '1F4A8', water: '1F4A7', sun: '2600', spring: '1F338',
    fresh: '1F343', strong: '1F4AA', long: '1F4CF', grow: '1F331', give: '1F381', need: '2757', cut: '2702',
    turn: '1F504', new: '2728', map: '1F5FA', fan: '1FAAD', colour: '1F3A8', snow: '2744', rose: '1F339',
    sky: '2600', sea: '1F30A', bear: '1F43B', duck: '1F986', rainbow: '1F308', sunflower: '1F33B', bee: '1F41D',
    make: '1F528', draw: '1F3A8', touch: '1F446', jump: '1F998', sit: '1FA91', careful: '26A0', use: '1F527',
    number: '2795', old: '1F9D3', year: '1F4C5', yuan: '1F4B4', "o'clock": '1F550', shop: '1F6D2', spider: '1F577',
    child: '1F9D2', head: '1F9D1', wing: '1FAB6', leg: '1F9B5', toe: '1F9B6', cake: '1F382', birthday: '1F389',
    card: '1F48C', party: '1F973', time: '231A', hurry: '1F4A8', more: '2795', guest: '1F6AA', polite: '1F64F',
    knock: '1F6AA', toy: '1F9F8', goodbye: '1F44B', please: '1F64F', 'thank you': '1F64F', quiet: '1F92B',
    ask: '2753', show: '1F4A1', 'mike black': '1F466', 'john baker': '1F466', 'wu binbin': '1F466', 'guo wei': '1F466',
    sam: '1F466', matt: '1F466', 'sarah miller': '1F467', 'chen jie': '1F467', 'miss white': '1F469', 'mr jones': '1F468',
    'li na': '1F467', xinxin: '1F467', xiaoli: '1F467', feifei: '1F467', zoom: '1F60A', zip: '1F60A'
  };

  const colourSwatches = {
    red: '#ef5350', orange: '#ff963f', yellow: '#f4c64f', green: '#58b77d', blue: '#4e91db',
    purple: '#8b67c8', brown: '#8b6248', black: '#27313e', white: '#ffffff', pink: '#e575a8'
  };
  const numberCards = { one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: '10', odd: '1·3', even: '2·4' };
  const baseLetterSounds = {
    a: 'short_a', b: 'b', c: 'k', d: 'd', e: 'short_e', f: 'f', g: 'g', h: 'h', i: 'short_i', j: 'j',
    k: 'k', l: 'l', m: 'm', n: 'n', o: 'short_o', p: 'p', q: 'k', r: 'r', s: 's', t: 't', u: 'short_u',
    v: 'v', w: 'w', x: 'ks', y: 'y', z: 'z'
  };

  const state = {
    unit: 0,
    mode: 'spell',
    word: 0,
    wordAttempts: 0,
    sentence: 0,
    sentenceAttempts: 0,
    speakKind: 'word',
    picked: [],
    letterPool: [],
    sentencePicked: [],
    sentencePool: [],
    pickerPage: 0,
    voice: 'sarah',
    points: 0,
    completed: {},
    quizResults: {},
    pending: [],
    todayDate: dayKey(),
    todayCount: 0,
    audio: null,
    recognizer: null,
    recognitionEngine: null,
    speechSession: 0,
    speechPhase: 'idle',
    speechResults: [],
    speechTimer: null,
    speechGuard: null,
    speechStartedAt: 0,
    speechRetryCount: 0,
    interactionLocked: false,
    animationTimers: [],
    quiz: {
      allQuestions: [],
      queue: [],
      position: 0,
      responses: {},
      picked: [],
      pool: [],
      speechActive: false,
      locked: false,
      session: 0
    }
  };

  function dayKey() {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem('liujin-english-formal') || '{}');
      if (Number.isInteger(saved.unit)) state.unit = Math.max(0, Math.min(unitMeta.length - 1, saved.unit));
      if (saved.voice && audioPacks[saved.voice]) state.voice = saved.voice;
      if (saved.pointsResetVersion === POINTS_RESET_VERSION && Number.isFinite(saved.points)) {
        state.points = Math.max(0, saved.points);
      }
      if (saved.completed && typeof saved.completed === 'object') state.completed = saved.completed;
      if (saved.quizResults && typeof saved.quizResults === 'object') state.quizResults = saved.quizResults;
      if (saved.pointsResetVersion === POINTS_RESET_VERSION && Array.isArray(saved.pending)) {
        state.pending = saved.pending.filter(item => item && item.status === 'pending');
      }
      if (saved.todayDate === dayKey()) {
        state.todayDate = saved.todayDate;
        state.todayCount = Number(saved.todayCount) || 0;
      }
    } catch (_) {
      try {
        const legacy = JSON.parse(localStorage.getItem('english-quest-progress') || '{}');
        if (Number.isFinite(legacy.points)) state.points = Math.max(0, legacy.points);
      } catch (_) {}
    }
  }

  function saveState() {
    try {
      localStorage.setItem('liujin-english-formal', JSON.stringify({
        unit: state.unit,
        voice: state.voice,
        pointsResetVersion: POINTS_RESET_VERSION,
        points: state.points,
        completed: state.completed,
        quizResults: state.quizResults,
        pending: state.pending,
        todayDate: state.todayDate,
        todayCount: state.todayCount
      }));
    } catch (_) {}
  }

  function contentFor(unitIndex = state.unit) {
    return textbook[unitIndex] || { people: [], words: [], sentences: [] };
  }

  function wordItems() {
    const content = contentFor();
    const words = content.words.map((item, index) => ({ text: item[0], meaning: item[1], kind: 'word', sourceIndex: index }));
    const people = content.people.map((item, index) => ({ text: item[0], meaning: item[1], kind: 'person', sourceIndex: index }));
    return [...words, ...people];
  }

  function sentenceItems() {
    return contentFor().sentences.map((item, index) => ({ text: item[0], meaning: item[1], sourceIndex: index }));
  }

  function currentWord() {
    const items = wordItems();
    return items[state.word] || { text: 'hello', meaning: '你好', kind: 'word' };
  }

  function currentSentence() {
    return sentenceItems()[state.sentence] || { text: 'Hello!', meaning: '你好！' };
  }

  function currentSpeakItem() {
    return state.speakKind === 'word' ? currentWord() : currentSentence();
  }

  function currentSpeakIndex() {
    return state.speakKind === 'word' ? state.word : state.sentence;
  }

  function speakCompletionMode() {
    return state.speakKind === 'word' ? 'speak-word' : 'speak';
  }

  function shuffle(values) {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function cleanLetters(text) {
    return text.toLowerCase().replace(/[^a-z]/g, '');
  }

  function iconFor(item) {
    const text = item.text.toLowerCase();
    if (directIcons[text]) return directIcons[text];
    if (item.kind === 'person' || /(father|mother|mum|dad|grand|brother|sister|cousin|uncle|aunt|girl|child)/.test(text)) return '1F91D';
    if (/(dog|cat|fish|bird|rabbit|fox|panda|monkey|tiger|lion|elephant|giraffe|bear|duck|pig|bee|spider)/.test(text)) return text === 'cat' ? '1F408' : '1F415';
    if (/(apple|banana|grape|orange|fruit|plant|tree|flower|grass|leaf|farm|garden|sunflower)/.test(text)) return '1F34E';
    if (/(red|orange|yellow|green|blue|purple|brown|black|white|pink|colour|rainbow)/.test(text)) return '2B50';
    if (/(look|eye)/.test(text)) return '1F60A';
    if (/(play|toy|kite|card|cake|birthday|number|one|two|three|four|five|six|seven|eight|nine|ten)/.test(text)) return '1F9E9';
    return '1F4AC';
  }

  function visualFor(item) {
    const text = item.text.toLowerCase();
    if (colourSwatches[text] && /色/.test(item.meaning)) return { type: 'colour', value: colourSwatches[text] };
    if (numberCards[text]) return { type: 'number', value: numberCards[text] };
    if (text === 'red panda') return { type: 'red-panda', value: '1F43C' };
    return { type: 'icon', value: iconFor(item) };
  }

  function visualMarkup(item) {
    const visual = visualFor(item);
    if (visual.type === 'colour') return `<span class="semantic-swatch" style="background:${visual.value}" aria-hidden="true"></span>`;
    if (visual.type === 'number') return `<span class="semantic-number" aria-hidden="true">${visual.value}</span>`;
    if (visual.type === 'red-panda') return `<span class="red-panda-icon" aria-hidden="true"><img src="assets/openmoji/${visual.value}.svg" alt=""></span>`;
    return `<img class="semantic-icon" src="assets/openmoji/${visual.value}.svg" alt="">`;
  }

  function sceneFor(item) {
    const text = item.text.toLowerCase();
    if (/(hello|good morning|goodbye)/.test(text)) return 'hello.svg';
    if (/(name|this is .*binbin|this is .*mike)/.test(text)) return 'social-bio.svg';
    if (/(nice to meet|good friend)/.test(text)) return 'friendship.svg';
    if (/(share|for you)/.test(text)) return 'share.svg';
    if (/(help|together|each other)/.test(text)) return 'teamwork.svg';
    if (/(listen|say)/.test(text)) return 'audio-conversation.svg';
    if (/(family|mum|dad|grandpa|brother|sister|cousin)/.test(text)) return 'friends.svg';
    const subjectScenes = [
      ['red panda', '1F43C'], ['giraffe', '1F992'], ['elephant', '1F418'], ['lion', '1F981'], ['panda', '1F43C'],
      ['rabbit', '1F407'], ['fox', '1F98A'], ['fish', '1F41F'], ['cat', '1F408'], ['dog', '1F415'], ['pet', '1F43E'], ['zoo', '1F43E'],
      ['bananas', '1F34C'], ['banana', '1F34C'], ['grapes', '1F347'], ['grape', '1F347'], ['oranges', '1F34A'], ['orange', '1F34A'],
      ['apples', '1F34E'], ['apple', '1F34E'], ['flowers', '1F33C'], ['flower', '1F33C'], ['trees', '1F333'], ['tree', '1F333'],
      ['plants', '1F331'], ['plant', '1F331'], ['farm', '1F69C'], ['garden', '1F3E1'], ['sunflower', '1F33B'], ['birthday', '1F382'],
      ['cake', '1F382'], ['shop', '1F6D2'], ['yuan', '1F4B4'], ['o\'clock', '1F550'], ['colour', '1F3A8'], ['purple', '1F3A8'],
      ['green', '1F3A8'], ['red', '1F3A8'], ['blue', '1F3A8'], ['yellow', '1F3A8']
    ];
    const subject = subjectScenes.find(([keyword]) => text.includes(keyword));
    if (subject) return `../openmoji/${subject[1]}.svg`;
    if (/(year|old|many|number)/.test(text)) return '../openmoji/2795.svg';
    return 'conversation.svg';
  }

  function prepareAudio(file) {
    if (!file) return null;
    if (audioElements.has(file)) return audioElements.get(file);
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = file;
    audio.load();
    audioElements.set(file, audio);
    return audio;
  }

  function playAudioFile(file, onPlaybackFailure = null, playbackRate = 1) {
    const request = ++audioPlaybackRequest;
    if (state.audio) {
      state.audio.pause();
      state.audio = null;
    }
    try {
      const audio = prepareAudio(file);
      if (!audio || request !== audioPlaybackRequest) return;
      state.audio = audio;
      audio.currentTime = 0;
      audio.preservesPitch = true;
      audio.playbackRate = playbackRate;
      const playback = audio.play();
      if (playback?.catch) playback.catch(() => {
        if (request === audioPlaybackRequest) onPlaybackFailure?.();
      });
    } catch (_) {
      if (request === audioPlaybackRequest) onPlaybackFailure?.();
    }
  }

  function unitAudioFiles(unitIndex = state.unit, voice = state.voice) {
    const content = contentFor(unitIndex);
    const pack = audioPacks[voice];
    if (!pack?.files) return [];
    const wordIndex = unitIndex === state.unit ? state.word : 0;
    const sentenceIndex = unitIndex === state.unit ? state.sentence : 0;
    const texts = [
      content.words[wordIndex]?.[0],
      content.sentences[sentenceIndex]?.[0],
      content.words[(wordIndex + 1) % content.words.length]?.[0],
      content.sentences[(sentenceIndex + 1) % content.sentences.length]?.[0]
    ];
    return [...new Set(texts.map(text => pack.files[text]).filter(Boolean))];
  }

  function preloadCurrentUnitAudio() {
    unitAudioFiles().forEach(file => prepareAudio(file));
  }

  function playText(text) {
    stopRecognition(true);
    const pack = audioPacks[state.voice];
    const file = pack?.files?.[text] || '';
    if (file) {
      playAudioFile(file);
      return;
    }
    audioPlaybackRequest += 1;
  }

  function phonicsFor(item = currentWord()) {
    return item.kind === 'word' ? phonicsContent[state.unit]?.[item.text.toLowerCase()] || null : null;
  }

  function playPhoneme(sound, button = null, label = '', onPlaybackFailure = null) {
    const info = phonemeInfo[sound] || ['仔细听这个声音', ''];
    const tip = label ? `“${label.replace('_', '–')}”的声音：${info[0]}` : info[0];
    const soundTip = $('#sound-tip');
    if (soundTip) soundTip.textContent = tip;
    if (label && state.mode === 'spell') {
      const feedback = $('#word-feedback');
      feedback.className = 'feedback phonics-feedback';
      feedback.textContent = tip;
    }
    $$('.sound-part').forEach(item => item.classList.remove('active'));
    if (button) {
      button.classList.add('active');
      setTimeout(() => button.classList.remove('active'), 650);
    }
    if (sound === 'silent') return;
    playAudioFile(phonemeFile(sound), onPlaybackFailure);
  }

  function phonemeFile(sound) {
    if (!sound || sound === 'silent') return '';
    const buzzFile = buzzPhonemeFiles[sound];
    const base = phonemeAudio[state.voice] || phonemeAudio.sarah;
    return buzzFile && phonemeAudio.buzzphonics
      ? `${phonemeAudio.buzzphonics}${buzzFile}`
      : `${base}${sound}.m4a`;
  }

  function preloadCurrentWordPhonics(item = currentWord()) {
    const sounds = spellingSounds[state.unit]?.[item.text.toLowerCase()] || [];
    [...new Set(sounds.map(phonemeFile).filter(Boolean))].forEach(file => prepareAudio(file));
  }

  function spellingSound(item, index, selectedLetter) {
    const target = cleanLetters(item.text);
    if (selectedLetter === target[index]) {
      return spellingSounds[state.unit]?.[item.text.toLowerCase()]?.[index] || baseLetterSounds[selectedLetter];
    }
    return baseLetterSounds[selectedLetter];
  }

  function completionKey(mode, index, unit = state.unit) {
    return `${unit}:${mode}:${index}`;
  }

  function isDone(mode, index) {
    return Boolean(state.completed[completionKey(mode, index)]);
  }

  function scheduleAnimation(action, delay) {
    const timer = setTimeout(action, reduceMotion ? 0 : delay);
    state.animationTimers.push(timer);
    return timer;
  }

  function clearPracticeAnimations() {
    state.animationTimers.forEach(clearTimeout);
    state.animationTimers = [];
    $$('.flying-piece, .coin-particle, .reward-label, .success-spark').forEach(element => element.remove());
    state.interactionLocked = false;
  }

  function animateTransfer(text, from, to, reverse = false) {
    if (reduceMotion || !from || !to) return Promise.resolve();
    const clone = document.createElement('span');
    clone.className = 'flying-piece';
    clone.textContent = text;
    Object.assign(clone.style, {
      left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`
    });
    document.body.appendChild(clone);
    const dx = to.left - from.left;
    const dy = to.top - from.top;
    const curve = Math.min(28, Math.abs(dy) * .18) * (reverse ? -1 : 1);
    const animation = clone.animate([
      { transform: 'translate(0,0) scale(1)' },
      { transform: `translate(${dx * .52}px,${dy * .48 + curve}px) scale(1.13)`, offset: .52 },
      { transform: `translate(${dx}px,${dy}px) scale(.92)` }
    ], { duration: 380, easing: 'cubic-bezier(.2,.78,.24,1)', fill: 'forwards' });
    return animation.finished.catch(() => {}).finally(() => clone.remove());
  }

  function animateSparks(source) {
    if (reduceMotion || !source) return;
    const bounds = source.getBoundingClientRect();
    const x = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;
    for (let index = 0; index < 8; index += 1) {
      const spark = document.createElement('span');
      const angle = Math.PI * 2 * index / 8 - Math.PI / 2;
      const distance = 38 + index % 2 * 15;
      spark.className = 'success-spark';
      spark.textContent = index % 2 ? '•' : '✦';
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      document.body.appendChild(spark);
      spark.animate([
        { opacity: 0, transform: 'translate(-50%,-50%) scale(.2)' },
        { opacity: 1, transform: `translate(calc(-50% + ${Math.cos(angle) * distance * .55}px),calc(-50% + ${Math.sin(angle) * distance * .55}px)) scale(1.2)`, offset: .42 },
        { opacity: 0, transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px),calc(-50% + ${Math.sin(angle) * distance}px)) scale(.5)` }
      ], { duration: 650, delay: index * 28, easing: 'ease-out' }).finished.catch(() => {}).finally(() => spark.remove());
    }
  }

  function animateReward(source, amount) {
    if (!source) return;
    const targetElement = $('#points-button');
    const from = source.getBoundingClientRect();
    const target = targetElement.getBoundingClientRect();
    const startX = from.left + from.width / 2 - 13;
    const startY = from.top + from.height / 2 - 13;
    const endX = target.left + target.width * .32 - 13;
    const endY = target.top + target.height / 2 - 13;
    const hit = () => replayClass(targetElement, 'score-hit', 520);
    if (reduceMotion) { hit(); return; }
    const label = document.createElement('span');
    label.className = 'reward-label';
    label.textContent = `+${amount} 积分`;
    label.style.left = `${startX - 18}px`;
    label.style.top = `${startY - 5}px`;
    document.body.appendChild(label);
    label.animate([
      { opacity: 0, transform: 'translateY(8px) scale(.8)' },
      { opacity: 1, transform: 'translateY(-22px) scale(1.05)', offset: .35 },
      { opacity: 0, transform: 'translateY(-42px)' }
    ], { duration: 760, easing: 'ease-out' }).finished.catch(() => {}).finally(() => label.remove());
    for (let index = 0; index < 6; index += 1) {
      const coin = document.createElement('span');
      coin.className = 'coin-particle';
      coin.textContent = '★';
      coin.style.left = `${startX}px`;
      coin.style.top = `${startY}px`;
      document.body.appendChild(coin);
      const scatterX = (index - 2.5) * 13;
      const scatterY = -30 - index % 3 * 9;
      coin.animate([
        { opacity: 0, transform: 'translate(0,0) scale(.45)' },
        { opacity: 1, transform: `translate(${scatterX}px,${scatterY}px) scale(1.08) rotate(${index * 35}deg)`, offset: .24 },
        { opacity: 1, transform: `translate(${(endX - startX) * .56 + scatterX}px,${(endY - startY) * .45 - 34}px) scale(.95) rotate(${index * 150}deg)`, offset: .62 },
        { opacity: .1, transform: `translate(${endX - startX}px,${endY - startY}px) scale(.35) rotate(${index * 260}deg)` }
      ], { duration: 820, delay: index * 85, easing: 'cubic-bezier(.2,.72,.25,1)', fill: 'forwards' }).finished.catch(() => {}).finally(() => {
        coin.remove();
        if (index === 5) hit();
      });
    }
  }

  function award(mode, index, amount) {
    const key = completionKey(mode, index);
    if (state.completed[key]) return false;
    state.completed[key] = true;
    state.points += amount;
    state.todayCount += 1;
    saveState();
    updateSummary();
    renderMap(false);
    renderRewards();
    return true;
  }

  function unitProgress(unitIndex) {
    const content = contentFor(unitIndex);
    const total = content.words.length + content.people.length + content.sentences.length * 2;
    if (!total) return 0;
    let done = 0;
    for (let i = 0; i < content.words.length + content.people.length; i += 1) done += state.completed[completionKey('spell', i, unitIndex)] ? 1 : 0;
    for (let i = 0; i < content.sentences.length; i += 1) {
      done += state.completed[completionKey('sentence', i, unitIndex)] ? 1 : 0;
      done += state.completed[completionKey('speak', i, unitIndex)] ? 1 : 0;
    }
    return Math.round(done / total * 100);
  }

  function updateSummary() {
    const meta = unitMeta[state.unit];
    $('#unit-eyebrow').textContent = `TODAY · ${meta.id.toUpperCase()}`;
    $('#points-total').textContent = state.points;
    $('#reward-points').textContent = state.points;
    $('#today-label').textContent = `今天完成 ${state.todayCount} 题`;
    $('#today-track').style.width = `${Math.min(100, state.todayCount / 10 * 100)}%`;
    $$('.voice-option').forEach(button => button.classList.toggle('active', button.dataset.voice === state.voice));
  }

  function showObject(item) {
    $('#object-art').hidden = false;
    $('#scene-art').hidden = true;
    $('#object-art').innerHTML = visualMarkup(item);
    $('#visual-label').textContent = item.meaning;
    $('#visual-note').textContent = item.kind === 'person' ? '教材人物' : '';
  }

  function showScene(item) {
    $('#object-art').hidden = true;
    $('#scene-art').hidden = false;
    $('#scene-image').src = `assets/undraw/${sceneFor(item)}`;
    $('#scene-image').alt = item.meaning;
    $('#visual-label').textContent = `第 ${state.sentence + 1} 个场景`;
    $('#visual-note').textContent = item.meaning;
  }

  function makeLetterPool(item) {
    const answer = cleanLetters(item.text);
    const extras = shuffle('abcdefghijklmnopqrstuvwxyz'.split('').filter(letter => !answer.includes(letter))).slice(0, answer.length > 8 ? 3 : 2);
    return shuffle([...answer, ...extras]).map((letter, id) => ({ letter, id }));
  }

  function renderWord() {
    clearPracticeAnimations();
    const item = currentWord();
    preloadCurrentUnitAudio();
    state.picked = Array(cleanLetters(item.text).length).fill(null);
    state.wordAttempts = 0;
    state.letterPool = makeLetterPool(item);
    preloadCurrentWordPhonics(item);
    showObject(item);
    $('#word-count').textContent = `拼单词 · ${state.word + 1}/${wordItems().length}`;
    $('#word-feedback').textContent = '';
    $('#word-feedback').className = 'feedback';
    $('#word-reveal').hidden = true;
    $('#word-hint').hidden = true;
    $('#word-speak').hidden = true;
    $('#word-next').hidden = true;
    $('#letters').innerHTML = state.letterPool.map(item => `<button class="letter" data-letter-id="${item.id}">${item.letter}</button>`).join('');
    const interactionTip = '电脑悬停试听，手机点击试听并选入。';
    $('#spell-instruction').textContent = item.kind === 'person'
      ? `先听完整姓名。${interactionTip}`
      : `先听完整单词。${interactionTip}`;
    renderSlots();
    syncPickerPage(state.word);
    renderPicker();
  }

  function renderSlots() {
    const target = cleanLetters(currentWord().text);
    $('#slots').innerHTML = Array.from({ length: target.length }, (_, index) => {
      const picked = state.picked[index];
      const resultClass = state.wordAttempts >= 1 && picked ? (picked.letter === target[index] ? ' correct-position' : ' wrong-position') : '';
      const locked = state.wordAttempts >= 1 && picked?.letter === target[index];
      return picked
        ? `<button class="slot${resultClass}" data-picked-letter="${index}" ${locked ? 'disabled' : ''} title="点击放回字母区">${picked.letter}</button>`
        : '<span class="slot"></span>';
    }).join('');
    $$('[data-letter-id]').forEach(button => {
      button.disabled = state.picked.some(item => item?.id === Number(button.dataset.letterId));
    });
  }

  function sentenceTokens() {
    return currentSentence().text.split(/\s+/).filter(Boolean);
  }

  function resetSentence() {
    clearPracticeAnimations();
    preloadCurrentUnitAudio();
    const tokens = sentenceTokens();
    state.sentencePicked = Array(tokens.length).fill(null);
    state.sentenceAttempts = 0;
    if (tokens.length === 1) {
      const fillers = ['Hello!', 'Thanks.', 'Goodbye!'].filter(word => word !== tokens[0]).slice(0, 2);
      state.sentencePool = shuffle([tokens[0], ...fillers].map((word, id) => ({ word, id, answer: word === tokens[0] })));
    } else {
      const source = tokens.map((word, id) => ({ word, id, answer: true }));
      state.sentencePool = shuffle(source);
      if (state.sentencePool.map(item => item.word).join(' ') === currentSentence().text) state.sentencePool.reverse();
    }
    $('#sentence-count').textContent = `听音组句 · ${state.sentence + 1}/${sentenceItems().length}`;
    $('#sentence-feedback').textContent = '';
    $('#sentence-feedback').className = 'feedback';
    $('#sentence-reveal').hidden = true;
    $('#sentence-hint').hidden = true;
    $('#sentence-next').hidden = true;
    showScene(currentSentence());
    renderSentence();
    syncPickerPage(state.sentence);
    renderPicker();
  }

  function renderSentence() {
    const tokens = sentenceTokens();
    $('#sentence-slots').innerHTML = Array.from({ length: tokens.length }, (_, index) => state.sentencePicked[index]
      ? `<button class="sentence-slot filled${state.sentenceAttempts >= 1 ? (state.sentencePicked[index].word === tokens[index] ? ' correct-position' : ' wrong-position') : ''}" data-used-token="${index}" ${state.sentenceAttempts >= 1 && state.sentencePicked[index].word === tokens[index] ? 'disabled' : ''} title="点击放回单词区">${state.sentencePicked[index].word}</button>`
      : '<span class="sentence-slot"></span>').join('');
    $('#sentence-bank').innerHTML = state.sentencePool.map(item => `<button class="word-chip" data-token-id="${item.id}" ${state.sentencePicked.some(used => used?.id === item.id) ? 'disabled' : ''}>${item.word}</button>`).join('');
  }

  function setSpeechVisual(phase, good = false) {
    const visual = $('#recording-visual');
    visual.className = `recording-visual ${phase}${good ? ' good' : ''}`;
  }

  function resetSpeech() {
    clearTimeout(state.speechTimer);
    clearTimeout(state.speechGuard);
    state.speechPhase = 'idle';
    state.speechStartedAt = 0;
    state.speechRetryCount = 0;
    $('#speech-status').hidden = true;
    $('#speech-status').className = 'speech-status';
    $('#speak-start').classList.remove('listening');
    $('#speak-start').textContent = '🎤 开始跟读';
    setSpeechVisual('idle');
  }

  function renderSpeak() {
    const wordMode = state.speakKind === 'word';
    const item = currentSpeakItem();
    preloadCurrentUnitAudio();
    wordMode ? showObject(item) : showScene(item);
    $('#speak-work').classList.toggle('word-speak', wordMode);
    $$('.speak-kind-switch [data-speak-kind]').forEach(button => button.classList.toggle('active', button.dataset.speakKind === state.speakKind));
    $('#speak-count').textContent = wordMode
      ? `单词跟读 · ${state.word + 1}/${wordItems().length}`
      : `短句跟读 · ${state.sentence + 1}/${sentenceItems().length}`;
    $('#speak-target').textContent = wordMode ? '听一听，再读出来' : item.text;
    $('#speak-target').classList.remove('revealed');
    $('#speak-meaning').textContent = item.meaning;
    $('#speak-next').textContent = wordMode ? '下一词 →' : '下一句 →';
    resetSpeech();
    syncPickerPage(currentSpeakIndex());
    renderPicker();
  }

  function quizWords(unitIndex = state.unit) {
    const content = contentFor(unitIndex);
    return [
      ...content.words.map((item, index) => ({ text: item[0], meaning: item[1], kind: 'word', sourceIndex: index })),
      ...content.people.map((item, index) => ({ text: item[0], meaning: item[1], kind: 'person', sourceIndex: index }))
    ];
  }

  function quizSentences(unitIndex = state.unit) {
    return contentFor(unitIndex).sentences.map((item, index) => ({ text: item[0], meaning: item[1], sourceIndex: index }));
  }

  function quizChoices(items, target, count = 3) {
    const alternatives = shuffle(items.filter(item => item.text !== target.text)).slice(0, Math.max(0, count - 1));
    return shuffle([target, ...alternatives]);
  }

  function buildQuizQuestions() {
    const words = quizWords();
    const sentences = quizSentences();
    const pickedWords = shuffle(words).slice(0, 6);
    const pickedSentences = shuffle(sentences).slice(0, 4);
    const idFor = (type, item) => `${type}-${item.kind || 'sentence'}-${item.sourceIndex}`;
    return shuffle([
      { id: idFor('listen', pickedWords[0]), type: 'listen', category: 'vocabulary', item: pickedWords[0], choices: quizChoices(words, pickedWords[0]) },
      { id: idFor('listen', pickedWords[1]), type: 'listen', category: 'vocabulary', item: pickedWords[1], choices: quizChoices(words, pickedWords[1]) },
      { id: idFor('spell', pickedWords[2]), type: 'spell', category: 'vocabulary', item: pickedWords[2] },
      { id: idFor('spell', pickedWords[3]), type: 'spell', category: 'vocabulary', item: pickedWords[3] },
      { id: idFor('spell', pickedWords[4]), type: 'spell', category: 'vocabulary', item: pickedWords[4] },
      { id: idFor('speak-word', pickedWords[5]), type: 'speak-word', category: 'pronunciation', item: pickedWords[5] },
      { id: idFor('sentence', pickedSentences[0]), type: 'sentence', category: 'sentence', item: pickedSentences[0] },
      { id: idFor('sentence', pickedSentences[1]), type: 'sentence', category: 'sentence', item: pickedSentences[1] },
      { id: idFor('context', pickedSentences[2]), type: 'context', category: 'sentence', item: pickedSentences[2], choices: quizChoices(sentences, pickedSentences[2]) },
      { id: idFor('speak-sentence', pickedSentences[3]), type: 'speak-sentence', category: 'pronunciation', item: pickedSentences[3] }
    ]);
  }

  function quizQuestion() {
    return state.quiz.queue[state.quiz.position];
  }

  function renderQuizIntro() {
    clearPracticeAnimations();
    stopQuizSpeech();
    $('#quiz-intro').hidden = false;
    $('#quiz-run').hidden = true;
    $('#quiz-result').hidden = true;
    $('#quiz-unit-label').textContent = `${unitMeta[state.unit].id} · ${unitMeta[state.unit].title}`;
    const result = state.quizResults[state.unit];
    $('#quiz-last-result').hidden = !result;
    if (result) $('#quiz-last-result').textContent = `历史最高 ${result.score} 分 · ${result.passed ? '已通过' : '继续加油'}${result.skipped ? ` · ${result.skipped} 道发音题未评测` : ''}`;
    $('#quiz-start').textContent = result ? '再测一次' : '开始测试';
  }

  function startQuiz(retryWrong = false) {
    clearPracticeAnimations();
    stopQuizSpeech();
    if (!retryWrong || !state.quiz.allQuestions.length) {
      state.quiz.allQuestions = buildQuizQuestions();
      state.quiz.responses = {};
      state.quiz.queue = [...state.quiz.allQuestions];
    } else {
      state.quiz.queue = state.quiz.allQuestions.filter(question => {
        const response = state.quiz.responses[question.id];
        return response && response.points !== null && response.points < 10;
      });
    }
    state.quiz.position = 0;
    $('#quiz-intro').hidden = true;
    $('#quiz-result').hidden = true;
    $('#quiz-run').hidden = false;
    renderQuizQuestion();
  }

  function setQuizFeedback(type, message) {
    const feedback = $('#quiz-feedback');
    feedback.className = `quiz-feedback show ${type}`;
    feedback.textContent = `${type === 'good' ? '✓' : '✕'} ${message}`;
  }

  function resetQuizQuestionUI() {
    state.quiz.picked = [];
    state.quiz.pool = [];
    state.quiz.locked = false;
    $('#quiz-feedback').className = 'quiz-feedback';
    $('#quiz-feedback').textContent = '';
    $('#quiz-skip').hidden = true;
    $('#quiz-listen').hidden = true;
  }

  function quizTypeLabel(type) {
    return {
      listen: '听音选图', spell: '看图拼词', sentence: '听音组句', context: '情境理解',
      'speak-word': '单词跟读', 'speak-sentence': '短句跟读'
    }[type] || '单元测试';
  }

  function renderQuizQuestion() {
    clearPracticeAnimations();
    const question = quizQuestion();
    if (!question) { finishQuiz(); return; }
    resetQuizQuestionUI();
    const total = state.quiz.queue.length;
    $('#quiz-progress-label').textContent = `第 ${state.quiz.position + 1} / ${total} 题`;
    $('#quiz-progress-bar').style.width = `${(state.quiz.position + 1) / total * 100}%`;
    $('#quiz-type').textContent = quizTypeLabel(question.type);
    const questionBox = $('#quiz-question');

    if (question.type === 'listen') {
      $('#quiz-prompt').textContent = '听一听，选出对应的图片';
      $('#quiz-subprompt').textContent = '可以重复播放，不显示英文提示。';
      $('#quiz-listen').hidden = false;
      questionBox.innerHTML = `<div class="quiz-choice-grid">${question.choices.map(choice => `<button class="quiz-choice" data-quiz-choice="${choice.text.replace(/"/g, '&quot;')}">${visualMarkup(choice)}<span class="quiz-choice-meaning">${choice.meaning}</span></button>`).join('')}</div>`;
      scheduleAnimation(() => playText(question.item.text), 180);
      return;
    }

    if (question.type === 'context') {
      $('#quiz-prompt').textContent = '听短句，选择正确的意思';
      $('#quiz-subprompt').textContent = '先理解完整情境，再选择答案。';
      $('#quiz-listen').hidden = false;
      questionBox.innerHTML = `<div class="quiz-choice-grid">${question.choices.map(choice => `<button class="quiz-choice text-choice" data-quiz-choice="${choice.text.replace(/"/g, '&quot;')}">${choice.meaning}</button>`).join('')}</div>`;
      scheduleAnimation(() => playText(question.item.text), 180);
      return;
    }

    if (question.type === 'spell') {
      $('#quiz-prompt').textContent = '看图，把单词拼完整';
      $('#quiz-subprompt').textContent = '测试中不提供字母读音提示。';
      const answer = cleanLetters(question.item.text);
      const extras = shuffle('abcdefghijklmnopqrstuvwxyz'.split('').filter(letter => !answer.includes(letter))).slice(0, answer.length > 8 ? 3 : 2);
      state.quiz.picked = Array(answer.length).fill(null);
      state.quiz.pool = shuffle([...answer, ...extras]).map((letter, id) => ({ letter, id }));
      questionBox.innerHTML = `<div class="quiz-spell-picture">${visualMarkup(question.item)}</div><span class="quiz-spell-meaning">${question.item.meaning}</span><div class="quiz-slots" id="quiz-slots"></div><div class="quiz-bank" id="quiz-bank"></div>`;
      renderQuizArrangement();
      return;
    }

    if (question.type === 'sentence') {
      $('#quiz-prompt').textContent = '听短句，按顺序组装句子';
      $('#quiz-subprompt').textContent = '页面不会提前显示英文答案。';
      $('#quiz-listen').hidden = false;
      const tokens = question.item.text.split(/\s+/).filter(Boolean);
      state.quiz.picked = Array(tokens.length).fill(null);
      state.quiz.pool = shuffle(tokens.map((token, id) => ({ letter: token, id })));
      if (state.quiz.pool.map(item => item.letter).join(' ') === question.item.text) state.quiz.pool.reverse();
      questionBox.innerHTML = '<div class="quiz-slots" id="quiz-slots"></div><div class="quiz-bank" id="quiz-bank"></div>';
      renderQuizArrangement();
      scheduleAnimation(() => playText(question.item.text), 180);
      return;
    }

    const sentenceMode = question.type === 'speak-sentence';
    $('#quiz-prompt').textContent = sentenceMode ? '听示范，再读完整短句' : '听示范，再读这个单词';
    $('#quiz-subprompt').textContent = '停顿后会自动评分；网络异常可以跳过。';
    $('#quiz-listen').hidden = false;
    questionBox.innerHTML = `<div class="quiz-speech-card"><strong>${question.item.text}</strong><span>${question.item.meaning}</span><div class="quiz-speech-mic" id="quiz-speech-mic">🎤</div><button class="quiz-record" id="quiz-record">开始跟读</button></div>`;
  }

  function quizTargetValues(question = quizQuestion()) {
    if (question.type === 'spell') return cleanLetters(question.item.text).split('');
    return question.item.text.split(/\s+/).filter(Boolean);
  }

  function renderQuizArrangement(resultState = '') {
    const question = quizQuestion();
    const target = quizTargetValues(question);
    $('#quiz-slots').innerHTML = target.map((value, index) => {
      const picked = state.quiz.picked[index];
      if (!picked) return '<span class="quiz-slot"></span>';
      const resultClass = resultState ? ` ${resultState}` : '';
      return `<button class="quiz-slot${resultClass}" data-quiz-picked="${index}" ${state.quiz.locked ? 'disabled' : ''}>${picked.letter}</button>`;
    }).join('');
    $('#quiz-bank').innerHTML = state.quiz.pool.map(item => `<button data-quiz-bank="${item.id}" ${state.quiz.picked.some(picked => picked?.id === item.id) ? 'disabled' : ''}>${item.letter}</button>`).join('');
  }

  function quizResponse(points, status = 'answered') {
    const question = quizQuestion();
    state.quiz.responses[question.id] = { points, status, category: question.category };
  }

  function completeQuizQuestion(correct, message = '') {
    if (state.quiz.locked) return;
    state.quiz.locked = true;
    quizResponse(correct ? 10 : 0);
    setQuizFeedback(correct ? 'good' : 'bad', message || (correct ? '答对了！' : '答错了，继续下一题。'));
    $$('#quiz-question button').forEach(button => { button.disabled = true; });
    scheduleAnimation(nextQuizQuestion, 800);
  }

  function evaluateQuizArrangement() {
    const question = quizQuestion();
    if (state.quiz.locked || !state.quiz.picked.length || !state.quiz.picked.every(Boolean)) return;
    const target = quizTargetValues(question);
    const correct = state.quiz.picked.every((item, index) => item.letter === target[index]);
    state.quiz.locked = true;
    renderQuizArrangement(correct ? 'correct' : 'wrong');
    state.quiz.locked = false;
    completeQuizQuestion(correct);
  }

  function answerQuizChoice(button) {
    if (state.quiz.locked) return;
    const question = quizQuestion();
    const correct = button.dataset.quizChoice === question.item.text;
    button.classList.add(correct ? 'correct' : 'wrong');
    completeQuizQuestion(correct);
  }

  function nextQuizQuestion() {
    stopQuizSpeech();
    state.quiz.position += 1;
    renderQuizQuestion();
  }

  function quizCategoryScore(category) {
    const questions = state.quiz.allQuestions.filter(question => question.category === category);
    const responses = questions.map(question => state.quiz.responses[question.id]).filter(response => response && response.points !== null);
    if (!responses.length) return null;
    return Math.round(responses.reduce((sum, response) => sum + response.points, 0) / (responses.length * 10) * 100);
  }

  function finishQuiz() {
    stopQuizSpeech();
    const responses = state.quiz.allQuestions.map(question => state.quiz.responses[question.id]).filter(Boolean);
    const scored = responses.filter(response => response.points !== null);
    const score = scored.length ? Math.round(scored.reduce((sum, response) => sum + response.points, 0) / (scored.length * 10) * 100) : 0;
    const skipped = responses.filter(response => response.points === null).length;
    const passed = score >= 80;
    const previous = state.quizResults[state.unit];
    const improvesAssessment = previous && score === previous.score && skipped < (previous.skipped ?? Infinity);
    if (!previous || score > previous.score || improvesAssessment) {
      state.quizResults[state.unit] = { score, passed, skipped, completedAt: Date.now() };
    } else if (passed && !previous.passed) {
      state.quizResults[state.unit] = { ...previous, passed: true };
    }
    let reward = 0;
    if (passed && award('quiz-pass', 0, 20)) reward += 20;
    if (score === 100 && skipped === 0 && award('quiz-perfect', 0, 10)) reward += 10;
    saveState();
    renderMap(false);

    $('#quiz-run').hidden = true;
    $('#quiz-result').hidden = false;
    $('#quiz-result-mark').textContent = passed ? '✓' : '!';
    $('#quiz-result-mark').className = `quiz-result-mark${passed ? '' : ' retry'}`;
    $('#quiz-result-title').textContent = passed ? '挑战通过！' : '再练一练就能通过';
    $('#quiz-score').textContent = `${score} 分`;
    $('#quiz-result-note').textContent = `${skipped ? `${skipped} 道发音题因网络未计分。` : ''}${reward ? `首次达成，获得 ${reward} 积分。` : passed ? '这个单元已经通过，重复测试不会重复奖励。' : '达到 80 分即可通过，只需要重做薄弱题。'}`;
    const dimensions = [
      ['词汇', quizCategoryScore('vocabulary')],
      ['句型', quizCategoryScore('sentence')],
      ['发音', quizCategoryScore('pronunciation')]
    ];
    $('#quiz-dimensions').innerHTML = dimensions.map(([label, value]) => `<div class="quiz-dimension"><b>${value === null ? '--' : `${value}%`}</b><span>${label}</span></div>`).join('');
    const wrong = state.quiz.allQuestions.filter(question => {
      const response = state.quiz.responses[question.id];
      return response && response.points !== null && response.points < 10;
    });
    $('#quiz-retry').hidden = wrong.length === 0;
  }

  function stopQuizSpeech() {
    state.quiz.session += 1;
    state.quiz.speechActive = false;
    if (xfyunISE) xfyunISE.cancel();
  }

  async function startQuizSpeech() {
    const question = quizQuestion();
    const recordButton = $('#quiz-record');
    if (!question || !recordButton) return;
    if (state.quiz.speechActive) {
      if (xfyunISE) xfyunISE.stop();
      return;
    }
    if (!window.isSecureContext || !xfyunISE) {
      setQuizFeedback('bad', '当前环境无法启动发音评测，可以跳过本题。');
      $('#quiz-skip').hidden = false;
      return;
    }
    stopRecognition(true);
    if (state.audio) { state.audio.pause(); state.audio = null; }
    const session = ++state.quiz.session;
    state.quiz.speechActive = true;
    recordButton.textContent = '正在准备…';
    $('#quiz-speech-mic').classList.remove('listening');
    try {
      await xfyunISE.start({
        text: question.item.text,
        category: question.type === 'speak-word' ? 'read_word' : 'read_sentence',
        onState: phase => {
          if (session !== state.quiz.session) return;
          if (phase === 'recording' || phase === 'voice-start') {
            recordButton.textContent = '■ 提前结束';
            $('#quiz-speech-mic').classList.add('listening');
            if (phase === 'voice-start') setQuizFeedback('good', '听到你的声音了，读完自然停顿即可。');
          } else if (phase === 'processing') {
            recordButton.textContent = '正在评分…';
            recordButton.disabled = true;
            $('#quiz-speech-mic').classList.remove('listening');
          }
        },
        onResult: result => {
          if (session !== state.quiz.session) return;
          state.quiz.speechActive = false;
          const score = result.total ?? result.accuracy ?? 0;
          recordButton.disabled = true;
          recordButton.textContent = '评分完成';
          if (score >= 65) {
            completeQuizQuestion(true, `发音评测 ${score} 分，通过！`);
          } else {
            completeQuizQuestion(false, `发音评测 ${score} 分，未通过。`);
          }
        },
        onError: error => {
          if (session !== state.quiz.session) return;
          state.quiz.speechActive = false;
          recordButton.disabled = false;
          recordButton.textContent = '重新跟读';
          $('#quiz-speech-mic').classList.remove('listening');
          setQuizFeedback('bad', error.code === 'NO_SPEECH' ? '还没有听到声音，请靠近麦克风再试。' : '发音服务暂时不可用，可以跳过本题。');
          if (error.code !== 'NO_SPEECH') $('#quiz-skip').hidden = false;
        }
      });
    } catch (error) {
      state.quiz.speechActive = false;
      recordButton.textContent = '重新跟读';
      setQuizFeedback('bad', '发音服务暂时不可用，可以跳过本题。');
      $('#quiz-skip').hidden = false;
    }
  }

  function skipQuizSpeech() {
    stopQuizSpeech();
    if (state.quiz.locked) return;
    state.quiz.locked = true;
    quizResponse(null, 'skipped');
    setQuizFeedback('good', '本题因网络原因跳过，不计入分数。');
    $('#quiz-skip').hidden = true;
    scheduleAnimation(nextQuizQuestion, 800);
  }

  function setMode(mode) {
    stopRecognition(true);
    if (mode !== 'quiz') {
      clearPracticeAnimations();
      stopQuizSpeech();
    }
    state.mode = mode;
    state.pickerPage = 0;
    $$('.mode').forEach(button => button.classList.toggle('active', button.dataset.mode === mode));
    $('#spell-work').hidden = mode !== 'spell';
    $('#sentence-work').hidden = mode !== 'sentence';
    $('#speak-work').hidden = mode !== 'speak';
    $('#quiz-work').hidden = mode !== 'quiz';
    $('#learning-stage').classList.toggle('quiz-mode', mode === 'quiz');
    if (mode === 'spell') renderWord();
    if (mode === 'sentence') resetSentence();
    if (mode === 'speak') renderSpeak();
    if (mode === 'quiz') renderQuizIntro();
  }

  function pickerItems() {
    if (state.mode === 'spell') return wordItems();
    if (state.mode === 'speak' && state.speakKind === 'word') return wordItems();
    return sentenceItems();
  }

  function syncPickerPage(index) {
    state.pickerPage = Math.floor(index / 12);
  }

  function renderPicker() {
    const items = pickerItems();
    const maxPage = Math.max(0, Math.ceil(items.length / 12) - 1);
    state.pickerPage = Math.max(0, Math.min(maxPage, state.pickerPage));
    const start = state.pickerPage * 12;
    const pageItems = items.slice(start, start + 12);
    const wordPicker = state.mode === 'spell' || (state.mode === 'speak' && state.speakKind === 'word');
    const currentIndex = wordPicker ? state.word : state.sentence;
    $('#picker-title').textContent = state.mode === 'spell' ? `${unitMeta[state.unit].id} 词汇` : state.mode === 'sentence' ? '短句场景' : state.speakKind === 'word' ? '单词跟读' : '短句跟读';
    $('#picker-count').textContent = `${items.length} ${wordPicker ? '项' : '句'} · ${state.pickerPage + 1}/${maxPage + 1} 页`;
    $('#picker-prev').disabled = state.pickerPage === 0;
    $('#picker-next').disabled = state.pickerPage === maxPage;
    $('#picker-grid').innerHTML = pageItems.map((item, offset) => {
      const index = start + offset;
      const doneMode = state.mode === 'speak' ? speakCompletionMode() : state.mode;
      const done = isDone(doneMode, index);
      const image = wordPicker
        ? visualMarkup(item)
        : `<img class="scene-thumb" src="assets/undraw/${sceneFor(item)}" alt="">`;
      return `<button class="pick ${index === currentIndex ? 'active' : ''} ${done ? 'done' : ''}" data-pick-index="${index}" title="${item.meaning}">${image}<span>${wordPicker ? item.meaning : `第 ${index + 1} 句`}</span></button>`;
    }).join('');
  }

  function unitSceneMarkup(index) {
    const ground = '<span class="scene-ground"></span>';
    const sun = '<img class="scene-sun motion-sun" src="assets/openmoji/2600.svg" alt="">';
    if (index === 0) return `<div class="unit-scene greeting-scene" data-scene="greeting">${ground}${sun}<img class="person-a motion-a" src="assets/openmoji/1F466.svg" alt=""><img class="person-b motion-b" src="assets/openmoji/1F467.svg" alt=""><img class="wave motion-wave" src="assets/openmoji/1F44B.svg" alt=""></div>`;
    if (index === 1) return `<div class="unit-scene family-scene" data-scene="family">${ground}${sun}<img class="house" src="assets/openmoji/1F3E0.svg" alt=""><img class="person father motion-father" src="assets/openmoji/1F468.svg" alt=""><img class="person child motion-child" src="assets/openmoji/1F467.svg" alt=""><img class="person mother motion-mother" src="assets/openmoji/1F469.svg" alt=""><img class="heart motion-heart" src="assets/openmoji/2764.svg" alt=""></div>`;
    if (index === 2) return `<div class="unit-scene animal-scene" data-scene="animals">${ground}<span class="pond"></span><img class="scene-tree motion-tree" src="assets/openmoji/1F333.svg" alt=""><img class="bird motion-bird" src="assets/openmoji/1F426.svg" alt=""><img class="rabbit motion-rabbit" src="assets/openmoji/1F407.svg" alt=""><img class="fish motion-fish" src="assets/openmoji/1F41F.svg" alt=""></div>`;
    if (index === 3) return `<div class="unit-scene farm-scene" data-scene="farm">${ground}<span class="field"></span>${sun}<img class="barn" src="assets/openmoji/1F3E0.svg" alt=""><img class="sprout one motion-sprout" src="assets/openmoji/1F331.svg" alt=""><img class="sprout two motion-sprout" src="assets/openmoji/1F331.svg" alt=""><img class="sprout three motion-sprout" src="assets/openmoji/1F331.svg" alt=""><img class="tractor motion-tractor" src="assets/openmoji/1F69C.svg" alt=""></div>`;
    if (index === 4) return `<div class="unit-scene colour-scene" data-scene="colours">${ground}<img class="rainbow motion-rainbow" src="assets/openmoji/1F308.svg" alt=""><img class="palette motion-palette" src="assets/openmoji/1F3A8.svg" alt=""><img class="flower motion-flower" src="assets/openmoji/1F33C.svg" alt=""></div>`;
    if (index === 6) return `<div class="unit-scene revision-focus-scene" data-scene="revision">${ground}<img class="motion-puzzle puzzle-main" src="assets/openmoji/1F9E9.svg" alt=""><img class="motion-star star-one" src="assets/openmoji/2B50.svg" alt=""><img class="motion-star star-two" src="assets/openmoji/2B50.svg" alt=""></div>`;
    return `<div class="unit-scene number-scene" data-scene="numbers">${ground}<span class="number-pop n1">1</span><span class="number-pop n2">2</span><span class="number-pop n3">3</span><img class="cake motion-cake" src="assets/openmoji/1F382.svg" alt=""><img class="party motion-party" src="assets/openmoji/1F389.svg" alt=""></div>`;
  }

  function animateSceneElement(element, frames, options) {
    if (!element) return;
    element.getAnimations().forEach(animation => animation.cancel());
    element.animate(frames, { fill: 'both', ...options, duration: reduceMotion ? 1 : options.duration, delay: reduceMotion ? 0 : options.delay || 0 });
  }

  function playUnitScene(card, delay = 0) {
    const scene = card?.querySelector('[data-scene]');
    if (!scene) return;
    const kind = scene.dataset.scene;
    if (kind === 'greeting') {
      animateSceneElement(scene.querySelector('.motion-a'), [{ opacity: 0, transform: 'translateX(-22px)' }, { opacity: 1, transform: 'translateX(0)' }], { duration: 820, delay, easing: 'ease-out' });
      animateSceneElement(scene.querySelector('.motion-b'), [{ opacity: 0, transform: 'translateX(22px)' }, { opacity: 1, transform: 'translateX(0)' }], { duration: 820, delay: delay + 120, easing: 'ease-out' });
      animateSceneElement(scene.querySelector('.motion-wave'), [{ opacity: 0, transform: 'translateY(12px) rotate(-18deg) scale(.5)' }, { opacity: 1, transform: 'translateY(0) rotate(18deg) scale(1.08)', offset: .65 }, { opacity: 1, transform: 'rotate(-7deg) scale(1)' }], { duration: 920, delay: delay + 380, easing: 'ease-out' });
    } else if (kind === 'family') {
      ['.motion-father', '.motion-child', '.motion-mother'].forEach((selector, index) => animateSceneElement(scene.querySelector(selector), [{ opacity: 0, transform: `${selector.includes('child') ? 'translateX(-50%) ' : ''}translateY(16px) scale(.75)` }, { opacity: 1, transform: `${selector.includes('child') ? 'translateX(-50%) ' : ''}translateY(-3px) scale(1.08)`, offset: .68 }, { opacity: 1, transform: `${selector.includes('child') ? 'translateX(-50%) ' : ''}translateY(0) scale(1)` }], { duration: 1100, delay: delay + index * 120, easing: 'cubic-bezier(.2,.8,.25,1)' }));
      animateSceneElement(scene.querySelector('.motion-heart'), [{ opacity: 0, transform: 'translate(-50%,12px) scale(.4)' }, { opacity: 1, transform: 'translate(-50%,-5px) scale(1.15)', offset: .65 }, { opacity: .9, transform: 'translate(-50%,-1px) scale(1)' }], { duration: 1100, delay: delay + 480, easing: 'ease-out' });
    } else if (kind === 'animals') {
      animateSceneElement(scene.querySelector('.motion-bird'), [{ opacity: 0, transform: 'translate(-24px,9px) rotate(-6deg)' }, { opacity: 1, offset: .18 }, { opacity: 1, transform: 'translate(34px,-14px) rotate(5deg)' }], { duration: 1400, delay, easing: 'ease-in-out' });
      animateSceneElement(scene.querySelector('.motion-rabbit'), [{ opacity: 0, transform: 'translateY(8px) scale(.8)' }, { opacity: 1, transform: 'translateY(-15px) scale(.96,1.07)', offset: .52 }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 1000, delay: delay + 180, easing: 'ease-out' });
      animateSceneElement(scene.querySelector('.motion-fish'), [{ transform: 'translateX(-18px) scaleX(1)' }, { transform: 'translateX(20px) scaleX(1)', offset: .48 }, { transform: 'translateX(20px) scaleX(-1)', offset: .52 }, { transform: 'translateX(-3px) scaleX(-1)' }], { duration: 1450, delay: delay + 100, easing: 'ease-in-out' });
      animateSceneElement(scene.querySelector('.motion-tree'), [{ transform: 'rotate(-3deg)' }, { transform: 'rotate(3deg)' }, { transform: 'rotate(0)' }], { duration: 1300, delay, easing: 'ease-in-out' });
    } else if (kind === 'farm') {
      const distance = Math.round(scene.clientWidth * .72);
      animateSceneElement(scene.querySelector('.motion-tractor'), [{ transform: 'translateX(0) scaleX(-1) rotate(-2deg)' }, { transform: `translateX(${distance}px) scaleX(-1) rotate(2deg)`, offset: .88 }, { transform: `translateX(${distance + 8}px) scaleX(-1) rotate(0)` }], { duration: 1750, delay, easing: 'cubic-bezier(.2,.65,.3,1)' });
      scene.querySelectorAll('.motion-sprout').forEach((sprout, index) => animateSceneElement(sprout, [{ opacity: .2, transform: 'scale(.25)' }, { opacity: 1, transform: 'scale(1.12)', offset: .72 }, { opacity: 1, transform: 'scale(1)' }], { duration: 720, delay: delay + 580 + index * 140, easing: 'ease-out' }));
    } else if (kind === 'colours') {
      animateSceneElement(scene.querySelector('.motion-rainbow'), [{ opacity: 0, transform: 'translateX(-50%) scale(.55)' }, { opacity: 1, transform: 'translateX(-50%) scale(1.08)', offset: .7 }, { opacity: 1, transform: 'translateX(-50%) scale(1)' }], { duration: 1150, delay, easing: 'ease-out' });
      animateSceneElement(scene.querySelector('.motion-palette'), [{ transform: 'translateY(18px) rotate(-16deg)', opacity: 0 }, { transform: 'translateY(0) rotate(7deg)', opacity: 1, offset: .72 }, { transform: 'rotate(0)', opacity: 1 }], { duration: 1000, delay: delay + 240, easing: 'ease-out' });
      animateSceneElement(scene.querySelector('.motion-flower'), [{ transform: 'scale(.25) rotate(-20deg)', opacity: 0 }, { transform: 'scale(1.12) rotate(5deg)', opacity: 1, offset: .72 }, { transform: 'scale(1)', opacity: 1 }], { duration: 850, delay: delay + 420, easing: 'ease-out' });
    } else if (kind === 'numbers') {
      scene.querySelectorAll('.number-pop').forEach((number, index) => animateSceneElement(number, [{ opacity: 0, transform: 'translateY(14px) scale(.5)' }, { opacity: 1, transform: 'translateY(-5px) scale(1.13)', offset: .68 }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 720, delay: delay + index * 170, easing: 'ease-out' }));
      animateSceneElement(scene.querySelector('.motion-cake'), [{ transform: 'translateX(-50%) scale(.6)', opacity: 0 }, { transform: 'translateX(-50%) scale(1.1)', opacity: 1, offset: .72 }, { transform: 'translateX(-50%) scale(1)', opacity: 1 }], { duration: 950, delay: delay + 330, easing: 'ease-out' });
      animateSceneElement(scene.querySelector('.motion-party'), [{ opacity: 0, transform: 'scale(.4) rotate(-24deg)' }, { opacity: 1, transform: 'scale(1.2) rotate(8deg)', offset: .68 }, { opacity: 1, transform: 'scale(1)' }], { duration: 820, delay: delay + 650, easing: 'ease-out' });
    } else if (kind === 'revision') {
      animateSceneElement(scene.querySelector('.motion-puzzle'), [{ opacity: 0, transform: 'translate(-50%,18px) scale(.55) rotate(-10deg)' }, { opacity: 1, transform: 'translate(-50%,-5px) scale(1.12) rotate(4deg)', offset: .68 }, { opacity: 1, transform: 'translate(-50%,0) scale(1) rotate(0)' }], { duration: 1050, delay, easing: 'ease-out' });
      scene.querySelectorAll('.motion-star').forEach((star, index) => animateSceneElement(star, [{ opacity: 0, transform: 'scale(.25) rotate(-30deg)' }, { opacity: 1, transform: 'scale(1.2) rotate(8deg)', offset: .7 }, { opacity: 1, transform: 'scale(1)' }], { duration: 760, delay: delay + 380 + index * 170, easing: 'ease-out' }));
    }
  }

  function unitMicroMarkup(index) {
    if (index === 0) return '<span class="unit-micro-scene micro-greeting"><img class="micro-hand" src="assets/openmoji/1F44B.svg" alt=""><img class="micro-speech" src="assets/openmoji/1F4AC.svg" alt=""></span>';
    if (index === 1) return '<span class="unit-micro-scene micro-family"><img class="micro-person-a" src="assets/openmoji/1F468.svg" alt=""><img class="micro-person-b" src="assets/openmoji/1F469.svg" alt=""><img class="micro-heart" src="assets/openmoji/2764.svg" alt=""></span>';
    if (index === 2) return '<span class="unit-micro-scene micro-animals"><img class="micro-rabbit" src="assets/openmoji/1F407.svg" alt=""><img class="micro-bird" src="assets/openmoji/1F426.svg" alt=""></span>';
    if (index === 3) return '<span class="unit-micro-scene micro-plants"><img class="micro-sprout" src="assets/openmoji/1F331.svg" alt=""><img class="micro-drop" src="assets/openmoji/1F4A7.svg" alt=""><img class="micro-sun" src="assets/openmoji/2600.svg" alt=""></span>';
    if (index === 4) return '<span class="unit-micro-scene micro-colours"><img class="micro-rainbow" src="assets/openmoji/1F308.svg" alt=""><img class="micro-palette" src="assets/openmoji/1F3A8.svg" alt=""></span>';
    if (index === 5) return '<span class="unit-micro-scene micro-numbers"><i>1</i><i>2</i><i>3</i><img class="micro-star" src="assets/openmoji/2B50.svg" alt=""></span>';
    return '<span class="unit-micro-scene micro-revision"><img class="micro-puzzle" src="assets/openmoji/1F9E9.svg" alt=""><img class="micro-revision-star" src="assets/openmoji/2B50.svg" alt=""></span>';
  }

  function renderMap(playIntro = false) {
    $('#unit-grid').innerHTML = unitMeta.map((meta, index) => {
      const progress = unitProgress(index);
      const quizResult = state.quizResults[index];
      const status = quizResult?.passed ? '✓' : progress >= 100 ? '✓' : quizResult ? quizResult.score : '';
      const label = meta.revision ? '复习' : `U${index + 1}`;
      return `<button class="unit-node${state.unit === index ? ' active' : ''}" data-unit-index="${index}" style="--unit-color:${meta.color}" aria-pressed="${state.unit === index}" title="${meta.id} ${meta.title}">${status !== '' ? `<em class="unit-node-status">${status}</em>` : ''}<span class="unit-node-focus"><span class="unit-node-icon">${unitMicroMarkup(index)}</span></span><b>${label}</b><small>${quizUnitNames[index]}</small></button>`;
    }).join('');

    const meta = unitMeta[state.unit];
    const content = contentFor();
    const progress = unitProgress(state.unit);
    const quizResult = state.quizResults[state.unit];
    const currentText = `当前 · ${meta.id} ${quizUnitNames[state.unit]} · ${content.words.length + content.people.length} 词 · ${content.sentences.length} 句 · ${progress}%${quizResult ? ` · 测试 ${quizResult.score}` : ''}`;
    $('#unit-route-current').textContent = currentText;
    $('#unit-route-current').title = currentText;
  }

  function firstIncomplete(mode) {
    const count = mode === 'spell' ? wordItems().length : sentenceItems().length;
    const index = Array.from({ length: count }, (_, itemIndex) => itemIndex).find(itemIndex => !isDone(mode, itemIndex));
    return index === undefined ? 0 : index;
  }

  function openUnit(unitIndex, scrollToPractice = true) {
    state.unit = unitIndex;
    state.word = firstIncomplete('spell');
    state.sentence = firstIncomplete(state.mode === 'speak' ? 'speak' : 'sentence');
    saveState();
    updateSummary();
    renderMap();
    setMode(state.mode);
    preloadCurrentUnitAudio();
    if (scrollToPractice) $('#learning-stage').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderRewards() {
    $('#reward-grid').innerHTML = rewards.map(reward => {
      const waiting = state.pending.some(item => item.rewardId === reward.id);
      return `<article class="reward-item">
        <img src="assets/undraw/${reward.image}" alt="${reward.title}">
        <div><strong>${reward.title}</strong><span>${reward.detail} · ${reward.cost} 积分</span><button data-reward-id="${reward.id}" ${state.points < reward.cost || waiting ? 'disabled' : ''}>${waiting ? '等待确认' : state.points < reward.cost ? '积分不足' : '申请兑换'}</button></div>
      </article>`;
    }).join('');
    $('#pending-area').hidden = state.pending.length === 0;
    $('#pending-list').innerHTML = state.pending.map(item => `<div class="pending-item"><strong>${item.title} · ${item.cost} 积分</strong><div class="pending-actions"><button class="cancel" data-cancel-id="${item.id}">取消</button><button data-confirm-id="${item.id}">家长确认</button></div></div>`).join('');
    $('#points-total').textContent = state.points;
    $('#reward-points').textContent = state.points;
  }

  function showRewardNotice(message, bad = false) {
    const notice = $('#reward-notice');
    notice.hidden = false;
    notice.textContent = message;
    notice.style.borderLeftColor = bad ? 'var(--coral)' : 'var(--green)';
  }

  function requestReward(rewardId) {
    const reward = rewards.find(item => item.id === rewardId);
    if (!reward || state.points < reward.cost || state.pending.some(item => item.rewardId === rewardId)) return;
    state.pending.unshift({ id: Date.now(), rewardId, title: reward.title, cost: reward.cost, status: 'pending' });
    showRewardNotice(`已申请“${reward.title}”，请家长确认。`);
    saveState();
    renderRewards();
  }

  function confirmReward(id) {
    const item = state.pending.find(reward => reward.id === id);
    if (!item) return;
    if (state.points < item.cost) {
      showRewardNotice('当前积分不足，暂时不能确认。', true);
      return;
    }
    state.points -= item.cost;
    state.pending = state.pending.filter(reward => reward.id !== id);
    showRewardNotice(`兑换成功：${item.title}`);
    saveState();
    updateSummary();
    renderRewards();
  }

  function cancelReward(id) {
    const item = state.pending.find(reward => reward.id === id);
    state.pending = state.pending.filter(reward => reward.id !== id);
    if (item) showRewardNotice(`已取消“${item.title}”，没有扣除积分。`);
    saveState();
    renderRewards();
  }

  function normalizeSpeech(text) {
    return text.toLowerCase()
      .replace(/what['’]?s/g, 'what is')
      .replace(/i['’]?m/g, 'i am')
      .replace(/it['’]?s/g, 'it is')
      .replace(/that['’]?s/g, 'that is')
      .replace(/let['’]?s/g, 'let us')
      .replace(/don['’]?t/g, 'do not')
      .replace(/[^a-z ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function editDistance(a, b) {
    const row = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let i = 1; i <= a.length; i += 1) {
      let previous = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j += 1) {
        const old = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
        previous = old;
      }
    }
    return row[b.length];
  }

  function speechScore(heard, target) {
    const similarity = 1 - editDistance(heard, target) / Math.max(heard.length, target.length, 1);
    const targetWords = target.split(' ');
    const heardWords = new Set(heard.split(' '));
    const coverage = targetWords.filter(word => heardWords.has(word)).length / Math.max(1, targetWords.length);
    return Math.max(similarity, coverage);
  }

  function showSpeechResult(good, title, detail, heard = '', heardLabel = '识别到') {
    clearTimeout(state.speechTimer);
    clearTimeout(state.speechGuard);
    state.speechPhase = 'result';
    $('#speech-status').hidden = false;
    $('#speech-status').className = `speech-status${good ? '' : ' bad'}`;
    $('#speech-title').textContent = title;
    $('#speech-detail').textContent = detail;
    $('#speech-heard').textContent = heard ? `${heardLabel}：“${heard}”` : '';
    $('#speak-start').classList.remove('listening');
    $('#speak-start').textContent = '🎤 再读一次';
    setSpeechVisual('result', good);
    if (state.speakKind === 'word') {
      $('#speak-target').textContent = currentWord().text;
      $('#speak-target').classList.add('revealed');
    }
  }

  function showXfyunResult(result) {
    const score = result.total ?? result.accuracy ?? 0;
    const passed = score >= 65;
    const title = score >= 85
      ? `读得很棒！${score} 分`
      : score >= 70
        ? `读得很清楚！${score} 分`
        : score >= 55
          ? `已经读出来了，${score} 分`
          : `听到了，再练一次 · ${score} 分`;
    const dimensions = [
      result.accuracy != null ? `准确度 ${result.accuracy}` : '',
      result.fluency != null ? `流利度 ${result.fluency}` : '',
      result.integrity != null ? `完整度 ${result.integrity}` : ''
    ].filter(Boolean).join(' · ');
    const problemWords = result.problemWords?.join('、') || '';
    showSpeechResult(passed, title, dimensions || '讯飞已完成本次发音评测。', problemWords, '再注意');
    if (passed) {
      const amount = state.speakKind === 'word' ? 1 : 3;
      if (award(speakCompletionMode(), currentSpeakIndex(), amount)) animateReward($('#recording-visual'), amount);
      renderPicker();
    }
  }

  function evaluateSpeech(results) {
    const target = normalizeSpeech(currentSpeakItem().text);
    const heard = results.map(normalizeSpeech).filter(Boolean);
    const best = heard.reduce((score, item) => Math.max(score, speechScore(item, target)), 0);
    const passed = best >= .7;
    if (passed) {
      showSpeechResult(true, '读出来啦，内容识别通过！', '目标句的主要内容已经识别到。', heard[0] || '');
      const amount = state.speakKind === 'word' ? 1 : 3;
      if (award(speakCompletionMode(), currentSpeakIndex(), amount)) animateReward($('#recording-visual'), amount);
      renderPicker();
    } else {
      showSpeechResult(false, '听到了，再慢一点试一次。', '注意把句子里的单词说完整。', heard[0] || '');
    }
  }

  function stopRecognition(silent = false) {
    state.speechSession += 1;
    clearTimeout(state.speechTimer);
    clearTimeout(state.speechGuard);
    if (state.recognitionEngine === 'xfyun' && xfyunISE) {
      xfyunISE.cancel();
    } else if (state.recognizer) {
      try { state.recognizer.abort(); } catch (_) {}
    }
    state.recognizer = null;
    state.recognitionEngine = null;
    state.speechPhase = 'idle';
    if (!silent && state.mode === 'speak') resetSpeech();
  }

  function finishRecognition() {
    if (state.speechPhase !== 'listening') return;
    state.speechPhase = 'processing';
    $('#speak-start').classList.remove('listening');
    $('#speak-start').textContent = '正在判断…';
    setSpeechVisual('processing');
    try {
      if (state.recognitionEngine === 'xfyun' && xfyunISE) xfyunISE.stop();
      else state.recognizer.stop();
    } catch (_) {
      state.speechResults.length
        ? evaluateSpeech(state.speechResults)
        : showSpeechResult(false, '没有听清', '请靠近麦克风再读一次。');
    }
  }

  async function microphoneReady(session) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return session === state.speechSession;
    } catch (_) {
      showSpeechResult(false, '麦克风权限没有开启', '请在浏览器设置中允许此网站使用麦克风。');
      return false;
    }
  }

  function beginRecognizer(session) {
    if (session !== state.speechSession) return;
    const recognition = new SpeechRecognition();
    state.recognizer = recognition;
    state.recognitionEngine = 'browser';
    state.speechResults = [];
    recognition.lang = 'en-US';
    recognition.continuous = /Android/i.test(navigator.userAgent);
    recognition.interimResults = true;
    recognition.maxAlternatives = 5;
    recognition.onstart = () => {
      if (session !== state.speechSession) return;
      clearTimeout(state.speechGuard);
      state.speechPhase = 'listening';
      state.speechStartedAt = Date.now();
      $('#speech-title').textContent = '正在听你朗读';
      $('#speech-detail').textContent = '请开始朗读，停顿后会自动判断。';
      $('#speak-start').classList.add('listening');
      $('#speak-start').textContent = '■ 提前结束';
      setSpeechVisual('listening');
      state.speechTimer = setTimeout(finishRecognition, state.speakKind === 'word' ? 6000 : 12000);
    };
    recognition.onresult = event => {
      if (session !== state.speechSession) return;
      const result = event.results[event.resultIndex] || event.results[0];
      const alternatives = result ? Array.from(result).map(item => item.transcript.trim()).filter(Boolean) : [];
      if (alternatives.length) {
        state.speechResults = alternatives;
        clearTimeout(state.speechTimer);
        state.speechTimer = setTimeout(finishRecognition, state.speakKind === 'word' ? 1000 : 1400);
      }
      if (result && result.isFinal) {
        evaluateSpeech(alternatives);
        try { recognition.stop(); } catch (_) {}
      }
    };
    recognition.onerror = event => {
      if (session !== state.speechSession || event.error === 'aborted') return;
      const endedTooSoon = Date.now() - state.speechStartedAt < 2500;
      if (event.error === 'no-speech' && endedTooSoon && state.speechRetryCount < 1) return;
      const denied = event.error === 'not-allowed' || event.error === 'service-not-allowed';
      const network = event.error === 'network';
      showSpeechResult(false, denied ? '麦克风权限没有开启' : network ? '语音服务暂时不可用' : '这次没有听清', denied ? '请在浏览器中允许使用麦克风。' : network ? '安卓 Chrome 需要联网调用语音识别服务，请检查网络后重试。' : '请靠近麦克风再读一次。');
    };
    recognition.onend = () => {
      if (session !== state.speechSession || state.speechPhase === 'result') return;
      if (state.speechResults.length) {
        evaluateSpeech(state.speechResults);
        return;
      }
      const endedTooSoon = state.speechPhase === 'listening' && Date.now() - state.speechStartedAt < 2500;
      if (endedTooSoon && state.speechRetryCount < 1) {
        state.speechRetryCount += 1;
        state.speechPhase = 'preparing';
        $('#speech-title').textContent = '麦克风正在稳定…';
        $('#speech-detail').textContent = '请等待“正在听”后再开始读。';
        $('#speak-start').classList.remove('listening');
        $('#speak-start').textContent = '正在重试…';
        setTimeout(() => beginRecognizer(session), 700);
        return;
      }
      showSpeechResult(false, '语音服务未能保持连接', /Android/i.test(navigator.userAgent) ? '请确认 Chrome 可以使用麦克风，并关闭占用麦克风的其他应用后重试。' : '请靠近麦克风再读一次。');
    };
    try {
      recognition.start();
      state.speechGuard = setTimeout(() => {
        if (session === state.speechSession && state.speechPhase === 'preparing') {
          showSpeechResult(false, '语音识别没有启动', '安卓请使用最新版 Chrome，并检查网站的麦克风权限。');
          try { recognition.abort(); } catch (_) {}
        }
      }, 3500);
    } catch (_) {
      showSpeechResult(false, '麦克风启动失败', '刷新页面并重新允许麦克风权限。');
    }
  }

  async function beginXfyunEvaluation(session) {
    if (!xfyunISE || session !== state.speechSession) return false;
    state.recognitionEngine = 'xfyun';
    try {
      await xfyunISE.start({
        text: currentSpeakItem().text,
        category: state.speakKind === 'word' ? 'read_word' : 'read_sentence',
        onState: phase => {
          if (session !== state.speechSession) return;
          if (phase === 'connecting') {
            $('#speech-title').textContent = '正在连接讯飞评测…';
            setSpeechVisual('preparing');
          } else if (phase === 'recording') {
            state.speechPhase = 'listening';
            $('#speech-title').textContent = '正在听你朗读';
            $('#speech-detail').textContent = '请开始朗读，停顿后会自动判断。';
            $('#speak-start').classList.add('listening');
            $('#speak-start').textContent = '■ 提前结束';
            setSpeechVisual('listening');
          } else if (phase === 'voice-start') {
            $('#speech-title').textContent = '听到你的声音了';
            $('#speech-detail').textContent = '继续读，读完自然停顿即可。';
          } else if (phase === 'processing') {
            state.speechPhase = 'processing';
            $('#speech-title').textContent = '正在分析发音…';
            $('#speech-detail').textContent = '马上就能看到结果。';
            $('#speak-start').classList.remove('listening');
            $('#speak-start').textContent = '正在评分…';
            setSpeechVisual('processing');
          }
        },
        onResult: result => {
          if (session !== state.speechSession) return;
          showXfyunResult(result);
        },
        onError: error => {
          if (session !== state.speechSession) return;
          if (error.code === 'SERVICE_UNAVAILABLE' && SpeechRecognition) {
            state.recognitionEngine = null;
            startBrowserFallback(session);
            return;
          }
          const quota = Number(error.code) === 11201 || Number(error.code) === 42306;
          const noSpeech = error.code === 'NO_SPEECH';
          showSpeechResult(false, quota ? '今日评测额度已用完' : noSpeech ? '还没有听到你的声音' : '讯飞评测没有完成', quota ? '明天可以继续使用免费额度。' : noSpeech ? '请在“正在听”出现后靠近麦克风朗读。' : error.message || '请检查网络后再试一次。');
        }
      });
      return true;
    } catch (error) {
      state.recognitionEngine = null;
      if (error.code === 'NOT_CONFIGURED' || error.code === 'SERVICE_UNAVAILABLE') return false;
      showSpeechResult(false, '讯飞评测没有启动', error.message || '请检查配置后重试。');
      return true;
    }
  }

  async function startBrowserFallback(session) {
    if (!SpeechRecognition) {
      showSpeechResult(false, '当前浏览器不支持语音识别', /Android/i.test(navigator.userAgent) ? '请使用最新版 Android Chrome 打开。' : '请使用最新版 Chrome 或 Edge 打开。');
      return;
    }
    if (!await microphoneReady(session) || session !== state.speechSession) return;
    beginRecognizer(session);
  }

  async function startRecognition() {
    if (!window.isSecureContext) {
      showSpeechResult(false, '需要安全连接', '请使用 HTTPS 公网地址或本机 localhost 打开。');
      return;
    }
    if (state.speechPhase === 'listening') {
      finishRecognition();
      return;
    }
    stopRecognition(true);
    if (state.audio) {
      state.audio.pause();
      state.audio = null;
    }
    const session = ++state.speechSession;
    state.speechPhase = 'preparing';
    $('#speech-status').hidden = false;
    $('#speech-status').className = 'speech-status';
    $('#speech-title').textContent = '正在准备麦克风…';
    $('#speech-detail').textContent = '准备好后请直接朗读。';
    $('#speech-heard').textContent = '';
    $('#speak-start').textContent = '准备开始…';
    setSpeechVisual('preparing');
    setTimeout(async () => {
      if (await beginXfyunEvaluation(session)) return;
      startBrowserFallback(session);
    }, 80);
  }

  function replayClass(element, className, duration = 420) {
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
    setTimeout(() => element.classList.remove(className), duration);
  }

  function playArrangementSuccess({ container, pieces, feedback, audioText, next, rewardAmount, newlyAwarded }) {
    state.interactionLocked = true;
    replayClass(container, 'success-sweep', 850);
    pieces.forEach((piece, index) => scheduleAnimation(() => {
      piece.classList.remove('wrong-position');
      piece.classList.add('correct-position');
      piece.animate([
        { transform: 'translateY(0) scale(1)' },
        { transform: 'translateY(-10px) scale(1.08)', offset: .48 },
        { transform: 'translateY(0) scale(1)' }
      ], { duration: reduceMotion ? 1 : 360, easing: 'ease-out' });
    }, 150 + index * 80));
    const focusDelay = 210 + pieces.length * 80;
    scheduleAnimation(() => {
      pieces.forEach((piece, index) => {
        const middle = (pieces.length - 1) / 2;
        piece.animate([
          { transform: 'translateX(0) scale(1)' },
          { transform: `translateX(${(middle - index) * 4}px) scale(1.07)`, offset: .55 },
          { transform: 'translateX(0) scale(1)' }
        ], { duration: reduceMotion ? 1 : 400, easing: 'ease-out' });
      });
      playText(audioText);
    }, focusDelay);
    scheduleAnimation(() => {
      replayClass(feedback, 'pop');
      animateSparks(container);
    }, focusDelay + 280);
    if (newlyAwarded) scheduleAnimation(() => animateReward(container, rewardAmount), focusDelay + 660);
    scheduleAnimation(() => {
      next.hidden = false;
      state.interactionLocked = false;
    }, newlyAwarded ? focusDelay + 1880 : focusDelay + 650);
  }

  function showWordError(message) {
    const feedback = $('#word-feedback');
    feedback.className = 'feedback bad';
    feedback.textContent = `❌ ${message}`;
    replayClass(feedback, 'pop');
    feedback.classList.toggle('again', state.wordAttempts > 1);
    replayClass($('#slots'), 'wrong-attempt', 340);
  }

  function showSentenceError(message) {
    const feedback = $('#sentence-feedback');
    feedback.className = 'feedback bad';
    feedback.textContent = `❌ ${message}`;
    replayClass(feedback, 'pop');
    feedback.classList.toggle('again', state.sentenceAttempts > 1);
    replayClass($('#sentence-slots'), 'wrong-attempt', 340);
  }

  function evaluateWordArrangement() {
    if (!state.picked.every(Boolean) || !$('#word-next').hidden) return;
    const answer = state.picked.map(item => item.letter).join('');
    const target = cleanLetters(currentWord().text);
    if (answer !== target) {
      state.wordAttempts += 1;
      renderSlots();
      if (state.wordAttempts === 1) {
        showWordError('还没有拼对，点击上方字母放回去再试。');
      } else if (state.wordAttempts === 2) {
        const correctCount = state.picked.filter((item, index) => item.letter === target[index]).length;
        showWordError(correctCount ? '绿色位置已经放对，点击橙色字母调整。' : '字母都选齐了，再调整一下顺序。');
      } else if (state.wordAttempts === 3) {
        const wrongIndex = state.picked.findIndex((item, index) => item.letter !== target[index]);
        const sound = spellingSound(currentWord(), wrongIndex, target[wrongIndex]);
        showWordError(`听一听第 ${wrongIndex + 1} 个位置需要的字母音。`);
        if (sound) playPhoneme(sound, null, target[wrongIndex]);
      } else {
        $('#word-hint').hidden = false;
        showWordError('还没拼对，可以看看提示。');
      }
      return;
    }
    const alreadyDone = isDone('spell', state.word);
    $('#word-feedback').className = 'feedback good';
    $('#word-feedback').textContent = alreadyDone ? '✅ 拼对了！这个单词已经掌握。' : '✅ 拼对了！获得 2 积分。';
    $('#word-answer').textContent = currentWord().text;
    $('#word-reveal').hidden = false;
    $('#word-hint').hidden = true;
    $('#word-speak').hidden = false;
    const newlyAwarded = award('spell', state.word, 2);
    renderPicker();
    playArrangementSuccess({
      container: $('#slots'),
      pieces: $$('#slots .slot'),
      feedback: $('#word-feedback'),
      audioText: currentWord().text,
      next: $('#word-next'),
      rewardAmount: 2,
      newlyAwarded
    });
  }

  function evaluateSentenceArrangement() {
    if (!state.sentencePicked.every(Boolean) || !$('#sentence-next').hidden) return;
    const answer = state.sentencePicked.map(item => item.word).join(' ');
    const target = currentSentence().text;
    const tokens = sentenceTokens();
    if (answer !== target) {
      state.sentenceAttempts += 1;
      renderSentence();
      if (state.sentenceAttempts === 1) {
        showSentenceError('顺序还不对，点击上方单词放回去再试。');
      } else if (state.sentenceAttempts === 2) {
        const correctCount = state.sentencePicked.filter((item, index) => item.word === tokens[index]).length;
        showSentenceError(correctCount ? '绿色单词位置正确，点击橙色单词调整。' : '单词都选对了，再调整一下顺序。');
      } else if (state.sentenceAttempts === 3) {
        showSentenceError(`提示：句子以“${tokens[0]}”开头。`);
        playText(currentSentence().text);
      } else {
        $('#sentence-hint').hidden = false;
        showSentenceError('还没排对，可以看看提示。');
      }
      return;
    }
    const alreadyDone = isDone('sentence', state.sentence);
    $('#sentence-feedback').className = 'feedback good';
    $('#sentence-feedback').textContent = alreadyDone ? '✅ 顺序正确！这句话已经掌握。' : '✅ 顺序正确！获得 2 积分。';
    $('#sentence-answer').textContent = currentSentence().text;
    $('#sentence-meaning').textContent = currentSentence().meaning;
    $('#sentence-reveal').hidden = false;
    $('#sentence-hint').hidden = true;
    const newlyAwarded = award('sentence', state.sentence, 2);
    renderPicker();
    playArrangementSuccess({
      container: $('#sentence-slots'),
      pieces: $$('#sentence-slots .sentence-slot'),
      feedback: $('#sentence-feedback'),
      audioText: currentSentence().text,
      next: $('#sentence-next'),
      rewardAmount: 2,
      newlyAwarded
    });
  }

  function bindEvents() {
    $('.mode-grid').addEventListener('click', event => {
      const button = event.target.closest('[data-mode]');
      if (button) setMode(button.dataset.mode);
    });
    $('.voice-switch').addEventListener('click', event => {
      const button = event.target.closest('[data-voice]');
      if (!button || !audioPacks[button.dataset.voice]) return;
      state.voice = button.dataset.voice;
      saveState();
      updateSummary();
      preloadCurrentUnitAudio();
      const quizItem = state.mode === 'quiz' ? quizQuestion()?.item : null;
      playText(quizItem?.text || (state.mode === 'spell' ? currentWord().text : state.mode === 'speak' ? currentSpeakItem().text : currentSentence().text));
    });
    $('#quiz-start').addEventListener('click', () => startQuiz(false));
    $('#quiz-listen').addEventListener('click', () => {
      const question = quizQuestion();
      if (question) playText(question.item.text);
    });
    $('#quiz-question').addEventListener('click', event => {
      const choice = event.target.closest('[data-quiz-choice]');
      if (choice) { answerQuizChoice(choice); return; }
      const bankButton = event.target.closest('[data-quiz-bank]');
      if (bankButton && !state.quiz.locked) {
        const position = state.quiz.picked.findIndex(item => !item);
        const item = state.quiz.pool.find(candidate => candidate.id === Number(bankButton.dataset.quizBank));
        if (position >= 0 && item) {
          state.quiz.picked[position] = item;
          renderQuizArrangement();
          evaluateQuizArrangement();
        }
        return;
      }
      const pickedButton = event.target.closest('[data-quiz-picked]');
      if (pickedButton && !state.quiz.locked) {
        state.quiz.picked[Number(pickedButton.dataset.quizPicked)] = null;
        renderQuizArrangement();
        return;
      }
      if (event.target.closest('#quiz-record')) startQuizSpeech();
    });
    $('#quiz-skip').addEventListener('click', skipQuizSpeech);
    $('#quiz-exit').addEventListener('click', renderQuizIntro);
    $('#quiz-retry').addEventListener('click', () => startQuiz(true));
    $('#quiz-finish').addEventListener('click', () => setMode('spell'));
    $('#letters').addEventListener('mouseover', event => {
      const button = event.target.closest('[data-letter-id]');
      if (!button || button.disabled || button.contains(event.relatedTarget)) return;
      const item = state.letterPool.find(letter => letter.id === Number(button.dataset.letterId));
      const openIndex = state.picked.findIndex(picked => !picked);
      if (!item || openIndex < 0) return;
      if (Date.now() - Number(button.dataset.previewedAt || 0) < 3000) return;
      const sound = spellingSound(currentWord(), openIndex, item.letter);
      if (sound) {
        button.dataset.previewedAt = Date.now();
        playPhoneme(sound, button, item.letter, () => {
          delete button.dataset.previewedAt;
          const feedback = $('#word-feedback');
          if (feedback.classList.contains('good')) return;
          feedback.className = 'feedback phonics-feedback';
          feedback.textContent = '浏览器需要先点击一次字母开启声音。';
        });
      }
    });
    $('#letters').addEventListener('click', async event => {
      const button = event.target.closest('[data-letter-id]');
      const position = state.picked.findIndex(picked => !picked);
      if (!button || position < 0 || !$('#word-next').hidden || state.interactionLocked) return;
      const item = state.letterPool.find(letter => letter.id === Number(button.dataset.letterId));
      if (item) {
        state.interactionLocked = true;
        const from = button.getBoundingClientRect();
        state.picked[position] = item;
        const sound = spellingSound(currentWord(), position, item.letter);
        const justPreviewed = Date.now() - Number(button.dataset.previewedAt || 0) < 3000;
        if (sound && !justPreviewed) playPhoneme(sound, null, item.letter);
        renderSlots();
        const arrived = $('#slots').children[position];
        await animateTransfer(item.letter, from, arrived.getBoundingClientRect());
        arrived.classList.add('arrived');
        state.interactionLocked = false;
      }
      evaluateWordArrangement();
    });
    $('#slots').addEventListener('click', async event => {
      const button = event.target.closest('[data-picked-letter]');
      if (!button || button.disabled || !$('#word-next').hidden || state.interactionLocked) return;
      state.interactionLocked = true;
      const index = Number(button.dataset.pickedLetter);
      const item = state.picked[index];
      const from = button.getBoundingClientRect();
      state.picked[index] = null;
      renderSlots();
      const bank = $(`[data-letter-id="${item.id}"]`);
      await animateTransfer(item.letter, from, bank?.getBoundingClientRect(), true);
      bank?.animate([{ transform: 'scale(.85)' }, { transform: 'scale(1.12)', offset: .55 }, { transform: 'scale(1)' }], { duration: reduceMotion ? 1 : 250, easing: 'ease-out' });
      state.interactionLocked = false;
    });
    $('#word-undo').addEventListener('click', () => {
      if (!$('#word-next').hidden || state.interactionLocked) return;
      for (let index = state.picked.length - 1; index >= 0; index -= 1) {
        if (!state.picked[index]) continue;
        state.picked[index] = null;
        break;
      }
      renderSlots();
    });
    $('#word-listen').addEventListener('click', () => playText(currentWord().text));
    $('#word-hint').addEventListener('click', () => {
      $('#word-answer').textContent = currentWord().text;
      $('#word-reveal').hidden = false;
      $('#word-hint').hidden = true;
      $('#word-feedback').className = 'feedback';
      $('#word-feedback').textContent = '看一眼正确拼写，再自己完成。';
      playText(currentWord().text);
    });
    $('#word-speak').addEventListener('click', () => {
      state.speakKind = 'word';
      setMode('speak');
    });
    $('#word-next').addEventListener('click', () => { state.word = (state.word + 1) % wordItems().length; renderWord(); });
    $('#sentence-bank').addEventListener('click', async event => {
      const button = event.target.closest('[data-token-id]');
      const position = state.sentencePicked.findIndex(item => !item);
      if (!button || position < 0 || !$('#sentence-next').hidden || state.interactionLocked) return;
      const item = state.sentencePool.find(token => token.id === Number(button.dataset.tokenId));
      if (item) {
        state.interactionLocked = true;
        const from = button.getBoundingClientRect();
        state.sentencePicked[position] = item;
        renderSentence();
        const arrived = $('#sentence-slots').children[position];
        await animateTransfer(item.word, from, arrived.getBoundingClientRect());
        arrived.classList.add('arrived');
        state.interactionLocked = false;
      }
      evaluateSentenceArrangement();
    });
    $('#sentence-slots').addEventListener('click', async event => {
      const button = event.target.closest('[data-used-token]');
      if (!button || button.disabled || !$('#sentence-next').hidden || state.interactionLocked) return;
      state.interactionLocked = true;
      const index = Number(button.dataset.usedToken);
      const item = state.sentencePicked[index];
      const from = button.getBoundingClientRect();
      state.sentencePicked[index] = null;
      renderSentence();
      const bank = $(`[data-token-id="${item.id}"]`);
      await animateTransfer(item.word, from, bank?.getBoundingClientRect(), true);
      bank?.animate([{ transform: 'scale(.86)' }, { transform: 'scale(1.1)', offset: .55 }, { transform: 'scale(1)' }], { duration: reduceMotion ? 1 : 250, easing: 'ease-out' });
      state.interactionLocked = false;
    });
    $('#sentence-listen').addEventListener('click', () => playText(currentSentence().text));
    $('#sentence-reset').addEventListener('click', resetSentence);
    $('#sentence-hint').addEventListener('click', () => {
      $('#sentence-answer').textContent = currentSentence().text;
      $('#sentence-meaning').textContent = currentSentence().meaning;
      $('#sentence-reveal').hidden = false;
      $('#sentence-hint').hidden = true;
      $('#sentence-feedback').className = 'feedback';
      $('#sentence-feedback').textContent = '看一眼正确顺序，再自己完成。';
      playText(currentSentence().text);
    });
    $('#sentence-next').addEventListener('click', () => { state.sentence = (state.sentence + 1) % sentenceItems().length; resetSentence(); playText(currentSentence().text); });
    $('.speak-kind-switch').addEventListener('click', event => {
      const button = event.target.closest('[data-speak-kind]');
      if (!button || button.dataset.speakKind === state.speakKind) return;
      stopRecognition(true);
      state.speakKind = button.dataset.speakKind;
      state.pickerPage = 0;
      renderSpeak();
    });
    $('#speak-listen').addEventListener('click', () => playText(currentSpeakItem().text));
    $('#speak-start').addEventListener('click', startRecognition);
    $('#speak-next').addEventListener('click', () => {
      if (state.speakKind === 'word') state.word = (state.word + 1) % wordItems().length;
      else state.sentence = (state.sentence + 1) % sentenceItems().length;
      renderSpeak();
    });
    $('#picker-grid').addEventListener('click', event => {
      const button = event.target.closest('[data-pick-index]');
      if (!button) return;
      const index = Number(button.dataset.pickIndex);
      if (state.mode === 'spell') { state.word = index; renderWord(); }
      else if (state.mode === 'speak' && state.speakKind === 'word') { state.word = index; renderSpeak(); }
      else { state.sentence = index; state.mode === 'sentence' ? resetSentence() : renderSpeak(); }
    });
    $('#picker-prev').addEventListener('click', () => { state.pickerPage -= 1; renderPicker(); });
    $('#picker-next').addEventListener('click', () => { state.pickerPage += 1; renderPicker(); });
    $('#unit-grid').addEventListener('click', event => {
      const button = event.target.closest('[data-unit-index]');
      if (!button) return;
      openUnit(Number(button.dataset.unitIndex), false);
    });
    $('#reward-grid').addEventListener('click', event => {
      const button = event.target.closest('[data-reward-id]');
      if (button) requestReward(button.dataset.rewardId);
    });
    $('#pending-list').addEventListener('click', event => {
      const confirm = event.target.closest('[data-confirm-id]');
      const cancel = event.target.closest('[data-cancel-id]');
      if (confirm) confirmReward(Number(confirm.dataset.confirmId));
      if (cancel) cancelReward(Number(cancel.dataset.cancelId));
    });
    $('#points-button').addEventListener('click', () => $('#reward-shop').scrollIntoView({ behavior: 'smooth', block: 'start' }));
    $('#home-button').addEventListener('click', () => $('#learning-stage').scrollIntoView({ behavior: 'smooth', block: 'start' }));
    window.addEventListener('beforeunload', () => stopRecognition(true));
  }

  function init() {
    if ('caches' in window) caches.delete(LEGACY_AUDIO_CACHE_NAME).catch(() => {});
    if (!textbook.length) {
      document.body.innerHTML = '<p style="padding:30px">教材内容加载失败，请刷新页面。</p>';
      return;
    }
    loadState();
    saveState();
    bindEvents();
    updateSummary();
    renderMap(true);
    renderRewards();
    setMode('spell');
    preloadCurrentUnitAudio();
  }

  init();
})();
