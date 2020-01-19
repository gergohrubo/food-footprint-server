const { Router } = require('express')
const multer = require('multer')
const moment = require('moment')
const { uploadImg, getImg } = require('../apis/aws')
const authMiddleware = require('../auth/middleware')
const predictImage = require('../apis/clarifai')
const { getNutrition, getRecipe, getRecommendedMeal } = require('../apis/spoonacular')
const Nutrition = require('./model')

const upload = multer()

const router = new Router()

router.post('/image', upload.single('image'), authMiddleware, async (req, res, next) => {
  if (req.file) {
    try {
      const imageName = req.file.originalname
      await uploadImg(req.file.buffer, imageName)
      const bucket = process.env.BUCKET_NAME
      const imgURL = `http://${bucket}.s3.eu-central-1.amazonaws.com/${imageName}`
      const guess = await predictImage(imgURL)
      const start = moment().startOf('day')
      const end = moment().endOf('day')
      const entry = await Nutrition.findOne({ userId: req.user._id, date: { '$gte': start, '$lt': end } })
      if (!entry) {
        const newDBRow = {
          userId: req.user._id,
          date: moment().startOf('day'),
          nutrients: {},
          meals: [
            {
              imageName
            }
          ]
        }
        const newLog = new Nutrition(newDBRow)
        await newLog.save()
      } else {
        entry.meals = [
          ...entry.meals, {
            imageName
          }
        ]
        await entry.save()
      }
      res.send(guess)
    } catch (error) {
      console.error(error)
    }
  } else {
    res.status(400).send('Please support a valid image')
  }
})

router.post('/ingredients', authMiddleware, async (req, res, next) => {
  try {
    const ingredientsList = req.body.ingredients.map(ingredient => ingredient.name)
    const [nutritionResponse, recipeResponse] = await Promise.all([getNutrition(ingredientsList), getRecipe(ingredientsList)])
    const nutritionData = nutritionResponse.body.filter(ingredient => ingredient.hasOwnProperty('nutrition'))
    const recipeData = recipeResponse.body
    const nutritionObject = compoundNutrition(nutritionData)
    const { imageName } = req.body
    const start = moment().startOf('day')
    const end = moment().endOf('day')
    const entry = await Nutrition.findOne({ userId: req.user._id, date: { '$gte': start, '$lt': end } })
    entry.meals = entry.meals.map(meal => {
      if (meal.imageName === imageName) {
        return {
          imageName,
          recipeName: recipeData[0]['title'],
          ingredients: nutritionData,
        }
      }
      return {
        ...meal
      }
    })
    if (entry.nutrients) {
      const nutrientsMut = { ...entry.nutrients }
      for (let key in nutritionObject) {
        if (nutrientsMut.hasOwnProperty(key)) {
          nutrientsMut[key]['amount'] += nutritionObject[key]['amount']
          nutrientsMut[key]['percentOfDailyNeeds'] += nutritionObject[key]['percentOfDailyNeeds']
        } else {
          nutrientsMut[key]['amount'] = nutritionObject[key]['amount']
          nutrientsMut[key]['percentOfDailyNeeds'] = nutritionObject[key]['percentOfDailyNeeds']
          nutrientsMut[key]['unit'] = nutritionObject[key]['unit']
        }
      }
      entry.nutrients = { ...nutrientsMut }
    } else {
      entry.nutrients = { ...nutritionObject }
    }
    entry.markModified('nutrients')
    await entry.save()
    res.send([nutritionObject, nutritionData, recipeData])
  } catch (error) {
    console.error(error)
  }
})

router.post('/title', authMiddleware, async (req, res, next) => {
  try {
    const { imageName, recipeName } = req.body
    const start = moment().startOf('day')
    const end = moment().endOf('day')
    const entry = await Nutrition.findOne({ userId: req.user._id, date: { '$gte': start, '$lt': end } })
    entry.meals = entry.meals.map(meal => {
      if (meal.imageName === imageName) {
        return {
          ...meal,
          recipeName
        }
      }
      return {
        ...meal
      }
    })
    await entry.save()
    res.send('title changed')
  } catch (error) {
    console.error(error)
  }
})

router.post('/diary', authMiddleware, async (req, res, next) => {
  try {
    const { date } = req.body
    const start = moment(date).startOf('day')
    const end = moment(date).endOf('day')
    const entry = await Nutrition.findOne({ userId: req.user._id, date: { '$gte': start, '$lt': end } })
    if (!entry) {
      res.send({ meals: [], nutrients: {} })
    }
    const promiseArray = entry.meals.map(async (meal) => {
      const image = await getImg(meal.imageName)
      return {
        ...meal,
        image: image.Body
      }
    })
    entry.meals = await Promise.all(promiseArray)
    res.send(entry)
  } catch (error) {
    console.error(error)
  }
})

router.post('/suggest', authMiddleware, async (req, res, next) => {
  try {
    const { date, nutrientsArray } = req.body
    const start = moment(date).startOf('day')
    const end = moment(date).endOf('day')
    const entry = await Nutrition.findOne({ userId: req.user._id, date: { '$gte': start, '$lt': end } })
    const requiredAmounts = nutrientsArray.map(nutrient => `min${nutrient.replace(/\s+/g, '')}=${calculateRequiredAmount(nutrient, entry.nutrients)}`)
    const suggestions = await getRecommendedMeal(requiredAmounts)
    res.send(suggestions.body)
  } catch (error) {
    console.error(error)
  }
})

function compoundNutrition(ingredientArray) {
  const nutritionArrays = ingredientArray.map(ingredient => ingredient.nutrition.nutrients)
  const nutritionObject = nutritionArrays.reduce((acc, ingredient) => {
    ingredient.forEach(nutrient => {
      if (acc.hasOwnProperty(nutrient.title)) {
        acc[nutrient.title]['amount'] += nutrient['amount']
        acc[nutrient.title]['percentOfDailyNeeds'] += nutrient['percentOfDailyNeeds']
      } else {
        acc[nutrient.title] = {
          amount: nutrient['amount'],
          percentOfDailyNeeds: nutrient['percentOfDailyNeeds'],
          unit: nutrient['unit']
        }
      }
    })
    return acc
  }, {})
  return nutritionObject
}

function calculateRequiredAmount(nutrientKey, nutrients) {
  if (nutrients[nutrientKey]['percentOfDailyNeeds'] > 100) {
    return 0
  }
  const remainingPercentage = 100 - nutrients[nutrientKey]['percentOfDailyNeeds']
  return remainingPercentage * (nutrients[nutrientKey]['amount'] / nutrients[nutrientKey]['percentOfDailyNeeds'])
}

module.exports = router