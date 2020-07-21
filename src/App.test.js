import React from 'react';
import SearchForm from './SearchForm';
import List, { Item } from './List';
import {
  render,
  screen,
  fireEvent,
  act,
} from '@testing-library/react';
import App, { storiesReducer } from './App';
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

  it('renders a snapshot', () => {
    const { container } = render(<SearchForm {...searchFormProps}/>);

    expect(container.firstChild).toMatchSnapshot();
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

    expect(screen.queryByText(/Loading/)).toBeInTheDocument();

    await act(() => promise);

    expect(screen.queryByText(/Loading/)).toBeNull();

    expect(screen.getAllByText('React')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Redux')[0]).toBeInTheDocument();
  });

  it('fails fetching data', async () => {
    const promise = Promise.reject();
    axios.get.mockImplementationOnce(() => promise);
    render(<App />);

    expect(screen.queryByText(/Loading/)).toBeInTheDocument();

    try {
      await act(() => promise);
    } catch {
      expect(screen.queryByText(/Loading/)).toBeNull();
      expect(screen.queryByText('Something went wrong ...')).toBeInTheDocument();
    }
  });

  it('removes a story', async () => {
    const promise = Promise.resolve({
      data: {
        hits: stories
      }
    });
    axios.get.mockImplementationOnce(() => promise);
    render(<App />);
    await act(() => promise);

    expect(screen.getByText('Jordan Walke')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button')[1]);

    expect(screen.queryByText('Jordan Walke')).toBeNull();
  });

  it('searches for specific stories', async () => {
    const reactPromise = Promise.resolve({
      data: {
        hits: stories,
      },
    });
    const anotherStory = {
      title: 'JavaScript',
      url: 'https://en.wikipedia.org/wiki/JavaScript',
      author: 'Brendan Eich',
      num_comments: 15,
      points: 10,
      objectID: 3,
    };
    const javascriptPromise = Promise.resolve({
      data: {
        hits: [anotherStory],
      },
    });
    axios.get.mockImplementation(url => {
      if (url.includes('React')) {
        return reactPromise;
      }

      if (url.includes('JavaScript')) {
        return javascriptPromise;
      }

      throw Error();
    });

    render(<App />);

    await act(() => reactPromise);

    expect(screen.queryByDisplayValue('React')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('JavaScript')).toBeNull();
    expect(screen.queryByText('Jordan Walke')).toBeInTheDocument();
    expect(screen.queryByText('Dan Abramov, Andrew Clark')).toBeInTheDocument();
    expect(screen.queryByText('Brendan Eich')).toBeNull();

    fireEvent.change(screen.queryByDisplayValue('React'), {
      target: {
        value: 'JavaScript',
      },
    });

    expect(screen.queryByDisplayValue('React')).toBeNull();
    expect(screen.queryByDisplayValue('JavaScript')).toBeInTheDocument();

    fireEvent.submit(screen.queryByText('Submit'));

    await act(() => javascriptPromise);

    expect(screen.queryByText('Jordan Walke')).toBeNull();
    expect(
      screen.queryByText('Dan Abramov, Andrew Clark')
    ).toBeNull();
    expect(screen.queryByText('Brendan Eich')).toBeInTheDocument();
  });
});
