import { useState } from "react";
import axios from "axios";

import "./App.css";
import {
  Container,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Button,
  CircularProgress,
} from "@mui/material";
function App() {
  const [emailContent, setEmailContent] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [tone, setTone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReply = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8080/api/mail/generate",
        {
          emailContent,
          tone,
        }
      );
      setGeneratedReply(
        typeof response.data === "string"
          ? response.data
          : JSON.stringify(response.data)
      );
    } catch (error) {
      setError("Failed to generate eamil reply. Please try again");
    } finally {
      setLoading(false);
    }
  };
  console.log(generatedReply);
  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography
          variant="h2"
          component="h3"
          sx={{
            textAlign: "center",
            background:
              "linear-gradient(90deg, rgb(136, 132, 223) 10%, rgba(4,7,98,1) 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Email Generator
        </Typography>
        <Box sx={{ my: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={emailContent || ""}
            label="Original Email Content"
            variant="outlined"
            sx={{ mb: 2 }}
            onChange={(e) => setEmailContent(e.target.value)}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tone (Optional)</InputLabel>
            <Select
              value={tone || ""}
              label={"Tone (Optional)"}
              onChange={(e) => setTone(e.target.value)}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="professional">Professional</MenuItem>
              <MenuItem value="casual">Casual</MenuItem>
              <MenuItem value="friendly">Friendly</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleReply} disabled={!emailContent || loading}>
            {loading ? <CircularProgress size={24}  /> : "Generate Reply"}
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {generatedReply && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Generated Reply:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              sx={{ mb: 3 }}
              value={generatedReply || ""}
              InputProps={{ readOnly: true }}
            />
            <Button
              variant="contained"
              onClick={() => navigator.clipboard.writeText(generatedReply)} 
            >
             Copy to Clipboard
            </Button>
          </Box>
        )}
      </Container>
    </>
  );
}

export default App;
