/********************************************************************************
*  WEB322 – Assignment 04
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Prasant Parajuli Student ID: 175569235 Date: 2025/07/12
*
*  Published URL: ___________________________________________________________
*
********************************************************************************/



const express = require("express");
const path = require("path");
const projectData = require("./modules/projects");

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

//To handle HTML files that are formatted to ejs (as per instruction):
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); //Updating deloyment

// As per instruction  before beginning html files:
app.use(express.static(__dirname + "/public"));

// Initialize project data and start server
projectData.initialize().then(() => {
  app.listen(HTTP_PORT, () => {
    console.log(`Server listening on port ${HTTP_PORT}`);
  });
}).catch(err => {
  console.log("Failed to initialize project data:", err);
});

// Route: Home page. Matching compatibility with .ejs extension now as per instruction on assignment4
app.get("/", (req, res) => {
  res.render("home", { page: "/" });//Replacing res.sendFile() to res.render() to match compatibilty for .ejs
});

// Route: About page. Matching compatibility with .ejs extension now as per instruction on assignment4
app.get("/about", (req, res) => {
  res.render("about", { page: "/about" }); //Replacing res.sendFile() to res.render() to match compatibilty for .ejs 
});

// Route: All projects OR by sector
app.get("/solutions/projects", (req, res) => {
  const sector = req.query.sector;

  if (sector) {
    projectData.getProjectsBySector(sector)
      .then(projects => {
        if (projects.length > 0) {
          res.render("projects", { page: "/solutions/projects", projects });
        } else {
          res.status(404).render("404", {
            page: "",
            message: `No projects found for sector: ${sector}`
          });
        }
      })
      .catch(() => {
        res.status(500).render("404", {
          page: "",
          message: "Error retrieving sector projects."
        });
      });
  } else {
    projectData.getAllProjects()
      .then(projects => {
        res.render("projects", { page: "/solutions/projects", projects });
      })
      .catch(() => {
        res.status(500).render("404", {
          page: "",
          message: "Error retrieving project list."
        });
      });
  }
});

// Route: Single project by ID
app.get("/solutions/projects/:id", (req, res) => {
  const id = parseInt(req.params.id);

  projectData.getProjectById(id)
    .then(project => {
      if (project) {
        res.render("project", { page: "", project });
      } else {
        res.status(404).render("404", {
          page: "",
          message: `No project found with ID ${id}`
        });
      }
    })
    .catch(() => {
      res.status(404).render("404", {
        page: "",
        message: "Error retrieving project details"
      });
    });
});


// Route: 404 - fallback for unmatched routes. Matching compatibility with .ejs extension now as per instruction on assignment4
app.use((req, res) => {
  res.status(404).render("404", { page: "", message: "Page not found." });//Replacing res.status() to res.status().render to match compatibilty for .ejs
});