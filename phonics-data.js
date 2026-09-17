window.PHONICS_CONTENT = {
  0: {
    hello: [['h', 'h'], ['e', 'schwa'], ['ll', 'l'], ['o', 'long_o']],
    hi: [['h', 'h'], ['i', 'long_i']],
    name: [['n', 'n'], ['a_e', 'long_a'], ['m', 'm']],
    friend: [['f', 'f'], ['r', 'r'], ['ie', 'short_e'], ['n', 'n'], ['d', 'd']],
    good: [['g', 'g'], ['oo', 'short_oo'], ['d', 'd']],
    nice: [['n', 'n'], ['i_e', 'long_i'], ['c', 's']],
    meet: [['m', 'm'], ['ee', 'long_e'], ['t', 't']],
    arm: [['ar', 'ar'], ['m', 'm']],
    hand: [['h', 'h'], ['a', 'short_a'], ['n', 'n'], ['d', 'd']],
    ear: [['ear', 'ear']],
    eye: [['eye', 'long_i']],
    mouth: [['m', 'm'], ['ou', 'ow'], ['th', 'th']],
    wave: [['w', 'w'], ['a_e', 'long_a'], ['v', 'v']],
    point: [['p', 'p'], ['oi', 'oy'], ['n', 'n'], ['t', 't']],
    look: [['l', 'l'], ['oo', 'short_oo'], ['k', 'k']],
    listen: [['l', 'l'], ['i', 'short_i'], ['s', 's'], ['t', 'silent'], ['e', 'schwa'], ['n', 'n']],
    smile: [['s', 's'], ['m', 'm'], ['i_e', 'long_i'], ['l', 'l']],
    share: [['sh', 'sh'], ['are', 'air']],
    help: [['h', 'h'], ['e', 'short_e'], ['l', 'l'], ['p', 'p']],
    say: [['s', 's'], ['ay', 'long_a']],
    play: [['p', 'p'], ['l', 'l'], ['ay', 'long_a']],
    fair: [['f', 'f'], ['air', 'air']],
    care: [['c', 'k'], ['are', 'air']],
    together: [['t', 't'], ['o', 'schwa'], ['g', 'g'], ['e', 'short_e'], ['th', 'soft_th'], ['er', 'er']],
    apple: [['a', 'short_a'], ['pp', 'p'], ['le', 'schwa_l']],
    bag: [['b', 'b'], ['a', 'short_a'], ['g', 'g']],
    bed: [['b', 'b'], ['e', 'short_e'], ['d', 'd']],
    cat: [['c', 'k'], ['a', 'short_a'], ['t', 't']],
    can: [['c', 'k'], ['a', 'short_a'], ['n', 'n']],
    dad: [['d', 'd'], ['a', 'short_a'], ['d', 'd']],
    dog: [['d', 'd'], ['o', 'short_o'], ['g', 'g']]
  }
};

window.PHONEME_INFO = {
  h: ['轻轻哈气，喉咙不振动', 'h'],
  schwa: ['很轻、很短的“呃”音', 'ə'],
  l: ['舌尖轻碰上齿后面', 'l'],
  long_o: ['嘴唇收圆，从“哦”滑向“乌”', 'O'],
  long_i: ['嘴巴张开，再滑向“衣”', 'I'],
  n: ['舌尖顶住上齿后面，用鼻子出气', 'n'],
  long_a: ['从“诶”轻轻滑向“衣”', 'A'],
  m: ['双唇闭上，用鼻子发声', 'm'],
  f: ['上牙轻碰下唇，送气', 'f'],
  r: ['舌头微微卷起，不碰上颚', 'ɹ'],
  short_e: ['短促的“哎”音，嘴角微张', 'ɛ'],
  d: ['舌尖轻碰上齿后面，快速弹开', 'd'],
  g: ['舌根抬起，短促发声', 'ɡ'],
  short_oo: ['嘴唇稍圆，短促发“乌”', 'ʊ'],
  s: ['牙齿靠近，像小蛇一样送气', 's'],
  long_e: ['嘴角向两边，发长“衣”音', 'i'],
  t: ['舌尖轻碰上齿后面，快速送气', 't'],
  ar: ['嘴巴张大，声音向后延伸', 'ɑɹ'],
  short_a: ['嘴巴张开，短促发音', 'æ'],
  ear: ['从短“衣”音滑向卷舌音', 'ɪɹ'],
  ow: ['嘴巴张开，再收圆', 'W'],
  th: ['舌尖轻放上下牙之间，送气', 'θ'],
  w: ['嘴唇收圆，再快速打开', 'w'],
  v: ['上牙轻碰下唇，喉咙振动', 'v'],
  p: ['双唇闭合后快速送气', 'p'],
  oy: ['从“哦”滑向“衣”', 'Y'],
  k: ['舌根抬起，短促送气', 'k'],
  short_i: ['短促的“衣”音', 'ɪ'],
  sh: ['嘴唇稍圆，轻轻发“嘘”', 'ʃ'],
  air: ['从“哎”滑向卷舌音', 'ɛɹ'],
  soft_th: ['舌尖轻放牙间，喉咙振动', 'ð'],
  er: ['轻轻发音并带卷舌', 'əɹ'],
  schwa_l: ['轻轻的“呃”音接舌尖音', 'əl'],
  b: ['双唇闭合后短促发声', 'b'],
  short_o: ['嘴巴张开，短促发“哦”', 'ɔ'],
  j: ['舌头抬起，短促发声', 'dʒ'],
  short_u: ['嘴巴自然张开，短促发音', 'ʌ'],
  ks: ['先发 k，再快速接 s', 'ks'],
  y: ['舌面抬起，快速滑向元音', 'j'],
  z: ['像小蜜蜂一样振动发声', 'z'],
  silent: ['这个字母在单词中不发音', '']
};

