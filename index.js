// Create needed constants
const list = document.querySelector("#list"),
    titleInput = document.querySelector("#title"),
    bodyInput = document.querySelector("#body"),
    form = document.querySelector("form"),
    submitBtn = document.querySelector("form button"),
    edit = document.querySelector(".icon-tabler-edit"),
    newNote = document.querySelector(".new-note"),
    editNote = document.querySelector(".edit-note"),
    viewNote = document.querySelector(".view-note"),
    form2 = document.querySelector(".edit-note-form"),
    md = new Remarkable();

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

let db;
function start() {
    if (!("indexedDB" in window)) {
        console.log("This browser doesn't support IndexedDB");
        return;
    }
    // Open our database; it is created if it doesn't already exist
    // (see onupgradeneeded below)
    let request = window.indexedDB.open("notes_db", 2);

    // onerror handler signifies that the database didn't open successfully
    request.onerror = function (e) {
        console.log("Database failed to open due to:");
        console.log(e);
    };

    // onsuccess handler signifies that the database opened successfully
    request.onsuccess = function () {
        console.log("Database opened succesfully");

        // Store the opened database object in the db variable. This is used a lot below
        db = request.result;

        // Run the displayData() function to display the notes already in the IDB
        displayData();
    };

    // Setup the database tables if this has not already been done
    request.onupgradeneeded = function (e) {
        // Grab a reference to the opened database
        let db = e.target.result;

        if (e.oldVersion < 1) {
            // Create an objectStore to store our notes in (basically like a single table)
            // including a auto-incrementing key
            let objectStore = db.createObjectStore("notes_os", {
                keyPath: "id",
                autoIncrement: true,
            });

            // Define what data items the objectStore will contain
            objectStore.createIndex("title", "title", { unique: false });
            objectStore.createIndex("body", "body", { unique: false });

            console.log("Database setup complete");
        }

        if (e.oldVersion < 2) {
            console.log(db);
            let objectStore = e.currentTarget.transaction.objectStore(
                "notes_os"
            );
            objectStore.createIndex("timestamps", "timestamps", {
                unique: false,
            });
        }
    };
}

function displayData() {
    // Here we empty the contents of the list element each time the display is updated
    // If you ddn't do this, you'd get duplicates listed each time a new note is added
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
    // Open our object store and then get a cursor - which iterates through all the
    // different data items in the store
    let objectStore = db.transaction("notes_os").objectStore("notes_os");
    objectStore.openCursor().onsuccess = function (e) {
        // Get a reference to the cursor
        let cursor = e.target.result;

        // If there is still another data item to iterate through, keep running this code
        if (cursor) {
            // Create a list item, h3, and p to put each data item inside when displaying it
            // structure the HTML fragment, and append it inside the list
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

            listItemClicker = new Clicker(listItem, viewItem, "event");
            listItemClicker.createClick();

            // Put the data from the cursor inside the h3 and para
            h3.textContent = cursor.value.title;
            para.textContent =
                cursor.value.body.length > 70
                    ? cursor.value.body.substr(0, 70) + "..."
                    : cursor.value.body;

            // Store the ID of the data item inside an attribute on the listItem, so we know
            // which item it corresponds to. This will be useful later when we want to delete items
            listItem.setAttribute("data-note-id", cursor.value.id);

            let timestamps = cursor.value.timestamps;
            let minutes =
                timestamps.getMinutes() < 10
                    ? "0" + timestamps.getMinutes()
                    : timestamps.getMinutes();
            para2.innerText =
                timestamps.getDate() == new Date().getDate()
                    ? timestamps.getHours() + ":" + minutes
                    : timestamps.getDate() + "/" + timestamps.getMonth();
            para2.classList.add("timestamps");

            // Iterate to the next item in the cursor
            cursor.continue();
        } else {
            // Again, if list item is empty, display a 'No notes stored' message
            if (!list.firstChild) {
                const listItem = document.createElement("div");
                listItem.textContent = "No notes stored.";
                list.appendChild(listItem);
            }
            // if there are no more cursor items to iterate through, say so
            console.log("Notes all displayed");
        }
    };
}

function create(title, body) {
    let newItem = { title: title, body: body, timestamps: new Date() };

    // open a read/write db transaction, ready for adding the data
    let transaction = db.transaction(["notes_os"], "readwrite");

    // call an object store that's already been added to the database
    let objectStore = transaction.objectStore("notes_os");

    // Make a request to add our newItem object to the object store
    var request = objectStore.add(newItem);
    request.onsuccess = function () {
        // Clear the form, ready for adding the next entry
        titleInput.value = "";
        bodyInput.value = "";
    };

    // Report on the success of the transaction completing, when everything is done
    transaction.oncomplete = function () {
        console.log("Transaction completed: database modification finished.");

        // update the display of data to show the newly added item, by running displayData() again.
        displayData();
        stopShowNewNote();
    };

    transaction.onerror = function () {
        console.log("Transaction not opened due to error");
    };

    return request, transaction;
}

