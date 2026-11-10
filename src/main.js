import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery, PER_PAGE } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';

const END_OF_RESULTS_MESSAGE =
  "We're sorry, but you've reached the end of search results.";

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');

let searchQuery = '';
let page = 1;

function showEndOfResultsMessage() {
  iziToast.info({
    message: END_OF_RESULTS_MESSAGE,
    position: 'topRight',
  });
}

function updateLoadMoreButton(data) {
  const isLastPage =
    page * PER_PAGE >= data.totalHits || data.hits.length < PER_PAGE;

  if (isLastPage) {
    hideLoadMoreButton();
    showEndOfResultsMessage();
    return;
  }

  showLoadMoreButton();
}

function scrollToNewImages() {
  const firstCard = gallery.firstElementChild;

  if (!firstCard) {
    return;
  }

  const { height: cardHeight } = firstCard.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

form.addEventListener('submit', async event => {
  event.preventDefault();

  const query = event.currentTarget.elements.searchQuery.value.trim();

  if (!query) {
    iziToast.warning({
      message: 'Please enter a search query.',
      position: 'topRight',
    });
    return;
  }

  searchQuery = query;
  page = 1;

  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(searchQuery, page);

    if (data.hits.length === 0) {
      iziToast.error({
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      return;
    }

    createGallery(data.hits);
    updateLoadMoreButton(data);
  } catch {
    iziToast.error({
      message: 'Something went wrong. Please try again later.',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
});

loadMoreButton.addEventListener('click', async () => {
  const nextPage = page + 1;

  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(searchQuery, nextPage);

    if (data.hits.length === 0) {
      hideLoadMoreButton();
      showEndOfResultsMessage();
      return;
    }

    page = nextPage;
    createGallery(data.hits);
    scrollToNewImages();
    updateLoadMoreButton(data);
  } catch {
    showLoadMoreButton();
    iziToast.error({
      message: 'Something went wrong. Please try again later.',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
});
