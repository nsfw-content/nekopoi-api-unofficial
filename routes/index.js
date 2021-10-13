const homeController = require('../controllers/home.controller')

var router = require("express").Router();
var appRouter = require("express").Router();

router.get("/home/:page", homeController.home);
router.get("/search/:page/", homeController.search);

appRouter.use("/api", router);

module.exports = { appRouter };