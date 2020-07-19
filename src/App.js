import React, { useState, useEffect } from 'react';
import './App.css';

const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = useState(
    localStorage.getItem(key) || initialState
  );

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
};

const App = () => {
  const stories = [
    {
      title: 'React',
      url: 'https://reactjs.org/', author: 'Jordan Walke', num_comments: 3,
      points: 4,
      objectID: 0,
    }, {
      title: 'Redux',
      url: 'https://redux.js.org/', author: 'Dan Abramov, Andrew Clark', num_comments: 2,
      points: 5,
      objectID: 1,
    },
  ];

  const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');

  const handleSearch = e => {
    setSearchTerm(e.target.value);
  };

  const searchedStories = stories.filter(story =>
    story.title
         .toLowerCase()
         .includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1>Hello World!</h1>
      <Search onSearch={handleSearch} search={searchTerm}/>
      <hr />
      <List list={searchedStories}/>
  </div>
  );
};

const Search = ({ search, onSearch }) => (
    <div>
      <label htmlFor='search'>Search: </label>
      <input
        id='search'
        type='text'
        value={search}
        onChange={onSearch}
      />
      <p>Searching for <strong>{search}</strong></p>
    </div>
  )

const List = ({ list }) =>
  list.map(({ objectID, ...item }) => <Item key={objectID} {...item} />);

const Item = ({ title, url, author, num_comments, points }) => (
  <div>
    <span>
      <a href={url}>{title}</a>
    </span>
    <span>{author}</span>
    <span>{num_comments}</span>
    <span>{points}</span>
  </div>
);

export default App;
