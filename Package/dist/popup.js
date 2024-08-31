// Page
const pageSearch = document.getElementsByClassName("page-S");
const pageFavorite = document.getElementsByClassName("page-F");
const pageDelete = document.getElementsByClassName("page-D");
const pageGemini = document.getElementsByClassName("page-G");

// Context
const searchInput = document.getElementById("searchInput");
const apiInput = document.getElementById("apiInput");
const subtitleElement = document.getElementById("subtitle");
const emptyMessage = document.getElementById("emptyMessage");
const favoriteEmptyMessage = document.getElementById("favoriteEmptyMessage");
const geminiEmptyMessage = document.getElementById("geminiEmptyMessage");
const apiModalLabel = document.getElementById("apiModalLabel");

// Lists
const searchHistoryListContainer = document.getElementById("searchHistoryList");
const favoriteListContainer = document.getElementById("favoriteList");
const summaryListContainer = document.getElementById("summaryList");
const searchHistoryUl = searchHistoryListContainer.getElementsByTagName("ul");
const favoriteUl = favoriteListContainer.getElementsByTagName("ul");

// Page Buttons
const searchHistoryButton = document.getElementById("searchHistoryButton");
const favoriteListButton = document.getElementById("favoriteListButton");
const deleteListButton = document.getElementById("deleteListButton");
const geminiSummaryButton = document.getElementById("geminiSummaryButton");

// Buttons
const searchButtonGroup = document.getElementById("searchButtonGroup");
const deleteButtonGroup = document.getElementById("deleteButtonGroup");
const exportButtonGroup = document.getElementById("exportButtonGroup");
const geminiButtonGroup = document.getElementById("geminiButtonGroup");
const clearButton = document.getElementById("clearButton");
const cancelButton = document.getElementById("cancelButton");
const deleteButton = document.getElementById("deleteButton");
const exportButton = document.getElementById("exportButton");
const importButton = document.getElementById("importButton");
const fileInput = document.getElementById("fileInput");
const apiButton = document.getElementById("apiButton");
const sendButton = document.getElementById("sendButton");
const enterButton = document.getElementById("enterButton");
const clearButtonSummary = document.getElementById("clearButtonSummary");
const premiumModal = document.getElementById("premiumModalLabel");
const closeButton = premiumModal.parentElement.querySelector(".btn-close");

// ExtensionPay
const paymentButton = document.getElementById("paymentButton");
const restoreButton = document.getElementById("restoreButton");
const shortcutTip = document.getElementsByClassName("premium-only");

// Spans
const clearButtonSpan = document.querySelector("#clearButton > i + span");
const cancelButtonSpan = document.querySelector("#cancelButton > span");
const deleteButtonSpan = document.querySelector("#deleteButton > i + span");
const mapsButtonSpan = document.getElementById("mapsButtonSpan");
const clearButtonSummarySpan = document.querySelector("#clearButtonSummary > i + span");
const sendButtonSpan = document.querySelector("#sendButton > i + span");
const paymentSpan = document.querySelector("#paymentButton > span");

let [hasHistory, hasFavorite, hasSummary, hasInit] = [false, false, false, false];

setTimeout(popupLayout, 0);
setTimeout(fetchData, 0);
setTimeout(checkPay, 0);

// Input caret
document.addEventListener("DOMContentLoaded", function () {
  searchInput.focus();
  apiInput.focus();
});

// Update the popup layout
function popupLayout() {
  for (let i = 0; i < pageSearch.length; i++) pageSearch[i].classList.remove("d-none");
  for (let i = 0; i < pageFavorite.length; i++) pageFavorite[i].classList.add("d-none");
  for (let i = 0; i < pageDelete.length; i++) pageDelete[i].classList.add("d-none");
  for (let i = 0; i < pageGemini.length; i++) pageGemini[i].classList.add("d-none");

  checkTextOverflow();
};

// Fetch the search history list
function fetchData() {
  searchHistoryListContainer.innerHTML = "";

  chrome.storage.local.get(
    ["searchHistoryList", "favoriteList", "geminiApiKey"],
    ({ searchHistoryList, favoriteList, geminiApiKey }) => {

      // Retrieve searchHistoryList and favoriteList from Chrome storage
      if (searchHistoryList && searchHistoryList.length > 0) {
        emptyMessage.style.display = "none";
        hasHistory = true;

        const ul = document.createElement("ul");
        ul.className = "list-group d-flex flex-column-reverse";

        // Create list item
        const fragment = document.createDocumentFragment();
        searchHistoryList.forEach((itemName) => {
          const li = document.createElement("li");
          li.className =
            "list-group-item border rounded mb-3 px-3 history-list d-flex justify-content-between align-items-center";

          const span = document.createElement("span");
          span.textContent = itemName;
          li.appendChild(span);

          const icon = createFavoriteIcon(itemName, favoriteList);
          li.appendChild(icon);

          const checkbox = document.createElement("input");
          checkbox.className = "form-check-input d-none";
          checkbox.type = "checkbox";
          checkbox.value = "delete";
          checkbox.name = "checkDelete";
          checkbox.ariaLabel = "Delete";
          checkbox.style.cursor = "pointer";
          li.appendChild(checkbox);
          fragment.appendChild(li);
        });
        ul.appendChild(fragment);
        searchHistoryListContainer.appendChild(ul);

        const lastListItem = searchHistoryListContainer.querySelector(".list-group .list-group-item:first-child");
        if (lastListItem) {
          lastListItem.classList.remove("mb-3");
        }
      } else {
        emptyMessage.style.display = "block";
        hasHistory = false;
        clearButton.disabled = true;
      }

      attachCheckboxEventListener(searchHistoryListContainer);

      if (hasInit) {
        measureContentSizeLast();
      } else {
        retryMeasureContentSize();
      }

      fetchAPIKey(geminiApiKey);
    }
  );
}

