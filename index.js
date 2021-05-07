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
    editNote = document.querySelector(".edit-note"),
    viewNote = document.querySelector(".view-note"),
    form2 = document.querySelector(".edit-note-form"),
    md = new Remarkable(),
    bcrypt = dcodeIO.bcrypt,
    passwordForm = document.querySelector(".password-form"),
    passwordFormInput = document.querySelector(".password-form-input"),
    passwordForm2 = document.querySelector(".password-form2"),
    passwordForm2Input = document.querySelector(".password-form2-input"),
    passwordForm2Checkbox = document.querySelector(".password-form2-checkbox"),
    passwordForm2Checkbox2 = document.querySelector(
        ".password-form2-checkbox2"
    ),
    popup = document.querySelector(".popuptext");

let password;

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

sortClicker = new Clicker(
    document.getElementsByClassName("icon-tabler-arrows-sort")[0],
    showSort,
    true
);
sortClicker.createClick();

function showSort(add) {
    if (add) {
        popup.classList.toggle("show");
        tDesc = new Clicker(
            document.querySelector(".timestamps-desc"),
            changeSort,
            "timestamps-desc"
        ).createClick();
        tAsc = new Clicker(
            document.querySelector(".timestamps-asc"),
            changeSort,
            "timestamps-asc"
        ).createClick();
        cDesc = new Clicker(
            document.querySelector(".created-desc"),
            changeSort,
            "created-desc"
        ).createClick();
        cAsc = new Clicker(
            document.querySelector(".created-asc"),
            changeSort,
            "created-asc"
        ).createClick();
        tiDesc = new Clicker(
            document.querySelector(".title-desc"),
            changeSort,
            "title-desc"
        ).createClick();
        tiAsc = new Clicker(
            document.querySelector(".title-asc"),
            changeSort,
            "title-asc"
        ).createClick();
    } else {
        popup.classList.remove("show");
    }
}

function changeSort(sort) {
    localStorage["sort"] = sort;
    Note.displayData();
}

newClicker = new Clicker(
    document.querySelector(".icon-tabler-edit"),
    showNewNote,
    true
);
newClicker.createClick();

function showNewNote(add) {
    if (add) {
        const note = new Note();
        note.save();
        showViewNote(true);
        editItem(note.id);
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
        updateViewNote();
        Note.displayData();
        editNote.classList.remove("show-edit-note");
        titleInput.value = "";
        bodyInput.value = "";
        editNote.classList.add("not-show-edit-note");
        setTimeout(() => editNote.classList.remove("not-show-edit-note"), 500);
    }
}

bodyInput.addEventListener("input", autoResizeHeight);

function autoResizeHeight() {
    bodyInput.style.height = "auto";
    bodyInput.style.height = bodyInput.scrollHeight + "px";
}

class Note {
    constructor(
        title = "",
        body = "",
        timestamps = new Date(),
        id = Note.all().length
    ) {
        this.title = title;
        this.body = body;
        this.timestamps = timestamps;
        this.id = id;
    }

    static initialize() {
        if (!localStorage["notes"]) {
            if (localStorage["encryption"] != "false") {
                localStorage["notes"] = encrypt(JSON.stringify([]), password);
            } else if (localStorage["encryption"] == "false") {
                localStorage["notes"] = JSON.stringify([]);
            }
        }
    }

    static create(title, body) {
        let newItem = { title: title, body: body, timestamps: new Date() };

        let notes = Note.allArray();

        notes.push(newItem);

        Note.saveArray(notes);

        console.log("Note created");
    }

    static allArray() {
        let notes = [];
        if (localStorage["encryption"] != "false") {
            password = sessionStorage["password"]
                ? sessionStorage["password"]
                : password;
            notes = JSON.parse(decrypt(localStorage["notes"], password));
        } else if (localStorage["encryption"] == "false") {
            notes = JSON.parse(localStorage["notes"]);
        }

        return notes;
    }

    static saveArray(notes) {
        if (localStorage["encryption"] != "false") {
            password = sessionStorage["password"]
                ? sessionStorage["password"]
                : password;
            localStorage["notes"] = encrypt(JSON.stringify(notes), password);
        } else if (localStorage["encryption"] == "false") {
            localStorage["notes"] = JSON.stringify(notes);
        }
    }

