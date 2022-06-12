const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const router = express.Router();

dotenv.config();

const secret = process.env.SECRET || process.env.LOCAL_SECRET;

router.post("/api/auth/register", async (req, res) => {
	try {
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(req.body.password, salt);
		const newUser = new User({
			firstname: req.body.firstname,
			lastname: req.body.lastname,
			email: req.body.email,
			password: hashedPassword,
		});
		const user = await newUser.save();
		res.status(200).json(user);
	} catch (err) {
		res.status(500).json(err);
	}
});

router.post("/api/auth/login", async (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	let loadedUser;
	try {
		const user = await User.findOne({ email: email });
		if (!user) {
			res.json({
				message: "Please enter a valid email address.",
			});
		}
		loadedUser = user;
		const isEqual = await bcrypt.compare(password, user.password);
		if (!isEqual) {
			res.json({
				message: "Please enter a valid password.",
			});
		}
		const token = jwt.sign(
			{
				email: loadedUser.email,
				userId: loadedUser._id.toString(),
			},
			secret
		);
		res.status(200).json({
			userId: loadedUser._id.toString(),
			token: token,
			message: "",
		});
	} catch (err) {
		res.status(500).json(err);
	}
});

module.exports = router;
