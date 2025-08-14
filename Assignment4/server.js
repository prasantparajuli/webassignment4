/********************************************************************************
*  WEB322 – Assignment 5
*
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
*
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
*  Name: Prasant Parajuli Student ID: 175569235
*  Date: 2025-07-20
*
********************************************************************************/

const express = require("express");
const path = require("path");
const http = require("http");

const app = express();
app.use(express.urlencoded({ extended: true }));

const projectData = require("./modules/projects");
const HTTP_PORT = process.env.PORT || 8080;

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static assets
app.use("/css", express.static(path.join(__dirname, "public/css")));

// Routes
app.get("/", (req, res) => {
  res.render("home", { page: "/" });
});

app.get("/about", (req, res) => {
  res.render("about", { page: "/about" });
});

// Form to add a new project
app.get("/solutions/addProject", (req, res) => {
  projectData.getAllSectors()
    .then((sectors) => {
      res.render("addProject", { sectors });
    })
    .catch((err) => {
      res.status(500).render("500", { message: "Unable to load sectors for form." });
    });
});

// Handle POST from addProject form
app.post("/solutions/addProject", (req, res) => {
  projectData.addProject(req.body)
    .then(() => {
      res.redirect("/solutions/projects");
    })
    .catch((err) => {
      res.status(500).render("500", { message: `Error adding project: ${err}` });
    });
});

// Projects listing (optionally filtered by sector)
app.get("/solutions/projects", (req, res) => {
  const sector = req.query.sector;

  if (sector) {
    projectData.getProjectsBySector(sector)
      .then((projects) => {
        if (projects.length === 0) {
          return res.status(404).render("404", { message: `No projects found for sector: ${sector}` });
        }
        res.render("projects", { projects, page: "/solutions/projects", sector });
      })
      .catch(() => {
        res.status(500).render("500", { message: "Error retrieving filtered projects." });
      });
  } else {
    projectData.getAllProjects()
      .then((projects) => {
        res.render("projects", { projects, page: "/solutions/projects", sector: null });
      })
      .catch(() => {
        res.status(500).render("500", { message: "Unable to fetch all projects." });
      });
  }
});

// Individual project details
app.get("/solutions/projects/:id", (req, res) => {
  projectData.getProjectById(req.params.id)
    .then((project) => {
      res.render("project", { project, page: "" });
    })
    .catch(() => {
      res.status(404).render("404", { message: `No project found with ID: ${req.params.id}` });
    });
});

// Show Edit Project Form
app.get("/solutions/editProject/:id", (req, res) => {
  const projectId = req.params.id;

  Promise.all([
    projectData.getProjectById(projectId),
    projectData.getAllSectors()
  ])
    .then(([project, sectors]) => {
      res.render("editProject", { project, sectors });
    })
    .catch((err) => {
      res.status(404).render("404", { message: err.message || "Project not found" });
    });
});

// Handle Edit Project Form Submission
app.post("/solutions/editProject", (req, res) => {
  const { id, ...updatedData } = req.body;

  projectData.editProject(id, updatedData)
    .then(() => {
      res.redirect("/solutions/projects");
    })
    .catch((err) => {
      res.status(500).render("500", { message: `Error editing project: ${err}` });
    });
});

// Handle Project Deletion
app.get("/solutions/deleteProject/:id", (req, res) => {
  const projectId = req.params.id;

  projectData.deleteProject(projectId)
    .then(() => {
      res.redirect("/solutions/projects");
    })
    .catch((err) => {
      res.status(500).render("500", { message: `Error deleting project: ${err}` });
    });
});

// Fallback 404
app.use((req, res) => {
  res.status(404).render("404", { message: "Page not found." });
});

// Start server
projectData.initialize()
  .then(() => {
    http.createServer(app).listen(HTTP_PORT, () => {
      console.log(`🚀 Server listening on port ${HTTP_PORT}`);
    });
  })
  .catch((err) => {
    console.error("Initialization error:", err);
  });
