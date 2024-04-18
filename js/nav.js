"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  // putStoriesOnPage();
  $allStoriesList.show();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navSubmit.show();
  $navFavorites.show();
  $navMyStories.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/** Show submit page on click on "submit" */

function navSubmitClick(evt) {
  console.debug("navSubmitClick", evt);
  hidePageComponents();
  $submitForm.show();
  putStoriesOnPage();
}

$body.on("click", "#nav-submit", navSubmitClick);

/** Show favorites when clicked on "favorites" */

function navFavoritesClick(evt) {
  console.debug("navFavoritesClick", evt);
  hidePageComponents();
  putFavoriteStoriesOnPage();
}

$body.on("click", "#nav-favorites", navFavoritesClick);

/** Show users stories when clicked on "my stories" */

function navMyStoriesClick(evt) {
  console.debug("navMyStoriesClick", evt);
  hidePageComponents();
  putUserStoriesOnPage();
}

$body.on("click", "#nav-myStories", navMyStoriesClick);




function formatDate(dateString) {
  const date = new Date(dateString);
  const formattedDate = date.toISOString().split('T')[0];
  return formattedDate;
}

function navUserProfileClick(evt) {
  console.debug("navUserProfileClick", evt);
  // User Profile Info
  // Name: bob
  // Username: bobaaa
  // Account Created: 2024-04-08
  // show name, username, and date
  return $(`
      <h4>User Profile Info</h4>
      <p>Name: ${currentUser.name}</p>
      <p>Username: ${currentUser.username}</p>
      <p>Account Created: ${formatDate(currentUser.createdAt)}</p>
    `);
}

$navUserProfile.on("click", function () {
  const userProfHtml = navUserProfileClick();
  $userProfile.empty();
  $userProfile.append(userProfHtml);
  hidePageComponents();
  $userProfile.show();
});