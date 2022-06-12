const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const router = require("express").Router();

//create a post
//URL: http://localhost:8800/api/posts
router.post("/api/posts", async (req, res) => {
	const newPost = new Post(req.body);
	try {
		const savedPost = await newPost.save();
		res.status(200).json(savedPost);
	} catch (err) {
		return res.status(500).json(err);
	}
});

//update a post
//URL: http://localhost:8800/api/posts/<postId>
router.put("/api/posts/:id", async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		await post.updateOne({ $set: req.body });
		res.status(200).json("Post has been updated!");
	} catch (err) {
		return res.status(500).json(err);
	}
});

//delete a post
//URL: http://localhost:8800/api/posts/<postId>
router.delete("/api/posts/:id", async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		await post.deleteOne();
		res.status(200).json("Post has been deleted!");
	} catch (err) {
		return res.status(500).json(err);
	}
});

//like and unlike a post
//URL: http://localhost:8800/api/posts/<postId>/like
router.put("/api/posts/:id/like", async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post.likes.includes(req.body.userId)) {
			await post.updateOne({
				$push: { likes: req.body.userId },
			});
			res.status(200).json("Post has been liked!");
		} else {
			await post.updateOne({
				$pull: { likes: req.body.userId },
			});
			res.status(200).json("Post has been unliked!");
		}
	} catch (err) {
		return res.status(500).json(err);
	}
});

//get a post
//URL: http://localhost:8800/api/posts/<postId>
router.get("/api/posts/:id", async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		res.status(200).json(post);
	} catch (err) {
		return res.status(500).json(err);
	}
});

//get timeline posts (user posts and his friends posts)
//URL: http://localhost:8800/api/posts/timeline/<userId>
router.get("/api/posts/timeline/:userId", async (req, res) => {
	try {
		const currentUser = await User.findById(req.params.userId);
		const userPosts = await Post.find({ userId: currentUser._id });
		const friendPosts = await Promise.all(
			currentUser.followings.map((friendId) => {
				return Post.find({ userId: friendId });
			})
		);
		res.status(200).json(userPosts.concat(...friendPosts));
	} catch (err) {
		return res.status(500).json(err);
	}
});

//get posts of a user
//URL: http://localhost:8800/api/posts/profile/<userId>
router.get("/api/posts/profile/:userId", async (req, res) => {
	try {
		const posts = await Post.find({ userId: req.params.userId });
		res.status(200).json(posts);
	} catch (err) {
		return res.status(500).json(err);
	}
});

//add a comment
// URL: http://localhost:8800/api/posts/<postId>/comment
router.put("/api/posts/:id/comment", async (req, res) => {
	try {
		const newComment = new Comment({
			id: req.body.id,
			firstname: req.body.firstname,
			lastname: req.body.lastname,
			body: req.body.body,
			img: req.body.img,
		});
		const comment = await newComment.save();
		const post = await Post.findById(req.params.id);
		await post.updateOne({
			$push: { comments: comment.id },
		});
		res.status(200).json("Comment has been added!");
	} catch (err) {
		return res.status(500).json(err);
	}
});

//get comments
// URL: http://localhost:8800/api/posts/comments/<postId>
router.get("/api/posts/comments/:id", async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		const comments = await Promise.all(
			post.comments.map((commentId) => {
				return Comment.findOne({
					id: commentId,
				});
				// return Comment.findById(commentId);
			})
		);
		let commentList = [];
		comments.map((comment) => {
			const { _id, id, firstname, lastname, body, img } = comment;
			commentList.push({ _id, id, firstname, lastname, body, img });
		});
		res.status(200).json(commentList);
	} catch (err) {
		return res.status(500).json(err);
	}
});

//delete a comment
// URL: http://localhost:8800/api/comments/<commentId>/<postId>
router.delete("/api/comments/:id/:postId", async (req, res) => {
	try {
		const comment = await Comment.findById(req.params.id);
		await comment.deleteOne();
		const post = await Post.findById(req.params.postId);
		res.status(200).json("Comment has been deleted!");
	} catch (err) {
		return res.status(500).json(err);
	}
});

module.exports = router;
