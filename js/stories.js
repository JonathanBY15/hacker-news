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
        
        <i class="${checkFavorite(story)} fa-star favorite" id="fav-${story.storyId}"></i>


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
        
        <i class="${checkFavorite(story)} fa-star favorite" id="fav-${story.storyId}"></i>


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

  if (currentUser.favorites.length === 0) {
    $favoriteStoriesList.empty();
    $favoriteStoriesList.append("<h5>No favorites added!</h5>");
  } else {
    $favoriteStoriesList.empty();

    // loop through favorited stories and generate HTML
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoriteStoriesList.append($story);
    }
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

// async function toggleFavorite(story_id) {
//   try {
//     const api_story = await getStory(story_id);
//     const story = new Story(api_story.data.story);
//     const $icon = $(`#fav-${story_id}`);

//     const parentElement = $icon.parent().parent()[0];
//     console.log(`parent element: ${parentElement.id}`);

//     if (currentUser.isFavorite(story)) {
//       await currentUser.removeFavorite(story);

//       // change favorite icon to regular star
//       console.log(`Removed favorite: ${story_id}`);
//       $icon.removeClass('fa-solid').addClass('fa-regular');

//     } else {
//       await currentUser.addFavorite(story);
//       // change favorite icon to solid star
//       console.log(`Added favorite: ${story_id}`);
//       $icon.removeClass('fa-regular').addClass('fa-solid');
//     }

//     localStorage.setItem('favorites', JSON.stringify(currentUser.favorites));
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// copy of toggleFavorite function that takes an additional parameter to determine which list to update
async function toggleFavorite(story_id, list) {
  try {
    const api_story = await getStory(story_id);
    const story = new Story(api_story.data.story);
    const $icon = $(`#fav-${story_id}`);

    const parentElement = $icon.parent().parent()[0];
    console.log(`parent element: ${parentElement.id}`);

    if (currentUser.isFavorite(story)) {
      await currentUser.removeFavorite(story);

      // change favorite icon to regular star
      console.log(`Removed favorite: ${story_id}`);
      $icon.removeClass('fa-solid').addClass('fa-regular');

    } else {
      await currentUser.addFavorite(story);
      // change favorite icon to solid star
      console.log(`Added favorite: ${story_id}`);
      $icon.removeClass('fa-regular').addClass('fa-solid');
    }

    localStorage.setItem('favorites', JSON.stringify(currentUser.favorites));

    // update favorite stories list
    if (list === 'favorite') {
      putFavoriteStoriesOnPage();
    } else if (list === 'user') {
      putUserStoriesOnPage();
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// add event listener to favorite checkboxes in all stories list
$allStoriesList.on('click', '.favorite', function (evt) {
  const story_id = evt.target.id.substring(4);
  toggleFavorite(story_id, 'all');
});

// add event listener to favorite checkboxes in favorite stories list
$favoriteStoriesList.on('click', '.favorite', function (evt) {
  const story_id = evt.target.id.substring(4);
  toggleFavorite(story_id, 'favorite');
});

// add event listener to favorite checkboxes in user stories list
$userStoriesList.on('click', '.favorite', function (evt) {
  const story_id = evt.target.id.substring(4);
  toggleFavorite(story_id, 'user');
});

// if story is in currentUser.favorites, change star icon to solid star
function checkFavorite(story) {
  if (currentUser.isFavorite(story)) {
    // return 'fa-solid';
    return 'fa-solid';
  }
  return 'fa-regular';
}

// add event listener to delete story icon
$userStoriesList.on('click', '.fa-trash-can', function (evt) {
  const storyId = evt.target.parentElement.id;
  currentUser.deleteStory(storyId);

  // remove story from DOM
  evt.target.parentElement.remove();
  console.log('Story deleted');
});