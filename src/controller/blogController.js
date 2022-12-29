const blogModel = require("../models/blogModel");
const userModel = require("../models/userModel")





const createBlog = async function (req, res) {
    try {
      let data = req.body;
      let userId = req.body.userId;
    //  let category = req.body.category;
      let 
      // checking if data is empty
      if (Object.keys(data) == 0)
        // returning 400 {bad request data is empty}
        return res
          .status(400)
          .send({ status: false, msg: "Bad request. Content to post missing" });
      const { title, body,  category } = data;
  
      let idMatch = await userModel.findById(userId);
      // userId match in author model, if not
      if (!idMatch)
        // returning error with 404 user input does not match
        return res
          .status(404)
          .send({ status: false, msg: "No such author present in the database" });
  
      let savedData = await blogModel.create(data);
  
      //creating entry in db with status 201 success!
      return res.status(201).send({ status: true, msg: savedData });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ msg: error.message });
    }
  };
  
  const getAllBlogs = async function (req, res) {
    try {
      const data = req.query;
      if (Object.keys(data) == 0)
        return res.status(400).send({ status: false, msg: "No input provided" });
  
      const blogs = await blogModel.find({
        $and: [data, { isDeleted: false }, { isPublished: true }],
      }).populate("userId");
      if (blogs.length == 0)
        return res
          .status(404)
          .send({ status: false, msg: "No blogs Available." });
      return res
        .status(200)
        .send({ status: true, count: blogs.length, data: blogs });
    } catch (error) {
      return res.status(500).send({ status: false, msg: error.message });
    }
  };





  const getBlogById = async (req, res) => {

    try {
        const blog_Id = req.params.blog_Id

        if (!isValidObjectId(id)) {
            res.status(400).send({ status: false, message: `${blog_Id} is not a valid blog id ` })
            return
        }

        const isPresent = await blogModel.findById({ _id: blog_Id })

        if (!isPresent) return res.status(404).send({ status: false, message: "blog not found" })

        const blog = await blogModel.findOne({ _id: blog_Id, isDeleted: false }).select({ isDeleted: 0 })

        if (!blog) return res.status(400).send({ status: false, message: "blog is deleted" })

        const reviews = await reviewModel.find({ blog_Id: blog_Id, isDeleted: false }).select({ blog_Id: 1,  Comment: 1 })

        const newBlog = JSON.parse(JSON.stringify(blog))
        newBlog.commentsData = [...comment]

        return res.status(200).send({ status: true, message: "Success", data: newBlog })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}
    


  
  const updateBlog = async function (req, res) {
    try {
      //Validate: The blog_Id is present in request path params or not.
      let blog_Id = req.params.blog_Id;
      if (!blog_Id)
        return res
          .status(400)
          .send({ status: false, msg: "Blog Id is required" });
  
      //Validate: The blog_Id is valid or not.
      let blog = await blogModel.findById(blog_Id);
      if (!blog)
        return res
          .status(404)
          .send({ status: false, msg: "Blog does not exists" });
  
      //Validate: If the blog_Id exists (must have isDeleted false)
      let is_Deleted = blog.isDeleted;
      if (is_Deleted == true)
        return res
          .status(404)
          .send({ status: false, msg: "Blog is already deleted" });
  
      //Updates a blog by changing the its title, body, adding tags, adding a subcategory.
      let Title = req.body.title;
      let Body = req.body.body;
      let updatedBlog = await blogModel.findOneAndUpdate(
        { _id: blog_Id },
        {
          $set: {
            title: Title,
            body: Body,
            createdAt: new Date(),
          },
        },
        { new: true }
      );
      //Sending the updated response
      return res.status(200).send({ status: true, data: updatedBlog });
    } catch (err) {
      console.log("This is the error :", err.message);
      return res
        .status(500)
        .send({ status: false, msg: " Server Error", error: err.message });
    }
  };
  
  const deleted = async function (req, res) {
    try {
      //Validate: The blog_Id is present in request path params or not.
      let blog_Id = req.params.blog_Id;
      if (!blog_Id)
        return res
          .status(400)
          .send({ status: false, msg: "Blog Id is required" });
  
      //Validate: The blog_Id is valid or not.
      let blog = await blogModel.findById(blog_Id);
      if (!blog)
        return res
          .status(404)
          .send({ status: false, msg: "Blog does not exists" });
  
      //Validate: If the blog_Id is not deleted (must have isDeleted false)
      let is_Deleted = blog.isDeleted;
      if (is_Deleted == true)
        return res
          .status(404)
          .send({ status: false, msg: "Blog is already deleted" });
  
      //Delete a blog by changing the its isDeleted to true.
      let deletedBlog = await blogModel.findOneAndUpdate(
        { _id: blog_Id },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true }
      );
      //Sending the Deleted response after updating isDeleted : true
      return res.status(200).send({ status: true, data: deletedBlog });
    } catch (err) {
      console.log("This is the error :", err.message);
      return res
        .status(500)
        .send({ status: false, msg: " Server Error", error: err.message });
    }
  };
  

  

  const likeBlog = async function(req,res){
    try {
              const blog = await blogModel.findById(req.params.blog_Id);
              const user = req.user;
          
              if (!blog) {
                return res.status(404).json({
                  status: "fail",
                  message: "Blog Does not Exist",
                });
              }
          
              const blogLikes = [...blog.likes];
          
              const checkUser = blogLikes.findIndex((likedUserId) =>
                likedUserId.equals(user._id)
              );
          
              if (checkUser !== -1) {
                return res.status(400).json({
                  status: "fail",
                  message: "You have already liked this blog",
                });
              }
          
              blogLikes.push(user._id);
          
              const likedBlog = await blogModel.findByIdAndUpdate(
                req.params.blog_Id,
                { likes: blogLikes },
                { new: true }
              );
          
              return res.status(200).json({
                status: "success",
                data: {
                  likes: blogLikes.length,
                  likedBlog,
                },
              });
            } catch (err) {
              res.status(400).json({
                status: "fail",
                message: err.message,
              });
            }
          };
  
const unlikeBlog = async function(req,res){
    try {
        const blog = await blogModel.findById(req.params.blog_Id);
        const user = req.user;
    
        if (!blog) {
          return res.status(404).json({
            status: "fail",
            message: "Blog Does not Exist",
          });
        }
    
        if (!blog.likes || !blog.likes.length) {
          return res.status(404).json({
            status: "fail",
            message: "This blog has no likes",
          });
        }
    
        const blogLikes = [...blog.likes];
    
        const checkUser = blogLikes.findIndex((likedUserId) =>
          likedUserId.equals(user._id)
        );
    
        if (checkUser === -1) {
          return res.status(400).json({
            status: "fail",
            message: "You have not liked this blog.",
          });
        }
    
        blogLikes.splice(checkUser, 1);
    
        const unlikedBlog = await blogModel.findByIdAndUpdate(
          req.params.blog_Id,
          { likes: blogLikes },
          { new: true }
        );
    
        return res.status(200).json({
          status: "success",
          data: {
            likes: blogLikes.length,
            unlikedBlog,
          },
        });
      } catch (err) {
        res.status(400).json({
          status: "fail",
          message: err.message,
        });
      }
    };


  module.exports.createBlog = createBlog;
  module.exports.updateBlog = updateBlog;
  module.exports.deleted = deleted;
  module.exports.getAllBlogs = getAllBlogs;
  module.exports.getBlogById=getBlogById

module.exports.likeBlog =likeBlog;
module.exports.unlikeBlog=unlikeBlog
