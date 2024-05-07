const mongoose=require('mongoose');
const {Schema,model}=mongoose;

const BiddingSchema=new Schema({
    firstPrice: {type: Number,required:true,min:0},
    dateBegin: {type:Date,required:true,default:Date.now},
    dateEnd: { type: Date, required: true, default: function() { // Default value is dateBegin + one month
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
        return oneMonthLater;
    }},
    accepted: {type:Boolean, default:false}
},{
    timestamps: true,
    discriminatorKey:'type',
});

const dutchBiddingSchema= new Schema({
    whoAccept:{type:Schema.Types.ObjectId, ref:'User'}
});

const germanBiddingSchema= new Schema({
    listOffers:[{
        user:{type:Schema.Types.ObjectId, ref:'User'},
        offer: {type:Number , min:0,required:true}
    }]
});

const BiddingModel=model('Bidding',BiddingSchema);
const GermanBiddingModel=BiddingModel.discriminator('GermanBidding',germanBiddingSchema);
const DutchBiddingModel=BiddingModel.discriminator('DutchBidding',dutchBiddingSchema);

module.exports={BiddingModel,GermanBiddingModel,DutchBiddingModel};