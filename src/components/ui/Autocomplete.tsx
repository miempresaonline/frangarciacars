import { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AutocompleteOption {
  id: string;
  label: string;
  [key: string]: any;
}

interface AutocompleteProps {
  value: string;
  onChange: (option: AutocompleteOption | null) => void;
  onSearch: (query: string) => Promise<AutocompleteOption[]>;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  debounceMs?: number;
  minCharsToSearch?: number;
  noResultsText?: string;
  loadingText?: string;
}

export function Autocomplete({
  value,
  onChange,
  onSearch,
  placeholder = 'Buscar...',
  label,
  required = false,
  disabled = false,
  debounceMs = 300,
  minCharsToSearch = 0,
  noResultsText = 'Sin resultados',
  loadingText = 'Buscando...',
}: AutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedOption, setSelectedOption] = useState<AutocompleteOption | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (query: string) => {
    if (query.length < minCharsToSearch) {
      setOptions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const results = await onSearch(query);
      setOptions(results);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error searching:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    setSelectedOption(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(newValue);
    }, debounceMs);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (inputValue.length >= minCharsToSearch) {
      performSearch(inputValue);
    }
  };

  const handleSelectOption = (option: AutocompleteOption) => {
    setSelectedOption(option);
    setInputValue(option.label);
    setIsOpen(false);
    onChange(option);
  };

  const handleClear = () => {
    setInputValue('');
    setSelectedOption(null);
    setOptions([]);
    onChange(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
        performSearch(inputValue);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && options[selectedIndex]) {
          handleSelectOption(options[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0029D4] focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && (
            <Loader2 size={18} className="text-gray-400 animate-spin" />
          )}
          {inputValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded transition"
            >
              <X size={18} className="text-gray-400" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              if (!isOpen && inputValue.length >= minCharsToSearch) {
                performSearch(inputValue);
              }
            }}
            disabled={disabled}
            className="p-1 hover:bg-gray-100 rounded transition disabled:opacity-50"
          >
            <ChevronDown
              size={18}
              className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
          >
            {loading ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                {loadingText}
              </div>
            ) : options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                {noResultsText}
              </div>
            ) : (
              <ul className="py-1">
                {options.map((option, index) => (
                  <li key={option.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectOption(option)}
                      className={`w-full text-left px-4 py-2 text-sm transition ${
                        index === selectedIndex
                          ? 'bg-[#0029D4] text-white'
                          : 'hover:bg-gray-50 text-gray-900'
                      }`}
                    >
                      {option.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
