import React, { useState} from 'react';
import { ReactComponent as Check } from './check.svg';
import { sortBy } from 'lodash';

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENT: list => sortBy(list, 'num_comments').reverse(),
  POINT: list => sortBy(list, 'points').reverse(),
};

const List = React.memo(({ list, onRemoveItem }) => {
  const [sort, setSort] = useState('NONE');

  const handleSort = sortKey => {
    setSort(sortKey);
  };

 const sortFunction = SORTS[sort];
 const sortedList = sortFunction(list);

  return (
      <div>
        <div style={{ display: 'flex' }}>
          <button type='button' onClick={() => handleSort('TITLE')}>
            <span style={{ width: '40%' }}>Title</span>
          </button>
          <button type='button' onClick={() => handleSort('AUTHOR')}>
            <span style={{ width: '30%' }}>Author</span>
          </button>
          <button type='button' onClick={() => handleSort('COMMENT')}>
            <span style={{ width: '10%' }}>Comments</span>
          </button>
          <button type='button' onClick={() => handleSort('POINT')}>
            <span style={{ width: '10%' }}>Points</span>
          </button>
          <span style={{ width: '10%' }}>Actions</span>
        </div>

        {sortedList.map(item => (
            <Item
              key={item.objectID}
              item={item}
              onRemoveItem={onRemoveItem}
            />
          ))}
      </div>
    )
  }
)


const Item = ({ item, onRemoveItem }) => (
  <div className='item' style={{ display: 'flex' }}>
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
);

export default List;
export { Item };
