const blogModel = require("../models/blogModel");
const commentModel = require("../models/commentModel");

const createComment = async (req, res) => {
  try {
    const data = req.body;
    if (Object.keys(data).length === 0) {
      return res
        .status(400)
        .send({ status: false, message: "please fill all required feilds" });
    }
    const { blog_Id } = req.params;
    if (!isValidObjectId(blog_Id)) {
      return res
        .status(400)
        .send({ status: false, message: "please give valid blog id" });
    }
    const blog = await blogModel.findById(blog_Id);
    if (!blog) {
      return res.status(404).send({ status: false, message: "blog not found" });
    }
    if (blog.isDeleted == true) {
      return res
        .status(400)
        .send({ status: false, message: "blog is deleted" });
    }

    data.blog_Id = blog_Id;
    const comment = await commentModel.create(data);
    await blogModel.findByIdAndUpdate(
      { _id: blog_Id },
      { $inc: { comment: 1 } }
    );
    return res
      .status(201)
      .send({ status: true, message: "success", data: comment });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const updateComment = async (req, res) => {
  try {
    let data = req.body;
    let blog_Id = req.params.blog_Id;
    let comment_Id = req.params.comment_Id;

    if (!isValidObjectId(blog_Id)) {
      return res
        .status(400)
        .send({ status: false, message: "please give valid blog id" });
    }
    if (!isValidObjectId(comment_Id)) {
      return res
        .status(400)
        .send({ status: false, message: "please give valid blog id" });
    }
    if (!Object.keys(data).length > 0)
      return res
        .status(400)
        .send({ status: false, message: "Please enter data for updation" });

    const blogPresent = await blogModel.findById({ _id: blog_Id });

    if (!blogPresent)
      return res.status(404).send({ status: false, message: "blog not found" });

    if (blogPresent.isDeleted == true)
      return res
        .status(400)
        .send({ status: false, message: "blog is Deleted" });

    const comment = await commentModel.findById({ _id: comment_Id });

    if (!comment)
      return res
        .status(404)
        .send({ status: false, message: "comment not found" });

    if (comment.isDeleted == true)
      return res
        .status(400)
        .send({ status: false, message: "comment is deleted" });

    const update = await commentModel.findOneAndUpdate(
      { comment_Id: comment_Id },
      { $set: data },
      { new: true }
    );

    const totalblogcomment = await commentModel
      .find({ blog_Id: blog_Id, isDeleted: false })
      .select({
        blog_Id: 1,
        comment: 1,
      });

    const newBlog = JSON.parse(JSON.stringify(blogPresent));
    newBlog.commentsData = [...totalblogcomment];

    return res
      .status(200)
      .send({ status: true, message: "blog list", data: newBlog });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { comment_Id, blog_Id } = req.params;
    if (!isValidObjectId(blog_Id)) {
      return res
        .status(400)
        .send({ status: false, message: "please give valid blog id" });
    }
    if (!isValidObjectId(comment_Id)) {
      return res
        .status(400)
        .send({ status: false, message: "please give valid comment id" });
    }
    const blog = await blogModel.findById(blog_Id);
    if (!blog) {
      return res.status(404).send({ status: false, message: "blog not found" });
    }
    if (blog.isDeleted == true) {
      return res
        .status(400)
        .send({ status: false, message: "blog already deleted" });
    }
    const comment = await commentModel.findById(comment_Id);
    if (!comment) {
      return res
        .status(404)
        .send({ status: false, message: "comment not found" });
    }
    if (comment.isDeleted == true) {
      return res
        .status(400)
        .send({ status: false, message: "comment already deleted" });
    }
    if (blog_Id != comment.blog_Id) {
      return res
        .status(400)
        .send({ status: false, message: "comment not found for this blog" });
    }
    const delcomment = await commentModel.findByIdAndUpdate(
      comment_Id,
      { isDeleted: true },
      { new: true }
    );
    await blogModel.findByIdAndUpdate(
      { blog_Id: blog_Id },
      { $inc: { comments: -1 } }
    );
    return res.status(200).send({ status: true, data: delcomment });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { createComment, updateComment, deleteComment };
