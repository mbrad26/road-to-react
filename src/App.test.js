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
import axios from 'axios';

jest.mock('axios');

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

  it('clicking the dismiss button calls the calback handler', () => {
    const callback = jest.fn();
    render(<Item item={storyOne} onRemoveItem={callback} />);

    // fireEvent.click(screen.getByRole('button'));
    screen.getByRole('button').click();

    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe('SearchForm', () => {
  const searchFormProps = {
    searchTerm: 'React',
    onSearchInput: jest.fn(),
    onSearchSubmit: jest.fn(),
  }

  it('renders input field with its value', () => {
    render(<SearchForm {...searchFormProps} />);

    expect(screen.getByDisplayValue('React')).toBeInTheDocument();
  });

  it('renders the correct label', () => {
    render(<SearchForm {...searchFormProps} />);

    expect(screen.getByLabelText('Search:')).toBeInTheDocument();
  });

  it('calls onSearchInput on input field change', () => {
    render(<SearchForm {...searchFormProps} />);

    fireEvent.change(screen.getByDisplayValue('React'), { target: { value: 'Redux '} });

    expect(searchFormProps.onSearchInput).toHaveBeenCalledTimes(1);
  });

  it('calls onSearchSubmit on submit', () => {
    render(<SearchForm {...searchFormProps} />);

    fireEvent.submit(screen.getByRole('button'));

    expect(searchFormProps.onSearchSubmit).toHaveBeenCalledTimes(1);
  });
});

describe('App', () => {
  it('succeeds fetching data', async () => {
    const promise = Promise.resolve({
      data: {
        hits: stories
      }
    });
    axios.get.mockImplementationOnce(() => promise);
    render(<App />);

    screen.debug();
    expect(screen.queryByText(/Loading/)).toBeInTheDocument();

    await act(() => promise);

    screen.debug();
    expect(screen.queryByText(/Loading/)).toBeNull();
  });
});
