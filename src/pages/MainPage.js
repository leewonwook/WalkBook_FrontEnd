import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import './MainPage.css';
import { fetchBooks, fetchCategories } from '../api/bookService';


const MainPage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryIdToNameMap, setCategoryIdToNameMap] = useState({});

  useEffect(() => {
  // API에서 도서 데이터를 가져옴
    const fetchData = async () => {
      try {
        const booksFromAPI = await fetchBooks();
        const formattedBooks = booksFromAPI.map(book => ({
          bookId: book.id,
          isbn: book.isbn,
          title: book.title,
          author: book.author,
          publisher: book.publisher,
          publishDate: book.publicationTime,
          description: book.description,
          coverUrl: book.coverUrl,
          categoryId: book.categoryId,
          createdAt: book.createdAt,
          updatedAt: book.updatedAt
        }));
        setBooks(formattedBooks);
      } catch (err) {
        console.error('도서 데이터 로딩 실패:', err);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    // 카테고리와 검색어에 따른 필터링
    let filtered = books;

    // 카테고리 필터링
    if (selectedCategory !== '전체') {
      filtered = filtered.filter(book => {
        const categoryName = categoryIdToNameMap[book.categoryId];
        return categoryName === selectedCategory;
      });
    }

    // 검색어 필터링
    if (searchTerm.trim()) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBooks(filtered);
  }, [selectedCategory, searchTerm, books, categoryIdToNameMap]);

  // 카테고리 API 호출
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await fetchCategories();
        
        // 카테고리 ID와 이름의 매핑 만들기
        const idToNameMap = {};
        categoriesData.forEach(cat => {
          const categoryId = cat.categoryId || cat.id;
          idToNameMap[categoryId] = cat.categoryName;
        });
        setCategoryIdToNameMap(idToNameMap);
        
        // 전체 카테고리를 포함한 카테고리 목록 설정
        const allCategories = [{ id: 'all', categoryName: '전체' }, ...categoriesData];
        setCategories(allCategories);
      } catch (error) {
        console.error('카테고리 API 호출 오류:', error);
      }
    };

    loadCategories();
  }, []);

  const handleCategoryChange = (category) => {
    if (category) {
      setSelectedCategory(category.categoryName);
    } else {
      setSelectedCategory('전체');
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleBookClick = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  const getResultMessage = () => {
    if (searchTerm.trim() && selectedCategory !== '전체') {
      return `"${selectedCategory}" 카테고리에서 "${searchTerm}" 검색 결과: ${filteredBooks.length}건`;
    } else if (searchTerm.trim()) {
      return `"${searchTerm}" 검색 결과: ${filteredBooks.length}건`;
    } else if (selectedCategory !== '전체') {
      return `${selectedCategory} 카테고리: ${filteredBooks.length}건`;
    }
    return `전체 도서: ${filteredBooks.length}건`;
  };

  return (
    <div className="main-page">
      <Header
        showCategoryDropdown={true}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        showAddButton={true}
      />

      <main className="main-content">
        <h2 className="section-title">도서 목록</h2>
        
        <SearchBar onSearch={handleSearch} />
        
        <div className="results-info">
          <p className="results-count">{getResultMessage()}</p>
        </div>
        
        <div className="books-grid">
          {filteredBooks.map(book => (
            <BookCard
              key={book.bookId}
              book={book}
              onClick={() => handleBookClick(book.bookId)}
            />
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="empty-state">
            {searchTerm.trim() || selectedCategory !== '전체' ? (
              <div>
                <p>검색 조건에 맞는 도서가 없습니다.</p>
                <button 
                  className="reset-filters-button"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('전체');
                  }}
                >
                  필터 초기화
                </button>
              </div>
            ) : (
              <p>등록된 도서가 없습니다.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default MainPage;
