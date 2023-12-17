const express = require('express');
const router = express.Router();
const client = require('./RedisClient');
const Recipe = require('../models/Reciepe');
const isUser= require("../middlewares/userAuthentication")
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.post('/create',isUser, async (req, res) => {
  const { title, description, ingredients, steps, imageUrl, createdBy } = req.body;
    try {
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
      await client.del('recipes');
      res.status(201).json(savedRecipe);
    } catch (error) {
      console.error('Error creating recipe:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  router.get('/getAll', async (req, res) => {
    try {
      const cachedRecipes = await client.get('recipes');

      if (cachedRecipes) {
        console.log('Data from Redis cache');
        return res.json(JSON.parse(cachedRecipes));
      }
      const recipes = await Recipe.find().populate('createdBy', 'username');
      await client.set('recipes', JSON.stringify(recipes), 'EX', 300);
      res.json(recipes);
    } catch (error) {
      console.error('Error getting recipes:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/get/:recipeId',isUser, async (req, res) => {
    const { recipeId } = req.params;
    try {
      const cachedRecipe = await client.get(`recipe:${recipeId}`);

    if (cachedRecipe) {
      // If the recipe is found in the cache, return it
      console.log("data from redis")
      return res.json(JSON.parse(cachedRecipe));
    }

      const recipe = await Recipe.findById(req.params.recipeId).populate('createdBy', 'username');
  
      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }
      await client.set(`recipe:${recipeId}`, JSON.stringify(recipe));
      // Set an expiration time for the cache (adjust the time based on your requirements)
      await client.expire(`recipe:${recipeId}`, 300); 
      res.json(recipe);
    } catch (error) {
      console.error('Error getting recipe:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.put('/:recipeId',isUser, async (req, res) => {
    const { recipeId } = req.params;
    try {
      const { title, description, ingredients, steps, imageUrl } = req.body;
      const isCached = await client.exists(`recipe:${recipeId}`);

      if (isCached) {
        // If the recipe is in the cache, delete it
        await client.del(`recipe:${recipeId}`);
      }
  
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
    const { recipeId } = req.params;
    try {
      const isCached = await client.exists(`recipe:${recipeId}`);

      if (isCached) {
        // If the recipe is in the cache, delete it
        await client.del(`recipe:${recipeId}`);
        console.log("delete the cache value")
      }
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