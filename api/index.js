const express= require('express');

const cors=require('cors');
const  mongoose  = require('mongoose');
const User=  require('./models/User');
const Post=  require('./models/Post');
const bcrypt = require('bcryptjs');
const app= express();
const salt = bcrypt.genSaltSync(10);
const jwt=require('jsonwebtoken');
const cookieParser =require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs=require('fs');
const { subscribe } = require('diagnostics_channel');

const secret="itisasecretwordcreatedbyAziz";

app.use(cors({credentials:true, origin:["http://localhost:3000","https://mehrezsouid.onrender.com"]}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads',express.static(__dirname+'/uploads'));

const mongooseOptions = {
    
    bufferTimeoutMS: 30000, // Adjust this value as needed
  };
mongoose.connect('mongodb+srv://AzizMehrez:zP11TjAzeJMo4K66@blog.1ztshju.mongodb.net/?retryWrites=true&w=majority&appName=blog')
.then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

app.post('/register',async (req,res)=>{

    const {username,password,phoneNumber}= req.body;
    let test=true;
    try{
    const userDocTest=await User.findOne({phoneNumber});
    let userDoc;
    
    if(!userDocTest){
        userDoc=await User.create({
            username,
            phoneNumber,
            password:bcrypt.hashSync(password,salt),
        });
        res.json(userDoc);
    }
    else{
        console.log("phone number is already used");
        test=false;
        res.status(404).json(e);
    }
    }
    catch(e){
        console.log("error inserting user or FindOne(phoneNumber)");
        res.status(400).json(e);
        
        
    }
});

app.post('/login',async (req,res)=>{

   
    try{
        const {password,phoneNumber}= req.body;
        const userDoc=await User.findOne({phoneNumber});
        const passOk= bcrypt.compareSync(password,userDoc.password);
    
        
        
        if (passOk){ 
            jwt.sign({username:userDoc.username,phoneNumber,id:userDoc._id,bio:userDoc.bio},secret,{},(err,token)=>{
                if(err) throw err;
                res.cookie('token',token).json({
                    id:userDoc._id,
                    username:userDoc.username,
                    phoneNumber,
                    bio:userDoc.bio,
                });
            });
                // test: envoyer un message automatique
            const message = `${userDoc.username}+with+phone+number+${phoneNumber}+logged+in+now`;
            const fullMessage = `https://api.callmebot.com/whatsapp.php?phone=21621838333&text=${message}&apikey=5048549`;

            fetch(fullMessage)
              .then(response => {
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }
                return response.json();
              })
              .then(data => {
                console.log(data);
              })
              .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
              });
        }
        else res.status(400).json("wrong creddentials");
        
        
    }
    catch(e){
        console.log("error login into Blog website");
        res.status(400).json(e);
    }
    })


app.get('/profile', async (req, res) => {
    try {
        const { token } = req.cookies;
        let info='';
        if (token){
        info =jwt.verify(token, secret);
        
        }
        res.json(info);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Internal Server Error profile profile' });
    }
});

 app.post('/post',uploadMiddleware.single('file'),async (req,res)=>{
    
  
    const {originalname,path}= req.file;
    const parts= originalname.split('.');
    const ext= parts[parts.length  -1];
    const newPath=path+'.'+ext ;
    fs.renameSync(path,newPath);

    try{
        const { token } = req.cookies;
        const info=jwt.verify(token, secret);    

        const {title, summary, content,mileage,color,statu,gearbox,cylindrer,fuel,year,fiscalPower,typeBidding,firstPrice,dateBegin,dateEnd} = req.body;
        const postDoc= 
        await Post.create({
            title,
            summary,
            content,
            mileage,
            color,
            status:statu,
            gearbox,
            cylindrer,
            fuel,
            year,
            fiscalPower,
            cover:newPath,
            typeBidding:typeBidding,
            firstPrice:firstPrice,
            dateBegin:dateBegin,
            dateEnd:dateEnd,
            author:info.id,
        });

        res.json(postDoc);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json( 'Internal Server Error post post' );
    }
  
 });


app.get('/post',async (req,res)=>{
    //const posts= await Post.find().populate('author');
    res.json(
        await Post.find()
        .populate("author","username")
        .sort({createdAt: -1})
        
        );
});

