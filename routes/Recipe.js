const express = require('express');
const router = express.Router();
const Recipe = require('../models/Reciepe');
const isUser= require("../middlewares/userAuthentication")
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.post('/create',isUser, async (req, res) => {
  const { title, description, ingredients, steps, imageUrl, createdBy } = req.body;
    try {
     // const binaryImageData = Buffer.from(imageUrl, 'base64');
    //  const bufferData = Buffer.from(imageUrl, 'base64');

      

// // Compress the data
// const compressedData = zlib.deflateSync(bufferData);

// // Decompress the data
// const decompressedData = zlib.inflateSync(compressedData);

// // Convert decompressed Buffer back to Base64
// const decompressedBase64 = decompressedData.toString('base64');

      const recipe = new Recipe({
        title,
        description,
        ingredients,
        steps,
        imageUrl,
        createdBy,
      });
  
      // Save the recipe to the database
      const savedRecipe = await recipe.save();
  
      res.status(201).json(savedRecipe);
    } catch (error) {
      console.error('Error creating recipe:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  router.get('/getAll', async (req, res) => {
    try {
      const recipes = await Recipe.find().populate('createdBy', 'username');
      res.json(recipes);
    } catch (error) {
      console.error('Error getting recipes:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/get/:recipeId',isUser, async (req, res) => {
    try {
      const recipe = await Recipe.findById(req.params.recipeId).populate('createdBy', 'username');
  
      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }
  
      res.json(recipe);
    } catch (error) {
      console.error('Error getting recipe:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.put('/:recipeId',isUser, async (req, res) => {
    try {
      const { title, description, ingredients, steps, imageUrl } = req.body;
  
      const updatedRecipe = await Recipe.findByIdAndUpdate(
        req.params.recipeId,
        { title, description, ingredients, steps, imageUrl },
        { new: true }
      );
  
      if (!updatedRecipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }
  
      res.json(updatedRecipe);
    } catch (error) {
      console.error('Error updating recipe:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.delete('/:recipeId', isUser,async (req, res) => {
    try {
      const deletedRecipe = await Recipe.findByIdAndDelete(req.params.recipeId);
  
      if (!deletedRecipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }
  
      res.json(deletedRecipe);
    } catch (error) {
      console.error('Error deleting recipe:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get("/search",isUser,async(req,res)=>{
    try {
        const { query } = req.query;
    
        // Use a regular expression to perform a case-insensitive search
        const recipes = await Recipe.find({
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { ingredients: { $regex: query, $options: 'i' } },
          ],
        }).populate('createdBy', 'username');
    
        res.json(recipes);
      } catch (error) {
        console.error('Error searching recipes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
  })
  module.exports = router;