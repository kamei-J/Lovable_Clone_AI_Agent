// SimpleNotes core logic
// Note class definition
class Note {
    /**
     * @param {string} id - Unique identifier (UUID)
     * @param {string} title - Note title
     * @param {string} content - Note content
     * @param {string|Date} createdAt - Creation timestamp (ISO string)
     */
    constructor(id, title, content, createdAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        // Store as ISO string for easy serialization
        this.createdAt = createdAt instanceof Date ? createdAt.toISOString() : createdAt;
    }

    /**
     * Convert the note to a plain object suitable for JSON.stringify
     * @returns {{id:string,title:string,content:string,createdAt:string}}
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            content: this.content,
            createdAt: this.createdAt,
        };
    }

    /**
     * Recreate a Note instance from a plain object (e.g., parsed JSON)
     * @param {{id:string,title:string,content:string,createdAt:string}} obj
     * @returns {Note}
     */
    static fromJSON(obj) {
        return new Note(obj.id, obj.title, obj.content, obj.createdAt);
    }
}

// NotesManager singleton
const NotesManager = (() => {
    const STORAGE_KEY = "simpleNotes";
    /** @type {Note[]} */
    let notes = [];

    function loadFromStorage() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                const arr = JSON.parse(raw);
                if (Array.isArray(arr)) {
                    notes = arr.map(item => Note.fromJSON(item));
                } else {
                    notes = [];
                }
            } catch (e) {
                console.error("Failed to parse notes from storage", e);
                notes = [];
            }
        } else {
            notes = [];
        }
    }

    function saveToStorage() {
        const data = JSON.stringify(notes.map(n => n.toJSON()));
        localStorage.setItem(STORAGE_KEY, data);
    }

    function addNote(title = "Untitled", content = "") {
        const id = crypto.randomUUID();
        const note = new Note(id, title, content, new Date());
        notes.push(note);
        saveToStorage();
        return note;
    }

    function updateNote(id, newTitle, newContent) {
        const note = notes.find(n => n.id === id);
        if (!note) return false;
        note.title = newTitle;
        note.content = newContent;
        note.createdAt = new Date().toISOString(); // treat as updated timestamp
        saveToStorage();
        return true;
    }

    function deleteNote(id) {
        const index = notes.findIndex(n => n.id === id);
        if (index === -1) return false;
        notes.splice(index, 1);
        saveToStorage();
        return true;
    }

    function getAllNotes() {
        // Return a shallow copy to avoid external mutation
        return notes.slice();
    }

    function search(query) {
        if (!query) return getAllNotes();
        const lower = query.toLowerCase();
        return notes.filter(n =>
            n.title.toLowerCase().includes(lower) ||
            n.content.toLowerCase().includes(lower)
        );
    }

    // expose public API
    return {
        loadFromStorage,
        saveToStorage,
        addNote,
        updateNote,
        deleteNote,
        getAllNotes,
        search,
        // expose internal array for import replacement (will be overwritten safely)
        _getNotesArray: () => notes,
        _setNotesArray: (arr) => { notes = arr; },
    };
})();

// UI Module
// Cache DOM elements
const dom = {
    noteList: document.getElementById('note-list'),
    noteTitle: document.getElementById('note-title'),
    noteContent: document.getElementById('note-content'),
    searchInput: document.getElementById('search-input'),
    createBtn: document.getElementById('create-note'),
    exportBtn: document.getElementById('export-notes'),
    importBtn: document.getElementById('import-notes'),
    // template for note item
    noteItemTemplate: document.getElementById('note-item-template'),
};

let currentlySelectedId = null;

function truncate(text, max = 50) {
    if (text.length <= max) return text;
    return text.slice(0, max) + "…";
}

