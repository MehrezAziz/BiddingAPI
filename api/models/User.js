const mongoose= require('mongoose');
const {Schema,model} = mongoose;
const UserSchema = new  Schema({
    username: {type: String, required:true,min:4},
    username: {type: String, min:4},
    phoneNumber: {type: String, required:true,unique:true},
    password: {type: String, required: true,min:4},
    bio: {type: String,default:"",required: false,max:150},
    stars: {type:Number, min:0},
    hints: {type:Number,min:0, default:5},
    isHiddenProfile:{type:Boolean, default:false},
    bannedProfile:{
        isBanned:{type:Boolean, default:false},
        DateEnd:{type:Date},
    },
    whatsapp:{type:String, default:""},
    linkedin:{type:String, default:""},
    facebook:{type:String, default:""},
    x:{type:String, default:""},
    email:{type:String, default:""},
    followers:[{type:Schema.Types.ObjectId,ref:'User'}],
    following:[{type:Schema.Types.ObjectId,ref:'User'}],
    blocked:[{type:Schema.Types.ObjectId,ref:'User'}],
    myOverbids:[{type:Schema.Types.ObjectId,ref:'Post'}],

},{
    timestamps: true,
});
const UserModel= model('User', UserSchema);

module.exports= UserModel;


