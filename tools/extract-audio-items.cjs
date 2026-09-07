const fs = require('fs');
const vm = require('vm');
const source = fs.readFileSync('textbook-data.js', 'utf8');
const context = {window: {}};
vm.runInNewContext(source, context);
const items = [];
const seen = new Set();
function addItem(unitIndex, kind, itemIndex, text) {
  if (!text || seen.has(text)) return;
  seen.add(text);
  items.push({unitIndex, kind, itemIndex, text});
}
context.window.TEXTBOOK_CONTENT.forEach((unit, unitIndex) => {
  unit.people.forEach((person, itemIndex) => addItem(unitIndex, 'person', itemIndex, person[0]));
  unit.words.forEach((word, itemIndex) => addItem(unitIndex, 'word', itemIndex, word[0]));
  unit.sentences.forEach((sentence, itemIndex) => addItem(unitIndex, 'sentence', itemIndex, sentence[0]));
});
fs.writeFileSync('/private/tmp/enl-audio-items.json', JSON.stringify(items, null, 2));
const counts = items.reduce((result, item) => {
  result[item.kind] = (result[item.kind] || 0) + 1;
  return result;
}, {});
console.log(`Extracted ${items.length} unique audio items`, counts);