// Create favorite action icon
function createFavoriteIcon(itemName, favoriteList) {
  const favoriteIcon = document.createElement("i");
  favoriteIcon.className =
    favoriteList && favoriteList.includes(itemName)
      ? "bi bi-patch-check-fill matched"
      : "bi bi-patch-plus-fill";
  favoriteIcon.title = chrome.i18n.getMessage("plusLabel");
  return favoriteIcon;
}

// Check if the API key is defined and valid
function fetchAPIKey(apiKey) {
  apiModalLabel.innerHTML = chrome.i18n.getMessage("apiTitleFalse");
  if (apiKey) {
    verifyApiKey(apiKey).then(isValid => {
      if (!isValid) {
        sendButton.disabled = true;
        geminiEmptyMessage.innerText = chrome.i18n.getMessage("geminiFirstMsg");
      } else {
        apiModalLabel.innerHTML = chrome.i18n.getMessage("apiTitleTrue");
      }
    });
  } else {
    sendButton.disabled = true;
    geminiEmptyMessage.innerText = chrome.i18n.getMessage("geminiFirstMsg");
    return;
  }
}

// Check if the text overflows the button since locale
function checkTextOverflow() {
  const mapsButtonHeight = mapsButtonSpan.offsetHeight;
  const clearButtonHeight = clearButtonSpan.offsetHeight;
  const deleteButtonHeight = deleteButtonSpan.offsetHeight;
  const cancelButtonHeight = cancelButtonSpan.offsetHeight;
  const sendButtonHeight = sendButtonSpan.offsetHeight;
  const clearButtonSummaryHeight = clearButtonSummarySpan.offsetHeight;

  if (clearButtonHeight > mapsButtonHeight) {
    clearButton.classList.remove("w-25");
    clearButton.classList.add("w-auto");
  }
  if (cancelButtonHeight > deleteButtonHeight) {
    cancelButton.classList.remove("w-25");
    cancelButton.classList.add("w-auto");
  }
  if (clearButtonSummaryHeight > sendButtonHeight) {
    clearButtonSummary.classList.remove("w-25");
    clearButtonSummary.classList.add("w-auto");
  }
}

// Add event listeners to the checkboxes
function attachCheckboxEventListener(container) {
  const checkboxes = container.querySelectorAll("input");
  const liElements = container.querySelectorAll("li");

  checkboxes.forEach((checkbox, index) => {
    checkbox.addEventListener("click", function () {
      const li = liElements[index];

      if (checkbox.checked) {
        li.classList.add("checked-list");
      } else {
        li.classList.remove("checked-list");
      }

      updateDeleteCount();
    });
  });
}

// Track events on the search bar
searchInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    if (searchInput.value.trim() === "") {
      // If it contains only blanks, prevent the default behavior of the event and do not allow submission
      event.preventDefault();
    } else {
      chrome.runtime.sendMessage({
        searchTerm: searchInput.value,
        action: "searchInput",
      });
    }
  }
});

searchInput.addEventListener("input", function () {
  if (searchInput.value.trim() === "") {
    enterButton.classList.add("d-none");
  } else {
    enterButton.classList.remove("d-none");
  }
});

enterButton.addEventListener("click", function () {
  if (searchInput.value.trim() === "") {
    return;
  } else {
    chrome.runtime.sendMessage({
      searchTerm: searchInput.value,
      action: "searchInput",
    });
  }
});

searchHistoryButton.addEventListener("click", function () {
  for (let i = 0; i < pageSearch.length; i++) pageSearch[i].classList.remove("d-none");
  for (let i = 0; i < pageFavorite.length; i++) pageFavorite[i].classList.add("d-none");
  for (let i = 0; i < pageDelete.length; i++) pageDelete[i].classList.add("d-none");
  for (let i = 0; i < pageGemini.length; i++) pageGemini[i].classList.add("d-none");

  searchHistoryButton.classList.add("active-button");
  favoriteListButton.classList.remove("active-button");
  deleteListButton.classList.remove("active-button");
  geminiSummaryButton.classList.remove("active-button");

  subtitleElement.textContent = chrome.i18n.getMessage("searchHistorySubtitle");
  if (!hasHistory) {
    emptyMessage.style.display = "block";
    clearButton.disabled = true;
  } else {
    emptyMessage.style.display = "none";
    clearButton.disabled = false;
  }

  deleteListButton.disabled = false;

  measureContentSize();
  updateInput();
});