function renderNoteList(notes) {
    // Clear existing list
    dom.noteList.innerHTML = '';
    const fragment = document.createDocumentFragment();
    notes.forEach(note => {
        const tmpl = dom.noteItemTemplate.content.cloneNode(true);
        const li = tmpl.querySelector('li');
        li.dataset.id = note.id;
        li.classList.add('note-item');
        const titleSpan = li.querySelector('.note-item-title');
        const previewP = li.querySelector('.note-item-preview');
        titleSpan.textContent = note.title || '(no title)';
        previewP.textContent = truncate(note.content || '');
        // click handler
        li.addEventListener('click', () => selectNote(note.id));
        fragment.appendChild(li);
    });
    dom.noteList.appendChild(fragment);
}

function clearSelectionFromList() {
    const selected = dom.noteList.querySelector('.selected');
    if (selected) selected.classList.remove('selected');
}

function selectNote(id) {
    const note = NotesManager.getAllNotes().find(n => n.id === id);
    if (!note) return;
    currentlySelectedId = id;
    dom.noteTitle.value = note.title;
    dom.noteContent.value = note.content;
    clearSelectionFromList();
    const li = dom.noteList.querySelector(`li[data-id="${id}"]`);
    if (li) li.classList.add('selected');
    // focus content for convenience
    dom.noteContent.focus();
}

function clearEditor() {
    currentlySelectedId = null;
    dom.noteTitle.value = '';
    dom.noteContent.value = '';
    clearSelectionFromList();
}

function exportNotes() {
    const data = JSON.stringify(NotesManager.getAllNotes().map(n => n.toJSON()), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SimpleNotes-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importNotes(event) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.addEventListener('change', () => {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                if (!Array.isArray(parsed)) throw new Error('Invalid format');
                const imported = parsed.map(item => Note.fromJSON(item));
                // Replace current notes
                NotesManager._setNotesArray(imported);
                NotesManager.saveToStorage();
                renderNoteList(NotesManager.getAllNotes());
                clearEditor();
            } catch (err) {
                console.error('Failed to import notes:', err);
                alert('Failed to import notes. See console for details.');
            }
        };
        reader.readAsText(file);
    });
    // Trigger click programmatically
    input.click();
}

function bindEventHandlers() {
    // Create new note
    dom.createBtn.addEventListener('click', () => {
        const newNote = NotesManager.addNote();
        renderNoteList(NotesManager.getAllNotes());
        selectNote(newNote.id);
    });

    // Export notes
    dom.exportBtn.addEventListener('click', exportNotes);

    // Import notes
    dom.importBtn.addEventListener('click', importNotes);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+N : new note
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            dom.createBtn.click();
        }
        // Ctrl+S : save current note (if any)
        else if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            if (currentlySelectedId) {
                const title = dom.noteTitle.value;
                const content = dom.noteContent.value;
                NotesManager.updateNote(currentlySelectedId, title, content);
                renderNoteList(NotesManager.getAllNotes());
            } else {
                // If nothing selected, treat as creating a new note with current editor content
                const title = dom.noteTitle.value || 'Untitled';
                const content = dom.noteContent.value;
                const note = NotesManager.addNote(title, content);
                renderNoteList(NotesManager.getAllNotes());
                selectNote(note.id);
            }
        }
        // Delete key: delete selected note
        else if (e.key === 'Delete') {
            if (currentlySelectedId) {
                const confirmDel = confirm('Delete this note?');
                if (confirmDel) {
                    NotesManager.deleteNote(currentlySelectedId);
                    renderNoteList(NotesManager.getAllNotes());
                    clearEditor();
                }
            }
        }
        // Ctrl+F : focus search input
        else if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            dom.searchInput.focus();
        }
    });

    // Search input live filtering
    dom.searchInput.addEventListener('input', () => {
        const query = dom.searchInput.value.trim();
        const filtered = NotesManager.search(query);
        renderNoteList(filtered);
    });
}

// Initialization on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    NotesManager.loadFromStorage();
    renderNoteList(NotesManager.getAllNotes());
    bindEventHandlers();
});

// Expose for debugging (optional)
window.SimpleNotes = {
    NotesManager,
    exportNotes,
    importNotes,
};
