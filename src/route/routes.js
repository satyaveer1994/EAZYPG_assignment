const express = require('express');
const router = express.Router();

const userController = require("../controller/userController")
const blogController = require("../controller/blogController")
const commentController = require("../controller/commentController")


const middleware = require("../middelwears/auth")


// user
router.post("api/signup",userController.registration);
router.post("/api/login",userController.loginUser);
router.get("/api/users/:id",middleware.authentication,userController.getProfile)



// blog
router.get("/api/posts:",middleware.authentication,blogController.getAllBlogs);
router.get("/api/posts/:id",middleware.authentication,blogController.getBlogById)
router.post("/api/posts",middleware.authentication,blogController.createBlog);
router.put("api/posts/:id",middleware.authentication,blogController.updateBlog);
router.delete("api/posts/:id",middleware.authentication,blogController.deleted);

// like

router.post("/api/like",blogController.likeBlog);
router.post("/api/unlike",blogController.unlikeBlog)



// comment
router.post("/api/comments",commentController.createComment);
router.put("/api/comments/:id",commentController.updateComment);
router.delete(" /api/comments/:id",commentController.deleteComment);

module.exports = router