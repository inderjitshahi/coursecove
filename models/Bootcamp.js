import mongoose from "mongoose";
import slugify from "slugify";
import Course from "./Course.js";

const BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, "Name can't be more than 50 characters"]
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, "Name can't be more than 500 characters"]
    },
    website: {
        type: String,
        //from stackoverflow
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            "Please Enter a valid URL"
        ]
    },
    phone: {
        type: String,
        maxlength: [20, "phone number can't be longer than 20 characters"]
    },
    email: {
        type: String,
        //from stackoverflow
        match: [
            /^([-!#-\'*+\/-9=?A-Z^-~]{1,64}(\.[-!#-\'*+\/-9=?A-Z^-~]{1,64})*|"([]!#-[^-~ \t]|(\\[\t -~]))+")@[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?(\.[0-9A-Za-z]([0-9A-Za-z-]{0,61}[0-9A-Za-z])?)+$/,
            "Please Enter a valid email"
        ]
    },
    address: {
        type: String,
        require: [true, "Please add an address"]
    },
    location: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            // required: true
        },
        coordinates: {
            type: [Number],
            // required: true,
            index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    careers: {
        type: [String],  //array of string
        required: true,
        enum: [          //available options
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Blockchain',
            'Language',
            'Personality Development',
            'Other',
        ]
    },
    averageRating: {
        type: Number,
        min: [1, "Rating must be at least 1"],
        max: [10, "Rating can be at most 10"]
    },
    averageCost: Number,
    photo: {
        type: String,
        default: 'no-photo.jpg',
    },
    housing: {
        type: Boolean,
        default: false,
    },
    jobAssistance: {
        type: Boolean,
        default: false,
    },
    jobGuarantee: {
        type: Boolean,
        default: false,
    },
    acceptGi: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

//Mongoose middleware or hook
//Create Bootcamp slug from the name
//this refers to document itself
BootcampSchema.pre('save', function (next) { //To run before saving document
    // console.log("Slugify Ran", this.name);
    this.slug = slugify(this.name, { lower: true });

    next(); //so that next middleware can run
})

//Cascade delete courses when a bootcamp is deleted
BootcampSchema.pre('deleteOne', { document: false, query: true }, async function (next) {  //before deleting the doc
    const id = this.getFilter()["_id"]
    console.log(`courses being removed from bootcamp ${id}`);
    await Course.deleteMany({ bootcamp: id });
    next();
});



//Reverse populate with virtuals
//bootcampId is in Courses, but importing reversely courses into bootcamp
//  The ref option, which tells Mongoose which model to populate documents from.
// The localField and foreignField options. Mongoose will populate documents from the model in ref whose foreignField matches this document's localField.

BootcampSchema.virtual('courses', {
    ref: "Course",  //Modal Name
    localField: '_id',  //here it is _id, It scans Course, if bootcamp field matches the localField, it populates that course into the respective bootcamp
    foreignField: 'bootcamp',  //filed name in Course Schema
    justOne: false,
})

const Bootcamp = mongoose.models.Bootcamp || mongoose.model('Bootcamp', BootcampSchema);
export default Bootcamp;