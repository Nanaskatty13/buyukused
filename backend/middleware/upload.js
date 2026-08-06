const multer = require("multer");


// ==========================
// Storage Configuration
// ==========================
// Store files in memory before uploading to Cloudinary

const storage = multer.memoryStorage();



// ==========================
// File Filter
// ==========================
const fileFilter = (req, file, cb) => {


    const allowedTypes = [

        "image/jpeg",

        "image/jpg",

        "image/png",

        "image/webp"

    ];



    if(allowedTypes.includes(file.mimetype)){

        cb(null, true);

    }else{

        cb(
            new Error(
                "Only JPG, JPEG, PNG and WEBP images are allowed"
            ),
            false
        );

    }

};



// ==========================
// Multer Upload
// ==========================
const upload = multer({

    storage,

    fileFilter,

    limits: {

        fileSize: 5 * 1024 * 1024 // 5MB per image

    }

});



module.exports = upload;