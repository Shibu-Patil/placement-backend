import mongoose from "mongoose";

const trainerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subject: {  
    type: String,
    required: true,
  },
  // All grooming sessions taken by this trainer
  groomingTaken: [
    {
      groomingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Grooming",
        required: true,
      },
      month: {
        type: String, // e.g. "October 2025"
      },
      companyName: {
        type: String,
      },
      subject: {
        type: String,
      }
    }
  ]
}, { timestamps: true });

export default mongoose.model("Trainer", trainerSchema);
