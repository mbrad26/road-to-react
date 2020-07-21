import React from 'react';
import {
  render,
  screen,
  fireEvent,
  act,
} from '@testing-library/react';
import App, {
  storiesReducer,
  List,
  Item,
  SearchForm,
  InputWithLabel,
} from './App';

const storyOne = {
  title: 'React',
  url: 'https://reactjs.org/',
  author: 'Jordan Walke',
  num_comments: 3,
  points: 4,
  objectID: 0,
}

const storyTwo = {
  title: 'Redux',
  url: 'https://redux.js.org/',
  author: 'Dan Abramov, Andrew Clark',
  num_comments: 2,
  points: 5,
  objectID: 1,
}

const stories = [storyOne, storyTwo];

describe('storiesReducer', () => {
  it('removes a story from all stories', () => {
    const state = { data: stories, isLoading: false, isError: false };
    const action = { type: 'REMOVE_STORY', payload: storyOne };

    const newState = storiesReducer(state, action);
    const expectedState = { data: [storyTwo], isLoading: false, isError: false};

    expect(newState).toStrictEqual(expectedState);
  });

  it('isLoading = true', () => {
    const state = { isLoading: false, isError: false};
    const action = { type: 'STORIES_FETCH_INIT' };

    const newState = storiesReducer(state, action);
    const expectedState = { isLoading: true, isError: false}

    expect(newState).toStrictEqual(expectedState)
  });

  it('fetches stories', () => {
    const state = { isLoading: true, isError: false };
    const action = { type: 'STORIES_FETCH_SUCCESS', payload: stories };

    const newState = storiesReducer(state, action);
    const expectedState = { data: stories, isLoading: false, isError: false };

    expect(newState).toStrictEqual(expectedState);
  });

  it('fails to fetch stories', () => {
    const state = { isLoading: true, isError: false };
    const action = { type: 'STORIES_FETCH_FAILURE' };

    const newState = storiesReducer(state, action);
    const expectedState = { isLoading: false, isError: true };

    expect(newState).toStrictEqual(expectedState);
  });
});

describe('Item', () => {
  it('renders all properties', () => {
    render(<Item item={storyOne} />);

    expect(screen.getByText('Jordan Walke')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('renders a clickable button', () => {
    render(<Item item={storyOne}/>);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
