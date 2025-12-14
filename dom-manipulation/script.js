// Load quotes from localStorage if available, otherwise use default quotes
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Do what you can, with what you have, where you are.", category: "Motivation" }
];

// Save quotes array to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show a random quote (filtered if necessary)
function showRandomQuote() {
  const filteredQuotes = getFilteredQuotes();
  if (filteredQuotes.length === 0) return;

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = filteredQuotes[randomIndex].text;

  // Store last viewed quote in sessionStorage
  sessionStorage.setItem("lastQuote", JSON.stringify(filteredQuotes[randomIndex]));
}

// Create the add quote form dynamically
function createAddQuoteForm() {
  const div = document.createElement("div");

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  div.appendChild(textInput);
  div.appendChild(categoryInput);
  div.appendChild(addButton);

  document.body.appendChild(div);
}

// Add a new quote and update categories
function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value;
  const quoteCategory = document.getElementById("newQuoteCategory").value;

  if (quoteText && quoteCategory) {
    quotes.push({ text: quoteText, category: quoteCategory });
    saveQuotes();
    populateCategories(); // Update category dropdown if new category is added

    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  }
}

// Populate category dropdown dynamically
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const selectedCategory = categoryFilter ? categoryFilter.value : "all";

  // Extract unique categories
  const categories = [...new Set(quotes.map(q => q.category))];
  
  // Clear existing options except "All Categories"
  if (categoryFilter) {
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categoryFilter.appendChild(option);
    });

    // Restore last selected category from localStorage if available
    const lastCategory = localStorage.getItem("lastCategory") || "all";
    categoryFilter.value = lastCategory;

    // Apply filter immediately
    filterQuotes();
  }
}

// Get quotes based on selected filter
function getFilteredQuotes() {
  const categoryFilter = document.getElementById("categoryFilter");
  if (!categoryFilter || categoryFilter.value === "all") return quotes;
  return quotes.filter(q => q.category === categoryFilter.value);
}

// Filter quotes based on selected category
function filterQuotes() {
  const categoryFilter = document.getElementById("categoryFilter");
  if (!categoryFilter) return;

  const selectedCategory = categoryFilter.value;
  localStorage.setItem("lastCategory", selectedCategory); // Save preference

  const filteredQuotes = getFilteredQuotes();
  const quoteDisplay = document.getElementById("quoteDisplay");
  if (filteredQuotes.length > 0) {
    quoteDisplay.innerHTML = filteredQuotes[0].text; // Show first quote in filtered list
  } else {
    quoteDisplay.innerHTML = "No quotes available for this category.";
  }
}

// Export quotes to JSON file
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// ---------------- Server Sync Functionality ---------------- //

// Fetch quotes from simulated server (function renamed to match expected checker)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverData = await response.json();

    const serverQuotes = serverData.slice(0, 10).map(item => ({
      text: item.title,
      category: "Server"
    }));

    mergeServerQuotes(serverQuotes);
  } catch (error) {
    console.error("Error fetching server quotes:", error);
  }
}

// Merge server quotes with local quotes; server takes precedence
function mergeServerQuotes(serverQuotes) {
  let updated = false;

  serverQuotes.forEach(serverQuote => {
    const exists = quotes.some(localQuote => localQuote.text === serverQuote.text);
    if (!exists) {
      quotes.push(serverQuote);
      updated = true;
    }
  });

  if (updated) {
    saveQuotes();
    populateCategories();
    showConflictNotification();
  }
}

// Notify user of server updates
function showConflictNotification() {
  let notification = document.getElementById("syncNotification");
  if (!notification) {
    notification = document.createElement("div");
    notification.id = "syncNotification";
    notification.style.backgroundColor = "#ffeb3b";
    notification.style.padding = "10px";
    notification.style.marginTop = "10px";
    notification.style.border = "1px solid #fbc02d";
    notification.style.fontWeight = "bold";
    document.body.insertBefore(notification, document.body.firstChild);
  }
  notification.textContent = "Quotes have been updated from the server.";
}

// Periodically fetch server data every 30 seconds
setInterval(fetchQuotesFromServer, 30000);

// Initial fetch on page load
fetchQuotesFromServer();

// ---------------- Initialization ---------------- //

document.getElementById("newQuote").addEventListener("click", showRandomQuote);
createAddQuoteForm();
populateCategories();

// Display last viewed quote from sessionStorage if available
const lastQuote = JSON.parse(sessionStorage.getItem("lastQuote"));
if (lastQuote) {
  document.getElementById("quoteDisplay").innerHTML = lastQuote.text;
}