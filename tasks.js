const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

var taskSchema = mongoose.Schema({
    title : String,
    description : String,
    dueDate : String,
    status : String,
    //work on this later. Tasks for specific users based on id
    username : String

});

var task = mongoose.model('task', taskSchema);

const userInfo = require('./index.js');
var currentUser;

//delete all task data
/*router.get('/delete', function(req, res) {
    task.remove(function(err, response) {
        console.log ("removed all task data");
    });
});*/

//create new tasks
router.get('/create', function(req, res) {
    res.render('task-create', {user : req.user.username});
});

router.post('/create', function(req, res) {
    var newTask = new task({
        //not yet worked upon. save each dpcumante with username
        username : currentUser,
        title : req.body.title,
        description : req.body.description,
        dueDate : req.body.dueDate,
        status : req.body.status
    });

        newTask.save(function(err, task) {
            if(err){
                res.send("error saving user to database");
            }
            else {
                res.redirect('/tasks/' + req.user.username);
            }
        });
        /*task.find(function(err, response) {
            console.log(response);
        });*/
});

// Route to render the Task List View
router.get('/:userId', function(req, res) {
    currentUser = req.params.userId;

    task.find({username : currentUser}, function(err, allTasks) {
        if (err) {
            res.status(500).send('Internal Server Error');
            return;
        }

        else{
            res.render('task-list', { tasks: allTasks, user : currentUser});

        }
    });
    
});

router.get('/', function(req, res) {
    res.redirect('/tasks/' + req.user.username);
});

//Edit tasks
router.get('/edit/:taskId', function(req, res) {
    task.findById(req.params.taskId, function(err, task) {
        if (err) {
            res.status(500).send('Internal Server Error');
            return;
        }

        else{
            res.render('task-edit', { task: task, user : req.user.username});
        }
    });
    
});
router.post('/edit/:taskId', function(req, res) {
    task.findByIdAndUpdate(req.params.taskId, {
        title : req.body.editTitle,
        description : req.body.editDescription,
        dueDate : req.body.editDueDate,
        status : req.body.editStatus
    }, function(err, editedTask) {
            if (err) {
                res.status(500).send('Internal Server Error');
                return;
        }
  
        if (!editedTask) {
            res.status(404).send('Task not found');
            return;
        } else {
            res.redirect ('/tasks/' + req.user.username);
        }
    });
});

//delete tasks
router.post('/delete/:taskId', function(req, res){  
    task.findByIdAndRemove(req.params.taskId, function(err, deletedTask) {
        if (err) {
            res.status(500).send('Internal Server Error');
            return;
        }
  
        if (!deletedTask) {
            res.status(404).send('Task not found');
            return;
        }

        res.redirect('/tasks/' + req.user.username);
    });
  });

module.exports = router;