function update(noteId, title, body) {
    // grab the values entered into the form fields and store them in an object ready for being inserted into the DB
    let editedItem = {
        title: title,
        body: body,
        id: noteId,
        timestamps: new Date(),
    };

    // open a read/write db transaction, ready for adding the data
    let transaction = db.transaction(["notes_os"], "readwrite");

    // call an object store that's already been added to the database
    let objectStore = transaction.objectStore("notes_os");

    // Make a request to add our newItem object to the object store
    var request = objectStore.put(editedItem);

    // Report on the success of the transaction completing, when everything is done
    transaction.oncomplete = function () {
        console.log("Transaction completed: database modification finished.");

        // update the display of data to show the newly added item, by running displayData() again.
        displayData();
        showEditNote(false);

        document.querySelector("#title2").innerText = "";
        document.querySelector("#body2").innerHTML = "";
    };

    transaction.onerror = function () {
        console.log("Transaction not opened due to error");
    };
}

function destroy(noteId) {
    // open a database transaction and delete the task, finding it using the id we retrieved above
    let transaction = db.transaction(["notes_os"], "readwrite");
    let objectStore = transaction.objectStore("notes_os");
    let request = objectStore.delete(noteId);

    // report that the data item has been deleted
    transaction.oncomplete = function () {
        // delete the parent of the button
        // which is the list item, so it is no longer displaye
        displayData();
        console.log("Note " + noteId + " deleted.");
        showEditNote(false);
        showViewNote(false);
    };
}

function addItem(e) {
    e.preventDefault;
    create(titleInput.value, bodyInput.value);
}

function editItem(noteId) {
    let objectStore = db.transaction("notes_os").objectStore("notes_os");
    objectStore.openCursor().onsuccess = function (e2) {
        // Get a reference to the cursor
        let cursor = e2.target.result;

        // If there is still another data item to iterate through, keep running this code
        if (cursor) {
            if (cursor.value.id == noteId) {
                showEditNote(true);

                document.querySelector("#title2").value = cursor.value.title;
                document.querySelector("#body2").value = cursor.value.body;
                document.querySelector("#body2").focus();
                autoResizeHeight2();

                form2.setAttribute("data-note-id", cursor.value.id);

                trashClicker = new Clicker(
                    document.querySelectorAll(".icon-tabler-trash")[1],
                    destroy,
                    Number(form2.attributes["data-note-id"].value)
                );
                trashClicker.createClick();

                form2.onsubmit = function () {
                    update(
                        noteId,
                        document.querySelector("#title2").value,
                        document.querySelector("#body2").value
                    );
                };
            } else {
                cursor.continue();
            }
        }
    };
}

function viewItem(e) {
    let noteId = Number(e.target.parentNode.getAttribute("data-note-id"));

    let objectStore = db.transaction("notes_os").objectStore("notes_os");
    objectStore.openCursor().onsuccess = function (e2) {
        // Get a reference to the cursor
        let cursor = e2.target.result;

        // If there is still another data item to iterate through, keep running this code
        if (cursor) {
            if (cursor.value.id == noteId) {
                showViewNote(true);

                document.querySelector("#view-title").innerText =
                    cursor.value.title;
                document.querySelector("#view-body").innerHTML = md.render(
                    cursor.value.body
                );
                document
                    .querySelector(".view-note-form")
                    .setAttribute("data-note-id", cursor.value.id);

                editClicker = new Clicker(
                    document.querySelector(".icon-tabler-pencil"),
                    editItem,
                    Number(
                        document.querySelector(".view-note-form").attributes[
                            "data-note-id"
                        ].value
                    )
                );
                editClicker.createClick();

                trashClicker = new Clicker(
                    document.querySelectorAll(".icon-tabler-trash")[0],
                    destroy,
                    Number(
                        document.querySelector(".view-note-form").attributes[
                            "data-note-id"
                        ].value
                    )
                );
                trashClicker.createClick();

                document.querySelectorAll("table").forEach((table) => {
                    let div = document.createElement("div");
                    div.classList.add("table");

                    table.parentNode.insertBefore(div, table);

                    div.style.width = table.scrollWidth + 'px';
                    div.appendChild(table);
                });
            } else {
                cursor.continue();
            }
        }
    };
}

window.onload = function () {
    start();
};

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
}
