window.onload = function () {
  // Defined constants for the base URL, API key, and some HTML elements
  const baseUrl = "https://www.googleapis.com/books/v1/volumes";
  const key = "AIzaSyCnjNdK4OUoRgi9fwcxHCSlJSg8TA6nPkA";
  const dataWrapper = document.getElementById("data-wrapper");
  const clearButton = document.getElementById("clear-button");
  const searchButton = document.getElementById("search-button");
  let selectedLanguage = "";
  let search = document.getElementById("search-term");
  let uniqueBooks = [];

  const languages = [
    { name: "Amharic", lang: "am" },
    { name: "Arabic", lang: "ar" },
    { name: "Basque", lang: "eu" },
    { name: "Bengali", lang: "bn" },
    { name: "English (UK)", lang: "en" },
    { name: "Portuguese (Brazil)", lang: "pt" },
    { name: "Bulgarian", lang: "bg" },
    { name: "Catalan", lang: "ca" },
    { name: "Cherokee", lang: "chr" },
    { name: "Croatian", lang: "hr" },
    { name: "Czech", lang: "cs" },
    { name: "Danish", lang: "da" },
    { name: "Dutch", lang: "nl" },
    { name: "English (US)", lang: "en" },
    { name: "Estonian", lang: "et" },
    { name: "Filipino", lang: "fil" },
    { name: "Finnish", lang: "fi" },
    { name: "French", lang: "fr" },
    { name: "German", lang: "de" },
    { name: "Greek", lang: "el" },
    { name: "Gujarati", lang: "gu" },
    { name: "Hebrew", lang: "iw" },
    { name: "Hindi", lang: "hi" },
    { name: "Hungarian", lang: "hu" },
    { name: "Icelandic", lang: "is" },
    { name: "Indonesian", lang: "id" },
    { name: "Italian", lang: "it" },
    { name: "Japanese", lang: "ja" },
    { name: "Kannada", lang: "kn" },
    { name: "Korean", lang: "ko" },
    { name: "Latvian", lang: "lv" },
    { name: "Lithuanian", lang: "lt" },
    { name: "Malay", lang: "ms" },
    { name: "Malayalam", lang: "ml" },
    { name: "Marathi", lang: "mr" },
    { name: "Norwegian", lang: "no" },
    { name: "Polish", lang: "pl" },
    { name: "Portuguese (Portugal)", lang: "pt" },
    { name: "Romanian", lang: "ro" },
    { name: "Russian", lang: "ru" },
    { name: "Serbian", lang: "sr" },
    { name: "Chinese (PRC)", lang: "zh" },
    { name: "Slovak", lang: "sk" },
    { name: "Slovenian", lang: "sl" },
    { name: "Spanish", lang: "es" },
    { name: "Swahili", lang: "sw" },
    { name: "Swedish", lang: "sv" },
    { name: "Tamil", lang: "ta" },
    { name: "Telugu", lang: "te" },
    { name: "Thai", lang: "th" },
    { name: "Chinese (Taiwan)", lang: "zh" },
    { name: "Turkish", lang: "tr" },
    { name: "Urdu", lang: "ur" },
    { name: "Ukrainian", lang: "uk" },
    { name: "Vietnamese", lang: "vi" },
    { name: "Welsh", lang: "cy" },
  ];

  // Function to create options for the language select element
  const createLanguageOptions = (languages) => {
    const langSelect = document.getElementById("language");
    languages.forEach((language) => {
      const langOption = document.createElement("option");
      langOption.value = language.lang;
      langOption.setAttribute("name", language.name);
      langOption.innerHTML = language.name;
      langSelect.appendChild(langOption);
    });
  };

  createLanguageOptions(languages);

  // Function to clear the data wrapper
  const clear = () => {
    dataWrapper.innerHTML = "";
    uniqueBooks = [];
  };

  clearButton.addEventListener("click", () => {
    clear();
  });

  // Function to search and fetch data
  const searchAndFetchData = (searchValue, searchType, selectedLanguage) => {
    fetchData(searchValue, searchType, selectedLanguage);
    search.value = "";
  };

  // Search function that is called in event listeners for search button and the enter key
  const handleSearch = () => {
    clear();
    let searchType = document.getElementById("search-type").value;
    let searchValue = search.value;
    selectedLanguage = document.getElementById("language").value;
    if (searchType === "author") {
      let authorName = searchValue;
      let authorLastName = authorName.split(" ").pop();
      searchAndFetchData(authorLastName, searchType, selectedLanguage);
    } else if (searchType === "title") {
      searchAndFetchData(searchValue, searchType, selectedLanguage);
    }
  };

  searchButton.addEventListener("click", handleSearch);

  search.addEventListener("keypress", function (keySearch) {
    if (keySearch.key === "Enter") {
      keySearch.preventDefault();
      handleSearch();
    }
  });

  // Sorting function by title
  const sortByTitle = (a, b) => {
    const titleA = a.volumeInfo?.title?.toLowerCase();
    const titleB = b.volumeInfo?.title?.toLowerCase();
    if (titleA < titleB) {
      return -1;
    }
    if (titleA > titleB) {
      return 1;
    }
    return 0;
  };

  // Sorting function by author
  const sortByAuthor = (a, b) => {
    const authorA = a.volumeInfo?.authors[0]?.toLowerCase().split(" ");
    const authorB = b.volumeInfo?.authors[0]?.toLowerCase().split(" ");
    if (authorA[0] < authorB[0]) {
      return -1;
    }
    if (authorA[0] > authorB[0]) {
      return 1;
    }
    if (authorA[1] < authorB[1]) {
      return -1;
    }
    if (authorA[1] > authorB[1]) {
      return 1;
    }
    return 0;
  };

  // Data fetch from Google Books API
  const fetchData = async (searchValue, searchType, language) => {
    let queryParam = "";
    if (searchType === "title") {
      queryParam = "intitle:" + encodeURIComponent(searchValue);
    } else if (searchType === "author") {
      queryParam = "inauthor:" + encodeURIComponent(searchValue);
    }

    const response = await fetch(
      baseUrl +
        "?q=" +
        queryParam +
        "&maxResults=40" +
        "&langRestrict=" +
        language +
        "&printType=books" +
        "&fields=items(volumeInfo/title,volumeInfo/authors,volumeInfo/imageLinks,volumeInfo/canonicalVolumeLink)" +
        "&key=" +
        key,
      {
        method: "GET",
      }
    );
    const data = await response.json();

    // Checking for unnecessary duplicates in results
    data.items.forEach((item) => {
      if (
        item["volumeInfo"]["imageLinks"] &&
        item["volumeInfo"]["imageLinks"]["thumbnail"]
      ) {
        let bookExists = uniqueBooks.some(
          (book) => book.volumeInfo.title === item.volumeInfo.title
        );
        if (!bookExists) {
          if (
            searchType === "author" &&
            item.volumeInfo?.authors?.some((author) =>
              author.toLowerCase().includes(searchValue.toLowerCase())
            )
          ) {
            uniqueBooks.push(item);
          } else if (
            searchType === "title" &&
            item.volumeInfo?.title
              ?.toLowerCase()
              .includes(searchValue.toLowerCase())
          ) {
            uniqueBooks.push(item);
          }
        }
      }
    });

    // Appending results using separate functions for building different elements
    const displayData = (data) => {
      data.forEach((book) => {
        const bookWrapper = createBookWrapper(book);
        dataWrapper.appendChild(bookWrapper);

        const bookInfo = createBookInfo(book);
        bookWrapper.appendChild(bookInfo);

        const bookTitle = createBookTitle(book);
        bookInfo.appendChild(bookTitle);

        const lineBreak = document.createElement("br");
        bookTitle.after(lineBreak);

        const bookAuthor = createBookAuthor(book);
        bookInfo.appendChild(bookAuthor);

        const bookCoverWrapper = createBookCoverWrapper(book);
        bookWrapper.appendChild(bookCoverWrapper);

        const bookCover = createBookCover(
          book,
          bookTitle,
          bookAuthor,
          bookWrapper
        );
        bookCoverWrapper.appendChild(bookCover);
      });
    };

    let sortType = document.getElementById("sort-type").value;
    if (sortType === "title") {
      uniqueBooks.sort(sortByTitle);
    } else if (sortType === "author") {
      uniqueBooks.sort(sortByAuthor);
    }
    displayData(uniqueBooks);
  };
};

