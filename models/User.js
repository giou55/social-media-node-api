const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
	{
		firstname: {
			type: String,
			required: true,
			min: 3,
			max: 20,
		},
		lastname: {
			type: String,
			required: true,
			min: 3,
			max: 20,
		},
		email: {
			type: String,
			required: true,
			max: 50,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			min: 6,
		},
		profilePicture: {
			type: String,
			default: "",
		},
		coverPicture: {
			type: String,
			default: "",
		},
		followers: {
			type: Array,
			default: [],
		},
		followings: {
			type: Array,
			default: [],
		},
		sex: {
			type: String,
			enum: ["male", "female", "-"],
			default: "-",
		},
		desc: {
			type: String,
			max: 50,
			default: "",
		},
		city: {
			type: String,
			max: 50,
			default: "-",
		},
		birthday: {
			type: String,
			default: "1970-01-01",
		},
		relationship: {
			type: String,
			enum: ["Single", "Married", "Complicated", "-"],
			default: "-",
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
