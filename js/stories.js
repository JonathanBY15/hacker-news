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
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

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
  $allStoriesList.prepend($story);

  $submitForm.trigger("reset");
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


// add event listener to favorite checkbox
$allStoriesList.on('click', '.favorite', function (evt) {
  const story_id = evt.target.id.substring(4);
  toggleFavorite(story_id);
  // console.log(`${story_id} added/removed from favorites`);
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