app.post('/logout', (req,res)=>{
    res.cookie('token','').json('ok');
});

app.get('/post/:id', async (req,res)=>{
    const {id} = req.params;
    const postDoc= await Post.findById(id).populate("author","username");
    res.json(postDoc);
    //res.json(id);
});
app.get('/profile/:id', async (req,res)=>{
    try {   
        const {id} = req.params;
        const profileDoc = await User.findById(id).select('_id username phoneNumber bio');
        if (!profileDoc) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(profileDoc);
    } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
     }
});
app.put('/post',uploadMiddleware.single('file'), async (req,res)=>{
    
    let newPath=null;
    if(req.file) {
        const {originalname,path}= req.file;
        const parts= originalname.split('.');
        const ext= parts[parts.length  -1];
        newPath=path+'.'+ext ;
        fs.renameSync(path,newPath);
    }
    try{
        const { token } = req.cookies;
        const info=jwt.verify(token, secret);   
        const {id,title, summary, content,mileage,color,statu,gearbox,cylindrer,fuel,year,fiscalPower,firstPrice,dateBegin,dateEnd,typeBidding} = req.body; 
        const postDoc= await Post.findById(id);
        const isAuthor=JSON.stringify( postDoc.author)===JSON.stringify( info.id);
        if (!isAuthor){
            return res.status(400).json('you are not the author');
           
        }
        
        await postDoc.updateOne({
            title,
            summary,
            content,
            mileage,
            color,
            status:statu,
            gearbox,cylindrer,
            fuel,year,
            fiscalPower,
            cover: newPath ? newPath : postDoc.cover,
            typeBidding,
            firstPrice,
            dateBegin,
            dateEnd,
        });
       
        res.json(postDoc);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json( 'Internal Server Error put Post' );
    }

});
app.delete('/deletepost/:id',async (req,res)=>{
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) {
          return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json({ message: "Post deleted successfully" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error on delete function" });
      }
});
app.delete('/deleteprofile/:id', async (req,res)=>{
    try{
        
        const deleteAllProfiles= await Post.deleteMany({ author: req.params.id });
        if (deleteAllProfiles){
            const deletedProfile = await User.findByIdAndDelete(req.params.id);
            if (!deletedProfile) {
              return res.status(404).json({ message: "Profile not found" });
            }
            res.status(200).json({ message: "Profile deleted successfully and also posts" });
        }
        
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error on delete function" });
      }
});

app.put('/profile', async (req,res)=>{ 
    try{
         
        const {username,bio,password,phoneNumber,id} = req.body;
        const profileDocument= await User.findById(id);
        //const jsonData=JSON.parse(profileDoc);
       /* const subData={
            username:profileDoc.username,
            bio:profileDoc.bio,
            phoneNumber:profileDoc.phoneNumber,
            id:profileDoc.id,
        }
        const profileDocument=JSON.stringify(subData);*/
    if (!profileDocument) {
            return res.status(404).json({ error: 'User not found' });
      }
    if(password){
        const passOk= bcrypt.compareSync(password,profileDocument.password);
        if(!passOk){      
            
            await profileDocument.updateOne({
                $set: {
                    username: username,
                    bio: bio,
                    password:bcrypt.hashSync(password,salt),
            }});
                  
        }else{
            return res.status(404).json({ error: 'Password is the same as the previous one' });

        }
    }else{
        await profileDocument.updateOne({
            $set: {
                username: username,
                bio: bio,

            }});
    
    }
    //res.json(profileDocument);
    jwt.sign({username,phoneNumber,id,bio},secret,{},(err,token)=>{
        if(err) throw err;
        res.cookie('token',token).json({
            id,
            username,
            phoneNumber,
            bio,
        });
    });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json( 'Internal Server Error put profile' );
    }

});



//clé API infobip: 1da6b3ceda09c3768ef3ae577fa73564-80d6e5f4-9fec-4558-8b8a-e8a162332310
//url API infobip:9lmjly.api.infobip.com
//zP11TjAzeJMo4K66
//mongodb+srv://AzizMehrez:zP11TjAzeJMo4K66@blog.1ztshju.mongodb.net/?retryWrites=true&w=majority&appName=blog
app.listen(4000, ()=>{
    console.log("listening at port 4000");
});
