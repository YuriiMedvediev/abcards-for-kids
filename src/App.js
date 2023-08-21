import React, { useState } from "react";
import axios from "axios";

import refreshIcon from "./assets/refresh.png";
import linkIcon from "./assets/link.png";
import pawIcon from "./assets/paw.png";
import placeHolderImage from "./assets/imageNotFound.png";
import apiKeys from "./assets/apiKeys.json";
import abc from "./assets/abc.png";

import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import SendIcon from "@mui/icons-material/Send";

import "./App.css";

const App = () => {
  const [inputValue, setInputValue] = useState("");
  const [cards, setCards] = useState([]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setInputValue(inputValue.trim());
    const trimmedInputValue = inputValue.endsWith(",")
      ? inputValue.slice(0, -1)
      : inputValue;

    const words = trimmedInputValue.split(",");
    const formattedCards = await Promise.all(
      words.map(async (word, index) => {
        const formattedWord = word.trim();
        const image = await fetchImage(formattedWord + " clipart");
        return {
          id: index,
          word: formattedWord,
          image: image || placeHolderImage,
        };
      })
    );
    setCards(formattedCards);
  };

  const handleRefreshClick = async (index, isPaw) => {
    const word = cards[index].word;
    const updatedCards = [...cards];

    const image = await fetchImage(
      isPaw ? word + " pawpatrol" : word + " clipart"
    );
    updatedCards[index].image = image || placeHolderImage;
    setCards(updatedCards);
  };

  const handleLinkClick = (index) => {
    const imageURL = prompt("Enter the image URL:");
    if (imageURL && imageURL.trim() !== "" && imageURL.includes("https")) {
      const updatedCards = [...cards];
      updatedCards[index].image = imageURL;
      setCards(updatedCards);
    } else {
      alert("The entered text does not contain a valid image URL.");
    }
  };

  const fetchImage = async (word) => {
    try {
      let response;
      let items;
      for (const apiKey of apiKeys.api_keys) {
        try {
          const cx = "f2b3e538648504c9f";
          response = await axios.get(
            `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(
              word
            )}&searchType=image`
          );
          items = response.data?.items;
          if (items && items.length > 0) {
            return items[Math.floor(Math.random() * items.length)].link;
          }
        } catch (error) {
          if (error.response && error.response.status === 429) {
            continue;
          }
          console.error("Error fetching image:", error);
        }
      }

      return null;
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;
    }
  };

  return (
    <div className="appContainer">
      <div className="controlsContainer">
        <TextField
          className="inputText"
          type="text"
          variant="outlined"
          value={inputValue}
          onChange={handleInputChange}
          label="Enter up to 50 English words separated by commas"
          fullWidth
          autoFocus
          margin="normal"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (!inputValue.trim() || inputValue.trim() === ",") return;
              handleSend(e);
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  className="sendButton"
                  color="primary"
                  aria-label="search"
                  onClick={handleSend}
                  disabled={
                    inputValue.trim() === "" || inputValue.trim() === ","
                  }
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </div>
      {cards.length === 0 ? (
        <div className="emptyPage">
          <img src={abc} alt="abc" className="abcImage" />
        </div>
      ) : (
        <div className="cardContainer">
          {cards.map((card, index) => (
            <div key={card.id} className="cardWrapper">
              <div className="card">
                <React.Fragment>
                  <div className="cardIcons">
                    <img
                      src={refreshIcon}
                      alt="Refresh"
                      className="icon refreshIcon"
                      onClick={() => handleRefreshClick(index, false)}
                    />
                    <img
                      src={linkIcon}
                      alt="Link"
                      className="icon linkIcon"
                      onClick={() => handleLinkClick(index)}
                    />
                    <img
                      src={pawIcon}
                      alt="paw"
                      className="icon pawIcon"
                      onClick={() => handleRefreshClick(index, true)}
                    />
                  </div>
                  <div className="cardContent">
                    <img
                      src={card.image}
                      alt={card.word}
                      className="cardImage"
                    />
                    <div id="wordLabel">{card.word}</div>
                  </div>
                </React.Fragment>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
