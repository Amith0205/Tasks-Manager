const express=require('express');
const app=express();

const mongoose=require('mongoose');
const _=require('lodash');

app.set('view engine','ejs');
const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-amith:test123@cluster0.dj24n.mongodb.net/todolistDB");

const itemsSchema=new mongoose.Schema({
  name:{
    type:String,
    required:[true,"You need to specify an activity name"]
  }
});

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Study"
});

const item2=new Item({
  name:"Cook"
});

const item3=new Item({
  name:"Eat"
});

const defaultItems=[item1,item2,item3];

const listSchema=new mongoose.Schema({
  name:String,
  items:[itemsSchema]
});

const List=mongoose.model("List",listSchema);

app.get("/",function(req,res)
{

   Item.find({},function(err,foundItems)
 {
    if(foundItems.length===0)
    {
         Item.insertMany(defaultItems,function(err)
          {
            if(err)
            {
              console.log(err);
            }
            else
            {
              console.log("Successfully inserted all elements to todolistDB");
            }
          });
          res.redirect("/");
    }
    else
    {
      res.render("list",{ListTitle:"Today",newListItems:foundItems});
    }
 });


});

app.get("/:customListName",function(req,res)
{
  const customList=_.capitalize(req.params.customListName);

  List.findOne({name:customList},function(err,foundList)
{
  if(!err)
  {
    if(!foundList)
    {
      const list=new List({
        name:customList,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+customList);
    }
    else
    {
      res.render("list",{ListTitle:foundList.name,newListItems:foundList.items});
    }
  }
});

});

app.post("/",function(req,res)
{
  const itemName=req.body.newItem;
  const listName=req.body.list;

  const item =new Item({
    name:itemName
  });
  if(listName=="Today")
  {
    item.save()
    res.redirect("/");
  }
  else
  {
    List.findOne({name:listName},function(err,foundList)
  {
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });
  }
});

app.post("/delete",function(req,res)
{
  let delItem=req.body.toDelete;
  const listName=req.body.listName;
  // console.log(delItem);
  if(listName==="Today")
  {
    Item.findByIdAndRemove(delItem,function(err)
    {
      if(err)
      {
        console.log(err);
      }
      else
      {
        console.log("Successfully deleted");
      }
    });
  res.redirect("/");

  }
  else
  {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:delItem}}},function(err,foundList)
  {
    if(!err)
    {
      res.redirect("/"+listName);
    }
  });
  }


});


app.get("/work",function(req,res)
{
  res.render("list",{ListTitle:"Work List",newListItems:workItems});
});
app.post("/work",function(req,res)
{
  let item=req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

app.get("/about",function(req,res)
{
  res.render("about");
});

app.listen(process.env.PORT || 5000,function()
{
  console.log("Server is up and running!");
});
