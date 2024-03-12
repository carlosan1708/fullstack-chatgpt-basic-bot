import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, Container, Paper, List, ListItem, ListItemText, Typography, Grid } from '@mui/material';
import SendIcon from '@mui/icons-material/Send'; // Icon for user input
import ReplyIcon from '@mui/icons-material/Reply'; // Icon for bot response

interface Message {
  role: string;
  content: string;
}

const getMessageStyles = (role: string) => ({
  backgroundColor: role === 'user' ? '#ffc' : '#ccf',
  borderRadius: '20px',
  marginBottom: '8px',
});

function Chat() {
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [botReplied, setBotReplied] = useState(false); // State to track if bot replied with "-10" message
  const chatEndRef = useRef<HTMLDivElement>(null);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000/chat';

  useEffect(() => {
    // Scroll to the bottom of the chat history when it updates
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSubmit = async () => {
    if (!userInput.trim() || botReplied) {
      return; // Don't send empty messages or if bot has already replied with "-10"
    }
    
    // Add user input to conversation history
    const updatedHistory = [...chatHistory, { role: 'user', content: userInput }];
    setChatHistory(updatedHistory);

    // Filter out 'role': 'system' messages before sending to backend
    const filteredHistory = updatedHistory.filter(message => message.role !== 'system');

    // Send filtered conversation history to the backend
    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: filteredHistory }),
      });
      const data = await response.json();

      // Check if the bot response contains "-10"
      if (data.bot_response.includes('-10')) {
        // Update conversation history with bot response
        setChatHistory([...filteredHistory, { role: 'assistant', content: data.bot_response }]);
        // Clear user input after sending
        setUserInput('');
        // Disable input field after first occurrence of "-10"
        setBotReplied(true);
        return; // Prevent further user input
      }

      // Update conversation history with bot response
      setChatHistory([...filteredHistory, { role: 'assistant', content: data.bot_response }]);
    } catch (error) {
      console.error('Error:', error);
    }

    // Clear user input after sending
    setUserInput('');
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} style={{ padding: '2rem', marginBottom: '2rem', maxHeight: '80vh', background: 'rgba(255, 255, 255, 0.9)' }}>
      <Typography variant="h4" align="center" gutterBottom>
        Trivia chat
      </Typography>
      <Paper elevation={3} style={{ padding: '2rem', marginBottom: '2rem', maxHeight: '30vh', overflowY: 'auto'}}>
        <List>
          {chatHistory.map((message, index) => (
            <ListItem key={index} alignItems="flex-start" style={{ ...getMessageStyles(message.role), borderRadius: '20px', marginBottom: '8px' }}>
              {message.role === 'user' ? (
                <SendIcon color="primary" style={{ marginRight: '8px' }} />
              ) : (
                <ReplyIcon color="secondary" style={{ marginRight: '8px' }} />
              )}
              <ListItemText primary={message.content} />
            </ListItem>
          ))}
          <div ref={chatEndRef} />
        </List>
                </Paper>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={9}>
          <TextField
            fullWidth
            label="Type your message here..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            variant="outlined"
            margin="normal"
            InputProps={{
              style: { backgroundColor: '#fff' },
              disabled: botReplied // Disable input if bot has replied with "-10"
            }}
          />
        </Grid>
        <Grid item xs={3}>
          <Button fullWidth variant="contained" color="primary" onClick={handleSubmit} disabled={botReplied}>
            Send
          </Button>
        </Grid>
      </Grid>
      </Paper>
    </Container>
  );
}

export default Chat;
