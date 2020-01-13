const { Router } = require('express')
const multer = require('multer')
const { uploadImg, getImgURL } = require('../apis/aws')
const predictImage = require('../apis/clarifai')
const { getNutrition, getRecipe } = require('../apis/spoonacular')
const Nutrition = require('./model')

const upload = multer()

const router = new Router()

router.post('/image', upload.single('image'), async (req, res, next) => {
  if (req.file) {
    await uploadImg(req.file.buffer, 'newimage.jpg')
    const imgURL = await getImgURL()
    const guess = await predictImage(imgURL)
    res.send(guess)
  } else {
    res.status(400).send('Please support a valid image')
  }
})

router.post('/ingredients', async (req, res, next) => {
  try {
    console.log('the req body')
    const ingredientsList = req.body.ingredients.map(ingredient => ingredient.name)
    const nutritionResponse = await getNutrition(ingredientsList)
    const recipeResponse = await getRecipe(ingredientsList)
    const nutritionData = nutritionResponse.body
    console.log('the nutrition array', nutritionData)
    const recipeData = recipeResponse.body
    const nutritionArray = compoundNutrition(nutritionData)
    console.log('the recipe data', recipeData)
    console.log('the nutrition array', nutritionArray)
    res.send([nutritionArray, nutritionData, recipeData])
  } catch (error) {
    console.error(error)
  }
})

function compoundNutrition(ingredientArray) {
  const nutritionArrays = ingredientArray.map(ingredient => ingredient.nutrition.nutrients)
  console.log('the ingredient array in the function', ingredientArray)
  console.log('the nutrition array in the function', nutritionArrays)
  const nutritionArray = nutritionArrays.reduce((acc, ingredient) => {
    ingredient.forEach(nutrient => {
      const index = acc.findIndex(accItem => accItem.title === nutrient.title)
      if (index === -1) {
        acc = [...acc, { ...nutrient }]
      } else {
        acc[index]['amount'] += nutrient['amount']
      }
    })
    return acc
  }, [])
  return nutritionArray
}

module.exports = router