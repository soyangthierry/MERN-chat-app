const {createGroupAndAddUsers,getGroupsByUserId,getAllGroupMembers} = require('../controllers/groupController')

const router = require("express").Router();

router.post("/creategroup", createGroupAndAddUsers);
router.get("/getUserGroups/:userId",getGroupsByUserId);
router.get("/getGroupMembers/:groupId",getAllGroupMembers)

module.exports = router;