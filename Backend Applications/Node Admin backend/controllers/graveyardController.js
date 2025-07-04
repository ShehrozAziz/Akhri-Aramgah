const graveyardModel = require("../models/graveyardModel");
const cloudinary = require("../cloudinaryConfig");
const multer = require("multer");
const path = require("path");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Temporary storage
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    // Accept only images
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
}).single("graveyardImage"); // Name of the file field in the form

exports.createGraveyard = async (req, res) => {
  // Handle file upload with multer
  upload(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Multer error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      // Extract form data from request body
      const {
        name,
        description,
        totalGraves,
        totalRows,
        totalCols,
        sourcePin,
        gorkanName,
        password,
        customID,
      } = req.body;

      // Validation
      if (
        !name ||
        !totalGraves ||
        !totalRows ||
        !totalCols ||
        !sourcePin ||
        !gorkanName ||
        !password ||
        !customID ||
        !req.file
      ) {
        return res
          .status(400)
          .json({ error: "All fields are required including image" });
      }
      let cloudinaryResult;
      const filePath = path.resolve(req.file.path); // Convert to absolute path
      try {
        console.log("Uploading file to Cloudinary:", req.file.path);

        cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
          folder: "graveyards",
        });

        console.log("Cloudinary Upload Success:", cloudinaryResult.secure_url);
      } catch (error) {
        console.log("Cloudinary Upload Error:", error);
        return res
          .status(500)
          .json({ error: "Image upload failed", details: error.message });
      }
      console.log("lmao");
      console.log(
        name +
          " " +
          description +
          " " +
          totalGraves +
          " " +
          totalRows +
          " " +
          totalCols +
          " " +
          sourcePin +
          " " +
          gorkanName +
          " " +
          password +
          " " +
          customID +
          " " +
          cloudinaryResult.secure_url
      );
      // Call the model to create the graveyard with image URL
      const result = await graveyardModel.createGraveyard({
        name,
        description,
        totalGraves,
        totalRows,
        totalCols,
        sourcePin,
        gorkanName,
        password,
        customID,
        imageUrl: cloudinaryResult.secure_url, // Store the Cloudinary URL
      });

      return res
        .status(201)
        .json({ message: "Graveyard created successfully", result });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ error: error.message });
    }
  });
};
