"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const movie_controller_1 = require("../controllers/movie.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Protect movie routes so only authenticated users can access them
router.use(auth_middleware_1.protect);
router.get('/trending', movie_controller_1.movieController.getTrending.bind(movie_controller_1.movieController));
router.get('/search', movie_controller_1.movieController.search.bind(movie_controller_1.movieController));
router.get('/:id', movie_controller_1.movieController.getDetails.bind(movie_controller_1.movieController));
exports.default = router;
