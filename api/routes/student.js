var express = require('express')

var {Student} = require('../schema/student');
var PlanController = require('../controllers/planController');
const classController = require('../controllers/classController');

var router = express.Router();

router.use(async (req, res, next) => {
    if(!req.user){
        return res.status(401).json({})
    }else{
        let student = await Student.findOne({user:req.user.id}).exec();
        if(!student){
            student = new Student({
                name:req.user.displayName,
                plans:[],
                completedClasses:[],
                options:[],
                semesterPlan:[],
                desiredCredits:15,
                user:req.user.id,
                hasAnsweredPlanSurvey:false,
                lastAnsweredClassSurvey:null
            });
            await student.save();
        }
        req.student = student;
    }
    next();
});

router.post('/plan/survey', async (req, res)=>{
    try{
        await PlanController.updateSurvey(req.student, req.body.plans)
        res.json({});
    }catch(err){
        res.json({error: err})
    }
})

router.get('/plan/classes', async (req, res)=>{
    return res.json(await PlanController.getPlanClasses(req.student))
})

router.post('/class/survey', async (req, res)=>{
    try{
        await PlanController.updateItemSurvey(req.student, req.body.classes)
        res.json({});
    }catch(err){
        res.json({error: err})
    }
})

const outsideCurrentSemester = (lastSurveyDate) =>{
    let currDate = new Date();
    let fallStart = new Date(currDate.getFullYear(), 8, 24, 0, 0, 0, 0);
    let fallEnd = new Date(currDate.getFullYear(), 12, 17, 0, 0, 0, 0)
    let springStart = new Date(currDate.getFullYear(), 1, 24, 0, 0, 0, 0);
    let springEnd = new Date(currDate.getFullYear(), 5, 17, 0, 0, 0, 0)
    if((lastSurveyDate > fallStart && 
        lastSurveyDate < fallEnd) || 
        (lastSurveyDate > springStart && 
            lastSurveyDate < springEnd)){
        return false;
    }
    return true;
}

router.use(async (req, res, next)=>{
    if(!req.student.lastAnsweredPlanSurvey){
        return res.json({error:"NO_VALID_PLAN_SURVEY",message:"This student has not answered a plan survey yet."})
    }else if(outsideCurrentSemester(req.student.lastAnsweredClassSurvey)){
        return res.json({error:"NO_VALID_CLASS_SURVEY",message:"This student has not answered a class survey yet."})
    }
    next();
})

router.post('/plan/add', async (req, res)=>{
    try{
        await PlanController.addPlans(req.student, [req.body.id])
        res.json({});
    }catch(err){
        res.json({error: err})
    }
})

/**
 * Get the student's plan graph.
 */
router.post('/plan/tree', async (req, res)=>{
    const plan = await PlanController.retrievePlanGraph(req.student);
    res.json({tree:plan});
})

/**
 * Generate a plan for the student.
 */
router.post('/plan/generate', async function(req, res){
    try{
        const plan = await PlanController.generateSemester(req.student);
        res.json({plan:plan});
    }catch(err){
        res.json({error:err.message});
    }
})

/*
This method regenerates the tree for the student, taking into account the classes they didn't want to take.
*/
router.post('/plan/regenerate', async function(req, res){
    const plan = await PlanController.regenerateTree(req.student, req.body.vals);
    if(plan.error){
        res.json({error:plan.error})
    }else{
        res.json({plan:plan})
    }
})

/**
  * This method creates a plan for the passed in name of the plan.
  */
 router.post('/bucket/items', async function(req, res){
    const buckets = await PlanController.retrieveBucketItems(req.student);
    let retVal = buckets.map(e=>{
        return {id:e.id, label:e.class.name, bucket:e.bucket.id, children:e.children.map(e=>e.id)}
    })
    res.json(retVal);
})

/**
 * Returns the current user's buckets(semesters).
 */
router.post('/bucket/buckets', async function(req, res){
    let buckets = await PlanController.retrieveBuckets(req.student);
    buckets = buckets.map(e=>{
        return {id:e.id, label:e.name}
    })
    res.json(buckets);
})

/**
 * Move an item to a new bucket.
 */
router.post('/bucket/move', async function(req, res){
    await PlanController.updateBucket(req.student, req.body.bucket, req.body.id)
    res.json({})
})

/**
 * Move an item to a new bucket.
 */
router.get('/bucket/itemInfo', async function(req, res){
    res.json(await PlanController.getBucketItemInfo(req.student, req.query.id))
})

module.exports = router;