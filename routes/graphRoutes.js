// routes/graph.js
import express from "express";
import Grooming from "../models/Grooming.js";

const router = express.Router();

/**
 * @route   GET /api/graph
 * @desc    Get overall stats, month-wise aggregation, and optional filtering
 */
router.get("/", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const query = startDate || endDate ? { dateOfRequirement: dateFilter } : {};

    const groomings = await Grooming.find(query);

    // Overall stats
    const totalRequirements = groomings.length;
    const totalCompanies = new Set(groomings.map((g) => g.companyName)).size;
    const totalPlaced = groomings.reduce(
      (acc, g) => acc + Number(g.placedStudents?.[0] || 0),
      0
    );
    const totalRejected = groomings.reduce(
      (acc, g) => acc + Number(g.rejectedStudents?.[0] || 0),
      0
    );
    const totalAttended = groomings.reduce(
      (acc, g) => acc + Number(g.attendedStudents || 0),
      0
    );
    const totalGroomingsDone = groomings.filter((g) => g.dateOfInterview).length;

    // Month-wise aggregation
    const monthData = {}; // { "2025-10": { requirements: X, groomingsDone: Y, placed: Z, rejected: W, attended: V } }

    groomings.forEach((g) => {
      if (!g.dateOfRequirement) return;
      const monthKey = g.dateOfRequirement.toISOString().slice(0, 7); // YYYY-MM
      if (!monthData[monthKey])
        monthData[monthKey] = {
          requirements: 0,
          groomingsDone: 0,
          placed: 0,
          rejected: 0,
          attended: 0,
        };

      monthData[monthKey].requirements += 1;
      if (g.dateOfInterview) monthData[monthKey].groomingsDone += 1;
      monthData[monthKey].placed += Number(g.placedStudents?.[0] || 0);
      monthData[monthKey].rejected += Number(g.rejectedStudents?.[0] || 0);
      monthData[monthKey].attended += Number(g.attendedStudents || 0);
    });

    res.json({
      overall: {
        totalRequirements,
        totalGroomingsDone,
        totalCompanies,
        totalPlaced,
        totalRejected,
        totalAttended,
      },
      monthWise: monthData,
      allGroomings: groomings,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

export default router;
