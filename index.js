function encrypt(message = "", key = "") {
    var message = CryptoJS.AES.encrypt(message, key);
    return message.toString();
}

function decrypt(message = "", key = "") {
    var code = CryptoJS.AES.decrypt(message, key);
    var decryptedMessage = code.toString(CryptoJS.enc.Utf8);

    return decryptedMessage;
}

// Create needed constants
const list = document.querySelector("#list"),
    titleInput = document.querySelector("#title"),
    bodyInput = document.querySelector("#body"),
    form = document.querySelectorAll("form")[2],
    submitBtn = document.querySelector("form button"),
    edit = document.querySelector(".icon-tabler-edit"),
    newNote = document.querySelector(".new-note"),
    editNote = document.querySelector(".edit-note"),
    viewNote = document.querySelector(".view-note"),
    form2 = document.querySelector(".edit-note-form"),
    md = new Remarkable(),
    bcrypt = dcodeIO.bcrypt;

class Clicker {
    constructor(element, action, parameters = null) {
        this.element = element;
        this.action = action;
        this.parameters = parameters;

        this.createClick = function () {
            element.tabIndex = 0;
            element.style.cursor = "pointer";

            if (parameters == "event") {
                element.onclick = function (e) {
                    action(e);
                };
                element.onkeydown = function (event) {
                    if (event.keyCode == 32 || event.keyCode == 13) {
                        event.preventDefault();
                        action(event);
                    }
                };
            } else {
                element.onclick = function () {
                    action(parameters);
                };
                element.onkeydown = function (event) {
                    if (event.keyCode == 32 || event.keyCode == 13) {
                        event.preventDefault();
                        action(parameters);
                    }
                };
            }
        };
    }
}

newClicker = new Clicker(
    document.querySelector(".icon-tabler-edit"),
    showNewNote,
    true
);
newClicker.createClick();

xClicker = new Clicker(document.querySelector("#back"), showNewNote, false);
xClicker.createClick();

function showNewNote(add) {
    if (add) {
        document.querySelector("#body").style.height = "auto";
        newNote.classList.add("show-new-note");
        document.querySelector("main").classList.add("shift");
    } else {
        newNote.classList.remove("show-new-note");
        document.querySelector("#title").innerText = "";
        document.querySelector("#body").innerHTML = "";
        newNote.classList.add("not-show-new-note");
        document.querySelector("main").classList.remove("shift");
        setTimeout(() => newNote.classList.remove("not-show-new-note"), 500);
    }
}

x2Clicker = new Clicker(document.querySelector("#back2"), showViewNote, false);
x2Clicker.createClick();

function showViewNote(add) {
    if (add) {
        viewNote.classList.add("show-view-note");
        document.querySelector("main").classList.add("shift");
    } else {
        viewNote.classList.remove("show-view-note");
        viewNote.classList.add("not-show-view-note");
        document.querySelector("main").classList.remove("shift");
        setTimeout(() => viewNote.classList.remove("not-show-view-note"), 500);
    }
}

x3Clicker = new Clicker(document.querySelector("#back3"), showEditNote, false);
x3Clicker.createClick();

function showEditNote(add) {
    if (add) {
        editNote.classList.add("show-edit-note");
    } else {
        editNote.classList.remove("show-edit-note");
        document.querySelector("#title2").value = "";
        document.querySelector("#body2").value = "";
        editNote.classList.add("not-show-edit-note");
        setTimeout(() => editNote.classList.remove("not-show-edit-note"), 500);
    }
}

document.querySelector("#body").addEventListener("input", autoResizeHeight);

function autoResizeHeight() {
    document.querySelector("#body").style.height = "auto";
    document.querySelector("#body").style.height =
        document.querySelector("#body").scrollHeight + "px";
}

document.querySelector("#body2").addEventListener("input", autoResizeHeight2);

