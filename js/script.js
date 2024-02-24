const books = [];
const RENDER_EVENT = "render-bookshelf";

document.addEventListener("DOMContentLoaded", function () {
  if (isStorageExist()) {
    loadDataFromStorage();
  }

  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBookshelf();
  });
});

function addBookshelf() {
  const title = document.getElementById("bookTitle").value;
  const author = document.getElementById("bookAuthor").value;
  const year = parseInt(document.getElementById("bookYear").value);
  const isComplete = document.getElementById("bookIsComplete").checked;

  const generatedID = generateId();
  const bookshelfObject = generateBookshelfObject(
    generatedID,
    title,
    author,
    year,
    isComplete
  );

  books.push(bookshelfObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookshelfObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));

  const uncompletedRead = document.getElementById("uncompletedRead");
  uncompletedRead.innerHTML = "";

  const completedRead = document.getElementById("completedRead");
  completedRead.innerHTML = "";

  for (const bookshelfItem of books) {
    const bookshelfElemen = makeBookshelf(bookshelfItem);
    if (!bookshelfItem.isComplete) uncompletedRead.append(bookshelfElemen);
    else completedRead.append(bookshelfElemen);
  }
});

function makeBookshelf(bookshelfObject) {
  const title = document.createElement("h3");
  title.innerText = bookshelfObject.title;

  const author = document.createElement("p");
  author.innerText = "Author : " + bookshelfObject.author;

  const year = document.createElement("p");
  year.innerText = "Year : " + bookshelfObject.year;

  const textContainer = document.createElement("div");
  textContainer.append(title, author, year);

  const container = document.createElement("div");
  container.classList.add("box");
  container.classList.add("button");

  container.append(textContainer);
  container.setAttribute("id", `bookshelft-${bookshelfObject.id}`);

  if (bookshelfObject.isComplete) {
    const undoBtn = document.createElement("button");
    undoBtn.classList.add("undo-button");

    undoBtn.addEventListener("click", function () {
      undoTaskBooks(bookshelfObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("delete-button");

    trashButton.addEventListener("click", function () {
      removeTaskBooks(bookshelfObject.id);
    });

    container.append(undoBtn, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("completed-button");

    checkButton.addEventListener("click", function () {
      addTaskToCompleted(bookshelfObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("delete-button");

    trashButton.addEventListener("click", function () {
      removeTaskBooks(bookshelfObject.id);
    });

    container.append(checkButton, trashButton);
  }

  return container;
}

function addTaskToCompleted(bookshelfID) {
  const bookshelfTarget = findBooks(bookshelfID);

  if (bookshelfTarget == null) return;

  bookshelfTarget.isComplete = true;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeTaskBooks(bookshelfID) {
  const bookshelfTarget = deleteBook(bookshelfID);

  if (bookshelfTarget === -1) return;

  const modal = new bootstrap.Modal(
    document.getElementById("confirmationModal")
  );
  modal.show();

  const confirmButton = document.getElementById("confirmDeleteButton");
  confirmButton.addEventListener("click", function () {
    books.splice(bookshelfTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    modal.hide();
  });
}

function undoTaskBooks(bookshelfID) {
  const bookshelfTarget = findBooks(bookshelfID);

  if (bookshelfTarget == null) return;

  bookshelfTarget.isComplete = false;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function deleteBook(bookshelfID) {
  for (const index in books) {
    if (books[index].id === bookshelfID) {
      return index;
    }
  }
  return -1;
}

function findBooks(bookshelfId) {
  for (const bookshelfItem of books) {
    if (bookshelfItem.id === bookshelfId) {
      return bookshelfItem;
    }
  }
  return null;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const SAVED_EVENT = "saved-bookshelf";
const STORAGE_KEY = "BOOKSHELF_APPS";

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.getElementById("searchSubmit").addEventListener("click", function (e) {
  e.preventDefault();

  const searchBooks = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();
  const books = document.querySelectorAll("h3");

  for (data of books) {
    if (data.innerText.toLowerCase().includes(searchBooks)) {
      data.parentElement.parentElement.style.display = "inlineblock";
    } else {
      data.parentElement.parentElement.style.display = "none";
    }
  }
});
