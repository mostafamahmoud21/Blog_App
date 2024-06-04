const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const uploadOptions = {
    overwrite: true,
    invalidate: true,
    resource_type: "auto",
};

module.exports.uploadimage = (image) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(image, uploadOptions, (error, result) => {
            if (result && result.secure_url) {
                return resolve(result.secure_url);
            }
            return reject({ message: error.message });
        });
    });
}

module.exports.deleteimage = (imageUrl) => {
    return new Promise((resolve, reject) => {
        const publicId = getImagePublicId(imageUrl);
        if (!publicId) {
            return reject({ message: "Invalid image URL" });
        }
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (result && result.result === 'ok') {
                console.log("Deleted img success")
                return resolve({ message: "Image deleted successfully" });
            }
            return reject({ message: error.message });
        });
    });
}

function getImagePublicId(imageUrl) {
    const parts = imageUrl.split('/');
    const fileName = parts[parts.length - 1];
    const publicId = fileName.split('.')[0];
    return publicId;
}