    static all(order = null) {
        let notes = Note.allArray();

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

        if (order == "timestamps-asc") {
            notesObjects.sort((a, b) => {
                return a.timestamps - b.timestamps;
            });
        } else if (order == "timestamps-desc") {
            notesObjects.sort((a, b) => {
                return b.timestamps - a.timestamps;
            });
        } else if (order == "created-asc") {
            notesObjects.reverse();
        } else if (order == "title-asc") {
            notesObjects.sort((a, b) => {
                const titleA = a.title.toUpperCase();
                const titleB = b.title.toUpperCase();
                if (titleA < titleB) {
                    return -1;
                }
                if (titleA > titleB) {
                    return 1;
                }
                return 0;
            });
        } else if (order == "title-desc") {
            notesObjects.sort((a, b) => {
                const titleA = a.title.toUpperCase();
                const titleB = b.title.toUpperCase();
                if (titleA > titleB) {
                    return -1;
                }
                if (titleA < titleB) {
                    return 1;
                }
                return 0;
            });
        }

        return notesObjects;
    }

    save() {
        let notes = Note.allArray();

        if (notes[this.id]) {
            let editedItem = {
                title: this.title,
                body: this.body,
                timestamps: new Date(),
            };

            notes[this.id] = editedItem;

            Note.saveArray(notes);

            console.log("Note " + this.id + " updated.");
        } else {
            let newItem = {
                title: this.title,
                body: this.body,
                timestamps: new Date(),
            };

            notes.push(newItem);

            Note.saveArray(notes);

            console.log("Note created");
        }
    }

    destroy() {
        let notes = Note.allArray();

        notes.splice(this.id, 1);

        Note.saveArray(notes);

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

        let notes = Note.allArray();

        notes[noteId] = editedItem;

        Note.saveArray(notes);

        console.log("Note " + noteId + " updated.");
    }

    static destroy(noteId) {
        let notes = Note.allArray();

        notes.splice(noteId, 1);

        Note.saveArray(notes);

        Note.displayData();
        console.log("Note " + noteId + " deleted.");
        showEditNote(false);
        showViewNote(false);
    }

    static displayData() {
        while (list.firstChild) {
            list.removeChild(list.firstChild);
        }

        const sort = localStorage["sort"]
            ? localStorage["sort"]
            : "timestamps-desc";
        const notes = Note.all(sort);

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

function editItem(noteId) {
    const notes = Note.all();
    note = notes[noteId];

    showEditNote(true);

    titleInput.value = note.title;
    bodyInput.value = note.body;
    bodyInput.focus();
    autoResizeHeight();

    form2.setAttribute("data-note-id", note.id);

    trashClicker = new Clicker(
        document.querySelectorAll(".icon-tabler-trash")[1],
        Note.destroy,
        Number(form2.attributes["data-note-id"].value)
    );
    trashClicker.createClick();

    form2.onsubmit = function (e) {
        e.preventDefault();
        Note.updateNote(noteId, titleInput.value, bodyInput.value);
        showEditNote(false);
    };

    bodyInput.oninput = function () {
        Note.updateNote(noteId, titleInput.value, bodyInput.value);
    };

    titleInput.oninput = function () {
        Note.updateNote(noteId, titleInput.value, bodyInput.value);
    };
}

function updateViewNote() {
    console.log("dasdasd");
    document.querySelector("#view-title").innerText = titleInput.value;
    document.querySelector("#view-body").innerHTML = md.render(bodyInput.value);
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
        console.log("Checking password with hash...");
        bcrypt.compare(
            passwordFormInput.value,
            localStorage["password"],
            function (err, res) {
                if (res == true) {
                    console.log("Password is correct");
                    if (localStorage["remember"] != "false") {
                        sessionStorage["password"] = passwordFormInput.value;
                    }
                    password = passwordFormInput.value;
                    passwordForm.classList.remove("show");
                    Note.initialize();
                    Note.displayData();
                } else {
                    console.log("Password is incorrect");
                    // deny();
                }
            }
        );
    };
}

function setPassword() {
    passwordForm2.classList.add("show");
    passwordForm2.onsubmit = function (e) {
        e.preventDefault();
        if (!passwordForm2Checkbox.checked) {
            e.preventDefault();
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(passwordForm2Input.value, salt);
            localStorage["password"] = hash;
            if (passwordForm2Checkbox2.checked) {
                sessionStorage["password"] = passwordForm2Input.value;
            } else {
                localStorage["remember"] = false;
            }
            password = passwordForm2Input.value;
        } else {
            localStorage["encryption"] = false;
        }
        Note.initialize();
        Note.displayData();
        passwordForm2.classList.remove("show");
    };
}

// function download(data, filename, type) {
//     var file = new Blob([data], {type: type});
//     if (window.navigator.msSaveOrOpenBlob) // IE10+
//         window.navigator.msSaveOrOpenBlob(file, filename);
//     else { // Others
//         var a = document.createElement("a"),
//                 url = URL.createObjectURL(file);
//         a.href = url;
//         a.download = filename;
//         document.body.appendChild(a);
//         a.click();
//         setTimeout(function() {
//             document.body.removeChild(a);
//             window.URL.revokeObjectURL(url);
//         }, 0);
//     }
// }

// download(Note.all()[0].body, Note.all()[0].title, "text/markdown")
