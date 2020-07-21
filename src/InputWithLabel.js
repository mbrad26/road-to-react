import React, { useEffect, useRef } from 'react';

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

  export default InputWithLabel;