// Following functions control how the data is appended to the DOM (and are called in the displayData function)
const createBookWrapper = () => {
  const bookWrapper = document.createElement("div");
  bookWrapper.classList.add("book-wrapper");
  return bookWrapper;
};

const createBookInfo = () => {
  const bookInfo = document.createElement("div");
  bookInfo.classList.add("book-info");
  return bookInfo;
};

const createBookTitle = (book) => {
  const bookTitle = document.createElement("a");
  bookTitle.innerText = book["volumeInfo"]["title"];
  bookTitle.href = book["volumeInfo"]["canonicalVolumeLink"];
  bookTitle.target = "blank";
  bookTitle.classList.add("book-title");
  return bookTitle;
};

const createBookAuthor = (book) => {
  const bookAuthor = document.createElement("a");
  bookAuthor.innerText = book["volumeInfo"]["authors"];
  bookAuthor.href = book["volumeInfo"]["canonicalVolumeLink"];
  bookAuthor.target = "blank";
  bookAuthor.classList.add("book-author");
  return bookAuthor;
};

const createBookCoverWrapper = () => {
  const bookCoverWrapper = document.createElement("div");
  bookCoverWrapper.classList.add("cover-wrapper");
  return bookCoverWrapper;
};

const createBookCover = (book, bookTitle, bookAuthor) => {
  const bookCover = document.createElement("img");
  let coverUrl = book["volumeInfo"]["imageLinks"]["thumbnail"];
  let noEdgeCurlUrl = coverUrl.replace(/&edge=curl/g, "");
  bookCover.src = noEdgeCurlUrl;
  bookCover.alt =
    "A cover image of " + bookTitle.innerText + " by " + bookAuthor.innerText;
  bookCover.title = bookTitle.innerText + " by " + bookAuthor.innerText;
  bookCover.classList.add("book-cover");
  return bookCover;
};
