const express = require("express");
const fs = require("fs");
const app = express();
const port = 3000;

let { movies } = require("./movies.js");
let globalId = 0;

app.use(express.json());
loadMovies();

// Backend dapat menampilkan list semua film di bioskop
app.get("/", (req, res) => {
  res.status(200).json(movies);
});

// Backend dapat melakukan search film dengan nama
app.get("/search", (req, res) => {
  const { Title } = req.query;
  const movieIdx = movies.findIndex((movie) => movie.Title == Title);
  if (movieIdx == -1) {
    res.status(404).json({ message: "not found" });
  }
  res.status(200).json(movies[movieIdx]);
});

// Backend dapat menampilkan film sesuai dengan id yang diminta
app.get("/:id", (req, res) => {
  const { id } = req.params;
  const movieIdx = movies.findIndex((movie) => movie.id == Number(id));
  if (movieIdx == -1) {
    res.status(404).json({ message: "not found" });
  }
  res.status(200).json(movies[movieIdx]);
});

// Backend dapat menambahkan film ke database
app.post("/", (req, res) => {
  const { Title, Year, imdbID, Type, Poster } = req.body;
  const movie = {
    id: globalId + 1,
    Title,
    Year,
    imdbID,
    Type,
    Poster,
  };
  movies.push(movie);
  globalId++;
  res.status(201).json(movie);
});

// Backend dapat menghapus film sesuai dengan id pada request
app.delete("/:id", (req, res) => {
  const { id } = req.params;
  if (id < 0 || id > movies.length) {
    res.status(404).json({ message: "not found" });
  }
  movies = movies.filter((movie) => movie.id != Number(id));
  res.status(204).json({ message: id });
});

// Backend dapat melakukan update pada film sesuai dengan id pada request
app.patch("/:id", (req, res) => {
  const { id } = req.params;
  const { Title, Year, imdbID, Type, Poster } = req.body;
  const movieIdx = movies.findIndex((movie) => movie.id == Number(id));
  if (movieIdx == -1) {
    res.status(404).json({ message: "not found" });
  }
  movies[movieIdx].Title = Title;
  movies[movieIdx].Year = Year;
  movies[movieIdx].imdbID = imdbID;
  movies[movieIdx].Type = Type;
  movies[movieIdx].Poster = Poster;
  res.status(200).json(movies[movieIdx]);
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

// Ketika server dinyalakan, akan di load sebuah json ke dalam program sebagai database awal
function loadMovies() {
  try {
    const data = fs.readFileSync("./movies.json", "utf-8");
    const parsedData = JSON.parse(data);
    movies = parsedData;
    for (let i = 0; i < movies.length; i++) {
      movies[i].id = globalId + 1;
      globalId++;
    }
  } catch (err) {
    console.error("Error loading initial movies:", err);
  }
}

// Ketika server dimatikan, semua perubahan yang dilakukan harus disimpan ke dalam sebuah json
function saveMoviesToFile() {
  fs.writeFileSync("./movies.json", JSON.stringify( movies ), "utf-8");
}

process.on("SIGINT", saveMoviesToFile);