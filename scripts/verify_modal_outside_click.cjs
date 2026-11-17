const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('==================================================');
console.log('  MODAL & FLOATING NOTEPAD OUTSIDE CLICK AUDIT    ');
console.log('==================================================\n');

let passed = 0;
let total = 0;

function check(label, condition) {
  total++;
  if (condition) {
    console.log(`  ✓ PASS: ${label}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${label}`);
  }
}

// 1. FloatingNotepad.jsx
const floatingNotepadPath = path.join(__dirname, '..', 'src', 'components', 'Notepad', 'FloatingNotepad.jsx');
const floatingNotepad = fs.readFileSync(floatingNotepadPath, 'utf8');

check('FloatingNotepad declares notepadRef with useRef', /const notepadRef = useRef\(null\)/.test(floatingNotepad));
check('FloatingNotepad binds ref={notepadRef} to window div', /ref=\{notepadRef\}/.test(floatingNotepad));
check('FloatingNotepad has outside mousedown listener', /document\.addEventListener\("mousedown", handleOutsideClick\)/.test(floatingNotepad));
check('FloatingNotepad has outside touchstart listener', /document\.addEventListener\("touchstart", handleOutsideClick/.test(floatingNotepad));
check('FloatingNotepad checks notepadRef.current.contains(e.target)', /notepadRef\.current && notepadRef\.current\.contains\(e\.target\)/.test(floatingNotepad));
check('FloatingNotepad flushes pending auto-save before closing', /localStorage\.setItem\(activeStorageKey, valToSave\)/.test(floatingNotepad));
check('FloatingNotepad supports Escape key to close', /e\.key === "Escape"/.test(floatingNotepad));
check('FloatingNotepad preserves cleanup of listeners on unmount', /document\.removeEventListener\("mousedown", handleOutsideClick\)/.test(floatingNotepad));

// 2. GlobalWordMeaningModal.jsx
const dictionaryPath = path.join(__dirname, '..', 'src', 'components', 'WordMeaning', 'GlobalWordMeaningModal.jsx');
const dictionary = fs.readFileSync(dictionaryPath, 'utf8');

check('GlobalWordMeaningModal declares modalRef', /const modalRef = useRef\(null\)/.test(dictionary));
check('GlobalWordMeaningModal binds ref={modalRef}', /ref=\{modalRef\}/.test(dictionary));
check('GlobalWordMeaningModal has outside mousedown listener', /document\.addEventListener\("mousedown", handleOutsideClick\)/.test(dictionary));
check('GlobalWordMeaningModal supports Escape key to close', /e\.key === "Escape"/.test(dictionary));

// 3. Triggers & Buttons
const notepadBtnPath = path.join(__dirname, '..', 'src', 'components', 'FloatingNotepadButton.jsx');
const notepadBtn = fs.readFileSync(notepadBtnPath, 'utf8');
check('FloatingNotepadButton has data-notepad-trigger attribute', /data-notepad-trigger="true"/.test(notepadBtn));

const lessonPath = path.join(__dirname, '..', 'src', 'components', 'LessonContent.jsx');
const lesson = fs.readFileSync(lessonPath, 'utf8');
check('LessonContent Notes button has data-notepad-trigger attribute', /data-notepad-trigger="true"/.test(lesson));

const dictBtnPath = path.join(__dirname, '..', 'src', 'components', 'FloatingDictionaryButton.jsx');
const dictBtn = fs.readFileSync(dictBtnPath, 'utf8');
check('FloatingDictionaryButton has data-dictionary-trigger attribute', /data-dictionary-trigger="true"/.test(dictBtn));

// 4. CertificateModal.jsx backdrop
const certModalPath = path.join(__dirname, '..', 'src', 'components', 'CertificateModal.jsx');
const certModal = fs.readFileSync(certModalPath, 'utf8');
check('CertificateModal has backdrop click handler', /onClick=\{onClose\}/.test(certModal));
check('CertificateModal card stops propagation of backdrop clicks', /onClick=\{\(e\) => e\.stopPropagation\(\)\}/.test(certModal));

console.log('\n==================================================');
console.log(`AUDIT COMPLETE: ${passed} / ${total} checks PASSED!`);
console.log('==================================================');

if (passed !== total) {
  process.exit(1);
}

