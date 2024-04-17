"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {

  const hostName = story.getHostName();

  // if story belongs to currentUser
  if (currentUser.ownStories.includes(story)) {
    return $(`
      <li id="${story.storyId}">
        <i class="fa-solid fa-trash-can"></i>
        <input type="checkbox" id="fav-${story.storyId}" class="favorite" ${checkFavorite(story)}>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
  }

  return $(`
      <li id="${story.storyId}">
        <input type="checkbox" id="fav-${story.storyId}" class="favorite" ${checkFavorite(story)}>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Gets list of favorite stories from server, generates their HTML, and puts on page. */

function putFavoriteStoriesOnPage() {
  console.debug("putFavoriteStoriesOnPage");

  $favoriteStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $favoriteStoriesList.append($story);
  }

  $favoriteStoriesList.show();
}

/** Gets list of users stories from server, generates their HTML, and puts on page. */

function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  if (currentUser.ownStories.length === 0) {
    $userStoriesList.empty();
    $userStoriesList.append("<h5>No stories added by user yet!</h5>");
  }
  else {
    $userStoriesList.empty();

    // loop through all of our stories and generate HTML for them
    for (let story of currentUser.ownStories) {
      const $story = generateStoryMarkup(story);
      $userStoriesList.append($story);
    }
  }

  $userStoriesList.show();
}

// get the data from the form, call the .addStory method, and then put that new story on the page.
async function submitNewStory(evt) {
  console.debug("submitNewStory", evt);
  evt.preventDefault();

  const title = $("#submit-title").val();
  const author = $("#submit-author").val();
  const url = $("#submit-url").val();

  const newStory = { title, author, url };

  const story = await storyList.addStory(currentUser, newStory);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);///////////////////////

  $submitForm.trigger("reset");

  hidePageComponents();
  $submitForm.show();
  $allStoriesList.show();
}

$submitForm.on("submit", submitNewStory);



// get Story by id
async function getStory(id) {
  try {
    const story = await axios.get(`https://hack-or-snooze-v3.herokuapp.com/stories/${id}`);
    console.log(story);
    return story;
  } catch (error) {
    console.error('Error:', error);
  }
}

async function toggleFavorite(story_id) {
  try {
    const api_story = await getStory(story_id);
    const story = new Story(api_story.data.story);

    if (currentUser.isFavorite(story)) {
      await currentUser.removeFavorite(story);
    } else {
      await currentUser.addFavorite(story);
    }

    localStorage.setItem('favorites', JSON.stringify(currentUser.favorites));
  } catch (error) {
    console.error('Error:', error);
  }
}


// add event listener to favorite checkboxes in all stories list
$allStoriesList.on('click', '.favorite', function (evt) {
  const story_id = evt.target.id.substring(4);
  toggleFavorite(story_id);
});

// add event listener to favorite checkboxes in favorite stories list
$favoriteStoriesList.on('click', '.favorite', function (evt) {
  const story_id = evt.target.id.substring(4);
  toggleFavorite(story_id);
});

// add event listener to favorite checkboxes in user stories list
$userStoriesList.on('click', '.favorite', function (evt) {
  const story_id = evt.target.id.substring(4);
  toggleFavorite(story_id);
});





//retrieve favorites from local storage
function getFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites'));

  if (favorites) {
    favorites.forEach(item => {
      const storyId = item.storyId;
      const title = item.title;
      // Access other properties as needed
      console.log(`Story ID: ${storyId}, Title: ${title}`);
    });
  } else {
    console.log('No favorites found in local storage.');
  }
}

// if story is in currentUser.favorites, add checked attribute to checkbox
function checkFavorite(story) {
  if (currentUser.isFavorite(story)) {
    return 'checked';
  }
  return '';
}

// add event listener to delete story icon
$userStoriesList.on('click', '.fa-trash-can', function (evt) {
  const storyId = evt.target.parentElement.id;
  currentUser.deleteStory(storyId);

  // remove story from DOM
  evt.target.parentElement.remove();
  console.log('Story deleted');
});