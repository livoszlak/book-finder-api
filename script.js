window.onload = function () {
  const baseUrl = "https://www.googleapis.com/books/v1/volumes";
  const dataWrapper = document.getElementById("data-wrapper");
  const key = "AIzaSyCnjNdK4OUoRgi9fwcxHCSlJSg8TA6nPkA";

  let search = document.getElementById("search-term");

  const clear = function () {
    dataWrapper.innerHTML = "";
  };

  const clearButton = document.getElementById("clear-button");
  clearButton.addEventListener("click", () => {
    clear();
  });

  const searchButton = document.getElementById("search-button");
  searchButton.addEventListener("click", () => {
    clear();
    let searchType = document.getElementById("search-type").value;
    let searchValue = search.value;
    if (searchType === "author") {
      let authorName = searchValue;
      let authorLastName = authorName.split(" ").pop();
      fetchData(authorLastName, searchType);
    } else {
      fetchData(searchValue, searchType);
    }
    search.value = "";
  });

  search.addEventListener("keypress", function (keySearch) {
    if (keySearch.key === "Enter") {
      keySearch.preventDefault();
      let searchType = document.getElementById("search-type").value;
      clear();
      fetchData(search.value, searchType);
      search.value = "";
    }
  });

  const fetchData = async (searchValue, searchType) => {
    let queryParam = "";
    if (searchType === "title") {
      queryParam = "intitle:" + encodeURIComponent(searchValue);
    } else if (searchType === "author") {
      queryParam = "inauthor:" + encodeURIComponent(searchValue);
    } else {
      queryParam =
        "intitle:" +
        encodeURIComponent(searchValue) +
        "&inauthor:" +
        encodeURIComponent(searchValue);
    }

    const response = await fetch(
      baseUrl +
        "?q=" +
        queryParam +
        "&maxResults=40" +
        "&printType=books" +
        "&fields=items(volumeInfo/title,volumeInfo/authors,volumeInfo/imageLinks,volumeInfo/canonicalVolumeLink)" +
        "&key=" +
        key,
      {
        method: "GET",
      }
    );
    const data = await response.json();

    let uniqueBooks = [];
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
            // } else if (searchType !== "author" && searchType !== "title") {
            //   uniqueBooks.push(item);
          }
        }
      }
    });

    let sortType = document.getElementById("sort-type").value;
    if (sortType === "title") {
      uniqueBooks.sort((a, b) => {
        const titleA = a.volumeInfo.title.toLowerCase();
        const titleB = b.volumeInfo.title.toLowerCase();
        if (titleA < titleB) {
          return -1;
        }
        if (titleA > titleB) {
          return 1;
        }
        return 0;
      });
    } else if (sortType === "author") {
      uniqueBooks.sort((a, b) => {
        const authorA = a.volumeInfo.authors[0].split(" ").pop().toLowerCase();
        const authorB = b.volumeInfo.authors[0].split(" ").pop().toLowerCase();
        if (authorA < authorB) {
          return -1;
        }
        if (authorA > authorB) {
          return 1;
        }
        return 0;
      });
    }
    displayData(uniqueBooks);
  };

  const displayData = (data) => {
    data.forEach((book) => {
      const bookWrapper = document.createElement("div");
      bookWrapper.classList.add("book-wrapper");
      dataWrapper.appendChild(bookWrapper);

      const bookInfo = document.createElement("div");
      bookInfo.classList.add("book-info");
      bookWrapper.appendChild(bookInfo);

      const bookTitle = document.createElement("a");
      bookTitle.innerText = book["volumeInfo"]["title"];
      bookTitle.href = book["volumeInfo"]["canonicalVolumeLink"];
      bookTitle.target = "blank";
      bookTitle.classList.add("book-title");
      bookInfo.appendChild(bookTitle);

      const lineBreak = document.createElement("br");
      bookTitle.after(lineBreak);

      const bookAuthor = document.createElement("a");
      bookAuthor.innerText = book["volumeInfo"]["authors"];
      bookAuthor.classList.add("book-author");
      bookInfo.appendChild(bookAuthor);

      const bookCoverWrapper = document.createElement("div");
      bookCoverWrapper.classList.add("cover-wrapper");
      bookWrapper.appendChild(bookCoverWrapper);

      const bookCover = document.createElement("img");
      let coverUrl = book["volumeInfo"]["imageLinks"]["thumbnail"];
      let noEdgeCurlUrl = coverUrl.replace(/&edge=curl/g, "");
      bookCover.src = noEdgeCurlUrl;
      bookCover.alt =
        "A cover image of " +
        bookTitle.innerText +
        " by " +
        bookAuthor.innerText;
      bookCover.title = bookTitle.innerText + " by " + bookAuthor.innerText;
      bookCover.classList.add("book-cover");
      bookCoverWrapper.appendChild(bookCover);
    });
  };
};
