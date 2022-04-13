import express from "express";
import { Request, Response } from "express";

const app = express();
app.use(express.json())
require("dotenv").config();
const jwt = require("jsonwebtoken");
app.listen(3000);

function checkUser(req: any, res: any, next: any) {
  const headerAuth = req.headers["authorization"];
  const token = headerAuth && headerAuth.split(" ")[1];

  if (token == null) 
    return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_KEY, (err: any, user: any) => {
    if (err) 
      return res.sendStatus(403);
    req.user = user;
    next();
  });
}

async function Data(): Promise<void> {
  var fs = require("fs");
  var dataNotatka = await fs.readFileSync("./src/data/notatka.json");
  var dataTag = await fs.readFileSync("./src/data/tag.json");
  notatka = JSON.parse(dataNotatka);
  tags = JSON.parse(dataTag)
}

async function Save(): Promise<void> {
  var fs = require("fs");
  await  fs.writeFileSync("./src/data/notatka.json", JSON.stringify(notatka));
  await fs.writeFileSync("./src/data/tag.json", JSON.stringify(tags));
}

interface Note {
  title: string;
  content: string;
  createDate?: string;
  tags?: Tag[];
  id?: number;
  user?: string;
}

interface Login {
  login: string;
  password: string;
  admin?: boolean;
  id?: number;
}

interface Tag {
  id?: number;
  name: string;
  user?: string;
}

let tags: Tag[] = [];
let notatka: Note[] = [];
let users: Login[] = [];

app.get("/users", checkUser, function (req: any, res) {
  if (req.user.admin) {
    res.send(users);
  } else {
    res.send(users.find((x) => x.login === req.user.login));
  }
});

app.post("/register", async function (req, res) {
  const login = req.body.login;
  const password = req.body.password;
  const adminbool = req.body.admin;

  let user:Login = {
    login:login,
    admin:adminbool,
    password:password,
    id:Date.now()
  }
    const token = jwt.sign(user,process.env.JWT_KEY)
    users.push(user);
    res.send({token:token});
  }
);

app.get("/tags",checkUser, function (req, res) {
  Data();
  res.send(tags);
});

app.post("/tag", async function (req:any, res) {
  await Data();
  if (req.body.name) {
    const a = req.body.name.toLowerCase();
    const tagFind = tags.find((name) => name.name === a);

    if (tagFind) 
      res.status(404).send("Błąd 404 tag już istnieje");
    
    else {
      let tag: Tag = {
        name: req.body.name,
        id: Date.now(),
        user: req.user
      };
      tags.push(tag);
      res.status(200).send(tag);
      await Save();
    }
  } else {
    res.status(404).send("Błąd 404 tag nie został utworzony");
    }
  }
);

app.delete("/tag/:id", async function (req, res) {
  await Data();
  const {id} = req.params;
  const ID = +id;
  tags = tags.filter((tag) => tag.id !== ID);
  await Save();
  res.send("Tag został usunięty");
  }
);

app.put("/tag/:id", async function (req, res) {
  await Data();
  const { id } = req.params;
  const ID = +id;
  const name = req.body.name.toLowerCase();
  const tag = tags.find((note) => note.id === ID);
  if (name) {
    tag!.name = name;
  }
  res.send(tag);
  await Save();
  }
);

app.get("/note/:id", async function (req: Request, res: Response) {
  await Data();
  const note = notatka.find((note) => note.id ===parseInt(req.params.id))

  if(note)
    res.status(200).send(note);
  else{
    res.status(404).send("Błąd 404");
  }
  }
);

app.get("/notes", async function (req, res) {
  await Data();
  res.send(notatka);
  }
);

app.post("/note", async function (req: any, res: Response) {
  await Data();
  if (req.body.title && req.body.content) {
    let note: Note = {
      title: req.body.title,
      content: req.body.content,
      createDate: new Date().toISOString(),
      tags: req.body.tags,
      user:req.user.login,
      id: Date.now(),
    };

    let tag: Tag = {
      id: Date.now(),
      name: req.body.tags,
    };

    var idToString = note.id!.toString();

    if (tag.name === undefined) 
      tag = {
        id: Date.now(),
        name: "Default",
      };
 
    let tagNameToLowerCase=tag.name.toString().toLowerCase();

    const tagFind = tags.find((x) => x.name === tagNameToLowerCase);

    if (tagFind || tagNameToLowerCase === "default") {
      notatka.push(note);
      await Save();
    } else {
      tags.push(tag);
      notatka.push(note);
      await Save();
    }
    res.status(200).send(idToString);
  } else {
    res.status(404).send("Błąd 404 nie utworzono notatki");
  }
});

app.delete("/note/:id", async (req, res) => {
  await Data();
  const {id} = req.params;
  const ID = +id;
  notatka = notatka.filter((note) => note.id !== ID);
  await Save();
  res.send("notatka z podanym id została usunięta");
});

app.put("/note/:id",async (req, res) => {
  await Data();
  const { id } = req.params;
  const ID = +id;
  const { title, content, createDate, tags } = req.body;
  const note = notatka.find((note) => note.id === ID);
  if (note == null) 
    res.status(404).send("Błąd 404 notatki nie została wyszukana");
    else {
    function validateToken(note: any) {
      return note;
    }
    validateToken(note as any);
    if (title) 
      note!.title = title;
    if (content) 
      note!.content = content;
    if (createDate) 
      note!.createDate = createDate;
    if (tags) 
      note!.tags = tags;
    res.send(note);
    await Save();
  }
  }
);