favoriteListButton.addEventListener("click", function () {
  chrome.storage.local.get("favoriteList", ({ favoriteList }) => {
    updateFavorite(favoriteList);
  });

  for (let i = 0; i < pageSearch.length; i++) pageSearch[i].classList.add("d-none");
  for (let i = 0; i < pageFavorite.length; i++) pageFavorite[i].classList.remove("d-none");
  for (let i = 0; i < pageDelete.length; i++) pageDelete[i].classList.add("d-none");
  for (let i = 0; i < pageGemini.length; i++) pageGemini[i].classList.add("d-none");

  favoriteListButton.classList.add("active-button");
  searchHistoryButton.classList.remove("active-button");
  deleteListButton.classList.remove("active-button");
  geminiSummaryButton.classList.remove("active-button");

  subtitleElement.textContent = chrome.i18n.getMessage("favoriteListSubtitle");
  if (!hasFavorite) {
    favoriteEmptyMessage.style.display = "block";
  } else {
    favoriteEmptyMessage.style.display = "none";
  }

  deleteListButton.disabled = false;

  updateInput();
});

deleteListButton.addEventListener("click", function () {
  const historyLiElements = searchHistoryListContainer.querySelectorAll("li");
  const favoriteLiElements = favoriteListContainer.querySelectorAll("li");

  if (deleteListButton.classList.contains("active-button")) {
    backToNormal();
  } else {
    deleteListButton.classList.add("active-button");
    deleteListButton.style.pointerEvents = "auto";

    searchButtonGroup.classList.add("d-none");
    exportButtonGroup.classList.add("d-none");
    deleteButtonGroup.classList.remove("d-none");

    checkTextOverflow();

    historyLiElements.forEach((li) => {
      const checkbox = li.querySelector("input");
      const favoriteIcon = li.querySelector("i");

      checkbox.classList.remove("d-none");
      favoriteIcon.classList.add("d-none");

      li.classList.add("delete-list");
      li.classList.remove("history-list");
    });

    favoriteLiElements.forEach((li) => {
      const checkbox = li.querySelector("input");
      const favoriteIcon = li.querySelector("i");

      checkbox.classList.remove("d-none");
      favoriteIcon.classList.add("d-none");

      li.classList.add("delete-list");
      li.classList.remove("favorite-list");
    });

    if (searchHistoryButton.classList.contains("active-button")) {
      favoriteListButton.disabled = true;
      geminiSummaryButton.disabled = true;
      updateDeleteCount();
    } else {
      searchHistoryButton.disabled = true;
      geminiSummaryButton.disabled = true;
      updateDeleteCount();
    }
  }
});

geminiSummaryButton.addEventListener("click", function () {
  for (let i = 0; i < pageSearch.length; i++) pageSearch[i].classList.add("d-none");
  for (let i = 0; i < pageFavorite.length; i++) pageFavorite[i].classList.add("d-none");
  for (let i = 0; i < pageDelete.length; i++) pageDelete[i].classList.add("d-none");
  for (let i = 0; i < pageGemini.length; i++) pageGemini[i].classList.remove("d-none");

  searchHistoryButton.classList.remove("active-button");
  favoriteListButton.classList.remove("active-button");
  geminiSummaryButton.classList.add("active-button");
  deleteListButton.disabled = true;

  subtitleElement.textContent = chrome.i18n.getMessage("geminiSummarySubtitle");

  // Clear summary data if it's older than 1 hour
  chrome.storage.local.get(["summaryList", "timestamp", "favoriteList"], function (result) {
    if (result.timestamp && result.summaryList.length > 0) {
      const currentTime = Date.now();
      const elapsedTime = (currentTime - result.timestamp) / 1000; // time in seconds
      if (elapsedTime > 86400) {
        geminiEmptyMessage.innerText = chrome.i18n.getMessage("geminiEmptyMsg");
        summaryListContainer.innerHTML = "";
        chrome.storage.local.remove(["summaryList", "timestamp"]);
      } else {
        if (result.summaryList) {
          hasSummary = true;
          geminiEmptyMessage.classList.add("d-none");
          summaryListContainer.innerHTML = constructSummaryHTML(result.summaryList, result.favoriteList);
          clearButtonSummary.classList.remove("d-none");
          apiButton.classList.add("d-none");
          clearButtonSummary.disabled = false;
          checkTextOverflow();
          measureContentSize();
        }
      }
    } else {
      checkTextOverflow();
      measureContentSize();
    }
  });
});

function constructSummaryHTML(summaryList, favoriteList) {
  let html = '<ul class="list-group d-flex">';

  summaryList.forEach((item, index) => {
    const isLastItem = index === summaryList.length - 1;
    const mbClass = isLastItem ? "" : "mb-3";

    const trimmedFavorite = favoriteList.map(item => item.split(" ")[0]);
    const icon = createFavoriteIcon(item.name, trimmedFavorite);
    const iconHTML = icon.outerHTML;

    html += `
      <li class="list-group-item border rounded px-3 summary-list d-flex justify-content-between align-items-center ${mbClass}">
        <span>${item.name}</span>
        <span class="d-none">${item.clue}</span>
        ${iconHTML}
      </li>
    `;
  });

  html += "</ul>";
  return html;
}

