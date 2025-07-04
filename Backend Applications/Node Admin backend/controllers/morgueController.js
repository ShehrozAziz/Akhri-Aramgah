const morgueModel = require("../models/morgueModel");

exports.createMorgue = async (req, res) => {
    try {
        const {
            name,
            description,
            totalCabins,
            totalCabinsinRows,
            source,
            managerName,
            password,
            customID,
        } = req.body;

        // Validation
        if (
            !name ||
            !totalCabins ||
            !description ||
            !totalCabinsinRows ||
            !source ||
            !managerName ||
            !password ||
            !customID
        ) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Call the model to create the graveyard
        const result = await morgueModel.createMorgue({
            name,
            description,
            totalCabins,
            totalCabinsinRows,
            source,
            managerName,
            password,
            customID,
        });

        return res
            .status(201)
            .json({ message: "Morgue created successfully", result });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
