import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadonCloudinary = async (localFilePath) => {
    try{
     if(!localFilePath) return null ; 
    const response = await cloudinary.uploader.upload(localFilePath , {
        resource_type : 'auto'
    })
    // console.log(response.url);
    fs.unlinkSync(localFilePath); // delete the local file after successful upload
    return response;
    }
    catch(error){
        if (localFilePath) {
            try {
             fs.unlinkSync(localFilePath); // delete the local file after upload 
             // attempt
            } catch (cleanupError) {
                console.error("Cloudinary cleanup failed:", cleanupError.message);
            }
        }
        console.error("Cloudinary upload failed:", error.message);
       return null;
    }

}

const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    if (!publicId) return null;
    try {
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        return response;
    } catch (error) {
        console.error('Cloudinary deletion failed:', error.message);
        return null;
    }
}

export {uploadonCloudinary , deleteFromCloudinary}



