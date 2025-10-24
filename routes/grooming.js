import express from "express";
import Grooming from "../models/Grooming.js";
import Trainer from "../models/Trainer.js";
import mongoose from "mongoose";

const router = express.Router();

/**
 * @route   POST /api/groomings
 * @desc    Add new grooming session and update trainer's groomingTaken
 */
router.post("/", async (req, res) => {
  try {
    const {
      companyName,
      dateOfRequirement,
      dateOfInterview,
      skills,
      trainerNames = [],
      subject,
      subjectTrainerName,
      groomingDays,
      mode,
      totalStudents,
      attendedStudents,
      placedStudents = [],
      rejectedStudents = [],
      reasons = [],
      dealName,
      targetGivenByDt,
      position,
      noOfStudentsSchedule,
      addedByHR,
      scheduleUpdateInSoftware,
      scheduleReceiveDateFromDt,
      interviewRounds = [],
    } = req.body;

    // 🔹 Combine trainer + subject trainer names (avoid duplicates)
    const allTrainerNames = [
      ...new Set([...trainerNames, subjectTrainerName].filter(Boolean)),
    ];

    // 🔹 Find all trainers
    const trainers = await Trainer.find({ name: { $in: allTrainerNames } });
    if (!trainers.length)
      return res.status(400).json({ msg: "No matching trainers found." });

    const trainerIds = trainers.map((t) => new mongoose.Types.ObjectId(t._id));

    // 🔹 Find subject trainer (optional)
    const subjectTrainer = trainers.find(
      (t) => t.name === subjectTrainerName
    )?._id || null;

    // 🔹 Prevent duplicate grooming for same deal + trainer
    const existingGroomings = await Grooming.find({
      dealName,
      trainers: { $in: trainerIds },
    });
    if (existingGroomings.length)
      return res.status(400).json({
        msg: `Grooming for deal '${dealName}' already exists for one or more selected trainers.`,
      });

    // 🔹 Create grooming document
    const grooming = new Grooming({
      companyName,
      dateOfRequirement,
      dateOfInterview,
      skills,
      trainers: trainerIds,
      subject,
      subjectTrainer,
      groomingDays,
      mode: mode || "Not Scheduled",
      totalStudents,
      attendedStudents,
      placedStudents,
      rejectedStudents,
      reasons,
      dealName,
      targetGivenByDt,
      position,
      noOfStudentsSchedule,
      addedByHR,
      scheduleUpdateInSoftware,
      scheduleReceiveDateFromDt,
      interviewRounds,
    });

    await grooming.save();
    const populated = await grooming.populate(["trainers", "subjectTrainer"]);

    // 🔹 Update groomingTaken for trainers
    const monthStr = new Date(grooming.dateOfRequirement).toLocaleString(
      "default",
      { month: "long", year: "numeric" }
    );

    for (const trainerId of trainerIds) {
      await Trainer.updateOne(
        { _id: trainerId, "groomingTaken.groomingId": { $ne: grooming._id } },
        {
          $push: {
            groomingTaken: {
              groomingId: grooming._id,
              month: monthStr,
              companyName: grooming.companyName,
              subject: grooming.subject,
              dealName,
            },
          },
        }
      );
    }

    res
      .status(201)
      .json({ msg: "Grooming session added successfully", grooming: populated });
  } catch (err) {
    console.error("❌ Error adding grooming:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/**
 * @route   GET /api/groomings
 */
router.get("/", async (req, res) => {
  try {
    const groomings = await Grooming.find().populate([
      "trainers",
      "subjectTrainer",
    ]);
    res.json(groomings);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/**
 * @route   GET /api/groomings/search
 */
router.get("/search", async (req, res) => {
  try {
    const query = { ...req.query };

    if (query.trainerName) {
      const trainers = await Trainer.find({
        name: new RegExp(query.trainerName, "i"),
      });
      query.trainers = { $in: trainers.map((t) => t._id) };
      delete query.trainerName;
    }

    if (query.subjectTrainerName) {
      const subjectTrainer = await Trainer.findOne({
        name: new RegExp(query.subjectTrainerName, "i"),
      });
      if (subjectTrainer) query.subjectTrainer = subjectTrainer._id;
      delete query.subjectTrainerName;
    }

    for (const key in query) {
      if (typeof query[key] === "string") query[key] = new RegExp(query[key], "i");
    }

    const groomings = await Grooming.find(query).populate([
      "trainers",
      "subjectTrainer",
    ]);
    if (!groomings.length)
      return res.status(404).json({ msg: "No matching grooming sessions found" });

    res.json(groomings);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/**
 * @route   GET /api/groomings/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const grooming = await Grooming.findById(req.params.id).populate([
      "trainers",
      "subjectTrainer",
    ]);
    if (!grooming)
      return res.status(404).json({ msg: "Grooming session not found" });
    res.json(grooming);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});
/**
 * @route   PUT /api/groomings/:id
 * @desc    Update grooming and fully re-sync trainer groomingTaken
 */
router.put("/:id", async (req, res) => {
  try {
    const {
      companyName,
      dateOfRequirement,
      dateOfInterview,
      skills,
      trainerNames = [],
      subject,
      subjectTrainerName,
      groomingDays,
      mode,
      totalStudents,
      attendedStudents,
      placedStudents = [],
      rejectedStudents = [],
      reasons = [],
      dealName,
      targetGivenByDt,
      position,
      noOfStudentsSchedule,
      addedByHR,
      scheduleUpdateInSoftware,
      scheduleReceiveDateFromDt,
      interviewRounds = [],
    } = req.body;


    // console.log(subjectTrainerName);
    
    // 🔹 Find existing grooming
    const oldGrooming = await Grooming.findById(req.params.id);
    if (!oldGrooming)
      return res.status(404).json({ msg: "Grooming session not found" });


    // not checked  the comments 
    // // 🔹 Combine trainers + subject trainer (avoid duplicates)
    const allTrainerNames = [
      ...new Set([...trainerNames].filter(Boolean)),
    ];

    
    // 🔹 Find trainer documents
    const trainers = await Trainer.find({ name: { $in: allTrainerNames } });
    const subTrai=await Trainer.find({})
    const trainerIds = trainers.map((t) => t._id);
    const subjectTrainer = subTrai.find((t)=>t.name==subjectTrainerName)
    // subjectTrainerName.split(",").map((t) => t.name?._id || null);
    console.log(subjectTrainer);
    
    // console.log(subjectTrainer);
    // 🔹 Remove groomingTaken from all old trainers (including old subject trainer)
    const oldTrainerIds = [
      ...new Set([
        ...oldGrooming.trainers.map((t) => t.toString()),
        oldGrooming.subjectTrainer?.toString(),
      ].filter(Boolean)),
    ];

    if (oldTrainerIds.length > 0) {
      await Trainer.updateMany(
        { _id: { $in: oldTrainerIds } },
        { $pull: { groomingTaken: { groomingId: oldGrooming._id } } }
      );
    }

    // 🔹 Update grooming document with fresh trainer list
    oldGrooming.companyName = companyName;
    oldGrooming.dateOfRequirement = dateOfRequirement;
    oldGrooming.dateOfInterview = dateOfInterview;
    oldGrooming.skills = skills;
    oldGrooming.trainers = trainerIds;
    oldGrooming.subject = subject;
    oldGrooming.subjectTrainer = subjectTrainer;
    oldGrooming.groomingDays = groomingDays;
    oldGrooming.mode = mode || "Not Scheduled";
    oldGrooming.totalStudents = totalStudents;
    oldGrooming.attendedStudents = attendedStudents;
    oldGrooming.placedStudents = placedStudents;
    oldGrooming.rejectedStudents = rejectedStudents;
    oldGrooming.reasons = reasons;
    oldGrooming.dealName = dealName;
    oldGrooming.targetGivenByDt = targetGivenByDt;
    oldGrooming.position = position;
    oldGrooming.noOfStudentsSchedule = noOfStudentsSchedule;
    oldGrooming.addedByHR = addedByHR;
    oldGrooming.scheduleUpdateInSoftware = scheduleUpdateInSoftware;
    oldGrooming.scheduleReceiveDateFromDt = scheduleReceiveDateFromDt;
    oldGrooming.interviewRounds = interviewRounds;

    await oldGrooming.save();

    // 🔹 Add fresh groomingTaken to all new trainers
    if (trainerIds.length > 0) {
      const monthStr = new Date(oldGrooming.dateOfRequirement).toLocaleString(
        "default",
        { month: "long", year: "numeric" }
      );

      for (const trainerId of trainerIds) {
        await Trainer.updateOne(
          { _id: trainerId, "groomingTaken.groomingId": { $ne: oldGrooming._id } },
          {
            $push: {
              groomingTaken: {
                groomingId: oldGrooming._id,
                month: monthStr,
                companyName: oldGrooming.companyName,
                subject: oldGrooming.subject,
                dealName: oldGrooming.dealName,
              },
            },
          }
        );
      }
    }

    const grooming = await Grooming.findById(oldGrooming._id).populate([
      "trainers",
      "subjectTrainer",
    ]);

    res.json({ msg: "Grooming session updated successfully and trainers synced", grooming });
  } catch (err) {
    console.error("❌ Error updating grooming:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/**
 * @route   DELETE /api/groomings/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    const grooming = await Grooming.findByIdAndDelete(req.params.id);
    if (!grooming)
      return res.status(404).json({ msg: "Grooming session not found" });

    // 🔹 Remove groomingTaken from trainers + subjectTrainer
    const trainerIds = [
      ...new Set([
        ...grooming.trainers.map((t) => t._id || t),
        grooming.subjectTrainer,
      ].filter(Boolean)),
    ];

    await Trainer.updateMany(
      { _id: { $in: trainerIds } },
      { $pull: { groomingTaken: { groomingId: grooming._id } } }
    );

    res.json({ msg: "Grooming session deleted successfully", grooming });
  } catch (err) {
    console.error("❌ Error deleting grooming:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

export default router;