function autoResizeHeight2() {
    document.querySelector("#body2").style.height = "auto";
    document.querySelector("#body2").style.height =
        document.querySelector("#body2").scrollHeight + "px";
}

form.onsubmit = addItem;

class Note {
    constructor(title, body, timestamps = new Date(), id = Note.all().length) {
        this.title = title;
        this.body = body;
        this.timestamps = timestamps;
        this.id = id;
    }

    static initialize() {
        if (!localStorage["notes"]) {
            if (localStorage["encryption"] != "false") {
                localStorage["notes"] = encrypt(
                    JSON.stringify([]),
                    sessionStorage["password"]
                );
            } else if (localStorage["encryption"] == "false") {
                localStorage["notes"] = JSON.stringify([]);
            }
        }
    }

    static create(title, body) {
        let newItem = { title: title, body: body, timestamps: new Date() };

        if (localStorage["encryption"] != "false") {
            let notes = JSON.parse(
                decrypt(localStorage["notes"], sessionStorage["password"])
            );

            notes.push(newItem);

            localStorage["notes"] = encrypt(
                JSON.stringify(notes),
                sessionStorage["password"]
            );
        } else if (localStorage["encryption"] == "false") {
            let notes = JSON.parse(localStorage["notes"]);

            notes.push(newItem);

            localStorage["notes"] = JSON.stringify(notes);
        }

        console.log("Note created");
    }

    static all() {
        let notes = []
        if (localStorage["encryption"] != "false") {
            notes = JSON.parse(
                decrypt(localStorage["notes"], sessionStorage["password"])
            );
        } else if (localStorage["encryption"] == "false") {
            notes = JSON.parse(localStorage["notes"]);
        }

        let notesObjects = [];

        notes.forEach(function (note) {
            note["timestamps"] = new Date(note["timestamps"]);

            const noteObject = new Note(
                note["title"],
                note["body"],
                note["timestamps"],
                notes.indexOf(note)
            );
            notesObjects.push(noteObject);
        });

        return notesObjects;
    }

    save() {
        let notes = []
        if (localStorage["encryption"] != "false") {
            notes = JSON.parse(
                decrypt(localStorage["notes"], sessionStorage["password"])
            );
        } else if (localStorage["encryption"] == "false") {
            notes = JSON.parse(localStorage["notes"]);
        }

        if (notes[this.id]) {
            let editedItem = {
                title: this.title,
                body: this.body,
                timestamps: new Date(),
            };

            notes[this.id] = editedItem;

            if (localStorage["encryption"] != "false") {
                localStorage["notes"] = encrypt(
                    JSON.stringify(notes),
                    sessionStorage["password"]
                );
            } else if (localStorage["encryption"] == "false") {
                localStorage["notes"] = JSON.stringify(notes);
            }

            console.log("Note " + this.id + " updated.");
        } else {
            let newItem = {
                title: this.title,
                body: this.body,
                timestamps: new Date(),
            };

            notes.push(newItem);

            if (localStorage["encryption"] != "false") {
                localStorage["notes"] = encrypt(
                    JSON.stringify(notes),
                    sessionStorage["password"]
                );
            } else if (localStorage["encryption"] == "false") {
                localStorage["notes"] = JSON.stringify(notes);
            }

            console.log("Note created");
        }
    }

    destroy() {
        let notes = []
        if (localStorage["encryption"] != "false") {
            notes = JSON.parse(
                decrypt(localStorage["notes"], sessionStorage["password"])
            );
        } else if (localStorage["encryption"] == "false") {
            notes = JSON.parse(localStorage["notes"]);
        }

        notes.splice(this.id, 1);

        if (localStorage["encryption"] != "false") {
            localStorage["notes"] = encrypt(
                JSON.stringify(notes),
                sessionStorage["password"]
            );
        } else if (localStorage["encryption"] == "false") {
            localStorage["notes"] = JSON.stringify(notes);
        }

        Note.displayData();
        console.log("Note " + this.id + " deleted.");

        ////////////////////
        showEditNote(false);
        showViewNote(false);
    }

