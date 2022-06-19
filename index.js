const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");

const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const imageRoutes = require("./routes/images");

const path = require("path");
var cors = require("cors");
const User = require("./models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const multer = require("multer");
const s3Storage = require("multer-sharp-s3");
const aws = require("aws-sdk");

dotenv.config();

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKey = process.env.AWS_ACCESS_KEY;
const secretKey = process.env.AWS_SECRET_KEY;

aws.config.update({
	secretAccessKey: secretKey,
	accessKeyId: accessKey,
	region: region,
});


const s3 = new aws.S3();

// single resize without Key
const myStorage = s3Storage({
	s3,
	Bucket: bucketName,
	ACL: "private",
	resize: {
		width: 800,
	},
	max: true,
});

const upload = multer({ storage: myStorage });

const app = express();

app.use(cors());

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Methods",
		"OPTIONS, GET, POST, PUT, PATCH, DELETE"
	);
	res.setHeader("Access-Control-Allow-Headers", "*");
	next();
});

const uri = process.env.MONGODB_URI || process.env.LOCAL_MONGO_URI;

const secret = process.env.SECRET || process.env.LOCAL_SECRET;

mongoose
	.connect(uri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false,
	})
	.then(() => console.log("Database connected!"))
	.catch((err) => console.log(err));

//For this path go to this directory and take static files
app.use("/images", express.static(path.join(__dirname, "public/images")));

// middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.post("/api/upload/posts", upload.single("file"), (req, res, next) => {
	console.log(req.file.key); // Print upload details
	res.status(200).json({ key: req.file.key });
});

const postsStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "public/images/posts");
	},
	filename: (req, file, cb) => {
		cb(null, req.body.name);
	},
});

const usersStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "public/images/users");
	},
	filename: (req, file, cb) => {
		cb(null, req.body.name);
	},
});

const postsUpload = multer({ storage: postsStorage });

const usersUpload = multer({ storage: usersStorage });

app.post(
	"/api/upload/posts-old",
	postsUpload.single("file"),
	async (req, res) => {
		try {
			await sharp(req.file.path).resize({ width: 100 }).toBuffer();
			return res.status(200).json("File uploaded successfully!");
		} catch (err) {
			conlole.log(err);
		}
	}
);

app.post("/api/upload/users", usersUpload.single("file"), (req, res) => {
	try {
		return res.status(200).json("File uploaded successfully!");
	} catch (err) {
		conlole.log(err);
	}
});

app.use(userRoutes);
app.use(authRoutes);
app.use(postRoutes);

function getFileStream(fileKey) {
	const downloadParams = {
		Key: fileKey,
		Bucket: bucketName,
	};
	return s3.getObject(downloadParams).createReadStream();
}

function deleteImage(fileKey) {
	var params = {
		Key: fileKey,
		Bucket: bucketName,
	   };
	s3.deleteObject(params, function(err, data) {
		if (err) console.log(err, err.stack); // an error occurred
		else console.log(data);           // successful response
		/*
		data = {
		}
		*/
	});
}

//gets an image
app.get("/api/s3-images/:key", (req, res) => {
	const key = req.params.key;
	const readStream = getFileStream(key);
	readStream.pipe(res);
});

//deletes an image
app.get("/api/s3-images/delete/:key", (req, res) => {
	const key = req.params.key;
	console.log("Image Key: " + key);
	deleteImage(key);
});

app.get("/", (req, res) => {
	try {
		return res.send("My Node API works successfully!");
	} catch (err) {
		conlole.log(err);
	}
});

let port = process.env.PORT;
if (port == null || port == "") {
	port = 8800;
}

app.listen(port, () => console.log(`Listening on ${port}`));
