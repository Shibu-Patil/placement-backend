import express from "express";
import Trainer from "../models/Trainer.js";

const router = express.Router();

/**
 * @route   POST /api/trainers
 * @desc    Add a new trainer
 */
router.post("/", async (req, res) => {
  try {
    const { name, subject } = req.body;

    const trainer = new Trainer({ name, subject });
    await trainer.save();

    res.status(201).json({ msg: "Trainer added successfully", trainer });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/**
 * @route   GET /api/trainers
 * @desc    Get all trainers
 */
router.get("/", async (req, res) => {
  try {
    const trainers = await Trainer.find();
    res.json(trainers);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/**
 * @route   PUT /api/trainers/:id
 * @desc    Update trainer by ID
 */
router.put("/:id", async (req, res) => {
  try {
    const { name, subject } = req.body;

    const trainer = await Trainer.findByIdAndUpdate(
      req.params.id,
      { name, subject },
      { new: true }
    );

    if (!trainer) return res.status(404).json({ msg: "Trainer not found" });

    res.json({ msg: "Trainer updated successfully", trainer });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/**
 * @route   DELETE /api/trainers/:id
 * @desc    Delete trainer by ID
 */
router.delete("/:id", async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndDelete(req.params.id);
    if (!trainer) return res.status(404).json({ msg: "Trainer not found" });

    res.json({ msg: "Trainer deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

export default router;
