import mongoose from "mongoose";
import Bootcamp from "./Bootcamp.js";

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, "please add a course title"],
        unique: true,
    },
    description: {
        type: String,
        trim: true,
        required: [true, "please add a description"],
    },
    weeks: {
        type: String,
        required: [true, "please add number of weeks"],
    },
    tuition: {
        type: Number,
        required: [true, "please add tuition cost"],
    },
    minimumSkill: {
        type: String,
        required: [true, "please add tuition cost"],
        enum: ["beginner", "intermediate", "advanced"]
    },
    scholarshipAvailable: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    }
});

//Course.fun() --> Static
//const course=Course.find(); =>course.fun() ---> Method(on query)

//Static method to get avg of course tuitions
CourseSchema.statics.getAverageCost = async function (bootcampId,sub=0) {
    // console.log(`Calculating avg cost....`);
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId }
        },
        {
            $group: {
                _id: '$bootcamp',
                averageCost: { $avg: '$tuition' }
            }
        }
    ]);
    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageCost: Math.ceil(obj[0].averageCost / 10) * 10-sub,
        })
    } catch (error) {
        console.log("called here", error);
    }
}
// You cannot access the document being updated in pre('updateOne') or pre('findOneAndUpdate') query middleware. If you need to access the document that will be updated, you need to execute an explicit query for the document.

// schema.pre('findOneAndUpdate', async function() {
//   const docToUpdate = await this.model.findOne(this.getQuery());
//   console.log(docToUpdate); // The document that `findOneAndUpdate()` will modify
// });

//Call getAverageCost after save
CourseSchema.post('save', function () {
    this.constructor.getAverageCost(this.bootcamp);
})

//Call getAverageCost after save
CourseSchema.post('updateOne',async function () {
    const doc= await this.model.findOne(this.getQuery());
    await this.model.getAverageCost(doc.bootcamp);
})

//Call getAverageCost before remove
CourseSchema.pre('deleteOne', async function () {
    const doc= await this.model.findOne(this.getQuery());
    await this.model.getAverageCost(doc.bootcamp,doc.tuition);
});

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);
export default Course;
