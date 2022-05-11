const express = require("express");
const server = express();
const mysql = require("mysql");
const PORT = process.env.PORT || 8080;
const path = require("path");
const db = mysql.createConnection({
  host: "localhost",
  database: "project_manager",
  user: "root",
  password: "Mnikmjl1_",
});
db.connect((error) => {
  if (error) throw error;
  console.log("Database Connected Successfully");
});

server.use(express.urlencoded({ extended: true }));
server.use(express.json());
server.use(express.static(path.join(__dirname, "public")));
server.set("views", path.join(__dirname, "public/views"));
server.set("view engine", "ejs");

server.get("/", (req, res) => {
  db.query(
    "select * from project_manager.projects",
    (error, records, field) => {
      if (error) {
        throw error;
      }
      console.log("fuck");
      res.render("index", { projects: records, delete: deleteProject });
    }
  );
});

server.get("/project/add", (req, res) => {
  res.render("createProject");
});

server.post("/project/add", (req, res) => {
  db.query(
    `insert into project_manager.projects (project_title, project_description, project_start_dt, project_due_dt) values( '${req.body.project_title}','${req.body.project_description}',  date '${req.body.project_start_dt}', date '${req.body.project_due_dt}')`,
    (error, records, fields) => {
      if (error) throw error;
    }
  );
  res.redirect("/");
});
server.get("/project/delete/:id", (req, res) => {
  db.query(
    "delete from project_manager.projects where id = ? ",
    [parseInt(req.params.id)],
    (error, records, fields) => {
      if (error) throw error;
    }
  );
  res.redirect("/");
});

server.post("/project/:id", (req, res) => {
  db.query(
    `update project_manager.projects set ? where projects_id = ?`,
    [req.body, req.params.id],
    (error, records, field) => {
      if (error) throw error;
    }
  );
  res.redirect("/");
});

server.get("/project/:id", (req, res) => {
  console.log(req.params.id);
  db.query(
    `select * from project_manager.projects where projects_id = ${req.params.id}`,
    (error, records, field) => {
      let project = records[0];
      console.log(records);
      res.render("editProject", { project, dateParser: createTextableDate });
    }
  );
});

// Notes Route
server.get("/project/:id/notes", (req, res) => {
  db.query(
    `select * from project_manager.notes where project_id = ${req.params.id}`,
    (error, records, field) => {
      let notes = records;
      res.render("notesPage", {
        notes,
        projectID: req.params.id,
        dateParser: createTextableDate,
      });
    }
  );
});
server.get("/project/:projectId/note/add", (req, res) => {
  res.render("createNotes", { projectID: req.params.projectId });
});

server.post("/project/:projectId/note/add", (req, res) => {
  console.log(req.params.projectId);
  db.query(
    `insert into project_manager.notes (project_id,note, active_date) values( '${req.params.projectId}','${req.body.note}',  date '${req.body.active_date}')`,
    (error, records, fields) => {
      if (error) throw error;
    }
  );
  res.redirect("/project/" + req.params.projectId + "/notes");
});

server.get("/project/:id/note/:noteId", (req, res) => {
  db.query(
    `select * from project_manager.notes where project_id = ${req.params.id} and id = ${req.params.noteId}`,
    (error, records, field) => {
      let note = records[0];
      res.render("editNotes", {
        note,
        projectID: req.params.id,
        dateParser: createTextableDate,
      });
    }
  );
});
server.post("/project/:id/note/:noteId", (req, res) => {
  db.query(
    `update project_manager.notes set ? where id = ${req.params.noteId}`,
    [req.body],
    (error, records, field) => {
      if (error) throw error;
    }
  );
  res.redirect("/project/" + req.params.id + "/notes");
});
server.get("/project/:projectId/note/:noteId/delete", (req, res) => {
  db.query(
    "delete from project_manager.notes where id = ? ",
    [parseInt(req.params.noteId)],
    (error, records, fields) => {
      if (error) throw error;
    }
  );
  res.redirect("/project/" + req.params.projectId + "/notes");
});

// SERVER DATA
server.listen(PORT, () => {
  console.log("Running server on Port: ", PORT);
});

function createTextableDate(dateString) {
  let year = dateString.getFullYear();
  let month = (dateString.getMonth() + 1).toString();
  let day = dateString.getDate().toString();
  if (month.length < 2) {
    month = "0" + month;
  }
  if (day.length < 2) {
    day = "0" + day;
  }
  return year + "-" + month + "-" + day;
}
function deleteProject(projectName) {
  window.confirm(
    "Are you sure you want to delete the project: \n" + projectName
  );
}
