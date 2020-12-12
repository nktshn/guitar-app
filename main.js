console.info('STARTING');

const CONFIG = {
    notes: ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'],
    guitars: {
        sixDrop: ['E', 'B', 'G', 'D', 'A', 'D'],
        sixStd: ['E', 'B', 'G', 'D', 'A', 'E'],
        sevenDrop: ['E', 'B', 'G', 'D', 'A', 'E', 'A'],
        ukuleleBaritone: ['E', 'B', 'G', 'D'],
        ukuleleTenor: ['A', 'E', 'C', 'G'],
    },
    fretAmount: 17,
    whitePointsSteps: [3, 2, 2, 2, 3],
    notesToExclude: [],
    scales: {
        minor: [0, 2, 3, 5, 7, 8, 10],
        phrygian: [0, 1, 3, 5, 7, 8, 10],
        major: [0, 2, 4, 5, 7, 9, 11],
    },
    selectedRootNote: 'A#',
    selectedScale: 'minor',
    selectedGuitar: 'sixDrop',
    currentTuning: -4,
}

const NECK_EL = document.querySelector('.neck');
const ROOT_SELECT = document.querySelector('#rootNoteSelect');
const SCALE_SELECT = document.querySelector('#scaleSelect');
const GUITAR_SELECT = document.querySelector('#guitarSelect');



(async _ => {
    // ___ ENTRY POINT ___
    console.info('ENTRY POINT');
    redrawNeck();
    addEventListenters();
    initRootNoteSelectOptions();
    initScaleSelectOptions();
    initGuitarSelectOptions();
})();

function redrawNeck() {
    NECK_EL.innerHTML = '';
    const tuning = createTuning();
    formExcludedNotes();
    for (const root of tuning) {
        const str = createNotesArray(root);
        const HTMLStr = createHTMLElem(['string'], ['string']);
        const HTMLNotes = str.map(note => {
            const el = createHTMLElem(['note'], ['note'], note);
            if (CONFIG.notesToExclude.includes(note)) {
                el.setAttribute('disabled', '');
            };
            return el;
        });
        HTMLNotes.forEach(note => {
            const HTMLfret = createHTMLElem(['fret'], ['fret']);
            HTMLStr.appendChild(HTMLfret);
            HTMLStr.appendChild(note);
        });
        const decorativeHTMLString = createHTMLElem(['decorative-string'], ['decorative-string']);
        HTMLStr.appendChild(decorativeHTMLString);
        NECK_EL.appendChild(HTMLStr);
    }
    drawWhitePoints();
}

function drawWhitePoints() {
    const step = createEndlessIterator(CONFIG.whitePointsSteps);
    for (let i = 0; i <= CONFIG.fretAmount; i += step.next()) {
        if (i === 0) continue;
        const el = createHTMLElem(['whitepoint'], [`whitepoint`]);
        let leftShift = `${110 * i - 50}px`;
        if (i % 12 === 0) {
            el.setAttribute('doubled', '');
            leftShift = `${109 * i - 55}px`;
        }
        el.style.left = leftShift;
        NECK_EL.appendChild(el);
    }
}

function createNotesArray(root, length = CONFIG.fretAmount) {
    const res = [];
    for (let i = 0; i <= length; i++) {
        const note = getNoteFrom(root, i);
        res.push(note);
    }
    return res;
}

/**
 * Utils 
 */

function getNoteIndex(note) {
    return CONFIG.notes.indexOf(note);
}

function getNoteFrom(root, shift) {
    const rootIndex = CONFIG.notes.indexOf(root);
    let expectedShift = rootIndex + shift;
    if (expectedShift < 0) {
        expectedShift += 12;
    }
    return CONFIG.notes[expectedShift % 12];
}

function createHTMLElem(attrs, classes, innerData = null) {
    const el = document.createElement('div');
    for (const attr of attrs) {
        el.setAttribute(attr, '');
    }
    el.setAttribute('class', classes.join(' '));
    innerData && (el.innerHTML = innerData);
    return el;
}

function createEndlessIterator(array) {
    let i = 0;
    return {
        next: _ => {
            return array[i++ % array.length];
        }
    }
}

/**
 * DOM
 */

function addEventListenters() {

}

function initRootNoteSelectOptions() {
    const selectOptions = CONFIG.notes.map(note => {
        const el = document.createElement('option');
        el.value = note;
        el.innerText = note;
        if (CONFIG.selectedRootNote === note) {
            el.setAttribute('selected', '');
        }
        return el;
    });
    selectOptions.forEach(option => {
        ROOT_SELECT.appendChild(option);
    });
}

function initScaleSelectOptions() {
    const selectOptions = Object.keys(CONFIG.scales).map(scale => {
        const el = document.createElement('option');
        el.value = scale;
        el.innerText = scale;
        if (CONFIG.selectedScale === scale) {
            el.setAttribute('selected', '');
        }
        return el;
    });
    selectOptions.forEach(option => {
        SCALE_SELECT.appendChild(option);
    });
}

function initGuitarSelectOptions() {
    const selectOptions = Object.keys(CONFIG.guitars).map(guitar => {
        const el = document.createElement('option');
        el.value = guitar;
        el.innerText = guitar;
        if (CONFIG.selectedGuitar === guitar) {
            el.setAttribute('selected', '');
        }
        return el;
    });
    selectOptions.forEach(option => {
        GUITAR_SELECT.appendChild(option);
    });
}


function handleRootNoteSelect(value) {
    console.log(value);
    CONFIG.selectedRootNote = value;
    formExcludedNotes();
    redrawNeck();
}

function handleScaleSelect(value) {
    console.log(value);
    CONFIG.selectedScale = value;
    formExcludedNotes();
    redrawNeck();
}

function handleGuitarSelect(value) {
    CONFIG.selectedGuitar = value;
    CONFIG.currentTuning = 0;
    redrawNeck();
}

function clearRootAndScaleSelection() {
    CONFIG.selectedRootNote = null;
    CONFIG.selectedScale = null;
    SCALE_SELECT.value = '';
    ROOT_SELECT.value = '';
    redrawNeck();
}

function formExcludedNotes() {
    const [root, scale] = [CONFIG.selectedRootNote, CONFIG.selectedScale];
    if (!root || !scale) {
        CONFIG.notesToExclude = [];
        return;
    }
    const scaleFormula = CONFIG.scales[scale];
    const notesListFromRoot = createNotesArray(root, 11);
    const excludingNotes = notesListFromRoot.filter((note, i) => !scaleFormula.includes(i))
    CONFIG.notesToExclude = excludingNotes;
}

function tuneNeck(value) {
    CONFIG.currentTuning += value;
    redrawNeck();
}
function createTuning() {
    const gtr = CONFIG.guitars[CONFIG.selectedGuitar];
    return gtr.map(root => getNoteFrom(root, CONFIG.currentTuning))
}