    static updateNote(noteId, title, body) {
        let editedItem = {
            title: title,
            body: body,
            timestamps: new Date(),
        };

        let notes = []
        if (localStorage["encryption"] != "false") {
            notes = JSON.parse(
                decrypt(localStorage["notes"], sessionStorage["password"])
            );
        } else if (localStorage["encryption"] == "false") {
            notes = JSON.parse(localStorage["notes"]);
        }

        notes[noteId] = editedItem;

        if (localStorage["encryption"] != "false") {
            localStorage["notes"] = encrypt(
                JSON.stringify(notes),
                sessionStorage["password"]
            );
        } else if (localStorage["encryption"] == "false") {
            localStorage["notes"] = JSON.stringify(notes);
        }

        console.log("Note " + noteId + " updated.");

        Note.displayData();

        document.querySelector("#title2").innerText = "";
        document.querySelector("#body2").innerHTML = "";
    }

    static destroy(noteId) {
        let notes = []
        if (localStorage["encryption"] != "false") {
            notes = JSON.parse(
                decrypt(localStorage["notes"], sessionStorage["password"])
            );
        } else if (localStorage["encryption"] == "false") {
            notes = JSON.parse(localStorage["notes"]);
        }

        notes.splice(noteId, 1);

        if (localStorage["encryption"] != "false") {
            localStorage["notes"] = encrypt(
                JSON.stringify(notes),
                sessionStorage["password"]
            );
        } else if (localStorage["encryption"] == "false") {
            localStorage["notes"] = JSON.stringify(notes);
        }

        Note.displayData();
        console.log("Note " + noteId + " deleted.");
        showEditNote(false);
        showViewNote(false);
    }

    static displayData() {
        while (list.firstChild) {
            list.removeChild(list.firstChild);
        }

        const notes = Note.all();

        notes.forEach(function (note) {
            const listItem = document.createElement("div");
            const h3 = document.createElement("h3");
            const textPreview = document.createElement("div");
            const para2 = document.createElement("p");
            const para = document.createElement("p");
            listItem.appendChild(h3);
            textPreview.appendChild(para2);
            textPreview.appendChild(para);
            listItem.appendChild(textPreview);
            list.appendChild(listItem);

            textPreview.classList.add("textpreview");

            const listItemClicker = new Clicker(
                listItem,
                viewItemHandler,
                "event"
            );

            listItemClicker.createClick();

            h3.textContent = note.title;
            para.textContent =
                note.body.length > 70
                    ? note.body.substr(0, 70) + "..."
                    : note.body;

            listItem.setAttribute("data-note-id", note.id);

            let timestamps = new Date(note.timestamps);
            let minutes =
                timestamps.getMinutes() < 10
                    ? "0" + timestamps.getMinutes()
                    : timestamps.getMinutes();
            para2.innerText =
                timestamps.getDate() == new Date().getDate()
                    ? timestamps.getHours() + ":" + minutes
                    : timestamps.getDate() + "/" + timestamps.getMonth();
            para2.classList.add("timestamps");
        });

        if (!list.firstChild) {
            const listItem = document.createElement("div");
            listItem.textContent = "No notes stored.";
            list.appendChild(listItem);
        }
        console.log("Notes displayed");
    }
}

function addItem(e) {
    e.preventDefault();
    Note.create(titleInput.value, bodyInput.value);

    Note.displayData();
    showNewNote(false);

    titleInput.value = "";
    bodyInput.value = "";
}

