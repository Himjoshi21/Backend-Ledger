const mongoose = require('mongoose');


const transactionSchema = new mongoose.Schema({
    fromAccount:{
       type:mongoose.Schema.Types.ObjectId,
       ref:"account",
       required:[true,"transaction must be associated with a from account"],
       index:true 
    },

    toAccount:{
       type:mongoose.Schema.Types.ObjectId,
       ref:"account",
       required:[true,"transaction must be associated with a to account"],
       index:true 

    },
    status:{
        type:String,
        enum:{
            values:["PENDING","COMPLETED","FAILED","REVERSED"],
            message:"status can be either PENDING or COMPLETED or FAILED or REVERSED",
        },
        default:"PENDING"
    },
    amount:{
        type:Number,
        required:[true,"amount is required for creating a transaction"],
        min:[0,"Transaction amount can't be negative"]
    },
    idempotencyKey:{
        // always generated on client side and it used to restirct a same payments from being processed multiple times
        type:String,
        required:[true,"idempotencyKey is required for creating a transaction"],
        unique:true,
        index:true

    },

},{
    timestamps:true
})

const transactionModel = mongoose.model("transaction",transactionSchema)

module.exports = transactionModel