import mongoose from "mongoose";

const groomingSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  dateOfRequirement: {
    type: Date,
    required: true,
  },
  dateOfInterview: {
    type: Date, // optional at creation
  },
  skills: {
    type: [String],
    required: true,
  },
  trainers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
    }
  ],
  subject: {
    type: String,
  },
  subjectTrainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trainer",
  },
  timeInterval: {
    type: Number,
    default: 2
  },
  groomingDays: {
    type: Number,
  },
  mode: {
    type: String,
    enum: ["Online", "Offline", "Not Scheduled"],
    default: "Not Scheduled"
  },
  totalStudents: {
    type: Number,
    required: true,
  },
  attendedStudents: {
    type: Number,
  },
  placedStudents: {
    type: [String],
    default: [],
  },
  rejectedStudents: {
    type: [String],
    default: [],
  },
  reasons: {
    type: [String],
    default: [],
  },

  // ✅ New fields below
  dealName: {
    type: String,
  },
  targetGivenByDt: {
    type: String,
  },
  position: {
    type: String,
  },
  noOfStudentsSchedule: {
    type: Number,
  },
  addedByHR: {
    type: String, // could also be ObjectId if HR is a user
  },
  scheduleUpdateInSoftware: {
    type: Boolean,
    default: false,
  },
  scheduleReceiveDateFromDt: {
    type: Date,
  },
  interviewRounds: {
    type: [
      {
        roundType: {
          type: String,
          enum: [
            "Telephonic",
            "Online Test",
            "Aptitude",
            "Technical Written",
            "Face to Face",
            "Managerial Round",
            "HR"
          ],
        },
        status: {
          type: String,
          enum: ["Pending", "Completed", "Ongoing"],
          default: "Pending",
        },
        remarks: {
          type: String,
        },
      }
    ],
    default: [],
  },
}, { timestamps: true });

export default mongoose.model("Grooming", groomingSchema);
