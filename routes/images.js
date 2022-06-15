const router = require("express").Router();

function getFileStream(fileKey) {
	const downloadParams = {
		Key: fileKey,
		Bucket: bucketName,
	};

	return s3.getObject(downloadParams).createReadStream();
}

function deleteImage(fileKey) {
	console.log("aaaaa");
	// var params = {
	// 	Key: fileKey,
	// 	Bucket: bucketName,
	//    };
	// s3.deleteObject(params, function(err, data) {
	// 	if (err) console.log(err, err.stack); // an error occurred
	// 	else     console.log(data);           // successful response
	// 	/*
	// 	data = {
	// 	}
	// 	*/
	// });
}

//get an image
router.get("/s3-images/:key", (req, res) => {
	const key = req.params.key;
	const readStream = getFileStream(key);

	readStream.pipe(res);
});

//delete an image
router.get("/s3-images/delete/:key", (req, res) => {
	console.log("aaaaa");
	// try {
	// 	const key = req.params.key;
	// 	deleteImage(key);
	// 	res.status(200).json("Image has been deleted!");
	// } catch (err) {
	// 	return res.status(500).json(err);
	// }
});

module.exports = router;