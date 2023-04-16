import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, "please add a review title"],
        maxlength: [100, "max characters allowed:100"]
    },
    text: {
        type: String,
        trim: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, "please add a rating between 1 ans 10"],
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
        required:[true,'User who is rating not found']
    }
});

//one review can have 1 bootcamp and 1 user
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });


//Static Method
ReviewSchema.statics.getAverageRating = async function (bootcampId, sub = 0) {
    // console.log(`Calculating avg cost....`);
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId }
        },
        {
            $group: {
                _id: '$bootcamp',
                sum: { $sum: '$rating' },
                cnt: { $sum: 1 }
            }
        },
    ]);
    console.log(obj, "in Review Model");
    try {
        if (sub > 0) {
            obj[0].sum -= sub;
            obj[0].cnt -= 1;
        }
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageRating: (obj[0].sum) / (obj[0].cnt===0?1:obj[0].cnt),
        })
    } catch (error) {
        console.log("called here", error);
    }
}

//Call getAverageCost after save
ReviewSchema.post('save', function () {
    this.constructor.getAverageRating(this.bootcamp);
})

//Call getAverageCost after save
ReviewSchema.post('updateOne', async function () {
    const doc = await this.model.findOne(this.getQuery());
    await this.model.getAverageRating(doc.bootcamp);
    ;
})

//Call getAverageCost before remove
ReviewSchema.pre('deleteOne', async function () {
    const doc = await this.model.findOne(this.getQuery());
    await this.model.getAverageRating(doc.bootcamp, doc.rating);
});



const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
export default Review;