exportButton.addEventListener("click", function () {
  chrome.storage.local.get(["favoriteList"], ({ favoriteList }) => {
    const trimmedFavorite = favoriteList.map(item => item.split(" ")[0]);
    const csv = "name\n" + trimmedFavorite.map(item => `${item},`).join("\n");;

    const blob = new Blob([csv], {
      type: "text/csv; charset=utf-8;",
    });

    // Create a temporary anchor element and trigger the download
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "TheMapsExpress_FavoriteList.csv";
    a.click();
  });
});

// Allow the user to select a file from their device
importButton.addEventListener("click", function () {
  fileInput.click();
});

fileInput.addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      let importedData = [];
      const fileContent = event.target.result;

      if (fileContent && fileContent.length > 0) {
        // Parse CSV content
        const rows = fileContent.split("\n").map(row => row.trim()).filter(row => row.length > 0);
        importedData = rows.slice(1).map(row => row.replace(/,$/, ""));
        favoriteEmptyMessage.style.display = "none";
      } else {
        favoriteEmptyMessage.style.display = "block";
      }

      chrome.storage.local.set({ favoriteList: importedData }, function () {
        updateFavorite(importedData);
        updateHistoryFavoriteIcons();
      });

    } catch (error) {
      favoriteEmptyMessage.style.display = "block";
      favoriteEmptyMessage.innerText = chrome.i18n.getMessage("importErrorMsg");
    }
  };

  reader.readAsText(file);

  // Reset the file input value to allow re-selecting the same file
  event.target.value = "";
});

// Update the favorite icons in the search history list
function updateHistoryFavoriteIcons() {
  chrome.storage.local.get(["favoriteList"], ({ favoriteList }) => {
    const historyItems = document.querySelectorAll(".history-list");
    historyItems.forEach(item => {
      const text = item.querySelector("span").textContent;
      const favoriteIcon = item.querySelector("i");
      if (favoriteList && !favoriteList.includes(text)) {
        favoriteIcon.className = "bi bi-patch-plus-fill";
      } else {
        favoriteIcon.className = "bi bi-patch-check-fill matched";
      }
    });
  });
}

cancelButton.addEventListener("click", backToNormal);

deleteButton.addEventListener("click", function () {
  if (searchHistoryButton.classList.contains("active-button")) {
    deleteFromHistoryList();
  } else {
    deleteFromFavoriteList();
  }
  backToNormal();
  measureContentSize();
});

// Track the click event on li elements
searchHistoryListContainer.addEventListener("mousedown", function (event) {
  let liElement;
  if (event.target.tagName === "LI") {
    liElement = event.target;
  } else if (event.target.parentElement.tagName === "LI") {
    liElement = event.target.parentElement;
  } else {
    return;
  }

  if (liElement.classList.contains("delete-list")) {
    if (event.target.classList.contains("form-check-input")) {
      return;
    } else {
      liElement.classList.toggle("checked-list");
      const checkbox = liElement.querySelector("input");
      checkbox.checked = !checkbox.checked;
      updateDeleteCount();
    }
  } else {
    const selectedText = liElement.textContent;
    const searchUrl = `https://www.google.com/maps?q=${encodeURIComponent(
      selectedText
    )}`;

    // Check if the clicked element has the "bi" class (favorite icon)
    if (event.target.classList.contains("bi")) {
      // Add the selected text to the favorite list
      addToFavoriteList(selectedText);
      event.target.className =
        "bi bi-patch-check-fill matched spring-animation";
      setTimeout(function () {
        event.target.classList.remove("spring-animation");
      }, 500);

      chrome.storage.local.get("favoriteList", ({ favoriteList }) => {
        updateFavorite(favoriteList);
      });
    } else if (event.target.classList.contains("form-check-input")) {
      return;
    } else {
      if (event.button === 1) { // Middle click
        event.preventDefault();
        chrome.runtime.sendMessage({ action: "openTab", url: searchUrl });
      } else if (event.button === 0) { // Left click
        window.open(searchUrl, "_blank");
      }
    }
  }
});

function addToFavoriteList(selectedText) {
  chrome.runtime.sendMessage({ action: "addToFavoriteList", selectedText });
  exportButton.disabled = false;
}

favoriteListContainer.addEventListener("mousedown", function (event) {
  let liElement;
  if (event.target.tagName === "LI") {
    liElement = event.target;
  } else if (event.target.parentElement.tagName === "LI") {
    liElement = event.target.parentElement;
  } else {
    return;
  }

  if (liElement.classList.contains("delete-list")) {
    if (event.target.classList.contains("form-check-input")) {
      return;
    } else {
      liElement.classList.toggle("checked-list");
      const checkbox = liElement.querySelector("input");
      checkbox.checked = !checkbox.checked;
      updateDeleteCount();
    }
  } else {
    const selectedText = liElement.textContent;
    const searchUrl = `https://www.google.com/maps?q=${encodeURIComponent(
      selectedText
    )}`;

    if (event.target.classList.contains("bi")) {
      return;
    } else if (event.target.classList.contains("form-check-input")) {
      return;
    } else {
      if (event.button === 1) { // Middle click
        event.preventDefault();
        chrome.runtime.sendMessage({ action: "openTab", url: searchUrl });
      } else if (event.button === 0) { // Left click
        window.open(searchUrl, "_blank");
      }
    }
  }
});

