require('dotenv').config();
const express=require('express');
const app=express();
const cors=require('cors');
const mongoose=require('mongoose');
const ObjectId=require('mongodb').ObjectId;

app.use(cors());
app.use(express.json());

const URI=process.env.ATLAS_URI;
mongoose.connect(URI)
    .then(() => 
        console.log('MongoDB Connected!!! '))
    .catch(err => 
        console.log(err));

//Schema and model for mentor

const mentorSchema = new mongoose.Schema({
   name:String,
   email:String,
   course:String,
   students:[mongoose.Schema.Types.ObjectId]
});

const Mentor = mongoose.model('Mentor', mentorSchema,'mentors');


//Schema and model for Student

const studentSchema = new mongoose.Schema({
    name:String,
    batch:String,
    mentors:[mongoose.Schema.Types.ObjectId]
})

const Student=mongoose.model('Student', studentSchema,'students');

//endpoint for landing page
app.get('/',(req,res) =>{
    res.send("Welcome to Student and Mentor Assigning with Database!!")
})


//endpoint to create a mentor
app.post('/create-mentor', async (req,res) => {
    const {name,email,course} = req.body;
    const addMentor = new Mentor({
        "name" : name,
        "email" : email,
        "course" : course
    })
    try{
        const newMentor = await addMentor.save();
        res.send(newMentor)
    }catch(err){
        res.status(500);
        res.send(err);
    }
})


//endpoint to create a student
app.post('/create-student', async (req,res) => {
    const addStudent = new Student({
        "name" : req.body.name,
        "batch" : req.body.batch,
        "mentor" : req.body.mentor ? req.body.mentor : undefined
     })
    try{
        const newStudent = await addStudent.save();
        res.send(newStudent)
    }catch(err){
        res.status(500);
        res.send(err);
    }
})


//endpoint to assign a student to mentor - Select one mentor and add multiple students
app.post('/assign-mentor-students', async (req,res) => {
    const {mentor,stud_list} = req.body;
    //console.log(mentor)
    console.log(stud_list)
    try{
        stud_list.map( async (stud_id) => {
            const student = await Student.findById(stud_id)
            student.mentors = mentor;
            await student.save();
        })
        res.send("Updated Successfully");  
    }catch(err){
        res.status(500);
        res.send(err);
    }
})


//endpoint to assign or change mentor for particular student
app.patch('/assign-change-mentor/:id',async (req,res) => {
    const {id} = req.params;
    const {mentor} = req.body;
    try{
        const student = await Student.findById(id);
        student.mentors = mentor;
        await student.save();
        res.send(student);
    }catch(err){
        res.status(500);
        res.send(err);
    }
})

//endpoint to show all students for a particular mentor
app.get('/mentor-students/:id',async (req,res) => {
    const {id} = req.params;
    try{
        const students = await Student.find({mentors : id});
        res.send(students);
    }catch(err){
        res.send(err);
    }
});


//endpoint to get all Mentor List
app.get('/mentors', async (req,res) => {
    try{
        const mentors = await Mentor.find();
        res.send(mentors);
    }catch(err){
        res.status(400).send(err);
    }   
});


//endpoint to get all Student List
app.get('/students', async (req,res) => {
    try{
        const students = await Student.find();
        res.send(students);
    }catch(err){
        res.status(400).send(err);
    }   
});

const PORT =process.env.PORT;
app.listen(PORT,()=>{
    console.log(`Server running on PORT ${PORT}`);
});
    