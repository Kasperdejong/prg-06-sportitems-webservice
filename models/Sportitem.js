import mongoose from 'mongoose';

const sportItemSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    sport: {type: String, required: true},
    imageUrl: {type: String, required: false},
    likes: {type: Number, default: 0}
},  {
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {

            ret._links = {
                self: {
                    href:`${process.env.HOST}/sportitems/${ret._id}`
                },
                collection: {
                    href: `${process.env.HOST}/sportitems`
                }
            }

            delete ret._id
        }
    }
})

const SportItem = mongoose.model('SportItem', sportItemSchema)

export default SportItem;
