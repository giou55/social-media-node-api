const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const fs = require("fs");

//update user
// URL: http://localhost:8800/api/users/<userId>
router.put("/api/users/:id", async (req, res) => {
	if (req.body.password) {
		try {
			const salt = await bcrypt.genSalt(10);
			req.body.password = await bcrypt.hash(req.body.password, salt);
		} catch (err) {
			return res.status(500).json(err);
		}
	}
	try {
		const user = await User.findById(req.params.id);
		await user.updateOne({ $set: req.body });
		res.status(200).json("Profile has been updated.");
	} catch (err) {
		return res.status(500).json(err);
	}
});

//delete user
// URL: http://localhost:8800/api/users/<userId>
router.delete("/api/users/:id", async (req, res) => {
	try {
		const user = await User.findByIdAndDelete(req.params.id);
		res.status(200).json("Account has been deleted.");
	} catch (err) {
		return res.status(500).json(err);
	}
});

//get all users
// URL: http://localhost:8800/api/users/all
router.get("/api/users/all", async (req, res) => {
	try {
		const users = await User.find();
		res.status(200).json(users);
	} catch (err) {
		return res.status(500).json(err);
	}
});

//get 6 random users 
// URL: http://localhost:8800/api/users/random
router.get("/api/users/random", async (req, res) => {
	try {
		const users = await User.aggregate(
			[ { $sample: { size: 6 } } ]
		 );
		res.status(200).json(users);
	} catch (err) {
		return res.status(500).json(err);
	}
});

//get a user with name or userId
// URL: http://localhost:8800/api/users?firstname=""&lastname=""
// URL: http://localhost:8800/api/users?userId=
router.get("/api/users/", async (req, res) => {
	const userId = req.query.userId;
	const firstname = req.query.firstname;
	const lastname = req.query.lastname;
	try {
		const user = userId
			? await User.findById(userId)
			: await User.findOne({
					firstname: firstname,
					lastname: lastname,
			  });
		const { password, updatedAt, ...other } = user._doc;
		res.status(200).json(other);
	} catch (err) {
		return res.status(500).json(err);
	}
});

//get the friends of a user
// URL: http://localhost:8800/api/users/friends/<userId>
router.get("/api/users/friends/:userId", async (req, res) => {
	try {
		const user = await User.findById(req.params.userId);
		const friends = await Promise.all(
			user.followings.map((friendId) => {
				return User.findById(friendId);
			})
		);
		let friendList = [];
		friends.map((friend) => {
			const { _id, firstname, lastname, profilePicture } = friend;
			friendList.push({ _id, firstname, lastname, profilePicture });
		});
		res.status(200).json(friendList);
	} catch (err) {
		return res.status(500).json(err);
	}
});

//follow a user
// URL: localhost:8800/api/users/<userId>/follow
router.put("/api/users/:id/follow", async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		const currentUser = await User.findById(req.body.userId);
		if (!user.followers.includes(req.body.userId)) {
			await user.updateOne({
				$push: { followers: req.body.userId },
			});
			await currentUser.updateOne({
				$push: { followings: req.params.id },
			});
			res.status(200).json("User has been followed!");
		} else {
			res.status(403).json("You already follow this user.");
		}
	} catch (err) {
		return res.status(500).json(err);
	}
});

//unfollow a user
// URL: localhost:8800/api/users/<userId>/unfollow
router.put("/api/users/:id/unfollow", async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		const currentUser = await User.findById(req.body.userId);
		if (user.followers.includes(req.body.userId)) {
			await user.updateOne({
				$pull: { followers: req.body.userId },
			});
			await currentUser.updateOne({
				$pull: { followings: req.params.id },
			});
			res.status(200).json("User has been unfollowed!");
		} else {
			res.status(403).json("You don't follow this user.");
		}
	} catch (err) {
		return res.status(500).json(err);
	}
});

module.exports = router;
