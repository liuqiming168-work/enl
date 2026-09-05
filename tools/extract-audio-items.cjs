const fs = require('fs');
const vm = require('vm');
const source = fs.readFileSync('textbook-data.js', 'utf8');
const context = {window: {}};
vm.runInNewContext(source, context);
const items = [];
context.window.TEXTBOOK_CONTENT.forEach((unit, unitIndex) => {
  unit.words.forEach((word, itemIndex) => items.push({unitIndex, kind:'word', itemIndex, text:word[0]}));
  unit.sentences.forEach((sentence, itemIndex) => items.push({unitIndex, kind:'sentence', itemIndex, text:sentence[0]}));
});
fs.writeFileSync('/private/tmp/enl-audio-items.json', JSON.stringify(items, null, 2));
console.log(`Extracted ${items.length} audio items`);
