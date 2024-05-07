const mongoose= require('mongoose');
const {Schema,model}= mongoose;

const PostSchema= new Schema({
    title: {type:String, required:true},
    summary: {type:String, required:true},
    content: {type:String,default:""},
    cover: {type:String, required:true},
    mileage:{type:Number, required:true},
    color:{type:String, required:true},
    status:{type:String,default:""},
    gearbox:{type:String,default:""},
    cylindrer:{type:String,default:""},
    fuel:{type:String,default:""},
    year: { type: Number, default: function() {
        return new Date().getFullYear();
    }},
    fiscalPower:{type:Number,default:0},
    author: {type:Schema.Types.ObjectId, ref:'User'},
    isHiddenPost:{type:Boolean,default:false},
    vues:{type:Number,min:0},
    likes:{type:Number,min:0},
    whoLikes:[{type:Schema.Types.ObjectId, ref:'User'}],
    comments:[{
        user:{type:Schema.Types.ObjectId, ref:'User'},
        comment:String
    }],
    bannedPost:{
        isBannedPost:{type:Boolean,default:false},
        DateEnd:Date
    },
    typeBidding:{type:String, default:"undefined"},
    overbids:[{
        user:{type:Schema.Types.ObjectId, ref:'User'},
        overbid:{type:Number}
    }],
    firstPrice:{type:Number,required:true,min:0},
    dateBegin:{type:Date, required:true, default:Date.now},
    dateEnd: { type: Date, required: true, default: function() { 
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
        return oneMonthLater;
    }},
    winner:{type:Schema.Types.ObjectId,ref:'User'},

},{
    timestamps: true,
});

const PostModel = model('Post', PostSchema);


module.exports = PostModel;

