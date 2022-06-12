const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
	{
		id: {
			type: String,
			required: true,
		},
		firstname: {
			type: String,
			required: true,
		},
		lastname: {
			type: String,
			required: true,
		},
		body: {
			type: String,
			max: 300,
			required: true,
		},
		img: {
			type: String,
			default: "",
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Comment", PostSchema);
