// Create needed constants
const list = document.querySelector("#list"),
    titleInput = document.querySelector("#title"),
    bodyInput = document.querySelector("#body"),
    form = document.querySelector("form"),
    submitBtn = document.querySelector("form button"),
    edit = document.querySelector(".icon-tabler-edit"),
    newNote = document.querySelector(".new-note"),
    editNote = document.querySelector(".edit-note"),
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

xClicker = new Clicker(
    document.querySelector(".icon-tabler-x"),
    showNewNote,
    false
);
xClicker.createClick();

function showNewNote(add) {
    if (add) {
        newNote.classList.add("show-new-note");
    } else {
        newNote.classList.remove("show-new-note");
        document.querySelector("#title").innerText = "";
        document.querySelector("#body").innerHTML = "";
    }
}

x2Clicker = new Clicker(
    document.querySelector(".icon-tabler-x2"),
    showEditNote,
    false
);
x2Clicker.createClick();

function showEditNote(add) {
    if (add) {
        editNote.classList.add("show-edit-note");
    } else {
        editNote.classList.remove("show-edit-note");
        document.querySelector("#title2").value = "";
        document.querySelector("#body2").value = "";
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
    // Open our database; it is created if it doesn't already exist
    // (see onupgradeneeded below)
    let request = window.indexedDB.open("notes_db", 1);

    // onerror handler signifies that the database didn't open successfully
    request.onerror = function () {
        console.log("Database failed to open");
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
            const para = document.createElement("p");
            listItem.appendChild(h3);
            listItem.appendChild(para);
            list.appendChild(listItem);

            listItemClicker = new Clicker(listItem, editItem, "event");
            listItemClicker.createClick();

            // Put the data from the cursor inside the h3 and para
            h3.textContent = cursor.value.title;
            para.innerHTML = md.render(cursor.value.body);

            // Store the ID of the data item inside an attribute on the listItem, so we know
            // which item it corresponds to. This will be useful later when we want to delete items
            listItem.setAttribute("data-note-id", cursor.value.id);

            // Create a button and place it inside each listItem
            const deleteBtn = document.createElement("button");
            listItem.appendChild(deleteBtn);
            deleteBtn.textContent = "Delete";

            // Set an event handler so that when the button is clicked, the destroy()
            // function is run
            deleteBtn.onclick = function () {
                destroy(note.id);
            };

            // Iterate to the next item in the cursor
            cursor.continue();
        } else {
            // Again, if list item is empty, display a 'No notes stored' message
            if (!list.firstChild) {
                const listItem = document.createElement("li");
                listItem.textContent = "No notes stored.";
                list.appendChild(listItem);
            }
            // if there are no more cursor items to iterate through, say so
            console.log("Notes all displayed");
        }
    };
}

function create(newItem) {
    // open a read/write db transaction, ready for adding the data
    console.log(db);
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

function destroy(noteId) {
    // open a database transaction and delete the task, finding it using the id we retrieved above
    let transaction = db.transaction(["notes_os"], "readwrite");
    let objectStore = transaction.objectStore("notes_os");
    let request = objectStore.delete(noteId);

    // report that the data item has been deleted
    transaction.oncomplete = function () {
        // delete the parent of the button
        // which is the list item, so it is no longer displayed
        e.target.parentNode.parentNode.removeChild(e.target.parentNode);
        console.log("Note " + noteId + " deleted.");

        // Again, if list item is empty, display a 'No notes stored' message
        if (!list.firstChild) {
            const listItem = document.createElement("li");
            listItem.textContent = "No notes stored.";
            list.appendChild(listItem);
        }
    };
}

function update(noteId, title, body) {
    // grab the values entered into the form fields and store them in an object ready for being inserted into the DB
    let editedItem = {
        title: title,
        body: body,
        id: noteId,
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

function addItem(e) {
    e.preventDefault;
    create({ title: titleInput.value, body: bodyInput.value });
}

function editItem(e) {
    let noteId = Number(e.target.parentNode.getAttribute("data-note-id"));

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

window.onload = function () {
    start();
};
