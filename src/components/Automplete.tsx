import { useMemo, useState } from 'react';
import cn from 'clsx';
import { useDebounce } from '../services/helpers';

type Option = {
  name: string;
  slug: string;
};

type Props<T extends Option> = {
  options: T[];
  onSelect: (value: T | null) => void;
};

export function Autocomplete<T extends Option>({
  options,
  onSelect,
}: Props<T>) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (selectedOption) {
      setSelectedOption(null);
      onSelect(null);
    }

    setQuery(value);
    setIsOpen(true);
  };

  const filteredOptions = useMemo(
    () =>
      options.filter(opt =>
        opt.name.toLowerCase().includes(debouncedQuery.toLowerCase()),
      ),
    [options, debouncedQuery],
  );

  const handleSelect = (option: T) => {
    setSelectedOption(option);
    setQuery(option.name);
    setIsOpen(false);
    onSelect(option);
  };

  return (
    <>
      <div className={cn('dropdown', { 'is-active': isOpen })}>
        <div className="dropdown-trigger">
          <input
            type="text"
            placeholder="Enter a part of the name"
            className="input"
            data-cy="search-input"
            value={query}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
            onChange={handleInputChange}
          />
        </div>

        <div className="dropdown-menu" role="menu" data-cy="suggestions-list">
          <div className="dropdown-content">
            {filteredOptions.map(option => {
              return (
                <div
                  className={cn('dropdown-item', {
                    'is-active': selectedOption?.slug === option.slug,
                  })}
                  data-cy="suggestion-item"
                  key={option.slug}
                  onMouseDown={event => {
                    event.preventDefault();
                    handleSelect(option);
                  }}
                >
                  <p className="has-text-link">{option.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isOpen && query && filteredOptions.length === 0 && (
        <div
          // eslint-disable-next-line max-len
          className="notification is-danger is-light mt-3 is-align-self-flex-start"
          role="alert"
          data-cy="no-suggestions-message"
        >
          <p className="has-text-danger">{`No matching suggestions`}</p>
        </div>
      )}
    </>
  );
}
