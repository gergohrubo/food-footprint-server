const dotenv = require('dotenv')
const request = require('superagent')

dotenv.config()

async function getNutrition(ingredientsArray) {
  ingredientListString = ingredientsArray.reduce((acc, item) => acc += `${item}\n`, '')
  const body = {
    ingredientList: ingredientListString,
    servings: 1,
    includeNutrition: true
  }
  try {
    const url = `https://api.spoonacular.com/recipes/parseIngredients?apiKey=${process.env.SPOONACULAR_API_KEY}`
    const res = await request.post(url).send(body).set('Content-Type', 'application/x-www-form-urlencoded')
    return res
  } catch (error) {
    console.error(error)
  }
}

async function getRecipe(ingredientsArray) {
  try {
    const baseUrl = `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${process.env.SPOONACULAR_API_KEY}`
    const ingredientsQuery = ingredientsArray.reduce((acc, item) => acc += `,+${item}`)
    const url = baseUrl + '&ingredients=' + ingredientsQuery + '&number=5&ranking=1&ignorePantry=true'
    const res = await request.get(url)
    return res
  } catch (error) {
    console.error(error)
  }
}

async function getRecommendedMeal(requiredNutrients) {
  try {
    const baseUrl = `https://api.spoonacular.com/recipes/findByNutrients?apiKey=${process.env.SPOONACULAR_API_KEY}`
    const ingredientsQuery = requiredNutrients.reduce((acc, item) => acc += `&${item}`)
    const url = baseUrl + '&' + ingredientsQuery + '&number=10&random=true'
    const res = await request.get(url)
    return res
  } catch (error) {
    console.error(error)
  }
}

module.exports = { getNutrition, getRecipe, getRecommendedMeal }