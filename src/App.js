import React, {
  useState,
  useEffect,
  useRef,
  useReducer,
  useCallback,
} from 'react';
import axios from 'axios';
import './App.css';
import { ReactComponent as Check } from './check.svg';

const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = useState(
    localStorage.getItem(key) || initialState
  );
  const isMounted = useRef(false);

  useEffect(() => {
      if(!isMounted.current) {
          isMounted.current = true;
      } else {
        localStorage.setItem(key, value);
      }
    }, [value, key]);

    return [value, setValue];
  };

const storiesReducer = (state, action) => {
  switch(action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter(
          story => action.payload.objectID !== story.objectID
        ),
      };
    default:
      throw new Error();
  }
}

const getSumComments = stories => {
  console.log('C');

  return stories.data.reduce(
    (result, value) => result + value.num_comments,
    0
  );
};

const App = () => {
  const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';
  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');
  const [url, setUrl] = useState(`${API_ENDPOINT}${searchTerm}`);
  const [stories, dispatchStories] = useReducer(
    storiesReducer,
    { data: [], isLoading: false, isError: false }
  );
  const handleFetchStories = useCallback(async () => {
    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    try {
      const result = await axios.get(url);

      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.hits,
      });
    } catch {
      dispatchStories({ type: 'STORIES_FETCH_FAILURE' });
    }
  }, [url]);
  const sumComments = React.useMemo(() => getSumComments(stories), [stories]);

  useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  const handleRemoveStory = useCallback(item => {
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: item,
    });
  }, []);

  const handleSearchInput = e => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = event => {
    event.preventDefault();
    setUrl(`${API_ENDPOINT}${searchTerm}`);
  }

  const searchedStories = stories.data.filter(story =>
    story.title
         .toLowerCase()
         .includes(searchTerm.toLowerCase())
  );

  console.log('B:App');

  return (
    <div className='container'>
      <h1 className='headline-promary'>My Hacker Stories with {sumComments} comments.</h1>
      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      {stories.isError && <p>Something went wrong ...</p>}

      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <List
          list={stories.data}
          onRemoveItem={handleRemoveStory}
        />
      )}
  </div>
  );
};

const SearchForm = ({
  searchTerm,
  onSearchInput,
  onSearchSubmit
}) =>  (
    <form className='search-form' onSubmit={onSearchSubmit}>
      <InputWithLabel
        id='search'
        value={searchTerm}
        isFocused
        onInputChange={onSearchInput}
      >
        <strong>Search: </strong>
      </InputWithLabel>
      <button
        className='button button_large'
        type='submit'
        disabled={!searchTerm}
      >
        Submit
      </button>
    </form>
  )

const InputWithLabel = ({
    id,
    type='text',
    value,
    onInputChange,
    isFocused,
    children
  }) => {
    const inputRef = useRef();

    useEffect(() => {
      if (isFocused && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isFocused]);

    return (
      <>
        <label htmlFor={id} className='label'>{children} </label>
        &nbsp;
        <input
          className='input'
          ref={inputRef}
          id={id}
          type={type}
          value={value}
          onChange={onInputChange}
        />
        <p>Searching for <strong>{value}</strong></p>
      </>
    );
  };

const List = React.memo(({ list, onRemoveItem }) =>
  console.log('B:List') ||
  list.map(item => (
    <Item
      key={item.objectID}
      item={item}
      onRemoveItem={onRemoveItem}
    />
  ))
);

const Item = ({ item, onRemoveItem }) => {
  const handleRemoveItem = () =>
    onRemoveItem(item);

  return (
    <div className='item'>
      <span style={{ width: '40%' }}>
        <a href={item.url}>{item.title}</a>
      </span>
      <span style={{ width: '30%' }}>{item.author}</span>
      <span style={{ width: '10%' }}>{item.num_comments}</span>
      <span style={{ width: '10%' }}>{item.points}</span>
      <span style={{ width: '10%' }}>
        <button
          className='button button_small'
          type='button'
          onClick={() => onRemoveItem(item)}
        >
          <Check height='18px' width='18px' />
        </button>
      </span>
    </div>
  )
};

export default App;

export { storiesReducer, SearchForm, InputWithLabel, List, Item };
