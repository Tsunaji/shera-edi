if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load();
}

const
    express = require('express')
    , router = express.Router()

    , multer = require('multer')
    , inMemoryStorage = multer.memoryStorage()
    , uploadStrategy = multer({ storage: inMemoryStorage }).single('image')

    , azureStorage = require('azure-storage')
    , blobService = azureStorage.createBlobService()

    , getStream = require('into-stream')
    , containerName = 'edi-ordering-files'
    ;

const handleError = (err, res) => {
    res.status(500);
    res.render('error', { error: err });
};

const getBlobName = originalName => {
    const identifier = Math.random().toString().replace(/0\./, ''); // remove "0." from start of string
    return `${identifier}_${originalName}`;
};

router.post('/', uploadStrategy, (req, res) => {

    const
        blobName = getBlobName(req.file.originalname)
        , stream = getStream(req.file.buffer)
        , streamLength = req.file.buffer.length
        ;

    blobService.createBlockBlobFromStream(containerName, blobName, stream, streamLength, err => {

        if (err) {
            handleError(err);
            return;
        }

        res.render('success', {
            message: 'ไฟล์ได้ถูกอัพโหลดไปที่ระบบเรียบร้อยแล้ว'
        });
    });
});

module.exports = router;