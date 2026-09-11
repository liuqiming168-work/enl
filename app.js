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

  const unitMeta = [
    { id: 'Unit 1', title: 'Making friends', subtitle: '问候、介绍与友谊', icon: '1F44B', color: '#58c58a', parts: ['Part A', 'Part B', 'Part C'] },
    { id: 'Unit 2', title: 'Different families', subtitle: '家庭成员与不同的家庭', icon: '1F91D', color: '#65c7db', parts: ['Part A', 'Part B', 'Part C'] },
    { id: 'Unit 3', title: 'Amazing animals', subtitle: '宠物、野生动物与特征', icon: '1F415', color: '#f4c64f', parts: ['Part A', 'Part B', 'Part C'] },
    { id: 'Unit 4', title: 'Plants around us', subtitle: '水果、植物与爱护花园', icon: '1F34E', color: '#7779df', parts: ['Part A', 'Part B', 'Part C'] },
    { id: 'Unit 5', title: 'The colourful world', subtitle: '颜色、标识与多彩自然', icon: '1F60A', color: '#e575a8', parts: ['Part A', 'Part B', 'Part C'] },
    { id: 'Unit 6', title: 'Useful numbers', subtitle: '数字、年龄与生日', icon: '2B50', color: '#58c58a', parts: ['Part A', 'Part B', 'Part C'] },
    { id: 'Revision', title: 'Being a good guest', subtitle: '全册综合复习与礼貌做客', icon: '1F9E9', color: '#f16f5c', parts: ['听力', '拼写', '跟读'], revision: true }
  ];

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
    points: 340,
    completed: {},
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
    speechRetryCount: 0
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
      if (Number.isFinite(saved.points)) state.points = Math.max(0, saved.points);
      if (saved.completed && typeof saved.completed === 'object') state.completed = saved.completed;
      if (Array.isArray(saved.pending)) state.pending = saved.pending.filter(item => item && item.status === 'pending');
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
        points: state.points,
        completed: state.completed,
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

  function playText(text) {
    stopRecognition(true);
    if (state.audio) {
      state.audio.pause();
      state.audio = null;
    }
    const pack = audioPacks[state.voice];
    const file = pack && pack.files ? pack.files[text] : '';
    if (file) {
      const audio = new Audio(file);
      state.audio = audio;
      audio.playbackRate = 1;
      audio.play().catch(() => fallbackSpeech(text));
      return;
    }
    fallbackSpeech(text);
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
    if (state.audio) state.audio.pause();
    const buzzFile = buzzPhonemeFiles[sound];
    const base = phonemeAudio[state.voice] || phonemeAudio.sarah;
    const source = buzzFile && phonemeAudio.buzzphonics
      ? `${phonemeAudio.buzzphonics}${buzzFile}`
      : `${base}${sound}.wav`;
    const audio = new Audio(source);
    state.audio = audio;
    try {
      const playback = audio.play();
      if (playback?.catch) playback.catch(() => onPlaybackFailure?.());
    } catch (_) {
      onPlaybackFailure?.();
    }
  }

  function spellingSound(item, index, selectedLetter) {
    const target = cleanLetters(item.text);
    if (selectedLetter === target[index]) {
      return spellingSounds[state.unit]?.[item.text.toLowerCase()]?.[index] || baseLetterSounds[selectedLetter];
    }
    return baseLetterSounds[selectedLetter];
  }

  function fallbackSpeech(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = .82;
    window.speechSynthesis.speak(utterance);
  }

  function completionKey(mode, index, unit = state.unit) {
    return `${unit}:${mode}:${index}`;
  }

  function isDone(mode, index) {
    return Boolean(state.completed[completionKey(mode, index)]);
  }

  function award(mode, index, amount) {
    const key = completionKey(mode, index);
    if (state.completed[key]) return;
    state.completed[key] = true;
    state.points += amount;
    state.todayCount += 1;
    saveState();
    updateSummary();
    renderMap();
    renderRewards();
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
    const item = currentWord();
    state.picked = Array(cleanLetters(item.text).length).fill(null);
    state.wordAttempts = 0;
    state.letterPool = makeLetterPool(item);
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
      const resultClass = state.wordAttempts >= 2 && picked ? (picked.letter === target[index] ? ' correct-position' : ' wrong-position') : '';
      const locked = state.wordAttempts >= 2 && picked?.letter === target[index];
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
      ? `<button class="sentence-slot filled${state.sentenceAttempts >= 2 ? (state.sentencePicked[index].word === tokens[index] ? ' correct-position' : ' wrong-position') : ''}" data-used-token="${index}" ${state.sentenceAttempts >= 2 && state.sentencePicked[index].word === tokens[index] ? 'disabled' : ''} title="点击放回单词区">${state.sentencePicked[index].word}</button>`
      : '<span class="sentence-slot"></span>').join('');
    $('#sentence-bank').innerHTML = state.sentencePool.map(item => `<button class="word-chip" data-token-id="${item.id}" ${state.sentencePicked.some(used => used?.id === item.id) ? 'disabled' : ''}>${item.word}</button>`).join('');
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
  }

  function renderSpeak() {
    const wordMode = state.speakKind === 'word';
    const item = currentSpeakItem();
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

  function setMode(mode) {
    stopRecognition(true);
    state.mode = mode;
    state.pickerPage = 0;
    $$('.mode').forEach(button => button.classList.toggle('active', button.dataset.mode === mode));
    $('#spell-work').hidden = mode !== 'spell';
    $('#sentence-work').hidden = mode !== 'sentence';
    $('#speak-work').hidden = mode !== 'speak';
    if (mode === 'spell') renderWord();
    if (mode === 'sentence') resetSentence();
    if (mode === 'speak') renderSpeak();
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

  function renderMap() {
    $('#unit-grid').innerHTML = unitMeta.map((meta, index) => {
      const content = contentFor(index);
      const progress = unitProgress(index);
      return `<button class="unit-node ${state.unit === index ? 'active' : ''} ${meta.revision ? 'revision' : ''}" data-unit-index="${index}" style="--unit-color:${meta.color}" title="进入 ${meta.id}">
        <img src="assets/openmoji/${meta.icon}.svg" alt="">
        <span class="unit-number">${meta.id.toUpperCase()}</span>
        <strong>${meta.title}</strong>
        <small>${meta.subtitle} · ${progress ? `${progress}%` : '未开始'}</small>
        <span class="parts">${meta.parts.map(part => `<span>${part}</span>`).join('')}</span>
        <span class="unit-progress"><i style="width:${progress}%"></i></span>
        <small>${content.words.length + content.people.length} 个词汇 · ${content.sentences.length} 个句型</small>
      </button>`;
    }).join('');
  }

  function firstIncomplete(mode) {
    const count = mode === 'spell' ? wordItems().length : sentenceItems().length;
    const index = Array.from({ length: count }, (_, itemIndex) => itemIndex).find(itemIndex => !isDone(mode, itemIndex));
    return index === undefined ? 0 : index;
  }

  function openUnit(unitIndex) {
    state.unit = unitIndex;
    state.word = firstIncomplete('spell');
    state.sentence = firstIncomplete(state.mode === 'speak' ? 'speak' : 'sentence');
    saveState();
    updateSummary();
    renderMap();
    setMode(state.mode);
    $('#learning-stage').scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      award(speakCompletionMode(), currentSpeakIndex(), state.speakKind === 'word' ? 1 : 3);
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
      award(speakCompletionMode(), currentSpeakIndex(), state.speakKind === 'word' ? 1 : 3);
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
      $('#speech-detail').textContent = '读完后点击“我读完了”。';
      $('#speak-start').classList.add('listening');
      $('#speak-start').textContent = '■ 我读完了';
      state.speechTimer = setTimeout(finishRecognition, 8000);
    };
    recognition.onresult = event => {
      if (session !== state.speechSession) return;
      const result = event.results[event.resultIndex] || event.results[0];
      const alternatives = result ? Array.from(result).map(item => item.transcript.trim()).filter(Boolean) : [];
      if (alternatives.length) state.speechResults = alternatives;
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
          } else if (phase === 'recording') {
            state.speechPhase = 'listening';
            $('#speech-title').textContent = '正在听你朗读';
            $('#speech-detail').textContent = '读完后点击“我读完了”。';
            $('#speak-start').classList.add('listening');
            $('#speak-start').textContent = '■ 我读完了';
          } else if (phase === 'processing') {
            state.speechPhase = 'processing';
            $('#speech-title').textContent = '正在分析发音…';
            $('#speech-detail').textContent = '马上就能看到结果。';
            $('#speak-start').classList.remove('listening');
            $('#speak-start').textContent = '正在评分…';
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
          showSpeechResult(false, quota ? '今日评测额度已用完' : '讯飞评测没有完成', quota ? '明天可以继续使用免费额度。' : error.message || '请检查网络后再试一次。');
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
    $('#speech-detail').textContent = '约 1 秒后开始。';
    $('#speech-heard').textContent = '';
    $('#speak-start').textContent = '准备开始…';
    setTimeout(async () => {
      if (await beginXfyunEvaluation(session)) return;
      startBrowserFallback(session);
    }, 1000);
  }

  function replayClass(element, className, duration = 420) {
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
    setTimeout(() => element.classList.remove(className), duration);
  }

  function showWordError(message) {
    const feedback = $('#word-feedback');
    feedback.className = 'feedback bad';
    feedback.textContent = `❌ ${message}`;
    replayClass(feedback, 'pop');
    replayClass($('#slots'), 'wrong-attempt', 340);
  }

  function showSentenceError(message) {
    const feedback = $('#sentence-feedback');
    feedback.className = 'feedback bad';
    feedback.textContent = `❌ ${message}`;
    replayClass(feedback, 'pop');
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
        showWordError(`提示：这个单词以“${target[0].toUpperCase()}”开头。`);
        playText(currentWord().text);
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
    $('#word-next').hidden = false;
    award('spell', state.word, 2);
    renderPicker();
    playText(currentWord().text);
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
    $('#sentence-next').hidden = false;
    award('sentence', state.sentence, 2);
    renderPicker();
    playText(currentSentence().text);
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
      playText(state.mode === 'spell' ? currentWord().text : currentSentence().text);
    });
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
          feedback.className = 'feedback phonics-feedback';
          feedback.textContent = '浏览器需要先点击一次字母开启声音。';
        });
      }
    });
    $('#letters').addEventListener('click', event => {
      const button = event.target.closest('[data-letter-id]');
      const position = state.picked.findIndex(picked => !picked);
      if (!button || position < 0 || !$('#word-next').hidden) return;
      const item = state.letterPool.find(letter => letter.id === Number(button.dataset.letterId));
      if (item) {
        state.picked[position] = item;
        const sound = spellingSound(currentWord(), position, item.letter);
        const justPreviewed = Date.now() - Number(button.dataset.previewedAt || 0) < 3000;
        if (sound && !justPreviewed) playPhoneme(sound, null, item.letter);
      }
      renderSlots();
      evaluateWordArrangement();
    });
    $('#slots').addEventListener('click', event => {
      const button = event.target.closest('[data-picked-letter]');
      if (!button || button.disabled || !$('#word-next').hidden) return;
      state.picked[Number(button.dataset.pickedLetter)] = null;
      renderSlots();
    });
    $('#word-undo').addEventListener('click', () => {
      if (!$('#word-next').hidden) return;
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
    $('#sentence-bank').addEventListener('click', event => {
      const button = event.target.closest('[data-token-id]');
      const position = state.sentencePicked.findIndex(item => !item);
      if (!button || position < 0 || !$('#sentence-next').hidden) return;
      const item = state.sentencePool.find(token => token.id === Number(button.dataset.tokenId));
      if (item) state.sentencePicked[position] = item;
      renderSentence();
      evaluateSentenceArrangement();
    });
    $('#sentence-slots').addEventListener('click', event => {
      const button = event.target.closest('[data-used-token]');
      if (!button || button.disabled || !$('#sentence-next').hidden) return;
      state.sentencePicked[Number(button.dataset.usedToken)] = null;
      renderSentence();
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
      openUnit(Number(button.dataset.unitIndex));
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
    if (!textbook.length) {
      document.body.innerHTML = '<p style="padding:30px">教材内容加载失败，请刷新页面。</p>';
      return;
    }
    loadState();
    bindEvents();
    updateSummary();
    renderMap();
    renderRewards();
    setMode('spell');
  }

  init();
})();
