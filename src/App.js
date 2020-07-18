import React from 'react';
import './App.css';

const list = [
    {
  title: 'React',
  url: 'https://reactjs.org/', author: 'Jordan Walke', num_comments: 3,
  points: 4,
  objectID: 0,
  },
  {
  title: 'Redux',
  url: 'https://redux.js.org/', author: 'Dan Abramov, Andrew Clark', num_comments: 2,
  points: 5,
  objectID: 1,
  },
];

function App() {
  return (
    <div>
      <h1>Hello World!</h1>
      <Search />
      <hr />
      <List />
    </div>
  );
}

function List() {
  return list.map(function(item) {
    return (
      <div key={item.objectID}>
        <span>
          <a href={item.url}>{item.title}</a>
        </span>
        <span>{item.author}</span>
        <span>{item.num_comments}</span>
        <span>{item.points}</span>
      </div>
    );
  });
}

function Search() {
  return (
    <div>
      <label htmlFor='search'>Search: </label>
      <input id='search' type='text' />
    </div>
  );
}

export default App;
