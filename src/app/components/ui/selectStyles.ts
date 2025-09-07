import { StylesConfig } from 'react-select';

// Define styles that use CSS variables from your globals.css for theme consistency
export const customSelectStyles: StylesConfig = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'var(--card)',
    borderColor: state.isFocused ? 'var(--primary)' : '#374151',
    color: 'var(--foreground)',
    borderRadius: '0.5rem',
    padding: '0.15rem',
    boxShadow: state.isFocused ? '0 0 0 1px var(--primary)' : 'none',
    '&:hover': {
      borderColor: 'var(--primary)',
    },
  }),
  // Style for the menu portal to ensure it's on top
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'var(--card)',
    borderColor: 'var(--muted)',
    borderWidth: '1px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? 'var(--primary)'
      : state.isFocused
      ? 'var(--muted)'
      : 'var(--card)',
    color: state.isSelected ? 'var(--primary-foreground)' : 'var(--foreground)',
    '&:active': {
      backgroundColor: 'var(--primary)',
      color: 'var(--primary-foreground)',
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'var(--foreground)',
  }),
  input: (provided) => ({
    ...provided,
    color: 'var(--foreground)',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'var(--muted-foreground)',
  }),
};