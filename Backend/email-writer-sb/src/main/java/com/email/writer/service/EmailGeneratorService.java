package com.email.writer.service;

import com.email.writer.dto.EmailRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.Map;

@Service
public class EmailGeneratorService {
    private  WebClient webClient;

    @Autowired
    public EmailGeneratorService(WebClient.Builder webClient) {
        this.webClient = webClient.build();
    }

//    api url and key
    @Value("${gemini.api.key}")
    private String geminiApiKey;
    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    //DTO layer injecting using constructor injection
    private EmailRequest emailRequest;



    public String generateEmailReply(EmailRequest emailRequest){
        //BUILD PROMPT
        String prompt= buildPrompt(emailRequest);

        //craft the prompt into the given format of gemini request body
        Map<String,Object> requestBody= Map.of(
                "contents",new Object[]{
                        Map.of("parts", new Object[]{
                                Map.of("text",prompt)
                        })
                }
        );

     //Do request and get the request
     String response= webClient.post()
             .uri(geminiApiUrl+geminiApiKey).
             header("Content-Type","application/json").
             bodyValue(requestBody).
             retrieve().
             bodyToMono(String.class).
             block();

        return extractResponseContent(response);
    }

    private String extractResponseContent(String response) {
        try {
            ObjectMapper objectMapper= new ObjectMapper();
            JsonNode node= objectMapper.readTree(response);
            return node.path("candidates") // Access "candidates" array
                    .path(0)            // Access the first element in the array
                    .path("content")    // Access "content"
                    .path("parts")      // Access "parts" array
                    .path(0)            // Access the first element in the array
                    .path("text").asText();
            // Access "text"
        }
        catch (Exception e){
           return "Error in processing resqeust"+ e.getMessage();
        }

    }

    private String buildPrompt(EmailRequest emailRequest) {
        StringBuilder prompt= new StringBuilder();
        prompt.append("Generate a professional email reply for hte following email content. Please don't generate a subject line ");
        if(!emailRequest.getTone().isEmpty() && emailRequest.getTone()!=null){
            prompt.append("Use a ").append(emailRequest.getTone()).append(" tone.");
        }
        prompt.append("\nOriginal email: \n").append(emailRequest.getEmailContent());
        return prompt.toString();
    }
}
