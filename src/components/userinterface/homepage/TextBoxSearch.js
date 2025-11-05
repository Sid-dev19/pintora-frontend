import SearchIcon from '@mui/icons-material/Search';
import ListIcon from '@mui/icons-material/List';
import ClearIcon from '@mui/icons-material/Clear';
import { useState } from 'react';
import { IconButton } from '@mui/material';

export default function TextBoxSearch({ width = "40%" }) {

    const [inputValue, setInputValue] = useState('')

    const clearInput = () => {
        setInputValue('');
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', width: width, height: 40, background: '#3F2B56', borderRadius: 25 }}>
            <SearchIcon style={{ fontSize: 30, paddingLeft: 10, color: '#fff' }} />

            <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                type='text'
                style={{
                    width: '70%',
                    height: 26,
                    border: 0,
                    outline: 0,
                    background: 'transparent',
                    color: '#fff',
                    fontSize: 16
                }}
                placeholder='Search Here...'
            />

            {inputValue === "" ? (
                <ListIcon style={{ fontSize: 34, paddingLeft: 10, marginLeft: 'auto', marginRight: 15, color: '#fff' }} />
            ) : (
                <IconButton
                    style={{ paddingLeft: 10, marginLeft: 'auto', marginRight: 15 }}
                    onClick={clearInput}
                >
                    <ClearIcon style={{ color: '#fff' }} />
                </IconButton>
            )}
        </div>
    );
}
