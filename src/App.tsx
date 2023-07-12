import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

interface Flashcard {
  id: number;
  word: string;
  meanings: any[];
  synonyms: string[];
  antonyms: string[];
  sentence: string;
  comments: string;
}

const FlashcardList: React.FC<{ flashcards: Flashcard[]; deleteFlashcard: (id: number) => void }> = ({
  flashcards,
  deleteFlashcard,
}) => {
  return (
    <div className="flashcard-list">
      {flashcards.map((flashcard) => (
        <FlashcardItem key={flashcard.id} flashcard={flashcard} deleteFlashcard={deleteFlashcard} />
      ))}
    </div>
  );
};

const FlashcardItem: React.FC<{ flashcard: Flashcard; deleteFlashcard: (id: number) => void }> = ({
  flashcard,
  deleteFlashcard,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [newComment, setNewComment] = useState(flashcard.comments);

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const confirmDelete = () => {
    if (window.confirm('Are you sure you want to delete this flashcard?')) {
      deleteFlashcard(flashcard.id);
    }
  };

  const updateComment = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
  };

  return (
    <div className={`flashcard-item `}>
      {!isFlipped &&
      <div className="flashcard-front">
        <div>
        <h3>{flashcard.word}</h3>
      </div>
    </div>
    }
      {isFlipped &&
      <div className="flashcard-item-flipped" >
        <div>
        <p>Meaning: {flashcard.meanings}</p>
        <p>Synonyms: {flashcard.synonyms? flashcard.synonyms.join(', ') : '-'}</p>
        <p>Antonyms: {flashcard.antonyms? flashcard.antonyms.join(', ') : '-'}</p>
        <p>Sentence: {flashcard.sentence}</p>
        <textarea
          className="textArea"
          value={newComment}
          onChange={updateComment}
          placeholder="Add comments..."
        ></textarea>
        </div>
      </div>
   }
   <button className="flip-button" onClick={flipCard}>
      Flip
    </button>
   <button className="delete-button" onClick={confirmDelete}>
      Delete
    </button>
    </div>
  );
};

const App: React.FC = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [newWord, setNewWord] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const addFlashcard = async () => {
    const word = prompt('Enter a word:');
    if (!word) return;

    try {
      const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const wordDetails = response.data; 
      console.log(wordDetails)

      const newFlashcard: Flashcard = {
        id: Date.now(),
        word: word,
        meanings: wordDetails[0].meanings[0].definitions[0].definition,
        synonyms: wordDetails.synonyms,
        antonyms: wordDetails.antonyms,
        sentence: wordDetails[0].meanings[0].definitions[1].example,
        comments: '',
      };

      setFlashcards([...flashcards, newFlashcard]);
    } catch (error) {
      console.error('Error adding flashcard:', error);
    }
  };

  const deleteFlashcard = (id: number) => {
    if (window.confirm('Are you sure you want to delete this flashcard?')) {
      setFlashcards(flashcards.filter((flashcard) => flashcard.id !== id));
    }
  };

  const filteredFlashcards = flashcards.filter((flashcard) =>
    flashcard.word.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app">
      <header className="app-header">
        <h1>Flashcards App</h1>
        <button className="create-button" onClick={addFlashcard}>
          {'Create'}
        </button>
      </header>
      <div className="search-bar">
          <input
            type="text"
            placeholder="Search Flashcards"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {(filteredFlashcards.length != 0)?
            <FlashcardList flashcards={filteredFlashcards} deleteFlashcard={deleteFlashcard} />
            :
            <>
            <div className="no-card">
              <span>You don't have any cards yet, click on 'Add card' to start learning!</span>
              <br></br>
              <button className="create-button" onClick={addFlashcard} style={{marginTop: '50px', width: '100px'}}>
              {'Add card'}
              </button>
            </div>
            </>
        }
    </div>
  );
};

export default App;