summaryListContainer.addEventListener("click", function (event) {
  let liElement;
  if (event.target.tagName === "LI") {
    liElement = event.target;
  } else if (event.target.parentElement.tagName === "LI") {
    liElement = event.target.parentElement;
  } else {
    return;
  }

  const selectedText = liElement.textContent;
  const searchUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    selectedText
  )}`;

  if (event.target.classList.contains("bi")) {
    const nameSpan = liElement.querySelector("span:first-child").textContent;
    const clueSpan = liElement.querySelector("span.d-none").textContent;
    addToFavoriteList(nameSpan + " @" + clueSpan);
    event.target.className =
      "bi bi-patch-check-fill matched spring-animation";
    setTimeout(function () {
      event.target.classList.remove("spring-animation");
    }, 500);

    chrome.storage.local.get("favoriteList", ({ favoriteList }) => {
      updateFavorite(favoriteList);
    });
  } else {
    // window.open(searchUrl, "_blank", "popup");
    chrome.runtime.sendMessage({ action: "openTab", url: searchUrl });
  }
});

// Track the click event on clear button
clearButton.addEventListener("click", () => {
  chrome.storage.local.set({ searchHistoryList: [] });

  clearButton.disabled = true;
  searchHistoryListContainer.innerHTML = "";

  emptyMessage.style.display = "block";
  emptyMessage.innerHTML = chrome.i18n.getMessage("clearedUpMsg").replace(/\n/g, "<br>");

  hasHistory = false;

  // Send a message to background.js to request clearing of selected text list data
  chrome.runtime.sendMessage({ action: "clearSearchHistoryList" });

  measureContentSize();
});

clearButtonSummary.addEventListener("click", () => {
  chrome.storage.local.remove(["summaryList", "timestamp"]);

  hasSummary = false;
  summaryListContainer.innerHTML = "";
  geminiEmptyMessage.innerText = chrome.i18n.getMessage("geminiEmptyMsg");
  clearButtonSummary.classList.add("d-none");
  geminiEmptyMessage.classList.remove("d-none");
  apiButton.classList.remove("d-none");

  measureContentSize();
});

// Track the storage change event
chrome.storage.onChanged.addListener((changes) => {
  const searchHistoryListChange = changes.searchHistoryList;
  const favoriteListChange = changes.favoriteList;

  if (favoriteListChange && favoriteListChange.newValue) {
    updateFavorite(favoriteListChange.newValue);
  }

  if (searchHistoryListChange && searchHistoryListChange.newValue) {
    const newList = searchHistoryListChange.newValue;
    const oldList = searchHistoryListChange.oldValue || [];

    if (newList.length >= oldList.length) {
      fetchData(hasInit);
    }
  }
});

// Update the favorite list container
function updateFavorite(favoriteList) {
  favoriteListContainer.innerHTML = "";

  if (favoriteList && favoriteList.length > 0) {
    favoriteEmptyMessage.style.display = "none";
    hasFavorite = true;

    const ul = document.createElement("ul");
    ul.className = "list-group d-flex flex-column-reverse";

    // Create list item from new selectedText
    const fragment = document.createDocumentFragment();
    favoriteList.forEach((selectedText) => {
      const li = document.createElement("li");
      li.className =
        "list-group-item border rounded mb-3 px-3 favorite-list d-flex justify-content-between align-items-center";

      const span = document.createElement("span");
      if (selectedText.includes(" @")) {
        const name = selectedText.split(" @")[0];
        const clue = selectedText.split(" @")[1];
        span.textContent = name;
        li.appendChild(span);

        const clueSpan = document.createElement("span");
        clueSpan.className = "d-none";
        clueSpan.textContent = clue;
        li.appendChild(clueSpan);
      } else {
        span.textContent = selectedText;
        li.appendChild(span);
      }

      const favoriteIcon = document.createElement("i");
      favoriteIcon.className = "bi bi-patch-check-fill matched";
      li.appendChild(favoriteIcon);

      const checkbox = document.createElement("input");
      checkbox.className = "form-check-input d-none";
      checkbox.type = "checkbox";
      checkbox.value = "delete";
      checkbox.name = "checkDelete";
      checkbox.ariaLabel = "Delete";
      checkbox.style.cursor = "pointer";
      li.appendChild(checkbox);
      fragment.appendChild(li);

      exportButton.disabled = false;
    });
    ul.appendChild(fragment);
    favoriteListContainer.appendChild(ul);

    const lastListItem = favoriteListContainer.querySelector(".list-group .list-group-item:first-child");
    if (lastListItem) {
      lastListItem.classList.remove("mb-3");
    }

    attachCheckboxEventListener(favoriteListContainer);
    measureContentSize();
  } else {
    favoriteEmptyMessage.style.display = "block";
    hasFavorite = false;
    exportButton.disabled = true;
    measureContentSize();
  }
}

// Toggle checkbox display
function updateInput() {
  const historyLiElements = searchHistoryListContainer.querySelectorAll("li");
  const favoriteLiElements = favoriteListContainer.querySelectorAll("li");

  updateListElements(historyLiElements, "history");
  updateListElements(favoriteLiElements, "favorite");
}

function updateListElements(liElements, listType) {
  liElements.forEach((li) => {
    const checkbox = li.querySelector("input");
    const favoriteIcon = li.querySelector("i");

    checkbox.classList.add("d-none");
    favoriteIcon.classList.remove("d-none");

    li.classList.remove("checked-list");
    checkbox.checked = false;

    li.classList.remove("delete-list");
    li.classList.add(listType + "-list");
  });
}

function deleteFromHistoryList() {
  const checkedBoxes =
    searchHistoryListContainer.querySelectorAll("input:checked");
  const selectedTexts = [];

  // Delete checked items from the lists
  checkedBoxes.forEach((checkbox) => {
    // Get the corresponding list item (parent element of the checkbox)
    const listItem = checkbox.closest("li");
    const selectedText = listItem.querySelector("span").textContent;
    selectedTexts.push(selectedText);

    listItem.remove();
  });

  chrome.storage.local.get("searchHistoryList", ({ searchHistoryList }) => {
    // Filter out the selected texts from the search history list
    const updatedList = searchHistoryList.filter(
      (item) => !selectedTexts.includes(item)
    );
    chrome.storage.local.set({ searchHistoryList: updatedList });

    if (updatedList.length === 0) {
      hasHistory = false;
      clearButton.disabled = true;
      searchHistoryUl[0].classList.add("d-none");
      emptyMessage.style.display = "block";
      emptyMessage.innerHTML = chrome.i18n.getMessage("clearedUpMsg").replace(/\n/g, "<br>");
    }
  });
}

function deleteFromFavoriteList() {
  const checkedBoxes = favoriteListContainer.querySelectorAll("input:checked");
  const selectedTexts = [];

  checkedBoxes.forEach((checkbox) => {
    const listItem = checkbox.closest("li");
    const spanItem = listItem.querySelectorAll("span");
    const selectedText = spanItem[0].textContent;
    if (spanItem.length > 1) {
      const clueText = spanItem[1].textContent;
      selectedTexts.push(selectedText + " @" + clueText);
    } else {
      selectedTexts.push(selectedText);
    }

    listItem.remove();

    const historyIElements = searchHistoryListContainer.querySelectorAll("i");

    historyIElements.forEach((icon) => {
      const spanText = icon.parentElement.querySelector("span").textContent;
      if (selectedText === spanText) {
        icon.className = "bi bi-patch-plus-fill";
      }
    });
  });

  chrome.storage.local.get("favoriteList", ({ favoriteList }) => {
    const updatedList = favoriteList.filter(
      (item) => !selectedTexts.includes(item)
    );
    chrome.storage.local.set({ favoriteList: updatedList });

    if (updatedList.length === 0) {
      hasFavorite = false;
      exportButton.disabled = true;
      favoriteUl[0].classList.add("d-none");
      favoriteEmptyMessage.style.display = "block";
      favoriteEmptyMessage.innerHTML = chrome.i18n.getMessage("clearedUpMsg").replace(/\n/g, "<br>");
    }
  });
}

// Update the delete count based on checked checkboxes
function updateDeleteCount() {
  const historyCheckedCount =
    searchHistoryListContainer.querySelectorAll("input:checked").length;
  const favoriteCheckedCount =
    favoriteListContainer.querySelectorAll("input:checked").length;

  const checkedCount = searchHistoryButton.classList.contains("active-button")
    ? historyCheckedCount
    : favoriteCheckedCount;

  if (checkedCount > 0) {
    // turn const to string
    deleteButtonSpan.textContent = chrome.i18n.getMessage("deleteBtnText", checkedCount + "");
    deleteButton.classList.remove("disabled");
  } else {
    deleteButtonSpan.textContent = chrome.i18n.getMessage("deleteBtnTextEmpty");
    deleteButton.classList.add("disabled");
  }
}

function backToNormal() {
  deleteListButton.style.pointerEvents = "";
  deleteListButton.classList.remove("active-button");
  deleteButtonGroup.classList.add("d-none");

  if (searchHistoryButton.classList.contains("active-button")) {
    searchButtonGroup.classList.remove("d-none");
    favoriteListButton.disabled = false;
    geminiSummaryButton.disabled = false;
  } else {
    exportButtonGroup.classList.remove("d-none");
    searchHistoryButton.disabled = false;
    geminiSummaryButton.disabled = false;
  }

  updateInput();
}

// Shortcuts configuration link
const configureElements = document.querySelectorAll(".modal-body p");

for (let i = 0; i < configureElements.length; i++) {
  configureElements[i].onclick = function (event) {
    // Detect user browser
    let userAgent = navigator.userAgent;

    if (/Chrome/i.test(userAgent)) {
      chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
    } else if (/Opera|OPR\//i.test(userAgent)) {
      chrome.tabs.create({ url: "opera://extensions/shortcuts" });
    }

    event.preventDefault();
  };
}

// Localization
document.querySelectorAll("[data-locale]").forEach((elem) => {
  elem.innerText = chrome.i18n.getMessage(elem.dataset.locale);
});

// Ignore pressing the Enter key which means confirmation (macOS)
searchInput.placeholder = chrome.i18n.getMessage("searchInputPlaceholder");
let isComposing = false;

searchInput.addEventListener("compositionstart", () => {
  isComposing = true;
});
searchInput.addEventListener("compositionend", () => {
  isComposing = false;
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && isComposing) {
    e.stopPropagation();
  }
}, true)

// Get Gemini response
const responseField = document.getElementById("response");

sendButton.addEventListener("click", () => {
  sendButton.disabled = true;
  clearButtonSummary.disabled = true;

  chrome.storage.local.get("geminiApiKey", function (data) {
    const apiKey = data.geminiApiKey;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { message: "ping" }, (response) => {
        if (chrome.runtime.lastError) {
          summaryListContainer.innerHTML = "";
          geminiEmptyMessage.innerText = chrome.i18n.getMessage("geminiErrorMsg");
          geminiEmptyMessage.classList.remove("d-none");
          return;
        }
      });

      chrome.tabs.sendMessage(tabs[0].id, { action: "getContent" }, (response) => {
        if (response && response.content) {
          summaryListContainer.innerHTML = "";
          geminiEmptyMessage.innerText = chrome.i18n.getMessage("geminiLoadMsg");
          geminiEmptyMessage.classList.remove("d-none");
          geminiEmptyMessage.classList.add("shineText");

          const originalText = geminiEmptyMessage.innerHTML;
          const divisor = isPredominantlyLatinChars(response.content) ? 1500 : 750;

          const newText = originalText.replace("NaN", Math.ceil(response.length / divisor));
          geminiEmptyMessage.innerHTML = newText;

          summarizeContent(response.content, apiKey, tabs[0].url);
          measureContentSize();
        }
      });
    });
  });
});

// Check if the content is predominantly Latin characters
function isPredominantlyLatinChars(text) {
  const latinChars = text.match(/[a-zA-Z\u00C0-\u00FF]/g)?.length || 0;
  const squareChars = text.match(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g)?.length || 0;

  return latinChars > squareChars;
}

function summarizeContent(content, apiKey, url) {
  responseField.value = "";

  chrome.runtime.sendMessage({ action: "summarizeApi", text: content, apiKey: apiKey, url: url }, (response) => {
    if (response.error) {
      responseField.value = `API Error: ${response.error}`;
      geminiEmptyMessage.innerText = chrome.i18n.getMessage("geminiErrorMsg");
    } else {
      responseField.value = response;
      try {
        summaryListContainer.innerHTML = response;
        const lastListItem = summaryListContainer.querySelector(".list-group .list-group-item:last-child");
        if (lastListItem) {
          lastListItem.classList.remove("mb-3");
        }
        hasSummary = true;
        geminiEmptyMessage.classList.remove("shineText");
        geminiEmptyMessage.classList.add("d-none");
        clearButtonSummary.classList.remove("d-none");
        apiButton.classList.add("d-none");
        clearButtonSummary.disabled = false;

        checkTextOverflow();
        measureContentSize();

        // store the response and current time
        const listItems = document.querySelectorAll(".summary-list");
        const data = [];

        listItems.forEach(item => {
          const nameSpan = item.querySelector("span:first-child").textContent;
          const clueSpan = item.querySelector("span.d-none").textContent;
          data.push({ name: nameSpan, clue: clueSpan });
        });

        chrome.storage.local.get("favoriteList", ({ favoriteList }) => {
          listItems.forEach(item => {
            const itemName = item.querySelector("span:first-child").textContent;
            const icon = createFavoriteIcon(itemName, favoriteList);
            item.appendChild(icon);
          });
        });

        const currentTime = Date.now();
        chrome.storage.local.set({ summaryList: data, timestamp: currentTime });

      } catch (error) {
        responseField.value = `HTML Error: ${error}`;
        geminiEmptyMessage.innerText = chrome.i18n.getMessage("geminiErrorMsg");
      }
    }
    sendButton.disabled = false;
  });
}

// Replace text from note with a link
function text2Link(dataLocale, linkText, linkHref) {
  const pElement = document.querySelector(`p[data-locale="${dataLocale}"]`);
  if (pElement) {
    const originalText = pElement.innerHTML;
    const newText = originalText.replace(linkText,
      `<a href="${linkHref}" target="_blank">${linkText}</a>`);
    pElement.innerHTML = newText;
  }
}

function text2Modal(dataLocale, linkText, modalId) {
  const pElement = document.querySelector(`p[data-locale="${dataLocale}"]`);
  if (pElement) {
    const originalText = pElement.innerHTML;
    const newText = originalText.replace(linkText, `<a href="#" data-bs-toggle="modal" data-bs-target="#${modalId}">${linkText}</a>`);
    pElement.innerHTML = newText;
  }
}

text2Link("apiNote", "Google AI Studio", "https://aistudio.google.com/app/apikey");

// Save the API key
document.getElementById("apiForm").addEventListener("submit", function (event) {
  event.preventDefault();
  const apiKey = apiInput.value;

  chrome.storage.local.set({ geminiApiKey: apiKey });

  verifyApiKey(apiKey).then(isValid => {
    if (isValid) {
      apiModalLabel.innerHTML = chrome.i18n.getMessage("apiTitleTrue");
      geminiEmptyMessage.innerText = chrome.i18n.getMessage("geminiEmptyMsg");
      sendButton.disabled = false;
    } else {
      apiModalLabel.innerHTML = chrome.i18n.getMessage("apiTitleFalse");
      geminiEmptyMessage.classList.remove("d-none");
      geminiEmptyMessage.innerText = chrome.i18n.getMessage("apiInvalidMsg");
      sendButton.disabled = true;
    }
  });
});

// Function to verify the API key
async function verifyApiKey(apiKey) {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
  const data = {
    contents: [{
      parts: [{
        text: "test"
      }]
    }]
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    const candidates = await response.json();
    if (candidates.error) {
      throw new Error(candidates.error.message);
    }
    return true;
  } catch (error) {
    return false;
  }
}

// Clear the API key
const apiModal = document.getElementById("apiModal");
apiModal.addEventListener("hidden.bs.modal", function () {
  apiInput.value = "";
});

apiModal.addEventListener("shown.bs.modal", function () {
  apiInput.focus();
});

// tooltips
geminiSummaryButton.title = chrome.i18n.getMessage("geminiLabel");
searchHistoryButton.title = chrome.i18n.getMessage("historyLabel");
favoriteListButton.title = chrome.i18n.getMessage("favoriteLabel");
deleteListButton.title = chrome.i18n.getMessage("deleteLabel");
enterButton.title = chrome.i18n.getMessage("enterLabel");
configureElements[0].title = chrome.i18n.getMessage("shortcutsLabel");
configureElements[1].title = chrome.i18n.getMessage("shortcutsLabel");
configureElements[2].title = chrome.i18n.getMessage("shortcutsLabel");
const apiSaveButton = document.querySelectorAll(".modal-body #apiForm button");
apiSaveButton[0].title = chrome.i18n.getMessage("saveLabel");
clearButtonSummary.title = chrome.i18n.getMessage("clearSummaryLabel");

// Measure the frame and title bar sizes from different OS
const body = document.body;
const frameWidth = window.outerWidth - window.innerWidth;
const titleBarHeight = window.outerHeight - window.innerHeight;

function measureContentSize() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      action: "updateIframeSize",
      width: body.offsetWidth,
      height: body.offsetHeight,
      frameWidth: frameWidth,
      titleBarHeight: titleBarHeight
    });
  });
}

function retryMeasureContentSize() {
  if (document.body.offsetWidth === 0) {
    setTimeout(retryMeasureContentSize, 100);
  } else {
    measureContentSize();
    hasInit = true;
  }
}

// If the focus tab is changed
function measureContentSizeLast() {
  chrome.tabs.query({ active: false, lastFocusedWindow: true }, (tabs) => {
    let LastAccessedTab = tabs[0];

    if (tabs.length === 0) {
      return;
    } else {
      tabs.forEach((tab) => {
        if (tab.lastAccessed > LastAccessedTab.lastAccessed) {
          LastAccessedTab = tab;
        }
      });

      chrome.tabs.sendMessage(LastAccessedTab.id, {
        action: "updateIframeSize",
        width: body.offsetWidth,
        height: body.offsetHeight,
        frameWidth: frameWidth,
        titleBarHeight: titleBarHeight
      });
    }
  });
}

// Close by Esc key
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ["dist/ejectLite.js"],
      });
    });
  }
});

// Premium panel
paymentButton.addEventListener("click", function () {
  chrome.runtime.sendMessage({ action: "extPay" });
});

restoreButton.addEventListener("click", function () {
  chrome.runtime.sendMessage({ action: "restorePay" });
});

const pElement = document.querySelector(`p[data-locale="premiumNote"]`);

function checkPay() {
  chrome.runtime.sendMessage({ action: "checkPay" }, function (response) {
    const stage = response.result;

    // Shortcut display
    if (stage.isTrial || stage.isPremium) {
      Array.from(shortcutTip).forEach(element => {
        element.classList.remove("premium-only");
      });
    }

    // Note display
    if (stage.isFirst) {
      pElement.innerHTML = chrome.i18n.getMessage("firstNote");
    } else if (stage.isTrial) {
      const date = new Date(stage.trialEnd);
      const shortDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const time = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
      const trialEndOn = `${shortDate}, ${time}`;
      paymentSpan.innerHTML = chrome.i18n.getMessage("trialNote", trialEndOn);
      pElement.innerHTML = chrome.i18n.getMessage("remindNote");
      text2Modal("premiumNote", "Gemini AI", "apiModal");
      text2Modal("premiumNote", "Alt+S / ⌥+S", "tipsModal");
    } else if (stage.isPremium) {
      pElement.innerHTML = chrome.i18n.getMessage("premiumNote");
      text2Link("premiumNote", "回饋", "https://forms.fillout.com/t/dFSEkAwKYKus");
      text2Link("premiumNote", "feedback", "https://forms.fillout.com/t/dFSEkAwKYKus");
      text2Link("premiumNote", "フィードバック", "https://forms.fillout.com/t/dFSEkAwKYKus");
    } else if (stage.isFree) {
      pElement.innerHTML = chrome.i18n.getMessage("freeNote");
      text2Link("premiumNote", "ExtensionPay", "https://extensionpay.com/");
    }
  });
}

closeButton.addEventListener("click", function () {
  checkPay();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "apiNotify") {
    geminiSummaryButton.click();
    apiButton.click();
  }
});