window.PHONEME_AUDIO = {
  sarah: 'audio/phonics/sarah/',
  buzzphonics: 'audio/phonics/buzzphonics/'
};

// Purpose-recorded phonemes from Buzzphonics. Sounds not available in that
// set fall back to the selected Sarah or Zoom pack.
window.BUZZ_PHONEME_FILES = {
  h: 'h.m4a', l: 'l.m4a', long_o: 'oa.m4a', long_i: 'igh.m4a', n: 'n.m4a',
  long_a: 'ai.m4a', m: 'm.m4a', f: 'f.m4a', r: 'r.m4a', short_e: 'e.m4a',
  d: 'd.m4a', g: 'g.m4a', short_oo: 'oo.m4a', s: 's.m4a', long_e: 'ee.m4a',
  t: 't.m4a', ar: 'ar.m4a', short_a: 'a-pep.m4a', ear: 'ear.m4a', ow: 'ow.m4a',
  th: 'th.m4a', w: 'w.m4a', v: 'v.m4a', p: 'p.m4a', oy: 'oi.m4a', k: 'c.m4a',
  short_i: 'i.m4a', sh: 'sh.m4a', air: 'air.m4a', er: 'er.m4a', b: 'b.m4a',
  short_o: 'o.m4a', j: 'j.m4a', short_u: 'u.m4a', ks: 'x.m4a', y: 'y.m4a', z: 'z.m4a'
};

window.SPELLING_SOUNDS = {
  0: {
    hello: ['h', 'schwa', 'l', 'l', 'long_o'], hi: ['h', 'long_i'], name: ['n', 'long_a', 'm', 'silent'],
    friend: ['f', 'r', 'short_e', 'silent', 'n', 'd'], good: ['g', 'short_oo', 'short_oo', 'd'],
    nice: ['n', 'long_i', 's', 'silent'], meet: ['m', 'long_e', 'long_e', 't'], arm: ['ar', 'ar', 'm'],
    hand: ['h', 'short_a', 'n', 'd'], ear: ['ear', 'ear', 'ear'], eye: ['long_i', 'long_i', 'long_i'],
    mouth: ['m', 'ow', 'ow', 'th', 'th'], wave: ['w', 'long_a', 'v', 'silent'],
    point: ['p', 'oy', 'oy', 'n', 't'], look: ['l', 'short_oo', 'short_oo', 'k'],
    listen: ['l', 'short_i', 's', 'silent', 'schwa', 'n'], smile: ['s', 'm', 'long_i', 'l', 'silent'],
    share: ['sh', 'sh', 'air', 'air', 'silent'], help: ['h', 'short_e', 'l', 'p'], say: ['s', 'long_a', 'long_a'],
    play: ['p', 'l', 'long_a', 'long_a'], fair: ['f', 'air', 'air', 'air'], care: ['k', 'air', 'air', 'silent'],
    together: ['t', 'schwa', 'g', 'short_e', 'soft_th', 'schwa', 'er', 'er'],
    apple: ['short_a', 'p', 'p', 'schwa_l', 'schwa_l'], bag: ['b', 'short_a', 'g'],
    bed: ['b', 'short_e', 'd'], cat: ['k', 'short_a', 't'], can: ['k', 'short_a', 'n'],
    dad: ['d', 'short_a', 'd'], dog: ['d', 'short_o', 'g']
  }
};