function editItem(noteId) {
    const notes = Note.all();
    note = notes[noteId];

    showEditNote(true);

    document.querySelector("#title2").value = note.title;
    document.querySelector("#body2").value = note.body;
    document.querySelector("#body2").focus();
    autoResizeHeight2();

    form2.setAttribute("data-note-id", note.id);

    trashClicker = new Clicker(
        document.querySelectorAll(".icon-tabler-trash")[1],
        Note.destroy,
        Number(form2.attributes["data-note-id"].value)
    );
    trashClicker.createClick();

    form2.onsubmit = function (e) {
        e.preventDefault();
        Note.updateNote(
            noteId,
            document.querySelector("#title2").value,
            document.querySelector("#body2").value
        );
        showEditNote(false);
        showViewNote(false);
    };

    document.querySelector("#body2").oninput = function () {
        Note.updateNote(
            noteId,
            document.querySelector("#title2").value,
            document.querySelector("#body2").value
        );
        updateViewNote(note);
    };

    document.querySelector("#title2").oninput = function () {
        Note.updateNote(
            noteId,
            document.querySelector("#title2").value,
            document.querySelector("#body2").value
        );
        updateViewNote(note);
    };
}

function updateViewNote(note) {
    console.log("dasdasd");
    document.querySelector("#view-title").innerText = document.querySelector(
        "#title2"
    ).value;
    document.querySelector("#view-body").innerHTML = md.render(
        document.querySelector("#body2").value
    );
}

function viewItemHandler(e) {
    let noteId = Number(e.target.parentNode.getAttribute("data-note-id"));
    viewItem(noteId);
}

function viewItem(noteId) {
    const notes = Note.all();
    note = notes[noteId];

    showViewNote(true);

    document.querySelector("#view-title").innerText = note.title;
    document.querySelector("#view-body").innerHTML = md.render(note.body);
    document
        .querySelector(".view-note-form")
        .setAttribute("data-note-id", note.id);

    editClicker = new Clicker(
        document.querySelector(".icon-tabler-pencil"),
        editItem,
        Number(
            document.querySelector(".view-note-form").attributes["data-note-id"]
                .value
        )
    );
    editClicker.createClick();

    trashClicker = new Clicker(
        document.querySelectorAll(".icon-tabler-trash")[0],
        Note.destroy,
        Number(
            document.querySelector(".view-note-form").attributes["data-note-id"]
                .value
        )
    );
    trashClicker.createClick();

    document.querySelectorAll("table").forEach((table) => {
        let div = document.createElement("div");
        div.classList.add("table");

        table.parentNode.insertBefore(div, table);

        div.appendChild(table);
    });
}

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
}

const passwordForm = document.querySelector(".password-form"),
    passwordFormInput = document.querySelector(".password-form-input");
const passwordForm2 = document.querySelector(".password-form2"),
    passwordForm2Input = document.querySelector(".password-form2-input"),
    passwordForm2Checkbox = document.querySelector(".password-form2-checkbox");

if (localStorage["encryption"] != "false") {
    if (!sessionStorage["password"]) {
        if (!localStorage["password"]) {
            setPassword();
        } else {
            askForPassword();
        }
    } else {
        Note.initialize();
        Note.displayData();
    }
} else if (localStorage["encryption"] == "false") {
    Note.initialize();
    Note.displayData();
}

function askForPassword() {
    passwordForm.classList.add("show");
    passwordForm.onsubmit = function (e) {
        e.preventDefault();
        bcrypt.compare(
            passwordFormInput.value,
            localStorage["password"],
            function (err, res) {
                if (res == true) {
                    sessionStorage["password"] = passwordFormInput.value;
                    passwordForm.classList.remove("show");
                    Note.initialize();
                    Note.displayData();
                } else {
                    // deny();
                }
            }
        );
    };
}

function setPassword() {
    passwordForm2.classList.add("show");
    passwordForm2.onsubmit = function (e) {
        if (!passwordForm2Checkbox.checked) {
            e.preventDefault();
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(passwordForm2Input.value, salt);
            localStorage["password"] = hash;
            sessionStorage["password"] = passwordForm2Input.value;
            passwordForm2.classList.remove("show");
            Note.initialize();
            Note.displayData();
        } else {
            localStorage["encryption"] = false;
            Note.initialize();
            Note.displayData();
        }
    };
}
