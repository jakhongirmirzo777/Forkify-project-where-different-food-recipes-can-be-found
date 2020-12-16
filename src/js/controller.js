import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';
import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

///////////////////////////////////////
if (module.hot) {
  module.hot.accept();
}
///////////////////////////////////////

///////////////////////////////////////
// https://forkify-api.herokuapp.com/v2
///////////////////////////////////////

async function controlRecipies() {
  try {
    const id = window.location.hash.slice(1);
    // Guard close
    if (!id) return;
    // Render spinner
    recipeView.renderSpinner();
    // Update results view to markup selected search result
    resultsView.update(model.getSearchResultsPage());
    // Updating bookmarks view to markup selected bookmark
    bookmarksView.update(model.state.bookmarks);
    // Loading recipe
    await model.loadRecipe(id);
    // Rendering information
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
}

///////////////////////////////////
///////////////////////////////////

async function controlSearchResults() {
  try {
    // Render spinner
    resultsView.renderSpinner();
    // Getting query
    const query = searchView.getQuery();
    if (!query) return;
    // Load recipe results
    await model.loadRecipeResults(query);
    // Rendering results
    resultsView.render(model.getSearchResultsPage());
    // Render initial pagination
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
}

///////////////////////////////////
///////////////////////////////////

function controlPagination(goToPage) {
  // Rendering new results
  resultsView.render(model.getSearchResultsPage(goToPage));
  // Render new pagination buttons
  paginationView.render(model.state.search);
}

///////////////////////////////////
///////////////////////////////////

function controlServings(newServ) {
  // Update the recipe servings (in state)
  model.updateServings(newServ);
  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
}

///////////////////////////////////
///////////////////////////////////

function controlAddBookmark() {
  // Add / Delete bookmarks
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // Updating recipeView
  recipeView.update(model.state.recipe);

  // Rendering bookmarks
  bookmarksView.render(model.state.bookmarks);
}

///////////////////////////////////
///////////////////////////////////

function controlBookMarks() {
  bookmarksView.render(model.state.bookmarks);
}

///////////////////////////////////
///////////////////////////////////

async function controlAddRecipe(newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();
    // Upload the new recipe data;
    await model.uploadRecipe(newRecipe);
    // Render recipe
    recipeView.render(model.state.recipe);
    // Success message
    addRecipeView.renderSucces();
    // Render bokmarkview
    bookmarksView.render(model.state.bookmarks);
    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('Wrong ingredient format');
    addRecipeView.renderError(err.message);
  }
}

///////////////////////////////////
///////////////////////////////////

function init() {
  bookmarksView.addHandlerRender(controlBookMarks);
  recipeView.addHandlerRender(controlRecipies);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
}
init();

///////////////////////////////////
///////////////////////////////////
