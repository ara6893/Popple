var mongoose = require('mongoose');

var Schema = mongoose.Schema;

/**
 * TODO: Rename this to requisite. This should be defined at the plan level, plans may have different requirements for each class.
 */
requirementSchema = new Schema({
    classFrom: {type:Schema.Types.ObjectId, ref:'classes'},
    classTo: {type:Schema.Types.ObjectId, ref:"classes"},
    flags: [{type:Schema.Types.ObjectId, ref:'flags'}]
})

var autoPopulate = function(next) {
    this.populate('classFrom');
    this.populate('classTo');
    next();
};

requirementSchema
.pre('findOne', autoPopulate)
.pre('find', autoPopulate)

module.exports.Requirement = mongoose.model('requirements', requirementSchema);