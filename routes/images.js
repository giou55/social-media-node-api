const router = require("express").Router();

function getFileStream(fileKey) {
	const downloadParams = {
		Key: fileKey,
		Bucket: bucketName,
	};

	return s3.getObject(downloadParams).createReadStream();
}

//get an image
router.get("/s3-images/:key", (req, res) => {
	const key = req.params.key;
	const readStream = getFileStream(key);

	readStream.pipe(res);
});

module.exports = router;